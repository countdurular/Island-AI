import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per chunk
  chunkSize?: number; // chars per tick
  onComplete?: () => void;
  className?: string;
  cursorColor?: string;
  isStreaming?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 12,
  chunkSize = 3,
  onComplete,
  className = '',
  cursorColor = '#D8FF65',
  isStreaming = false,
}) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const textRef = useRef(text);

  // If text changes (e.g. streaming chunks coming in)
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    setDisplayedLength(0);
    setIsTyping(true);
  }, [text.slice(0, 20)]); // Reset only if completely new message

  useEffect(() => {
    if (displayedLength >= text.length) {
      setIsTyping(false);
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedLength((prev) => {
        const next = Math.min(prev + chunkSize, text.length);
        if (next >= text.length) {
          setIsTyping(false);
          onComplete?.();
        }
        return next;
      });
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedLength, text.length, speed, chunkSize, onComplete]);

  // Click to reveal all instantly
  const handleSkip = () => {
    setDisplayedLength(text.length);
    setIsTyping(false);
    onComplete?.();
  };

  const visibleText = text.slice(0, displayedLength);

  return (
    <div
      onClick={isTyping ? handleSkip : undefined}
      className={`relative inline-block cursor-pointer select-text ${className}`}
      title={isTyping ? 'Click to show all' : undefined}
    >
      <span className="whitespace-pre-wrap">{visibleText}</span>
      {(isTyping || isStreaming) && (
        <span
          style={{ color: cursorColor }}
          className="inline-block ml-0.5 font-bold animate-pulse"
        >
          ▌
        </span>
      )}
    </div>
  );
};
