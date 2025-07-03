/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { GeminiPlugin, PluginMetadata, PluginType, PluginContext, PluginInstallResult } from './plugin-interface.js';
import { PluginRegistry } from './plugin-registry.js';
import { PluginInstaller } from './plugin-installer.js';

export class PluginManager {
  private plugins: Map<string, GeminiPlugin> = new Map();
  private registry: PluginRegistry;
  private installer: PluginInstaller;
  private pluginRoot: string;
  private enabledPlugins: Set<string> = new Set();
  private pluginContexts: Map<string, PluginContext> = new Map();

  constructor(workspaceRoot: string) {
    this.pluginRoot = path.join(workspaceRoot, '.gemini', 'plugins');
    this.registry = new PluginRegistry();
    this.installer = new PluginInstaller(this.pluginRoot);
    this.ensurePluginDirectory();
    this.loadEnabledPlugins();
    // Load all installed plugins
    this.loadAllPlugins().catch(error => {
      console.warn('Failed to load some plugins:', error);
    });
  }

  private ensurePluginDirectory(): void {
    if (!fs.existsSync(this.pluginRoot)) {
      fs.mkdirSync(this.pluginRoot, { recursive: true });
    }
  }

  private loadEnabledPlugins(): void {
    const enabledFile = path.join(this.pluginRoot, 'enabled.json');
    if (fs.existsSync(enabledFile)) {
      try {
        const enabled = JSON.parse(fs.readFileSync(enabledFile, 'utf-8'));
        this.enabledPlugins = new Set(enabled.plugins || []);
      } catch (error) {
        console.warn('Failed to load enabled plugins:', error);
        this.enabledPlugins = new Set();
      }
    }
  }

  private saveEnabledPlugins(): void {
    const enabledFile = path.join(this.pluginRoot, 'enabled.json');
    const enabled = { plugins: Array.from(this.enabledPlugins) };
    fs.writeFileSync(enabledFile, JSON.stringify(enabled, null, 2));
  }

