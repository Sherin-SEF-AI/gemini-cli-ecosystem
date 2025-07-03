/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { PluginManager } from '../plugin-manager.js';
import { PluginCommands } from '../commands/plugin-commands.js';
import { MarketplaceClient } from '../marketplace/marketplace-client.js';
import chalk from 'chalk';
import ora from 'ora';

export class PluginDemo {
  private pluginManager: PluginManager;
  private pluginCommands: PluginCommands;
  private marketplaceClient: MarketplaceClient;

  constructor(workspaceRoot: string) {
    this.pluginManager = new PluginManager(workspaceRoot);
    this.pluginCommands = new PluginCommands(this.pluginManager);
    this.marketplaceClient = new MarketplaceClient({
      baseUrl: 'https://api.gemini-cli-plugins.com'
    });
  }

  async runDemo(): Promise<void> {
    console.log(chalk.blue.bold('\n🚀 Gemini CLI Plugin Marketplace Demo\n'));
    console.log(chalk.gray('This demo showcases the comprehensive plugin system for Gemini CLI\n'));

    await this.demoPluginDiscovery();
    await this.demoPluginInstallation();
    await this.demoPluginManagement();
    await this.demoPluginDevelopment();
    await this.demoAdvancedFeatures();

    console.log(chalk.green.bold('\n✅ Demo completed successfully!\n'));
    console.log(chalk.blue('For more information, visit: https://docs.gemini-cli.com/plugins\n'));
  }

  private async demoPluginDiscovery(): Promise<void> {
    console.log(chalk.yellow.bold('\n📦 1. Plugin Discovery\n'));

    // Search for plugins
    const searchSpinner = ora('Searching for Python-related plugins...').start();
    const searchResults = await this.pluginCommands.search('python');
    searchSpinner.succeed('Search completed');
    console.log(searchResults);

    // Show popular plugins
    const popularSpinner = ora('Fetching popular plugins...').start();
    const popularResults = await this.pluginCommands.popular(5);
    popularSpinner.succeed('Popular plugins fetched');
    console.log(popularResults);

    // Show recent plugins
    const recentSpinner = ora('Fetching recent plugins...').start();
    const recentResults = await this.pluginCommands.recent(3);
    recentSpinner.succeed('Recent plugins fetched');
    console.log(recentResults);
  }

  private async demoPluginInstallation(): Promise<void> {
    console.log(chalk.yellow.bold('\n📥 2. Plugin Installation\n'));

    // Install a plugin
    const installSpinner = ora('Installing pip-analyzer plugin...').start();
    const installResult = await this.pluginCommands.install('pip-analyzer');
    installSpinner.succeed('Plugin installed');
    console.log(installResult);

    // Show plugin info
    const infoSpinner = ora('Getting plugin information...').start();
    const infoResult = await this.pluginCommands.info('pip-analyzer');
    infoSpinner.succeed('Plugin info retrieved');
    console.log(infoResult);

    // Enable the plugin
    const enableSpinner = ora('Enabling plugin...').start();
    const enableResult = await this.pluginCommands.enable('pip-analyzer');
    enableSpinner.succeed('Plugin enabled');
    console.log(enableResult);
  }

  private async demoPluginManagement(): Promise<void> {
    console.log(chalk.yellow.bold('\n⚙️  3. Plugin Management\n'));

    // List installed plugins
    const listSpinner = ora('Listing installed plugins...').start();
    const listResult = await this.pluginCommands.list({ verbose: true });
    listSpinner.succeed('Plugins listed');
    console.log(listResult);

    // List enabled plugins only
    const enabledSpinner = ora('Listing enabled plugins...').start();
    const enabledResult = await this.pluginCommands.list({ enabled: true });
    enabledSpinner.succeed('Enabled plugins listed');
    console.log(enabledResult);

    // Update a plugin
    const updateSpinner = ora('Updating plugin...').start();
    const updateResult = await this.pluginCommands.update('pip-analyzer');
    updateSpinner.succeed('Plugin updated');
    console.log(updateResult);
  }

