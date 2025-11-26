import { logger } from '../logger';
import { getGitStatus, resetSoftHead, getStatus } from '../utils/git';

export const cleanCommand = (): void => {
  const status = getGitStatus();

  if (!status.isWipCommit) {
    logger.error('Last commit is not a WIP commit');
    process.exit(1);
  }

  logger.info('Removing WIP commit');
  resetSoftHead();

  logger.info('Current status:');
  console.log(getStatus());
};

