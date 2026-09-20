import React from 'react';
import { ActiveTab } from '../types';
import { Layers, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="relative border-t border-slate-800/80 bg-[#040810] text-slate-400 mt-20 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Column 1: Brand & Department info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white">
                <Layers className="w-4 h-4 text-cyan-100" />
              </div>
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
            <div className="flex items-center gap-1.5">
              <span>صُممت لخدمة وإرشاد طلاب الكلية</span>
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500/30" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
