// 接口列表项
export interface YapiInterface {
  _id: number;
  path: string;
  method: string;
  title: string;
  catid: number;
  description: string;
  req_body_type: string;
  req_body_other?: string;
  res_body_type: string;
  res_body?: string;
  status: string;
}

// 接口分类
export interface YapiCategory {
  _id: number;
  name: string;
  parent_id: number;
  description?: string;
}

// 项目菜单（包含分类和接口）
export interface YapiMenu {
  name: string;
  id: number;
  parent_id: number;
  type: string;
  list?: YapiInterface[];
}

// 搜索结果
export interface YapiSearchResult {
  list: YapiInterface[];
  total: number;
}

// MCP 输出格式 - 接口详情
export interface InterfaceDetail {
  path: string;
  method: string;
  name: string;
  category: string;
  description: string;
  reqBody: SchemaDefinition | null;
  resBody: SchemaDefinition | null;
}

// JSON Schema 风格的定义
export interface SchemaDefinition {
  type: string;
  properties?: Record<string, PropertySchema>;
  required?: string[];
  items?: SchemaDefinition;
  $ref?: string;
}

export interface PropertySchema {
  type: string;
  description?: string;
  example?: any;
  items?: SchemaDefinition;
  properties?: Record<string, PropertySchema>;
}

// MCP 输出格式 - 项目信息
export interface ProjectInfo {
  project: {
    name: string;
    yapiUrl: string;
    envPath: string;
  };
  rules: {
    global: string[];
    local: string[];
  };
}

// MCP 输出格式 - 分类列表
export interface CategoryInfo {
  id: number;
  name: string;
  parentId: number;
  description?: string;
}