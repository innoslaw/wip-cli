#!/usr/bin/env node

import { Command } from 'commander';
import { exportCommand, importCommand, cleanCommand } from './commands';

const program = new Command();

program
  .name('wip')
  .description('CLI utility for WIP commits and git bundles')
  .version('1.0.0');

program
  .command('export')
  .description('Create WIP commit and bundle, send to Telegram')
  .option('--msg <message>', 'Optional message for Telegram')
  .action((options) => {
    exportCommand(options.msg).catch((error) => {
      console.error('Export failed:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    });
  });

program
  .command('import')
  .description('Import bundle and create/overwrite WIP branch')
  .argument('[bundle-path]', 'Path to bundle file (optional)')
  .action((bundlePath) => {
    importCommand(bundlePath).catch((error) => {
      console.error('Import failed:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    });
  });

program
  .command('clean')
  .description('Remove WIP commit after review')
  .action(() => {
    cleanCommand();
  });

program.parse();

