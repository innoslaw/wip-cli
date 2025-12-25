#!/usr/bin/env node

import { Command } from 'commander';
import { exportCommand, importCommand } from './commands';

const program = new Command();

program
  .name('wip')
  .description('CLI utility for sharing git branches with full history via archives')
  .version('1.0.0');

program
  .command('export')
  .description('Create archive with git bundle and metadata, send to Telegram')
  .option('--msg <message>', 'Optional message for Telegram')
  .action((options) => {
    exportCommand(options.msg).catch((error) => {
      console.error('Export failed:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    });
  });

program
  .command('import')
  .description('Import archive and create/overwrite feature branch')
  .argument('[archive-path]', 'Path to archive file (searches in .git/wip-archives/ if not specified)')
  .option('--force', 'Force import even with local changes')
  .option('--stash', 'Stash local changes before import')
  .action((archivePath, options) => {
    importCommand(archivePath, { force: options.force, stashLocalChanges: options.stash }).catch((error) => {
      console.error('Import failed:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    });
  });


program.parse();

