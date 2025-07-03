/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { PluginManager } from '../plugin-manager.js';
import { MarketplaceClient } from '../marketplace/marketplace-client.js';
import { PluginType } from '../plugin-interface.js';

export class PluginCommands {
  private pluginManager: PluginManager;
  private marketplaceClient: MarketplaceClient;

  constructor(pluginManager: PluginManager) {
    this.pluginManager = pluginManager;
    this.marketplaceClient = new MarketplaceClient({
      baseUrl: 'https://api.gemini-cli-plugins.com'
    });
  }

  async list(options: {
    enabled?: boolean;
    disabled?: boolean;
    type?: string;
    verbose?: boolean;
  } = {}): Promise<string> {
    const plugins = this.pluginManager.getAllPlugins();
    const enabledPlugins = this.pluginManager.getEnabledPlugins();
    const enabledNames = new Set(enabledPlugins.map(p => p.metadata.name));

    let filteredPlugins = plugins;

    if (options.enabled) {
      filteredPlugins = plugins.filter(p => enabledNames.has(p.metadata.name));
    } else if (options.disabled) {
      filteredPlugins = plugins.filter(p => !enabledNames.has(p.metadata.name));
    }

    if (options.type) {
      filteredPlugins = filteredPlugins.filter(p => p.metadata.type === options.type);
    }

    if (filteredPlugins.length === 0) {
      return 'No plugins found.';
    }

    let output = `\n📦 Installed Plugins (${filteredPlugins.length}):\n\n`;

    for (const plugin of filteredPlugins) {
      const status = enabledNames.has(plugin.metadata.name) ? '✅' : '❌';
      const type = this.getTypeEmoji(plugin.metadata.type);
      
      output += `${status} ${type} \x1b[1m${plugin.metadata.name}\x1b[0m v${plugin.metadata.version}\n`;
      output += `   ${plugin.metadata.description}\n`;
      output += `   Author: ${plugin.metadata.author}\n`;
      
      if (options.verbose) {
        output += `   Type: ${plugin.metadata.type}\n`;
        if (plugin.metadata.tags && plugin.metadata.tags.length > 0) {
          output += `   Tags: ${plugin.metadata.tags.join(', ')}\n`;
        }
        if (plugin.metadata.repository) {
          output += `   Repository: ${plugin.metadata.repository}\n`;
        }
      }
      
      output += '\n';
    }

    return output;
  }

