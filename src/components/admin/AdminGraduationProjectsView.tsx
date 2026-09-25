import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  X, 
  Save, 
  BookOpen,
  Wrench,
  Tag
} from 'lucide-react';
import { GraduationProject, ProjectDifficulty } from '../../types/graduationProject';
import { graduationProjectRepository } from '../../services/graduationProjectRepository';
import { COURSES_DATA } from '../../data/courses';

export const AdminGraduationProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<GraduationProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState<GraduationProject | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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
        console.warn('Error loading projects in admin CMS:', e);
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();

    const unsub = graduationProjectRepository.subscribe((updated) => {
      if (isMounted) setProjects(updated);
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const handleSave = async (proj: GraduationProject) => {
    try {
      await graduationProjectRepository.saveProject(proj);
      setEditingProject(null);
      setIsCreating(false);
      alert('تم حفظ مشروع التخرج بنجاح!');
    } catch (e) {
      alert('حدث خطأ أثناء حفظ المشروع.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف مشروع التخرج هذا نهائياً؟')) {
      try {
        await graduationProjectRepository.deleteProject(id);
      } catch (e) {
        alert('فشل حذف المشروع.');
      }
    }
  };

  const handleToggleActive = async (proj: GraduationProject) => {
    const updated = { ...proj, active: proj.active === false ? true : false };
    try {
      await graduationProjectRepository.saveProject(updated);
    } catch (e) {
      alert('فشل تحديث حالة التفعيل.');
    }
  };

  const filtered = projects.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (p.titleAr || '').toLowerCase().includes(q) || (p.titleEn || '').toLowerCase().includes(q);
    }
    return true;
  });

  const openNewProject = () => {
    const newProj: GraduationProject = {
      id: `proj_${Date.now()}`,
      titleAr: '',
      titleEn: '',
      summaryAr: '',
      difficulty: 'advanced',
      trackAr: 'أنظمة الاتصالات واللاسلكي',
      tags: ['ECE', 'Graduation Project'],
      relatedCourseIds: [],
      requiredSkills: [],
      requiredSoftware: [],
      active: true
    };
    setEditingProject(newProj);
    setIsCreating(true);
  };

  return (
    <div className="space-y-6 text-right animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-semibold">
            <FolderGit2 className="w-4 h-4" />
            <span>إدارة مشاريع التخرج (CMS)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            مشاريع التخرج الهندسية ({projects.length})
          </h1>
          <p className="text-xs text-slate-400">
            إضافة، تعديل، أرشفة وتعريف مشاريع التخرج الخاصة بقسم هندسة الإلكترونيات والاتصالات.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewProject}
          className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مشروع تخرج جديد</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في مشاريع التخرج..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Table / List */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400">
                  <th className="p-4">عنوان المشروع</th>
                  <th className="p-4">المسار والمستوى</th>
                  <th className="p-4">المقررات المرتبطة</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
                {filtered.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 space-y-1 max-w-sm">
                      <div className="font-bold text-white">{proj.titleAr}</div>
                      <div className="text-[11px] text-slate-400 truncate">{proj.titleEn}</div>
                    </td>
                    <td className="p-4 space-y-1">
                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-semibold block w-fit">
                        {proj.trackAr || proj.field || 'اتصالات'}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {proj.difficultyAr || proj.difficulty}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px]">
                        {(proj.relatedCourseIds || []).length} مقرر
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(proj)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 w-fit ${
                          proj.active !== false 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {proj.active !== false ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{proj.active !== false ? 'منشور وفعال' : 'مؤرشف'}</span>
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => { setEditingProject(proj); setIsCreating(false); }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 transition-all"
                          title="تعديل المشروع"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(proj.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500 hover:text-white text-rose-400 transition-all"
                          title="حذف المشروع"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT / CREATE MODAL */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-black text-white">
                {isCreating ? 'إضافة مشروع تخرج جديد' : 'تعديل مشروع التخرج'}
              </h2>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان المشروع بالعربية</label>
                <input
                  type="text"
                  value={editingProject.titleAr}
                  onChange={(e) => setEditingProject({ ...editingProject, titleAr: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان المشروع بالإنجليزية</label>
                <input
                  type="text"
                  value={editingProject.titleEn}
                  onChange={(e) => setEditingProject({ ...editingProject, titleEn: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الملخص التنفيذي للمشروع</label>
                <textarea
                  rows={3}
                  value={editingProject.summaryAr}
                  onChange={(e) => setEditingProject({ ...editingProject, summaryAr: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">مستوى الصعوبة</label>
                  <select
                    value={editingProject.difficulty}
                    onChange={(e) => setEditingProject({ ...editingProject, difficulty: e.target.value as ProjectDifficulty })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="beginner">مبتدئ</option>
                    <option value="intermediate">متوسط</option>
                    <option value="advanced">متقدم</option>
                    <option value="research">بحثي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المسار أو التخصص</label>
                  <input
                    type="text"
                    value={editingProject.trackAr || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, trackAr: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Related Courses Multi-select */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">المقررات المرتبطة (اختر المقررات)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 max-h-40 overflow-y-auto">
                  {COURSES_DATA.map((c) => {
                    const isSelected = (editingProject.relatedCourseIds || []).includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          const nextCourses = isSelected
                            ? editingProject.relatedCourseIds.filter(id => id !== c.id)
                            : [...(editingProject.relatedCourseIds || []), c.id];
                          setEditingProject({ ...editingProject, relatedCourseIds: nextCourses });
                        }}
                        className={`p-2 rounded-lg text-right text-xs transition-all border flex items-center justify-between ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="truncate">{c.nameAr}</span>
                        <span>{isSelected ? '✓' : '+'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الوسوم (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={(editingProject.tags || []).join(', ')}
                  onChange={(e) => setEditingProject({ ...editingProject, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleSave(editingProject)}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>حفظ المشروع</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
