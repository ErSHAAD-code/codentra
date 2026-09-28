import { assertValidUpload, sanitizeFileName, MAX_UPLOAD_SIZE_BYTES } from '../upload-validation';
import { BadRequestException } from '@nestjs/common';

describe('upload-validation', () => {
  describe('assertValidUpload', () => {
    it('accepts a valid zip under the size limit', () => {
      expect(() => assertValidUpload('project.zip', 1024, 'zip')).not.toThrow();
    });

    it('rejects a file over the size limit', () => {
      expect(() => assertValidUpload('project.zip', MAX_UPLOAD_SIZE_BYTES + 1, 'zip')).toThrow(BadRequestException);
    });

    it('rejects a disallowed extension for zip uploads', () => {
      expect(() => assertValidUpload('malware.exe', 1024, 'zip')).toThrow(BadRequestException);
    });

    it('accepts a valid single-file source upload', () => {
      expect(() => assertValidUpload('main.py', 1024, 'single-file')).not.toThrow();
    });

    it('rejects a source file with an unsupported extension', () => {
      expect(() => assertValidUpload('binary.exe', 1024, 'single-file')).toThrow(BadRequestException);
    });

    it('is case-insensitive on extension matching', () => {
      expect(() => assertValidUpload('Project.ZIP', 1024, 'zip')).not.toThrow();
    });
  });

  describe('sanitizeFileName', () => {
    it('strips directory traversal sequences', () => {
      expect(sanitizeFileName('../../etc/passwd')).not.toContain('..');
      expect(sanitizeFileName('../../etc/passwd')).not.toContain('/');
    });

    it('replaces unsafe characters with underscores', () => {
      expect(sanitizeFileName('my file (final)!.zip')).toBe('my_file__final__.zip');
    });

    it('leaves a clean filename unchanged', () => {
      expect(sanitizeFileName('project-v2.zip')).toBe('project-v2.zip');
    });

    it('drops any embedded path, keeping only the basename', () => {
      expect(sanitizeFileName('/var/tmp/evil/../../shell.zip')).toBe('shell.zip');
    });
  });
});
