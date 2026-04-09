# YAPI MCP

一个用于获取 YAPI 接口定义的 MCP (Model Context Protocol) 工具。

## 功能特性

- **自动配置发现**：自动读取用户项目中的 `.env` 文件获取 YAPI 配置
- **接口搜索**：根据关键字搜索 YAPI 接口
- **路径获取详情**：根据接口路径获取完整接口定义
- **分类管理**：获取项目接口分类和分类下接口
- **规则文件路径**：返回 Claude Code 规则文件路径供用户侧 LLM 读取

## 安装

### 1. 安装依赖

```bash
npm install
```

### 2. 编译 TypeScript

```bash
npm run build
```

## 配置

### 添加 YAPI 配置

在你的项目根目录创建 `.env` 文件，添加以下配置：

```bash
# YAPI 配置
YAPI_URL=https://yapi.xxxxxx.com
YAPI_TOKEN=your_token_here
```

- `YAPI_URL`：YAPI 服务器地址
- `YAPI_TOKEN`：YAPI 项目的访问令牌

### 获取 YAPI Token

1. 登录 YAPI
2. 进入项目设置
3. 点击"配置Token"，复制 Token

## 使用

### 启动 MCP 服务器

```bash
npm run start
```

或者直接运行：

```bash
node dist/index.js
```

### MCP 工具列表

| 工具名称 | 参数 | 描述 |
|---------|------|------|
| `search_interfaces` | `keyword: string` | 根据关键字搜索接口列表 |
| `get_interface_by_path` | `path: string` | 根据接口路径获取接口详情 |
| `get_project_categories` | 无 | 获取项目的接口分类列表 |
| `get_category_interfaces` | `categoryId: number` | 获取指定分类下的接口列表 |
| `get_project_info` | 无 | 获取项目信息（包含规则文件路径） |

## 在 Claude Code 中使用

### 配置 MCP

在 `settings.json` 中添加：

```json
{
  "mcpServers": {
    "yapi-mcp": {
      "command": "node",
      "args": ["/path/to/yapi-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

### 使用示例

```
# 搜索接口
调用 search_interfaces 工具，keyword="用户"

# 获取接口详情
调用 get_interface_by_path 工具，path="/api/user/login"

# 获取项目信息
调用 get_project_info 工具
```

## 输出格式

### 接口定义 JSON

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

### 项目信息 JSON

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

## 工作流程

1. MCP 初始化 → 自动发现用户项目 `.env`
2. 用户调用工具 → 返回接口 JSON 或规则路径
3. 用户侧 LLM 根据规则路径读取规则，生成对应代码

## 规则文件

MCP 会返回以下规则文件路径：

- **全局规则**：`~/.claude/rules/` 目录下的 `.md` 文件
- **本地规则**：`{项目目录}/.claude/rules/` 目录下的 `.md` 文件

用户侧 LLM 可根据这些路径读取规则文件，按照规则生成相应的接口代码。

## 技术栈

- TypeScript
- Node.js
- @modelcontextprotocol/sdk
