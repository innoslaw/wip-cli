export interface WipConfig {
  bundle_dir?: string;
  bundle_name?: string;
  base_branch?: string;
  telegram_bot_token?: string;
  telegram_chat_id?: string;
}

export interface GitStatus {
  branch: string;
  isWipCommit: boolean;
  lastCommitMessage: string;
}

