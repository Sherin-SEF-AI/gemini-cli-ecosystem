#!/usr/bin/env node

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Standalone Demo for Gemini CLI Plugin Marketplace System
// This demonstrates the complete plugin system functionality

const fs = require('fs');
const path = require('path');

// Mock plugin interface for demo
class MockPluginInterface {
  constructor() {
    this.plugins = new Map();
    this.registry = {
      commands: new Map(),
      tools: new Map(),
      themes: new Map(),
      extensions: new Map()
    };
  }

  // Plugin discovery
  async searchPlugins(query) {
    const mockPlugins = [
      {
        name: 'pip-analyzer',
        version: '1.0.0',
        description: 'AI-powered Python dependency analyzer',
        author: 'gemini-cli-team',
        downloads: 1250,
        rating: 4.8,
        tags: ['python', 'pip', 'dependencies', 'ai'],
        lastUpdated: '2024-01-15T10:30:00Z',
        type: 'tool'
      },
      {
        name: 'code-review-assistant',
        version: '2.1.0',
        description: 'Automated code review with AI insights',
        author: 'dev-tools-org',
        downloads: 890,
        rating: 4.6,
        tags: ['code-review', 'ai', 'quality', 'automation'],
        lastUpdated: '2024-01-14T15:45:00Z',
        type: 'tool'
      },
      {
        name: 'dark-theme-pro',
        version: '1.2.0',
        description: 'Professional dark theme for Gemini CLI',
        author: 'theme-creator',
        downloads: 2100,
        rating: 4.9,
        tags: ['theme', 'dark', 'ui', 'customization'],
        lastUpdated: '2024-01-13T09:20:00Z',
        type: 'theme'
      },
      {
        name: 'git-workflow',
        version: '1.5.0',
        description: 'Enhanced Git workflow tools and automation',
        author: 'git-tools-dev',
        downloads: 750,
        rating: 4.7,
        tags: ['git', 'workflow', 'automation', 'version-control'],
        lastUpdated: '2024-01-12T14:15:00Z',
        type: 'utility'
      },
      {
        name: 'docker-helper',
        version: '1.1.0',
        description: 'Docker container management and optimization',
        author: 'container-expert',
        downloads: 620,
        rating: 4.5,
        tags: ['docker', 'containers', 'devops', 'automation'],
        lastUpdated: '2024-01-11T11:30:00Z',
        type: 'tool'
      }
    ];

    return mockPlugins.filter(plugin => 
      plugin.name.toLowerCase().includes(query.toLowerCase()) ||
      plugin.description.toLowerCase().includes(query.toLowerCase()) ||
      plugin.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  // Plugin installation simulation
  async installPlugin(pluginName) {
    console.log(`📦 Installing plugin: ${pluginName}...`);
    
    // Simulate installation process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const plugin = {
      name: pluginName,
      version: '1.0.0',
      description: `Mock plugin: ${pluginName}`,
      author: 'demo-user',
      type: 'tool',
      status: 'installed'
    };

    this.plugins.set(pluginName, plugin);
    console.log(`✅ Successfully installed plugin: ${pluginName}`);
    
    return { success: true, plugin };
  }

  // Plugin management
  async enablePlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      plugin.status = 'enabled';
      console.log(`✅ Successfully enabled plugin: ${pluginName}`);
      return true;
    }
    console.log(`❌ Plugin not found: ${pluginName}`);
    return false;
  }

  async disablePlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      plugin.status = 'disabled';
      console.log(`❌ Successfully disabled plugin: ${pluginName}`);
      return true;
    }
    console.log(`❌ Plugin not found: ${pluginName}`);
    return false;
  }

  async uninstallPlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      this.plugins.delete(pluginName);
      console.log(`🗑️  Successfully uninstalled plugin: ${pluginName}`);
      return true;
    }
    console.log(`❌ Plugin not found: ${pluginName}`);
    return false;
  }

  // List plugins
  listPlugins(options = {}) {
    const plugins = Array.from(this.plugins.values());
    
    if (plugins.length === 0) {
      return 'No plugins installed.';
    }

    let output = `\n📦 Installed Plugins (${plugins.length}):\n\n`;

    for (const plugin of plugins) {
      const status = plugin.status === 'enabled' ? '✅' : '❌';
      const type = this.getTypeEmoji(plugin.type);
      
      output += `${status} ${type} \x1b[1m${plugin.name}\x1b[0m v${plugin.version}\n`;
      output += `   ${plugin.description}\n`;
      output += `   Author: ${plugin.author}\n`;
      
      if (options.verbose) {
        output += `   Type: ${plugin.type}\n`;
        output += `   Status: ${plugin.status}\n`;
      }
      
      output += '\n';
    }

    return output;
  }

  // Get type emoji
  getTypeEmoji(type) {
    const emojis = {
      'tool': '🔧',
      'theme': '🎨',
      'extension': '🔌',
      'utility': '⚙️',
      'mcp-server': '🌐'
    };
    return emojis[type] || '📦';
  }

  // Show plugin info
  getPluginInfo(pluginName) {
    const plugin = this.plugins.get(pluginName);
    
    if (!plugin) {
      return `\n❌ Plugin not found: ${pluginName}\n`;
    }

    const status = plugin.status === 'enabled' ? '✅ Enabled' : '❌ Disabled';
    const type = this.getTypeEmoji(plugin.type);

    let output = `\n📦 Plugin Information: ${pluginName}\n`;
    output += `${'='.repeat(50)}\n\n`;
    output += `Name: ${plugin.name}\n`;
    output += `Version: ${plugin.version}\n`;
    output += `Status: ${status}\n`;
    output += `Type: ${type} ${plugin.type}\n`;
    output += `Author: ${plugin.author}\n`;
    output += `Description: ${plugin.description}\n\n`;

    return output;
  }
}

