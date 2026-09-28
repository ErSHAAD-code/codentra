/** Type of change the AI is proposing */
export type ChangeOperation = 'MODIFY' | 'CREATE' | 'DELETE';

/** A single proposed file change inside a changeset */
export interface AgentFileChange {
  /** Unique ID for this change */
  id: string;
  /** Repository-relative file path */
  path: string;
  /** Type of operation */
  operation: ChangeOperation;
  /** Original content (empty for CREATE) */
  originalContent: string;
  /** Proposed new content (empty for DELETE) */
  proposedContent: string;
  /** Human-readable explanation from the AI */
  reason: string;
  /** User decision — null means undecided */
  decision: 'accepted' | 'rejected' | null;
}

/** A complete changeset tied to one agent run */
export interface AgentChangeset {
  /** Changeset ID */
  id: string;
  /** Owner userId — enforced on all reads */
  userId: string;
  /** Repo context */
  repoOwner: string;
  repoName: string;
  branch: string;
  /** The task that generated this changeset */
  task: string;
  /** All proposed file changes */
  changes: AgentFileChange[];
  /** ISO timestamp */
  createdAt: string;
  /** Is the run that built this still streaming? */
  status: 'building' | 'ready' | 'applied' | 'rejected';
}

// ─── SSE Event Extensions ───────────────────────────────────────────────────

/** Phase 3 additions to the AgentToolEvent union */
export type AgentToolName3 =
  | 'propose_file_change'
  | 'propose_new_file'
  | 'propose_delete_file';

export interface ProposeFileChangeArgs {
  path: string;
  proposedContent: string;
  reason: string;
}

export interface ProposeNewFileArgs {
  path: string;
  content: string;
  reason: string;
}

export interface ProposeDeleteFileArgs {
  path: string;
  reason: string;
}

/** An SSE event for a proposed change */
export interface ChangeProposedEvent {
  type: 'change_proposed';
  change: AgentFileChange;
  changesetId: string;
}

/** Fired when all changes for this run are ready */
export interface ChangesetReadyEvent {
  type: 'changeset_ready';
  changesetId: string;
  totalChanges: number;
}
