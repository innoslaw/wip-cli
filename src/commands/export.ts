import { join } from 'path';
import { loadConfig, getRepoRoot } from '../config';
import { logger } from '../logger';
import {
  getCurrentBranch,
  getCommitRange,
  createBundleFromRange,
  hasCommits,
} from '../utils/git';
import { sendBundleToTelegram } from '../utils/telegram';
import {
  createTempDir,
  removeTempDir,
  writeMetadataFile,
  createBundleArchive,
  getBundlePath,
} from '../utils/archive';
import { BundleMetadata } from '../types';

export const exportCommand = async (msg?: string): Promise<void> => {
  const config = loadConfig();
  const repoRoot = getRepoRoot();

  if (!hasCommits()) {
    logger.error('Repository must have at least one commit');
    process.exit(1);
  }

  const currentBranch = getCurrentBranch();

  if (currentBranch === config.base_branch) {
    logger.error('Cannot export from base branch. Switch to a feature branch first.');
    process.exit(1);
  }

  const tempDir = createTempDir();

  try {
    const commitRange = getCommitRange(config.base_branch, currentBranch);
    const bundlePath = getBundlePath(tempDir);

    logger.info(`Creating bundle for range: ${commitRange}`);
    createBundleFromRange(bundlePath, commitRange);

    const metadata: BundleMetadata = {
      featureBranch: currentBranch,
      baseBranch: config.base_branch,
      commitRange,
      createdAt: new Date().toISOString(),
    };

    logger.info('Writing metadata');
    writeMetadataFile(tempDir, metadata);

    const archiveDir = join(repoRoot, '.git', 'wip-archives');
    const archivePath = join(archiveDir, config.archive_name);
    logger.info(`Creating archive: ${archivePath}`);
    await createBundleArchive(tempDir, archivePath);

    await sendBundleToTelegram(config, archivePath, msg);

    logger.info(`Archive created and sent: ${archivePath}`);
    console.log(archivePath);
  } finally {
    removeTempDir(tempDir);
  }
};

