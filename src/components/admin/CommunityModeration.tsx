import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Archive, 
  RotateCcw, 
  ThumbsUp, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { adminRepository } from '../../services/admin/adminRepository';
import { firebaseSyncService } from '../../services/firebaseSync';

interface TipItem {
  id: string;
  authorId: string;
  authorName: string;
  authorYear?: string | number;
  courseId?: string;
  courseNameAr?: string;
  content: string;
  category: string;
  likesCount?: number;
  likedBy?: string[];
  status?: 'active' | 'archived';
  createdAt?: string;
}

export const CommunityModeration: React.FC = () => {
  const [tips, setTips] = useState<TipItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadTips = async () => {
    setIsLoading(true);
    try {
      const data = await adminRepository.getAllCommunityTips();
      setTips(data as TipItem[]);
    } catch (e) {
      console.warn('Failed to load community tips for moderation:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTips();
  }, []);

  const handleToggleArchive = async (tip: TipItem) => {
    console.log("ARCHIVE BUTTON CLICKED", tip);
    console.log("TIP OBJECT FROM ADMIN", tip);
    console.log("ARCHIVE TARGET ID", tip.id);

    const isArchiving = (tip.status || 'active') === 'active';
    const confirmMsg = isArchiving
      ? `هل ترغب في حجب وأرشفة هذه النصيحة من الواجهة العامة للطلاب؟`
      : `هل ترغب في استعادة ظهور هذه النصيحة؟`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(tip.id);
    try {
      if (isArchiving) {
        await adminRepository.archiveCommunityTip(tip.id, tip.content);
      } else {
        await adminRepository.restoreCommunityTip(tip.id, tip.content);
      }

      setTips(prev => prev.map(t => {
        if (t.id === tip.id) {
          return { ...t, status: isArchiving ? 'archived' : 'active' };
        }
        return t;
      }));
    } catch (e) {
      console.error('Error moderating community tip:', e);
      alert('حدث خطأ أثناء تعديل حالة النصيحة.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredTips = tips.filter(t => {
    const status = t.status || 'active';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesSearch = 
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.courseNameAr && t.courseNameAr.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>الإشراف الأكاديمي على نصائح ومشاركات الطلاب</span>
          </div>
          <h2 className="text-lg font-black text-white">
            مراجعة مساهمات المجتمع الطلابي ({tips.length} نصيحة ومشاركة)
          </h2>
          <p className="text-xs text-slate-400">
            تتيح هذه اللوحة للإدارة الأكاديمية مراجعة النصائح المشتركة وحجب المحتوى غير اللائق أو المضلل.
          </p>
        </div>

        <button
          onClick={async () => {
            if (window.confirm('هل ترغب في إعادة بناء وتطهير مجموعة النصائح الطلابية (communityTips) في قاعدة البيانات السحابية وضخ النصائح الرسمية الموثوقة؟')) {
              setIsLoading(true);
              try {
                await firebaseSyncService.rebuildCommunityTipsCollection();
                await loadTips();
                alert('تمت إعادة بناء وتنشيط مجموعة النصائح في قاعدة البيانات السحابية بنجاح! 🚀');
              } catch (e) {
                console.error('Rebuild failed:', e);
                alert('حدث خطأ أثناء إعادة بناء المجموعة.');
              } finally {
                setIsLoading(false);
              }
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-lg transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>إعادة بناء وتطهير مجموعة النصائح السحابية</span>
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
            placeholder="بحث في نص النصيحة، اسم الطالب، أو المقرر..."
            className="w-full pr-9 pl-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-slate-400 ml-1">الحالة:</span>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'active', label: 'النشطة والظاهرة' },
            { id: 'archived', label: 'المحجوبة والمؤرشفة' }
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

      {/* Tips Stream */}
      <div className="space-y-3">
        {filteredTips.length > 0 ? (
          filteredTips.map(tip => {
            const isArchived = (tip.status || 'active') === 'archived';

            return (
              <div
                key={tip.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isArchived 
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-70' 
                    : 'bg-[#091527] border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-xs">
                        {tip.authorName || 'طالب مجهول'}
                      </span>
                      {tip.authorYear && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          السنة {tip.authorYear}
                        </span>
                      )}
                      {tip.courseNameAr && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/50 text-cyan-300 font-bold">
                          {tip.courseNameAr}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isArchived 
                          ? 'bg-rose-950/50 text-rose-300 border-rose-800/50' 
                          : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50'
                      }`}>
                        {isArchived ? 'محجوبة' : 'ظاهرة للجميع'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 pt-1">
                      {tip.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(tip.createdAt).toLocaleDateString('ar-SY')}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-amber-400">
                        <ThumbsUp className="w-3 h-3" />
                        {tip.likesCount || 0} إعجاب
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleArchive(tip)}
                    disabled={actionLoadingId === tip.id}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      isArchived
                        ? 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border-emerald-800/50'
                        : 'bg-slate-900 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border-slate-800'
                    }`}
                  >
                    {isArchived ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>استعادة الظهور</span>
                      </>
                    ) : (
                      <>
                        <Archive className="w-3.5 h-3.5" />
                        <span>حجب النصيحة</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-200 leading-relaxed">
                  {tip.content}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-3xl bg-[#091527] border border-slate-800 space-y-3">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-slate-300">لم يتم العثور على نصائح طلابية مطابقة للفلتر</div>
          </div>
        )}
      </div>
    </div>
  );
};
