import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  FolderGit2, 
  Compass, 
  BookOpen, 
  Wrench, 
  Award, 
  ChevronLeft, 
  X, 
  SlidersHorizontal,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  HelpCircle
} from 'lucide-react';
import { GraduationProject, StudentProjectPreferences, ProjectMatchResult } from '../types/graduationProject';
import { graduationProjectRepository } from '../services/graduationProjectRepository';
import { RECOMMENDATION_ENGINE } from '../services/recommendationEngine';
import { COURSES_DATA } from '../data/courses';
import { SOFTWARE_DATA } from '../data/software';
import { GraduationProjectWorkspace } from '../types';

interface GraduationProjectNavigatorSectionProps {
  workspace: GraduationProjectWorkspace;
  onSaveWorkspace: (updated: Partial<GraduationProjectWorkspace>) => void;
  onToggleStarred: (projectId: string) => void;
}

const INTEREST_AREAS_LIST = [
  'الاتصالات',
  'الاتصالات الخليوية',
  'RF / Microwave',
  'Antennas',
  'Digital Signal Processing',
  'Embedded Systems',
  'Microcontrollers',
  'Digital Electronics',
  'Analog Electronics',
  'Computer Architecture',
  'Computer Networks',
  'Optical Communications',
  'Control Systems',
  'Computer Vision',
  'Cyber Security',
  'Software / Web'
];

const SKILLS_LIST = [
  'Programming',
  'C#',
  'C++',
  'MATLAB',
  'Arduino',
  'FPGA / Quartus',
  'ModelSim',
  'HFSS',
  'PSpice',
  'Multisim',
  'Proteus',
  'Packet Tracer',
  'Microwind',
  'OptiWave',
  'VHDL / Verilog',
  'Python',
  'RTOS'
];

