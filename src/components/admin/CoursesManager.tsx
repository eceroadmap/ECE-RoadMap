import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Archive, 
  RotateCcw, 
  Edit3, 
  X, 
  Check, 
  Layers, 
  Tag, 
  Sparkles,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { ManagedCourse } from '../../types/admin';
import { AcademicYearNumber, AcademicSemester } from '../../types';
import { adminRepository } from '../../services/admin/adminRepository';
import { COURSES_DATA } from '../../data/courses';
import { SOFTWARE_DATA } from '../../data/software';

export const CoursesManager: React.FC = () => {
  const [courses, setCourses] = useState<ManagedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<AcademicYearNumber | 'all'>('all');
  const [semesterFilter, setSemesterFilter] = useState<AcademicSemester | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ManagedCourse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    id: '',
    nameAr: '',
    nameEn: '',
    year: 1 as AcademicYearNumber,
    semester: 1 as AcademicSemester,
    shortDescription: '',
    detailedDescription: '',
    whatYouLearnRaw: '',
    prerequisitesRaw: '',
    relatedSkillsRaw: '',
    selectedSoftware: [] as string[],
    status: 'active' as 'active' | 'archived'
  });

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const remoteCourses = await adminRepository.getCourses();
      if (remoteCourses.length > 0) {
        setCourses(remoteCourses);
      } else {
        // Fallback to local courses if Firestore not yet seeded
        const mapped: ManagedCourse[] = COURSES_DATA.map(c => ({
          ...c,
          status: 'active',
          updatedAt: new Date().toISOString()
        }));
        setCourses(mapped);
      }
    } catch (e) {
      console.warn('Using local courses fallback:', e);
      const mapped: ManagedCourse[] = COURSES_DATA.map(c => ({
        ...c,
        status: 'active',
        updatedAt: new Date().toISOString()
      }));
      setCourses(mapped);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      id: `ece-course-${Date.now()}`,
      nameAr: '',
      nameEn: '',
      year: 1,
      semester: 1,
      shortDescription: '',
      detailedDescription: '',
      whatYouLearnRaw: '',
      prerequisitesRaw: '',
      relatedSkillsRaw: '',
      selectedSoftware: [],
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: ManagedCourse) => {
    setEditingCourse(course);
    setFormData({
      id: course.id,
      nameAr: course.nameAr,
      nameEn: course.nameEn || '',
      year: course.year,
      semester: course.semester,
      shortDescription: course.shortDescription,
      detailedDescription: course.detailedDescription,
      whatYouLearnRaw: course.whatYouLearn?.join('\n') || '',
      prerequisitesRaw: course.prerequisites?.join('\n') || '',
      relatedSkillsRaw: course.relatedSkills?.join('\n') || '',
      selectedSoftware: course.relatedSoftware || [],
      status: course.status
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr.trim()) return;

    setIsSaving(true);
    try {
      const updatedCourse: ManagedCourse = {
        id: formData.id,
        nameAr: formData.nameAr.trim(),
        nameEn: formData.nameEn.trim(),
        year: formData.year,
        semester: formData.semester,
        shortDescription: formData.shortDescription.trim(),
        detailedDescription: formData.detailedDescription.trim(),
        whatYouLearn: formData.whatYouLearnRaw.split('\n').map(s => s.trim()).filter(Boolean),
        prerequisites: formData.prerequisitesRaw.split('\n').map(s => s.trim()).filter(Boolean),
        relatedSkills: formData.relatedSkillsRaw.split('\n').map(s => s.trim()).filter(Boolean),
        relatedSoftware: formData.selectedSoftware,
        relatedCourses: editingCourse?.relatedCourses || [],
        recommendedExternalCourses: editingCourse?.recommendedExternalCourses || [],
        usefulResources: editingCourse?.usefulResources || [],
        tags: [
          `السنة ${formData.year}`,
          `الفصل ${formData.semester}`,
          ...formData.selectedSoftware
        ],
        status: formData.status,
        updatedAt: new Date().toISOString()
      };

      await adminRepository.saveCourse(updatedCourse);

      setCourses(prev => {
        const idx = prev.findIndex(c => c.id === updatedCourse.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updatedCourse;
          return next;
        }
        return [updatedCourse, ...prev];
      });

      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Failed to save course:', error);
      alert(error?.message || 'حدث خطأ أثناء حفظ المقرر. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleArchive = async (course: ManagedCourse) => {
    const isArchiving = course.status === 'active';
    const confirmMsg = isArchiving
      ? `هل أنت متأكد من أرشفة مقرر "${course.nameAr}"؟ سيبقى محفوظاً في النظام ويمكن استعادته دائماً.`
      : `هل ترغب في استعادة مقرر "${course.nameAr}" للوضع النشط؟`;

    if (!window.confirm(confirmMsg)) return;

    try {
      if (isArchiving) {
        await adminRepository.archiveCourse(course.id, course.nameAr);
      } else {
        await adminRepository.restoreCourse(course.id, course.nameAr);
      }

      setCourses(prev => prev.map(c => {
        if (c.id === course.id) {
          return { ...c, status: isArchiving ? 'archived' : 'active' };
        }
        return c;
      }));
    } catch (e) {
      console.error('Failed to update course status:', e);
      alert('حدث خطأ أثناء تعديل حالة المقرر.');
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = 
      c.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.nameEn && c.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = yearFilter === 'all' || c.year === yearFilter;
    const matchesSem = semesterFilter === 'all' || c.semester === semesterFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesYear && matchesSem && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
            <BookOpen className="w-4 h-4" />
            <span>إدارة الخطة الدراسية والمقررات الأكاديمية</span>
          </div>
          <h2 className="text-lg font-black text-white">
            مقررات هندسة الإلكترونيات والاتصالات ({courses.length} مقرر)
          </h2>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مقرر جديد للخطة</span>
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="p-4 rounded-2xl bg-[#091527] border border-slate-800 shadow-md flex flex-wrap items-center gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المقرر أو الرمز..."
            className="w-full pr-9 pl-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
          />
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400 ml-1">السنة:</span>
          {(['all', 1, 2, 3, 4, 5] as const).map(y => (
            <button
              key={y}
              onClick={() => setYearFilter(y)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                yearFilter === y
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {y === 'all' ? 'الكل' : `س${y}`}
            </button>
          ))}
        </div>

        {/* Semester Filter */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400 ml-1">الفصل:</span>
          {(['all', 1, 2] as const).map(s => (
            <button
              key={s}
              onClick={() => setSemesterFilter(s)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                semesterFilter === s
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {s === 'all' ? 'الكل' : `فصل ${s}`}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400 ml-1">الحالة:</span>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'active', label: 'النشطة' },
            { id: 'archived', label: 'المؤرشفة' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id as any)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                statusFilter === st.id
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-3">
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCourses.map(course => {
              const isArchived = course.status === 'archived';

              return (
                <div 
                  key={course.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isArchived 
                      ? 'bg-slate-900/40 border-slate-800/80 opacity-70' 
                      : 'bg-[#091527] border-slate-800 hover:border-slate-700 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800/50 text-[10px] font-bold">
                          السنة {course.year} • الفصل {course.semester}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          isArchived 
                            ? 'bg-rose-950/50 text-rose-300 border-rose-800/50' 
                            : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50'
                        }`}>
                          {isArchived ? 'مؤرشف' : 'نشط'}
                        </span>
                        {course.nameEn && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            {course.nameEn}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-white">
                        {course.nameAr}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(course)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                        title="تعديل المقرر"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleArchive(course)}
                        className={`p-2 rounded-xl border transition-colors ${
                          isArchived 
                            ? 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border-emerald-800/50' 
                            : 'bg-slate-900 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border-slate-800'
                        }`}
                        title={isArchived ? 'استعادة المقرر' : 'أرشفة المقرر'}
                      >
                        {isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {course.shortDescription || course.detailedDescription}
                  </p>

                  {/* Software Tags */}
                  {course.relatedSoftware && course.relatedSoftware.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-slate-800/60 text-[11px]">
                      <span className="text-slate-500">البرمجيات:</span>
                      {course.relatedSoftware.map(sw => (
                        <span key={sw} className="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800 text-[10px]">
                          {sw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-[#091527] border border-slate-800 space-y-3">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-slate-300">لم يتم العثور على مقررات مطابقة للفلتر</div>
            <div className="text-xs text-slate-500">جرب تغيير معايير البحث أو إضافة مقرر جديد.</div>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#091527] border border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-base font-black text-white">
                  {editingCourse ? 'تعديل بيانات المقرر الأكاديمي' : 'إضافة مقرر جديد للخطة'}
                </h3>
                <p className="text-xs text-slate-400">
                  يرجى ملء تفاصيل المقرر بدقة لتظهر لطلاب القسم في رحلتهم الأكاديمية.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">اسم المقرر بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={formData.nameAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                    placeholder="مثال: نظرية الاتصالات 1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">الاسم بالإنجليزية (اختياري)</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                    placeholder="Communication Theory 1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">السنة الدراسية</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) as AcademicYearNumber }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map(y => (
                      <option key={y} value={y}>السنة {y}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">الفصل الدراسي</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData(prev => ({ ...prev, semester: Number(e.target.value) as AcademicSemester }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value={1}>الفصل الأول</option>
                    <option value={2}>الفصل الثاني</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">حالة النشر</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="active">نشط (ظاهر للطلاب)</option>
                    <option value="archived">مؤرشف (مخفي)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">الوصف المختصر للمقرر</label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder="نبذة موجزة تظهر في بطاقة المقرر..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">التوصيف التفصيلي والمفردات الأكاديمية</label>
                <textarea
                  rows={3}
                  value={formData.detailedDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, detailedDescription: e.target.value }))}
                  placeholder="شرح مفصل لمحتوى المقرر ومفرداته النظرية والعملية..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">مخرجات التعلم (سطر لكل مخرج)</label>
                  <textarea
                    rows={3}
                    value={formData.whatYouLearnRaw}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatYouLearnRaw: e.target.value }))}
                    placeholder="تحليل إشارات التعديل AM/FM&#10;حساب نسبة الإشارة إلى الضجيج SNR"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">المتطلبات السابقة (سطر لكل مقرر)</label>
                  <textarea
                    rows={3}
                    value={formData.prerequisitesRaw}
                    onChange={(e) => setFormData(prev => ({ ...prev, prerequisitesRaw: e.target.value }))}
                    placeholder="تحليل إشارات ونظم&#10;رياضيات 3"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Related Software Multi-select */}
              <div className="space-y-2">
                <label className="text-slate-300 font-bold">البرمجيات المرتبطة بالمقرر</label>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800 max-h-28 overflow-y-auto">
                  {SOFTWARE_DATA.map(sw => {
                    const isSelected = formData.selectedSoftware.includes(sw.name);
                    return (
                      <button
                        type="button"
                        key={sw.id}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            selectedSoftware: isSelected
                              ? prev.selectedSoftware.filter(s => s !== sw.name)
                              : [...prev.selectedSoftware, sw.name]
                          }));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {sw.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-950 flex items-center gap-2"
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات في الخطة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
