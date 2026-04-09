import { getYapiConfig } from '../config/env';
import type { YapiInterface } from './types';

/**
 * YAPI API 客户端
 */
export class YapiClient {
  private baseUrl: string;
  private token: string;
  private projectId: string;

  constructor(config?: { url?: string; token?: string; projectId?: string }) {
    const yapiConfig = config || getYapiConfig();
    this.baseUrl = yapiConfig.url!;
    this.token = yapiConfig.token!;
    this.projectId = yapiConfig.projectId || '';
  }

  /**
   * 发起 GET 请求
   */
  private async requestGet<T>(path: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    // 添加 token 到查询参数
    params.token = this.token;

    // 添加 projectId 到查询参数
    if (this.projectId) {
      params.projectId = this.projectId;
    }

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
   * 发起 POST 请求
   */
  private async requestPost<T>(path: string, body: Record<string, any> = {}): Promise<T> {
    // 添加 token 到 body
    body.token = this.token;

    // 添加 projectId 到 body
    if (this.projectId) {
      body.projectId = this.projectId;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
   * 发起 POST 表单请求
   */
  private async requestPostForm<T>(path: string, body: Record<string, any> = {}): Promise<T> {
    // 添加 token 到 body
    body.token = this.token;

    // 添加 projectId 到 body
    if (this.projectId) {
      body.projectId = this.projectId;
    }

    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
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
   * 获取项目基本信息
   */
  async getProjectInfo(): Promise<any> {
    return this.requestGet<any>('/api/project/get');
  }

  /**
   * 获取菜单列表（分类列表）
   */
  async getCatMenu(): Promise<any[]> {
    return this.requestGet<any[]>('/api/interface/getCatMenu');
  }

  /**
   * 获取接口详情
   */
  async getInterfaceDetail(id: number): Promise<any> {
    return this.requestGet<any>('/api/interface/get', { id });
  }

  /**
   * 获取分类下的接口列表
   */
  async getCategoryInterfaces(catid: number, page: number = 1, limit: number = 10): Promise<any[]> {
    return this.requestGet<any[]>('/api/interface/list_cat', { catid, page, limit });
  }

  /**
   * 获取项目接口菜单列表（包含分类和接口）
   */
  async getMenu(): Promise<any[]> {
    return this.requestGet<any[]>('/api/interface/list_menu');
  }

  /**
   * 获取接口列表数据
   */
  async getInterfaceList(page: number = 1, limit: number = 10): Promise<any[]> {
    return this.requestGet<any[]>('/api/interface/list', { page, limit });
  }

  /**
   * 新增接口分类
   */
  async addCategory(name: string, desc?: string, projectId?: string): Promise<any> {
    const params: any = {
      name,
      project_id: projectId || this.projectId,
    };
    if (desc) {
      params.desc = desc;
    }
    return this.requestPostForm<any>('/api/interface/add_cat', params);
  }

  /**
   * 新增或更新接口
   */
  async saveInterface(interfaceData: {
    id?: number;
    title: string;
    catid: number;
    path: string;
    method: string;
    status?: string;
    req_body_type?: string;
    res_body_type?: string;
    res_body?: string;
    req_body_form?: any[];
    req_params?: any[];
    req_headers?: any[];
    req_query?: any[];
    desc?: string;
  }): Promise<any> {
    return this.requestPost<any>('/api/interface/save', interfaceData);
  }

  /**
   * 更新接口
   */
  async updateInterface(interfaceData: {
    id: number;
    title: string;
    catid: number;
    path: string;
    method: string;
    status?: string;
    req_body_type?: string;
    res_body_type?: string;
    res_body?: string;
    req_body_form?: any[];
    req_params?: any[];
    req_headers?: any[];
    req_query?: any[];
    desc?: string;
  }): Promise<any> {
    return this.requestPost<any>('/api/interface/up', interfaceData);
  }

  /**
   * 新增接口
   */
  async addInterface(interfaceData: {
    title: string;
    catid: number;
    path: string;
    method: string;
    status?: string;
    req_body_type?: string;
    res_body_type?: string;
    res_body?: string;
    req_body_form?: any[];
    req_params?: any[];
    req_headers?: any[];
    req_query?: any[];
    desc?: string;
  }): Promise<any> {
    return this.requestPost<any>('/api/interface/add', interfaceData);
  }

  /**
   * 导入数据
   */
  async importData(type: string, merge: string = 'normal', json?: string, url?: string): Promise<any> {
    const params: any = {
      type,
      merge,
    };
    if (json) {
      params.json = json;
    }
    if (url) {
      params.url = url;
    }
    return this.requestPostForm<any>('/api/open/import_data', params);
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
