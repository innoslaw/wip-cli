import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { GitStatus } from '../types';
import { logger } from '../logger';

export interface LocalChangesStatus {
  hasUncommittedChanges: boolean;
  hasUntrackedFiles: boolean;
}

const execGit = (command: string, cwd?: string): string => {
  try {
    return execSync(`git ${command}`, {
      cwd: cwd || process.cwd(),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Git command failed: ${message}`);
  }
};

export const getCurrentBranch = (): string => {
  return execGit('rev-parse --abbrev-ref HEAD');
};

export const getLastCommitMessage = (): string => {
  return execGit('log -1 --pretty=%B');
};

export const isWipCommit = (message: string): boolean => {
  return message.trim() === 'WIP';
};

export const getGitStatus = (): GitStatus => {
  const branch = getCurrentBranch();
  const lastCommitMessage = getLastCommitMessage();

  return {
    branch,
    isWipCommit: isWipCommit(lastCommitMessage),
    lastCommitMessage,
  };
};

export const resetSoftHead = (): void => {
  execGit('reset --soft HEAD~1');
};

export const addAll = (): void => {
  execGit('add .');
};

export const commitWip = (): void => {
  execGit('commit -m "WIP"');
};

export const createBundle = (bundlePath: string): void => {
  const dir = dirname(bundlePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  execGit(`bundle create "${bundlePath}" HEAD`);
};

export const verifyBundle = (bundlePath: string): boolean => {
  try {
    execGit(`bundle verify "${bundlePath}"`);
    
    return true;
  } catch {
    return false;
  }
};

export const pullBaseBranch = (baseBranch: string): void => {
  try {
    execGit(`pull origin ${baseBranch}`);
  } catch (error) {
    logger.warn(`Failed to pull ${baseBranch}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const branchExists = (branchName: string): boolean => {
  try {
    const branches = execGit('branch --list').split('\n');
    return branches.some((b) => b.trim().replace(/^\* /, '') === branchName);
  } catch {
    return false;
  }
};

export const forceBranchFromBase = (branchName: string, baseBranch: string): void => {
  try {
    execGit(`branch -f ${branchName} origin/${baseBranch}`);
  } catch {
    execGit(`branch -f ${branchName} ${baseBranch}`);
  }
};

export const fetchBundleBranch = (bundlePath: string, branchName: string): void => {
  execGit(`fetch "${bundlePath}" HEAD:${branchName}`);
};

export const checkoutBranch = (branchName: string): void => {
  execGit(`checkout ${branchName}`);
};

export const checkoutBranchForce = (branchName: string): void => {
  execGit(`checkout -f ${branchName}`);
};

export const cleanUntrackedFiles = (): void => {
  try {
    execGit('clean -fd');
  } catch (error) {
    logger.warn(`Failed to clean untracked files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getStatusFiles = (): string[] => {
  try {
    const status = execGit('status --porcelain');
    return status
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => line.trim().substring(3));
  } catch {
    return [];
  }
};

export const getStatus = (): string => {
  return execGit('status');
};

export const hasCommits = (): boolean => {
  try {
    execGit('rev-parse HEAD');
    return true;
  } catch {
    return false;
  }
};

export const getLocalChangesStatus = (): LocalChangesStatus => {
  const status = execGit('status --porcelain');
  const lines = status.split('\n').filter((line) => line.trim());

  return {
    hasUncommittedChanges: lines.some((line) => line.startsWith('M ') || line.startsWith('A ') || line.startsWith('D ') || line.startsWith('R ') || line.startsWith('C ')),
    hasUntrackedFiles: lines.some((line) => line.startsWith('?? ')),
  };
};

export const stashLocalChanges = (): void => {
  const timestamp = new Date().toISOString();
  execGit(`stash push -u -m "wip-cli: temporary stash before import ${timestamp}"`);
};

export const hasStash = (): boolean => {
  try {
    const stashList = execGit('stash list');
    return stashList.trim().length > 0;
  } catch {
    return false;
  }
};

export const getCommitRange = (baseBranch: string, featureBranch: string): string => {
  return `${baseBranch}..${featureBranch}`;
};

export const createBundleFromRange = (bundlePath: string, commitRange: string): void => {
  const dir = dirname(bundlePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  execGit(`bundle create "${bundlePath}" ${commitRange}`);
};

export const deleteBranch = (branchName: string): void => {
  try {
    execGit(`branch -D ${branchName}`);
  } catch (error) {
    logger.warn(`Failed to delete branch ${branchName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
