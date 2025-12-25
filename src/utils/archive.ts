import { readFileSync, writeFileSync, mkdtempSync, rmSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { create, extract } from 'tar';
import { BundleMetadata } from '../types';


export const createTempDir = (): string => mkdtempSync(join(tmpdir(), 'wip-'));

export const removeTempDir = (tempDir: string): void => {
  rmSync(tempDir, { recursive: true, force: true });
};

export const writeMetadataFile = (tempDir: string, metadata: BundleMetadata): void => {
  const metadataPath = join(tempDir, 'metadata.json');
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
};

export const readMetadataFile = (tempDir: string): BundleMetadata => {
  const metadataPath = join(tempDir, 'metadata.json');
  const content = readFileSync(metadataPath, 'utf-8');
  const parsed = JSON.parse(content);

  if (
    typeof parsed !== 'object' ||
    typeof parsed.featureBranch !== 'string' ||
    typeof parsed.baseBranch !== 'string' ||
    typeof parsed.createdAt !== 'string'
  ) {
    throw new Error('Invalid metadata format');
  }

  return {
    featureBranch: parsed.featureBranch,
    baseBranch: parsed.baseBranch,
    commitRange: typeof parsed.commitRange === 'string' ? parsed.commitRange : undefined,
    createdAt: parsed.createdAt,
    author: typeof parsed.author === 'string' ? parsed.author : undefined,
  };
};

export const createBundleArchive = async (tempDir: string, archivePath: string): Promise<void> => {
  const dir = dirname(archivePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  await create({
    file: archivePath,
    cwd: tempDir,
    gzip: true
  }, ['bundle.gitbundle', 'metadata.json']);
};

export const extractBundleArchive = async (archivePath: string, tempDir: string): Promise<void> => {
  await extract({
    file: archivePath,
    cwd: tempDir
  });
};

export const getBundlePath = (tempDir: string): string =>
  join(tempDir, 'bundle.gitbundle');

export const getMetadataPath = (tempDir: string): string =>
  join(tempDir, 'metadata.json');
