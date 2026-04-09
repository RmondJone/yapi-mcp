#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { getYapiClient } from './yapi/client.js';
import { getProjectInfo } from './rules/finder.js';

// 工具定义
const tools = [
  {
    name: 'get_project_info',
    description: '获取项目信息（包含规则文件路径）',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_project_detail',
    description: '获取项目详细信息（从 YAPI 获取项目基本信息）',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_cat_menu',
    description: '获取菜单列表（项目分类列表）',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_interface_detail',
    description: '获取接口详情（根据接口 ID 获取完整接口信息）',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'number',
          description: '接口 ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_category_interfaces',
    description: '获取指定分类下的接口列表',
    inputSchema: {
      type: 'object' as const,
      properties: {
        catid: {
          type: 'number',
          description: '分类 ID',
        },
        page: {
          type: 'number',
          description: '页码，默认 1',
        },
        limit: {
          type: 'number',
          description: '每页数量，默认 10',
        },
      },
      required: ['catid'],
    },
  },
  {
    name: 'get_interface_menu',
    description: '获取接口菜单列表（包含分类及其下的接口）',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_interface_list',
    description: '获取接口列表数据（项目下所有接口的简单信息）',
    inputSchema: {
      type: 'object' as const,
      properties: {
        page: {
          type: 'number',
          description: '页码，默认 1',
        },
        limit: {
          type: 'number',
          description: '每页数量，默认 10',
        },
      },
    },
  },
  {
    name: 'add_category',
    description: '新增接口分类',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: '分类名称',
        },
        desc: {
          type: 'string',
          description: '分类描述（可选）',
        },
        project_id: {
          type: 'string',
          description: '项目 ID（可选，默认使用配置中的项目 ID）',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'add_interface',
    description: '新增接口',
    inputSchema: {
      type: 'object' as const,
      properties: {
        title: {
          type: 'string',
          description: '接口标题',
        },
        catid: {
          type: 'number',
          description: '分类 ID',
        },
        path: {
          type: 'string',
          description: '请求路径',
        },
        method: {
          type: 'string',
          description: '请求方法（GET/POST/PUT/DELETE 等）',
        },
        status: {
          type: 'string',
          description: '接口状态（done/undone），默认 undone',
        },
        req_body_type: {
          type: 'string',
          description: '请求数据类型（raw/form/json）',
        },
        res_body_type: {
          type: 'string',
          description: '返回数据类型（json/raw）',
        },
        res_body: {
          type: 'string',
          description: '返回数据内容（JSON 字符串）',
        },
        desc: {
          type: 'string',
          description: '接口描述',
        },
      },
      required: ['title', 'catid', 'path', 'method'],
    },
  },
  {
    name: 'save_interface',
    description: '新增或更新接口（根据是否传入 id 判断是新增还是更新）',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'number',
          description: '接口 ID（存在则更新，不存在则新增）',
        },
        title: {
          type: 'string',
          description: '接口标题',
        },
        catid: {
          type: 'number',
          description: '分类 ID',
        },
        path: {
          type: 'string',
          description: '请求路径',
        },
        method: {
          type: 'string',
          description: '请求方法（GET/POST/PUT/DELETE 等）',
        },
        status: {
          type: 'string',
          description: '接口状态（done/undone）',
        },
        req_body_type: {
          type: 'string',
          description: '请求数据类型（raw/form/json）',
        },
        res_body_type: {
          type: 'string',
          description: '返回数据类型（json/raw）',
        },
        res_body: {
          type: 'string',
          description: '返回数据内容（JSON 字符串）',
        },
        desc: {
          type: 'string',
          description: '接口描述',
        },
      },
      required: ['title', 'catid', 'path', 'method'],
    },
  },
  {
    name: 'update_interface',
    description: '更新接口（根据 id 更新已有接口）',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'number',
          description: '接口 ID',
        },
        title: {
          type: 'string',
          description: '接口标题',
        },
        catid: {
          type: 'number',
          description: '分类 ID',
        },
        path: {
          type: 'string',
          description: '请求路径',
        },
        method: {
          type: 'string',
          description: '请求方法（GET/POST/PUT/DELETE 等）',
        },
        status: {
          type: 'string',
          description: '接口状态（done/undone）',
        },
        req_body_type: {
          type: 'string',
          description: '请求数据类型（raw/form/json）',
        },
        res_body_type: {
          type: 'string',
          description: '返回数据类型（json/raw）',
        },
        res_body: {
          type: 'string',
          description: '返回数据内容（JSON 字符串）',
        },
        desc: {
          type: 'string',
          description: '接口描述',
        },
      },
      required: ['id', 'title', 'catid', 'path', 'method'],
    },
  },
  {
    name: 'import_data',
    description: '导入数据（从 URL 或 JSON 导入 Swagger/Postman 数据）',
    inputSchema: {
      type: 'object' as const,
      properties: {
        type: {
          type: 'string',
          description: '导入方式，如 swagger、postman、har 等',
        },
        merge: {
          type: 'string',
          description: '数据同步方式：normal(普通模式)、good(智能合并)、merge(完全覆盖)，默认 normal',
        },
        json: {
          type: 'string',
          description: 'JSON 数据（序列化后的字符串）',
        },
        url: {
          type: 'string',
          description: '导入数据 URL',
        },
      },
      required: ['type'],
    },
  },
  {
    name: 'search_interface',
    description: '搜索接口（根据接口标题/路径/方法模糊搜索）',
    inputSchema: {
      type: 'object' as const,
      properties: {
        keyword: {
          type: 'string',
          description: '搜索关键词（支持接口标题、路径、方法模糊匹配）',
        },
        page: {
          type: 'number',
          description: '页码，默认 1',
        },
        limit: {
          type: 'number',
          description: '每页数量，默认 20',
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'get_interface_by_path',
    description: '根据路径精确查找接口（输入完整路径如 /api/user/info 精确匹配）',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: '接口路径（如 /api/user/info）',
        },
        method: {
          type: 'string',
          description: '请求方法（GET/POST/PUT/DELETE，可选，不区分大小写）',
        },
      },
      required: ['path'],
    },
  },
];

