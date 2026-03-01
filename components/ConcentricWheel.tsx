import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WheelItem } from '../types';
import { COLD_COLORS, HOT_COLORS, NATURE_COLORS, getColor } from '../utils/colors';
import { audioService } from '../services/audio';

interface ConcentricWheelProps {
  outerItems: WheelItem[];
  innerItems: WheelItem[];
  extraItems?: WheelItem[]; // Items for the 3rd wheel
  onSpinEnd: (result: { outer: WheelItem; inner: WheelItem; extra?: WheelItem }) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  showExtraWheel: boolean;
}

const OUTER_SIZE = 800; // ViewBox size
const CENTER_BTN_RATIO = 0.15; // Radius ~60px

// Standardize angles to [0, 360)
const normalizeAngle = (angle: number) => {
  return ((angle % 360) + 360) % 360;
};

const ConcentricWheel: React.FC<ConcentricWheelProps> = ({
  outerItems,
  innerItems,
  extraItems = [],
  onSpinEnd,
  isSpinning,
  setIsSpinning,
  showExtraWheel
}) => {
  // Display state
  const [outerAngle, setOuterAngle] = useState(0);
  const [innerAngle, setInnerAngle] = useState(0);
  const [extraAngle, setExtraAngle] = useState(0);
  
  // Refs for logic
  const outerAngleRef = useRef(0);
  const innerAngleRef = useRef(0);
  const extraAngleRef = useRef(0);
  
  // Animation refs
  const animFrameRef = useRef<number>(0);
  const velocitiesRef = useRef({ outer: 0, inner: 0, extra: 0 });
  const startTimeRef = useRef<number>(0);
  const totalSpinTimeRef = useRef<number>(0);
  
  // Sound throttling
  const lastSoundOuterRef = useRef<number>(0);
  const lastSoundInnerRef = useRef<number>(0);
  const lastSoundExtraRef = useRef<number>(0);

  // --- HELPER FUNCTIONS ---

  const getCoordinatesForPercent = (percent: number, radius: number) => {
    const x = radius * Math.cos(2 * Math.PI * percent);
    const y = radius * Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const makeSlicePath = (startPercent: number, endPercent: number, radius: number) => {
    const [startX, startY] = getCoordinatesForPercent(startPercent, radius);
    const [endX, endY] = getCoordinatesForPercent(endPercent, radius);
    const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;

    return [
      `M ${0} ${0}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `Z`
    ].join(' ');
  };

  // --- SPIN LOGIC ---

  const checkClickSound = (prevAngle: number, nextAngle: number, itemCount: number, lastSoundRef: React.MutableRefObject<number>) => {
    if (itemCount === 0) return;
    const sliceSize = 360 / itemCount;
    const prevTick = Math.floor(prevAngle / sliceSize);
    const nextTick = Math.floor(nextAngle / sliceSize);
    
    if (prevTick !== nextTick) {
      const now = performance.now();
      if (now - lastSoundRef.current > 50) { 
        audioService.playTick();
        lastSoundRef.current = now;
      }
    }
  };

  const calculateResult = () => {
    const getWinnerByAngle = (currentRotation: number, items: WheelItem[]) => {
      if (!items || items.length === 0) return { id: 'unknown', text: '?' };
      
      const sliceAngle = 360 / items.length;
      // Logic: Pointer at 0 (3 o'clock). Winner Index = floor((0 - rotation) / slice)
      const pointerLocalAngle = normalizeAngle(0 - currentRotation);
      const index = Math.floor(pointerLocalAngle / sliceAngle);
      const safeIndex = Math.max(0, Math.min(index, items.length - 1));

      return items[safeIndex];
    };

    const outerWinner = getWinnerByAngle(outerAngleRef.current, outerItems);
    const innerWinner = getWinnerByAngle(innerAngleRef.current, innerItems);
    const extraWinner = showExtraWheel ? getWinnerByAngle(extraAngleRef.current, extraItems) : undefined;

    return { outer: outerWinner, inner: innerWinner, extra: extraWinner };
  };

  const finishSpin = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const result = calculateResult();
    setIsSpinning(false);
    onSpinEnd(result);
  };

  const handleSpinClick = useCallback(() => {
    if (isSpinning) return;
    if (outerItems.length === 0 || innerItems.length === 0) return;
    if (showExtraWheel && extraItems.length === 0) return;

    setIsSpinning(true);
    
    const duration = 4000 + Math.random() * 3000;
    totalSpinTimeRef.current = duration;
    startTimeRef.current = performance.now();

    // Velocity: deg/frame
    // Outer (CW), Inner (CCW), Extra (CW)
    velocitiesRef.current = {
      outer: 25 + Math.random() * 15, 
      inner: -1 * (20 + Math.random() * 15),
      extra: 22 + Math.random() * 15
    };

    const animate = (time: number) => {
      const elapsed = time - startTimeRef.current;
      const progress = Math.min(elapsed / totalSpinTimeRef.current, 1);
      
      const ease = 1 - Math.pow(1 - progress, 3);
      
      if (progress < 1) {
        // Friction
        velocitiesRef.current.outer *= 0.99; 
        velocitiesRef.current.inner *= 0.99;
        velocitiesRef.current.extra *= 0.99;

        const prevOuter = outerAngleRef.current;
        const prevInner = innerAngleRef.current;
        const prevExtra = extraAngleRef.current;

        // Update Refs
        outerAngleRef.current += velocitiesRef.current.outer;
        innerAngleRef.current += velocitiesRef.current.inner;
        if (showExtraWheel) extraAngleRef.current += velocitiesRef.current.extra;

        // Sound
        checkClickSound(prevOuter, outerAngleRef.current, outerItems.length, lastSoundOuterRef);
        checkClickSound(prevInner, innerAngleRef.current, innerItems.length, lastSoundInnerRef);
        if (showExtraWheel) {
            checkClickSound(prevExtra, extraAngleRef.current, extraItems.length, lastSoundExtraRef);
        }

        // Sync State
        setOuterAngle(outerAngleRef.current);
        setInnerAngle(innerAngleRef.current);
        if (showExtraWheel) setExtraAngle(extraAngleRef.current);

        if (elapsed > totalSpinTimeRef.current && Math.abs(velocitiesRef.current.outer) < 0.05) {
           finishSpin();
           return;
        }
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
         // Drift
         velocitiesRef.current.outer *= 0.92;
         velocitiesRef.current.inner *= 0.92;
         velocitiesRef.current.extra *= 0.92;

         const stopCondition = Math.abs(velocitiesRef.current.outer) < 0.01 && Math.abs(velocitiesRef.current.inner) < 0.01;

         if (stopCondition) {
           finishSpin();
         } else {
            const prevOuter = outerAngleRef.current;
            const prevInner = innerAngleRef.current;
            const prevExtra = extraAngleRef.current;

            outerAngleRef.current += velocitiesRef.current.outer;
            innerAngleRef.current += velocitiesRef.current.inner;
            if (showExtraWheel) extraAngleRef.current += velocitiesRef.current.extra;

            checkClickSound(prevOuter, outerAngleRef.current, outerItems.length, lastSoundOuterRef);
            checkClickSound(prevInner, innerAngleRef.current, innerItems.length, lastSoundInnerRef);
            if (showExtraWheel) checkClickSound(prevExtra, extraAngleRef.current, extraItems.length, lastSoundExtraRef);

            setOuterAngle(outerAngleRef.current);
            setInnerAngle(innerAngleRef.current);
            if (showExtraWheel) setExtraAngle(extraAngleRef.current);
            
            animFrameRef.current = requestAnimationFrame(animate);
         }
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [isSpinning, outerItems, innerItems, extraItems, showExtraWheel, setIsSpinning]);

  // --- RENDER ---

  const renderWheel = (items: WheelItem[], radius: number, innerBoundaryRadius: number, colors: string[], rotation: number) => {
    if (!items || items.length === 0) return null;
    const sliceAngle = 1 / items.length; 

    // Text Placement Logic
    const bandMiddleRadius = (radius + innerBoundaryRadius) / 2;
    const bandWidth = radius - innerBoundaryRadius;
    const textPathRadius = bandMiddleRadius;

    // Constraints
    const circumference = 2 * Math.PI * textPathRadius;
    const arcLength = circumference / items.length;
    const densityFontSize = Math.min(arcLength * 0.5, 30); 
    const radiusFontSize = bandWidth * 0.22; 

    let baseFontSize = Math.min(densityFontSize, radiusFontSize);
    baseFontSize = Math.max(9, Math.min(baseFontSize, 24));
    
    const maxTextWidth = bandWidth * 0.8; 

    return (
      <g transform={`rotate(${rotation})`}>
        {items.map((item, index) => {
          const start = index * sliceAngle;
          const end = (index + 1) * sliceAngle;
          const midAngleRad = (start + end) / 2 * 2 * Math.PI;
          
          const tx = textPathRadius * Math.cos(midAngleRad);
          const ty = textPathRadius * Math.sin(midAngleRad);
          const rotateText = (start + end) / 2 * 360; 

          // Scaling
          const showNumber = items.length > 30; 
          let displayText = item.text;
          let itemFontSize = baseFontSize;

          if (showNumber) {
            displayText = (index + 1).toString();
          } else {
            const charLimit = 20;
            if (displayText.length > charLimit) {
               displayText = displayText.substring(0, charLimit - 2) + '..';
            }
            const estimatedWidth = displayText.length * (baseFontSize * 0.55);
            if (estimatedWidth > maxTextWidth) {
               const scale = maxTextWidth / estimatedWidth;
               itemFontSize = Math.max(8, baseFontSize * scale);
            }
          }

          return (
            <g key={item.id}>
              <path
                d={makeSlicePath(start, end, radius)}
                fill={getColor(index, colors)}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={tx}
                y={ty}
                fill="white"
                fontSize={itemFontSize}
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${rotateText}, ${tx}, ${ty})`}
                style={{ pointerEvents: 'none', textShadow: '0px 1px 2px rgba(0,0,0,0.3)' }}
              >
                {displayText}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  // Define Layout Radii
  const maxR = OUTER_SIZE / 2; // 400
  const btnR = maxR * CENTER_BTN_RATIO; // 60
  
  // Dynamic Sizing
  // If 3 wheels: Outer(400->280), Middle(280->160), Inner(160->60)
  // If 2 wheels: Outer(400->240), Middle(240->60)
  
  let outerInnerR = 240;
  let midOuterR = 240;
  let midInnerR = 60;
  let extraOuterR = 0;
  let extraInnerR = 0;

  if (showExtraWheel) {
    outerInnerR = 280;
    midOuterR = 280;
    midInnerR = 160;
    extraOuterR = 160;
    extraInnerR = btnR; // 60
  } else {
    // Original layout for 2 wheels
    outerInnerR = 240;
    midOuterR = 240;
    midInnerR = btnR; // 60
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-visible">
      
      {/* Invisible Ray */}
      <div className="absolute top-1/2 right-0 w-[50%] h-[2px] bg-red-500/20 pointer-events-none z-10 origin-right"></div>

      {/* Pointer */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 z-30 drop-shadow-xl pointer-events-none -mr-2">
        <svg width="60" height="60" viewBox="0 0 40 48" style={{ filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.4))' }}>
            <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF8E1" /> 
                    <stop offset="20%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#B8860B" />
                    <stop offset="80%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#FDB931" />
                </linearGradient>
            </defs>
            <path d="M 40 0 L 0 24 L 40 48 Z" fill="url(#goldGradient)" stroke="#8A6E2F" strokeWidth="1.5" />
        </svg>
      </div>

      <svg 
        viewBox={`-${OUTER_SIZE/2} -${OUTER_SIZE/2} ${OUTER_SIZE} ${OUTER_SIZE}`} 
        className="w-[95%] max-w-[800px] aspect-square drop-shadow-2xl"
        style={{ overflow: 'visible' }}
      >
        {/* Layer 1: Outer Wheel (Students) */}
        {renderWheel(outerItems, maxR, outerInnerR, COLD_COLORS, outerAngle)}
        
        {/* Layer 2: Middle Wheel (Questions) */}
        {renderWheel(innerItems, midOuterR, midInnerR, HOT_COLORS, innerAngle)}
        
        {/* Layer 3: Extra Wheel (Time) - Optional */}
        {showExtraWheel && renderWheel(extraItems, extraOuterR, extraInnerR, NATURE_COLORS, extraAngle)}
        
        {/* Center Button Decoration */}
        <circle cx="0" cy="0" r={btnR + 8} fill="white" opacity="0.3" />
        <circle cx="0" cy="0" r={btnR + 4} fill="rgba(255,255,255,0.8)" />
      </svg>

      {/* Interactive Center Button */}
      <button
        onClick={handleSpinClick}
        disabled={isSpinning || outerItems.length === 0 || innerItems.length === 0 || (showExtraWheel && extraItems.length === 0)}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 rounded-full bg-gradient-to-br from-rose-500 to-red-700 text-white font-black text-xl md:text-2xl tracking-widest shadow-[0_0_25px_rgba(225,29,72,0.5)] border-4 border-white transition-all active:scale-95 flex items-center justify-center ${isSpinning ? 'cursor-not-allowed opacity-90 scale-95' : 'hover:scale-110 hover:shadow-[0_0_40px_rgba(225,29,72,0.8)]'}`}
        style={{
            width: `${CENTER_BTN_RATIO * 100}%`,
            height: `${CENTER_BTN_RATIO * 100}%`,
            maxWidth: '140px',
            maxHeight: '140px',
            minWidth: '80px',
            minHeight: '80px'
        }}
      >
        {isSpinning ? (
            <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
        ) : 'QUAY'}
      </button>
    </div>
  );
};

export default ConcentricWheel;