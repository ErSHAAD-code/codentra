import { BadRequestException } from '@nestjs/common';
import path from 'path';

export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024; // 50MB — configurable via env in Phase 7

const ALLOWED_ARCHIVE_EXTENSIONS = new Set(['.zip']);
const ALLOWED_SOURCE_EXTENSIONS = new Set([
  '.py', '.java', '.js', '.jsx', '.ts', '.tsx', '.c', '.h', '.cpp', '.cc', '.hpp',
  '.go', '.rs', '.php', '.kt', '.swift', '.html', '.css', '.sql', '.json', '.yml', '.yaml', '.md',
]);

export function assertValidUpload(fileName: string, sizeBytes: number, kind: 'zip' | 'single-file'): void {
  if (sizeBytes > MAX_UPLOAD_SIZE_BYTES) {
    throw new BadRequestException(`File exceeds maximum upload size of ${MAX_UPLOAD_SIZE_BYTES / 1024 / 1024}MB`);
  }

  const extension = path.extname(fileName).toLowerCase();
  const allowed = kind === 'zip' ? ALLOWED_ARCHIVE_EXTENSIONS : ALLOWED_SOURCE_EXTENSIONS;

  if (!allowed.has(extension)) {
    throw new BadRequestException(`File type ${extension} is not supported`);
  }
}

/** Strips path traversal sequences and unsafe characters — prevents a
 * malicious filename like "../../etc/passwd" from escaping the upload dir. */
export function sanitizeFileName(fileName: string): string {
  const base = path.basename(fileName); // drops any directory components
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}