  async search(query: string, options: {
    limit?: number;
    type?: string;
    tags?: string[];
    sortBy?: 'downloads' | 'rating' | 'updated' | 'name';
  } = {}): Promise<string> {
    console.log(`🔍 Searching for plugins matching "${query}"...`);

    // For now, use mock data since we don't have a real marketplace API
    const plugins = this.marketplaceClient.getMockPlugins();
    
    // Simple local search
    const filteredPlugins = plugins.filter(plugin => 
      plugin.name.toLowerCase().includes(query.toLowerCase()) ||
      plugin.description.toLowerCase().includes(query.toLowerCase()) ||
      plugin.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    if (filteredPlugins.length === 0) {
      return `\n❌ No plugins found matching "${query}"\n`;
    }

    let output = `\n🔍 Search Results for "${query}" (${filteredPlugins.length} found):\n\n`;

    for (const plugin of filteredPlugins) {
      const type = this.getTypeEmoji(plugin.type as PluginType);
      const rating = '⭐'.repeat(Math.floor(plugin.rating));
      
      output += `${type} \x1b[1m${plugin.name}\x1b[0m v${plugin.version}\n`;
      output += `   ${plugin.description}\n`;
      output += `   Author: ${plugin.author}\n`;
      output += `   Rating: ${rating} (${plugin.rating}/5) | Downloads: ${plugin.downloads.toLocaleString()}\n`;
      output += `   Tags: ${plugin.tags.join(', ')}\n`;
      output += `   Updated: ${new Date(plugin.lastUpdated).toLocaleDateString()}\n\n`;
    }

    return output;
  }

  async install(pluginName: string, source?: string): Promise<string> {
    console.log(`📦 Installing plugin: ${pluginName}...`);

    try {
      const result = await this.pluginManager.installPlugin(pluginName, source);
      
      if (result.success) {
        return `\n✅ Successfully installed plugin: ${pluginName}\n`;
      } else {
        return `\n❌ Failed to install plugin: ${pluginName}\n   Error: ${result.error}\n`;
      }
    } catch (error) {
      return `\n❌ Failed to install plugin: ${pluginName}\n   Error: ${error instanceof Error ? error.message : String(error)}\n`;
    }
  }

  async uninstall(pluginName: string): Promise<string> {
    console.log(`🗑️  Uninstalling plugin: ${pluginName}...`);

    try {
      const success = await this.pluginManager.uninstallPlugin(pluginName);
      
      if (success) {
        return `\n✅ Successfully uninstalled plugin: ${pluginName}\n`;
      } else {
        return `\n❌ Failed to uninstall plugin: ${pluginName}\n`;
      }
    } catch (error) {
      return `\n❌ Failed to uninstall plugin: ${pluginName}\n   Error: ${error instanceof Error ? error.message : String(error)}\n`;
    }
  }

  async enable(pluginName: string): Promise<string> {
    console.log(`✅ Enabling plugin: ${pluginName}...`);

    try {
      const success = await this.pluginManager.enablePlugin(pluginName);
      
      if (success) {
        return `\n✅ Successfully enabled plugin: ${pluginName}\n`;
      } else {
        return `\n❌ Failed to enable plugin: ${pluginName}\n`;
      }
    } catch (error) {
      return `\n❌ Failed to enable plugin: ${pluginName}\n   Error: ${error instanceof Error ? error.message : String(error)}\n`;
    }
  }

  async disable(pluginName: string): Promise<string> {
    console.log(`❌ Disabling plugin: ${pluginName}...`);

    try {
      const success = await this.pluginManager.disablePlugin(pluginName);
      
      if (success) {
        return `\n✅ Successfully disabled plugin: ${pluginName}\n`;
      } else {
        return `\n❌ Failed to disable plugin: ${pluginName}\n`;
      }
    } catch (error) {
      return `\n❌ Failed to disable plugin: ${pluginName}\n   Error: ${error instanceof Error ? error.message : String(error)}\n`;
    }
  }

  async update(pluginName: string): Promise<string> {
    console.log(`🔄 Updating plugin: ${pluginName}...`);

    try {
      const result = await this.pluginManager.getInstaller().update(pluginName);
      
      if (result.success) {
        // Reload the plugin
        await this.pluginManager.reloadPlugin(pluginName);
        return `\n✅ Successfully updated plugin: ${pluginName}\n`;
      } else {
        return `\n❌ Failed to update plugin: ${pluginName}\n   Error: ${result.error}\n`;
      }
    } catch (error) {
      return `\n❌ Failed to update plugin: ${pluginName}\n   Error: ${error instanceof Error ? error.message : String(error)}\n`;
    }
  }

  async info(pluginName: string): Promise<string> {
    const plugin = this.pluginManager.getPlugin(pluginName);
    
    if (!plugin) {
      return `\n❌ Plugin not found: ${pluginName}\n`;
    }

    const enabledPlugins = this.pluginManager.getEnabledPlugins();
    const isEnabled = enabledPlugins.some(p => p.metadata.name === pluginName);
    const status = isEnabled ? '✅ Enabled' : '❌ Disabled';
    const type = this.getTypeEmoji(plugin.metadata.type);

    let output = `\n📦 Plugin Information: ${pluginName}\n`;
    output += `${'='.repeat(50)}\n\n`;
    output += `Name: ${plugin.metadata.name}\n`;
    output += `Version: ${plugin.metadata.version}\n`;
    output += `Status: ${status}\n`;
    output += `Type: ${type} ${plugin.metadata.type}\n`;
    output += `Author: ${plugin.metadata.author}\n`;
    output += `Description: ${plugin.metadata.description}\n\n`;

    if (plugin.metadata.tags && plugin.metadata.tags.length > 0) {
      output += `Tags: ${plugin.metadata.tags.join(', ')}\n`;
    }

    if (plugin.metadata.repository) {
      output += `Repository: ${plugin.metadata.repository}\n`;
    }

    if (plugin.metadata.homepage) {
      output += `Homepage: ${plugin.metadata.homepage}\n`;
    }

    if (plugin.metadata.license) {
      output += `License: ${plugin.metadata.license}\n`;
    }

    output += `\nCompatibility:\n`;
    output += `  Gemini CLI: ${plugin.metadata.compatibility['gemini-cli']}\n`;
    if (plugin.metadata.compatibility.node) {
      output += `  Node.js: ${plugin.metadata.compatibility.node}\n`;
    }

    if (plugin.metadata.dependencies && plugin.metadata.dependencies.length > 0) {
      output += `\nDependencies:\n`;
      plugin.metadata.dependencies.forEach(dep => {
        output += `  - ${dep}\n`;
      });
    }

    // Show plugin capabilities
    const registry = this.pluginManager.getPluginRegistry();
    const capabilities = registry.getPluginCapabilities(pluginName);

    if (capabilities.commands.length > 0) {
      output += `\nCommands:\n`;
      capabilities.commands.forEach(cmd => {
        output += `  - ${cmd.name}: ${cmd.description}\n`;
      });
    }

    if (capabilities.tools.length > 0) {
      output += `\nTools:\n`;
      capabilities.tools.forEach(tool => {
        output += `  - ${tool.name}: ${tool.description}\n`;
      });
    }

    if (capabilities.themes.length > 0) {
      output += `\nThemes:\n`;
      capabilities.themes.forEach(theme => {
        output += `  - ${theme.name}: ${theme.description}\n`;
      });
    }

    return output;
  }

  async popular(limit: number = 10): Promise<string> {
    console.log(`🔥 Fetching popular plugins...`);

    // Use mock data for now
    const plugins = this.marketplaceClient.getMockPlugins()
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);

    let output = `\n🔥 Popular Plugins:\n\n`;

    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i];
      const type = this.getTypeEmoji(plugin.type as PluginType);
      const rating = '⭐'.repeat(Math.floor(plugin.rating));
      
