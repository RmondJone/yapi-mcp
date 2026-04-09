// 接口列表项
export interface YapiInterface {
  _id: number;
  project_id: number;
  catid: number;
  title: string;
  path: string;
  method: string;
  status: string;
  description?: string;  // 兼容旧字段
  desc?: string;         // 接口描述
  req_body_type?: string;
  req_body_other?: string;
  req_body_form?: Array<{
    name: string;
    type: string;
    example?: string;
    desc?: string;
    required: string;
  }>;
  req_params?: Array<{
    name: string;
    example?: string;
    desc?: string;
  }>;
  req_headers?: Array<{
    name: string;
    type?: string;
    value?: string;
    example?: string;
    desc?: string;
    required: string;
  }>;
  req_query?: Array<{
    name: string;
    type?: string;
    example?: string;
    desc?: string;
    required: string;
  }>;
  res_body_type?: string;
  res_body?: string;
  res_body_is_json_schema?: boolean;
  uid?: number;
  add_time?: number;
  up_time?: number;
  edit_uid?: number;
  query_path?: {
    path: string;
    params: any[];
  };
  type?: string;
  message?: string;
  switch_notice?: boolean;
}

// 接口分类
export interface YapiCategory {
  _id: number;
  name: string;
  project_id: number;
  desc?: string;
  uid?: number;
  add_time?: number;
  up_time?: number;
  list?: YapiInterface[];
}

// 项目菜单（包含分类和接口）
export interface YapiMenu {
  _id: number;
  name: string;
  project_id: number;
  desc?: string;
  uid?: number;
  add_time?: number;
  up_time?: number;
  list?: YapiInterface[];
}

// 项目信息
export interface YapiProject {
  _id: number;
  name: string;
  basepath?: string;
  project_type?: string;
  description?: string;
  uid?: number;
  add_time?: number;
  up_time?: number;
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

// 接口请求参数
export interface AddInterfaceParams {
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
}

// 接口请求参数 - 保存/更新
export interface SaveInterfaceParams extends AddInterfaceParams {
  id?: number;
}

// 新增分类参数
export interface AddCategoryParams {
  name: string;
  project_id?: string;
  desc?: string;
}

// 导入数据参数
export interface ImportDataParams {
  type: string;
  merge?: string;
  json?: string;
  url?: string;
}