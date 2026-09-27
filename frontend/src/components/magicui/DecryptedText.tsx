import React, { useEffect, useState, useRef } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: 'view' | 'hover';
}

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=<>?/~',
  className = '',
  parentClassName = '',
  encryptedClassName = 'text-information/70 font-mono',
  animateOn = 'view',
}) => {
  const [displayText, setDisplayText] = useState<string>(text);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isScrambling, setIsScrambling] = useState<boolean>(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let currentIteration = 0;

    const getNextChar = (originalChar: string) => {
      if (originalChar === ' ') return ' ';
      if (useOriginalCharsOnly) {
        return text[Math.floor(Math.random() * text.length)];
      }
      return characters[Math.floor(Math.random() * characters.length)];
    };

    const runDecryption = () => {
      setIsScrambling(true);
      interval = setInterval(() => {
        setDisplayText(() => {
          return text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';

              if (sequential) {
                if (index < currentIteration) {
                  return char;
                }
                return getNextChar(char);
              } else {
                if (currentIteration >= maxIterations) {
                  return char;
                }
                return Math.random() > 0.5 ? getNextChar(char) : char;
              }
            })
            .join('');
        });

        currentIteration++;

        if (sequential ? currentIteration > text.length : currentIteration > maxIterations) {
          clearInterval(interval);
          setDisplayText(text);
          setIsScrambling(false);
        }
      }, speed);
    };

    if (animateOn === 'view') {
      runDecryption();
    } else if (animateOn === 'hover' && isHovering) {
      runDecryption();
    }

    return () => clearInterval(interval);
  }, [text, speed, maxIterations, sequential, useOriginalCharsOnly, characters, animateOn, isHovering]);

  return (
    <span
      ref={containerRef}
      className={`inline-block select-none ${parentClassName}`}
      onMouseEnter={() => animateOn === 'hover' && setIsHovering(true)}
      onMouseLeave={() => animateOn === 'hover' && setIsHovering(false)}
    >
      <span className={isScrambling ? encryptedClassName : className}>
        {displayText}
      </span>
    </span>
  );
};
