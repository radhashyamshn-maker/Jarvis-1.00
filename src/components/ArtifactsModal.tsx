import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCode,
  Layers,
  Code,
  FileText,
  Eye,
  Copy,
  Download,
  Trash2,
  Plus,
  X,
  Search,
  CheckCircle2,
  Sparkles,
  Zap,
  Terminal,
} from 'lucide-react';
import {
  getStoredArtifacts,
  saveArtifact,
  deleteArtifact,
  createNewArtifact,
  type StarkArtifact,
  type ArtifactType,
} from '../lib/artifacts';
import { playHudBeep, playSuccessChime } from '../lib/audioEffects';

interface ArtifactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArtifactsModal: React.FC<ArtifactsModalProps> = ({ isOpen, onClose }) => {
  const [artifacts, setArtifacts] = useState<StarkArtifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<StarkArtifact | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New artifact form state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newType, setNewType] = useState<ArtifactType>('code');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const list = getStoredArtifacts();
      setArtifacts(list);
      if (list.length > 0 && !selectedArtifact) {
        setSelectedArtifact(list[0]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredArtifacts = artifacts.filter((art) => {
    const matchesTab = activeTab === 'all' || art.type === activeTab;
    const matchesSearch =
      searchQuery.trim() === '' ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const handleCopy = () => {
    if (!selectedArtifact) return;
    navigator.clipboard.writeText(selectedArtifact.content);
    setCopied(true);
    playSuccessChime();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!selectedArtifact) return;
    let ext = 'txt';
    let mime = 'text/plain';
    if (selectedArtifact.type === 'code') {
      ext = 'ts';
      mime = 'text/typescript';
    } else if (selectedArtifact.type === 'svg') {
      ext = 'svg';
      mime = 'image/svg+xml';
    } else if (selectedArtifact.type === 'document' || selectedArtifact.type === 'blueprint') {
      ext = 'md';
      mime = 'text/markdown';
    }

    const blob = new Blob([selectedArtifact.content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedArtifact.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    playSuccessChime();
  };

  const handleDelete = (id: string) => {
    deleteArtifact(id);
    const updated = getStoredArtifacts();
    setArtifacts(updated);
    if (selectedArtifact?.id === id) {
      setSelectedArtifact(updated[0] || null);
    }
    playHudBeep(700, 0.05);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const created = createNewArtifact({
      title: newTitle.trim(),
      type: newType,
      description: newDesc.trim() || 'Custom Stark user artifact.',
      content: newContent,
    });

    const updated = getStoredArtifacts();
    setArtifacts(updated);
    setSelectedArtifact(created);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewContent('');
    playSuccessChime();
  };

  const getTypeIcon = (type: ArtifactType) => {
    switch (type) {
      case 'code':
        return <Code className="w-3.5 h-3.5 text-cyan-400" />;
      case 'blueprint':
        return <Layers className="w-3.5 h-3.5 text-[#ff708a]" />;
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
      case 'svg':
        return <Eye className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <FileCode className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-2xl">
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        className="w-full max-w-4xl rounded-3xl glass-panel border border-[#ff1e42]/40 text-white shadow-[0_0_60px_rgba(255,30,66,0.35)] relative overflow-hidden h-[90vh] flex flex-col"
      >
        {/* Reticles */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#ff1e42]" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#ff1e42]" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#ff1e42]" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#ff1e42]" />

        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-[#ff1e42]/20 bg-[#120107]/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#ff1e42]/20 border border-[#ff1e42]/50 text-[#ff1e42] shadow-[0_0_12px_rgba(255,30,66,0.5)]">
              <FileCode className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm sm:text-base font-extrabold tracking-wider uppercase text-white">
                  STARK ARTIFACTS STUDIO
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-[#ff1e42]/20 text-[#ff708a] border border-[#ff1e42]/40">
                  INTERACTIVE WORKSPACE
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-mono text-slate-400">
                ब्लूप्रिंट्स, कोड स्क्रिप्ट्स, डॉक्युमेंट्स व इंटरएक्टिव विजुअल आर्टिफ़ैक्ट्स
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#ff1e42] hover:bg-[#d90429] text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 shadow-[0_0_12px_#ff1e42] transition-transform active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">NEW ARTIFACT</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main 2-Column Split: List & Interactive Preview */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* LEFT: Artifacts Explorer List */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#ff1e42]/20 flex flex-col bg-[#0b0105]/70 shrink-0">
            {/* Search Bar */}
            <div className="p-3 border-b border-white/5 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search artifacts or tags..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:border-[#ff1e42] outline-none"
                />
              </div>

              {/* Type Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
                {[
                  { id: 'all', label: 'ALL' },
                  { id: 'blueprint', label: 'BLUEPRINT' },
                  { id: 'code', label: 'CODE' },
                  { id: 'document', label: 'DOCS' },
                  { id: 'svg', label: 'SVG' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      playHudBeep(920, 0.03);
                    }}
                    className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold uppercase transition-colors shrink-0 ${
                      activeTab === tab.id
                        ? 'bg-[#ff1e42] text-white'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {filteredArtifacts.length === 0 ? (
                <div className="p-4 text-center text-slate-500 font-mono text-xs">
                  No artifacts found.
                </div>
              ) : (
                filteredArtifacts.map((art) => {
                  const isSelected = selectedArtifact?.id === art.id;
                  return (
                    <button
                      key={art.id}
                      onClick={() => {
                        setSelectedArtifact(art);
                        playHudBeep(980, 0.03);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-[#2b010c] border-[#ff1e42] shadow-[0_0_12px_rgba(255,30,66,0.3)]'
                          : 'bg-[#140108]/60 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5">
                          {getTypeIcon(art.type)}
                          <span className="font-mono text-xs font-bold text-white truncate max-w-[170px]">
                            {art.title}
                          </span>
                        </div>
                        <span className="text-[8px] font-mono uppercase px-1 rounded bg-white/10 text-slate-300">
                          {art.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                        {art.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        {art.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[8px] font-mono px-1 rounded bg-[#ff1e42]/20 text-[#ff708a]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Live Interactive Viewer & Actions */}
          <div className="flex-1 flex flex-col bg-[#050002] min-h-0 overflow-hidden">
            {selectedArtifact ? (
              <>
                {/* Artifact Detail Sub-Header */}
                <div className="p-3 border-b border-[#ff1e42]/20 bg-[#120107]/50 flex items-center justify-between shrink-0">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase bg-[#ff1e42]/20 text-[#ff708a] border border-[#ff1e42]/30">
                        {selectedArtifact.category}
                      </span>
                      <h4 className="font-mono text-sm font-bold text-white truncate">
                        {selectedArtifact.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block truncate mt-0.5">
                      Author: {selectedArtifact.author} • v{selectedArtifact.version} • {selectedArtifact.createdAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] font-bold flex items-center gap-1 transition-colors"
                      title="Copy Artifact Content"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-green-300">COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-300" />
                          <span>COPY</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleDownload}
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] font-bold flex items-center gap-1 transition-colors"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-300" />
                      <span>EXPORT</span>
                    </button>

                    <button
                      onClick={() => handleDelete(selectedArtifact.id)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-500/30 text-red-300 transition-colors"
                      title="Delete Artifact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content Render Surface */}
                <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200">
                  {selectedArtifact.type === 'svg' ? (
                    <div className="h-full flex flex-col items-center justify-center p-4">
                      <div
                        className="w-full max-w-md aspect-square p-4 rounded-2xl bg-black/60 border border-[#ff1e42]/30 flex items-center justify-center shadow-[0_0_30px_rgba(255,30,66,0.2)]"
                        dangerouslySetInnerHTML={{ __html: selectedArtifact.content }}
                      />
                      <span className="text-[10px] font-mono text-[#ff708a] mt-3">
                        ● INTERACTIVE VECTOR SVG RENDER
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-black/80 border border-white/10 p-4 overflow-x-auto shadow-inner">
                      <pre className="font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
                        {selectedArtifact.content}
                      </pre>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 font-mono">
                <FileCode className="w-10 h-10 mb-2 opacity-30" />
                <p>Select an artifact to inspect and interact.</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Artifact Modal Sub-Dialog */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
              <motion.form
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onSubmit={handleCreate}
                className="w-full max-w-lg rounded-2xl bg-[#140108] border border-[#ff1e42] p-4 text-white space-y-3 shadow-[0_0_40px_rgba(255,30,66,0.5)]"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-mono text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#ff1e42]" />
                    CREATE NEW STARK ARTIFACT
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-mono text-slate-300">Artifact Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Vibranium Armor Flux Algorithm"
                    className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-[#ff1e42]/30 text-white font-mono text-xs focus:border-[#ff1e42] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono text-slate-300">Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as ArtifactType)}
                      className="w-full p-2 rounded-xl bg-black/60 border border-[#ff1e42]/30 text-white font-mono text-xs focus:border-[#ff1e42] outline-none"
                    >
                      <option value="code">Code Script</option>
                      <option value="blueprint">Blueprint Schematic</option>
                      <option value="document">Document / Dossier</option>
                      <option value="svg">Interactive SVG</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono text-slate-300">Description</label>
                    <input
                      type="text"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Brief purpose"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-[#ff1e42]/30 text-white font-mono text-xs focus:border-[#ff1e42] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-mono text-slate-300">Artifact Content</label>
                  <textarea
                    required
                    rows={6}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Enter code, markdown, SVG markup or technical content..."
                    className="w-full p-2.5 rounded-xl bg-black/80 border border-white/10 text-white font-mono text-xs focus:border-[#ff1e42] outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs font-semibold"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#990022] to-[#ff1e42] hover:brightness-110 text-white font-mono text-xs font-bold uppercase shadow-[0_0_12px_#ff1e42]"
                  >
                    GENERATE ARTIFACT
                  </button>
                </div>
              </motion.form>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
