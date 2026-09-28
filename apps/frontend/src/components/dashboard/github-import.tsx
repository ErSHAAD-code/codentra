'use client';

import { motion } from 'framer-motion';
import { Search, Github, Plus, GitBranch, Clock, ChevronDown, Lock, Globe } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const MOCK_REPOS = [
  { id: 1, name: 'codentra-frontend', org: 'mohd-shaad', updated: '2h ago', private: true, lang: 'TypeScript' },
  { id: 2, name: 'codentra-api', org: 'mohd-shaad', updated: '5h ago', private: true, lang: 'TypeScript' },
  { id: 3, name: 'flowzero-traffic-system', org: 'mohd-shaad', updated: '2d ago', private: false, lang: 'React' },
  { id: 4, name: 'personal-portfolio', org: 'mohd-shaad', updated: '1w ago', private: false, lang: 'Next.js' },
  { id: 5, name: 'AI-crypto-bot', org: 'mohd-shaad', updated: '2w ago', private: true, lang: 'Python' },
];

export function GithubImport() {
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState<number | null>(null);

  const filtered = MOCK_REPOS.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  const handleImport = (id: number) => {
    setImporting(id);
    setTimeout(() => {
      setImporting(null);
      // In a real app, this would route to configuration
      window.location.href = `/dashboard/repositories/${id}`;
    }, 1500);
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 p-4 gap-4 bg-muted/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background shadow-md">
            <Github size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg tracking-tight">Import Git Repository</h3>
            <p className="text-xs text-muted-foreground">Select a repository from your GitHub to start reviewing.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Button variant="outline" className="h-9 gap-2 border-border/60 bg-background/50 hover:bg-background">
            <Github size={14} className="text-muted-foreground" />
            mohd-shaad
            <ChevronDown size={14} className="text-muted-foreground opacity-50" />
          </Button>
        </div>
      </div>

      <div className="p-4 border-b border-border/50 bg-background/30">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories..." 
            className="w-full rounded-md pl-9 bg-background/50 border border-border/60 focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary h-10 transition-colors text-sm"
          />
        </div>
      </div>

      <div className="divide-y divide-border/40 max-h-[350px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Github size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No repositories found matching "{search}"</p>
          </div>
        ) : (
          filtered.map((repo, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={repo.id} 
              className="flex items-center justify-between p-4 transition-colors hover:bg-muted/10 group"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md border border-border/60 bg-muted/30 p-1.5 text-muted-foreground group-hover:text-primary transition-colors">
                  <GitBranch size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{repo.name}</span>
                    <span className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/20 px-2 py-0.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      {repo.private ? <Lock size={10} /> : <Globe size={10} />}
                      {repo.private ? 'Private' : 'Public'}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary/60"></span>
                      {repo.lang}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {repo.updated}
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => handleImport(repo.id)}
                disabled={importing === repo.id}
                size="sm"
                className={importing === repo.id ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-foreground hover:bg-primary hover:text-primary-foreground transition-all'}
              >
                {importing === repo.id ? (
                  <span className="flex items-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Plus size={14} />
                    </motion.div>
                    Importing...
                  </span>
                ) : (
                  'Import'
                )}
              </Button>
            </motion.div>
          ))
        )}
      </div>
      
      <div className="bg-muted/10 p-3 text-center border-t border-border/50">
        <button className="text-xs text-muted-foreground hover:text-primary transition-colors hover:underline flex items-center justify-center gap-1 mx-auto">
          Import Third-Party Git Repository <Globe size={12} />
        </button>
      </div>
    </div>
  );
}
