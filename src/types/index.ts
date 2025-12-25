export interface WipConfig {
  base_branch?: string;
  telegram_bot_token?: string;
  telegram_chat_id?: string;
  archive_name?: string;
}

export interface GitStatus {
  branch: string;
  isWipCommit: boolean;
  lastCommitMessage: string;
}

export interface BundleMetadata {
  featureBranch: string;
  baseBranch: string;
  commitRange?: string;
  createdAt: string;
  author?: string;
}

export interface ArchiveContent {
  bundle: Buffer;
  metadata: BundleMetadata;
}

export interface ImportOptions {
  force?: boolean;
  stashLocalChanges?: boolean;
}

