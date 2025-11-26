import { existsSync, createReadStream } from 'fs';
import { request, RequestOptions } from 'https';
import FormData from 'form-data';
import { WipConfig } from '../types';
import { logger } from '../logger';

interface TelegramResponse {
  ok: boolean;
  description?: string;
}

const sendDocument = async (
  botToken: string,
  chatId: string,
  documentPath: string,
  caption?: string
): Promise<void> => {
  if (!existsSync(documentPath)) {
    throw new Error(`Bundle file not found: ${documentPath}`);
  }

  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('document', createReadStream(documentPath));
  if (caption) {
    form.append('caption', caption);
  }

  return new Promise((resolve, reject) => {
    const options: RequestOptions = {
      hostname: 'api.telegram.org',
      path: `/bot${botToken}/sendDocument`,
      method: 'POST',
      headers: form.getHeaders(),
    };

    const chunks: Buffer[] = [];
    const req = request(options, (res) => {
      res.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      res.on('end', () => {
        const data = chunks.map((chunk) => chunk.toString()).join('');
        if (res.statusCode === 200) {
          resolve();
        } else {
          try {
            const error: TelegramResponse = JSON.parse(data);
            reject(new Error(`Telegram API error: ${error.description || 'Unknown error'}`));
          } catch {
            reject(new Error(`Telegram API error: ${data || 'Unknown error'}`));
          }
        }
      });
    });

    req.on('error', (error: Error) => {
      reject(error);
    });

    form.pipe(req);
  });
};

export const sendBundleToTelegram = async (
  config: Required<WipConfig>,
  bundlePath: string,
  message?: string
): Promise<void> => {
  if (!config.telegram_bot_token || !config.telegram_chat_id) {
    logger.warn('Telegram credentials not configured, skipping upload');
    return;
  }

  try {
    await sendDocument(config.telegram_bot_token, config.telegram_chat_id, bundlePath, message);
    logger.info('Bundle sent to Telegram successfully');
  } catch (error) {
    logger.error(`Failed to send bundle to Telegram: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

