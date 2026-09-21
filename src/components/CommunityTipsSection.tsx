import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquarePlus, 
  ThumbsUp, 
  ThumbsDown,
  Sparkles, 
  Send, 
  BookOpen, 
  Flame, 
  CheckCircle2, 
  AlertCircle,
  LogIn,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Clock,
  User,
  Filter
} from 'lucide-react';
import { CommunityTip } from '../types/student';
import { firebaseSyncService, TipsStateCallback } from '../services/firebaseSync';
import { useStudentState } from '../services/useStudentState';
import { guestVisitorService } from '../services/guestVisitorService';
import { COURSES_DATA } from '../data/courses';
import { useLanguage } from '../context/LanguageContext';

export const CommunityTipsSection: React.FC = () => {
  const { profile, firebaseUser, signInWithGoogle } = useStudentState();
  const { t, isArabic } = useLanguage();
  const storedGuest = guestVisitorService.getStoredGuest();

  const [tips, setTips] = useState<CommunityTip[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState(true);
  const [tipsError, setTipsError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<'likes' | 'newest'>('likes');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Default author name from Google account or registered profile/guest
  const defaultAccountName = firebaseUser?.displayName || profile.name || storedGuest?.fullName || '';

  // Form State
  const [content, setContent] = useState('');
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

  const sortedAndFilteredTips = useMemo(() => {
    let result = [...tips];

    if (filterCourse !== 'all') {
      result = result.filter(t => t.courseId === filterCourse);
    }

    if (sortBy === 'likes') {
      // Sort by highest likes first (descending), then dislikes (ascending), then newest
      result.sort((a, b) => {
        const likesA = a.likesCount || 0;
        const likesB = b.likesCount || 0;
        if (likesB !== likesA) {
          return likesB - likesA;
        }
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    } else {
      // Newest first
      result.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    }

    return result;
  }, [tips, sortBy, filterCourse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedContent = content.trim();
    if (trimmedContent.length < 5) {
      setErrorMsg(isArabic ? 'يرجى كتابة نصيحة واضحة لا تقل عن 5 أحرف.' : 'Please enter advice of at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const course = COURSES_DATA.find((c) => c.id === selectedCourseId);
      const chosenName = defaultAccountName || firebaseUser?.displayName || profile.name || storedGuest?.fullName || (isArabic ? 'طالب هندسة اتصالات' : 'ECE Student');
      
      await firebaseSyncService.addCommunityTip({
        authorName: chosenName,
        authorYear: profile.currentYear || 'طالب',
        courseId: selectedCourseId !== 'general' ? selectedCourseId : undefined,
        courseNameAr: course?.nameAr,
        content: trimmedContent,
        category
      });

      setContent('');
      setIsOpenForm(false);
      setSuccessMsg(isArabic ? 'تم نشر نصيحتك باسم حسابك وتجربتك بنجاح في قاعدة البيانات!' : 'Your advice was published under your account name successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.warn('Error adding tip:', err);
      if (err?.message === 'PERMISSION_DENIED_GOOGLE_AUTH_REQUIRED' || String(err?.message || '').includes('permissions')) {
        setErrorMsg(isArabic 
          ? 'يتطلب الحفظ المباشر في قاعدة البيانات السحابية تسجيل الدخول بـ Google. يرجى الضغط على زر "تسجيل الدخول بـ Google" ثم إعادة المحاولة.' 
          : 'Direct cloud database write requires Google Sign-In. Please sign in with Google and try again.');
      } else {
        setErrorMsg(isArabic ? 'تعذر نشر النصيحة حالياً. يرجى التحقق من اتصال الإنترنت أو تسجيل الدخول بـ Google والمحاولة مجدداً.' : 'Failed to publish tip. Please check your internet connection or sign in with Google.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeUser = firebaseUser || firebaseSyncService.getUser();
  const currentUid = activeUser?.uid || profile.uid || storedGuest?.id || '';
  const isStudentLoggedIn = Boolean(activeUser || profile.username || profile.email || storedGuest);

  const handleLike = async (tip: CommunityTip) => {
    if (!currentUid) {
      setErrorMsg(isArabic ? 'يرجى تسجيل الدخول أولاً للتفاعل مع نصائح زملائك.' : 'Please sign in to react to advice.');
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }

    const isLiked = tip.likedBy?.includes(currentUid) || false;
    const isDisliked = tip.dislikedBy?.includes(currentUid) || false;

    // Optimistic UI Update for instant user response
    setTips(prevTips => prevTips.map(t => {
      if (t.id !== tip.id) return t;
      const updatedLikedBy = isLiked 
        ? (t.likedBy || []).filter(id => id !== currentUid) 
        : [...(t.likedBy || []), currentUid];
      const updatedDislikedBy = isLiked ? (t.dislikedBy || []) : (t.dislikedBy || []).filter(id => id !== currentUid);
      return {
        ...t,
        likesCount: Math.max(0, (t.likesCount || 0) + (isLiked ? -1 : 1)),
        dislikesCount: isDisliked && !isLiked ? Math.max(0, (t.dislikesCount || 0) - 1) : (t.dislikesCount || 0),
        likedBy: updatedLikedBy,
        dislikedBy: updatedDislikedBy
      };
    }));

    try {
      await firebaseSyncService.toggleLikeTip(tip.id, isLiked, isDisliked);
    } catch (err) {
      console.warn('Failed to like tip:', err);
    }
  };

  const handleDislike = async (tip: CommunityTip) => {
    if (!currentUid) {
      setErrorMsg(isArabic ? 'يرجى تسجيل الدخول أولاً للتفاعل مع نصائح زملائك.' : 'Please sign in to react to advice.');
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }

    const isDisliked = tip.dislikedBy?.includes(currentUid) || false;
    const isLiked = tip.likedBy?.includes(currentUid) || false;

    // Optimistic UI Update for instant user response
    setTips(prevTips => prevTips.map(t => {
      if (t.id !== tip.id) return t;
      const updatedDislikedBy = isDisliked 
        ? (t.dislikedBy || []).filter(id => id !== currentUid) 
        : [...(t.dislikedBy || []), currentUid];
      const updatedLikedBy = isDisliked ? (t.likedBy || []) : (t.likedBy || []).filter(id => id !== currentUid);
      return {
        ...t,
        dislikesCount: Math.max(0, (t.dislikesCount || 0) + (isDisliked ? -1 : 1)),
        likesCount: isLiked && !isDisliked ? Math.max(0, (t.likesCount || 0) - 1) : (t.likesCount || 0),
        dislikedBy: updatedDislikedBy,
        likedBy: updatedLikedBy
      };
    }));

    try {
      await firebaseSyncService.toggleDislikeTip(tip.id, isDisliked, isLiked);
    } catch (err) {
      console.warn('Failed to dislike tip:', err);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'study_tip': return isArabic ? 'نصيحة دراسية' : 'Study Method';
      case 'exam_advice': return isArabic ? 'توجيه للامتحان' : 'Exam Advice';
      case 'lab_work': return isArabic ? 'مخبر وعملي' : 'Lab & Practice';
      case 'resource': return isArabic ? 'مصدر مقترح' : 'Resource';
      default: return isArabic ? 'عام' : 'General';
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return isNaN(d.getTime()) ? '' : d.toLocaleDateString(isArabic ? 'ar-SY' : 'en-US');
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6 pt-6 border-t border-slate-800">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{isArabic ? 'مجتمع ECE الحي • قاعدة بيانات سحابية متزامنة' : 'ECE Live Community • Real-Time Database'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t('tips.feed_title')}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
            {t('tips.feed_desc')}
          </p>
        </div>

        <button
          onClick={() => {
            setIsOpenForm(!isOpenForm);
            setErrorMsg(null);
          }}
          className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 text-xs font-bold flex items-center gap-2 transition-all shrink-0 active:scale-95 shadow-lg shadow-cyan-950/30"
        >
          <MessageSquarePlus className="w-4 h-4 text-cyan-400" />
          <span>{isOpenForm ? t('tips.cancel_btn') : t('tips.add_btn')}</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/70 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-800/70 text-rose-300 text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
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
              <span>{t('nav.login')}</span>
            </button>
          )}
        </div>
      )}

      {/* Add Tip Form Modal/Card */}
      {isOpenForm && (
        <form 
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 rounded-3xl bg-[#081529] border border-cyan-500/50 shadow-2xl space-y-4 text-xs animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-white font-bold">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{t('tips.add_btn')}</span>
            </div>
            {!isStudentLoggedIn && (
              <span className="text-[11px] text-amber-400 font-normal">
                ({isArabic ? 'يتطلب تسجيل الدخول بـ Google أو حساب الطالب' : 'Requires Sign-in'})
              </span>
            )}
          </div>

          {!isStudentLoggedIn ? (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
              <p className="text-slate-300">
                {isArabic 
                  ? 'لمنع الإزعاج وحماية جودة النصائح الأكاديمية، يتطلب نشر التجارب تسجيل الدخول بحساب الطالب أو Google.' 
                  : 'To protect content quality, sharing advice requires signing in.'}
              </p>
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-lg"
              >
                <LogIn className="w-4 h-4" />
                <span>{isArabic ? 'تسجيل الدخول بـ Google للمتابعة' : 'Sign In with Google to Continue'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Info banner confirming account attribution */}
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center gap-2 text-cyan-300 text-[11px]">
                <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>
                  {isArabic 
                    ? `سيتم نشر النصيحة باسم حسابك: ` 
                    : `Advice will be published using your account name: `}
                  <strong className="text-white font-mono">{defaultAccountName || firebaseUser?.displayName || profile.name || profile.username || 'طالب ECE'}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('tips.course_label')}</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="general">{t('tips.general_course')}</option>
                    {COURSES_DATA.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isArabic ? `سنة ${c.year} • ${c.nameAr}` : `Year ${c.year} • ${c.nameEn || c.nameAr}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('tips.category_label')}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="study_tip">{t('tips.cat_study')}</option>
                    <option value="exam_advice">{t('tips.cat_exam')}</option>
                    <option value="lab_work">{t('tips.cat_lab')}</option>
                    <option value="resource">{t('tips.cat_resource')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {t('tips.content_label')} ({isArabic ? 'بين 5 و 2000 حرف' : '5 to 2000 chars'}):
                </label>
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('tips.content_placeholder')}
                  required
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isArabic ? 'تخزين آمن وموثوق باسم حسابك' : 'Securely published under your account identity'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpenForm(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {t('tips.cancel_btn')}
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
                    <span>{t('tips.publish_btn')}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      )}

      {/* Sorting & Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs">
        {/* Left: Sorting Tabs */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium whitespace-nowrap pl-1">
            {t('tips.sort_by')}
          </span>
          <button
            onClick={() => setSortBy('likes')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              sortBy === 'likes'
                ? 'bg-gradient-to-r from-amber-500/25 to-cyan-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('tips.sort_likes')}</span>
          </button>
          <button
            onClick={() => setSortBy('newest')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              sortBy === 'newest'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('tips.sort_newest')}</span>
          </button>
        </div>

        {/* Right: Course Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 max-w-[220px]"
          >
            <option value="all">{isArabic ? 'جميع المقررات والتجارب' : 'All Courses & Tips'}</option>
            {COURSES_DATA.map((c) => (
              <option key={c.id} value={c.id}>
                {isArabic ? c.nameAr : (c.nameEn || c.nameAr)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Community Tips Feed Cards */}
      {isLoadingTips ? (
        <div className="p-8 rounded-3xl bg-[#091527] border border-slate-800/80 text-center space-y-3">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">{t('tips.loading')}</p>
        </div>
      ) : tipsError ? (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <p className="text-xs text-slate-400">{tipsError}</p>
          <p className="text-[11px] text-slate-500">
            {isArabic ? 'يمكنك تصفح باقي أجزاء التطبيق دون أي انقطاع.' : 'You can browse other sections of the app smoothly.'}
          </p>
        </div>
      ) : sortedAndFilteredTips.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#091527] border border-slate-800/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white">{t('tips.first_to_share')}</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isArabic 
              ? 'قاعدة البيانات السحابية جاهزة لاستقبال نصائح وتجارب طلاب هندسة الإلكترونيات والاتصالات.' 
              : 'The cloud database is ready to receive experiences and tips from ECE students.'}
          </p>
          <button
            onClick={() => setIsOpenForm(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>{t('tips.add_btn')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedAndFilteredTips.map((tip) => {
            const isLiked = currentUid ? (tip.likedBy?.includes(currentUid) || false) : false;
            const isDisliked = currentUid ? (tip.dislikedBy?.includes(currentUid) || false) : false;
            const likesCount = tip.likesCount || 0;
            const dislikesCount = tip.dislikesCount || 0;

            return (
              <div 
                key={tip.id}
                className={`p-4 sm:p-5 rounded-2xl bg-[#091527] border transition-all flex flex-col justify-between space-y-3 shadow-lg ${
                  likesCount >= 5 
                    ? 'border-amber-500/30 hover:border-amber-500/60 shadow-amber-950/10' 
                    : 'border-slate-800/90 hover:border-cyan-500/40'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    {/* Author info (with avatar) */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-cyan-400 font-bold text-xs">
                        {tip.authorName ? tip.authorName.charAt(0) : 'ط'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{tip.authorName || (isArabic ? 'طالب' : 'Student')}</span>
                          {likesCount >= 5 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                              ⭐ {isArabic ? 'مميزة' : 'Top'}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {tip.authorYear === 'graduate' ? (isArabic ? 'خريج' : 'Graduate') : `${isArabic ? 'سنة' : 'Year'} ${tip.authorYear}`}
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

                {/* Footer: Date & Like + Dislike Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                  <span className="text-slate-500">
                    {formatDate(tip.createdAt)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Like Button */}
                    <button
                      onClick={() => handleLike(tip)}
                      title={isArabic ? 'نصيحة مفيدة' : 'Helpful'}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                        isLiked 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold' 
                          : 'text-slate-400 hover:text-cyan-300 bg-slate-900/60 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                      <span>{likesCount}</span>
                    </button>

                    {/* Dislike Button */}
                    <button
                      onClick={() => handleDislike(tip)}
                      title={isArabic ? 'غير مفيدة' : 'Not helpful'}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                        isDisliked 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold' 
                          : 'text-slate-400 hover:text-rose-300 bg-slate-900/60 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <ThumbsDown className={`w-3.5 h-3.5 ${isDisliked ? 'fill-rose-400 text-rose-400' : ''}`} />
                      <span>{dislikesCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
