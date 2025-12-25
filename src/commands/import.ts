import { existsSync } from 'fs';
import { join } from 'path';
import { loadConfig, getRepoRoot } from '../config';
import { logger } from '../logger';
import {
  verifyBundle,
  pullBaseBranch,
  getCurrentBranch,
  branchExists,
  fetchBundleBranch,
  checkoutBranch,
  deleteBranch,
  getLocalChangesStatus,
  stashLocalChanges,
} from '../utils/git';
import {
  createTempDir,
  removeTempDir,
  extractBundleArchive,
  readMetadataFile,
  getBundlePath,
} from '../utils/archive';
import { ImportOptions } from '../types';

export const importCommand = async (archivePath: string | undefined, options: ImportOptions = {}): Promise<void> => {
  const config = loadConfig();
  const repoRoot = getRepoRoot();

  const finalArchivePath = archivePath || join(repoRoot, '.git', 'wip-archives', config.archive_name);

  if (!existsSync(finalArchivePath)) {
    logger.error(`Archive not found: ${finalArchivePath}`);
    process.exit(1);
  }

  const tempDir = createTempDir();

  try {
    logger.info(`Extracting archive: ${finalArchivePath}`);
    await extractBundleArchive(finalArchivePath, tempDir);

    const metadata = readMetadataFile(tempDir);
    const bundlePath = getBundlePath(tempDir);

    logger.info(`Verifying bundle: ${bundlePath}`);
    if (!verifyBundle(bundlePath)) {
      logger.error('Bundle verification failed');
      process.exit(1);
    }

    logger.info(`Importing branch: ${metadata.featureBranch} from base: ${metadata.baseBranch}`);

    const localChanges = getLocalChangesStatus();
    const currentBranch = getCurrentBranch();

    if (localChanges.hasUncommittedChanges || localChanges.hasUntrackedFiles) {
      if (!options.force && !options.stashLocalChanges) {
        logger.error('You have local changes. Use --force to overwrite or --stash to save them.');
        logger.info('Local changes detected:');
        if (localChanges.hasUncommittedChanges) {
          logger.info('  - Uncommitted changes in tracked files');
        }
        if (localChanges.hasUntrackedFiles) {
          logger.info('  - Untracked files');
        }
        process.exit(1);
      }

      if (options.stashLocalChanges) {
        logger.info('Stashing local changes');
        stashLocalChanges();
      }
    }

    logger.info(`Pulling/updating base branch: ${metadata.baseBranch}`);
    pullBaseBranch(metadata.baseBranch);

    if (branchExists(metadata.featureBranch)) {
      if (currentBranch === metadata.featureBranch) {
        logger.info(`Switching to base branch temporarily`);
        checkoutBranch(metadata.baseBranch);
      }
      logger.info(`Removing existing branch: ${metadata.featureBranch}`);
      deleteBranch(metadata.featureBranch);
    }

    logger.info(`Fetching bundle to branch: ${metadata.featureBranch}`);
    fetchBundleBranch(bundlePath, metadata.featureBranch);

    logger.info(`Checking out branch: ${metadata.featureBranch}`);
    checkoutBranch(metadata.featureBranch);

    logger.info(`Successfully imported branch: ${metadata.featureBranch}`);
    logger.info(`Created at: ${metadata.createdAt}`);
    if (metadata.commitRange) {
      logger.info(`Commit range: ${metadata.commitRange}`);
    }
  } finally {
    removeTempDir(tempDir);
  }
};

