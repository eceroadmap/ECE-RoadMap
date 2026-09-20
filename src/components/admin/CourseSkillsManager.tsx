import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  BookOpen, 
  Cpu, 
  Briefcase, 
  GraduationCap, 
  RefreshCw, 
  Check, 
  AlertCircle,
  ExternalLink,
  Layers,
  Award,
  X
} from 'lucide-react';
import { courseSkillsService, SkillPipeline, DEFAULT_SKILL_PIPELINES } from '../../services/courseSkillsService';
import { COURSES_DATA } from '../../data/courses';

export const CourseSkillsManager: React.FC = () => {
  const [pipelines, setPipelines] = useState<SkillPipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingPipeline, setEditingPipeline] = useState<SkillPipeline | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<SkillPipeline>>({
    id: '',
    category: 'signals',
    categoryLabelAr: 'معالجة الإشارة والاتصالات الرقمية',
    courseNameAr: '',
    courseId: '',
    courseYear: 3,
    toolName: '',
    toolCategory: '',
    learningCourseTitle: '',
    learningPlatform: '',
    practicalSkillTitle: '',
    skillOutcomeAr: '',
    careerPathAr: '',
    accentColor: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300'
  });

  useEffect(() => {
    const unsub = courseSkillsService.subscribePipelines((data, isLoading) => {
      setPipelines(data);
      setLoading(isLoading);
    });
    return () => unsub();
  }, []);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingPipeline(null);
    setFormData({
      id: `pipeline-${Date.now()}`,
      category: 'signals',
      categoryLabelAr: 'معالجة الإشارة والاتصالات الرقمية',
      courseNameAr: '',
      courseId: '',
      courseYear: 3,
      toolName: '',
      toolCategory: 'محاكاة وتحليل',
      learningCourseTitle: '',
      learningPlatform: 'Coursera / Udemy',
      practicalSkillTitle: '',
      skillOutcomeAr: '',
      careerPathAr: '',
      accentColor: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pipeline: SkillPipeline) => {
    setEditingPipeline(pipeline);
    setFormData({ ...pipeline });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف مسار المهارة لمادة "${name}"؟`)) {
      return;
    }
    try {
      await courseSkillsService.deletePipeline(id);
      showFeedback('تم حذف مسار المهارة بنجاح.');
    } catch (e) {
      showFeedback('تعذر حذف المسار، يرجى المحاولة ثانية.', 'error');
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm('هل تريد استيراد المسارات القياسية الخمسة لقسم الإلكترونيات والاتصالات وحفظها في قاعدة البيانات؟')) {
      return;
    }
    try {
      setIsSaving(true);
      const count = await courseSkillsService.seedDefaultPipelines();
      showFeedback(`تم بنجاح حفظ ومزامنة ${count} مسارات قياسية في قاعدة البيانات!`);
    } catch (e) {
      showFeedback('تعذر استيراد المسارات، تأكد من صلاحيات المشرف.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseNameAr || !formData.practicalSkillTitle || !formData.toolName) {
      showFeedback('يرجى ملء اسم المادة، الأداة البرمجية، والمهارة العملية.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const pipelineToSave: SkillPipeline = {
        id: formData.id || `pipeline-${Date.now()}`,
        category: formData.category || 'signals',
        categoryLabelAr: formData.categoryLabelAr || 'هندسة الإلكترونيات والاتصالات',
        courseNameAr: formData.courseNameAr || '',
        courseId: formData.courseId || `course-${Date.now()}`,
        courseYear: Number(formData.courseYear) || 1,
        toolName: formData.toolName || '',
        toolCategory: formData.toolCategory || '',
        learningCourseTitle: formData.learningCourseTitle || '',
        learningPlatform: formData.learningPlatform || '',
        practicalSkillTitle: formData.practicalSkillTitle || '',
        skillOutcomeAr: formData.skillOutcomeAr || '',
        careerPathAr: formData.careerPathAr || '',
        accentColor: formData.accentColor || 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300'
      };

      await courseSkillsService.savePipeline(pipelineToSave);
      showFeedback(editingPipeline ? 'تم تحديث مسار المهارة بنجاح!' : 'تمت إضافة مسار المهارة الجديد وحفظه!');
      setIsModalOpen(false);
    } catch (e) {
      showFeedback('فشل حفظ التعديلات في قاعدة البيانات.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPipelines = pipelines.filter((p) => {
    const matchesSearch = 
      p.courseNameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.practicalSkillTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.careerPathAr.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'جميع المجالات' },
    { id: 'signals', label: 'معالجة الإشارة والاتصالات' },
    { id: 'embedded', label: 'الأنظمة المدمجة و FPGA' },
    { id: 'rf', label: 'الأمواج والهوائيات' },
    { id: 'networks', label: 'الشبكات والبروتوكولات' },
    { id: 'circuits', label: 'الإلكترونيات والـ PCB' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#091527] border border-cyan-500/20 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
            <Sparkles className="w-4 h-4" />
            <span>إدارة وتعديل قسم &quot;من المادة إلى المهارة&quot;</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            تحويل المقررات الأكاديمية إلى مهارات سوق العمل
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            تتيح لك هذه اللوحة ربط أي مقرر دراسي في هندسة الإلكترونيات والاتصالات ببرمجيات المحاكاة العملية، والكورسات الاحترافية، والمهارة الهندسية الفعلية، والمسمى الوظيفي المطلوب في الشركات وسوق العمل.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSeedDefaults}
            disabled={isSaving}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px]"
            title="استيراد وتثبيت المسارات الأساسية في قاعدة بيانات Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSaving ? 'animate-spin' : ''}`} />
            <span>استيراد المسارات القياسية</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-950 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مسار مهارة جديد</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 border animate-fadeIn ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#071120] p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المادة، المهارة، الأداة أو الوظيفة..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none min-h-[40px]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[36px] ${
                selectedCategory === c.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="text-xs">جاري تحميل مسارات المهارات الأكاديمية...</span>
        </div>
      ) : filteredPipelines.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#071120] border border-dashed border-slate-800 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">لم يتم العثور على أي مسارات مهارات مطابقة للبحث</p>
          <p className="text-xs text-slate-500">يمكنك إضافة مسار جديد أو استيراد المسارات القياسية بضغطة زر</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPipelines.map((pipeline) => (
            <div
              key={pipeline.id}
              className="rounded-3xl bg-[#091527] border border-slate-800/90 hover:border-cyan-500/40 p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all group"
            >
              <div className="space-y-3">
                {/* Top Category & Year */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                    السنة {pipeline.courseYear}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[160px]" title={pipeline.categoryLabelAr}>
                    {pipeline.categoryLabelAr}
                  </span>
                </div>

                {/* Course Name */}
                <div>
                  <div className="text-[11px] text-slate-500 font-mono">المقرر الدراسي:</div>
                  <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                    {pipeline.courseNameAr}
                  </h3>
                </div>

                {/* Software / Tool */}
                <div className="p-2.5 rounded-2xl bg-[#060e1a] border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-white font-bold">{pipeline.toolName}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{pipeline.toolCategory}</span>
                </div>

                {/* Practical Skill Title */}
                <div className="space-y-1">
                  <div className="text-[11px] text-cyan-400 font-bold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>المهارة العملية المكتسبة:</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200">
                    {pipeline.practicalSkillTitle}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {pipeline.skillOutcomeAr}
                  </p>
                </div>

                {/* Career Path */}
                <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2 text-xs">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">المسار المهني المستهدف:</span>
                    <span className="text-[11px] text-amber-300 font-bold">{pipeline.careerPathAr}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(pipeline)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1 min-h-[38px] px-3"
                  title="تعديل هذا المسار"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>تعديل</span>
                </button>

                <button
                  onClick={() => handleDelete(pipeline.id, pipeline.courseNameAr)}
                  className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs transition-colors min-h-[38px] px-2.5"
                  title="حذف هذا المسار"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#091527] border border-cyan-500/30 rounded-3xl shadow-2xl p-6 space-y-6 my-8 animate-scaleUp text-right" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingPipeline ? 'تعديل مسار: من المادة إلى المهارة' : 'إضافة مسار تحويل مادة إلى مهارة'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    حدد تفاصيل المقرر والأداة الهندسية والمهارة العملية المكتسبة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Course Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">اسم المقرر الأكاديمي (المادة) *</label>
                  <input
                    type="text"
                    required
                    value={formData.courseNameAr || ''}
                    onChange={(e) => setFormData({ ...formData, courseNameAr: e.target.value })}
                    placeholder="مثال: معالجة الإشارة 1 و 2 أو الدارات المنطقية"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none min-h-[42px]"
                  />
                </div>

                {/* Academic Year */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">السنة الدراسية *</label>
                  <select
                    value={formData.courseYear || 3}
                    onChange={(e) => setFormData({ ...formData, courseYear: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none min-h-[42px]"
                  >
                    <option value={1}>السنة الأولى</option>
                    <option value={2}>السنة الثانية</option>
                    <option value={3}>السنة الثالثة</option>
                    <option value={4}>السنة الرابعة</option>
                    <option value={5}>السنة الخامسة</option>
                  </select>
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">تصنيف المجال الهندسي *</label>
                  <select
                    value={formData.category || 'signals'}
                    onChange={(e) => {
                      const cat = e.target.value;
                      const labels: Record<string, string> = {
                        signals: 'معالجة الإشارة والاتصالات الرقمية',
                        embedded: 'الأنظمة المدمجة والمنطق الرقمي',
                        rf: 'الأمواج الكهرومغناطيسية والهوائيات',
                        networks: 'هندسة الشبكات والبروتوكولات',
                        circuits: 'الإلكترونيات وتصميم الدارات المطبوعة',
                        ai: 'الذكاء الاصطناعي والرؤية الحاسوبية',
                        iot: 'إنترنت الأشياء والأنظمة اللاسلكية'
                      };
                      setFormData({ 
                        ...formData, 
                        category: cat,
                        categoryLabelAr: labels[cat] || 'هندسة الإلكترونيات والاتصالات'
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none min-h-[42px]"
                  >
                    <option value="signals">معالجة الإشارة والاتصالات الرقمية</option>
                    <option value="embedded">الأنظمة المدمجة والمنطق الرقمي</option>
                    <option value="rf">الأمواج الكهرومغناطيسية والهوائيات</option>
                    <option value="networks">هندسة الشبكات والبروتوكولات</option>
                    <option value="circuits">الإلكترونيات وتصميم الدارات المطبوعة</option>
                    <option value="ai">الذكاء الاصطناعي والرؤية الحاسوبية</option>
                    <option value="iot">إنترنت الأشياء والأنظمة اللاسلكية</option>
                  </select>
                </div>

                {/* Software / Tool Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">الأداة أو برنامج المحاكاة المساعد *</label>
                  <input
                    type="text"
                    required
                    value={formData.toolName || ''}
                    onChange={(e) => setFormData({ ...formData, toolName: e.target.value })}
                    placeholder="مثال: MATLAB أو Altium Designer أو Cisco Packet Tracer"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none min-h-[42px]"
                  />
                </div>

                {/* Tool Specialty */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">مجال تخصص الأداة</label>
                  <input
                    type="text"
                    value={formData.toolCategory || ''}
                    onChange={(e) => setFormData({ ...formData, toolCategory: e.target.value })}
                    placeholder="مثال: محاكاة وتوجيه الشبكات، تصميم PCB"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none min-h-[42px]"
                  />
                </div>

                {/* Practical Skill Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">عنوان المهارة العملية المكتسبة *</label>
                  <input
                    type="text"
                    required
                    value={formData.practicalSkillTitle || ''}
                    onChange={(e) => setFormData({ ...formData, practicalSkillTitle: e.target.value })}
                    placeholder="مثال: تصميم المرشحات الرقمية وتحليل طيف التردد"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none min-h-[42px]"
                  />
                </div>

                {/* Learning Course & Platform */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">اسم الدورة الذاتية المقترحة</label>
                  <input
                    type="text"
                    value={formData.learningCourseTitle || ''}
                    onChange={(e) => setFormData({ ...formData, learningCourseTitle: e.target.value })}
                    placeholder="مثال: Cisco CCNA 200-301 Routing & Switching"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none min-h-[42px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">المنصة التعليمية</label>
                  <input
                    type="text"
                    value={formData.learningPlatform || ''}
                    onChange={(e) => setFormData({ ...formData, learningPlatform: e.target.value })}
                    placeholder="مثال: Coursera / Cisco Networking Academy"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none min-h-[42px]"
                  />
                </div>

                {/* Career Path */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300">المسمى الوظيفي في سوق العمل (Career Path) *</label>
                  <input
                    type="text"
                    required
                    value={formData.careerPathAr || ''}
                    onChange={(e) => setFormData({ ...formData, careerPathAr: e.target.value })}
                    placeholder="مثال: مهندس شبكات وبنية تحتية سحابية (Network Engineer)"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none min-h-[42px]"
                  />
                </div>

                {/* Skill Outcome Details */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300">تفاصيل المخرج العملي (ما يستطيع الطالب إنجازه) *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.skillOutcomeAr || ''}
                    onChange={(e) => setFormData({ ...formData, skillOutcomeAr: e.target.value })}
                    placeholder="صف كيف يحول الطالب المعادلات والنظريات الجامعية إلى مخرجات تطبيقية واقعية..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-colors min-h-[44px]"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-cyan-950 min-h-[44px]"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ في Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingPipeline ? 'حفظ التعديلات' : 'إضافة المسار'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
