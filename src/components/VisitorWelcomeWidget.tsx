import React, { useState, useEffect } from 'react';
import { Sparkles, Radio, Users, X } from 'lucide-react';
import { visitorCounterService, VisitorInfo } from '../services/visitorCounterService';

interface VisitorWelcomeWidgetProps {
  onDismiss?: () => void;
}

const WIDGET_DISMISS_KEY = 'ece_welcome_widget_dismissed';

export const VisitorWelcomeWidget: React.FC<VisitorWelcomeWidgetProps> = ({ onDismiss }) => {
  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo>(() => visitorCounterService.getVisitorInfo());
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(WIDGET_DISMISS_KEY) === 'true';
  });

  useEffect(() => {
    const unsub = visitorCounterService.subscribe((info) => {
      setVisitorInfo(info);
    });
    return () => unsub();
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(WIDGET_DISMISS_KEY, 'true');
    } catch {
      // Ignore
    }
    if (onDismiss) onDismiss();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-1" dir="rtl">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#061120]/95 via-[#081930]/95 to-[#061120]/95 border border-cyan-500/30 p-3.5 sm:p-4 shadow-lg shadow-cyan-950/20 backdrop-blur-md">
        {/* Subtle accent light beam */}
        <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-slate-200">
          {/* Right Side: Welcome greeting & Department identity */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-start">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
              <Sparkles className="w-4 h-4" />
            </div>

            <div className="space-y-0.5 text-right">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-sm sm:text-base tracking-wide">
                  أهلاً وسهلاً بك في منصة ECE RoadMap
                </h3>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                <span className="text-[11px] sm:text-xs text-cyan-300/90 font-medium">
                  كلية الهندسة الميكانيكية والكهربائية (الهمك) • جامعة دمشق
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                الدليل الأكاديمي والتقني الشامل لطلاب وخريجي هندسة الإلكترونيات والاتصالات
              </p>
            </div>
          </div>

          {/* Left Side: Real Visitor Number Badge (Static & Non-clickable) */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t border-slate-800/80 md:border-t-0">
            {/* Real Counter Badge Display */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] select-none">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-slate-300 font-medium whitespace-nowrap">
                  أنت الزائر رقم:
                </span>
              </div>

              <div className="px-2.5 py-0.5 rounded-lg bg-cyan-950/90 border border-cyan-400/50 text-cyan-200 font-mono font-black text-sm sm:text-base tracking-wider shadow-inner">
                {visitorInfo.isLoading ? (
                  <span className="animate-pulse text-xs text-cyan-400">جارِ العد...</span>
                ) : (
                  visitorInfo.formattedNumber
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors shrink-0"
              title="إغلاق الترحيب"
              aria-label="إغلاق الترحيب"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
