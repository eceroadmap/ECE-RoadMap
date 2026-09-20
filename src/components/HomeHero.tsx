import React from 'react';
import { ArrowLeft, Compass, Map, ChevronDown, Laptop, Sparkles, QrCode } from 'lucide-react';
import { ActiveTab } from '../types';

interface HomeHeroProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onScrollToJourney: () => void;
  onOpenExhibition?: () => void;
  onOpenQRModal?: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onNavigateTab,
  onScrollToJourney,
  onOpenExhibition,
  onOpenQRModal
}) => {
  return (
    <section className="relative pt-6 pb-14 sm:pt-10 sm:pb-20 md:pt-16 md:pb-24 overflow-hidden">
      {/* Decorative Technical Microchip & Waveform SVG Canvas Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-full pointer-events-none opacity-20 -z-10 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 900 650" className="w-full h-auto max-h-full stroke-cyan-500/40" fill="none">
          <defs>
            <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Concentric Spectrum & Radar Waveforms */}
          <circle cx="450" cy="325" r="120" strokeDasharray="3 6" strokeWidth="1" />
          <circle cx="450" cy="325" r="200" strokeDasharray="4 8" strokeWidth="1" />
          <circle cx="450" cy="325" r="300" strokeDasharray="2 6" strokeWidth="0.8" />

          {/* Central Microprocessor Package Geometry */}
          <rect x="380" y="255" width="140" height="140" rx="20" stroke="url(#heroGradient)" strokeWidth="1.75" />
          <rect x="405" y="280" width="90" height="90" rx="10" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.7" />

          {/* Left Bus Pins */}
          <line x1="380" y1="285" x2="300" y2="285" strokeWidth="1.5" />
          <line x1="380" y1="325" x2="260" y2="325" strokeWidth="1.5" />
          <line x1="380" y1="365" x2="300" y2="365" strokeWidth="1.5" />

          {/* Right Bus Pins */}
          <line x1="520" y1="285" x2="600" y2="285" strokeWidth="1.5" />
          <line x1="520" y1="325" x2="640" y2="325" strokeWidth="1.5" />
          <line x1="520" y1="365" x2="600" y2="365" strokeWidth="1.5" />

          {/* Top Bus Pins */}
          <line x1="410" y1="255" x2="410" y2="180" strokeWidth="1.5" />
          <line x1="450" y1="255" x2="450" y2="150" strokeWidth="1.5" />
          <line x1="490" y1="255" x2="490" y2="180" strokeWidth="1.5" />

          {/* Bottom Bus Pins */}
          <line x1="410" y1="395" x2="410" y2="470" strokeWidth="1.5" />
          <line x1="450" y1="395" x2="450" y2="500" strokeWidth="1.5" />
          <line x1="490" y1="395" x2="490" y2="470" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Top Product & Fair Badge */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-mono tracking-wide backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            ECE RoadMap &bull; دمشق
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium backdrop-blur-sm">
            <span>كلية الهمك</span>
            <span className="text-slate-600">•</span>
            <span>جامعة دمشق</span>
          </div>

          {onOpenExhibition && (
            <button
              onClick={onOpenExhibition}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all shadow-sm group min-h-[32px]"
              title="عرض المنصة على الشاشات الكبيرة والمعارض"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>وضع الملتقى (Exhibition)</span>
            </button>
          )}
        </div>

        {/* Main Heading with Fluid Clamp Typography */}
        <h1 className="text-fluid-hero font-black text-white tracking-tight leading-tight mb-4 sm:mb-6">
          <span className="block sm:inline">هندسة الإلكترونيات </span>
          <span className="block sm:inline">والاتصالات</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 via-sky-300 to-blue-500 text-fluid-hero-sub mt-1 sm:mt-2">
            جامعة دمشق
          </span>
        </h1>

        {/* Supporting Text */}
        <p className="text-sm sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium mb-8 sm:mb-10 px-2">
          &quot;خارطتك الأكاديمية من أول يوم حتى التخرج&quot;
        </p>

        {/* Primary, Secondary, & Tertiary CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-lg mx-auto mb-12 sm:mb-16 px-2">
          {/* Primary CTA */}
          <button
            id="hero-cta-start"
            onClick={onScrollToJourney}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-950/70 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 group min-h-[44px]"
          >
            <Compass className="w-4 h-4 text-cyan-100 group-hover:rotate-45 transition-transform" />
            <span>ابدأ رحلتك</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Secondary CTA */}
          <button
            id="hero-cta-explore-years"
            onClick={() => onNavigateTab('roadmap')}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md min-h-[44px]"
          >
            <Map className="w-4 h-4 text-cyan-400" />
            <span>استكشف السنوات</span>
          </button>

          {/* Tertiary CTA: Laptop Advisor */}
          <button
            id="hero-cta-laptop"
            onClick={() => onNavigateTab('laptop')}
            className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-blue-500/40 font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
          >
            <Laptop className="w-4 h-4 text-blue-400" />
            <span>مستشار اللابتوب</span>
          </button>
        </div>

        {/* High-Level Department Architecture Key Highlights (Statistics) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {/* Stat 1: 5 Years */}
          <div 
            onClick={() => onNavigateTab('roadmap')}
            className="p-3.5 sm:p-4 rounded-2xl bg-[#081324]/90 hover:bg-[#0b1b33] border border-cyan-900/40 hover:border-cyan-500/50 backdrop-blur-sm text-right transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono group-hover:scale-105 transition-transform">05</span>
              <span className="text-[9px] font-mono text-slate-500">STAGE</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors">سنوات دراسية</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 line-clamp-1">من التأسيس إلى التخرج</p>
            </div>
          </div>

          {/* Stat 2: 10 Semesters */}
          <div 
            onClick={() => onNavigateTab('roadmap')}
            className="p-3.5 sm:p-4 rounded-2xl bg-[#081324]/90 hover:bg-[#0b1b33] border border-blue-900/40 hover:border-blue-400/50 backdrop-blur-sm text-right transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-black text-blue-400 font-mono group-hover:scale-105 transition-transform">10</span>
              <span className="text-[9px] font-mono text-slate-500">SEMESTERS</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white mt-1 group-hover:text-blue-300 transition-colors">فصول دراسية</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 line-clamp-1">خطة أكاديمية معتمدة</p>
            </div>
          </div>

          {/* Stat 3: 50+ Courses */}
          <div 
            onClick={() => onNavigateTab('courses')}
            className="p-3.5 sm:p-4 rounded-2xl bg-[#081324]/90 hover:bg-[#0b1b33] border border-sky-900/40 hover:border-sky-400/50 backdrop-blur-sm text-right transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-black text-sky-400 font-mono group-hover:scale-105 transition-transform">50+</span>
              <span className="text-[9px] font-mono text-slate-500">COURSES</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white mt-1 group-hover:text-sky-300 transition-colors">مقرراً تخصصياً</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 line-clamp-1">إلكترونيات واتصالات</p>
            </div>
          </div>

          {/* Stat 4: 16 Software Tools */}
          <div 
            onClick={() => onNavigateTab('software')}
            className="p-3.5 sm:p-4 rounded-2xl bg-[#081324]/90 hover:bg-[#0b1b33] border border-emerald-900/40 hover:border-emerald-400/50 backdrop-blur-sm text-right transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono group-hover:scale-105 transition-transform">16</span>
              <span className="text-[9px] font-mono text-slate-500">SOFTWARE</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors">أداة برمجية ومحاكاة</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 line-clamp-1">MATLAB, HFSS والمزيد</p>
            </div>
          </div>
        </div>

        {/* Down Scroll Indicator */}
        <div className="mt-8 sm:mt-12 flex justify-center">
          <button 
            onClick={onScrollToJourney}
            className="p-2.5 text-slate-400 hover:text-cyan-400 transition-colors animate-bounce min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="الانتقال لأسفل"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
