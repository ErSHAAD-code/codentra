import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AgentChangeset, AgentFileChange, ChangeOperation } from './dto/agent-changeset.dto';

@Injectable()
export class AgentChangesetService {
  /** In-memory store: changesetId -> AgentChangeset */
  private readonly changesets = new Map<string, AgentChangeset>();

  createChangeset(
    id: string,
    userId: string,
    repoOwner: string,
    repoName: string,
    branch: string,
    task: string,
  ): AgentChangeset {
    const cs: AgentChangeset = {
      id,
      userId,
      repoOwner,
      repoName,
      branch,
      task,
      changes: [],
      createdAt: new Date().toISOString(),
      status: 'building',
    };
    this.changesets.set(id, cs);
    return cs;
  }

  getChangeset(id: string, userId: string): AgentChangeset {
    const cs = this.changesets.get(id);
    if (!cs) {
      throw new NotFoundException(`Changeset ${id} not found`);
    }
    if (cs.userId !== userId) {
      throw new UnauthorizedException('You do not have access to this changeset');
    }
    return cs;
  }

  addChange(
    changesetId: string,
    userId: string,
    path: string,
    operation: ChangeOperation,
    originalContent: string,
    proposedContent: string,
    reason: string,
  ): AgentFileChange {
    const cs = this.getChangeset(changesetId, userId);
    
    // Prevent path traversal
    const safePath = path.replace(/\\/g, '/').replace(/^\/+/, '');
    if (safePath.includes('..')) {
      throw new Error(`Invalid path traversal detected: ${path}`);
    }

    // Check if change already exists for this path in the changeset
    const existingIndex = cs.changes.findIndex((c) => c.path === safePath);
    const change: AgentFileChange = {
      id: `change-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      path: safePath,
      operation,
      originalContent,
      proposedContent,
      reason,
      decision: null,
    };

    if (existingIndex >= 0) {
      cs.changes[existingIndex] = change;
    } else {
      cs.changes.push(change);
    }

    return change;
  }

  updateChangeDecision(
    changesetId: string,
    userId: string,
    changeId: string,
    decision: 'accepted' | 'rejected',
  ): AgentFileChange {
    const cs = this.getChangeset(changesetId, userId);
    const change = cs.changes.find((c) => c.id === changeId);
    if (!change) {
      throw new NotFoundException(`Change ${changeId} not found in changeset`);
    }
    change.decision = decision;
    return change;
  }

  acceptAll(changesetId: string, userId: string): AgentChangeset {
    const cs = this.getChangeset(changesetId, userId);
    cs.changes.forEach((c) => (c.decision = 'accepted'));
    cs.status = 'applied';
    return cs;
  }

  rejectAll(changesetId: string, userId: string): AgentChangeset {
    const cs = this.getChangeset(changesetId, userId);
    cs.changes.forEach((c) => (c.decision = 'rejected'));
    cs.status = 'rejected';
    return cs;
  }

  markReady(changesetId: string, userId: string): AgentChangeset {
    const cs = this.getChangeset(changesetId, userId);
    if (cs.status === 'building') {
      cs.status = 'ready';
    }
    return cs;
  }
}
