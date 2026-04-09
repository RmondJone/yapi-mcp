#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { getYapiClient } from './yapi/client.js';
import { getProjectInfo } from './rules/finder.js';
import type { YapiInterface } from './yapi/types.js';

// 工具定义
const tools = [
  {
    name: 'search_interfaces',
    description: '根据关键字搜索 YAPI 接口列表',
    inputSchema: {
      type: 'object' as const,
      properties: {
        keyword: {
          type: 'string',
          description: '搜索关键字',
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'get_interface_by_path',
    description: '根据接口路径获取接口详情',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: '接口路径，如 /api/user/login',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'get_project_categories',
    description: '获取项目的接口分类列表',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_category_interfaces',
    description: '获取指定分类下的接口列表',
    inputSchema: {
      type: 'object' as const,
      properties: {
        categoryId: {
          type: 'number',
          description: '分类 ID',
        },
      },
      required: ['categoryId'],
    },
  },
  {
    name: 'get_project_info',
    description: '获取项目信息（包含规则文件路径）',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
];

// 工具处理函数
async function handleSearchInterfaces(args: any): Promise<string> {
  const { keyword } = args;
  const client = getYapiClient();
  const interfaces = await client.searchInterfaces(keyword);
  return JSON.stringify(interfaces, null, 2);
}

async function handleGetInterfaceByPath(args: any): Promise<string> {
  const { path: interfacePath } = args;
  const client = getYapiClient();

  // 搜索接口找到匹配的路径
  const interfaces = await client.searchInterfaces(interfacePath);
  const matched = interfaces.find((i: YapiInterface) => i.path === interfacePath);

  if (!matched) {
    return JSON.stringify({ error: '未找到接口' }, null, 2);
  }

  // 获取详情
  const detail = await client.getInterfaceDetail(matched._id);
  return JSON.stringify(detail, null, 2);
}

async function handleGetProjectCategories(): Promise<string> {
  const client = getYapiClient();
  const categories = await client.getCategories();
  return JSON.stringify(categories, null, 2);
}

async function handleGetCategoryInterfaces(args: any): Promise<string> {
  const { categoryId } = args;
  const client = getYapiClient();
  const interfaces = await client.getCategoryInterfaces(categoryId);
  return JSON.stringify(interfaces, null, 2);
}

async function handleGetProjectInfo(): Promise<string> {
  const info = getProjectInfo();
  return JSON.stringify(info, null, 2);
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
      case 'search_interfaces':
        result = await handleSearchInterfaces(args);
        break;
      case 'get_interface_by_path':
        result = await handleGetInterfaceByPath(args);
        break;
      case 'get_project_categories':
        result = await handleGetProjectCategories();
        break;
      case 'get_category_interfaces':
        result = await handleGetCategoryInterfaces(args);
        break;
      case 'get_project_info':
        result = await handleGetProjectInfo();
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