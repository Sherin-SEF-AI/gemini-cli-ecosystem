/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeminiPlugin, PluginContext, PluginType } from '../../../plugin-interface';
import * as fs from 'node:fs';
import * as path from 'node:path';

export default class PipAnalyzerPlugin implements GeminiPlugin {
  metadata = {
    name: 'pip-analyzer',
    version: '1.0.0',
    description: 'AI-powered Python dependency analyzer for Gemini CLI',
    author: 'gemini-cli-team',
    repository: 'https://github.com/google-gemini/gemini-cli-plugins',
    homepage: 'https://github.com/google-gemini/gemini-cli-plugins/tree/main/pip-analyzer',
    license: 'Apache-2.0',
    type: PluginType.TOOL,
    entryPoint: 'dist/index.js',
    dependencies: ['semver', 'axios'],
    tags: ['python', 'pip', 'dependencies', 'ai', 'analysis'],
    compatibility: {
      'gemini-cli': '>=0.1.0',
      node: '>=18.0.0'
    },
    permissions: [
      {
        name: 'file-system',
        description: 'Read requirements.txt and pyproject.toml files',
        required: true
      },
      {
        name: 'network',
        description: 'Fetch package information from PyPI',
        required: true
      }
    ],
    commands: [
      {
        name: 'pip-analyze',
        description: 'Analyze Python dependencies in your project',
        usage: '/pip-analyze [options]',
        examples: [
          '/pip-analyze',
          '/pip-analyze --outdated',
          '/pip-analyze --security'
        ]
      }
    ],
    tools: [
      {
        name: 'pip_analyzer',
        displayName: 'Pip Analyzer',
        description: 'Analyze Python dependencies for security, updates, and conflicts'
      }
    ]
  };

  private context: PluginContext;

  constructor(context: PluginContext) {
    this.context = context;
  }

  async onInstall(): Promise<void> {
    this.context.logger.info('Pip Analyzer plugin installed successfully');
  }

  async onUninstall(): Promise<void> {
    this.context.logger.info('Pip Analyzer plugin uninstalled');
  }

  async onEnable(): Promise<void> {
    this.context.logger.info('Pip Analyzer plugin enabled');
  }

  async onDisable(): Promise<void> {
    this.context.logger.info('Pip Analyzer plugin disabled');
  }

  registerCommands(registry: any): void {
    registry.registerCommand({
      name: 'pip-analyze',
      description: 'Analyze Python dependencies in your project',
      usage: '/pip-analyze [options]',
      examples: [
        '/pip-analyze',
        '/pip-analyze --outdated',
        '/pip-analyze --security'
      ]
    });
  }

  registerTools(registry: any): void {
    registry.registerTool({
      name: 'pip_analyzer',
      displayName: 'Pip Analyzer',
      description: 'Analyze Python dependencies for security, updates, and conflicts',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['analyze', 'check-updates', 'security-scan', 'conflict-check'],
            description: 'The analysis action to perform'
          },
          file: {
            type: 'string',
            description: 'Path to requirements.txt or pyproject.toml file'
          }
        },
        required: ['action']
      }
    });
  }

  // Plugin-specific methods
  async analyzeDependencies(filePath?: string): Promise<any> {
    const requirementsFile = filePath || this.findRequirementsFile();
    
    if (!requirementsFile) {
      throw new Error('No requirements.txt or pyproject.toml found in project');
    }

    const dependencies = this.parseDependencies(requirementsFile);
    const analysis = await this.performAnalysis(dependencies);

    return {
      file: requirementsFile,
      dependencies: dependencies,
      analysis: analysis,
      recommendations: this.generateRecommendations(analysis)
    };
  }

  private findRequirementsFile(): string | null {
    const possibleFiles = [
      'requirements.txt',
      'pyproject.toml',
      'Pipfile',
      'setup.py'
    ];

    for (const file of possibleFiles) {
      const filePath = path.join(this.context.workspaceRoot, file);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }

    return null;
  }

  private parseDependencies(filePath: string): any[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const dependencies: any[] = [];

    if (filePath.endsWith('requirements.txt')) {
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const match = trimmed.match(/^([a-zA-Z0-9_-]+)([<>=!~]+)(.+)$/);
          if (match) {
            dependencies.push({
              name: match[1],
              version: match[3],
              constraint: match[2]
            });
          } else {
            dependencies.push({
              name: trimmed,
              version: 'latest',
              constraint: '=='
            });
          }
        }
      }
    } else if (filePath.endsWith('pyproject.toml')) {
      // Simple TOML parsing for dependencies
      const lines = content.split('\n');
      let inDependencies = false;
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '[tool.poetry.dependencies]' || trimmed === '[project.dependencies]') {
          inDependencies = true;
          continue;
        }
        
        if (inDependencies && trimmed.startsWith('[')) {
          break;
        }
        
        if (inDependencies && trimmed && !trimmed.startsWith('#')) {
          const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*["']?([^"']+)["']?$/);
          if (match) {
            dependencies.push({
              name: match[1],
              version: match[2],
              constraint: '=='
            });
          }
        }
      }
    }

    return dependencies;
  }

  private async performAnalysis(dependencies: any[]): Promise<any> {
    const analysis = {
      total: dependencies.length,
      outdated: 0,
      securityIssues: 0,
      conflicts: 0,
      details: [] as any[]
    };

    for (const dep of dependencies) {
      const detail = {
        name: dep.name,
        currentVersion: dep.version,
        latestVersion: await this.getLatestVersion(dep.name),
        isOutdated: false,
        securityIssues: [] as string[],
        recommendations: [] as string[]
      };

      // Check if outdated
      if (detail.latestVersion && detail.currentVersion !== detail.latestVersion) {
        detail.isOutdated = true;
        analysis.outdated++;
        detail.recommendations.push(`Update to ${detail.latestVersion}`);
      }

      // Mock security check
      if (Math.random() < 0.1) { // 10% chance of security issue for demo
        detail.securityIssues.push('Known vulnerability in older version');
        analysis.securityIssues++;
        detail.recommendations.push('Update to fix security vulnerability');
      }

      analysis.details.push(detail);
    }

    return analysis;
  }

  private async getLatestVersion(packageName: string): Promise<string | null> {
    try {
      // Mock API call to PyPI
      // In a real implementation, this would call the PyPI API
      const mockVersions: Record<string, string> = {
        'requests': '2.31.0',
        'numpy': '1.24.3',
        'pandas': '2.0.3',
        'flask': '2.3.3',
        'django': '4.2.4'
      };

      return mockVersions[packageName] || '1.0.0';
    } catch (error) {
      this.context.logger.warn(`Failed to get latest version for ${packageName}: ${error}`);
      return null;
    }
  }

  private generateRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];

    if (analysis.outdated > 0) {
      recommendations.push(`Update ${analysis.outdated} outdated packages`);
    }

    if (analysis.securityIssues > 0) {
      recommendations.push(`Fix ${analysis.securityIssues} security issues`);
    }

    if (analysis.total > 20) {
      recommendations.push('Consider using a dependency management tool like Poetry or Pipenv');
    }

    if (analysis.conflicts > 0) {
      recommendations.push('Resolve dependency conflicts');
    }

    return recommendations;
  }
} 