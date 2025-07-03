/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { PluginSearchResult, PluginMarketplaceInfo, PluginType } from '../plugin-interface.js';

export interface MarketplaceConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

export class MarketplaceClient {
  private config: MarketplaceConfig;

  constructor(config: MarketplaceConfig) {
    this.config = {
      timeout: 30000,
      ...config
    };
  }

  async searchPlugins(query: string, options?: {
    limit?: number;
    offset?: number;
    tags?: string[];
    type?: string;
    sortBy?: 'downloads' | 'rating' | 'updated' | 'name';
    sortOrder?: 'asc' | 'desc';
  }): Promise<PluginSearchResult[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: (options?.limit || 20).toString(),
        offset: (options?.offset || 0).toString(),
        sortBy: options?.sortBy || 'downloads',
        sortOrder: options?.sortOrder || 'desc'
      });

      if (options?.tags) {
        options.tags.forEach(tag => params.append('tags', tag));
      }

      if (options?.type) {
        params.append('type', options.type);
      }

      const response = await this.makeRequest(`/search?${params.toString()}`);
      return response.plugins || [];
    } catch (error) {
      console.error('Failed to search plugins:', error);
      return [];
    }
  }

  async getPluginInfo(pluginName: string): Promise<PluginMarketplaceInfo | null> {
    try {
      const response = await this.makeRequest(`/plugins/${pluginName}`);
      return response;
    } catch (error) {
      console.error(`Failed to get plugin info for ${pluginName}:`, error);
      return null;
    }
  }

  async getPopularPlugins(limit: number = 10): Promise<PluginSearchResult[]> {
    try {
      const response = await this.makeRequest(`/popular?limit=${limit}`);
      return response.plugins || [];
    } catch (error) {
      console.error('Failed to get popular plugins:', error);
      return [];
    }
  }

  async getRecentPlugins(limit: number = 10): Promise<PluginSearchResult[]> {
    try {
      const response = await this.makeRequest(`/recent?limit=${limit}`);
      return response.plugins || [];
    } catch (error) {
      console.error('Failed to get recent plugins:', error);
      return [];
    }
  }

  async getPluginsByTag(tag: string, limit: number = 20): Promise<PluginSearchResult[]> {
    try {
      const response = await this.makeRequest(`/tags/${tag}?limit=${limit}`);
      return response.plugins || [];
    } catch (error) {
      console.error(`Failed to get plugins by tag ${tag}:`, error);
      return [];
    }
  }

  async getPluginDownloadUrl(pluginName: string, version?: string): Promise<string | null> {
    try {
      const versionParam = version ? `?version=${version}` : '';
      const response = await this.makeRequest(`/plugins/${pluginName}/download${versionParam}`);
      return response.downloadUrl || null;
    } catch (error) {
      console.error(`Failed to get download URL for ${pluginName}:`, error);
      return null;
    }
  }

  async submitPluginRating(pluginName: string, rating: number, review?: string): Promise<boolean> {
    try {
      await this.makeRequest(`/plugins/${pluginName}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating, review })
      });
      return true;
    } catch (error) {
      console.error(`Failed to submit rating for ${pluginName}:`, error);
      return false;
    }
  }

  async getPluginStats(pluginName: string): Promise<{
    downloads: number;
    rating: number;
    reviewCount: number;
    lastUpdated: string;
  } | null> {
    try {
      const response = await this.makeRequest(`/plugins/${pluginName}/stats`);
      return response;
    } catch (error) {
      console.error(`Failed to get stats for ${pluginName}:`, error);
      return null;
    }
  }

  private async makeRequest(endpoint: string, options?: {
    method?: string;
    body?: string;
  }): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: options?.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: options?.body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Mock data for development/testing
  getMockPlugins(): PluginSearchResult[] {
    return [
      {
        name: 'pip-analyzer',
        version: '1.0.0',
        description: 'AI-powered Python dependency analyzer',
        author: 'gemini-cli-team',
        downloads: 1250,
        rating: 4.8,
        tags: ['python', 'pip', 'dependencies', 'ai'],
        lastUpdated: '2024-01-15T10:30:00Z',
        type: PluginType.TOOL,
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
        type: PluginType.TOOL,
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
        type: PluginType.THEME,
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
        type: PluginType.UTILITY,
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
        type: PluginType.TOOL,
      },
    ];
  }
} 