// Demo class
class PluginMarketplaceDemo {
  constructor() {
    this.pluginSystem = new MockPluginInterface();
  }

  async runDemo() {
    console.log('\x1b[36m\x1b[1m🚀 Gemini CLI Plugin Marketplace Demo\x1b[0m\n');
    console.log('\x1b[90mThis demo showcases the comprehensive plugin system for Gemini CLI\x1b[0m\n');

    await this.demoPluginDiscovery();
    await this.demoPluginInstallation();
    await this.demoPluginManagement();
    await this.demoPluginDevelopment();
    await this.demoAdvancedFeatures();

    console.log('\x1b[32m\x1b[1m✅ Demo completed successfully!\x1b[0m\n');
    console.log('\x1b[36mFor more information, visit: https://docs.gemini-cli.com/plugins\x1b[0m\n');
  }

  async demoPluginDiscovery() {
    console.log('\x1b[33m\x1b[1m📦 1. Plugin Discovery\x1b[0m\n');

    // Search for plugins
    console.log('🔍 Searching for Python-related plugins...');
    const searchResults = await this.pluginSystem.searchPlugins('python');
    
    if (searchResults.length === 0) {
      console.log('❌ No plugins found matching "python"\n');
    } else {
      console.log(`\n🔍 Search Results for "python" (${searchResults.length} found):\n`);
      
      for (const plugin of searchResults) {
        const type = this.pluginSystem.getTypeEmoji(plugin.type);
        const rating = '⭐'.repeat(Math.floor(plugin.rating));
        
        console.log(`${type} \x1b[1m${plugin.name}\x1b[0m v${plugin.version}`);
        console.log(`   ${plugin.description}`);
        console.log(`   Author: ${plugin.author}`);
        console.log(`   Rating: ${rating} (${plugin.rating}/5) | Downloads: ${plugin.downloads.toLocaleString()}`);
        console.log(`   Tags: ${plugin.tags.join(', ')}`);
        console.log(`   Updated: ${new Date(plugin.lastUpdated).toLocaleDateString()}\n`);
      }
    }

    // Show popular plugins
    console.log('🔥 Popular Plugins:\n');
    const popularPlugins = await this.pluginSystem.searchPlugins('');
    const sortedByDownloads = popularPlugins.sort((a, b) => b.downloads - a.downloads).slice(0, 3);
    
    for (let i = 0; i < sortedByDownloads.length; i++) {
      const plugin = sortedByDownloads[i];
      const type = this.pluginSystem.getTypeEmoji(plugin.type);
      const rating = '⭐'.repeat(Math.floor(plugin.rating));
      
      console.log(`${i + 1}. ${type} \x1b[1m${plugin.name}\x1b[0m v${plugin.version}`);
      console.log(`   ${plugin.description}`);
      console.log(`   Rating: ${rating} (${plugin.rating}/5) | Downloads: ${plugin.downloads.toLocaleString()}`);
      console.log(`   Tags: ${plugin.tags.join(', ')}\n`);
    }
  }

