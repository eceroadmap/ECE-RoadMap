import React, { useState, useMemo } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Info, MessageSquare } from 'lucide-react';
import { useLiveFAQs } from '../services/curriculumSyncService';

export const FaqSection: React.FC = () => {
  const liveFaqs = useLiveFAQs();
  const activeFaqs = useMemo(() => {
    return liveFaqs.filter(f => (f as any).status !== 'archived');
  }, [liveFaqs]);

  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'faq-1': true,
    'faq-2': false
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-mono mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          مركز الإجابات والاستفسارات
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          الأسئلة الشائعة (FAQ)
        </h2>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          إجابات على أكثر الاستفسارات تكراراً بين طلاب ومستجدي قسم هندسة الإلكترونيات والاتصالات بجامعة دمشق.
        </p>
      </div>

      {/* Accordion Container */}
      <div className="space-y-3">
        {activeFaqs.map((item) => {
          const isOpen = !!openItems[item.id];
          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-[#091527] border-cyan-500/40 shadow-xl'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Question Header */}
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full p-4 sm:p-5 text-right flex items-center justify-between gap-4 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.categoryAr}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                      {item.questionAr}
                    </h3>
                  </div>
                </div>

                <div className="p-1 rounded-lg text-slate-400">
                  {isOpen ? <ChevronUp className="w-5 h-5 text-cyan-400" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Answer Body */}
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-300">
                    <p>{item.answerAr}</p>
                    {item.isPlaceholder && (
                      <p className="text-[11px] text-slate-400 mt-2 italic flex items-center gap-1.5">
                        <Info className="w-3 h-3 text-cyan-400" />
                        يجري تدقيق وتنسيق الصياغات الرسمية مع إدارة القسم واللجان الأكاديمية.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Suggest a Question Notice */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-[#071324] to-slate-950 border border-slate-800 text-center space-y-2">
        <h4 className="text-xs font-bold text-white">هل لديك استفسار إضافي لم تجده هنا؟</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          يمكنك طرح استفسارك عبر قنوات التواصل الأكاديمية للدفعات أو مراجعة ممثلي قسم الإلكترونيات والاتصالات.
        </p>
      </div>
    </div>
  );
};
