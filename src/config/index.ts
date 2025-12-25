import { readFileSync, existsSync } from 'fs';
import { join, dirname, parse } from 'path';
import { homedir } from 'os';
import { WipConfig } from '../types';
import { logger } from '../logger';

const DEFAULT_CONFIG: Required<WipConfig> = {
  bundle_dir: '.git/.wip',
  bundle_name: 'wip.bundle',
  base_branch: 'main',
  telegram_bot_token: '',
  telegram_chat_id: '',
  archive_name: 'wip-archive.tar.gz',
};

const findRepoRoot = (): string | null => {
  const root = parse(process.cwd()).root;

  const searchUp = (currentDir: string): string | null => {
    if (currentDir === root) {
      return null;
    }
    const gitDir = join(currentDir, '.git');
    if (existsSync(gitDir)) {
      return currentDir;
    }
    return searchUp(dirname(currentDir));
  };

  return searchUp(process.cwd());
};

const readConfigFile = (): Partial<WipConfig> => {
  const configPath = join(homedir(), '.wiprc');
  if (!existsSync(configPath)) {
    return {};
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    const lines = content.split('\n');
    const config: Partial<WipConfig> = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        const configKey = key.trim() as keyof WipConfig;
        if (configKey in DEFAULT_CONFIG) {
          config[configKey] = value as never;
        }
      }
    }

    return config;
  } catch (error) {
    logger.warn(`Failed to read .wiprc: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {};
  }
};

export const getRepoRoot = (): string => {
  const repoRoot = findRepoRoot();
  if (!repoRoot) {
    logger.error('Not a git repository');
    process.exit(1);
  }
  return repoRoot;
};

export const loadConfig = (): Required<WipConfig> => {
  const fileConfig = readConfigFile();
  return {
    ...DEFAULT_CONFIG,
    ...fileConfig,
  };
};

