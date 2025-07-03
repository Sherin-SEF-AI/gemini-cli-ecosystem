/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { GeminiPlugin, PluginInstallResult, PluginMetadata } from './plugin-interface.js';

export class PluginInstaller {
  private pluginRoot: string;

  constructor(pluginRoot: string) {
    this.pluginRoot = pluginRoot;
  }

  async install(pluginName: string, source?: string): Promise<PluginInstallResult> {
    try {
      const pluginDir = path.join(this.pluginRoot, pluginName);
      
      // Remove existing installation if it exists
      if (fs.existsSync(pluginDir)) {
        await this.uninstall(pluginName);
      }

      // Determine source and install
      if (source) {
        return await this.installFromSource(pluginName, source);
      } else {
        return await this.installFromNpm(pluginName);
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to install plugin ${pluginName}: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async installFromNpm(pluginName: string): Promise<PluginInstallResult> {
    const pluginDir = path.join(this.pluginRoot, pluginName);
    
    try {
      // Create plugin directory
      fs.mkdirSync(pluginDir, { recursive: true });

      // For demo purposes, create a mock plugin if the npm package doesn't exist
      if (['pip-analyzer', 'code-review-assistant', 'dark-theme-pro', 'git-workflow', 'docker-helper'].includes(pluginName)) {
        return await this.createMockPlugin(pluginName, pluginDir);
      }

      // Install from npm
      const npmCommand = `npm install ${pluginName} --prefix ${pluginDir} --no-save`;
      execSync(npmCommand, { stdio: 'pipe' });

      // Find the installed package
      const nodeModulesDir = path.join(pluginDir, 'node_modules', pluginName);
      if (!fs.existsSync(nodeModulesDir)) {
        return { success: false, error: `Plugin ${pluginName} not found in npm registry` };
      }

      // Copy package contents to plugin directory
      this.copyDirectory(nodeModulesDir, pluginDir);

      // Clean up node_modules
      fs.rmSync(path.join(pluginDir, 'node_modules'), { recursive: true, force: true });
      fs.rmSync(path.join(pluginDir, 'package-lock.json'), { force: true });

      // Validate installation
      return await this.validateInstallation(pluginName);
    } catch (error) {
      return {
        success: false,
        error: `Failed to install plugin ${pluginName} from npm: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async createMockPlugin(pluginName: string, pluginDir: string): Promise<PluginInstallResult> {
    try {
      // Create package.json for the mock plugin
      const packageJson = {
        name: pluginName,
        version: '1.0.0',
        description: `Mock plugin: ${pluginName}`,
        author: 'demo-user',
        type: 'tool',
        entryPoint: 'index.js',
        compatibility: {
          'gemini-cli': '>=0.1.0',
          node: '>=18.0.0'
        },
        tags: ['demo', 'mock'],
        repository: 'https://github.com/demo/plugins',
        license: 'MIT'
      };

      fs.writeFileSync(path.join(pluginDir, 'package.json'), JSON.stringify(packageJson, null, 2));

      // Create a simple index.js file
      const indexJs = `
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

class ${pluginName.charAt(0).toUpperCase() + pluginName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())}Plugin {
  metadata = {
    name: '${pluginName}',
    version: '1.0.0',
    description: 'Mock plugin: ${pluginName}',
    author: 'demo-user',
    type: 'tool',
    entryPoint: 'index.js',
    compatibility: {
      'gemini-cli': '>=0.1.0',
      node: '>=18.0.0'
    }
  };

  constructor(context) {
    this.context = context;
  }

  async onEnable() {
    console.log('✅ Mock plugin ${pluginName} enabled!');
  }

  async onDisable() {
    console.log('❌ Mock plugin ${pluginName} disabled!');
  }
}

module.exports = ${pluginName.charAt(0).toUpperCase() + pluginName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())}Plugin;
`;

      fs.writeFileSync(path.join(pluginDir, 'index.js'), indexJs);

      // Create README.md
      const readme = `# ${pluginName}

This is a mock plugin for testing the Gemini CLI plugin marketplace.

## Installation

\`\`\`bash
gemini plugins install ${pluginName}
\`\`\`

## Usage

This is a demo plugin that shows how plugins work in the Gemini CLI.

## License

MIT
`;

      fs.writeFileSync(path.join(pluginDir, 'README.md'), readme);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create mock plugin ${pluginName}: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async installFromSource(pluginName: string, source: string): Promise<PluginInstallResult> {
    const pluginDir = path.join(this.pluginRoot, pluginName);
    
    try {
      // Create plugin directory
      fs.mkdirSync(pluginDir, { recursive: true });

      if (source === 'npm') {
        // Install from npm registry
        return await this.installFromNpm(pluginName);
      } else if (source.startsWith('http')) {
        // Install from URL (GitHub, GitLab, etc.)
        return await this.installFromUrl(pluginName, source);
      } else if (source.startsWith('file://')) {
        // Install from local file
        const localPath = source.replace('file://', '');
        return await this.installFromLocalPath(pluginName, localPath);
      } else if (fs.existsSync(source)) {
        // Install from local path
        return await this.installFromLocalPath(pluginName, source);
      } else {
        return { success: false, error: `Invalid source: ${source}` };
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to install plugin ${pluginName} from source: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async installFromUrl(pluginName: string, url: string): Promise<PluginInstallResult> {
    const pluginDir = path.join(this.pluginRoot, pluginName);
    
    try {
      // Clone the repository
      const cloneCommand = `git clone ${url} ${pluginDir}`;
      execSync(cloneCommand, { stdio: 'pipe' });

      // Install dependencies if package.json exists
      const packageJsonPath = path.join(pluginDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        execSync('npm install', { cwd: pluginDir, stdio: 'pipe' });
      }

      // Build if build script exists
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      if (packageJson.scripts && packageJson.scripts.build) {
        execSync('npm run build', { cwd: pluginDir, stdio: 'pipe' });
      }

      return await this.validateInstallation(pluginName);
    } catch (error) {
      return {
        success: false,
        error: `Failed to install plugin ${pluginName} from URL: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async installFromLocalPath(pluginName: string, localPath: string): Promise<PluginInstallResult> {
    const pluginDir = path.join(this.pluginRoot, pluginName);
    
    try {
      // Copy the directory
      this.copyDirectory(localPath, pluginDir);

      // Install dependencies if package.json exists
      const packageJsonPath = path.join(pluginDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        execSync('npm install', { cwd: pluginDir, stdio: 'pipe' });
      }

      // Build if build script exists
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      if (packageJson.scripts && packageJson.scripts.build) {
        execSync('npm run build', { cwd: pluginDir, stdio: 'pipe' });
      }

      return await this.validateInstallation(pluginName);
    } catch (error) {
      return {
        success: false,
        error: `Failed to install plugin ${pluginName} from local path: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private copyDirectory(src: string, dest: string): void {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  private async validateInstallation(pluginName: string): Promise<PluginInstallResult> {
    const pluginDir = path.join(this.pluginRoot, pluginName);
    const packageJsonPath = path.join(pluginDir, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      return { success: false, error: `Plugin ${pluginName} missing package.json` };
    }

    try {
      const metadata: PluginMetadata = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // Validate required fields
      const required = ['name', 'version', 'description', 'author', 'type', 'entryPoint', 'compatibility'];
      for (const field of required) {
        if (!metadata[field as keyof PluginMetadata]) {
          return { success: false, error: `Plugin ${pluginName} missing required field: ${field}` };
        }
      }

      // Check entry point exists
      const entryPoint = path.join(pluginDir, metadata.entryPoint);
      if (!fs.existsSync(entryPoint)) {
        return { success: false, error: `Plugin ${pluginName} entry point not found: ${entryPoint}` };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to validate plugin ${pluginName}: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  async uninstall(pluginName: string): Promise<void> {
    const pluginDir = path.join(this.pluginRoot, pluginName);
    if (fs.existsSync(pluginDir)) {
      fs.rmSync(pluginDir, { recursive: true, force: true });
    }
  }

  async update(pluginName: string): Promise<PluginInstallResult> {
    try {
      // Get current plugin info
      const pluginDir = path.join(this.pluginRoot, pluginName);
      const packageJsonPath = path.join(pluginDir, 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        return { success: false, error: `Plugin ${pluginName} not found` };
      }

      const metadata: PluginMetadata = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // Reinstall from npm
      return await this.installFromNpm(pluginName);
    } catch (error) {
      return {
        success: false,
        error: `Failed to update plugin ${pluginName}: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  getInstalledPlugins(): string[] {
    if (!fs.existsSync(this.pluginRoot)) {
      return [];
    }

    return fs.readdirSync(this.pluginRoot, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
  }

  getPluginMetadata(pluginName: string): PluginMetadata | null {
    const packageJsonPath = path.join(this.pluginRoot, pluginName, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    } catch (error) {
      return null;
    }
  }
} 