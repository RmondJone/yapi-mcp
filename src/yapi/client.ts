import { getYapiConfig } from '../config/env';
import type { YapiInterface, YapiCategory, YapiMenu, YapiSearchResult } from './types';

/**
 * YAPI API 客户端
 */
export class YapiClient {
  private baseUrl: string;
  private token: string;

  constructor(config?: { url?: string; token?: string }) {
    const yapiConfig = config || getYapiConfig();
    this.baseUrl = yapiConfig.url!;
    this.token = yapiConfig.token!;
  }

  /**
   * 发起请求
   */
  private async request<T>(path: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    // 添加 token 到查询参数
    params.token = this.token;

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`YAPI 请求失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as any;

    if (result.errcode !== 0) {
      throw new Error(`YAPI 错误: ${result.errmsg || '未知错误'}`);
    }

    return result.data as T;
  }

  /**
   * 根据关键字搜索接口
   */
  async searchInterfaces(keyword: string): Promise<YapiInterface[]> {
    const result = await this.request<YapiSearchResult>('/api/plugin/interface/search', {
      keyword,
    });
    return result.list || [];
  }

  /**
   * 获取接口详情
   */
  async getInterfaceDetail(id: number): Promise<YapiInterface> {
    return this.request<YapiInterface>('/api/interface/get', { id });
  }

  /**
   * 获取项目分类列表
   */
  async getCategories(): Promise<YapiCategory[]> {
    return this.request<YapiCategory[]>('/api/interface/list_cat', {
      token: this.token,
    });
  }

  /**
   * 获取项目菜单（包含分类和接口）
   */
  async getMenu(): Promise<YapiMenu[]> {
    return this.request<YapiMenu[]>('/api/plugin/interface/list_menu');
  }

  /**
   * 获取分类下的接口列表
   */
  async getCategoryInterfaces(catid: number): Promise<YapiInterface[]> {
    return this.request<YapiInterface[]>('/api/interface/list_cat', { catid });
  }
}

/**
 * 获取默认客户端实例
 */
let defaultClient: YapiClient | null = null;

export function getYapiClient(): YapiClient {
  if (!defaultClient) {
    defaultClient = new YapiClient();
  }
  return defaultClient;
}
