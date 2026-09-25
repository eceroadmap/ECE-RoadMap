import React, { useState } from 'react';
import { 
  Users, 
  Send, 
  Instagram, 
  BookOpen, 
  Download, 
  ExternalLink, 
  Award, 
  ShieldCheck, 
  FileText,
  Share2,
  FolderArchive,
  Search,
  Layers,
  GraduationCap
} from 'lucide-react';
import { StudentResource, HubCategory } from '../types';
import { RESOURCES_DATA } from '../data/resources';
import { ResourceCard } from './ResourceCard';
import { CommunityTipsSection } from './CommunityTipsSection';

interface StudentHubSectionProps {
  onSelectCourseName?: (courseName: string) => void;
}

export const StudentHubSection: React.FC<StudentHubSectionProps> = ({
  onSelectCourseName
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categoryGroups = [
    { id: 'all', label: 'جميع المصادر' },
    { id: 'academic', label: 'المصادر الأكاديمية (محاضرات وملاحق ومراجع ومخابر)' },
    { id: 'communication', label: 'قنوات التواصل (Telegram / Instagram)' },
    { id: 'tools', label: 'الأدوات والبرمجيات وحاسبات الويب' },
    { id: 'links', label: 'الروابط الجامعية والرسمية' }
  ];

  const featuredResource = RESOURCES_DATA.find((r) => r.isFeatured);
  const otherResources = RESOURCES_DATA.filter((r) => !r.isFeatured);

  const filterByGroup = (res: StudentResource, group: string) => {
    if (group === 'all') return true;
    if (group === 'academic') return res.category === 'academic' || res.category === 'references';
    if (group === 'communication') return res.category === 'telegram' || res.category === 'communities';
    if (group === 'tools') return res.category === 'software';
    if (group === 'links') return res.category === 'links';
    return true;
  };

  const filteredResources = otherResources.filter((r) => {
    const matchesGroup = filterByGroup(r, activeCategory);
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      r.titleAr.toLowerCase().includes(query) ||
      r.descriptionAr.toLowerCase().includes(query) ||
      r.tags.some(t => t.toLowerCase().includes(query));
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-mono">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          مركز التوجيه والروابط الطلابية
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Student Hub &bull; مركز الطالب
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          الدليل المرجعي الموثوق للمحاضرات المفرغة، ملاحق القوانين، قنوات تيليغرام الرسمية، برمجيات المخابر، وروابط كلية الهمك بجامعة دمشق.
        </p>
      </div>

      {/* Community Tips & Advice Section (Displayed at Top as requested) */}
      <CommunityTipsSection />

      {/* Featured Resource Spotlight: فريق نُون الأكاديمي */}
      {featuredResource && (
        <div 
          id="featured-noon-team-card"
          className="rounded-3xl bg-gradient-to-br from-[#0b1c36] via-[#08152b] to-[#050e1c] border border-cyan-500/50 p-6 sm:p-8 shadow-2xl relative overflow-hidden ring-1 ring-cyan-500/20"
        >
          {/* Subtle decorative glow */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-xl shadow-lg shadow-cyan-950">
                  نُون
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {featuredResource.titleAr}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/60 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      مبادرة أكاديمية معتمدة
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {featuredResource.descriptionAr}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>أرشيف دوري لسنوات القسم</span>
              </div>
            </div>

            {/* Dedicated Hub Areas for Noon Team */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {/* Telegram Channel */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-sky-950/60 border border-sky-800/40 flex items-center justify-center text-sky-400 mb-2">
                    <Send className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">قناة Telegram الرسمية</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    نشر المحاضرات والملخصات اليومية والإعلانات الأكاديمية الرسمية.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[11px] text-cyan-400/90 italic block">
                    مساحة مخصصة للرابط المعتمد
                  </span>
                </div>
              </div>

              {/* Instagram Account */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-pink-950/60 border border-pink-800/40 flex items-center justify-center text-pink-400 mb-2">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">حساب Instagram</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    متابعة التغطيات والأنشطة الأكاديمية والفعاليات ومعارض التخرج.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[11px] text-cyan-400/90 italic block">
                    مساحة مخصصة لحساب الإنستغرام
                  </span>
                </div>
              </div>

              {/* Lecture & Courses Archive */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400 mb-2">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">مستودع الملاحق والمحاضرات</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    ملفات المقررات، ملاحق القوانين، مسائل الدورات، والمشاريع المخبرية.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[11px] text-cyan-400/90 italic block">
                    مساحة مخصصة لرابط الأرشيف
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categoryGroups.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المصادر والمراجع..."
              className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onSelectCourseName={onSelectCourseName}
          />
        ))}
      </div>
    </div>
  );
};
