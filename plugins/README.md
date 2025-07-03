# Gemini CLI Plugin Marketplace

A comprehensive plugin system for extending Gemini CLI functionality with community-contributed tools, themes, and extensions.

## 🚀 Features

- **Plugin Discovery**: Search and discover plugins from the marketplace
- **Easy Installation**: Install plugins from npm, GitHub, or local sources
- **Plugin Management**: Enable, disable, update, and uninstall plugins
- **Multiple Plugin Types**: Support for tools, themes, extensions, and utilities
- **Security**: Plugin validation and sandboxed execution
- **Developer Friendly**: Simple plugin development and distribution

## 📦 Plugin Types

### 🔧 Tool Plugins
Add new CLI tools and commands to Gemini CLI:
- Custom analysis tools
- Development utilities
- Code generators
- Automation scripts

### 🎨 Theme Plugins
Customize the CLI appearance:
- Color schemes
- UI layouts
- Custom styling

### 🔌 Extension Plugins
Extend core functionality:
- MCP server integrations
- File format support
- Language servers

### ⚙️ Utility Plugins
Helper functions and utilities:
- Data processors
- Format converters
- Integration tools

## 🛠️ Usage

### Basic Commands

```bash
# List installed plugins
gemini plugins list

# Search for plugins
gemini plugins search "python"

# Install a plugin
gemini plugins install pip-analyzer

# Enable a plugin
gemini plugins enable pip-analyzer

# Disable a plugin
gemini plugins disable pip-analyzer

# Update a plugin
gemini plugins update pip-analyzer

# Uninstall a plugin
gemini plugins uninstall pip-analyzer

# Show plugin information
gemini plugins info pip-analyzer

# Show popular plugins
gemini plugins popular

# Show recent plugins
gemini plugins recent
```

### Advanced Options

```bash
# List with verbose output
gemini plugins list --verbose

# Search with filters
gemini plugins search "python" --type tool --tags pip

# Install from specific source
gemini plugins install my-plugin https://github.com/user/my-plugin
gemini plugins install my-plugin file:///path/to/local/plugin

# Show popular plugins with custom limit
gemini plugins popular 20
```

## 🔌 Plugin Development

### Creating a Plugin

1. **Initialize Plugin Structure**:
```bash
mkdir my-gemini-plugin
cd my-gemini-plugin
npm init
```

2. **Create Plugin Metadata** (`package.json`):
```json
{
  "name": "my-gemini-plugin",
  "version": "1.0.0",
  "description": "My awesome Gemini CLI plugin",
  "author": "Your Name",
  "type": "tool",
  "entryPoint": "dist/index.js",
  "compatibility": {
    "gemini-cli": ">=0.1.0",
    "node": ">=18.0.0"
  },
  "tags": ["my-tag", "utility"],
  "commands": [
    {
      "name": "my-command",
      "description": "My custom command",
      "usage": "/my-command [options]"
    }
  ]
}
```

3. **Implement Plugin Class** (`src/index.ts`):
```typescript
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

  private context: PluginContext;

  constructor(context: PluginContext) {
    this.context = context;
  }

  async onInstall(): Promise<void> {
    this.context.logger.info('Plugin installed successfully');
  }

  async onEnable(): Promise<void> {
    this.context.logger.info('Plugin enabled');
  }

  registerCommands(registry: any): void {
    registry.registerCommand({
      name: 'my-command',
      description: 'My custom command',
      usage: '/my-command [options]'
    });
  }

  // Plugin-specific methods
  async myCustomMethod(): Promise<any> {
    // Your plugin logic here
    return { success: true };
  }
}
```

4. **Build and Test**:
```bash
npm run build
gemini plugins install . --local
```

### Plugin Lifecycle

- **Install**: Plugin is downloaded and installed
- **Load**: Plugin module is loaded and validated
- **Enable**: Plugin is activated and ready for use
- **Disable**: Plugin is deactivated but remains installed
- **Uninstall**: Plugin is completely removed

### Plugin Context

Plugins receive a context object with:
- `workspaceRoot`: Path to the current workspace
- `pluginRoot`: Path to the plugin installation directory
- `config`: Plugin-specific configuration
- `logger`: Logging utilities

### Plugin Capabilities

