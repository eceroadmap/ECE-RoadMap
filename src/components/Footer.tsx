import React, { useState, useEffect } from 'react';
import { ActiveTab } from '../types';
import { Layers, ShieldCheck, Heart, Users, X, Send, ExternalLink, Sparkles } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  const [showDevModal, setShowDevModal] = useState(false);

  // Close modal on Escape key press and listen for external open trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDevModal(false);
      }
    };
    const handleOpenDevs = () => setShowDevModal(true);

    window.addEventListener('open-devs-modal', handleOpenDevs);
    if (showDevModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('open-devs-modal', handleOpenDevs);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDevModal]);

  return (
    <footer className="relative border-t border-slate-800/80 bg-[#040810] text-slate-400 mt-20 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Column 1: Brand & Department info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <img 
                src="/icon.png" 
                alt="ECE RoadMap Icon" 
                className="w-8 h-8 rounded-lg object-cover border border-cyan-400/40 shadow-sm" 
              />
              <div>
                <span className="text-lg font-bold text-white font-mono">
                  ECE <span className="text-cyan-400">RoadMap</span>
                </span>
                <p className="text-xs text-slate-400 font-medium">
                  هندسة الإلكترونيات والاتصالات - جامعة دمشق
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              خارطة طريق تفاعلية ومنصة إرشادية مخصصة لطلاب ومستجدي قسم هندسة الإلكترونيات والاتصالات في كلية الهندسة الميكانيكية والكهربائية (الهمك) بجامعة دمشق.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>محتوى أكاديمي منظم وفق الخطة الدراسية المعتمدة للقسم</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              أقسام المنصة
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('roadmap')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  الخارطة الأكاديمية التفاعلية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('courses')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  دليل المقررات التخصصية (50+ مادة)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('develop')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  طوّر نفسك (مسارات الاتصالات والبرمجة)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('software')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  حزمة البرمجيات الهندسية المعتمدة
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('laptop')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  مستشار مواصفات اللابتوب
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Academic Community & Hub */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              المجتمع الأكاديمي
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('hub')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Student Hub (المصادر ومجموعات الدفعات)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('hub')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  مبادرة فريق نُون الأكاديمي
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('faq')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  الأسئلة الشائعة
                </button>
              </li>
              <li className="pt-2">
                <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  وجهتك الأكاديمية &bull; المعرض السنوي
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>
            &copy; {new Date().getFullYear()} ECE RoadMap &bull; قسم هندسة الإلكترونيات والاتصالات - جامعة دمشق
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onSelectTab('admin')}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>الإدارة الأكاديمية (CMS)</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              id="open-devs-modal-btn"
              onClick={() => setShowDevModal(true)}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 cursor-pointer group"
              title="مطورو الموقع"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold underline-offset-4 group-hover:underline">مطورو الموقع</span>
            </button>
          </div>
        </div>
      </div>

      {/* نافذة مطورو الموقع (Developers Modal) */}
      {showDevModal && (
        <div
          id="devs-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 transition-all"
          onClick={() => setShowDevModal(false)}
        >
          <div
            id="devs-modal-card"
            className="bg-[#070e18] border border-cyan-500/30 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl shadow-cyan-950/50 relative text-right"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* زر الإغلاق */}
            <button
              id="close-devs-modal-btn"
              onClick={() => setShowDevModal(false)}
              className="absolute top-3 left-3 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              aria-label="إغلاق النافذة"
            >
              <X className="w-4 h-4" />
            </button>

            {/* رأس النافذة */}
            <div className="flex items-center gap-2.5 mb-4 pl-6">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">مطورو الموقع</h3>
                <p className="text-[11px] sm:text-xs text-cyan-400 font-medium mt-0.5">صمم وطور هذا الموقع برعاية وإشراف:</p>
              </div>
            </div>

            {/* قائمة المساهمين وفِرق العمل */}
            <div className="space-y-2.5 text-sm">
              {/* فريق ملتقى وجهتك الأكاديمية */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-blue-950/60 border border-cyan-500/40 shadow-md shadow-cyan-950/40">
                <div className="font-bold text-cyan-300 text-xs mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
                  <span className="text-xs sm:text-sm font-black text-white">فريق ملتقى وجهتك الأكاديمية 2026:</span>
                </div>
                {/* خط الأسماء على سطر واحد على الموبايل */}
                <div className="w-full overflow-hidden">
                  <div className="flex items-center justify-between gap-1 text-[10px] min-[390px]:text-[11px] sm:text-xs font-bold text-cyan-100 whitespace-nowrap">
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-cyan-500/20 border border-cyan-400/30">غياث عثمان</span>
                    <span className="text-cyan-400/60 text-[10px] select-none">•</span>
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-cyan-500/20 border border-cyan-400/30">سنا ذوالغنى</span>
                    <span className="text-cyan-400/60 text-[10px] select-none">•</span>
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-cyan-500/20 border border-cyan-400/30">ليلاس ادلبي</span>
                    <span className="text-cyan-400/60 text-[10px] select-none">•</span>
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-cyan-500/20 border border-cyan-400/30">فاطمة دريع</span>
                  </div>
                </div>
              </div>

              {/* الهيئة الطلابية */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/30 transition-colors flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block shrink-0"></span>
                <span className="text-slate-200 text-[11px] sm:text-xs font-semibold">
                  الهيئة الطلابية في قسم هندسة الإلكترونيات والاتصالات
                </span>
              </div>

              {/* فريق نون التطوعي */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/30 transition-colors flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block shrink-0"></span>
                <span className="text-slate-200 text-[11px] sm:text-xs font-semibold">
                  فريق نون التطوعي
                </span>
              </div>
            </div>

            {/* قسم التواصل والاستفسار */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <span className="text-[11px] sm:text-xs text-slate-300 font-medium">للتواصل والاستفسار:</span>
              <a
                id="dev-telegram-contact-btn"
                href="https://t.me/gh1_ot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 hover:scale-[1.02] cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>تواصل عبر تيليغرام (@gh1_ot)</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