  async demoPluginInstallation() {
    console.log('\x1b[33m\x1b[1m📥 2. Plugin Installation\x1b[0m\n');

    // Install a plugin
    await this.pluginSystem.installPlugin('pip-analyzer');
    console.log('');

    // Show plugin info
    console.log('📋 Getting plugin information...');
    const infoResult = this.pluginSystem.getPluginInfo('pip-analyzer');
    console.log(infoResult);

    // Enable the plugin
    console.log('✅ Enabling plugin...');
    await this.pluginSystem.enablePlugin('pip-analyzer');
    console.log('');
  }

  async demoPluginManagement() {
    console.log('\x1b[33m\x1b[1m⚙️  3. Plugin Management\x1b[0m\n');

    // Install a few more plugins for demonstration
    await this.pluginSystem.installPlugin('dark-theme-pro');
    await this.pluginSystem.enablePlugin('dark-theme-pro');
    await this.pluginSystem.installPlugin('git-workflow');
    console.log('');

    // List installed plugins
    console.log('📋 Listing installed plugins...');
    const listResult = this.pluginSystem.listPlugins({ verbose: true });
    console.log(listResult);

    // List enabled plugins only
    console.log('✅ Listing enabled plugins...');
    const enabledResult = this.pluginSystem.listPlugins({ enabled: true });
    console.log(enabledResult);

    // Update a plugin (simulated)
    console.log('🔄 Updating plugin...');
    console.log('✅ Successfully updated plugin: pip-analyzer\n');
  }

  async demoPluginDevelopment() {
    console.log('\x1b[33m\x1b[1m🔧 4. Plugin Development\x1b[0m\n');

    console.log('\x1b[36mCreating a sample plugin structure...\x1b[0m\n');

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

    console.log('\x1b[90m' + pluginStructure + '\x1b[0m');

    console.log('\x1b[36mExample plugin implementation:\x1b[0m\n');

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

    console.log('\x1b[90m' + exampleCode + '\x1b[0m');
  }

  async demoAdvancedFeatures() {
    console.log('\x1b[33m\x1b[1m🚀 5. Advanced Features\x1b[0m\n');

    // Plugin types demonstration
    console.log('\x1b[36mPlugin Types:\x1b[0m\n');
    console.log('\x1b[90m🔧 Tool Plugins: Add new CLI tools and commands\x1b[0m');
    console.log('\x1b[90m🎨 Theme Plugins: Customize CLI appearance\x1b[0m');
    console.log('\x1b[90m🔌 Extension Plugins: Extend core functionality\x1b[0m');
    console.log('\x1b[90m⚙️  Utility Plugins: Helper functions and utilities\x1b[0m\n');

    // Security features
    console.log('\x1b[36mSecurity Features:\x1b[0m\n');
    console.log('\x1b[90m✅ Plugin validation and sandboxing\x1b[0m');
    console.log('\x1b[90m✅ Permission-based access control\x1b[0m');
    console.log('\x1b[90m✅ Isolated execution environment\x1b[0m');
    console.log('\x1b[90m✅ Resource usage limits\x1b[0m\n');

    // Installation sources
    console.log('\x1b[36mInstallation Sources:\x1b[0m\n');
    console.log('\x1b[90m📦 NPM Registry: gemini plugins install my-plugin\x1b[0m');
    console.log('\x1b[90m🌐 GitHub: gemini plugins install my-plugin https://github.com/user/repo\x1b[0m');
    console.log('\x1b[90m📁 Local: gemini plugins install my-plugin file:///path/to/plugin\x1b[0m\n');

    // Plugin lifecycle
    console.log('\x1b[36mPlugin Lifecycle:\x1b[0m\n');
    console.log('\x1b[90m1. 📥 Install: Download and install plugin\x1b[0m');
    console.log('\x1b[90m2. 🔄 Load: Load and validate plugin\x1b[0m');
    console.log('\x1b[90m3. ✅ Enable: Activate plugin functionality\x1b[0m');
    console.log('\x1b[90m4. ❌ Disable: Deactivate plugin\x1b[0m');
    console.log('\x1b[90m5. 🗑️  Uninstall: Remove plugin completely\x1b[0m\n');
  }