  private async demoPluginDevelopment(): Promise<void> {
    console.log(chalk.yellow.bold('\n🔧 4. Plugin Development\n'));

    console.log(chalk.cyan('Creating a sample plugin structure...\n'));

    const pluginStructure = `
📁 my-gemini-plugin/
├── 📄 package.json          # Plugin metadata
├── 📁 src/
│   ├── 📄 index.ts          # Main plugin implementation
│   └── 📄 utils.ts          # Helper utilities
├── 📁 dist/                 # Compiled output
├── 📄 README.md             # Plugin documentation
├── 📄 tsconfig.json         # TypeScript configuration
└── 📄 .gitignore           # Git ignore file
`;

    console.log(chalk.gray(pluginStructure));

    console.log(chalk.cyan('\nExample plugin implementation:\n'));

    const exampleCode = `
import { GeminiPlugin, PluginContext, PluginType } from '@google/gemini-cli-core';

export default class MyPlugin implements GeminiPlugin {
  metadata = {
    name: 'my-gemini-plugin',
    version: '1.0.0',
    description: 'My awesome Gemini CLI plugin',
    author: 'Your Name',
    type: PluginType.TOOL,
    entryPoint: 'dist/index.js',
    compatibility: {
      'gemini-cli': '>=0.1.0',
      node: '>=18.0.0'
    }
  };

  constructor(context: PluginContext) {
    this.context = context;
  }

  async onEnable(): Promise<void> {
    this.context.logger.info('Plugin enabled!');
  }

  registerCommands(registry: any): void {
    registry.registerCommand({
      name: 'my-command',
      description: 'My custom command',
      usage: '/my-command [options]'
    });
  }
}
`;

    console.log(chalk.gray(exampleCode));
  }

  private async demoAdvancedFeatures(): Promise<void> {
    console.log(chalk.yellow.bold('\n🚀 5. Advanced Features\n'));

    // Plugin types demonstration
    console.log(chalk.cyan('Plugin Types:\n'));
    console.log(chalk.gray('🔧 Tool Plugins: Add new CLI tools and commands'));
    console.log(chalk.gray('🎨 Theme Plugins: Customize CLI appearance'));
    console.log(chalk.gray('🔌 Extension Plugins: Extend core functionality'));
    console.log(chalk.gray('⚙️  Utility Plugins: Helper functions and utilities\n'));

    // Security features
    console.log(chalk.cyan('Security Features:\n'));
    console.log(chalk.gray('✅ Plugin validation and sandboxing'));
    console.log(chalk.gray('✅ Permission-based access control'));
    console.log(chalk.gray('✅ Isolated execution environment'));
    console.log(chalk.gray('✅ Resource usage limits\n'));

    // Installation sources
    console.log(chalk.cyan('Installation Sources:\n'));
    console.log(chalk.gray('📦 NPM Registry: gemini plugins install my-plugin'));
    console.log(chalk.gray('🌐 GitHub: gemini plugins install my-plugin https://github.com/user/repo'));
    console.log(chalk.gray('📁 Local: gemini plugins install my-plugin file:///path/to/plugin\n'));

    // Plugin lifecycle
    console.log(chalk.cyan('Plugin Lifecycle:\n'));
    console.log(chalk.gray('1. 📥 Install: Download and install plugin'));
    console.log(chalk.gray('2. 🔄 Load: Load and validate plugin'));
    console.log(chalk.gray('3. ✅ Enable: Activate plugin functionality'));
    console.log(chalk.gray('4. ❌ Disable: Deactivate plugin'));
    console.log(chalk.gray('5. 🗑️  Uninstall: Remove plugin completely\n'));
  }

  async cleanup(): Promise<void> {
    console.log(chalk.yellow.bold('\n🧹 Cleaning up demo...\n'));

    // Disable and uninstall demo plugin
    const disableSpinner = ora('Disabling demo plugin...').start();
    await this.pluginCommands.disable('pip-analyzer');
    disableSpinner.succeed('Plugin disabled');

    const uninstallSpinner = ora('Uninstalling demo plugin...').start();
    await this.pluginCommands.uninstall('pip-analyzer');
    uninstallSpinner.succeed('Plugin uninstalled');

    console.log(chalk.green('✅ Cleanup completed\n'));
  }
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new PluginDemo(process.cwd());
  demo.runDemo().catch(console.error);
} 