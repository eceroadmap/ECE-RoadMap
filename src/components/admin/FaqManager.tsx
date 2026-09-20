import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Search, 
  Archive, 
  RotateCcw, 
  Edit3, 
  X, 
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { ManagedFAQ } from '../../types/admin';
import { adminRepository } from '../../services/admin/adminRepository';
import { FAQ_DATA } from '../../data/faq';

export const FaqManager: React.FC = () => {
  const [faqs, setFaqs] = useState<ManagedFAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ManagedFAQ | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    questionAr: '',
    answerAr: '',
    categoryAr: 'عام حول القسم',
    orderIndex: 1,
    status: 'active' as 'active' | 'archived'
  });

  const loadFaqs = async () => {
    setIsLoading(true);
    try {
      const remote = await adminRepository.getFAQs();
      if (remote.length > 0) {
        setFaqs(remote);
      } else {
        const mapped: ManagedFAQ[] = FAQ_DATA.map((f, idx) => ({
          id: f.id,
          questionAr: f.questionAr,
          answerAr: f.answerAr,
          categoryAr: f.categoryAr,
          orderIndex: idx + 1,
          status: 'active',
          updatedAt: new Date().toISOString()
        }));
        setFaqs(mapped);
      }
    } catch (e) {
      console.warn('Fallback to local FAQs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      id: `faq-${Date.now()}`,
      questionAr: '',
      answerAr: '',
      categoryAr: 'عام حول القسم',
      orderIndex: faqs.length + 1,
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faq: ManagedFAQ) => {
    setEditingItem(faq);
    setFormData({
      id: faq.id,
      questionAr: faq.questionAr,
      answerAr: faq.answerAr,
      categoryAr: faq.categoryAr,
      orderIndex: faq.orderIndex || 1,
      status: faq.status
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.questionAr.trim() || !formData.answerAr.trim()) return;

    setIsSaving(true);
    try {
      const payload: ManagedFAQ = {
        id: formData.id,
        questionAr: formData.questionAr.trim(),
        answerAr: formData.answerAr.trim(),
        categoryAr: formData.categoryAr.trim(),
        orderIndex: Number(formData.orderIndex),
        status: formData.status,
        updatedAt: new Date().toISOString()
      };

      await adminRepository.saveFAQ(payload);

      setFaqs(prev => {
        const idx = prev.findIndex(f => f.id === payload.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = payload;
          return next.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
        }
        return [payload, ...prev].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save FAQ:', error);
      alert('حدث خطأ أثناء حفظ السؤال الشائع.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleArchive = async (faq: ManagedFAQ) => {
    const isArchiving = faq.status === 'active';
    const confirmMsg = isArchiving
      ? `هل ترغب في أرشفة هذا السؤال؟`
      : `هل ترغب في استعادة هذا السؤال؟`;

    if (!window.confirm(confirmMsg)) return;

    try {
      if (isArchiving) {
        await adminRepository.archiveFAQ(faq.id, faq.questionAr);
      } else {
        await adminRepository.restoreFAQ(faq.id, faq.questionAr);
      }

      setFaqs(prev => prev.map(f => {
        if (f.id === faq.id) {
          return { ...f, status: isArchiving ? 'archived' : 'active' };
        }
        return f;
      }));
    } catch (e) {
      console.error('Failed to update FAQ status:', e);
    }
  };

  const filteredFaqs = faqs.filter(f => {
    const matchesSearch = 
      f.questionAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answerAr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || f.categoryAr === categoryFilter;
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const uniqueCategories = Array.from(new Set(faqs.map(f => f.categoryAr))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
            <HelpCircle className="w-4 h-4" />
            <span>إدارة بنك الأسئلة الشائعة وتوجيهات القسم</span>
          </div>
          <h2 className="text-lg font-black text-white">
            الأسئلة الأكاديمية والمهنية المتكررة ({faqs.length} سؤال)
          </h2>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة سؤال شائع جديد</span>
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
            placeholder="بحث في السؤال أو الإجابة..."
            className="w-full pr-9 pl-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-slate-400 ml-1">التصنيف:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none"
          >
            <option value="all">كافة التصنيفات</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
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

      {/* FAQs List */}
      <div className="space-y-3">
        {filteredFaqs.map(faq => {
          const isArchived = faq.status === 'archived';

          return (
            <div 
              key={faq.id}
              className={`p-5 rounded-2xl border transition-all ${
                isArchived 
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-70' 
                  : 'bg-[#091527] border-slate-800 hover:border-slate-700 shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800/50 text-[10px] font-bold">
                      {faq.categoryAr}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono">
                      ترتيب #{faq.orderIndex}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      isArchived 
                        ? 'bg-rose-950/50 text-rose-300 border-rose-800/50' 
                        : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50'
                    }`}>
                      {isArchived ? 'مؤرشف' : 'نشط'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">
                    {faq.questionAr}
                  </h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(faq)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                    title="تعديل السؤال"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleArchive(faq)}
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

              <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-300 leading-relaxed">
                {faq.answerAr}
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
                {editingItem ? 'تعديل السؤال الشائع' : 'إضافة سؤال شائع جديد'}
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
                <label className="text-slate-300 font-bold">صيغة السؤال بالعربية *</label>
                <input
                  type="text"
                  required
                  value={formData.questionAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, questionAr: e.target.value }))}
                  placeholder="مثال: ما هو الفرق بين هندسة الاتصالات وهندسة الشبكات؟"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">التصنيف الموضوعي</label>
                  <input
                    type="text"
                    required
                    value={formData.categoryAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryAr: e.target.value }))}
                    placeholder="عام، دراسة، مشاريع، لابتوب..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">ترتيب الظهور</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.orderIndex}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderIndex: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">حالة النشر</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="active">نشط (ظاهر)</option>
                    <option value="archived">مؤرشف (مخفي)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">الإجابة والتوجيه الأكاديمي المعتمد *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.answerAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, answerAr: e.target.value }))}
                  placeholder="شرح الإجابة بطريقة واضحة وموثوقة..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none resize-none leading-relaxed"
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
                  {isSaving ? 'جاري الحفظ...' : 'حفظ السؤال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