// 工具处理函数
async function handleGetProjectInfo(): Promise<string> {
  const info = getProjectInfo();
  return JSON.stringify(info, null, 2);
}

async function handleGetProjectDetail(): Promise<string> {
  const client = getYapiClient();
  const data = await client.getProjectInfo();
  return JSON.stringify(data, null, 2);
}

async function handleGetCatMenu(): Promise<string> {
  const client = getYapiClient();
  const data = await client.getCatMenu();
  return JSON.stringify(data, null, 2);
}

async function handleGetInterfaceDetail(args: any): Promise<string> {
  const { id } = args;
  const client = getYapiClient();
  const data = await client.getInterfaceDetail(id);
  return JSON.stringify(data, null, 2);
}

async function handleGetCategoryInterfaces(args: any): Promise<string> {
  const { catid, page = 1, limit = 10 } = args;
  const client = getYapiClient();
  const data = await client.getCategoryInterfaces(catid, page, limit);
  return JSON.stringify(data, null, 2);
}

async function handleGetInterfaceMenu(): Promise<string> {
  const client = getYapiClient();
  const data = await client.getMenu();
  return JSON.stringify(data, null, 2);
}

async function handleGetInterfaceList(args: any): Promise<string> {
  const { page = 1, limit = 10 } = args;
  const client = getYapiClient();
  const data = await client.getInterfaceList(page, limit);
  return JSON.stringify(data, null, 2);
}

async function handleAddCategory(args: any): Promise<string> {
  const { name, desc, project_id } = args;
  const client = getYapiClient();
  const data = await client.addCategory(name, desc, project_id);
  return JSON.stringify(data, null, 2);
}

async function handleAddInterface(args: any): Promise<string> {
  const client = getYapiClient();
  const data = await client.addInterface(args);
  return JSON.stringify(data, null, 2);
}

async function handleSaveInterface(args: any): Promise<string> {
  const client = getYapiClient();
  const data = await client.saveInterface(args);
  return JSON.stringify(data, null, 2);
}

async function handleUpdateInterface(args: any): Promise<string> {
  const client = getYapiClient();
  const data = await client.updateInterface(args);
  return JSON.stringify(data, null, 2);
}

