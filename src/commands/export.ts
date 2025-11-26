import { join } from 'path';
import { loadConfig, getRepoRoot } from '../config';
import { logger } from '../logger';
import {
  getGitStatus,
  resetSoftHead,
  addAll,
  commitWip,
  createBundle,
  hasCommits,
} from '../utils/git';
import { sendBundleToTelegram } from '../utils/telegram';

export const exportCommand = async (msg?: string): Promise<void> => {
  const config = loadConfig();
  const repoRoot = getRepoRoot();
  const status = getGitStatus();

  if (status.isWipCommit) {
    logger.info('Removing existing WIP commit');
    resetSoftHead();
  }

  logger.info('Staging all changes');
  addAll();

  logger.info('Creating WIP commit');
  commitWip();

  if (!hasCommits()) {
    logger.error('Branch must have at least one commit to create a bundle');
    process.exit(1);
  }

  const bundlePath = join(repoRoot, config.bundle_dir, config.bundle_name);
  logger.info(`Creating bundle at ${bundlePath}`);
  createBundle(bundlePath);

  await sendBundleToTelegram(config, bundlePath, msg);

  logger.info(`Bundle created: ${bundlePath}`);
  console.log(bundlePath);
};

