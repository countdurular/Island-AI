import React, { useState, useEffect } from 'react';
import { X, Shield, Server, CheckCircle2 } from 'lucide-react';
import { ProviderSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ProviderSettings;
  onSaveSettings: (settings: ProviderSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<ProviderSettings>(settings);
  const [serverStatus, setServerStatus] = useState<{
    online: boolean;
    hasGeminiKey: boolean;
    loading: boolean;
  }>({
    online: false,
    hasGeminiKey: false,
    loading: true,
  });

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setServerStatus({
          online: true,
          hasGeminiKey: Boolean(data.hasGeminiKey),
          loading: false,
        });
      })
      .catch(() => {
        setServerStatus({
          online: false,
          hasGeminiKey: false,
          loading: false,
        });
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full sm:max-w-lg bg-[#0B0E10] border border-[#202629] rounded-t-[26px] sm:rounded-[26px] p-4 sm:p-6 shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
        
        {/* Mobile drag handle affordance */}
        <div className="w-10 h-1 bg-[#202629] rounded-full mx-auto mb-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#202629] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8FF3DF]" />
            <h3 className="text-sm font-bold tracking-tight text-[#F1F4F3]">Model & Provider Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-[#778184] hover:text-[#F1F4F3] hover:bg-[#171B1D] flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="mt-3 sm:mt-4 space-y-4 overflow-y-auto min-h-0 touch-scroll scroll-container flex-1 pr-1 pb-safe">

          {/* Engine Status Banner */}
          <div className="p-3 bg-[#111416] border border-[#202629] rounded-[16px] text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#778184] flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#D8FF65]" /> Server Gateway
              </span>
              {serverStatus.online ? (
                <span className="inline-flex items-center gap-1 text-[#D8FF65] text-[11px] font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Live
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[#778184] text-[11px] font-medium">
                  Simulator Active
                </span>
              )}
            </div>
            <div className="mt-1.5 text-[11px] text-[#778184] leading-relaxed">
              {serverStatus.hasGeminiKey 
                ? 'Server environment has GEMINI_API_KEY injected. Real calls are proxied securely without exposing client secrets.'
                : 'Server is running in autonomous simulation mode. Real requests fallback gracefully to high-fidelity domain synthesizers.'}
            </div>
          </div>

          {/* Custom OpenAI-Compatible Endpoint */}
          <div className="space-y-3">
            <div className="text-[10px] sm:text-[11px] font-semibold text-[#778184] uppercase tracking-wider">
              OpenAI-Compatible Gateway (Optional)
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#778184]">Base URL</label>
              <input
                type="text"
                placeholder="https://api.openai.com/v1 or http://localhost:11434/v1"
                value={formData.openaiBaseUrl}
                onChange={(e) => setFormData({ ...formData, openaiBaseUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#050607] border border-[#202629] rounded-[14px] text-xs sm:text-sm text-[#F1F4F3] placeholder:text-[#353F44] focus:outline-none focus:border-[#D8FF65]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-[#778184]">Model Identifier</label>
                <input
                  type="text"
                  placeholder="gpt-4o, claude-3-5-sonnet"
                  value={formData.openaiModel}
                  onChange={(e) => setFormData({ ...formData, openaiModel: e.target.value })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#050607] border border-[#202629] rounded-[14px] text-xs sm:text-sm text-[#F1F4F3] placeholder:text-[#353F44] focus:outline-none focus:border-[#D8FF65]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[#778184]">API Key (Bearer)</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={formData.openaiApiKey}
                  onChange={(e) => setFormData({ ...formData, openaiApiKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#050607] border border-[#202629] rounded-[14px] text-xs sm:text-sm text-[#F1F4F3] placeholder:text-[#353F44] focus:outline-none focus:border-[#D8FF65]"
                />
              </div>
            </div>
          </div>

          {/* System Instructions */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-[11px] text-[#778184] uppercase tracking-wider font-semibold">
              Global System Directives
            </label>
            <textarea
              rows={3}
              value={formData.systemInstruction}
              onChange={(e) => setFormData({ ...formData, systemInstruction: e.target.value })}
              placeholder="Define behavioral bounds, role, or preferred output syntax..."
              className="w-full px-3.5 py-2.5 bg-[#050607] border border-[#202629] rounded-[14px] text-xs sm:text-sm text-[#F1F4F3] placeholder:text-[#353F44] focus:outline-none focus:border-[#D8FF65] resize-none"
            />
          </div>

          {/* Security Note */}
          <div className="flex items-start gap-2 p-2.5 rounded-[12px] bg-[#050607] border border-[#202629] text-[10px] text-[#778184]">
            <Shield className="w-3.5 h-3.5 text-[#8FF3DF] shrink-0 mt-0.5" />
            <span>
              ISLAND AI operates as a zero-leakage command shell. Unconfigured sessions default safely to self-contained local simulation.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#202629] flex flex-col sm:flex-row items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  openaiBaseUrl: '',
                  openaiApiKey: '',
                  openaiModel: 'gpt-4o',
                  systemInstruction: 'You are ISLAND AI, an advanced AI operating surface and executive intelligence wrapper. Provide precise, highly structured, expert responses without conversational fluff or filler.',
                  localBaseUrl: 'http://localhost:11434',
                  localModel: 'llama-3.3-70b',
                });
              }}
              className="w-full sm:w-auto text-xs text-[#778184] hover:text-[#F1F4F3] transition-colors py-2 text-center min-h-[40px] flex items-center justify-center touch-manipulation"
            >
              Reset to Defaults
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] bg-[#D8FF65] text-[#050607] font-semibold text-xs rounded-full hover:brightness-105 active:scale-95 transition-all touch-manipulation"
            >
              Save Configuration
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
