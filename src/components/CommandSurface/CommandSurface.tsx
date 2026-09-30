import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, Sparkles, FileText, ChevronDown, Check, Cpu, Eye, Mic, MicOff, Volume2 } from 'lucide-react';
import { CapabilityId, ModelId, AttachedContext } from '../../types';
import { defaultIntentRouter } from '../../lib/intentRouter';
import { FilePreviewModal } from '../ContextModal/FilePreviewModal';
import { useSpeechRecognition } from '../../lib/useSpeechRecognition';

interface CommandSurfaceProps {
  onExecuteCommand: (instruction: string, forcedCapability?: CapabilityId) => void;
  selectedModel: ModelId;
  onSelectModel: (model: ModelId) => void;
  attachedContext: AttachedContext[];
  onOpenContextModal: () => void;
  onClearContext: () => void;
  onRemoveContextItem?: (id: string) => void;
  currentCapability: CapabilityId;
  onSelectCapability: (cap: CapabilityId) => void;
}

const CAPABILITIES: { id: CapabilityId; label: string; icon: string; desc: string }[] = [
  { id: 'ask', label: '✦ Ask', icon: '✦', desc: 'General reasoning & explanation' },
  { id: 'build', label: '◇ Build', icon: '◇', desc: 'Interfaces, SaaS & apps' },
  { id: 'analyze', label: '◌ Analyze', icon: '◌', desc: 'Documents & datasets' },
  { id: 'research', label: '⌕ Research', icon: '⌕', desc: 'Web grounding & comparison' },
  { id: 'code', label: '</> Code', icon: '</>', desc: 'Debugging & architecture' },
  { id: 'voice', label: '◉ Voice', icon: '◉', desc: 'Realtime speech interaction' },
  { id: 'automate', label: '⌁ Automate', icon: '⌁', desc: 'Trigger-action workflows' },
  { id: 'agents', label: '◎ Agents', icon: '◎', desc: 'Autonomous worker swarms' },
];

const MODEL_OPTIONS: { id: ModelId; name: string; desc: string }[] = [
  { id: 'auto', name: 'Auto', desc: 'Island dynamic intent routing' },
  { id: 'gemini', name: 'Gemini', desc: 'Multimodal native engine' },
  { id: 'gpt', name: 'GPT', desc: 'General reasoning & function calling' },
  { id: 'claude', name: 'Claude', desc: 'Deep research & nuanced synthesis' },
  { id: 'deepseek', name: 'DeepSeek', desc: 'Technical reasoning & code kernel' },
  { id: 'local', name: 'Local', desc: 'Ollama / self-hosted endpoint' },
];

const PROMPT_SUGGESTIONS = [
  'Build me a landing page for Austech-IO',
  'Research the Nigerian insurance market',
  'Monitor this website and notify me when the price changes',
  'Debug this React component',
  'Turn this idea into a SaaS architecture',
  'Analyze this PDF',
];

