import { join } from 'path';
import { existsSync } from 'fs';
import { loadConfig, getRepoRoot } from '../config';
import { logger } from '../logger';
import {
  verifyBundle,
  pullBaseBranch,
  getCurrentBranch,
  branchExists,
  forceBranchFromBase,
  fetchBundleBranch,
  checkoutBranchForce,
  getGitStatus,
  resetSoftHead,
  getStatusFiles,
  cleanUntrackedFiles,
} from '../utils/git';

export const importCommand = async (bundlePathArg?: string): Promise<void> => {
  const config = loadConfig();
  const repoRoot = getRepoRoot();
  const bundlePath = bundlePathArg || join(repoRoot, config.bundle_dir, config.bundle_name);

  if (!existsSync(bundlePath)) {
    logger.error(`Bundle not found: ${bundlePath}`);
    process.exit(1);
  }

  logger.info(`Verifying bundle: ${bundlePath}`);
  if (!verifyBundle(bundlePath)) {
    logger.error('Bundle verification failed');
    process.exit(1);
  }

  logger.info(`Pulling base branch: ${config.base_branch}`);
  pullBaseBranch(config.base_branch);

  const currentBranch = getCurrentBranch();
  const workingBranch = currentBranch !== config.base_branch ? currentBranch : 'wip';

  if (branchExists(workingBranch)) {
    logger.info(`Resetting branch ${workingBranch} from ${config.base_branch}`);
    forceBranchFromBase(workingBranch, config.base_branch);
  }

  logger.info(`Fetching bundle to branch ${workingBranch}`);
  fetchBundleBranch(bundlePath, workingBranch);

  logger.info('Cleaning untracked files to avoid conflicts');
  cleanUntrackedFiles();

  logger.info(`Checking out branch ${workingBranch}`);
  checkoutBranchForce(workingBranch);

  const status = getGitStatus();
  if (status.isWipCommit) {
    logger.info('Removing WIP commit, leaving changes uncommitted');
    resetSoftHead();
  }

  const changedFiles = getStatusFiles();
  if (changedFiles.length > 0) {
    logger.info('Changed files:');
    changedFiles.forEach((file) => console.log(`  ${file}`));
  } else {
    logger.info('No changes found');
  }
};

