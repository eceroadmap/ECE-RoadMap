import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  BookOpen, 
  Cpu, 
  TrendingUp, 
  HelpCircle, 
  Users, 
  ArrowLeft,
  CornerDownLeft,
  ArrowUpDown
} from 'lucide-react';
import { Course, SoftwareTool, SkillCourse, FAQItem, StudentResource, ActiveTab } from '../types';
import { COURSES_DATA } from '../data/courses';
import { SOFTWARE_DATA } from '../data/software';
import { SKILL_COURSES_DATA } from '../data/skills';
import { FAQ_DATA } from '../data/faq';
import { RESOURCES_DATA } from '../data/resources';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCourse: (course: Course) => void;
  onSelectSoftware: (software: SoftwareTool) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

type SearchItem = 
  | { type: 'course'; id: string; title: string; subtitle?: string; group: 'courses'; data: Course }
  | { type: 'software'; id: string; title: string; subtitle?: string; group: 'software'; data: SoftwareTool }
  | { type: 'path'; id: string; title: string; subtitle?: string; group: 'paths'; data: SkillCourse }
  | { type: 'resource'; id: string; title: string; subtitle?: string; group: 'resources'; data: StudentResource }
  | { type: 'faq'; id: string; title: string; subtitle?: string; group: 'faq'; data: FAQItem };

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCourse,
  onSelectSoftware,
  onNavigateTab
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'courses' | 'software' | 'paths' | 'resources' | 'faq'>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
      setSelectedIndex(0);
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setSelectedIndex(0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const normalizedQuery = query.trim().toLowerCase();

  // 1. Matched lists by group
  const matchedCourses: SearchItem[] = useMemo(() => {
    return COURSES_DATA.filter((c) => {
      if (!normalizedQuery) return true;
      return (
        c.nameAr.toLowerCase().includes(normalizedQuery) ||
        (c.nameEn && c.nameEn.toLowerCase().includes(normalizedQuery)) ||
        c.tags.some((t) => t.toLowerCase().includes(normalizedQuery)) ||
        c.relatedSoftware.some((s) => s.toLowerCase().includes(normalizedQuery)) ||
        `سنة ${c.year}`.includes(normalizedQuery)
      );
    }).slice(0, 6).map((c) => ({
      type: 'course',
      id: `c-${c.id}`,
      title: c.nameAr,
      subtitle: c.nameEn ? `${c.nameEn} • سنة ${c.year}` : `سنة ${c.year} • فـ${c.semester}`,
      group: 'courses',
      data: c
    }));
  }, [normalizedQuery]);

  const matchedSoftware: SearchItem[] = useMemo(() => {
    return SOFTWARE_DATA.filter((s) => {
      if (!normalizedQuery) return true;
      return (
        s.name.toLowerCase().includes(normalizedQuery) ||
        (s.arabicName && s.arabicName.toLowerCase().includes(normalizedQuery)) ||
        s.categoryLabelAr.toLowerCase().includes(normalizedQuery) ||
        s.usedInCourses.some((c) => c.toLowerCase().includes(normalizedQuery))
      );
    }).slice(0, 5).map((s) => ({
      type: 'software',
      id: `s-${s.id}`,
      title: s.name,
      subtitle: s.arabicName || s.categoryLabelAr,
      group: 'software',
      data: s
    }));
  }, [normalizedQuery]);

  const matchedPaths: SearchItem[] = useMemo(() => {
    return SKILL_COURSES_DATA.filter((sk) => {
      if (!normalizedQuery) return true;
      return (
        sk.titleAr.toLowerCase().includes(normalizedQuery) ||
        (sk.titleEn && sk.titleEn.toLowerCase().includes(normalizedQuery)) ||
        sk.categoryLabelAr.toLowerCase().includes(normalizedQuery) ||
        sk.trackAr.toLowerCase().includes(normalizedQuery)
      );
    }).slice(0, 4).map((sk) => ({
      type: 'path',
      id: `p-${sk.id}`,
      title: sk.titleAr,
      subtitle: `${sk.categoryLabelAr} • ${sk.trackAr}`,
      group: 'paths',
      data: sk
    }));
  }, [normalizedQuery]);

  const matchedResources: SearchItem[] = useMemo(() => {
    return RESOURCES_DATA.filter((r) => {
      if (!normalizedQuery) return true;
      return (
        r.titleAr.toLowerCase().includes(normalizedQuery) ||
        (r.categoryLabelAr && r.categoryLabelAr.toLowerCase().includes(normalizedQuery)) ||
        r.tags.some((t) => t.toLowerCase().includes(normalizedQuery))
      );
    }).slice(0, 4).map((r) => ({
      type: 'resource',
      id: `r-${r.id}`,
      title: r.titleAr,
      subtitle: r.categoryLabelAr,
      group: 'resources',
      data: r
    }));
  }, [normalizedQuery]);

  const matchedFaq: SearchItem[] = useMemo(() => {
    return FAQ_DATA.filter((f) => {
      if (!normalizedQuery) return true;
      return (
        f.questionAr.toLowerCase().includes(normalizedQuery) ||
        f.categoryAr.toLowerCase().includes(normalizedQuery) ||
        f.answerAr.toLowerCase().includes(normalizedQuery)
      );
    }).slice(0, 4).map((f) => ({
      type: 'faq',
      id: `f-${f.id}`,
      title: f.questionAr,
      subtitle: f.categoryAr,
      group: 'faq',
      data: f
    }));
  }, [normalizedQuery]);

  // Flattened active items based on activeFilter
  const visibleItems = useMemo(() => {
    const list: SearchItem[] = [];
    if (activeFilter === 'all' || activeFilter === 'courses') list.push(...matchedCourses);
    if (activeFilter === 'all' || activeFilter === 'software') list.push(...matchedSoftware);
    if (activeFilter === 'all' || activeFilter === 'paths') list.push(...matchedPaths);
    if (activeFilter === 'all' || activeFilter === 'resources') list.push(...matchedResources);
    if (activeFilter === 'all' || activeFilter === 'faq') list.push(...matchedFaq);
    return list;
  }, [activeFilter, matchedCourses, matchedSoftware, matchedPaths, matchedResources, matchedFaq]);

  // Keep selected index in bound
  useEffect(() => {
    setSelectedIndex(0);
  }, [activeFilter, query]);

  const executeItem = (item: SearchItem) => {
    if (item.type === 'course') {
      onSelectCourse(item.data);
      onClose();
    } else if (item.type === 'software') {
      onSelectSoftware(item.data);
      onClose();
    } else if (item.type === 'path') {
      onNavigateTab('develop');
      onClose();
    } else if (item.type === 'resource') {
      onNavigateTab('hub');
      onClose();
    } else if (item.type === 'faq') {
      onNavigateTab('faq');
      onClose();
    }
  };

  // Keyboard Navigation: ArrowDown, ArrowUp, Enter, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (visibleItems.length > 0 ? (prev + 1) % visibleItems.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (visibleItems.length > 0 ? (prev - 1 + visibleItems.length) % visibleItems.length : 0));
      } else if (e.key === 'Enter') {
        if (visibleItems.length > 0 && selectedIndex >= 0 && selectedIndex < visibleItems.length) {
          e.preventDefault();
          executeItem(visibleItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, visibleItems, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-black/85 backdrop-blur-md animate-fadeIn text-right">
      <div 
        className="w-full max-w-2xl bg-[#091322] border border-cyan-800/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800/80 bg-slate-950/70">
          <Search className="w-5 h-5 text-cyan-400 shrink-0 ml-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مادة، برنامج، مسار، مصدر، أو سؤال..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-white"
              title="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="mr-2 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="إغلاق (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Chips by Group */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800/60 bg-slate-900/50 text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'courses', label: `المقررات (${matchedCourses.length})` },
            { id: 'software', label: `البرمجيات (${matchedSoftware.length})` },
            { id: 'paths', label: `المسارات (${matchedPaths.length})` },
            { id: 'resources', label: `المصادر (${matchedResources.length})` },
            { id: 'faq', label: `الأسئلة (${matchedFaq.length})` }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === f.id
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-800/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results Body with clear group sections */}
        <div ref={resultsContainerRef} className="overflow-y-auto p-4 space-y-5">
          {visibleItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium">لم يتم العثور على نتائج تطابق &quot;{query}&quot;</p>
              <p className="text-xs text-slate-400 mt-1">جرب البحث باسم مادة (مثل: إشارة، دارات)، أو برنامج (Quartus, MATLAB) أو مسار.</p>
            </div>
          ) : (
            <>
              {/* Group 1: Courses */}
              {(activeFilter === 'all' || activeFilter === 'courses') && matchedCourses.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      المقررات الدراسية (Courses)
                    </span>
                    <button
                      onClick={() => { onNavigateTab('courses'); onClose(); }}
                      className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      عرض جميع المقررات
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {matchedCourses.map((item) => {
                      const itemGlobalIndex = visibleItems.indexOf(item);
                      const isSelected = itemGlobalIndex === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => executeItem(item)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-cyan-950/60 border-cyan-500/70 shadow-md'
                              : 'bg-slate-900/50 border-slate-800/70 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-950 text-cyan-300 border border-slate-800">
                              سنة {(item.data as any).year}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-white">{item.title}</p>
                              {item.subtitle && <p className="text-xs text-slate-400 font-mono">{item.subtitle}</p>}
                            </div>
                          </div>
                          <CornerDownLeft className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group 2: Software */}
              {(activeFilter === 'all' || activeFilter === 'software') && matchedSoftware.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      البرمجيات الهندسية (Software)
                    </span>
                    <button
                      onClick={() => { onNavigateTab('software'); onClose(); }}
                      className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      عرض جميع البرمجيات
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {matchedSoftware.map((item) => {
                      const itemGlobalIndex = visibleItems.indexOf(item);
                      const isSelected = itemGlobalIndex === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => executeItem(item)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-950/60 border-blue-500/70 shadow-md'
                              : 'bg-slate-900/50 border-slate-800/70 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-bold text-white font-mono">{item.title}</p>
                            {item.subtitle && <p className="text-xs text-slate-400">{item.subtitle}</p>}
                          </div>
                          <CornerDownLeft className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-600'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group 3: Paths */}
              {(activeFilter === 'all' || activeFilter === 'paths') && matchedPaths.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                      مسارات التطوير الذاتي (Paths)
                    </span>
                    <button
                      onClick={() => { onNavigateTab('develop'); onClose(); }}
                      className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      عرض المسارات
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {matchedPaths.map((item) => {
                      const itemGlobalIndex = visibleItems.indexOf(item);
                      const isSelected = itemGlobalIndex === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => executeItem(item)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-cyan-950/60 border-cyan-500/70 shadow-md'
                              : 'bg-slate-900/50 border-slate-800/70 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-bold text-white">{item.title}</p>
                            {item.subtitle && <p className="text-xs text-slate-400">{item.subtitle}</p>}
                          </div>
                          <CornerDownLeft className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group 4: Resources */}
              {(activeFilter === 'all' || activeFilter === 'resources') && matchedResources.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      المصادر وروابط الطالب (Resources)
                    </span>
                    <button
                      onClick={() => { onNavigateTab('hub'); onClose(); }}
                      className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      مركز الطالب
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {matchedResources.map((item) => {
                      const itemGlobalIndex = visibleItems.indexOf(item);
                      const isSelected = itemGlobalIndex === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => executeItem(item)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-purple-950/60 border-purple-500/70 shadow-md'
                              : 'bg-slate-900/50 border-slate-800/70 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-bold text-white">{item.title}</p>
                            {item.subtitle && <p className="text-xs text-slate-400">{item.subtitle}</p>}
                          </div>
                          <CornerDownLeft className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-slate-600'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group 5: FAQ */}
              {(activeFilter === 'all' || activeFilter === 'faq') && matchedFaq.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      الأسئلة الشائعة (FAQ)
                    </span>
                    <button
                      onClick={() => { onNavigateTab('faq'); onClose(); }}
                      className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      عرض الأسئلة
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {matchedFaq.map((item) => {
                      const itemGlobalIndex = visibleItems.indexOf(item);
                      const isSelected = itemGlobalIndex === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => executeItem(item)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-950/60 border-amber-500/70 shadow-md'
                              : 'bg-slate-900/50 border-slate-800/70 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-bold text-white">{item.title}</p>
                            {item.subtitle && <p className="text-xs text-slate-400">{item.subtitle}</p>}
                          </div>
                          <CornerDownLeft className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-600'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with keyboard shortcuts hints */}
        <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">↓</kbd>
              <span>تنقل</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">Enter</kbd>
              <span>فتح النتيجة</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">Esc</kbd>
              <span>إغلاق</span>
            </span>
          </div>

          <span className="text-slate-500 text-[10px]">ECE RoadMap Search</span>
        </div>
      </div>
    </div>
  );
};
