import React, { useState } from 'react';
import { Layout, Code2, Eye, FolderTree, Terminal, ArrowUpRight, Copy, Check } from 'lucide-react';

interface BuildWorkspaceProps {
  instruction: string;
  responseContent: string;
}

export const BuildWorkspace: React.FC<BuildWorkspaceProps> = ({
  instruction,
  responseContent,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'files'>('preview');
  const [copied, setCopied] = useState(false);

  const isAustech = /austech/i.test(instruction);
  const isInsurance = /insurance|crm/i.test(instruction);
  const projectName = isAustech
    ? 'Austech-IO Enterprise'
    : isInsurance
    ? 'InsurEdge AI CRM'
    : 'Autonomous Application';

  const mockFiles = [
    { name: 'App.tsx', path: 'src/App.tsx', size: '2.4 KB' },
    { name: 'HeroSurface.tsx', path: 'src/components/HeroSurface.tsx', size: '3.1 KB' },
    { name: 'TelemetryGrid.tsx', path: 'src/components/TelemetryGrid.tsx', size: '1.8 KB' },
    { name: 'package.json', path: 'package.json', size: '420 B' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(responseContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#050607] text-[#F1F4F3] rounded-[20px] sm:rounded-[24px] overflow-hidden border border-[#202629]">
      
      {/* Sub-header / Mode Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0B0E10] border-b border-[#202629] text-xs gap-2 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="font-semibold tracking-tight text-[#D8FF65] flex items-center gap-1.5 truncate">
            <Layout className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{projectName}</span>
          </span>
          <span className="text-[#353F44] hidden xs:inline">|</span>
          <div className="flex items-center gap-1 bg-[#111416] p-1 rounded-full border border-[#202629] overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-full font-medium transition-all text-[11px] min-h-[30px] flex items-center active:scale-95 touch-manipulation ${
                activeTab === 'preview'
                  ? 'bg-[#202629] text-[#F1F4F3]'
                  : 'text-[#778184] hover:text-[#F1F4F3]'
              }`}
            >
              <Eye className="w-3 h-3 inline mr-1" /> Canvas
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-full font-medium transition-all text-[11px] min-h-[30px] flex items-center active:scale-95 touch-manipulation ${
                activeTab === 'code'
                  ? 'bg-[#202629] text-[#F1F4F3]'
                  : 'text-[#778184] hover:text-[#F1F4F3]'
              }`}
            >
              <Code2 className="w-3 h-3 inline mr-1" /> Specs
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1 rounded-full font-medium transition-all text-[11px] min-h-[30px] flex items-center active:scale-95 touch-manipulation ${
                activeTab === 'files'
                  ? 'bg-[#202629] text-[#F1F4F3]'
                  : 'text-[#778184] hover:text-[#F1F4F3]'
              }`}
            >
              <FolderTree className="w-3 h-3 inline mr-1" /> Tree
            </button>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-3 py-1.5 min-h-[34px] rounded-full border border-[#202629] text-[#778184] hover:text-[#F1F4F3] hover:border-[#353F44] transition-all text-xs active:scale-95 touch-manipulation ml-auto"
        >
          {copied ? <Check className="w-3 h-3 text-[#D8FF65]" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Export'}</span>
        </button>
      </div>

      {/* Main Build Area */}
      <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-6 pt-3 sm:pt-4 pb-16 sm:pb-24 touch-scroll scroll-container">
        {activeTab === 'preview' && (
          <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
            
            {/* Live Interactive UI Prototype Mockup */}
            <div className="relative rounded-[20px] sm:rounded-[22px] bg-[#0B0E10] border border-[#202629] p-4 sm:p-8 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D8FF65]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#778184] uppercase tracking-wider mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-[#202629]/60">
                <span>Viewport Prototype Preview</span>
                <span className="text-[#8FF3DF] font-mono">Responsive Frame</span>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#111416] border border-[#202629] text-[10px] text-[#8FF3DF] font-mono">
                  {isAustech ? 'Austech-IO Edge Suite' : isInsurance ? 'Underwriting Core' : 'SaaS Scaffold'}
                </span>
                
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#F1F4F3]">
                  {isAustech
                    ? 'Decentralized Telemetry for Autonomous Fleets'
                    : isInsurance
                    ? 'Algorithmic Claims & Continuous Risk Profiling'
                    : 'Universal Execution Surface'}
                </h2>
                
                <p className="text-xs sm:text-sm text-[#778184] max-w-xl leading-relaxed">
                  {isAustech
                    ? 'Sub-millisecond packet acknowledgment and fault-tolerant edge synchronization for modern distributed systems.'
                    : isInsurance
                    ? 'Automated fraud score validation, instant policy issuance, and real-time claim adjudication over telecom rails.'
                    : 'Decoupled reactive component architecture generated dynamically from high-level natural language prompt.'}
                </p>

                <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                  <button className="px-4 sm:px-5 py-2 sm:py-2.5 min-h-[40px] bg-[#D8FF65] text-[#050607] font-bold text-xs rounded-full hover:brightness-105 active:scale-95 transition-all touch-manipulation">
                    Explore Platform
                  </button>
                  <button className="px-4 sm:px-5 py-2 sm:py-2.5 min-h-[40px] bg-[#111416] border border-[#202629] text-[#F1F4F3] font-medium text-xs rounded-full hover:border-[#353F44] active:scale-95 transition-all touch-manipulation">
                    Inspect Architecture
                  </button>
                </div>
              </div>

              {/* Data metrics grid inside prototype - Responsive 1 to 3 columns */}
              <div className="mt-6 pt-4 sm:pt-6 border-t border-[#202629]/60 grid grid-cols-1 xs:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="p-3 bg-[#111416] rounded-[14px] border border-[#202629]">
                  <div className="text-[10px] text-[#778184] uppercase">Latency</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-[#F1F4F3] mt-0.5">&lt; 8.4 ms</div>
                </div>
                <div className="p-3 bg-[#111416] rounded-[14px] border border-[#202629]">
                  <div className="text-[10px] text-[#778184] uppercase">Throughput</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-[#D8FF65] mt-0.5">48k ops/s</div>
                </div>
                <div className="p-3 bg-[#111416] rounded-[14px] border border-[#202629]">
                  <div className="text-[10px] text-[#778184] uppercase">Reliability</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-[#8FF3DF] mt-0.5">99.995%</div>
                </div>
              </div>
            </div>

            {/* Structured Specifications */}
            <div className="p-4 rounded-[18px] bg-[#0B0E10] border border-[#202629] text-xs text-[#778184] space-y-2">
              <div className="font-semibold text-[#F1F4F3] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#D8FF65]" /> Generated Build Specs
              </div>
              <p className="leading-relaxed">
                The frontend component tree adheres to the 60-30-10 palette constitution and zero-pill discipline. All state mutations are isolated within leaf boundaries with memoized listeners.
              </p>
            </div>

          </div>
        )}

        {activeTab === 'code' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-3 sm:p-4 bg-[#0B0E10] border border-[#202629] rounded-[20px] overflow-x-auto touch-scroll">
              <pre className="font-mono text-xs text-[#F1F4F3] whitespace-pre-wrap leading-relaxed">
                {responseContent}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="max-w-xl mx-auto space-y-2 sm:space-y-3">
            <div className="text-xs text-[#778184] mb-2">
              Generated Virtual Project Tree
            </div>
            {mockFiles.map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between p-3 bg-[#0B0E10] border border-[#202629] rounded-[16px] min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <Code2 className="w-4 h-4 text-[#8FF3DF] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-[#F1F4F3] truncate">{file.name}</div>
                    <div className="text-[10px] text-[#778184] font-mono truncate">{file.path}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#778184] shrink-0 ml-2">{file.size}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
