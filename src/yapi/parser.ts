import type { YapiInterface, InterfaceDetail, SchemaDefinition, PropertySchema } from './types';

/**
 * 解析 YAPI 接口数据为 MCP 输出格式
 */
export function parseInterfaceDetail(interace: YapiInterface, categoryName: string = ''): InterfaceDetail {
  return {
    path: interace.path,
    method: interace.method.toUpperCase(),
    name: interace.title,
    category: categoryName,
    description: interace.description || '',
    reqBody: parseReqBody(interace),
    resBody: parseResBody(interace),
  };
}

/**
 * 解析请求体
 */
function parseReqBody(interace: YapiInterface): SchemaDefinition | null {
  const { req_body_type, req_body_other } = interace;

  if (!req_body_type || req_body_type === 'none') {
    return null;
  }

  if (req_body_type === 'json') {
    return parseJsonSchema(req_body_other || '{}');
  }

  if (req_body_type === 'raw') {
    return {
      type: 'string',
      description: req_body_other || '',
    } as SchemaDefinition;
  }

  return null;
}

/**
 * 解析响应体
 */
function parseResBody(interace: YapiInterface): SchemaDefinition | null {
  const { res_body_type, res_body } = interace;

  if (!res_body_type || res_body_type === 'none') {
    return null;
  }

  if (res_body_type === 'json') {
    return parseJsonSchema(res_body || '{}');
  }

  if (res_body_type === 'raw') {
    return {
      type: 'string',
      description: res_body || '',
    } as SchemaDefinition;
  }

  return null;
}

/**
 * 解析 JSON Schema
 */
function parseJsonSchema(schemaStr: string): SchemaDefinition {
  try {
    const parsed = JSON.parse(schemaStr);
    return convertToInterface(parsed);
  } catch {
    return {
      type: 'string',
      description: 'JSON 解析失败',
    } as SchemaDefinition;
  }
}

/**
 * 转换为接口定义格式
 */
function convertToInterface(schema: any): SchemaDefinition {
  if (!schema || typeof schema !== 'object') {
    return { type: 'string' };
  }

  const result: SchemaDefinition = {
    type: schema.type || 'object',
  };

  if (schema.properties) {
    result.properties = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      result.properties[key] = convertProperty(value as any);
    }
  }

  if (schema.required && Array.isArray(schema.required)) {
    result.required = schema.required;
  }

  if (schema.items) {
    result.items = convertToInterface(schema.items);
  }

  return result;
}

/**
 * 转换属性定义
 */
function convertProperty(prop: any): PropertySchema {
  if (!prop || typeof prop !== 'object') {
    return { type: 'string' };
  }

  const result: PropertySchema = {
    type: prop.type || 'string',
  };

  if (prop.description) {
    result.description = prop.description;
  }

  if (prop.example !== undefined) {
    result.example = prop.example;
  }

  if (prop.items) {
    result.items = convertToInterface(prop.items);
  }

  if (prop.properties) {
    result.properties = {};
    for (const [key, value] of Object.entries(prop.properties)) {
      result.properties[key] = convertProperty(value as any);
    }
  }

  return result;
}