export const GraduationProjectNavigatorSection: React.FC<GraduationProjectNavigatorSectionProps> = ({
  workspace,
  onSaveWorkspace,
  onToggleStarred
}) => {
  const [projects, setProjects] = useState<GraduationProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assistant' | 'saved'>('assistant');
  const [assistantStep, setAssistantStep] = useState<'wizard' | 'results'>('wizard');
  const [lowPrefWarning, setLowPrefWarning] = useState(false);

  // Search & Filter state for 'all' tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('all');

  // Modal State
  const [selectedProject, setSelectedProject] = useState<GraduationProject | null>(null);

  // Student Preferences State initialized from workspace
  const [preferences, setPreferences] = useState<StudentProjectPreferences>({
    favoriteCourseIds: workspace.favoriteCourseIds || [],
    interestAreas: workspace.interestAreas || ['الاتصالات', 'Embedded Systems'],
    selectedSkills: workspace.selectedSkills || ['MATLAB', 'C++'],
    selectedTools: workspace.selectedTools || ['matlab', 'arduino'],
    preferredDifficulty: (workspace.preferredDifficulty as any) || 'all',
    projectTypePreference: (workspace.projectTypePreference as any) || 'all'
  });

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const data = await graduationProjectRepository.getProjects();
        if (isMounted) {
          setProjects(data);
          setIsLoading(false);
        }
      } catch (e) {
        console.warn('Error loading graduation projects:', e);
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();

    const unsub = graduationProjectRepository.subscribe((updated) => {
      if (isMounted) {
        setProjects(updated);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Sync preferences to workspace when changed
  const handleUpdatePreferences = (newPrefs: StudentProjectPreferences) => {
    setPreferences(newPrefs);
    onSaveWorkspace({
      favoriteCourseIds: newPrefs.favoriteCourseIds,
      interestAreas: newPrefs.interestAreas,
      selectedSkills: newPrefs.selectedSkills,
      selectedTools: newPrefs.selectedTools,
      preferredDifficulty: newPrefs.preferredDifficulty as any,
      projectTypePreference: newPrefs.projectTypePreference as any
    });
  };

  const starredIds = workspace.starredProjectIds || [];

  // Compute recommendations using the deterministic engine
  const allMatchResults: ProjectMatchResult[] = useMemo(() => {
    return RECOMMENDATION_ENGINE.getRecommendations(projects, preferences);
  }, [projects, preferences]);

  // Strictly select ONLY top 3 active projects
  const topRecommendations = useMemo(() => {
    return allMatchResults.slice(0, 3);
  }, [allMatchResults]);

  // Filtered list for 'all' tab
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (p.active === false) return false;
      if (selectedDifficultyFilter !== 'all' && p.difficulty !== selectedDifficultyFilter) return false;
      if (selectedTypeFilter !== 'all' && p.type !== selectedTypeFilter) return false;
      if (selectedTrackFilter !== 'all' && p.track !== selectedTrackFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (p.titleAr || '').toLowerCase().includes(q) || (p.titleEn || '').toLowerCase().includes(q);
        const matchSummary = (p.summaryAr || '').toLowerCase().includes(q);
        const matchTags = (p.tags || []).some(t => t.toLowerCase().includes(q));
        return matchTitle || matchSummary || matchTags;
      }
      return true;
    });
  }, [projects, selectedDifficultyFilter, selectedTypeFilter, selectedTrackFilter, searchQuery]);

  const savedProjectsList = useMemo(() => {
    return projects.filter(p => starredIds.includes(p.id));
  }, [projects, starredIds]);

  // Handle Wizard Next Step Execution
  const handleRunAssistant = () => {
    const totalPrefCount = 
      preferences.interestAreas.length + 
      preferences.selectedSkills.length + 
      preferences.selectedTools.length + 
      preferences.favoriteCourseIds.length;

    if (totalPrefCount === 0) {
      setLowPrefWarning(true);
      return;
    }

    setLowPrefWarning(false);
    setAssistantStep('results');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* 1. Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0a1829] to-cyan-950 border border-cyan-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>مساعد مشروع التخرج الموجه</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              مساعد مشروع التخرج
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              اختر مهاراتك واهتماماتك ومقرراتك المفضلة، وسيقوم المساعد بمواءمة ملفك الأكاديمي واقتراح أكثر 3 مشاريع تخرج هندسية توافقاً معك.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {activeTab === 'assistant' && assistantStep === 'results' && (
              <button
                type="button"
                onClick={() => setAssistantStep('wizard')}
                className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] min-h-[44px]"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>تعديل التفضيلات</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('assistant')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap min-h-[40px] ${
              activeTab === 'assistant'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>مساعد المشروع</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap min-h-[40px] ${
              activeTab === 'saved'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>المشاريع المحفوظة ({starredIds.length})</span>
          </button>
        </div>
      </div>

      {/* 3. Main Views */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-xs">جاري تحميل مشاريع التخرج وتجهيز مساعد التوصيات...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: ASSISTANT (WIZARD & TOP 3 RESULTS) */}
          {activeTab === 'assistant' && (
            <div className="space-y-6">
              {/* STEP 1: PREFERENCE WIZARD */}
              {assistantStep === 'wizard' && (
                <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 animate-fadeIn">
                  <div className="space-y-2 border-b border-slate-800 pb-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>الخطوة الأولى — تحديد التفضيلات الهندسية</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      ساعدنا نحدد مشروعك المناسب
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                      اختر اهتماماتك ومهاراتك والأدوات التي تفضل العمل بها، وسنقترح لك المشاريع الأكثر توافقاً.
                    </p>
                  </div>

                  {/* LOW PREFERENCE WARNING */}
                  {lowPrefWarning && (
                    <div className="rounded-2xl bg-amber-950/50 border border-amber-500/40 p-4 text-xs text-amber-200 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-amber-300 mb-1">نحتاج معلومات أكثر قليلاً</span>
                        <span>اختر مجالاً واحداً على الأقل ومهارة أو أداة واحدة لتقديم اقتراحات دقيقة.</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Interest Areas Multi-select */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span>اهتماماتك ومجالات التركيز الهندسية</span>
                      </label>
                      <div className="flex flex-wrap gap-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 max-h-52 overflow-y-auto">
                        {INTEREST_AREAS_LIST.map((area) => {
                          const isSelected = preferences.interestAreas.includes(area);
                          return (
                            <button
                              key={area}
                              type="button"
                              onClick={() => {
                                const nextAreas = isSelected
                                  ? preferences.interestAreas.filter(a => a !== area)
                                  : [...preferences.interestAreas, area];
                                handleUpdatePreferences({ ...preferences, interestAreas: nextAreas });
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-md'
                                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}{area}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Skills Multi-select */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span>المهارات واللغات البرمجية والهندسية</span>
                      </label>
                      <div className="flex flex-wrap gap-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 max-h-52 overflow-y-auto">
                        {SKILLS_LIST.map((skill) => {
                          const isSelected = preferences.selectedSkills.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => {
                                const nextSkills = isSelected
                                  ? preferences.selectedSkills.filter(s => s !== skill)
                                  : [...preferences.selectedSkills, skill];
                                handleUpdatePreferences({ ...preferences, selectedSkills: nextSkills });
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-200 shadow-md'
                                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}{skill}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Software Tools Multi-select */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-blue-400" />
                        <span>برمجيات وأدوات المحاكاة المعتمدة</span>
                      </label>
                      <div className="flex flex-wrap gap-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 max-h-48 overflow-y-auto">
                        {SOFTWARE_DATA.slice(0, 12).map((sw) => {
                          const toolKey = sw.id.toLowerCase();
                          const isSelected = preferences.selectedTools.some(t => t.toLowerCase() === toolKey);
                          return (
                            <button
                              key={sw.id}
                              type="button"
                              onClick={() => {
                                const nextTools = isSelected
                                  ? preferences.selectedTools.filter(t => t.toLowerCase() !== toolKey)
                                  : [...preferences.selectedTools, sw.name];
                                handleUpdatePreferences({ ...preferences, selectedTools: nextTools });
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-blue-500/25 border border-blue-400 text-blue-200 shadow-md'
                                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}{sw.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Favorite Courses Multi-select */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-bold text-slate-200 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-400" />
                        <span>المقررات الدراسية المفضلة لديك من الخطة</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 max-h-52 overflow-y-auto">
                        {COURSES_DATA.map((c) => {
                          const isFav = preferences.favoriteCourseIds.includes(c.id);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                const nextFavs = isFav
                                  ? preferences.favoriteCourseIds.filter(id => id !== c.id)
                                  : [...preferences.favoriteCourseIds, c.id];
                                handleUpdatePreferences({ ...preferences, favoriteCourseIds: nextFavs });
                              }}
                              className={`p-2.5 rounded-xl text-right text-xs font-semibold transition-all border flex items-center justify-between ${
                                isFav
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <span className="truncate">{c.nameAr}</span>
                              <span className="shrink-0">{isFav ? '★ مفضلة' : '☆ إضافة'}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Difficulty Preference */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-300">مستوى الصعوبة المفضل للمشروع</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'all', label: 'جميع المستويات' },
                          { id: 'beginner', label: 'مبتدئ' },
                          { id: 'intermediate', label: 'متوسط' },
                          { id: 'advanced', label: 'متقدم / بحثي' }
                        ].map((diff) => (
                          <button
                            key={diff.id}
                            type="button"
                            onClick={() => handleUpdatePreferences({ ...preferences, preferredDifficulty: diff.id as any })}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                              preferences.preferredDifficulty === diff.id
                                ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-md'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {diff.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* NEXT BUTTON */}
                  <div className="pt-6 border-t border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={handleRunAssistant}
                      className="px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] min-h-[48px]"
                    >
                      <span>التالي</span>
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: RESULT SCREEN */}
              {assistantStep === 'results' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Results Header */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-mono font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>حللنا تفضيلاتك ووجدنا لك {topRecommendations.length} مشاريع مناسبة</span>
                      </div>
                      <h2 className="text-xl sm:text-3xl font-black text-white">
                        مشاريع تناسبك
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300">
                        بناءً على تفضيلاتك، هذه المشاريع الأكثر توافقاً مع ملفك.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAssistantStep('wizard')}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-all shrink-0"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                      <span>تعديل التفضيلات</span>
                    </button>
                  </div>

                  {/* NO MATCH STATE */}
                  {topRecommendations.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4">
                      <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
                      <h3 className="text-lg font-bold text-white">لم نجد مشروعاً يطابق تفضيلاتك بشكل كافٍ حالياً.</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        جرب تعديل التفضيلات واختيار مجالات أو أدوات إضافية للحصول على توصيات مناسبة.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setAssistantStep('wizard')}
                          className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                        >
                          تعديل التفضيلات
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* TOP 3 RECOMMENDATION CARDS ONLY */
                    <div className="grid grid-cols-1 gap-6">
                      {topRecommendations.map((res, index) => {
                        const isStarred = starredIds.includes(res.project.id);
                        return (
                          <div
                            key={res.project.id}
                            className="group relative rounded-3xl bg-slate-900/95 border-2 border-slate-800 hover:border-cyan-500/60 p-6 sm:p-8 shadow-2xl transition-all flex flex-col justify-between space-y-6"
                          >
                            <div className="space-y-4">
                              {/* Top metadata & compatibility badge */}
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                                    #{index + 1}
                                  </span>
                                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
                                    {res.project.trackAr || res.project.field || 'هندسة الإلكترونيات والاتصالات'}
                                  </span>
                                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                                    {res.project.difficultyAr || res.project.difficulty}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black flex items-center gap-1.5 shadow-md">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>التوافق {res.score}%</span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleStarred(res.project.id);
                                    }}
                                    title={isStarred ? 'إزالة من المحفوظات' : 'حفظ المشروع'}
                                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                                      isStarred 
                                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    {isStarred ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>

                              {/* Titles */}
                              <div className="space-y-1">
                                <h3 className="text-lg sm:text-2xl font-black text-white group-hover:text-cyan-400 transition-colors leading-snug">
                                  {res.project.titleAr}
                                </h3>
                                {res.project.titleEn && (
                                  <p className="text-xs text-slate-400 italic font-mono">
                                    {res.project.titleEn}
                                  </p>
                                )}
                              </div>

                              {/* Summary */}
                              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                {res.project.summaryAr}
                              </p>

                              {/* "لماذا اقترحناه لك؟" Section */}
                              <div className="rounded-2xl bg-cyan-950/40 border border-cyan-500/30 p-4 space-y-2.5">
                                <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4 text-cyan-400" />
                                  <span>لماذا اقترحناه لك؟</span>
                                </h4>
                                <ul className="space-y-1.5 text-xs text-slate-200">
                                  {res.matchingInterests.length > 0 && (
                                    <li className="flex items-start gap-2">
                                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                      <span>يتوافق مع اهتمامك بـ: <strong className="text-cyan-300">{res.matchingInterests.join('، ')}</strong></span>
                                    </li>
                                  )}
                                  {res.matchingTools.length > 0 && (
                                    <li className="flex items-start gap-2">
                                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                      <span>يتطلب أدوات ومحاكاة اخترتها: <strong className="text-cyan-300">{res.matchingTools.join('، ')}</strong></span>
                                    </li>
                                  )}
                                  {res.matchingCourses.length > 0 && (
                                    <li className="flex items-start gap-2">
                                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                      <span>مرتبط بمواد اخترتها كمفضلة في المنهاج.</span>
                                    </li>
                                  )}
                                  {res.matchingSkills.length > 0 && (
                                    <li className="flex items-start gap-2">
                                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                      <span>يتوافق مع مهاراتك الحالية في: <strong className="text-cyan-300">{res.matchingSkills.join('، ')}</strong></span>
                                    </li>
                                  )}
                                  {!res.matchingInterests.length && !res.matchingTools.length && !res.matchingCourses.length && !res.matchingSkills.length && (
                                    <li className="flex items-start gap-2">
                                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                      <span>{res.recommendationReasonAr}</span>
                                    </li>
                                  )}
                                </ul>
                              </div>

                              {/* Matching and missing badges */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {res.matchingInterests.map((interest, idx) => (
                                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">
                                    اهتمام: {interest}
                                  </span>
                                ))}
                                {res.matchingSkills.map((skill, idx) => (
                                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-[10px]">
                                    مهارة متطابقة: {skill}
                                  </span>
                                ))}
                                {res.matchingTools.map((tool, idx) => (
                                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-950/50 border border-blue-500/40 text-blue-300 text-[10px]">
                                    أداة متطابقة: {tool}
                                  </span>
                                ))}
                                {res.missingSkills.length > 0 && (
                                  <span className="px-2.5 py-1 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 text-[10px]">
                                    مهارات قد تحتاجها: {res.missingSkills.slice(0, 2).join('، ')}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card Footer */}
                            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                              <span className="text-[11px] text-slate-400">
                                حجم الفريق المقترح: {res.project.suggestedTeamSize || '3 طلاب'}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => onToggleStarred(res.project.id)}
                                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    isStarred 
                                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                                  }`}
                                >
                                  {isStarred ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                                  <span>{isStarred ? 'محفوظ' : 'حفظ المشروع'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setSelectedProject(res.project)}
                                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5"
                                >
                                  <span>عرض التفاصيل الكاملة</span>
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SAVED PROJECTS */}

          {/* TAB 3: SAVED PROJECTS */}
          {activeTab === 'saved' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">المشاريع المحفوظة والمختارة للمتابعة ({savedProjectsList.length})</h2>
              </div>

              {savedProjectsList.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
                  <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="text-base font-bold text-white">لا توجد مشاريع محفوظة حالياً</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    انقر على زر الحفظ في أي مشروع لإضافته إلى قائمتك الخاصة ومتابعة ملفاته لاحقاً.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {savedProjectsList.map((proj) => (
                    <div
                      key={proj.id}
                      className="group rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-6 shadow-xl transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold">
                            مشروع محفوظ
                          </span>
                          <button
                            type="button"
                            onClick={() => onToggleStarred(proj.id)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5"
                          >
                            <BookmarkCheck className="w-3.5 h-3.5" />
                            <span>إزالة الحفظ</span>
                          </button>
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-400 transition-colors leading-snug">
                          {proj.titleAr}
                        </h3>

                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                          {proj.summaryAr}
                        </p>
                      </div>

                      <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {proj.trackAr || 'هندسة الاتصالات'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedProject(proj)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs transition-all flex items-center gap-1.5"
                        >
                          <span>عرض التفاصيل</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 4. PROJECT DETAIL MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto text-right">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-semibold">
                    {selectedProject.trackAr || selectedProject.field || 'مشروع هندسي'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                    {selectedProject.difficultyAr || selectedProject.difficulty}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {selectedProject.titleAr}
                </h2>
                {selectedProject.titleEn && (
                  <p className="text-xs text-slate-400 italic">
                    {selectedProject.titleEn}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleStarred(selectedProject.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                    starredIds.includes(selectedProject.id)
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="حفظ المشروع"
                >
                  <Bookmark className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-6">
              {/* Summary */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>ملخص المشروع التنفيذي</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  {selectedProject.summaryAr}
                </p>
              </div>

              {/* Problem Statement */}
              {selectedProject.problemStatementAr && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>مشكلة البحث أو التطبيق الهندسية</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    {selectedProject.problemStatementAr}
                  </p>
                </div>
              )}

              {/* Objectives */}
              {selectedProject.objectivesAr && selectedProject.objectivesAr.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>الأهداف الرئيسية للمشروع</span>
                  </h3>
                  <ul className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    {selectedProject.objectivesAr.map((obj, i) => (
                      <li key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements: Skills & Software */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedProject.requiredSkills && selectedProject.requiredSkills.length > 0 && (
                  <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>المهارات المطلوبة</span>
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedProject.requiredSkills.map((skill, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedProject.requiredSoftware && selectedProject.requiredSoftware.length > 0 && (
                  <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    <h4 className="text-xs font-bold text-blue-300 flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      <span>البرمجيات والأدوات الهندسية</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedProject.requiredSoftware.map((sw, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs">
                          {sw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Related Courses */}
              {selectedProject.relatedCourseIds && selectedProject.relatedCourseIds.length > 0 && (
                <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span>المقررات الدراسية المرتبطة بالمنهاج</span>
                  </h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedProject.relatedCourseIds.map((cId) => {
                      const courseMatch = COURSES_DATA.find(c => c.id === cId);
                      return (
                        <span key={cId} className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-semibold">
                          {courseMatch ? courseMatch.nameAr : cId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-5 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                حجم الفريق المقترح: {selectedProject.suggestedTeamSize || '3 - 4 طلاب'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