      output += `${i + 1}. ${type} \x1b[1m${plugin.name}\x1b[0m v${plugin.version}\n`;
      output += `   ${plugin.description}\n`;
      output += `   Rating: ${rating} (${plugin.rating}/5) | Downloads: ${plugin.downloads.toLocaleString()}\n`;
      output += `   Tags: ${plugin.tags.join(', ')}\n\n`;
    }

    return output;
  }

  async recent(limit: number = 10): Promise<string> {
    console.log(`🆕 Fetching recent plugins...`);

    // Use mock data for now
    const plugins = this.marketplaceClient.getMockPlugins()
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, limit);

    let output = `\n🆕 Recent Plugins:\n\n`;

    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i];
      const type = this.getTypeEmoji(plugin.type as PluginType);
      const date = new Date(plugin.lastUpdated).toLocaleDateString();
      
      output += `${i + 1}. ${type} \x1b[1m${plugin.name}\x1b[0m v${plugin.version}\n`;
      output += `   ${plugin.description}\n`;
      output += `   Updated: ${date} | Downloads: ${plugin.downloads.toLocaleString()}\n`;
      output += `   Tags: ${plugin.tags.join(', ')}\n\n`;
    }

    return output;
  }

  private getTypeEmoji(type: PluginType): string {
    switch (type) {
      case PluginType.TOOL:
        return '🔧';
      case PluginType.THEME:
        return '🎨';
      case PluginType.EXTENSION:
        return '🔌';
      case PluginType.UTILITY:
        return '⚙️';
      case PluginType.MCP_SERVER:
        return '🌐';
      default:
        return '📦';
    }
  }
} 