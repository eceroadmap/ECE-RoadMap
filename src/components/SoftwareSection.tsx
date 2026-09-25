import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Search, 
  BookOpen, 
  ArrowLeft, 
  Download, 
  Layers, 
  Radio,
  Globe,
  Code
} from 'lucide-react';
import { SoftwareTool, Course } from '../types';
import { SOFTWARE_DATA } from '../data/software';

interface SoftwareSectionProps {
  onSelectSoftware: (software: SoftwareTool) => void;
  onSelectCourse: (course: Course) => void;
}

export const SoftwareSection: React.FC<SoftwareSectionProps> = ({
  onSelectSoftware
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'جميع البرمجيات (16)' },
    { id: 'simulation', label: 'المحاكاة والدارات' },
    { id: 'math', label: 'الرياضيات والإشارات' },
    { id: 'rf', label: 'الهوائيات وRF' },
    { id: 'networking', label: 'الشبكات والاتصالات' },
    { id: 'embedded', label: 'الأنظمة المضمنة والمعالجات' },
    { id: 'fpga', label: 'الأنظمة الرقمية وFPGA' },
    { id: 'programming', label: 'بيئات البرمجة والتطوير' }
  ];

  const filteredSoftware = useMemo(() => {
    return SOFTWARE_DATA.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchArName = item.arabicName ? item.arabicName.toLowerCase().includes(q) : false;
        const matchCourses = item.usedInCourses.some((c) => c.toLowerCase().includes(q));
        const matchPurpose = item.purpose.toLowerCase().includes(q);
        return matchName || matchArName || matchCourses || matchPurpose;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-mono mb-3">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          الحزمة الهندسية المعتمدة
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          البرمجيات وأدوات المحاكاة
        </h2>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          دليل شامل لكافة البرامج الهندسية المعتمدة في المخابر والامتحانات ومشاريع التخرج بقسم هندسة الإلكترونيات والاتصالات بجامعة دمشق.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4 max-w-5xl mx-auto">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-cyan-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم البرنامج أو المادة المرتبطة به (مثال: MATLAB, Quartus, HFSS, شبكات)..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500/50 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Software Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSoftware.map((software) => (
          <div
            key={software.id}
            id={`software-card-${software.id}`}
            onClick={() => onSelectSoftware(software)}
            className="p-5 rounded-2xl bg-[#091527] border border-slate-800/80 hover:border-cyan-500/50 hover:bg-[#0c1c33] transition-all duration-200 shadow-lg cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              {/* Category & Academic Years */}
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                  {software.categoryLabelAr}
                </span>

                <span className="text-[11px] text-slate-400">
                  سنوات: {software.academicYears.map(y => `سنة ${y}`).join('، ')}
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors font-mono">
                  {software.name}
                </h3>
                {software.arabicName && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {software.arabicName}
                  </p>
                )}
              </div>

              {/* Purpose & Description */}
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {software.purpose}
              </p>

              {/* Used in Courses Pills */}
              <div className="pt-2 border-t border-slate-800/60">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>المقررات المعتمدة:</span>
                  <span className="text-cyan-400 font-mono">({software.usedInCourses.length})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {software.usedInCourses.slice(0, 3).map((cName, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                    >
                      {cName}
                    </span>
                  ))}
                  {software.usedInCourses.length > 3 && (
                    <span className="text-[10px] text-slate-400 px-1 py-0.5">
                      +{software.usedInCourses.length - 3} أخرى
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card Action Link */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium">
              <span>تفاصيل الأداة والتحميل</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {filteredSoftware.length === 0 && (
        <div className="py-16 text-center text-slate-400 max-w-md mx-auto">
          <Cpu className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-200">لم يتم العثور على برمجيات تطابق البحث</p>
          <p className="text-xs text-slate-400 mt-1">يرجى تعديل معايير البحث أو اختيار جميع الفئات.</p>
        </div>
      )}
    </div>
  );
};
