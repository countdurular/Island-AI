import React, { useState } from 'react';
import { Play, Zap, Filter, Bell, ArrowDown, CheckCircle2, Clock, Code, Sliders } from 'lucide-react';

interface AutomationWorkspaceProps {
  instruction: string;
  responseContent: string;
}

export const AutomationWorkspace: React.FC<AutomationWorkspaceProps> = ({
  instruction,
  responseContent,
}) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'success'>('idle');

  const isPrice = /price|monitor|cost/i.test(instruction);
  const isWebsite = /website|url|domain|endpoint/i.test(instruction);

  const triggerTitle = isPrice
    ? 'HTTP Endpoint / DOM Watcher'
    : 'Event Trigger: Periodic Schedule';
  const triggerDesc = isPrice
    ? 'Polls target DOM element every 5 minutes'
    : 'Fires webhook evaluation on configured interval';

  const conditionTitle = isPrice
    ? 'Price Threshold Shift (Δ ≥ $5.00)'
    : 'State Change Evaluator (Diff > 0)';
  const conditionDesc = 'Evaluates current value against last recorded snapshot in SQLite buffer';

  const actionTitle = 'Multi-Channel Alert Dispatch';
  const actionDesc = 'Dispatches signed webhook payload and push alert to subscribers';

  const handleTestRun = () => {
    setTestStatus('running');
    setTimeout(() => {
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 4000);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full bg-[#050607] text-[#F1F4F3] rounded-[20px] sm:rounded-[24px] overflow-hidden border border-[#202629]">
      
      {/* Subheader */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0B0E10] border-b border-[#202629] text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#D8FF65] shrink-0" />
          <span className="font-semibold truncate">Automation Graph</span>
        </div>

        <button
          onClick={handleTestRun}
          disabled={testStatus === 'running'}
          className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-[#111416] hover:bg-[#171B1D] active:scale-95 border border-[#202629] text-xs font-medium text-[#F1F4F3] rounded-full transition-all touch-manipulation"
        >
          {testStatus === 'running' ? (
            <Clock className="w-3.5 h-3.5 text-[#8FF3DF] animate-spin" />
          ) : testStatus === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D8FF65]" />
          ) : (
            <Play className="w-3.5 h-3.5 text-[#D8FF65]" />
          )}
          <span>
            {testStatus === 'running'
              ? 'Simulating...'
              : testStatus === 'success'
              ? '200 OK'
              : 'Test Run'}
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-6 pt-3 sm:pt-4 pb-16 sm:pb-24 space-y-4 sm:space-y-6 touch-scroll scroll-container">
        
        {/* Instruction Context Card */}
        <div className="p-3.5 sm:p-4 bg-[#0B0E10] border border-[#202629] rounded-[18px] sm:rounded-[20px] text-xs">
          <span className="text-[#778184] uppercase tracking-wider text-[10px] font-semibold">
            Parsed Natural Language Intent
          </span>
          <p className="mt-1 font-medium text-[#F1F4F3] text-xs sm:text-sm">
            "{instruction || 'Monitor target service and alert upon condition anomaly'}"
          </p>
        </div>

        {/* Visual Workflow Graph: Trigger -> Condition -> Action */}
        <div className="max-w-xl mx-auto space-y-2.5 sm:space-y-3">
          
          {/* Node 1: Trigger */}
          <div className="p-3.5 sm:p-4 bg-[#0B0E10] border border-[#202629] rounded-[18px] sm:rounded-[20px] flex items-start gap-3 relative shadow-md">
            <div className="p-2 sm:p-2.5 rounded-[12px] sm:rounded-[14px] bg-[#111416] border border-[#202629] text-[#D8FF65] shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#D8FF65]">
                  01 · Trigger
                </span>
                <span className="text-[10px] text-[#778184] font-mono">Interval 5m</span>
              </div>
              <div className="font-semibold text-xs sm:text-sm text-[#F1F4F3] mt-0.5">{triggerTitle}</div>
              <div className="text-[11px] text-[#778184] mt-0.5">{triggerDesc}</div>
            </div>
          </div>

          {/* Connector */}
          <div className="flex justify-center">
            <ArrowDown className="w-3.5 h-3.5 text-[#778184]" />
          </div>

          {/* Node 2: Condition */}
          <div className="p-3.5 sm:p-4 bg-[#0B0E10] border border-[#202629] rounded-[18px] sm:rounded-[20px] flex items-start gap-3 relative shadow-md">
            <div className="p-2 sm:p-2.5 rounded-[12px] sm:rounded-[14px] bg-[#111416] border border-[#202629] text-[#8FF3DF] shrink-0 mt-0.5">
              <Filter className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8FF3DF]">
                  02 · Barrier
                </span>
                <span className="text-[10px] text-[#778184] font-mono">Predicate Logic</span>
              </div>
              <div className="font-semibold text-xs sm:text-sm text-[#F1F4F3] mt-0.5">{conditionTitle}</div>
              <div className="text-[11px] text-[#778184] mt-0.5">{conditionDesc}</div>
            </div>
          </div>

          {/* Connector */}
          <div className="flex justify-center">
            <ArrowDown className="w-3.5 h-3.5 text-[#778184]" />
          </div>

          {/* Node 3: Action */}
          <div className="p-3.5 sm:p-4 bg-[#0B0E10] border border-[#202629] rounded-[18px] sm:rounded-[20px] flex items-start gap-3 relative shadow-md">
            <div className="p-2 sm:p-2.5 rounded-[12px] sm:rounded-[14px] bg-[#111416] border border-[#202629] text-[#F1F4F3] shrink-0 mt-0.5">
              <Bell className="w-4 h-4 text-[#D8FF65]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#F1F4F3]">
                  03 · Action
                </span>
                <span className="text-[10px] text-[#778184] font-mono">Webhook & Push</span>
              </div>
              <div className="font-semibold text-xs sm:text-sm text-[#F1F4F3] mt-0.5">{actionTitle}</div>
              <div className="text-[11px] text-[#778184] mt-0.5">{actionDesc}</div>
            </div>
          </div>

        </div>

        {/* Declarative Config Spec */}
        <div className="p-3.5 sm:p-4 bg-[#0B0E10] border border-[#202629] rounded-[18px] sm:rounded-[20px]">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-[#F1F4F3] font-semibold flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-[#8FF3DF]" /> Compiled Workflow Spec
            </span>
            <span className="text-[10px] text-[#778184] font-mono">YAML Manifest</span>
          </div>
          <pre className="font-mono text-[11px] sm:text-xs text-[#9CA4A5] whitespace-pre-wrap leading-relaxed overflow-x-auto touch-scroll">
            {responseContent}
          </pre>
        </div>

      </div>

    </div>
  );
};
