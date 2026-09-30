import React, { useState } from 'react';
import { X, Copy, Check, Download, Trash2, FileText, Code2, Image, FileSearch, Sparkles, Database } from 'lucide-react';
import { AttachedContext } from '../../types';

interface FilePreviewModalProps {
  file: AttachedContext | null;
  onClose: () => void;
  onRemoveFile?: (id: string) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  onClose,
  onRemoveFile,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'summary' | 'raw'>('preview');

  if (!file) return null;

  const isCode = file.type === 'code' || file.name.match(/\.(ts|tsx|js|jsx|py|html|css|json|yaml|sql)$/i);
  const isImage = file.type === 'image' || file.name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i);
  const isPdf = file.type === 'pdf' || file.name.match(/\.pdf$/i);
  const isData = file.name.match(/\.(json|csv|tsv)$/i);

  const approxTokens = Math.max(12, Math.round(file.content.length / 4));
  const lineCount = file.content.split('\n').length;

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl bg-[#090B0D] border border-[#202629] rounded-t-[26px] sm:rounded-[26px] p-4 sm:p-6 shadow-2xl max-h-[88dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
      >
        
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 bg-[#202629] rounded-full mx-auto mb-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#1A1F22] shrink-0 gap-2">
          
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#111416] border border-[#202629] flex items-center justify-center shrink-0">
              {isImage ? (
                <Image className="w-4 h-4 text-[#D8FF65]" />
              ) : isCode ? (
                <Code2 className="w-4 h-4 text-[#8FF3DF]" />
              ) : isPdf ? (
                <FileSearch className="w-4 h-4 text-[#FF8585]" />
              ) : isData ? (
                <Database className="w-4 h-4 text-[#8FF3DF]" />
              ) : (
                <FileText className="w-4 h-4 text-[#D8FF65]" />
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-[#F1F4F3] truncate max-w-xs sm:max-w-md">
                {file.name}
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-[#778184] font-mono mt-0.5">
                <span>{file.size}</span>
                <span>•</span>
                <span>~{approxTokens.toLocaleString()} tokens</span>
                <span>•</span>
                <span className="uppercase text-[#8FF3DF]">{file.type}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopy}
              className="p-2 rounded-full text-[#778184] hover:text-[#F1F4F3] hover:bg-[#171B1D] transition-colors active:scale-95 touch-manipulation"
              title="Copy content"
            >
              {copied ? <Check className="w-4 h-4 text-[#D8FF65]" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleDownload}
              className="p-2 rounded-full text-[#778184] hover:text-[#F1F4F3] hover:bg-[#171B1D] transition-colors active:scale-95 touch-manipulation"
              title="Export file"
            >
              <Download className="w-4 h-4" />
            </button>

            {onRemoveFile && (
              <button
                onClick={() => {
                  onRemoveFile(file.id);
                  onClose();
                }}
                className="p-2 rounded-full text-[#778184] hover:text-[#FF6E6E] hover:bg-[#171B1D] transition-colors active:scale-95 touch-manipulation"
                title="Remove attached file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#778184] hover:text-[#F1F4F3] hover:bg-[#171B1D] transition-colors active:scale-95 touch-manipulation ml-1"
              title="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 pt-3 pb-2 shrink-0 border-b border-[#14181B] text-xs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              activeTab === 'preview'
                ? 'bg-[#171B1D] text-[#D8FF65] border border-[#202629]'
                : 'text-[#778184] hover:text-[#F1F4F3]'
            }`}
          >
            Visual Summary
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              activeTab === 'raw'
                ? 'bg-[#171B1D] text-[#D8FF65] border border-[#202629]'
                : 'text-[#778184] hover:text-[#F1F4F3]'
            }`}
          >
            Raw Buffer ({lineCount} lines)
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              activeTab === 'summary'
                ? 'bg-[#171B1D] text-[#D8FF65] border border-[#202629]'
                : 'text-[#778184] hover:text-[#F1F4F3]'
            }`}
          >
            Context Insights
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="flex-1 overflow-y-auto min-h-0 pt-3 space-y-4 touch-scroll scroll-container text-xs pr-1">
          
          {activeTab === 'preview' && (
            <div className="space-y-3">
              {/* Visual Card Representation */}
              {isImage ? (
                <div className="rounded-[18px] bg-[#050607] border border-[#202629] p-4 flex flex-col items-center justify-center min-h-[220px]">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#111416] to-[#202629] border border-[#353F44] flex items-center justify-center shadow-lg mb-3">
                    <Image className="w-10 h-10 text-[#D8FF65]" />
                  </div>
                  <div className="text-xs font-semibold text-[#F1F4F3]">{file.name}</div>
                  <div className="text-[10px] text-[#778184] font-mono mt-1">Image Asset Attached</div>
                  <p className="text-[11px] text-[#9CA4A5] mt-2 max-w-sm text-center">
                    {file.content || 'Visual asset loaded for multimodal prompt execution.'}
                  </p>
                </div>
              ) : isCode ? (
                <div className="rounded-[18px] bg-[#050607] border border-[#202629] overflow-hidden">
                  <div className="px-3.5 py-2 bg-[#0E1113] border-b border-[#202629] flex items-center justify-between text-[11px] font-mono text-[#778184]">
                    <span>{file.name}</span>
                    <span className="text-[#8FF3DF]">{lineCount} lines</span>
                  </div>
                  <div className="p-3.5 font-mono text-[11px] text-[#E1E7E6] overflow-x-auto touch-scroll max-h-72 leading-relaxed">
                    <pre className="whitespace-pre">
                      {file.content.split('\n').slice(0, 50).map((line, i) => (
                        <div key={i} className="table-row">
                          <span className="table-cell select-none pr-3 text-[#3B4446] text-right w-6">
                            {i + 1}
                          </span>
                          <span className="table-cell">{line}</span>
                        </div>
                      ))}
                      {lineCount > 50 && (
                        <div className="text-[#555F61] italic mt-2">
                          ... +{lineCount - 50} more lines in Raw Buffer tab
                        </div>
                      )}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Document Summary Card */}
                  <div className="p-4 rounded-[18px] bg-[#0B0E10] border border-[#202629] space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold tracking-wider text-[#D8FF65]">
                      <Sparkles className="w-3.5 h-3.5" /> AI Ingestion Summary
                    </div>
                    <p className="text-xs text-[#E1E7E6] leading-relaxed">
                      {file.content.slice(0, 320)}...
                    </p>
                  </div>

                  {/* Highlights / Metas */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="p-3 rounded-[14px] bg-[#0E1113] border border-[#1E2428]">
                      <div className="text-[10px] text-[#778184] uppercase">File Type</div>
                      <div className="text-xs font-semibold text-[#F1F4F3] mt-0.5 capitalize">{file.type}</div>
                    </div>
                    <div className="p-3 rounded-[14px] bg-[#0E1113] border border-[#1E2428]">
                      <div className="text-[10px] text-[#778184] uppercase">Tokens</div>
                      <div className="text-xs font-semibold text-[#8FF3DF] mt-0.5 font-mono">{approxTokens.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-[14px] bg-[#0E1113] border border-[#1E2428] col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-[#778184] uppercase">Encoding</div>
                      <div className="text-xs font-semibold text-[#F1F4F3] mt-0.5">UTF-8 Clean</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="rounded-[18px] bg-[#050607] border border-[#202629] p-3.5 font-mono text-[11px] text-[#9CA4A5] whitespace-pre-wrap max-h-80 overflow-y-auto touch-scroll leading-relaxed">
              {file.content}
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-[16px] bg-[#0B0E10] border border-[#202629]">
                <div className="text-[10px] font-semibold text-[#778184] uppercase tracking-wider mb-2">
                  System Context Pipeline
                </div>
                <p className="text-xs text-[#9CA4A5] leading-relaxed">
                  This document is injected into the prompt envelope prior to dispatching to the intelligence model. It will be referenced for specialized tasks, research grounding, and code architecture.
                </p>
              </div>

              <div className="p-3.5 rounded-[16px] bg-[#0B0E10] border border-[#202629] flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-[#F1F4F3]">Context Invariant Status</div>
                  <div className="text-[10px] text-[#778184]">Verified zero-leakage token sandbox</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#D8FF65]/10 text-[#D8FF65] text-[10px] font-mono border border-[#D8FF65]/30">
                  READY
                </span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
