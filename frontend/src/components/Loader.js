import React, { useState, useEffect } from 'react';
import logoMain from "../assets/logo1v3.png";

const SmartSportLoader = ({ autoHide = true }) => {
  const messages = [
    'Loading scores...',
    'Fetching live matches...',
    'Syncing analytics...',
    'Almost ready...'
  ];

  const [messageIndex, setMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // autoHide false නම් data load වෙනකම් loader screen එක පෙන්වයි.
    if (!autoHide) {
      setIsVisible(true);
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
      }, 900);

      return () => {
        clearInterval(interval);
      };
    }

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < messages.length) {
        setMessageIndex(idx);
      } else {
        clearInterval(interval);
      }
    }, 900);

    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
    };
  }, [autoHide, messages.length]);

  return (
    <>
      {/* Tailwind වල නැති Custom Animations ටික ලේසියට මෙතනම දානවා */}
      <style>
        {`
          @keyframes shieldPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(0.92); }
          }
          .animate-shieldPulse { animation: shieldPulse 1.4s ease-in-out infinite; }

          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeSlideUp { animation: fadeSlideUp 0.6s ease both; }

          @keyframes progressGrow {
            0% { width: 0%; }
            30% { width: 35%; }
            60% { width: 68%; }
            85% { width: 88%; }
            100% { width: 100%; }
          }
          .animate-progressGrow { animation: progressGrow 3s ease-in-out forwards; }

          @keyframes dotBounce {
            0%, 80%, 100% { background-color: #252525; transform: scale(1); }
            40% { background-color: #e8f027; transform: scale(1.5); }
          }
          .animate-dotBounce { animation: dotBounce 1.2s ease-in-out infinite; }
        `}
      </style>

      {/* Main Overlay */}
      <div 
        className={`fixed inset-0 bg-[#0d0d0d] flex flex-col items-center justify-center gap-9 z-[9999] font-['DM_Sans',sans-serif] transition-opacity duration-500 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Shield Logo Animation */}
        <div className="relative w-[88px] h-[88px] flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full animate-spin duration-[1400ms]" viewBox="0 0 88 88">
            <circle fill="none" stroke="#1e1e1e" strokeWidth="3" cx="44" cy="44" r="40" />
            <circle 
              fill="none" 
              stroke="#e8f027" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeDasharray="60 100" 
              cx="44" 
              cy="44" 
              r="40" 
            />
          </svg>
          <div className="">
            <img
                            src={logoMain}
                            alt="SmartSport logo"
                            style={{ width: "60px", height: "60px", objectFit: "contain", backgroundColor: "#ffffff", borderRadius: "50%" }}
                          />
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex flex-col items-center gap-2.5 animate-fadeSlideUp" style={{ animationDelay: '0.2s' }}>
          <div className="font-['Bebas_Neue',sans-serif] text-[38px] tracking-[3px] text-white leading-none">
            Smart<span className="text-[#e8f027]">Sport</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-[200px] flex flex-col gap-2 animate-fadeSlideUp" style={{ animationDelay: '0.4s' }}>
          <div className="w-full h-[3px] bg-[#1e1e1e] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#e8f027] rounded-full animate-progressGrow" 
              style={{ animationDelay: '0.5s' }}
            ></div>
          </div>
          <div className="text-[11px] text-[#444] tracking-[1.2px] uppercase text-center">
            {messages[messageIndex]}
          </div>
        </div>

        {/* Bouncing Dots */}
        <div className="flex gap-[7px] animate-fadeSlideUp" style={{ animationDelay: '0.6s' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#252525] animate-dotBounce"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#252525] animate-dotBounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#252525] animate-dotBounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </>
  );
};

export default SmartSportLoader;