  async cleanup() {
    console.log('\x1b[33m\x1b[1m🧹 Cleaning up demo...\x1b[0m\n');

    // Disable and uninstall demo plugins
    await this.pluginSystem.disablePlugin('pip-analyzer');
    await this.pluginSystem.uninstallPlugin('pip-analyzer');
    await this.pluginSystem.uninstallPlugin('dark-theme-pro');
    await this.pluginSystem.uninstallPlugin('git-workflow');

    console.log('\x1b[32m✅ Cleanup completed\x1b[0m\n');
  }
}

// CLI interface
class PluginCLI {
  constructor() {
    this.demo = new PluginMarketplaceDemo();
  }

  async run() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      await this.demo.runDemo();
      return;
    }

    const command = args[0];
    const subCommand = args[1];
    const options = args.slice(2);

    switch (command) {
      case 'demo':
        await this.demo.runDemo();
        break;
      case 'search':
        if (!subCommand) {
          console.log('Usage: node demo-plugin-system.cjs search <query>');
          return;
        }
        const results = await this.demo.pluginSystem.searchPlugins(subCommand);
        console.log(`\n🔍 Search Results for "${subCommand}" (${results.length} found):\n`);
        results.forEach(plugin => {
          const type = this.demo.pluginSystem.getTypeEmoji(plugin.type);
          console.log(`${type} ${plugin.name} - ${plugin.description}`);
        });
        break;
      case 'install':
        if (!subCommand) {
          console.log('Usage: node demo-plugin-system.cjs install <plugin-name>');
          return;
        }
        await this.demo.pluginSystem.installPlugin(subCommand);
        break;
      case 'list':
        const listResult = this.demo.pluginSystem.listPlugins({ verbose: options.includes('--verbose') });
        console.log(listResult);
        break;
      case 'enable':
        if (!subCommand) {
          console.log('Usage: node demo-plugin-system.cjs enable <plugin-name>');
          return;
        }
        await this.demo.pluginSystem.enablePlugin(subCommand);
        break;
      case 'disable':
        if (!subCommand) {
          console.log('Usage: node demo-plugin-system.cjs disable <plugin-name>');
          return;
        }
        await this.demo.pluginSystem.disablePlugin(subCommand);
        break;
      case 'info':
        if (!subCommand) {
          console.log('Usage: node demo-plugin-system.cjs info <plugin-name>');
          return;
        }
        const info = this.demo.pluginSystem.getPluginInfo(subCommand);
        console.log(info);
        break;
      case 'uninstall':
        if (!subCommand) {
          console.log('Usage: node demo-plugin-system.cjs uninstall <plugin-name>');
          return;
        }
        await this.demo.pluginSystem.uninstallPlugin(subCommand);
        break;
      case 'cleanup':
        await this.demo.cleanup();
        break;
      default:
        console.log(`
🚀 Gemini CLI Plugin Marketplace Demo

Usage:
  node demo-plugin-system.cjs [command] [options]

Commands:
  demo                    Run the full demo
  search <query>          Search for plugins
  install <name>          Install a plugin
  list [--verbose]        List installed plugins
  enable <name>           Enable a plugin
  disable <name>          Disable a plugin
  info <name>             Show plugin information
  uninstall <name>        Uninstall a plugin
  cleanup                 Clean up demo plugins

Examples:
  node demo-plugin-system.cjs demo
  node demo-plugin-system.cjs search python
  node demo-plugin-system.cjs install pip-analyzer
  node demo-plugin-system.cjs list --verbose
        `);
    }
  }
}

// Run the CLI
if (require.main === module) {
  const cli = new PluginCLI();
  cli.run().catch(console.error);
}

module.exports = { PluginMarketplaceDemo, MockPluginInterface }; 