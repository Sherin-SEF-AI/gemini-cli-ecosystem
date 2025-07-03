/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  CommandRegistry, 
  ToolRegistry, 
  ThemeRegistry, 
  ExtensionRegistry,
  PluginCommand,
  PluginTool,
  PluginTheme,
  PluginExtension
} from './plugin-interface.js';

export class PluginRegistry {
  private commands: Map<string, PluginCommand> = new Map();
  private tools: Map<string, PluginTool> = new Map();
  private themes: Map<string, PluginTheme> = new Map();
  private extensions: Map<string, PluginExtension> = new Map();
  private pluginOwnership: Map<string, string> = new Map(); // capability -> plugin

  getCommandRegistry(): CommandRegistry {
    return {
      registerCommand: (command: PluginCommand) => {
        this.commands.set(command.name, command);
        this.pluginOwnership.set(`command:${command.name}`, 'unknown');
      },
      unregisterCommand: (name: string) => {
        this.commands.delete(name);
        this.pluginOwnership.delete(`command:${name}`);
      }
    };
  }

  getToolRegistry(): ToolRegistry {
    return {
      registerTool: (tool: PluginTool) => {
        this.tools.set(tool.name, tool);
        this.pluginOwnership.set(`tool:${tool.name}`, 'unknown');
      },
      unregisterTool: (name: string) => {
        this.tools.delete(name);
        this.pluginOwnership.delete(`tool:${name}`);
      }
    };
  }

  getThemeRegistry(): ThemeRegistry {
    return {
      registerTheme: (theme: PluginTheme) => {
        this.themes.set(theme.name, theme);
        this.pluginOwnership.set(`theme:${theme.name}`, 'unknown');
      },
      unregisterTheme: (name: string) => {
        this.themes.delete(name);
        this.pluginOwnership.delete(`theme:${name}`);
      }
    };
  }

  getExtensionRegistry(): ExtensionRegistry {
    return {
      registerExtension: (extension: PluginExtension) => {
        this.extensions.set(extension.name, extension);
        this.pluginOwnership.set(`extension:${extension.name}`, 'unknown');
      },
      unregisterExtension: (name: string) => {
        this.extensions.delete(name);
        this.pluginOwnership.delete(`extension:${name}`);
      }
    };
  }

  getCommand(name: string): PluginCommand | undefined {
    return this.commands.get(name);
  }

  getAllCommands(): PluginCommand[] {
    return Array.from(this.commands.values());
  }

  getTool(name: string): PluginTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): PluginTool[] {
    return Array.from(this.tools.values());
  }

  getTheme(name: string): PluginTheme | undefined {
    return this.themes.get(name);
  }

  getAllThemes(): PluginTheme[] {
    return Array.from(this.themes.values());
  }

  getExtension(name: string): PluginExtension | undefined {
    return this.extensions.get(name);
  }

  getAllExtensions(): PluginExtension[] {
    return Array.from(this.extensions.values());
  }

  unregisterPlugin(pluginName: string): void {
    // Remove all capabilities owned by this plugin
    for (const [capability, owner] of this.pluginOwnership.entries()) {
      if (owner === pluginName) {
        const [type, name] = capability.split(':');
        switch (type) {
          case 'command':
            this.commands.delete(name);
            break;
          case 'tool':
            this.tools.delete(name);
            break;
          case 'theme':
            this.themes.delete(name);
            break;
          case 'extension':
            this.extensions.delete(name);
            break;
        }
        this.pluginOwnership.delete(capability);
      }
    }
  }

  getPluginCapabilities(pluginName: string): {
    commands: PluginCommand[];
    tools: PluginTool[];
    themes: PluginTheme[];
    extensions: PluginExtension[];
  } {
    const commands: PluginCommand[] = [];
    const tools: PluginTool[] = [];
    const themes: PluginTheme[] = [];
    const extensions: PluginExtension[] = [];

    for (const [capability, owner] of this.pluginOwnership.entries()) {
      if (owner === pluginName) {
        const [type, name] = capability.split(':');
        switch (type) {
          case 'command':
            const command = this.commands.get(name);
            if (command) commands.push(command);
            break;
          case 'tool':
            const tool = this.tools.get(name);
            if (tool) tools.push(tool);
            break;
          case 'theme':
            const theme = this.themes.get(name);
            if (theme) themes.push(theme);
            break;
          case 'extension':
            const extension = this.extensions.get(name);
            if (extension) extensions.push(extension);
            break;
        }
      }
    }

    return { commands, tools, themes, extensions };
  }
} 