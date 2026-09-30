import { useState, useEffect, useRef, useCallback } from 'react';

// Declarations for browser Web Speech API
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

export interface UseSpeechRecognitionOptions {
  onTranscriptChange?: (transcript: string, isFinal: boolean) => void;
  onListeningChange?: (isListening: boolean) => void;
}

export function useSpeechRecognition(options?: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const SpeechRecognitionClass =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;

    if (SpeechRecognitionClass) {
      setIsSupported(true);
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
          optionsRef.current?.onListeningChange?.(true);
        };

        recognition.onend = () => {
          setIsListening(false);
          optionsRef.current?.onListeningChange?.(false);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.warn('Speech recognition event error:', event.error);
          setIsListening(false);
          optionsRef.current?.onListeningChange?.(false);

          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setError('Microphone access denied. Please grant permission in browser.');
          } else if (event.error === 'no-speech') {
            setError('No speech detected. Try speaking closer to the microphone.');
          } else {
            setError(`Speech recognition error: ${event.error}`);
          }
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentTranscript = '';
          let isFinal = false;

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const res = event.results[i];
            currentTranscript += res[0].transcript;
            if (res.isFinal) {
              isFinal = true;
            }
          }

          if (currentTranscript.trim()) {
            setTranscript(currentTranscript);
            optionsRef.current?.onTranscriptChange?.(currentTranscript, isFinal);
          }
        };

        recognitionRef.current = recognition;
      } catch (err: unknown) {
        console.warn('Failed to initialize SpeechRecognition:', err);
        setIsSupported(false);
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Web Speech API is not supported in this browser.');
      return;
    }
    setError(null);
    setTranscript('');
    try {
      recognitionRef.current.start();
    } catch (err: unknown) {
      // If already started, ignore or restart
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 100);
      } catch {
        setError('Failed to activate microphone speech stream.');
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    toggleListening,
  };
}
