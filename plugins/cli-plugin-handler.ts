/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { PluginCommands } from './commands/plugin-commands.js';
import { PluginManager } from './plugin-manager.js';
import { MarketplaceClient } from './marketplace/marketplace-client.js';

export interface PluginCliArgs {
  plugins?: boolean;
  search?: string;
  install?: string;
  list?: boolean;
  enable?: string;
  disable?: string;
  uninstall?: string;
  info?: string;
  update?: string;
  verbose?: boolean;
  source?: 'npm' | 'github' | 'local';
  registry?: string;
}

export class PluginCliHandler {
  private pluginCommands: PluginCommands;
  private pluginManager: PluginManager;
  private marketplaceClient: MarketplaceClient;

  constructor(workspaceRoot: string) {
    this.pluginManager = new PluginManager(workspaceRoot);
    this.marketplaceClient = new MarketplaceClient({
      baseUrl: 'https://api.gemini-cli-plugins.com',
      timeout: 30000,
    });
    this.pluginCommands = new PluginCommands(this.pluginManager);
  }

  async handlePluginCommands(args: PluginCliArgs): Promise<boolean> {
    // Check if this is a plugin command
    if (!args.plugins && !args.search && !args.install && !args.list && 
        !args.enable && !args.disable && !args.uninstall && !args.info && !args.update) {
      return false; // Not a plugin command
    }

    try {
      // Initialize plugin manager
      await this.pluginManager.loadAllPlugins();

      // Handle different plugin commands
      if (args.search) {
        const result = await this.pluginCommands.search(args.search);
        console.log(result);
        return true;
      }

      if (args.install) {
        const source = args.source || 'npm';
        const result = await this.pluginCommands.install(args.install, source);
        console.log(result);
        return true;
      }

      if (args.list) {
        const result = await this.pluginCommands.list({ verbose: args.verbose });
        console.log(result);
        return true;
      }

      if (args.enable) {
        const result = await this.pluginCommands.enable(args.enable);
        console.log(result);
        return true;
      }

      if (args.disable) {
        const result = await this.pluginCommands.disable(args.disable);
        console.log(result);
        return true;
      }

      if (args.uninstall) {
        const result = await this.pluginCommands.uninstall(args.uninstall);
        console.log(result);
        return true;
      }

      if (args.info) {
        const result = await this.pluginCommands.info(args.info);
        console.log(result);
        return true;
      }

      if (args.update) {
        const result = await this.pluginCommands.update(args.update);
        console.log(result);
        return true;
      }

      // If just --plugins flag is provided, show help
      if (args.plugins) {
        this.showPluginHelp();
        return true;
      }

    } catch (error) {
      console.error('Plugin command error:', error);
      return true; // Command was handled, but failed
    }

    return true;
  }

  private showPluginHelp(): void {
    console.log(`
🚀 Gemini CLI Plugin Marketplace

Usage:
  gemini plugins [command] [options]

Commands:
  search <query>              Search for plugins
  install <name>              Install a plugin
  list [--verbose]            List installed plugins
  enable <name>               Enable a plugin
  disable <name>              Disable a plugin
  uninstall <name>            Uninstall a plugin
  info <name>                 Show plugin information
  update <name>               Update a plugin

Options:
  --source <source>           Installation source (npm, github, local)
  --registry <url>            Custom registry URL
  --verbose                   Show detailed information

Examples:
  gemini plugins search python
  gemini plugins install pip-analyzer
  gemini plugins install my-plugin --source github
  gemini plugins list --verbose
  gemini plugins enable pip-analyzer
  gemini plugins info pip-analyzer

For more information, visit: https://docs.gemini-cli.com/plugins
    `);
  }

  async initialize(): Promise<void> {
    await this.pluginManager.loadAllPlugins();
  }

  getPluginManager(): PluginManager {
    return this.pluginManager;
  }

  getMarketplaceClient(): MarketplaceClient {
    return this.marketplaceClient;
  }
} 