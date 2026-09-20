import React, { useState, useEffect } from 'react';
import { 
  MessageSquarePlus, 
  ThumbsUp, 
  Sparkles, 
  Send, 
  BookOpen, 
  Flame, 
  CheckCircle2, 
  AlertCircle,
  LogIn,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { CommunityTip } from '../types/student';
import { firebaseSyncService, TipsStateCallback } from '../services/firebaseSync';
import { useStudentState } from '../services/useStudentState';
import { COURSES_DATA } from '../data/courses';

export const CommunityTipsSection: React.FC = () => {
  const { profile, firebaseUser, signInWithGoogle } = useStudentState();
  const [tips, setTips] = useState<CommunityTip[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState(true);
  const [tipsError, setTipsError] = useState<string | null>(null);

  const [isOpenForm, setIsOpenForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState(profile.name || '');
  const [category, setCategory] = useState<'study_tip' | 'exam_advice' | 'lab_work' | 'resource'>('study_tip');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('general');

  useEffect(() => {
    const unsubscribe = firebaseSyncService.subscribeCommunityTips((state: TipsStateCallback) => {
      setTips(state.tips);
      setIsLoadingTips(state.isLoading);
      setTipsError(state.error);
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!firebaseUser) {
      setErrorMsg('يرجى تسجيل الدخول بحساب Google أولاً لتتمكن من نشر نصيحة موثقة في المجتمع.');
      return;
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length < 5) {
      setErrorMsg('يرجى كتابة نصيحة واضحة لا تقل عن 5 أحرف.');
      return;
    }

    setIsSubmitting(true);
    try {
      const course = COURSES_DATA.find((c) => c.id === selectedCourseId);
      await firebaseSyncService.addCommunityTip({
        authorName: authorName.trim() || firebaseUser.displayName || 'طالب هندسة اتصالات',
        authorYear: profile.currentYear || 'طالب',
        courseId: selectedCourseId !== 'general' ? selectedCourseId : undefined,
        courseNameAr: course?.nameAr,
        content: trimmedContent,
        category
      });

      setContent('');
      setIsOpenForm(false);
      setSuccessMsg('تم نشر نصيحتك وتجربتك بنجاح في قاعدة بيانات Firestore!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.warn('Error adding tip:', err);
      setErrorMsg('تعذر نشر النصيحة حالياً. يرجى التحقق من اتصال الإنترنت والمحاولة مجدداً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (tip: CommunityTip) => {
    if (!firebaseUser) {
      setErrorMsg('يرجى تسجيل الدخول بحساب Google أولاً للتفاعل مع نصائح زملائك.');
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }

    try {
      const isLiked = tip.likedBy?.includes(firebaseUser.uid) || false;
      await firebaseSyncService.toggleLikeTip(tip.id, isLiked);
    } catch (err) {
      console.warn('Failed to like tip:', err);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'study_tip': return 'نصيحة دراسية';
      case 'exam_advice': return 'توجيه للامتحان';
      case 'lab_work': return 'مخبر وعملي';
      case 'resource': return 'مصدر مقترح';
      default: return 'عام';
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return isNaN(d.getTime()) ? '' : d.toLocaleDateString('ar-SY');
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6 pt-6 border-t border-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>مجتمع ECE الحي • قاعدة بيانات سحابية متزامنة</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            تجارب ونَصائح الطلاب الميدانية (Community Feed)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            شارك نصائحك وتوجيهاتك للامتحانات والمخابر في كلية الهمك بكل خصوصية ومسؤولية.
          </p>
        </div>

        <button
          onClick={() => {
            setIsOpenForm(!isOpenForm);
            setErrorMsg(null);
          }}
          className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 text-xs font-bold flex items-center gap-2 transition-all shrink-0 active:scale-95"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>{isOpenForm ? 'إلغاء' : 'أضف نصيحة أو تجربة'}</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          {!firebaseUser && (
            <button
              onClick={async () => {
                await signInWithGoogle();
                setErrorMsg(null);
              }}
              className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>تسجيل الدخول</span>
            </button>
          )}
        </div>
      )}

      {/* Add Tip Form */}
      {isOpenForm && (
        <form 
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 rounded-3xl bg-[#081529] border border-cyan-500/40 shadow-xl space-y-4 text-xs"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-white font-bold">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>إضافة نصيحة أو تجربة طلابية موثقة</span>
            </div>
            {!firebaseUser && (
              <span className="text-[11px] text-amber-400 font-normal">
                (يتطلب تسجيل الدخول بـ Google)
              </span>
            )}
          </div>

          {!firebaseUser ? (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
              <p className="text-slate-300">
                لمنع الإزعاج وحماية جودة النصائح الأكاديمية، يتطلب نشر التجارب تسجيل الدخول بحساب Google.
              </p>
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-lg"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول بـ Google للمتابعة</span>
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الاسم أو اللقب المعروض:</label>
                  <input
                    type="text"
                    maxLength={60}
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="اسمك أو لقبك الدراسي..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">المقرر المرتبط:</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="general">نصيحة عامة في القسم</option>
                    {COURSES_DATA.map((c) => (
                      <option key={c.id} value={c.id}>
                        سنة {c.year} • {c.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">نوع النصيحة:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="study_tip">نصيحة دراسية عامة</option>
                    <option value="exam_advice">توجيه امتحاني ومسائل</option>
                    <option value="lab_work">مخبر وعملي وبرمجيات</option>
                    <option value="resource">ملخص أو كتاب مقترح</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  نص النصيحة أو التجربة (بين 5 و 2000 حرف):
                </label>
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب خلاصة تجربتك أو توجيهك لزملائك الطلاب في المقرر أو المخابر..."
                  required
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تخزين آمن بدون نشر بريدك الإلكتروني</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpenForm(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || content.trim().length < 5}
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>نشر في المجتمع</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      )}

      {/* Community Tips Feed */}
      {isLoadingTips ? (
        <div className="p-8 rounded-3xl bg-[#091527] border border-slate-800/80 text-center space-y-3">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">جاري تحميل التجارب والنصائح من Cloud Firestore...</p>
        </div>
      ) : tipsError ? (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-400">{tipsError}</p>
          <p className="text-[11px] text-slate-500">
            يمكنك تصفح باقي أجزاء التطبيق ومتابعة رحلتك الأكاديمية دون أي انقطاع.
          </p>
        </div>
      ) : tips.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#091527] border border-slate-800/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white">كن أول من يشارك تجربة أو نصيحة!</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            قاعدة البيانات السحابية جاهزة لاستقبال نصائح وتجارب طلاب هندسة الإلكترونيات والاتصالات.
          </p>
          <button
            onClick={() => setIsOpenForm(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>أضف أول تجربة طلابية</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip) => {
            const isLiked = firebaseUser?.uid ? tip.likedBy?.includes(firebaseUser.uid) : false;
            return (
              <div 
                key={tip.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#091527] border border-slate-800/90 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3 shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 font-bold text-xs">
                        {tip.authorName ? tip.authorName.charAt(0) : 'ط'}
                      </div>
                      <div>
                        <span className="font-bold text-white">{tip.authorName || 'طالب'}</span>
                        <span className="text-[10px] text-slate-400 mr-1.5">
                          ({tip.authorYear === 'graduate' ? 'خريج' : `سنة ${tip.authorYear}`})
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                      {getCategoryLabel(tip.category)}
                    </span>
                  </div>

                  {tip.courseNameAr && (
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
                      <BookOpen className="w-3 h-3" />
                      <span>{tip.courseNameAr}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    {tip.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                  <span className="text-slate-500">
                    {formatDate(tip.createdAt)}
                  </span>

                  <button
                    onClick={() => handleLike(tip)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                      isLiked 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                        : 'text-slate-400 hover:text-cyan-300 bg-slate-900/60 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <ThumbsUp className={`w-3 h-3 ${isLiked ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                    <span>مفيدة ({tip.likesCount || 0})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