  async loadPlugin(pluginName: string): Promise<PluginInstallResult> {
    try {
      const pluginDir = path.join(this.pluginRoot, pluginName);
      if (!fs.existsSync(pluginDir)) {
        return { success: false, error: `Plugin ${pluginName} not found` };
      }

      const metadataFile = path.join(pluginDir, 'package.json');
      if (!fs.existsSync(metadataFile)) {
        return { success: false, error: `Plugin ${pluginName} missing package.json` };
      }

      const metadata: PluginMetadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
      
      // Validate metadata
      if (!this.validatePluginMetadata(metadata)) {
        return { success: false, error: `Plugin ${pluginName} has invalid metadata` };
      }

      // Load the plugin module
      const entryPoint = path.join(pluginDir, metadata.entryPoint);
      if (!fs.existsSync(entryPoint)) {
        return { success: false, error: `Plugin ${pluginName} entry point not found: ${entryPoint}` };
      }

      // Dynamic import of the plugin
      const pluginModule = await import(entryPoint);
      const PluginClass = pluginModule.default || pluginModule[metadata.name] || pluginModule.Plugin;
      
      if (!PluginClass) {
        return { success: false, error: `Plugin ${pluginName} does not export a valid plugin class` };
      }

      // Create plugin context
      const context: PluginContext = {
        workspaceRoot: path.dirname(this.pluginRoot),
        pluginRoot: pluginDir,
        config: this.loadPluginConfig(pluginName),
        logger: {
          info: (msg: string) => console.log(`[${pluginName}] ${msg}`),
          warn: (msg: string) => console.warn(`[${pluginName}] ${msg}`),
          error: (msg: string) => console.error(`[${pluginName}] ${msg}`),
          debug: (msg: string) => console.debug(`[${pluginName}] ${msg}`),
        }
      };

      // Instantiate plugin
      const plugin = new PluginClass(context);
      
      // Validate plugin implements required interface
      if (!plugin.metadata || plugin.metadata.name !== metadata.name) {
        return { success: false, error: `Plugin ${pluginName} does not implement required interface` };
      }

      // Store plugin and context
      this.plugins.set(pluginName, plugin);
      this.pluginContexts.set(pluginName, context);

      // Register plugin capabilities
      await this.registerPluginCapabilities(plugin);

      // Call onEnable if plugin is enabled
      if (this.enabledPlugins.has(pluginName) && plugin.onEnable) {
        await plugin.onEnable();
      }

      return { success: true, plugin };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to load plugin ${pluginName}: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  private validatePluginMetadata(metadata: PluginMetadata): boolean {
    const required = ['name', 'version', 'description', 'author', 'type', 'entryPoint', 'compatibility'];
    for (const field of required) {
      if (!metadata[field as keyof PluginMetadata]) {
        return false;
      }
    }
    return true;
  }

  private loadPluginConfig(pluginName: string): any {
    const configFile = path.join(this.pluginRoot, pluginName, 'config.json');
    if (fs.existsSync(configFile)) {
      try {
        return JSON.parse(fs.readFileSync(configFile, 'utf-8'));
      } catch (error) {
        console.warn(`Failed to load config for plugin ${pluginName}:`, error);
      }
    }
    return {};
  }

  private async registerPluginCapabilities(plugin: GeminiPlugin): Promise<void> {
    // Register commands
    if (plugin.registerCommands) {
      plugin.registerCommands(this.registry.getCommandRegistry());
    }

    // Register tools
    if (plugin.registerTools) {
      plugin.registerTools(this.registry.getToolRegistry());
    }

    // Register themes
    if (plugin.registerThemes) {
      plugin.registerThemes(this.registry.getThemeRegistry());
    }

    // Register extensions
    if (plugin.registerExtensions) {
      plugin.registerExtensions(this.registry.getExtensionRegistry());
    }
  }

  async installPlugin(pluginName: string, source?: string): Promise<PluginInstallResult> {
    try {
      const result = await this.installer.install(pluginName, source);
      if (result.success && result.plugin) {
        await this.loadPlugin(pluginName);
      }
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to install plugin ${pluginName}: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  async uninstallPlugin(pluginName: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginName);
      if (plugin && plugin.onUninstall) {
        await plugin.onUninstall();
      }

      // Remove from registries
      this.registry.unregisterPlugin(pluginName);

      // Remove from memory
      this.plugins.delete(pluginName);
      this.pluginContexts.delete(pluginName);
      this.enabledPlugins.delete(pluginName);
      this.saveEnabledPlugins();

      // Remove from filesystem
      await this.installer.uninstall(pluginName);

      return true;
    } catch (error) {
      console.error(`Failed to uninstall plugin ${pluginName}:`, error);
      return false;
    }
  }

  async enablePlugin(pluginName: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      return false;
    }

    if (plugin.onEnable) {
      await plugin.onEnable();
    }

    this.enabledPlugins.add(pluginName);
    this.saveEnabledPlugins();
    return true;
  }

  async disablePlugin(pluginName: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      return false;
    }

    if (plugin.onDisable) {
      await plugin.onDisable();
    }

    this.enabledPlugins.delete(pluginName);
    this.saveEnabledPlugins();
    return true;
  }

  getPlugin(pluginName: string): GeminiPlugin | undefined {
    return this.plugins.get(pluginName);
  }

  getAllPlugins(): GeminiPlugin[] {
    return Array.from(this.plugins.values());
  }

  getEnabledPlugins(): GeminiPlugin[] {
    return Array.from(this.plugins.values()).filter(plugin => 
      this.enabledPlugins.has(plugin.metadata.name)
    );
  }

  getPluginRegistry(): PluginRegistry {
    return this.registry;
  }

  getInstaller(): PluginInstaller {
    return this.installer;
  }

  async reloadPlugin(pluginName: string): Promise<PluginInstallResult> {
    // Unload first
    const plugin = this.plugins.get(pluginName);
    if (plugin && plugin.onDisable) {
      await plugin.onDisable();
    }
    
    this.plugins.delete(pluginName);
    this.pluginContexts.delete(pluginName);
    this.registry.unregisterPlugin(pluginName);

    // Reload
    return await this.loadPlugin(pluginName);
  }

  async loadAllPlugins(): Promise<void> {
    const pluginDirs = fs.readdirSync(this.pluginRoot, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const pluginDir of pluginDirs) {
      await this.loadPlugin(pluginDir);
    }
  }
} 