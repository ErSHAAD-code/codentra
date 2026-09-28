export interface RepositoryProcessingJob {
  repositoryId: string;
  uploadId: string;
  storagePath?: string;
  archiveType: 'zip' | 'single-file' | 'github';
  github?: { url: string; token: string };
}

export interface AnalysisJob {
  analysisId: string;
  repositoryId: string;
}
