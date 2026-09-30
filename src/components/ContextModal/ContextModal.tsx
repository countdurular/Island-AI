import React, { useState } from 'react';
import { X, FileText, Upload, Check, Trash2 } from 'lucide-react';
import { AttachedContext } from '../../types';

interface ContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachedContext: AttachedContext[];
  onAddContext: (ctx: AttachedContext) => void;
  onRemoveContext: (id: string) => void;
}

const SAMPLE_FILES: AttachedContext[] = [
  {
    id: 'sample-prd',
    name: 'Austech_Product_Spec.pdf',
    size: '142 KB',
    type: 'PDF',
    content: `AUSTECH-IO PRODUCT SPECIFICATION V2.4
Executive Overview:
Austech is developing a decentralized telemetry edge engine for autonomous IoT fleets.
Core Requirements:
1. Sub-10ms packet acknowledgment over WebSocket rails.
2. Local SQLite / IndexedDB buffering when disconnected.
3. AES-256 encrypted payload serialization with public-key rotation.
4. Minimal zero-pill dashboard with dark monochrome aesthetics (#050607 palette).`,
    preview: 'Product requirements for Austech-IO edge engine'
  },
  {
    id: 'sample-data',
    name: 'Nigeria_Insurance_Data_2025.csv',
    size: '86 KB',
    type: 'CSV',
    content: `Sub-Sector,GPW_Billion_NGN,Loss_Ratio_Pct,Growth_YoY_Pct,Digital_Penetration
Motor,114.2,46.2,18.4,24.1
Health,88.5,58.1,22.7,41.5
Oil_Gas,245.0,21.3,12.0,14.8
Life,132.8,38.9,19.2,18.0
General_Accident,64.2,34.5,14.6,12.2`,
    preview: 'NAICOM statistical bulletin breakdown by insurance subsector'
  },
  {
    id: 'sample-code',
    name: 'AuthWorkflow.tsx',
    size: '14 KB',
    type: 'TSX',
    content: `export function AuthWorkflow() {
  const [session, setSession] = useState(null);
  // Warning: unhandled edge case when token expires during async dispatch
  return <div>Authentication State Machine</div>;
}`,
    preview: 'React authentication state machine component'
  }
];

export const ContextModal: React.FC<ContextModalProps> = ({
  isOpen,
  onClose,
  attachedContext,
  onAddContext,
  onRemoveContext,
}) => {
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (event) => {
        const text = event.target?.result as string || '';
        const newCtx: AttachedContext = {
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          size: `${Math.round(file.size / 1024)} KB`,
          type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
          content: text.slice(0, 15000),
          preview: text.slice(0, 120),
        };
        onAddContext(newCtx);
      };

      if (file.type.includes('image')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full sm:max-w-lg bg-[#0B0E10] border border-[#202629] rounded-t-[26px] sm:rounded-[26px] p-4 sm:p-6 shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
        
        {/* Mobile drag handle affordance */}
        <div className="w-10 h-1 bg-[#202629] rounded-full mx-auto mb-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#202629] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D8FF65]" />
            <h3 className="text-sm font-bold tracking-tight text-[#F1F4F3]">Document & File Context</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-[#778184] hover:text-[#F1F4F3] hover:bg-[#171B1D] flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="mt-4 space-y-4 overflow-y-auto min-h-0 touch-scroll scroll-container flex-1 pr-1">
          <p className="text-xs text-[#778184] leading-relaxed">
            Attach reference documents to feed directly into the intelligence engine. Supports PDF, TXT, DOCX, CSV, JSON, PNG, and code.
          </p>

          {/* Upload Area */}
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const files = e.dataTransfer.files;
              if (files && files.length > 0) {
                const file = files[0];
                const reader = new FileReader();
                reader.onload = (evt) => {
                  onAddContext({
                    id: `drop-${Date.now()}`,
                    name: file.name,
                    size: `${Math.round(file.size / 1024)} KB`,
                    type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
                    content: (evt.target?.result as string || '').slice(0, 15000),
                  });
                };
                reader.readAsText(file);
              }
            }}
            className={`flex flex-col items-center justify-center p-5 sm:p-6 border border-dashed rounded-[18px] cursor-pointer transition-all active:scale-99 touch-manipulation ${
              dragOver ? 'border-[#D8FF65] bg-[#D8FF65]/5' : 'border-[#202629] bg-[#050607] hover:border-[#353F44]'
            }`}
          >
            <Upload className="w-5 h-5 text-[#778184] mb-1.5" />
            <span className="text-xs font-semibold text-[#F1F4F3]">Tap to upload or drop file</span>
            <span className="text-[10px] text-[#778184] mt-0.5">PDF, TXT, CSV, JSON, PNG, DOCX</span>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Currently Attached */}
          {attachedContext.length > 0 && (
            <div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-[#778184] uppercase tracking-wider mb-2">
                Attached Context ({attachedContext.length})
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto touch-scroll pr-1">
                {attachedContext.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2.5 bg-[#111416] border border-[#202629] rounded-[14px] min-h-[44px]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-[#8FF3DF] shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-medium text-[#F1F4F3] truncate">{file.name}</div>
                        <div className="text-[10px] text-[#778184]">{file.type} · {file.size}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveContext(file.id)}
                      className="p-2 text-[#778184] hover:text-[#FF6E6E] transition-colors active:scale-90 touch-manipulation"
                      title="Remove file"
                      aria-label="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Context Files */}
          <div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-[#778184] uppercase tracking-wider mb-2">
              Quick Test Contexts
            </div>
            <div className="grid grid-cols-1 gap-2">
              {SAMPLE_FILES.map((sample) => {
                const isAttached = attachedContext.some((c) => c.name === sample.name);
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      if (isAttached) {
                        const target = attachedContext.find((c) => c.name === sample.name);
                        if (target) onRemoveContext(target.id);
                      } else {
                        onAddContext(sample);
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-[14px] border text-left transition-all min-h-[44px] active:scale-98 touch-manipulation ${
                      isAttached
                        ? 'border-[#D8FF65]/40 bg-[#D8FF65]/5'
                        : 'border-[#202629] bg-[#111416] hover:border-[#353F44]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className={`w-4 h-4 shrink-0 ${isAttached ? 'text-[#D8FF65]' : 'text-[#778184]'}`} />
                      <div className="truncate">
                        <div className="text-xs font-medium text-[#F1F4F3] truncate">{sample.name}</div>
                        <div className="text-[10px] text-[#778184] truncate">{sample.preview}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold ml-2 shrink-0">
                      {isAttached ? (
                        <span className="inline-flex items-center gap-1 text-[#D8FF65]">
                          <Check className="w-3 h-3" /> Attached
                        </span>
                      ) : (
                        <span className="text-[#778184] hover:text-[#F1F4F3]">+ Add</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#202629] flex justify-end shrink-0 pb-safe">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] bg-[#D8FF65] text-[#050607] font-semibold text-xs rounded-full hover:brightness-105 active:scale-95 transition-all touch-manipulation"
          >
            Apply Context ({attachedContext.length})
          </button>
        </div>

      </div>
    </div>
  );
};
