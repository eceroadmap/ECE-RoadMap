import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Plus, 
  Search, 
  Archive, 
  RotateCcw, 
  Edit3, 
  X, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { ManagedSoftware } from '../../types/admin';
import { adminRepository } from '../../services/admin/adminRepository';
import { SOFTWARE_DATA } from '../../data/software';
import { COURSES_DATA } from '../../data/courses';

export const SoftwareManager: React.FC = () => {
  const [softwareList, setSoftwareList] = useState<ManagedSoftware[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ManagedSoftware | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    arabicName: '',
    category: 'circuits' as ManagedSoftware['category'],
    categoryLabelAr: 'تصميم ومحاكاة الدارات',
    description: '',
    purpose: '',
    officialDownloadLink: '',
    usedInCourses: [] as string[],
    status: 'active' as 'active' | 'archived'
  });

  const loadSoftware = async () => {
    setIsLoading(true);
    try {
      const remote = await adminRepository.getSoftware();
      if (remote.length > 0) {
        setSoftwareList(remote);
      } else {
        const mapped: ManagedSoftware[] = SOFTWARE_DATA.map(s => ({
          ...s,
          status: 'active',
          updatedAt: new Date().toISOString()
        }));
        setSoftwareList(mapped);
      }
    } catch (e) {
      console.warn('Fallback to local software:', e);
      const mapped: ManagedSoftware[] = SOFTWARE_DATA.map(s => ({
        ...s,
        status: 'active',
        updatedAt: new Date().toISOString()
      }));
      setSoftwareList(mapped);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSoftware();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      id: `sw-${Date.now()}`,
      name: '',
      arabicName: '',
      category: 'circuits',
      categoryLabelAr: 'تصميم ومحاكاة الدارات',
      description: '',
      purpose: '',
      officialDownloadLink: '',
      usedInCourses: [],
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sw: ManagedSoftware) => {
    setEditingItem(sw);
    setFormData({
      id: sw.id,
      name: sw.name,
      arabicName: sw.arabicName || '',
      category: sw.category,
      categoryLabelAr: sw.categoryLabelAr,
      description: sw.description,
      purpose: sw.purpose,
      officialDownloadLink: sw.officialDownloadLink || '',
      usedInCourses: sw.usedInCourses || [],
      status: sw.status
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      const payload: ManagedSoftware = {
        id: formData.id,
        name: formData.name.trim(),
        arabicName: formData.arabicName.trim(),
        category: formData.category,
        categoryLabelAr: formData.categoryLabelAr,
        description: formData.description.trim(),
        purpose: formData.purpose.trim(),
        officialDownloadLink: formData.officialDownloadLink.trim(),
        usedInCourses: formData.usedInCourses,
        academicYears: editingItem?.academicYears || [2, 3, 4],
        learningResources: editingItem?.learningResources || [],
        status: formData.status,
        updatedAt: new Date().toISOString()
      };

      await adminRepository.saveSoftware(payload);

      setSoftwareList(prev => {
        const idx = prev.findIndex(s => s.id === payload.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = payload;
          return next;
        }
        return [payload, ...prev];
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save software tool:', error);
      alert('حدث خطأ أثناء حفظ البرنامج.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleArchive = async (sw: ManagedSoftware) => {
    const isArchiving = sw.status === 'active';
    const confirmMsg = isArchiving
      ? `هل ترغب في أرشفة أداة "${sw.name}"؟`
      : `هل ترغب في استعادة أداة "${sw.name}"؟`;

    if (!window.confirm(confirmMsg)) return;

    try {
      if (isArchiving) {
        await adminRepository.archiveSoftware(sw.id, sw.name);
      } else {
        await adminRepository.restoreSoftware(sw.id, sw.name);
      }

      setSoftwareList(prev => prev.map(s => {
        if (s.id === sw.id) {
          return { ...s, status: isArchiving ? 'archived' : 'active' };
        }
        return s;
      }));
    } catch (e) {
      console.error('Error toggling software archive:', e);
    }
  };

  const filteredSoftware = softwareList.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.arabicName && s.arabicName.includes(searchQuery)) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
            <Cpu className="w-4 h-4" />
            <span>إدارة برمجيات المحاكاة وأدوات الهندسة</span>
          </div>
          <h2 className="text-lg font-black text-white">
            حزمة برامج قسم ECE ({softwareList.length} برنامج)
          </h2>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة أداة برمجية جديدة</span>
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="p-4 rounded-2xl bg-[#091527] border border-slate-800 shadow-md flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم البرنامج أو مجاله..."
            className="w-full pr-9 pl-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-slate-400 ml-1">التصنيف:</span>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'circuits', label: 'الدارات' },
            { id: 'dsp', label: 'DSP' },
            { id: 'fpga', label: 'FPGA' },
            { id: 'microwaves', label: 'ميكروية' },
            { id: 'programming', label: 'برمجة' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat.label}
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

      {/* Software Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSoftware.map(sw => {
          const isArchived = sw.status === 'archived';

          return (
            <div 
              key={sw.id}
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
                      <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-400 border border-blue-800/50 text-[10px] font-bold">
                        {sw.categoryLabelAr || sw.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        isArchived 
                          ? 'bg-rose-950/50 text-rose-300 border-rose-800/50' 
                          : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50'
                      }`}>
                        {isArchived ? 'مؤرشف' : 'نشط'}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white font-mono">
                      {sw.name}
                    </h3>
                    {sw.arabicName && (
                      <div className="text-xs text-slate-400">
                        {sw.arabicName}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(sw)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                      title="تعديل البرنامج"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(sw)}
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
                  {sw.purpose || sw.description}
                </p>
              </div>

              {/* Course Badges & Official Link */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-slate-500 font-mono">
                  {sw.usedInCourses?.length || 0} مقررات مرتبطة
                </span>

                {sw.officialDownloadLink && (
                  <a
                    href={sw.officialDownloadLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                  >
                    <span>رابط التحميل</span>
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
                {editingItem ? 'تعديل بيانات الأداة البرمجية' : 'إضافة أداة برمجية جديدة'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">اسم البرنامج بالإنجليزية *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="MATLAB / Simulink"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">التسمية أو الوصف بالعربية</label>
                  <input
                    type="text"
                    value={formData.arabicName}
                    onChange={(e) => setFormData(prev => ({ ...prev, arabicName: e.target.value }))}
                    placeholder="ماتلاب وبيئة المحاكاة سيميولينك"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">التصنيف الهندسي</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      const labels: Record<string, string> = {
                        circuits: 'تصميم ومحاكاة الدارات',
                        dsp: 'معالجة الإشارة الرقمية DSP',
                        fpga: 'الأنظمة الرقمية وFPGA',
                        microwaves: 'الكهرومغناطيسية والميكروية',
                        embedded: 'الأنظمة المضمنة والمتحكمات',
                        programming: 'البرمجة والخوارزميات',
                        networking: 'شبكات الاتصال ونقل البيانات',
                        industrial: 'التحكم الصناعي والأتمتة'
                      };
                      setFormData(prev => ({
                        ...prev,
                        category: cat,
                        categoryLabelAr: labels[cat] || 'أداة هندسية'
                      }));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="circuits">تصميم الدارات (Circuits)</option>
                    <option value="dsp">معالجة الإشارة (DSP)</option>
                    <option value="fpga">الأنظمة الرقمية وFPGA</option>
                    <option value="microwaves">الكهرومغناطيسية والميكروية</option>
                    <option value="embedded">الأنظمة المضمنة</option>
                    <option value="programming">البرمجة</option>
                    <option value="networking">شبكات الاتصال</option>
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
                <label className="text-slate-300 font-bold">الغاية الأكاديمية والاستخدام في القسم *</label>
                <input
                  type="text"
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  placeholder="محاكاة نظم الاتصالات، النمذجة الرياضية، ومعالجة الإشارات"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">رابط الموقع الرسمي أو صفحة التنزيل</label>
                <input
                  type="url"
                  value={formData.officialDownloadLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, officialDownloadLink: e.target.value }))}
                  placeholder="https://www.mathworks.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">الوصف التفصيلي للأداة</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="شرح متكامل لأهم ميزات البرنامج والنسخ المعتمدة في مخابر الكلية..."
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
                  {isSaving ? 'جاري الحفظ...' : 'حفظ البرنامج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
