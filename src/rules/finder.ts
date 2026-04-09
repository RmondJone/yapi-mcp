import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * 查找规则文件路径
 */
export function findRulesFiles(projectPath: string): { global: string[]; local: string[] } {
  // 全局规则目录
  const globalRulesDir = path.join(os.homedir(), '.claude', 'rules');

  // 本地规则目录
  const localRulesDir = path.join(projectPath, '.claude', 'rules');

  const globalRules: string[] = [];
  const localRules: string[] = [];

  // 读取全局规则
  if (fs.existsSync(globalRulesDir)) {
    const files = fs.readdirSync(globalRulesDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        globalRules.push(path.join(globalRulesDir, file));
      }
    }
  }

  // 读取本地规则
  if (fs.existsSync(localRulesDir)) {
    const files = fs.readdirSync(localRulesDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        localRules.push(path.join(localRulesDir, file));
      }
    }
  }

  return {
    global: globalRules,
    local: localRules,
  };
}

/**
 * 获取项目信息
 */
export function getProjectInfo() {
  const { getYapiConfig, findEnvFile } = require('../config/env');

  const envPath = findEnvFile();
  if (!envPath) {
    throw new Error('未找到 .env 配置文件');
  }

  const config = getYapiConfig();
  const rules = findRulesFiles(config.projectPath);

  // 获取项目名称（从 YAPI URL 或 env 所在目录推断）
  const projectName = path.basename(config.projectPath);

  return {
    project: {
      name: projectName,
      yapiUrl: config.url,
      envPath: envPath,
    },
    rules,
  };
}
