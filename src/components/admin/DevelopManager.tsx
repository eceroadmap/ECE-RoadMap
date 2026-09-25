import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2, 
  Radio, 
  Globe, 
  Code2, 
  Cpu, 
  Monitor, 
  Shield, 
  Eye,
  Loader2
} from 'lucide-react';
import { SkillCourse, SkillCategory } from '../../types';
import { SKILL_COURSES_DATA } from '../../data/skills';
import { adminRepository } from '../../services/admin/adminRepository';

export const DevelopManager: React.FC = () => {
  const [skills, setSkills] = useState<SkillCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SkillCourse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    titleAr: '',
    titleEn: '',
    category: 'communications' as SkillCategory,
    categoryLabelAr: 'الاتصالات اللاسلكية',
    trackAr: '',
    descriptionAr: '',
    relatedSoftware: 'MATLAB, HFSS',
    levelAr: 'متوسط' as 'مبتدئ' | 'متوسط' | 'متقدم',
    isPlanned: true,
    linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
  });

  const loadSkills = async () => {
    setIsLoading(true);
    try {
      const remote = await adminRepository.getSkills();
      if (remote.length > 0) {
        setSkills(remote);
      } else {
        setSkills(SKILL_COURSES_DATA);
      }
    } catch (e) {
      console.warn('Fallback to local skills data:', e);
      setSkills(SKILL_COURSES_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      id: `skill-${Date.now()}`,
      titleAr: '',
      titleEn: '',
      category: 'communications',
      categoryLabelAr: 'الاتصالات اللاسلكية',
      trackAr: '',
      descriptionAr: '',
      relatedSoftware: 'MATLAB',
      levelAr: 'متوسط',
      isPlanned: true,
      linkPlaceholder: 'سيتم إضافة الرابط لاحقاً.'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (skill: SkillCourse) => {
    setEditingItem(skill);
    setFormData({
      id: skill.id,
      titleAr: skill.titleAr,
      titleEn: skill.titleEn || '',
      category: skill.category,
      categoryLabelAr: skill.categoryLabelAr,
      trackAr: skill.trackAr,
      descriptionAr: skill.descriptionAr,
      relatedSoftware: skill.relatedSoftware?.join(', ') || '',
      levelAr: skill.levelAr,
      isPlanned: skill.isPlanned,
      linkPlaceholder: skill.linkPlaceholder || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleAr.trim()) return;

    setIsSaving(true);
    try {
      const softwareArr = formData.relatedSoftware
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload: SkillCourse = {
        id: formData.id,
        titleAr: formData.titleAr.trim(),
        titleEn: formData.titleEn.trim(),
        category: formData.category,
        categoryLabelAr: formData.categoryLabelAr.trim(),
        trackAr: formData.trackAr.trim(),
        descriptionAr: formData.descriptionAr.trim(),
        relatedSoftware: softwareArr,
        levelAr: formData.levelAr,
        isPlanned: formData.isPlanned,
        linkPlaceholder: formData.linkPlaceholder.trim()
      };

      await adminRepository.saveSkill(payload);

      setSkills(prev => {
        const idx = prev.findIndex(s => s.id === payload.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = payload;
          return next;
        }
        return [payload, ...prev];
      });

      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Failed to save skill:', error);
      alert(error?.message || 'حدث خطأ أثناء حفظ مهارة "طور نفسك".');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المهارة نهائياً؟')) return;
    try {
      await adminRepository.deleteSkill(id);
      setSkills(prev => prev.filter(s => s.id !== id));
    } catch (error: any) {
      console.error('Failed to delete skill:', error);
      alert(error?.message || 'تعذر حذف المهارة حالياً.');
    }
  };

  const filteredSkills = skills.filter(s => {
    const matchesSearch = s.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.trackAr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#091527] border border-cyan-500/30 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            إدارة محتوى قسم "طور نفسك"
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">إدارة السلاسل والمهارات التقنية</h2>
          <p className="text-xs text-slate-400">إضافة وتعديل وحذف مسارات التطوير الذاتي وسلاسل التدريب لطلاب الهندسة.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-950 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مهارة أو سلسلة جديدة</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#091527]/80 border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في المهارات والعناوين والمسارات..."
            className="w-full pr-10 pl-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="all">جميع التصنيفات</option>
          <option value="communications">الاتصالات</option>
          <option value="networking">الشبكات</option>
          <option value="programming">البرمجة</option>
          <option value="electronics">الإلكترونيات</option>
          <option value="office">ICDL و Office</option>
          <option value="cybersecurity">الأمن السيبراني</option>
          <option value="computervision">الرؤية الحاسوبية</option>
        </select>
      </div>

      {/* Skills Table / Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-xs">جاري تحميل مسارات المهارات...</p>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="p-12 text-center text-slate-400 rounded-3xl bg-[#091527] border border-slate-800">
          <p className="text-sm">لا توجد مهارات مطابقة للبحث الحالي.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <div 
              key={skill.id}
              className="p-5 rounded-3xl bg-[#091527] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                    {skill.categoryLabelAr}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {skill.levelAr}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{skill.titleAr}</h3>
                {skill.titleEn && (
                  <p className="text-[11px] text-cyan-400/90 font-mono">{skill.titleEn}</p>
                )}

                <div className="text-[11px] text-slate-400 font-medium">
                  📌 {skill.trackAr}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {skill.descriptionAr}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-mono">
                  {skill.relatedSoftware?.length ? skill.relatedSoftware.join(', ') : 'بدون برامج'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(skill)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition-colors"
                    title="تعديل"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-rose-400 border border-slate-800 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-xl bg-gradient-to-b from-[#091527] to-[#060e1a] border border-cyan-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative text-right animate-scaleUp my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">
                {editingItem ? 'تعديل مهارة / سلسلة "طور نفسك"' : 'إضافة مهارة أو سلسلة جديدة'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">العنوان بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    placeholder="مثال: اتصالات الميكروويف والوصلات"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">العنوان بالإنجليزية</label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="Microwave Communications"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">التصنيف التقني</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const val = e.target.value as SkillCategory;
                      const labels: Record<SkillCategory, string> = {
                        communications: 'الاتصالات اللاسلكية',
                        networking: 'الشبكات',
                        programming: 'البرمجة',
                        electronics: 'الإلكترونيات',
                        office: 'ICDL و Office',
                        cybersecurity: 'الأمن السيبراني',
                        computervision: 'الرؤية الحاسوبية'
                      };
                      setFormData({ ...formData, category: val, categoryLabelAr: labels[val] || 'عام' });
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="communications">الاتصالات</option>
                    <option value="networking">الشبكات</option>
                    <option value="programming">البرمجة</option>
                    <option value="electronics">الإلكترونيات</option>
                    <option value="office">ICDL و Office</option>
                    <option value="cybersecurity">الأمن السيبراني</option>
                    <option value="computervision">الرؤية الحاسوبية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">مستوى الصعوبة</label>
                  <select
                    value={formData.levelAr}
                    onChange={(e) => setFormData({ ...formData, levelAr: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="مبتدئ">مبتدئ</option>
                    <option value="متوسط">متوسط</option>
                    <option value="متقدم">متقدم</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">اسم المسار</label>
                  <input
                    type="text"
                    value={formData.trackAr}
                    onChange={(e) => setFormData({ ...formData, trackAr: e.target.value })}
                    placeholder="مسار الترددات الراديوية"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-xs">وصف المهارة / السلسلة</label>
                <textarea
                  rows={3}
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  placeholder="شرح مفصل عن المهارة التقنية..."
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">البرمجيات المرتبطة (مفصولة بفواصل)</label>
                  <input
                    type="text"
                    value={formData.relatedSoftware}
                    onChange={(e) => setFormData({ ...formData, relatedSoftware: e.target.value })}
                    placeholder="MATLAB, Python, HFSS"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">نص حالة الروابط / التوفر</label>
                  <input
                    type="text"
                    value={formData.linkPlaceholder}
                    onChange={(e) => setFormData({ ...formData, linkPlaceholder: e.target.value })}
                    placeholder="سيتم إضافة الرابط لاحقاً."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ المهارة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
