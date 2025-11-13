import React, { useEffect, useState } from 'react';
import { AppContext } from './App';

interface TypingIndicatorProps {
  isTyping: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isTyping }) => {
  const [dots, setDots] = useState('');
  const appContext = React.useContext(AppContext);

  useEffect(() => {
    if (!isTyping) {
      setDots('');
      return;
    }
    const interval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + '.' : ''));
    }, 300);
    return () => clearInterval(interval);
  }, [isTyping]);

  if (!isTyping) return <div style={{ height: '32px' , backgroundColor: appContext.theme.colorNeutralBackground3}} />;

  return (
    <div style={{
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'start',
      fontStyle: 'italic',
      color: '#888',
      transition: 'height 0.2s',
      backgroundColor: appContext.theme.colorNeutralBackground3
    }}>
      Agent is typing{dots}
    </div>
  );
};
