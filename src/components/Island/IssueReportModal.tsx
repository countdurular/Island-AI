import React, { useState } from 'react';
import { X, AlertCircle, Check, Send } from 'lucide-react';

interface IssueReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosticData: Record<string, any>;
}

export const IssueReportModal: React.FC<IssueReportModalProps> = ({
  isOpen,
  onClose,
  diagnosticData,
}) => {
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDescription('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#090B0D] border border-[#202629] rounded-[24px] p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-xs"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#1A1F22]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#FFBD59]" />
            <h3 className="font-bold text-[#F1F4F3] text-sm">Report an Issue</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#778184] hover:text-[#F1F4F3] hover:bg-[#171B1D] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#D8FF65]/10 text-[#D8FF65] border border-[#D8FF65]/30 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold text-[#F1F4F3]">Report Dispatched</div>
            <p className="text-[#778184] text-[11px]">
              Diagnostics and snapshot successfully logged. Thank you for reporting!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-[11px] text-[#778184] uppercase font-semibold mb-1">
                Describe the anomaly or bug
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Model response formatting was unexpected or shortcut didn't fire..."
                className="w-full bg-[#050607] border border-[#202629] rounded-[16px] p-3 text-xs text-[#F1F4F3] placeholder:text-[#555F61] focus:border-[#D8FF65] outline-none resize-none leading-relaxed"
              />
            </div>

            <div>
              <div className="text-[10px] text-[#555F61] uppercase font-semibold mb-1">
                Attached Diagnostics Payload
              </div>
              <div className="bg-[#050607] border border-[#17191B] rounded-[12px] p-2.5 font-mono text-[10px] text-[#778184] max-h-24 overflow-y-auto touch-scroll">
                <pre>{JSON.stringify(diagnosticData, null, 2)}</pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-[#202629] text-[#778184] hover:text-[#F1F4F3] hover:bg-[#111416]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-[#D8FF65] text-[#050607] font-semibold hover:brightness-105 active:scale-95 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