#### Commands
Register custom slash commands:
```typescript
registerCommands(registry: CommandRegistry): void {
  registry.registerCommand({
    name: 'my-command',
    description: 'My custom command',
    usage: '/my-command [options]',
    examples: ['/my-command', '/my-command --help']
  });
}
```

#### Tools
Register new CLI tools:
```typescript
registerTools(registry: ToolRegistry): void {
  registry.registerTool({
    name: 'my_tool',
    displayName: 'My Tool',
    description: 'My custom tool',
    parameters: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Input data' }
      },
      required: ['input']
    }
  });
}
```

#### Themes
Register custom themes:
```typescript
registerThemes(registry: ThemeRegistry): void {
  registry.registerTheme({
    name: 'my-theme',
    displayName: 'My Theme',
    description: 'My custom theme',
    colors: {
      foreground: '#ffffff',
      background: '#000000',
      accent: '#007acc'
    }
  });
}
```

## 📚 Example Plugins

### Pip Analyzer Plugin
AI-powered Python dependency analyzer:
- Analyzes requirements.txt and pyproject.toml
- Checks for outdated packages
- Identifies security vulnerabilities
- Provides update recommendations

### Code Review Assistant
Automated code review with AI insights:
- Analyzes code changes
- Suggests improvements
- Identifies potential issues
- Generates review comments

### Dark Theme Pro
Professional dark theme for Gemini CLI:
- Modern dark color scheme
- Improved readability
- Custom UI elements

## 🔒 Security

### Plugin Validation
- Metadata validation
- Entry point verification
- Compatibility checks
- Permission validation

### Sandboxed Execution
- Isolated plugin environment
- Limited file system access
- Network request restrictions
- Resource usage limits

### Permission System
Plugins can request permissions:
- `file-system`: Read/write files
- `network`: Make network requests
- `process`: Execute system commands
- `environment`: Access environment variables

## 🚀 Publishing Plugins

### To NPM Registry
1. Build your plugin
2. Publish to npm:
```bash
npm publish
```

### To GitHub
1. Create a repository
2. Add plugin files
3. Create releases with version tags

### To Marketplace
1. Submit plugin for review
2. Provide documentation
3. Include examples and tests

## 🛠️ Development Tools

### Plugin Template
Use the official plugin template:
```bash
npx create-gemini-plugin my-plugin
```

### Plugin Validator
Validate your plugin:
```bash
npx gemini-plugin-validate my-plugin
```

### Plugin Tester
Test your plugin:
```bash
npx gemini-plugin-test my-plugin
```

## 📖 API Reference

### Plugin Interface
```typescript
interface GeminiPlugin {
  metadata: PluginMetadata;
  onInstall?(): Promise<void>;
  onUninstall?(): Promise<void>;
  onEnable?(): Promise<void>;
  onDisable?(): Promise<void>;
  registerCommands?(registry: CommandRegistry): void;
  registerTools?(registry: ToolRegistry): void;
  registerThemes?(registry: ThemeRegistry): void;
  registerExtensions?(registry: ExtensionRegistry): void;
}
```

### Plugin Metadata
```typescript
interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  type: PluginType;
  entryPoint: string;
  compatibility: {
    'gemini-cli': string;
    node?: string;
  };
  tags?: string[];
  permissions?: PluginPermission[];
}
```

## 🤝 Contributing

### Reporting Issues
- Use GitHub Issues
- Include plugin name and version
- Provide error messages and logs
- Describe expected vs actual behavior

### Submitting Plugins
- Follow the plugin guidelines
- Include comprehensive documentation
- Provide examples and tests
- Ensure compatibility

### Community Guidelines
- Be respectful and helpful
- Follow coding standards
- Test thoroughly
- Document your work

## 📄 License

This plugin system is part of Gemini CLI and is licensed under the Apache 2.0 License.

## 🆘 Support

- **Documentation**: [docs.gemini-cli.com/plugins](https://docs.gemini-cli.com/plugins)
- **Discussions**: [GitHub Discussions](https://github.com/google-gemini/gemini-cli/discussions)
- **Issues**: [GitHub Issues](https://github.com/google-gemini/gemini-cli/issues)
- **Community**: [Discord Server](https://discord.gg/gemini-cli) 