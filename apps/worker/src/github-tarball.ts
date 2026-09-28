import * as tar from 'tar';
import { Readable } from 'stream';

export interface ArchiveEntry {
  entryName: string;
  getData: () => Buffer;
}

/** Downloads a GitHub tarball and extracts it into the same entry shape
 * repository-processor.ts already consumes from adm-zip — this is what
 * keeps the parsing/storage logic identical regardless of upload source. */
export async function fetchGithubTarballEntries(url: string, token: string): Promise<ArchiveEntry[]> {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download GitHub tarball: ${response.status}`);
  }

  const entries: ArchiveEntry[] = [];
  const nodeStream = Readable.fromWeb(response.body as never);

  await new Promise<void>((resolve, reject) => {
    nodeStream
      .pipe(
        tar.t({
          onentry: (entry) => {
            const chunks: Buffer[] = [];
            entry.on('data', (chunk) => chunks.push(chunk));
            entry.on('end', () => {
              if (entry.type === 'File') {
                // GitHub tarballs nest everything under a "<repo>-<sha>/" prefix — strip it
                const path = entry.path.split('/').slice(1).join('/');
                entries.push({ entryName: path, getData: () => Buffer.concat(chunks) });
              }
            });
          },
        }),
      )
      .on('finish', resolve)
      .on('error', reject);
  });

  return entries;
}
