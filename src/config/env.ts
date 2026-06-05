import * as fs from 'fs';
import * as path from 'path';

export interface YapiConfig {
  url: string;
  token: string;
  projectId?: string;
  projectPath: string;
}

/**
 * 从指定目录向上递归查找 .env 文件
 * 找到第一个包含 YAPI_URL 和 YAPI_TOKEN 的 .env 即停止
 */
export function findEnvFile(startDir: string = process.cwd()): string | null {
  let currentDir = startDir;
  const rootDir = path.parse(currentDir).root;

  while (currentDir !== rootDir) {
    const envPath = path.join(currentDir, '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      if (content.includes('YAPI_URL') && content.includes('YAPI_TOKEN')) {
        return envPath;
      }
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

/**
 * 解析 .env 文件内容
 */
export function parseEnvFile(envPath: string): YapiConfig {
  const content = fs.readFileSync(envPath, 'utf-8');
  const lines = content.split('\n');

  let url = '';
  let token = '';
  let projectId = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || trimmed === '') continue;

    const [key, ...valueParts] = trimmed.split('=');
    if (!key || valueParts.length === 0) continue;

    const value = valueParts.join('=').trim();
    if (key === 'YAPI_URL') url = value;
    if (key === 'YAPI_TOKEN') token = value;
    if (key === 'YAPI_PROJECT_ID') projectId = value;
  }

  if (!url || !token) {
    throw new Error('.env 文件中缺少 YAPI_URL 或 YAPI_TOKEN 配置');
  }

  return {
    url: url.replace(/\/$/, ''), // 移除末尾斜杠
    token,
    projectId,
    projectPath: path.dirname(envPath),
  };
}

/**
 * 获取 YAPI 配置
 * @param projectDir 可选，指定项目根目录（优先从此目录向上查找 .env）
 *                   不传则依次从 process.cwd() 和 __dirname 向上查找
 */
export function getYapiConfig(projectDir?: string): YapiConfig {
  // 优先从调用方指定的工程目录查找
  if (projectDir) {
    const envPath = findEnvFile(projectDir);
    if (envPath) {
      return parseEnvFile(envPath);
    }
    throw new Error(
      `未在 "${projectDir}" 及其父目录中找到包含 YAPI_URL 和 YAPI_TOKEN 的 .env 文件`
    );
  }

  // 兜底：从 process.cwd() 和 __dirname 查找
  const envPath = findEnvFile(process.cwd()) ?? findEnvFile(__dirname);
  if (!envPath) {
    throw new Error(
      '未找到 .env 配置文件，请通过 projectDir 参数指定工程目录，或确保工程目录下存在包含 YAPI_URL 和 YAPI_TOKEN 的 .env 文件'
    );
  }
  return parseEnvFile(envPath);
}