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
  X,
  Copy,
  Check,
  Loader2,
  Code2,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { apiJson } from '@/lib/api';
import { GithubTreeNode, GithubFileContent } from './types';

interface GithubFileTreeProps {
  tree: GithubTreeNode[];
  owner: string;
  repo: string;
  branch: string;
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

export function GithubFileTree({ tree, owner, repo, branch, loading }: GithubFileTreeProps) {
  const [selectedFile, setSelectedFile] = useState<GithubTreeNode | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Build nested folder tree structure from flat list
  const nestedTree = useMemo(() => {
    const root: TreeNodeItem[] = [];
    const map = new Map<string, TreeNodeItem>();

    // Sort: directories first, then files alphabetically
    const sorted = [...tree].sort((a, b) => {
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
  }, [tree]);

  const handleOpenFile = async (file: GithubTreeNode) => {
    setSelectedFile(file);
    setFileContent(null);
    setFileLoading(true);
    try {
      const data = await apiJson<GithubFileContent>(
        `/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents?path=${encodeURIComponent(
          file.path,
        )}&ref=${encodeURIComponent(branch)}`,
      );

      if (data.content && data.encoding === 'base64') {
        const decoded = atob(data.content.replace(/\n/g, ''));
        setFileContent(decoded);
      } else if (typeof data.content === 'string') {
        setFileContent(data.content);
      } else {
        setFileContent('// Binary or preview unavailable for this file.');
      }
    } catch (err: any) {
      console.error('Failed to fetch file content:', err);
      setFileContent(`// Error loading file content: ${err?.message || 'Unknown error'}`);
    } finally {
      setFileLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (fileContent) {
      navigator.clipboard.writeText(fileContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground rounded-2xl border border-border/40 bg-card/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium">Fetching repository tree...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* File Tree Panel */}
      <div className="lg:col-span-5 rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Files ({tree.length})
            </span>
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto space-y-1 pr-1 font-mono text-xs">
          {nestedTree.map((node) => (
            <TreeItemNode
              key={node.path}
              node={node}
              onSelectFile={(path) => {
                const rawNode = tree.find((t) => t.path === path);
                if (rawNode) handleOpenFile(rawNode);
              }}
              selectedPath={selectedFile?.path}
            />
          ))}
        </div>
      </div>

      {/* File Content Preview Panel */}
      <div className="lg:col-span-7 rounded-2xl border border-border/60 bg-card/80 p-5 backdrop-blur-md flex flex-col min-h-[450px]">
        {selectedFile ? (
          <>
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
              <div className="flex items-center gap-2 truncate">
                <FileCode className="h-4 w-4 text-primary shrink-0" />
                <span className="font-mono text-xs font-semibold text-foreground truncate">
                  {selectedFile.path}
                </span>
                {selectedFile.size && (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {fileContent && (
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {fileLoading ? (
              <div className="flex flex-1 items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-xs font-medium">Loading file content...</span>
              </div>
            ) : fileContent !== null ? (
              <div className="flex-1 overflow-x-auto rounded-xl border border-border/40 bg-slate-950/90 p-4 font-mono text-xs leading-relaxed text-slate-100 max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre">
                  {fileContent.split('\n').map((line, idx) => (
                    <div key={idx} className="table-row">
                      <span className="table-cell select-none pr-4 text-right text-slate-600 text-[11px]">
                        {idx + 1}
                      </span>
                      <span className="table-cell whitespace-pre">{line}</span>
                    </div>
                  ))}
                </pre>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8 text-muted-foreground">
            <FileCode className="h-12 w-12 text-primary/30 mb-3" />
            <h4 className="font-semibold text-foreground text-sm">Select a file to inspect content</h4>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
              Click on any file in the repository tree to view its source code.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TreeItemNode({
  node,
  onSelectFile,
  selectedPath,
  level = 0,
}: {
  node: TreeNodeItem;
  onSelectFile: (path: string) => void;
  selectedPath?: string;
  level?: number;
}) {
  const [open, setOpen] = useState(level < 1); // Expand first level by default

  const isDirectory = node.type === 'tree';
  const isSelected = selectedPath === node.path;

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.json')) return <FileJson className="h-3.5 w-3.5 text-warning shrink-0" />;
    if (filename.match(/\.(png|jpg|jpeg|gif|svg|ico)$/i)) return <FileImage className="h-3.5 w-3.5 text-secondary shrink-0" />;
    if (filename.match(/\.(ts|tsx|js|jsx|py|rs|go|java|cpp|c|php)$/i))
      return <FileCode className="h-3.5 w-3.5 text-primary shrink-0" />;
    if (filename.match(/\.(md|txt|rst|doc)$/i)) return <FileText className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
    return <File className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (isDirectory) setOpen((o) => !o);
          else onSelectFile(node.path);
        }}
        style={{ paddingLeft: `${level * 14 + 8}px` }}
        className={`flex w-full items-center gap-1.5 rounded-lg py-1.5 pr-2 text-left text-xs transition-colors ${
          isSelected
            ? 'bg-primary/20 text-primary font-semibold'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        }`}
      >
        {isDirectory ? (
          <>
            {open ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
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
      </button>

      {isDirectory && open && node.children && (
        <div className="space-y-0.5">
          {node.children.map((child) => (
            <TreeItemNode
              key={child.path}
              node={child}
              onSelectFile={onSelectFile}
              selectedPath={selectedPath}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
