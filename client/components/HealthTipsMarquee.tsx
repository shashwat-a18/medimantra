import React, { useState, useEffect } from 'react';

interface HealthTip {
  icon: string;
  text: string;
}

interface HealthTipsMarqueeProps {
  tips?: HealthTip[];
  variant?: 'full' | 'compact';
  speed?: 'slow' | 'normal' | 'fast';
}

const defaultTips: HealthTip[] = [
  { icon: '💧', text: 'Drink 8-10 glasses of water daily for optimal hydration' },
  { icon: '🏃‍♂️', text: 'Exercise for 30 minutes daily to boost cardiovascular health' },
  { icon: '🥗', text: 'Eat 5 servings of fruits and vegetables every day' },
  { icon: '😴', text: 'Get 7-9 hours of quality sleep for better mental health' },
  { icon: '🧘‍♀️', text: 'Practice meditation for 10 minutes daily to reduce stress' },
  { icon: '🚭', text: 'Avoid smoking and limit alcohol consumption' },
  { icon: '🦷', text: 'Brush teeth twice daily and floss regularly' },
  { icon: '☀️', text: 'Get 15-20 minutes of sunlight for Vitamin D' },
  { icon: '🧴', text: 'Use sunscreen with SPF 30+ when outdoors' },
  { icon: '🎯', text: 'Schedule regular health checkups and screenings' }
];

const HealthTipsMarquee: React.FC<HealthTipsMarqueeProps> = ({ 
  tips = defaultTips, 
  variant = 'full',
  speed = 'normal'
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const getAnimationDuration = () => {
    switch (speed) {
      case 'slow': return 8000; // 8 seconds per tip
      case 'fast': return 4000; // 4 seconds per tip
      default: return 6000; // 6 seconds per tip
    }
  };

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
    }, getAnimationDuration());

    return () => clearInterval(interval);
  }, [tips.length, isPaused, speed]);

  const getMarqueeClass = () => {
    const baseClass = 'health-tips-marquee-flow';
    return variant === 'compact' 
      ? `${baseClass} ${baseClass}--compact` 
      : baseClass;
  };

  const currentTip = tips[currentTipIndex];

  return (
    <div 
      className={getMarqueeClass()}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="health-tip-flow-container">
        <div 
          key={`${currentTipIndex}-${Date.now()}`}
          className={`health-tip-flowing-item ${isPaused ? 'paused' : ''}`}
          style={{
            animationDuration: `${getAnimationDuration()}ms`,
            animationPlayState: isPaused ? 'paused' : 'running'
          }}
        >
          <span className="health-tip-icon">{currentTip.icon}</span>
          <span className="health-tip-text">{currentTip.text}</span>
        </div>
      </div>
      
      {/* Optional tip indicators */}
      <div className="tip-indicators">
        {tips.map((_, index) => (
          <div
            key={index}
            className={`tip-indicator ${index === currentTipIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HealthTipsMarquee;
