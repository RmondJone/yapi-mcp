import * as fs from 'fs';
import * as path from 'path';

export interface YapiConfig {
  url: string;
  token: string;
  projectPath: string;
}

/**
 * 从当前目录向上递归查找 .env 文件
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

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || trimmed === '') continue;

    const [key, ...valueParts] = trimmed.split('=');
    if (!key || valueParts.length === 0) continue;

    const value = valueParts.join('=').trim();
    if (key === 'YAPI_URL') url = value;
    if (key === 'YAPI_TOKEN') token = value;
  }

  if (!url || !token) {
    throw new Error('.env 文件中缺少 YAPI_URL 或 YAPI_TOKEN 配置');
  }

  return {
    url: url.replace(/\/$/, ''), // 移除末尾斜杠
    token,
    projectPath: path.dirname(envPath),
  };
}

/**
 * 获取 YAPI 配置
 */
export function getYapiConfig(): YapiConfig {
  const envPath = findEnvFile();
  if (!envPath) {
    throw new Error('未找到 .env 配置文件，请确保项目目录下存在包含 YAPI_URL 和 YAPI_TOKEN 的 .env 文件');
  }
  return parseEnvFile(envPath);
}