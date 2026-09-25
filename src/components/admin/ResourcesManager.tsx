import React, { useState, useEffect } from 'react';
import { 
  BookMarked, 
  Plus, 
  Search, 
  Archive, 
  RotateCcw, 
  Edit3, 
  X, 
  ExternalLink,
  Send,
  FolderDown,
  BookOpen,
  Video
} from 'lucide-react';
import { ManagedResource, AcademicResourceType } from '../../types/admin';
import { adminRepository } from '../../services/admin/adminRepository';
import { RESOURCES_DATA } from '../../data/resources';
import { COURSES_DATA } from '../../data/courses';

export const ResourcesManager: React.FC = () => {
  const [resources, setResources] = useState<ManagedResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ManagedResource | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    titleAr: '',
    descriptionAr: '',
    resourceType: 'team_noon' as AcademicResourceType,
    url: '',
    relatedCourseIds: [] as string[],
    academicYear: 'all' as ManagedResource['academicYear'],
    sourceAttribution: 'فريق نُون الأكاديمي',
    status: 'active' as 'active' | 'archived'
  });

  const loadResources = async () => {
    setIsLoading(true);
    try {
      const remote = await adminRepository.getResources();
      if (remote.length > 0) {
        setResources(remote);
      } else {
        const mapped: ManagedResource[] = RESOURCES_DATA.map(r => ({
          id: r.id,
          titleAr: r.titleAr,
          descriptionAr: r.descriptionAr,
          resourceType: (r.type === 'telegram' ? 'telegram' : r.source?.includes('نُون') ? 'team_noon' : 'official') as any,
          url: r.url || '#',
          relatedCourseIds: r.relatedCourse ? [r.relatedCourse] : [],
          academicYear: r.year || 'all',
          sourceAttribution: r.source || 'فريق نُون الأكاديمي',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        setResources(mapped);
      }
    } catch (e) {
      console.warn('Fallback to local resources:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      id: `res-${Date.now()}`,
      titleAr: '',
      descriptionAr: '',
      resourceType: 'team_noon',
      url: '',
      relatedCourseIds: [],
      academicYear: 'all',
      sourceAttribution: 'فريق نُون الأكاديمي',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (res: ManagedResource) => {
    setEditingItem(res);
    setFormData({
      id: res.id,
      titleAr: res.titleAr,
      descriptionAr: res.descriptionAr,
      resourceType: res.resourceType,
      url: res.url,
      relatedCourseIds: res.relatedCourseIds || [],
      academicYear: res.academicYear || 'all',
      sourceAttribution: res.sourceAttribution,
      status: res.status
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleAr.trim()) return;

    setIsSaving(true);
    try {
      const payload: ManagedResource = {
        id: formData.id,
        titleAr: formData.titleAr.trim(),
        descriptionAr: formData.descriptionAr.trim(),
        resourceType: formData.resourceType,
        url: formData.url.trim(),
        relatedCourseIds: formData.relatedCourseIds,
        academicYear: formData.academicYear,
        sourceAttribution: formData.sourceAttribution.trim(),
        status: formData.status,
        createdAt: editingItem?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await adminRepository.saveResource(payload);

      setResources(prev => {
        const idx = prev.findIndex(r => r.id === payload.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = payload;
          return next;
        }
        return [payload, ...prev];
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save resource:', error);
      alert('حدث خطأ أثناء حفظ المورد الأكاديمي.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleArchive = async (res: ManagedResource) => {
    const isArchiving = res.status === 'active';
    const confirmMsg = isArchiving
      ? `هل ترغب في أرشفة مورد "${res.titleAr}"؟`
      : `هل ترغب في استعادة مورد "${res.titleAr}"؟`;

    if (!window.confirm(confirmMsg)) return;

    try {
      if (isArchiving) {
        await adminRepository.archiveResource(res.id, res.titleAr);
      } else {
        await adminRepository.restoreResource(res.id, res.titleAr);
      }

      setResources(prev => prev.map(r => {
        if (r.id === res.id) {
          return { ...r, status: isArchiving ? 'archived' : 'active' };
        }
        return r;
      }));
    } catch (e) {
      console.error('Failed to update resource status:', e);
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch = 
      r.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sourceAttribution.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || r.resourceType === typeFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
            <BookMarked className="w-4 h-4 text-amber-400" />
            <span>إدارة الموارد وروابط فريق نُون الأكاديمي</span>
          </div>
          <h2 className="text-lg font-black text-white">
            المستودعات الأكاديمية والقنوات الطلابية ({resources.length} مورد)
          </h2>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مورد أكاديمي جديد</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-[#091527] border border-slate-800 shadow-md flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالعنوان، المصدر (فريق نُون، جامعة دمشق)..."
            className="w-full pr-9 pl-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-slate-400 ml-1">النوع:</span>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'team_noon', label: 'فريق نُون' },
            { id: 'telegram', label: 'تلغرام' },
            { id: 'drive', label: 'Drive' },
            { id: 'book', label: 'مراجع' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                typeFilter === t.id
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map(res => {
          const isArchived = res.status === 'archived';

          return (
            <div 
              key={res.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                isArchived 
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-70' 
                  : 'bg-[#091527] border-slate-800 hover:border-slate-700 shadow-md'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800/50 text-[10px] font-bold">
                        {res.sourceAttribution}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        isArchived 
                          ? 'bg-rose-950/50 text-rose-300 border-rose-800/50' 
                          : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50'
                      }`}>
                        {isArchived ? 'مؤرشف' : 'نشط'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {res.academicYear === 'all' ? 'لكل السنوات' : `السنة ${res.academicYear}`}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white">
                      {res.titleAr}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(res)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                      title="تعديل المورد"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(res)}
                      className={`p-2 rounded-xl border transition-colors ${
                        isArchived 
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50' 
                          : 'bg-slate-900 text-slate-400 hover:text-rose-400 border-slate-800'
                      }`}
                      title={isArchived ? 'استعادة' : 'أرشفة'}
                    >
                      {isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {res.descriptionAr}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-slate-500 font-mono">
                  نوع المورد: {res.resourceType}
                </span>

                {res.url && res.url !== '#' && (
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                  >
                    <span>فتح الرابط</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#091527] border border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-black text-white">
                {editingItem ? 'تعديل بيانات المورد الأكاديمي' : 'إضافة مورد أكاديمي جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">عنوان المورد أو القناة بالعربية *</label>
                <input
                  type="text"
                  required
                  value={formData.titleAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                  placeholder="مثال: قناة فريق نُون - محاضرات السنة الثالثة"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">نوع المورد</label>
                  <select
                    value={formData.resourceType}
                    onChange={(e) => setFormData(prev => ({ ...prev, resourceType: e.target.value as any }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="team_noon">فريق نُون الأكاديمي</option>
                    <option value="telegram">قناة / بوت Telegram</option>
                    <option value="drive">مستودع Google Drive</option>
                    <option value="book">مرجع أو ملحق PDF</option>
                    <option value="youtube">قائمة فيديو يوتيوب</option>
                    <option value="official">موقع رسمي / جامعي</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">السنة الدراسية المستهدفة</label>
                  <select
                    value={formData.academicYear}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, academicYear: val === 'all' ? 'all' : Number(val) as any }));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="all">متاح لكافة السنوات (شامل)</option>
                    <option value={1}>السنة الأولى</option>
                    <option value={2}>السنة الثانية</option>
                    <option value={3}>السنة الثالثة</option>
                    <option value={4}>السنة الرابعة</option>
                    <option value={5}>السنة الخامسة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">الجهة المصدرة أو المنسوبة *</label>
                  <input
                    type="text"
                    required
                    value={formData.sourceAttribution}
                    onChange={(e) => setFormData(prev => ({ ...prev, sourceAttribution: e.target.value }))}
                    placeholder="فريق نُون الأكاديمي، جامعة دمشق، مبادرة طلابية..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                  />
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
                <label className="text-slate-300 font-bold">الرابط المباشر (URL)</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://t.me/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">الوصف والتفاصيل</label>
                <textarea
                  rows={3}
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))}
                  placeholder="شرح لمحتوى القناة أو المستودع وما يقدمه للطلاب..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none resize-none"
                />
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
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-950"
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ المورد الأكاديمي'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
