/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  repository?: string;
  homepage?: string;
  license?: string;
  type: PluginType;
  entryPoint: string;
  dependencies?: string[];
  peerDependencies?: string[];
  tags?: string[];
  compatibility: {
    'gemini-cli': string;
    node?: string;
  };
  permissions?: PluginPermission[];
  commands?: PluginCommand[];
  tools?: PluginTool[];
  themes?: PluginTheme[];
  extensions?: PluginExtension[];
}

export enum PluginType {
  TOOL = 'tool',
  THEME = 'theme',
  EXTENSION = 'extension',
  UTILITY = 'utility',
  MCP_SERVER = 'mcp-server'
}

export interface PluginPermission {
  name: string;
  description: string;
  required: boolean;
}

export interface PluginCommand {
  name: string;
  description: string;
  usage?: string;
  examples?: string[];
}

export interface PluginTool {
  name: string;
  displayName: string;
  description: string;
  parameters?: Record<string, any>;
}

export interface PluginTheme {
  name: string;
  displayName: string;
  description: string;
  colors: Record<string, string>;
}

export interface PluginExtension {
  name: string;
  type: 'mcp-server' | 'custom';
  config: Record<string, any>;
}

export interface GeminiPlugin {
  metadata: PluginMetadata;
  
  // Lifecycle methods
  onInstall?(): Promise<void>;
  onUninstall?(): Promise<void>;
  onEnable?(): Promise<void>;
  onDisable?(): Promise<void>;
  
  // Registration methods
  registerCommands?(registry: CommandRegistry): void;
  registerTools?(registry: ToolRegistry): void;
  registerThemes?(registry: ThemeRegistry): void;
  registerExtensions?(registry: ExtensionRegistry): void;
  
  // Plugin-specific methods
  [key: string]: any;
}

export interface CommandRegistry {
  registerCommand(command: PluginCommand): void;
  unregisterCommand(name: string): void;
}

export interface ToolRegistry {
  registerTool(tool: PluginTool): void;
  unregisterTool(name: string): void;
}

export interface ThemeRegistry {
  registerTheme(theme: PluginTheme): void;
  unregisterTheme(name: string): void;
}

export interface ExtensionRegistry {
  registerExtension(extension: PluginExtension): void;
  unregisterExtension(name: string): void;
}

export interface PluginContext {
  workspaceRoot: string;
  pluginRoot: string;
  config: any;
  logger: {
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    debug(message: string): void;
  };
}

export interface PluginInstallResult {
  success: boolean;
  plugin?: GeminiPlugin;
  error?: string;
  warnings?: string[];
}

export interface PluginSearchResult {
  name: string;
  version: string;
  description: string;
  author: string;
  downloads: number;
  rating: number;
  tags: string[];
  lastUpdated: string;
  type: PluginType;
}

export interface PluginMarketplaceInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  repository: string;
  homepage?: string;
  license: string;
  downloads: number;
  rating: number;
  tags: string[];
  lastUpdated: string;
  readme: string;
  changelog?: string;
  dependencies: string[];
  compatibility: {
    'gemini-cli': string;
    node: string;
  };
} 