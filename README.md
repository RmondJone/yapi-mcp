# YAPI MCP

<div align="center">

[![npm version](https://img.shields.io/npm/v/@rmondjone/yapi-mcp.svg)](https://www.npmjs.com/package/@rmondjone/yapi-mcp)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![MCP Protocol](https://img.shields.io/badge/MCP-1.0+-00aa00?style=flat&logo=robot)](https://modelcontextprotocol.io)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

一个用于将 YAPI 接口定义无缝集成到 AI 编码工作流的 MCP (Model Context Protocol) 工具。

</div>

## ✨ 特性亮点

| 特性 | 描述 |
|------|------|
| 🔍 **智能搜索** | 通过关键字快速检索 YAPI 接口，支持模糊匹配 |
| 📍 **路径精确定位** | 根据接口路径获取完整接口定义和参数详情 |
| 📂 **分类管理** | 获取项目接口分类树，按模块浏览接口 |
| 🔗 **规则文件集成** | 自动发现并返回 Claude Code 规则文件路径 |
| ⚙️ **零配置接入** | 自动读取项目 `.env` 文件，无需手动配置 |

## 🏗️ 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                        Claude Code                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       YAPI MCP Server                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Config    │  │    YAPI     │  │   Rules    │              │
│  │   Loader    │  │   Client    │  │   Finder   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        YAPI Server                               │
│                   (https://yapi.xxxxxx.com)                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 快速开始

### 安装

```bash
# 使用 npx 直接运行（推荐）
claude mcp add --scope user yapi-mcp -- npx -y @rmondjone/yapi-mcp

# 或在 mcp.json 中手动配置
```

<details>
<summary><strong>手动配置 (展开查看)</strong></summary>

```json
{
  "mcpServers": {
    "yapi-mcp": {
      "command": "npx",
      "args": ["-y", "@rmondjone/yapi-mcp"]
    }
  }
}
```

</details>

### 配置 YAPI 连接

在你的项目根目录创建 `.env` 文件：

```bash
# YAPI 配置
YAPI_URL=https://yapi.xxxxxx.com
YAPI_TOKEN=your_token_here
```

**如何获取 Token：**
1. 登录 YAPI
2. 进入项目设置 → **配置Token**
3. 复制生成的 Token

## 📖 使用指南

### MCP 工具

| 工具 | 参数 | 说明 |
|------|------|------|
| `search_interfaces` | `keyword: string` | 根据关键字搜索接口 |
| `get_interface_by_path` | `path: string` | 根据路径获取接口详情 |
| `get_project_categories` | - | 获取项目接口分类 |
| `get_category_interfaces` | `categoryId: number` | 获取分类下接口列表 |
| `get_project_info` | - | 获取项目信息和规则路径 |

### 使用示例

```
# 搜索用户相关接口
调用 search_interfaces，keyword="用户"

# 获取登录接口详情
调用 get_interface_by_path，path="/api/user/login"

# 获取项目信息（含规则文件）
调用 get_project_info
```

## 📋 输出格式

### 接口定义

```json
{
  "path": "/api/user/login",
  "method": "POST",
  "name": "用户登录",
  "category": "用户管理",
  "description": "用户登录接口",
  "reqBody": {
    "type": "object",
    "properties": {
      "username": { "type": "string", "description": "用户名" },
      "password": { "type": "string", "description": "密码" }
    },
    "required": ["username", "password"]
  },
  "resBody": {
    "type": "object",
    "properties": {
      "token": { "type": "string" },
      "userId": { "type": "string" }
    }
  }
}
```

### 项目信息

```json
{
  "project": {
    "name": "my-project",
    "yapiUrl": "https://yapi.xxxxxx.com",
    "envPath": "/path/to/project/.env"
  },
  "rules": {
    "global": [
      "~/.claude/rules/flutter/network.md",
      "~/.claude/rules/flutter/code.md"
    ],
    "local": [
      "/path/to/project/.claude/rules/react/network.md"
    ]
  }
}
```

## 🔄 工作流程

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ MCP 初始化   │ ──▶ │  用户调用工具  │ ──▶ │ LLM 生成代码  │
│ 自动发现配置  │     │ 返回接口/规则  │     │ 遵循规则文件  │
└──────────────┘     └──────────────┘     └──────────────┘
```

1. **MCP 初始化** → 自动发现项目 `.env` 配置
2. **调用工具** → 返回接口 JSON 或规则文件路径
3. **AI 生成** → 用户侧 LLM 读取规则，生成符合规范的代码

## 🛠️ 技术栈

<div align="center">

| 技术 | 用途 |
|------|------|
| TypeScript | 开发语言 |
| Node.js | 运行时 |
| @modelcontextprotocol/sdk | MCP 协议实现 |

</div>

## 📁 项目结构

```
yapi-mcp/
├── src/
│   ├── config/          # 配置加载
│   │   ├── env.ts       # 环境变量解析
│   │   └── index.ts     # 配置导出
│   ├── yapi/            # YAPI 客户端
│   │   ├── client.ts    # API 请求封装
│   │   ├── parser.ts    # 数据解析
│   │   └── types.ts     # 类型定义
│   ├── rules/           # 规则文件
│   │   └── finder.ts    # 规则路径发现
│   └── index.ts         # MCP 服务器入口
├── package.json
├── tsconfig.json
└── README.md
```

## 🤝 贡献

欢迎提交 Issue 和 PR！

## 📄 许可证

MIT License
