import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Sliders, 
  Award, 
  HardDrive, 
  Cpu, 
  Layers, 
  DollarSign, 
  ExternalLink,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  RecommendedLaptopModel, 
  DepartmentRecommendedSpecs 
} from '../../types/laptop';
import { 
  laptopAdvisorService, 
  useLiveRecommendedLaptops, 
  useLiveDepartmentSpecs 
} from '../../services/laptopAdvisorService';
import { DEFAULT_DEPARTMENT_SPECS } from '../../data/laptopRules';

export const LaptopManager: React.FC = () => {
  const liveLaptops = useLiveRecommendedLaptops();
  const liveDeptSpecs = useLiveDepartmentSpecs();

  const [activeTab, setActiveTab] = useState<'models' | 'specs'>('models');
  const [searchQuery, setSearchQuery] = useState('');
  const [suitabilityFilter, setSuitabilityFilter] = useState<string>('all');

  // Modal State for adding/editing laptop model
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState<RecommendedLaptopModel | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form data for laptop model
  const [modelForm, setModelForm] = useState({
    id: '',
    name: '',
    brand: '',
    image: '',
    cpu: '',
    ram: '',
    storage: '1 TB NVMe SSD',
    gpu: '',
    screenSize: '15.6 بوصة FHD IPS',
    os: 'Windows 11',
    priceEstimate: '',
    suitabilityLevel: 'balanced' as RecommendedLaptopModel['suitabilityLevel'],
    suitabilityBadge: 'الموصى به لطلاب القسم',
    suitableForRaw: '',
    prosRaw: '',
    notes: '',
    isRecommended: false
  });

  // Form data for department baseline specs
  const [specsForm, setSpecsForm] = useState<DepartmentRecommendedSpecs>({
    ...liveDeptSpecs
  });
  const [isSavingSpecs, setIsSavingSpecs] = useState(false);

  useEffect(() => {
    setSpecsForm(liveDeptSpecs);
  }, [liveDeptSpecs]);

  const showSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const showError = (msg: string) => {
    setActionError(msg);
    setTimeout(() => setActionError(null), 5000);
  };

  const handleOpenAdd = () => {
    setEditingLaptop(null);
    setModelForm({
      id: `laptop-${Date.now()}`,
      name: '',
      brand: 'Lenovo',
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
      cpu: 'Intel Core i7-13650HX / AMD Ryzen 7',
      ram: '16 GB DDR5',
      storage: '1 TB NVMe SSD',
      gpu: 'NVIDIA GeForce RTX 4050',
      screenSize: '15.6 بوصة FHD IPS',
      os: 'Windows 11',
      priceEstimate: '850$ - 1000$',
      suitabilityLevel: 'balanced',
      suitabilityBadge: 'الموصى به لطلاب القسم',
      suitableForRaw: 'البرمجة وبيئات التطوير\nMATLAB / Simulink\nالمحاكاة الهندسية (HFSS)\nالأنظمة المدمجة وFPGA\nمشاريع التخرج والسنوات المتقدمة',
      prosRaw: 'سعة تخزين 1TB تكفي حزم برمجيات القسم ومشاريع التخرج\nمعالج قوي في الحسابات الرياضية والمحاكاة\nتبريد ممتاز للمهام الهندسية الطويلة',
      notes: '',
      isRecommended: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (laptop: RecommendedLaptopModel) => {
    setEditingLaptop(laptop);
    setModelForm({
      id: laptop.id,
      name: laptop.name,
      brand: laptop.brand,
      image: laptop.image,
      cpu: laptop.cpu,
      ram: laptop.ram,
      storage: laptop.storage,
      gpu: laptop.gpu,
      screenSize: laptop.screenSize,
      os: laptop.os,
      priceEstimate: laptop.priceEstimate || '',
      suitabilityLevel: laptop.suitabilityLevel,
      suitabilityBadge: laptop.suitabilityBadge,
      suitableForRaw: laptop.suitableFor?.join('\n') || '',
      prosRaw: laptop.pros?.join('\n') || '',
      notes: laptop.notes || '',
      isRecommended: laptop.isRecommended || false
    });
    setIsModalOpen(true);
  };

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelForm.name.trim()) {
      showError('يرجى إدخال اسم اللابتوب');
      return;
    }

    setIsSaving(true);
    try {
      const payload: RecommendedLaptopModel = {
        id: modelForm.id,
        name: modelForm.name.trim(),
        brand: modelForm.brand.trim() || 'عام',
        image: modelForm.image.trim() || 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
        cpu: modelForm.cpu.trim(),
        ram: modelForm.ram.trim(),
        storage: modelForm.storage.trim() || '1 TB NVMe SSD',
        gpu: modelForm.gpu.trim(),
        screenSize: modelForm.screenSize.trim(),
        os: modelForm.os.trim(),
        priceEstimate: modelForm.priceEstimate.trim(),
        suitabilityLevel: modelForm.suitabilityLevel,
        suitabilityBadge: modelForm.suitabilityBadge.trim() || 'مناسب لطلاب القسم',
        suitableFor: modelForm.suitableForRaw.split('\n').map(s => s.trim()).filter(Boolean),
        pros: modelForm.prosRaw.split('\n').map(s => s.trim()).filter(Boolean),
        notes: modelForm.notes.trim(),
        isRecommended: modelForm.isRecommended,
        status: 'active'
      };

      await laptopAdvisorService.saveLaptopModel(payload);
      showSuccess(`تم حفظ نموذج اللابتوب "${payload.name}" ونشره فورياً لجميع المشرفين والطلاب.`);
      setIsModalOpen(false);
    } catch (err: any) {
      showError(err?.message || 'حدث خطأ أثناء حفظ نموذج اللابتوب');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteModel = async (laptop: RecommendedLaptopModel) => {
    if (!window.confirm(`هل أنت متأكد من حذف نموذج "${laptop.name}"؟`)) {
      return;
    }
    try {
      await laptopAdvisorService.deleteLaptopModel(laptop.id, laptop.name);
      showSuccess(`تم حذف نموذج "${laptop.name}" بنجاح.`);
    } catch (err: any) {
      showError(err?.message || 'حدث خطأ أثناء حذف النموذج');
    }
  };

  const handleSaveDepartmentSpecs = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSpecs(true);
    try {
      await laptopAdvisorService.saveDepartmentSpecs(specsForm);
      showSuccess('تم تحديث معايير وتوصيات لابتوب القسم (التخزين 1TB / الرام 16GB) وتعميمها فورياً على النظام.');
    } catch (err: any) {
      showError(err?.message || 'حدث خطأ أثناء حفظ معايير القسم');
    } finally {
      setIsSavingSpecs(false);
    }
  };

  const filteredLaptops = liveLaptops.filter((lap) => {
    if (suitabilityFilter !== 'all' && lap.suitabilityLevel !== suitabilityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        lap.name.toLowerCase().includes(q) ||
        lap.brand.toLowerCase().includes(q) ||
        lap.cpu.toLowerCase().includes(q) ||
        lap.gpu.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
            <Laptop className="w-4 h-4" />
            <span>إدارة العتاد والأجهزة • مستشار لابتوب القسم</span>
          </div>
          <h2 className="text-lg font-black text-white">
            إدارة نماذج اللابتوبات ومعايير التوصيات الهندسية
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة نموذج لابتوب جديد</span>
          </button>
        </div>
      </div>

      {/* Action Messages */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center justify-between animate-fadeIn">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-rose-400">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'models'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>نماذج الأجهزة المقترحة ({liveLaptops.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'specs'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>المواصفات والمعايير الموصى بها للقسم (التخزين 1TB)</span>
        </button>
      </div>

      {/* TAB 1: LAPTOP MODELS MANAGEMENT */}
      {activeTab === 'models' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-[#091527] border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في نماذج الأجهزة..."
                className="w-full pr-9 pl-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'balanced', label: 'المتوازن' },
                { id: 'budget', label: 'الاقتصادي' },
                { id: 'pro', label: 'الاحترافي' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSuitabilityFilter(filter.id)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    suitabilityFilter === filter.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Models */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLaptops.map((laptop) => (
              <div
                key={laptop.id}
                className="p-5 rounded-3xl bg-[#091527] border border-slate-800 hover:border-slate-700 shadow-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                        {laptop.brand}
                      </span>
                      <h4 className="text-base font-black text-white">{laptop.name}</h4>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {laptop.suitabilityBadge}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300 font-mono bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between"><span className="text-slate-400">CPU:</span> <span>{laptop.cpu}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">RAM:</span> <span className="text-cyan-300 font-bold">{laptop.ram}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Storage:</span> <span className="text-emerald-300 font-bold">{laptop.storage}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">GPU:</span> <span>{laptop.gpu}</span></div>
                    {laptop.priceEstimate && (
                      <div className="flex justify-between text-amber-300 font-bold"><span className="text-slate-400">السعر:</span> <span>{laptop.priceEstimate}</span></div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    {laptop.isRecommended ? '⭐ موصى به رئيسي' : 'نموذج مقترح'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(laptop)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors"
                      title="تعديل المواصفات"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteModel(laptop)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/40 transition-colors"
                      title="حذف النموذج"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENT BASELINE SPECS CONFIG */}
      {activeTab === 'specs' && (
        <div className="max-w-3xl mx-auto bg-[#091527] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 text-white font-black text-base">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <span>تعديل المعايير والتوصية المعتمدة لطلاب القسم (Baseline Specs)</span>
          </div>

          <form onSubmit={handleSaveDepartmentSpecs} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">الحد الأدنى للرام (Min RAM GB):</label>
                <input
                  type="number"
                  value={specsForm.minRamGb}
                  onChange={(e) => setSpecsForm({ ...specsForm, minRamGb: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">الرام الموصى به (Target RAM GB):</label>
                <input
                  type="number"
                  value={specsForm.targetRamGb}
                  onChange={(e) => setSpecsForm({ ...specsForm, targetRamGb: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-cyan-300 block">سعة التخزين الموصى بها (Target Storage GB):</label>
                <input
                  type="number"
                  value={specsForm.targetStorageGb}
                  onChange={(e) => setSpecsForm({ ...specsForm, targetStorageGb: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-cyan-500 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono font-bold"
                />
                <span className="text-[10px] text-cyan-400">1000 GB تعادل 1 TB المعتمدة حديثاً.</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">نوع التخزين الموصى به:</label>
                <input
                  type="text"
                  value={specsForm.targetStorageType}
                  onChange={(e) => setSpecsForm({ ...specsForm, targetStorageType: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-300 block">فئة المعالج الموصى بها (CPU Baseline):</label>
                <input
                  type="text"
                  value={specsForm.targetCpuTier}
                  onChange={(e) => setSpecsForm({ ...specsForm, targetCpuTier: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-300 block">كرت الشاشة الموصى به (GPU Baseline):</label>
                <input
                  type="text"
                  value={specsForm.targetGpuTier}
                  onChange={(e) => setSpecsForm({ ...specsForm, targetGpuTier: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-300 block">نظام التشغيل المعتمد (Target OS):</label>
                <input
                  type="text"
                  value={specsForm.targetOs}
                  onChange={(e) => setSpecsForm({ ...specsForm, targetOs: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSavingSpecs}
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 min-h-[44px]"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingSpecs ? 'جاري الحفظ والتعميم...' : 'حفظ ونشر التوصيات فورياً'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD / EDIT LAPTOP MODEL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" dir="rtl">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#091527] border border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-black text-white">
                {editingLaptop ? `تعديل نموذج: ${editingLaptop.name}` : 'إضافة نموذج لابتوب جديد لطلاب القسم'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModel} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">اسم اللابتوب والموديل:</label>
                  <input
                    type="text"
                    required
                    value={modelForm.name}
                    onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                    placeholder="مثال: Lenovo LOQ 15 / Legion 5"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">الماركة (Brand):</label>
                  <input
                    type="text"
                    required
                    value={modelForm.brand}
                    onChange={(e) => setModelForm({ ...modelForm, brand: e.target.value })}
                    placeholder="Lenovo, ASUS, Dell, HP, Acer..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-300">رابط صورة الجهاز (Image URL):</label>
                  <input
                    type="url"
                    value={modelForm.image}
                    onChange={(e) => setModelForm({ ...modelForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">المعالج (CPU):</label>
                  <input
                    type="text"
                    required
                    value={modelForm.cpu}
                    onChange={(e) => setModelForm({ ...modelForm, cpu: e.target.value })}
                    placeholder="Intel Core i7-13650HX / AMD Ryzen 7"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">الذاكرة (RAM):</label>
                  <input
                    type="text"
                    required
                    value={modelForm.ram}
                    onChange={(e) => setModelForm({ ...modelForm, ram: e.target.value })}
                    placeholder="16 GB DDR5"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-cyan-300">التخزين الداخلي (Storage):</label>
                  <input
                    type="text"
                    required
                    value={modelForm.storage}
                    onChange={(e) => setModelForm({ ...modelForm, storage: e.target.value })}
                    placeholder="1 TB NVMe SSD"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-cyan-500/80 text-white focus:outline-none focus:border-cyan-400 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">كرت الشاشة (GPU):</label>
                  <input
                    type="text"
                    required
                    value={modelForm.gpu}
                    onChange={(e) => setModelForm({ ...modelForm, gpu: e.target.value })}
                    placeholder="NVIDIA RTX 4050 6GB / Intel Iris Xe"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">الشاشة:</label>
                  <input
                    type="text"
                    value={modelForm.screenSize}
                    onChange={(e) => setModelForm({ ...modelForm, screenSize: e.target.value })}
                    placeholder="15.6 بوصة FHD IPS 144Hz"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">تقدير السعر التقريبي:</label>
                  <input
                    type="text"
                    value={modelForm.priceEstimate}
                    onChange={(e) => setModelForm({ ...modelForm, priceEstimate: e.target.value })}
                    placeholder="850$ - 990$"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">فئة التقييم:</label>
                  <select
                    value={modelForm.suitabilityLevel}
                    onChange={(e) => setModelForm({ ...modelForm, suitabilityLevel: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="balanced">متوازن (الموصى به لطلاب القسم)</option>
                    <option value="budget">اقتصادي وعملي</option>
                    <option value="pro">أداء احترافي ومشاريع تخرج</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">شارة الملاءمة (Badge):</label>
                  <input
                    type="text"
                    value={modelForm.suitabilityBadge}
                    onChange={(e) => setModelForm({ ...modelForm, suitabilityBadge: e.target.value })}
                    placeholder="الموصى به لطلاب القسم"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-300">المجالات المناسبة (كل مجال بسطر منفصل):</label>
                  <textarea
                    rows={3}
                    value={modelForm.suitableForRaw}
                    onChange={(e) => setModelForm({ ...modelForm, suitableForRaw: e.target.value })}
                    placeholder="البرمجة وبيئات التطوير&#10;MATLAB / Simulink&#10;المحاكاة الهندسية&#10;الأنظمة المدمجة وFPGA&#10;مشاريع التخرج"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-300">نقاط القوة والميزات (كل ميزة بسطر منفصل):</label>
                  <textarea
                    rows={3}
                    value={modelForm.prosRaw}
                    onChange={(e) => setModelForm({ ...modelForm, prosRaw: e.target.value })}
                    placeholder="سعة تخزين 1TB تكفي حزم برمجيات القسم&#10;معالج قوي في الحسابات المصفوفية&#10;تبريد ممتاز"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                    <input
                      type="checkbox"
                      checked={modelForm.isRecommended}
                      onChange={(e) => setModelForm({ ...modelForm, isRecommended: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500 focus:ring-0"
                    />
                    <span>تمييز هذا الجهاز كـ "خيار موصى به رئيسي" لطلاب القسم</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950"
                >
                  {isSaving ? 'جاري الحفظ والتعميم...' : 'حفظ النموذج ونشره'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