async function handleImportData(args: any): Promise<string> {
  const { type, merge = 'normal', json, url } = args;
  const client = getYapiClient();
  const data = await client.importData(type, merge, json, url);
  return JSON.stringify(data, null, 2);
}

async function handleSearchInterface(args: any): Promise<string> {
  const { keyword } = args;
  const client = getYapiClient();

  // 获取所有接口菜单
  const menuData = await client.getMenu();

  // 在本地筛选匹配的接口
  const matchedInterfaces: Array<{
    id: number;
    title: string;
    path: string;
    method: string;
    status: string;
    catid: number;
    category: string;
  }> = [];

  const lowerKeyword = keyword.toLowerCase();

  for (const category of menuData) {
    const list = category.list || [];
    for (const iface of list) {
      const title = (iface.title || '').toLowerCase();
      const path = (iface.path || '').toLowerCase();
      const method = (iface.method || '').toLowerCase();

      // 匹配标题、路径或方法
      if (
        title.includes(lowerKeyword) ||
        path.includes(lowerKeyword) ||
        method.includes(lowerKeyword)
      ) {
        matchedInterfaces.push({
          id: iface._id,
          title: iface.title,
          path: iface.path,
          method: iface.method,
          status: iface.status,
          catid: iface.catid,
          category: category.name,
        });
      }
    }
  }

  return JSON.stringify(matchedInterfaces, null, 2);
}

async function handleGetInterfaceByPath(args: any): Promise<string> {
  const { path, method } = args;
  const client = getYapiClient();

  // 获取所有接口菜单
  const menuData = await client.getMenu();

  // 标准化输入路径
  const normalizedPath = path.toLowerCase();
  const normalizedMethod = method ? method.toUpperCase() : null;

  // 精确匹配
  const matchedInterfaces: Array<{
    id: number;
    title: string;
    path: string;
    method: string;
    status: string;
    catid: number;
    category: string;
  }> = [];

  for (const category of menuData) {
    const list = category.list || [];
    for (const iface of list) {
      const ifacePath = (iface.path || '').toLowerCase();
      const ifaceMethod = (iface.method || '').toUpperCase();

      // 路径完全匹配
      let isMatch = ifacePath === normalizedPath;

      // 如果指定了方法，还需要方法匹配
      if (isMatch && normalizedMethod) {
        isMatch = ifaceMethod === normalizedMethod;
      }

      if (isMatch) {
        matchedInterfaces.push({
          id: iface._id,
          title: iface.title,
          path: iface.path,
          method: iface.method,
          status: iface.status,
          catid: iface.catid,
          category: category.name,
        });
      }
    }
  }

  return JSON.stringify(matchedInterfaces, null, 2);
}

// 创建服务器
const server = new Server(
  {
    name: 'yapi-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 处理工具列表请求
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// 处理工具调用请求
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const { name, arguments: args } = request.params;

  try {
    let result: string;

    switch (name) {
      case 'get_project_info':
        result = await handleGetProjectInfo();
        break;
      case 'get_project_detail':
        result = await handleGetProjectDetail();
        break;
      case 'get_cat_menu':
        result = await handleGetCatMenu();
        break;
      case 'get_interface_detail':
        result = await handleGetInterfaceDetail(args);
        break;
      case 'get_category_interfaces':
        result = await handleGetCategoryInterfaces(args);
        break;
      case 'get_interface_menu':
        result = await handleGetInterfaceMenu();
        break;
      case 'get_interface_list':
        result = await handleGetInterfaceList(args);
        break;
      case 'add_category':
        result = await handleAddCategory(args);
        break;
      case 'add_interface':
        result = await handleAddInterface(args);
        break;
      case 'save_interface':
        result = await handleSaveInterface(args);
        break;
      case 'update_interface':
        result = await handleUpdateInterface(args);
        break;
      case 'import_data':
        result = await handleImportData(args);
        break;
      case 'search_interface':
        result = await handleSearchInterface(args);
        break;
      case 'get_interface_by_path':
        result = await handleGetInterfaceByPath(args);
        break;
      default:
        throw new Error(`未知工具: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: error.message }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('YAPI MCP 服务器已启动');
}

main().catch((error) => {
  console.error('启动失败:', error);
  process.exit(1);
});