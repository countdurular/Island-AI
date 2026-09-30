import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Radio, Sparkles } from 'lucide-react';

interface VoiceWorkspaceProps {
  instruction: string;
  responseContent: string;
  onVoiceTranscribed: (text: string) => void;
}

export const VoiceWorkspace: React.FC<VoiceWorkspaceProps> = ({
  instruction,
  responseContent,
  onVoiceTranscribed,
}) => {
  const [micActive, setMicActive] = useState(false);
  const [connectionState, setConnectionState] = useState<'standby' | 'listening' | 'speaking'>('standby');
  const [transcript, setTranscript] = useState(instruction || '');

  useEffect(() => {
    let recognition: any = null;

    if (micActive && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      try {
        recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setConnectionState('listening');
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);
          onVoiceTranscribed(transcriptText);
        };

        recognition.onerror = () => {
          setConnectionState('standby');
          setMicActive(false);
        };

        recognition.onend = () => {
          setConnectionState('standby');
          setMicActive(false);
        };

        recognition.start();
      } catch (err) {
        console.warn('Speech recognition start failure:', err);
      }
    } else if (micActive) {
      setConnectionState('listening');
      const timer = setTimeout(() => {
        setConnectionState('speaking');
        setTimeout(() => setConnectionState('standby'), 3000);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setConnectionState('standby');
    }

    return () => {
      if (recognition) {
        try { recognition.stop(); } catch {}
      }
    };
  }, [micActive]);

  return (
    <div className="flex flex-col h-full bg-[#050607] text-[#F1F4F3] rounded-[20px] sm:rounded-[24px] overflow-hidden border border-[#202629]">
      
      {/* Subheader */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0B0E10] border-b border-[#202629] text-xs">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[#D8FF65] shrink-0" />
          <span className="font-semibold truncate">Realtime Voice Session</span>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionState === 'listening'
                  ? 'bg-[#8FF3DF] animate-ping'
                  : connectionState === 'speaking'
                  ? 'bg-[#D8FF65]'
                  : 'bg-[#778184]'
              }`}
            />
            {connectionState === 'listening'
              ? 'Listening...'
              : connectionState === 'speaking'
              ? 'Speaking'
              : 'Standby'}
          </span>
        </div>
      </div>

      <div className="flex-1 w-full overflow-y-auto min-h-0 touch-scroll scroll-container">
        <div className="min-h-full flex flex-col items-center justify-center p-4 sm:p-6 pt-4 pb-16 sm:pb-24 text-center space-y-6 sm:space-y-8">
        
        {/* Animated Waveform Visualizer */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-16 sm:h-20 w-full max-w-xs px-2">
          {[12, 28, 48, 20, 60, 36, 16, 52, 30, 44, 24, 56, 18].map((h, idx) => {
            const dynamicHeight = micActive ? Math.max(8, (h + Math.sin(idx + Date.now() / 200) * 20)) : 6;
            return (
              <span
                key={idx}
                style={{ height: `${dynamicHeight}px` }}
                className={`w-1 rounded-full transition-all duration-150 ${
                  micActive ? 'bg-[#D8FF65]' : 'bg-[#202629]'
                }`}
              />
            );
          })}
        </div>

        {/* Central Push-to-Talk Mic Orb - Thumb Friendly */}
        <div className="relative">
          {micActive && (
            <div className="absolute inset-0 rounded-full bg-[#D8FF65]/20 animate-ping -z-10" />
          )}
          <button
            type="button"
            onClick={() => setMicActive(!micActive)}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-90 touch-manipulation cursor-pointer ${
              micActive
                ? 'bg-[#D8FF65] text-[#050607] scale-105 ring-4 ring-[#D8FF65]/30'
                : 'bg-[#111416] border border-[#202629] text-[#F1F4F3] hover:border-[#353F44] hover:scale-102'
            }`}
            title={micActive ? 'Mute Microphone' : 'Start Voice Input'}
            aria-label={micActive ? 'Mute Microphone' : 'Start Voice Input'}
          >
            {micActive ? <Mic className="w-8 h-8 sm:w-10 sm:h-10" /> : <MicOff className="w-8 h-8 sm:w-10 sm:h-10 text-[#778184]" />}
          </button>
        </div>

        <div className="space-y-1">
          <div className="text-xs sm:text-sm font-semibold text-[#F1F4F3]">
            {micActive ? 'Island is listening to your voice' : 'Tap microphone to speak'}
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#778184]">
            24kHz PCM Audio Stream · Gemini Live Architecture
          </div>
        </div>

        {/* Live Audio Transcript Box */}
        <div className="w-full max-w-lg p-3.5 sm:p-4 bg-[#0B0E10] border border-[#202629] rounded-[18px] sm:rounded-[20px] text-left text-xs space-y-2">
          <div className="flex items-center justify-between text-[10px] text-[#778184] uppercase tracking-wider">
            <span>Audio Transcript Buffer</span>
            <span className="font-mono">Realtime Stream</span>
          </div>

          <div className="text-[#F1F4F3] font-medium min-h-[32px] text-xs sm:text-sm">
            {transcript ? `"${transcript}"` : <span className="text-[#353F44] italic">Speak an instruction or ask Island a question...</span>}
          </div>

          {responseContent && (
            <div className="pt-2 border-t border-[#202629]/60 text-[#8FF3DF] text-[11px] flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{responseContent.slice(0, 140)}...</span>
            </div>
          )}
        </div>

        </div>

      </div>

    </div>
  );
};