export const CommandSurface: React.FC<CommandSurfaceProps> = ({
  onExecuteCommand,
  selectedModel,
  onSelectModel,
  attachedContext,
  onOpenContextModal,
  onClearContext,
  onRemoveContextItem,
  currentCapability,
  onSelectCapability,
}) => {
  const [instruction, setInstruction] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [inferredIntent, setInferredIntent] = useState<{
    capability: CapabilityId;
    confidence: number;
    reason: string;
  } | null>(null);

  // File preview modal state for visual summary/thumbnail
  const [previewingFile, setPreviewingFile] = useState<AttachedContext | null>(null);

  // Active touch tracking state for touchstart/touchend feedback
  const [activeTouchCap, setActiveTouchCap] = useState<CapabilityId | null>(null);
  const [activeTouchPromptIdx, setActiveTouchPromptIdx] = useState<number | null>(null);
  const [isSendTouching, setIsSendTouching] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const baseInstructionRef = useRef('');

  // Web Speech API Voice Recognition Integration
  const {
    isSupported: isSpeechSupported,
    isListening: isSpeechListening,
    startListening: startSpeech,
    stopListening: stopSpeech,
    error: speechError,
  } = useSpeechRecognition({
    onTranscriptChange: (transcriptText) => {
      const base = baseInstructionRef.current;
      setInstruction(base ? `${base} ${transcriptText}` : transcriptText);
    },
  });

  const handleToggleSpeech = () => {
    if (isSpeechListening) {
      stopSpeech();
    } else {
      baseInstructionRef.current = instruction.trim();
      startSpeech();
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time intent detection while typing
  useEffect(() => {
    if (instruction.trim().length > 3) {
      const result = defaultIntentRouter.infer(instruction, attachedContext);
      setInferredIntent(result);
    } else {
      setInferredIntent(null);
    }
  }, [instruction, attachedContext]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!instruction.trim()) return;

    const targetCap = instruction.trim().length > 3 && inferredIntent ? inferredIntent.capability : currentCapability;
    onExecuteCommand(instruction.trim(), targetCap);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-1 w-full overflow-y-auto min-h-0 touch-scroll scroll-container">
      <div className="min-h-full flex flex-col items-center justify-center p-3 xs:p-4 sm:p-8 pt-4 sm:pt-8 pb-16 sm:pb-24 max-w-3xl mx-auto w-full text-center">
        
        {/* Hero Eyebrow */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111416] border border-[#202629] text-[9px] xs:text-[10px] uppercase tracking-widest text-[#778184] mb-2 sm:mb-4 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D8FF65] shadow-[0_0_8px_rgba(216,255,101,0.6)]" />
        AI POWER SURFACE
      </div>

      {/* Large Headline */}
      <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F1F4F3] leading-[1.1] sm:leading-[1.05]">
        Ask it. <em className="not-italic text-[#8FF3DF]">Build it.</em> Run it.
      </h1>

      {/* Supporting Text */}
      <p className="mt-2 sm:mt-4 text-[11px] xs:text-xs sm:text-sm text-[#778184] max-w-lg leading-relaxed px-2">
        Island is an AI wrapper that connects models, context, tools and workflows through one command surface.
      </p>

      {/* Primary Universal Command Box */}
      <div className="w-full mt-4 sm:mt-8 bg-[#0C0F11] border border-[#202629] rounded-[22px] sm:rounded-[24px] p-2 sm:p-3 shadow-2xl focus-within:border-[#3B4446] transition-all relative text-left">
        
        {/* Dynamic Inferred Intent Toast */}
        {inferredIntent && (
          <div className="absolute -top-3 left-4 sm:left-6 px-2.5 py-0.5 rounded-full bg-[#171B1D] border border-[#202629] text-[9px] sm:text-[10px] text-[#8FF3DF] font-mono flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3 h-3 text-[#D8FF65]" />
            <span>Intent: <strong>{inferredIntent.capability.toUpperCase()}</strong> ({Math.round(inferredIntent.confidence * 100)}%)</span>
          </div>
        )}

        {/* Input & Send Button */}
        <div className="flex items-end gap-2 px-1 sm:px-2 pt-1">
          <textarea
            ref={textareaRef}
            rows={2}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell Island what you want to do…"
            className="flex-1 bg-transparent border-0 outline-none resize-none text-xs sm:text-sm text-[#F1F4F3] placeholder:text-[#555F61] leading-relaxed py-1 min-h-[44px]"
          />

          {/* Microphone Voice Command Trigger Icon (Web Speech API) */}
          <button
            type="button"
            onClick={handleToggleSpeech}
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all shadow-md touch-manipulation active:scale-90 ${
              isSpeechListening
                ? 'bg-[#FF5555] text-white ring-4 ring-[#FF5555]/30 animate-pulse'
                : 'bg-[#14181B] hover:bg-[#1E2428] text-[#9CA4A5] hover:text-[#D8FF65] border border-[#202629]'
            }`}
            title={
              isSpeechListening
                ? 'Listening to speech... Click to stop (Web Speech API)'
                : isSpeechSupported
                ? 'Hands-free voice command (Web Speech API) - Click to speak'
                : 'Web Speech API is not supported in this browser'
            }
            aria-label="Toggle Microphone Voice Command"
          >
            {isSpeechListening ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={() => handleSubmit()}
            onTouchStart={() => setIsSendTouching(true)}
            onTouchEnd={() => setIsSendTouching(false)}
            onTouchCancel={() => setIsSendTouching(false)}
            disabled={!instruction.trim()}
            className={`w-11 h-11 rounded-full bg-[#D8FF65] text-[#050607] flex items-center justify-center shrink-0 disabled:opacity-20 hover:brightness-105 active:scale-90 transition-all shadow-md touch-manipulation ${
              isSendTouching ? 'scale-90 brightness-110 ring-2 ring-[#D8FF65]/50' : ''
            }`}
            title="Send Instruction to Island"
            aria-label="Send Instruction"
          >
            <ArrowUp className="w-5 h-5 font-bold" />
          </button>
        </div>

        {/* Live Speech Recognition Active Status Feedback */}
        {isSpeechListening && (
          <div className="flex items-center gap-2 px-2 pt-2 text-[10px] text-[#FF5555] font-mono animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#FF5555] animate-ping" />
            <span>Listening hands-free... Speak your prompt naturally.</span>
          </div>
        )}
        {speechError && (
          <div className="px-2 pt-1.5 text-[10px] text-[#FFB86C] font-mono">
            {speechError}
          </div>
        )}

        {/* Attached Files Interactive Preview Badges */}
        {attachedContext.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 px-1 sm:px-2 pt-2 pb-1 border-t border-[#171B1D]">
            <span className="text-[10px] text-[#778184] uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
              <Eye className="w-3 h-3 text-[#D8FF65]" /> Files:
            </span>
            {attachedContext.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => setPreviewingFile(file)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#111416] hover:bg-[#181D20] active:scale-95 border border-[#202629] hover:border-[#3B4446] text-[10px] text-[#8FF3DF] hover:text-[#F1F4F3] transition-all group touch-manipulation"
                title={`Click to preview visual summary of ${file.name}`}
              >
                <FileText className="w-2.5 h-2.5 text-[#D8FF65]" />
                <span className="max-w-[130px] truncate font-medium">{file.name}</span>
                <span className="text-[9px] text-[#555F61] font-mono">({file.size})</span>
              </button>
            ))}
          </div>
        )}

        {/* Command Meta Bar (Model, Context, Clear) */}
        <div className="mt-2 pt-2 border-t border-[#171B1D] flex items-center gap-1.5 sm:gap-2 px-1 text-xs flex-wrap">
          
          {/* Model Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-full bg-[#111416] hover:bg-[#171B1D] active:scale-95 border border-[#202629] text-[11px] text-[#9CA4A5] hover:text-[#F1F4F3] transition-all touch-manipulation"
            >
              <Cpu className="w-3 h-3 text-[#D8FF65]" />
              <span className="font-medium capitalize">{selectedModel}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {isModelDropdownOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-64 max-w-[calc(100vw-32px)] bg-[#0B0E10] border border-[#202629] rounded-[20px] p-2 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] uppercase tracking-wider text-[#778184] px-2 py-1 font-semibold">
                  Select Intelligence Engine
                </div>
                <div className="space-y-1 mt-1 max-h-56 overflow-y-auto touch-scroll">
                  {MODEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onSelectModel(opt.id);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-[12px] text-left transition-colors min-h-[40px] touch-manipulation ${
                        selectedModel === opt.id
                          ? 'bg-[#171B1D] text-[#D8FF65] border border-[#D8FF65]/30'
                          : 'hover:bg-[#111416] text-[#9CA4A5]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-[#F1F4F3]">{opt.name}</div>
                        <div className="text-[10px] text-[#778184]">{opt.desc}</div>
                      </div>
                      {selectedModel === opt.id && <Check className="w-3.5 h-3.5 text-[#D8FF65]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Context Picker */}
          <button
            type="button"
            onClick={onOpenContextModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-full border text-[11px] transition-all active:scale-95 touch-manipulation ${
              attachedContext.length > 0
                ? 'bg-[#8FF3DF]/10 border-[#8FF3DF]/40 text-[#8FF3DF]'
                : 'bg-[#111416] hover:bg-[#171B1D] border-[#202629] text-[#9CA4A5] hover:text-[#F1F4F3]'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>
              {attachedContext.length > 0
                ? `+${attachedContext.length} Context`
                : '+ Context'}
            </span>
          </button>

          <div className="flex-1" />

          {/* Clear button if text or context exists */}
          {(instruction || attachedContext.length > 0) && (
            <button
              type="button"
              onClick={() => {
                setInstruction('');
                onClearContext();
              }}
              className="text-[11px] text-[#778184] hover:text-[#FF6E6E] px-2 py-1.5 min-h-[38px] flex items-center transition-colors touch-manipulation active:scale-95"
            >
              Clear
            </button>
          )}

        </div>

      </div>

      {/* Capability System Bar - Touch Optimized with touchstart & touchend Handlers */}
      <div className="w-full mt-3 sm:mt-4">
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar touch-scroll py-1 gap-1.5 sm:gap-2 px-1">
          {CAPABILITIES.map((cap) => {
            const isActive = currentCapability === cap.id;
            const isTouchActive = activeTouchCap === cap.id;
            return (
              <button
                key={cap.id}
                type="button"
                onClick={() => onSelectCapability(cap.id)}
                onTouchStart={() => setActiveTouchCap(cap.id)}
                onTouchEnd={() => setActiveTouchCap(null)}
                onTouchCancel={() => setActiveTouchCap(null)}
                className={`capability px-3.5 py-2 min-h-[40px] rounded-full text-xs font-medium border transition-all shrink-0 active:scale-95 touch-manipulation flex items-center ${
                  isTouchActive
                    ? 'scale-90 bg-[#202629] text-[#D8FF65] border-[#D8FF65] ring-1 ring-[#D8FF65]/40 shadow-md'
                    : isActive
                    ? 'active bg-[#171B1D] border-[#3B4446] text-[#F1F4F3] shadow-sm'
                    : 'bg-[#090B0D] border-[#202629] text-[#778184] hover:text-[#F1F4F3] hover:border-[#353F44]'
                }`}
                title={cap.desc}
              >
                {cap.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested Prompt Chips with Touchstart/Touchend Handlers */}
      <div className="mt-5 sm:mt-8 w-full max-w-xl pb-2">
        <div className="text-[10px] sm:text-[11px] text-[#555F61] uppercase tracking-wider mb-2 font-semibold">
          Suggested Instructions
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
          {PROMPT_SUGGESTIONS.map((item, idx) => {
            const isTouchingThisPrompt = activeTouchPromptIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInstruction(item);
                  textareaRef.current?.focus();
                }}
                onTouchStart={() => setActiveTouchPromptIdx(idx)}
                onTouchEnd={() => setActiveTouchPromptIdx(null)}
                onTouchCancel={() => setActiveTouchPromptIdx(null)}
                className={`px-3 py-1.5 min-h-[38px] flex items-center rounded-full border text-[11px] transition-all text-left truncate max-w-full sm:max-w-xs active:scale-95 touch-manipulation ${
                  isTouchingThisPrompt
                    ? 'bg-[#171B1D] border-[#D8FF65]/50 text-[#F1F4F3] scale-95 ring-1 ring-[#D8FF65]/20'
                    : 'bg-[#0B0E10] border-[#202629] hover:border-[#353F44] text-[#778184] hover:text-[#F1F4F3]'
                }`}
              >
                <span className="truncate">{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      </div>

      {/* File Context Visual Preview Modal */}
      <FilePreviewModal
        file={previewingFile}
        onClose={() => setPreviewingFile(null)}
        onRemoveFile={onRemoveContextItem}
      />

    </div>
  );
};
