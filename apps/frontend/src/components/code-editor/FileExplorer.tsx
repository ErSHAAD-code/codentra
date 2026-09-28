'use client';

import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  FileImage,
  File,
  Search,
  Code2,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { GithubTreeNode } from '../github-explorer/types';
import { EditorTab } from './types';

interface FileExplorerProps {
  tree: GithubTreeNode[];
  onOpenFile: (path: string) => void;
  activePath?: string;
  tabs: EditorTab[];
  loading?: boolean;
}

interface TreeNodeItem {
  name: string;
  path: string;
  type: 'tree' | 'blob';
  size?: number;
  sha: string;
  children?: TreeNodeItem[];
}

export function FileExplorer({ tree, onOpenFile, activePath, tabs, loading }: FileExplorerProps) {
  const [filter, setFilter] = useState('');

  // Map dirty status per file path
  const dirtyPaths = useMemo(() => {
    const set = new Set<string>();
    tabs.forEach((t) => t.isDirty && set.add(t.path));
    return set;
  }, [tabs]);

  // Build nested folder tree structure
  const nestedTree = useMemo(() => {
    const root: TreeNodeItem[] = [];
    const map = new Map<string, TreeNodeItem>();

    const filteredTree = filter.trim()
      ? tree.filter((item) => item.path.toLowerCase().includes(filter.toLowerCase()))
      : tree;

    const sorted = [...filteredTree].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'tree' ? -1 : 1;
      return a.path.localeCompare(b.path);
    });

    sorted.forEach((item) => {
      const parts = item.path.split('/');
      const name = parts[parts.length - 1] ?? '';
      const node: TreeNodeItem = {
        name,
        path: item.path,
        type: item.type,
        size: item.size,
        sha: item.sha,
        ...(item.type === 'tree' ? { children: [] } : {}),
      };

      map.set(item.path, node);

      if (parts.length === 1) {
        root.push(node);
      } else {
        const parentPath = parts.slice(0, -1).join('/');
        const parent = map.get(parentPath);
        if (parent && parent.children) {
          parent.children.push(node);
        } else {
          root.push(node);
        }
      }
    });

    return root;
  }, [tree, filter]);

  return (
    <div className="flex h-full flex-col border-r border-border/60 bg-[#18181b] text-slate-300 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Explorer</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">{tree.length} files</span>
      </div>

      {/* Filter Input */}
      <div className="p-2 border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search files..."
            className="w-full rounded-md border border-slate-700 bg-slate-900/80 py-1 pl-8 pr-2 font-mono text-xs text-slate-200 placeholder:text-slate-500 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-0.5">
        {loading ? (
          <div className="p-4 text-center text-slate-500">Loading file tree...</div>
        ) : nestedTree.length > 0 ? (
          nestedTree.map((node) => (
            <ExplorerNode
              key={node.path}
              node={node}
              onOpenFile={onOpenFile}
              activePath={activePath}
              dirtyPaths={dirtyPaths}
            />
          ))
        ) : (
          <div className="p-4 text-center text-slate-500 text-[11px]">No files matching search</div>
        )}
      </div>
    </div>
  );
}

function ExplorerNode({
  node,
  onOpenFile,
  activePath,
  dirtyPaths,
  level = 0,
}: {
  node: TreeNodeItem;
  onOpenFile: (path: string) => void;
  activePath?: string;
  dirtyPaths: Set<string>;
  level?: number;
}) {
  const [open, setOpen] = useState(level < 1);

  const isDirectory = node.type === 'tree';
  const isActive = activePath === node.path;
  const isDirty = dirtyPaths.has(node.path);

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.json')) return <FileJson className="h-3.5 w-3.5 text-warning shrink-0" />;
    if (filename.match(/\.(png|jpg|jpeg|gif|svg|ico)$/i)) return <FileImage className="h-3.5 w-3.5 text-secondary shrink-0" />;
    if (filename.match(/\.(ts|tsx|js|jsx|py|rs|go|java|cpp|c|php)$/i))
      return <FileCode className="h-3.5 w-3.5 text-primary shrink-0" />;
    if (filename.match(/\.(md|txt)$/i)) return <FileText className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
    return <File className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (isDirectory) setOpen((o) => !o);
          else onOpenFile(node.path);
        }}
        style={{ paddingLeft: `${level * 12 + 6}px` }}
        className={`flex w-full items-center justify-between rounded-md py-1 pr-2 text-left transition-colors ${
          isActive
            ? 'bg-primary/20 text-white font-semibold'
            : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {isDirectory ? (
            <>
              {open ? (
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              )}
              {open ? (
                <FolderOpen className="h-3.5 w-3.5 text-primary shrink-0" />
              ) : (
                <Folder className="h-3.5 w-3.5 text-primary/80 shrink-0" />
              )}
            </>
          ) : (
            <>
              <span className="w-3.5" />
              {getFileIcon(node.name)}
            </>
          )}
          <span className="truncate">{node.name}</span>
        </div>

        {isDirty && <span className="h-2 w-2 rounded-full bg-warning shrink-0" title="Unsaved changes" />}
      </button>

      {isDirectory && open && node.children && (
        <div className="space-y-0.5">
          {node.children.map((child) => (
            <ExplorerNode
              key={child.path}
              node={child}
              onOpenFile={onOpenFile}
              activePath={activePath}
              dirtyPaths={dirtyPaths}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
