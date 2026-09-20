import React, { useEffect, useState, useMemo } from 'react';
import { 
  X, 
  BookOpen, 
  Cpu, 
  CheckCircle2, 
  GitFork, 
  Sparkles, 
  FileText, 
  ExternalLink,
  Layers,
  Star,
  Clock,
  Compass,
  ThumbsUp,
  ThumbsDown,
  MessageSquarePlus,
  Send,
  Loader2,
  AlertCircle,
  User,
  ShieldCheck
} from 'lucide-react';
import { Course, SoftwareTool, CourseProgressStatus } from '../types';
import { SOFTWARE_DATA } from '../data/software';
import { COURSES_DATA } from '../data/courses';
import { useStudentState } from '../services/useStudentState';
import { firebaseSyncService, TipsStateCallback } from '../services/firebaseSync';
import { CommunityTip } from '../types/student';
import { useLanguage } from '../context/LanguageContext';
import { guestVisitorService } from '../services/guestVisitorService';

interface CourseModalProps {
  course: Course | null;
  onClose: () => void;
  onSelectSoftware?: (software: SoftwareTool) => void;
  onSelectRelatedCourse?: (course: Course) => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  course,
  onClose,
  onSelectSoftware,
  onSelectRelatedCourse
}) => {
  const { courseProgress, setCourseStatus, profile, firebaseUser, signInWithGoogle } = useStudentState();
  const { t, isArabic } = useLanguage();
  const storedGuest = guestVisitorService.getStoredGuest();

  const [allTips, setAllTips] = useState<CommunityTip[]>([]);
  const [isOpenAddTip, setIsOpenAddTip] = useState(false);
  const [tipContent, setTipContent] = useState('');
  const [tipCategory, setTipCategory] = useState<'study_tip' | 'exam_advice' | 'lab_work' | 'resource'>('study_tip');
  const [isSubmittingTip, setIsSubmittingTip] = useState(false);
  const [tipSuccessMsg, setTipSuccessMsg] = useState<string | null>(null);
  const [tipErrorMsg, setTipErrorMsg] = useState<string | null>(null);

  // Subscribe to community tips
  useEffect(() => {
    const unsub = firebaseSyncService.subscribeCommunityTips((state: TipsStateCallback) => {
      setAllTips(state.tips);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && course) {
        onClose();
      }
    };
    if (course) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [course, onClose]);

  if (!course) return null;

  const currentStatus: CourseProgressStatus | undefined = courseProgress[course.id];

  // Resolve linked software
  const linkedSoftware = SOFTWARE_DATA.filter((s) =>
    course.relatedSoftware.includes(s.id) ||
    s.usedInCourses.some((cName) => course.nameAr.includes(cName) || cName.includes(course.nameAr))
  );

  // Resolve related courses
  const relatedCoursesList = COURSES_DATA.filter((c) =>
    course.relatedCourses.includes(c.id)
  );

  // Filter tips related to this course
  const courseTips = allTips
    .filter(
      (t) =>
        t.courseId === course.id ||
        (t.courseNameAr && (t.courseNameAr.includes(course.nameAr) || course.nameAr.includes(t.courseNameAr)))
    )
    .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));

  const handleToggleStatus = (status: CourseProgressStatus) => {
    if (currentStatus === status) {
      setCourseStatus(course.id, null);
    } else {
      setCourseStatus(course.id, status);
    }
  };

  const handleLikeTip = async (tip: CommunityTip) => {
    if (!firebaseUser) {
      setTipErrorMsg(t('tips.login_required'));
      setTimeout(() => setTipErrorMsg(null), 3000);
      return;
    }
    try {
      const isLiked = tip.likedBy?.includes(firebaseUser.uid) || false;
      const isDisliked = tip.dislikedBy?.includes(firebaseUser.uid) || false;
      await firebaseSyncService.toggleLikeTip(tip.id, isLiked, isDisliked);
    } catch (err) {
      console.warn('Failed to like tip:', err);
    }
  };

  const handleDislikeTip = async (tip: CommunityTip) => {
    if (!firebaseUser) {
      setTipErrorMsg(t('tips.login_required'));
      setTimeout(() => setTipErrorMsg(null), 3000);
      return;
    }
    try {
      const isDisliked = tip.dislikedBy?.includes(firebaseUser.uid) || false;
      const isLiked = tip.likedBy?.includes(firebaseUser.uid) || false;
      await firebaseSyncService.toggleDislikeTip(tip.id, isDisliked, isLiked);
    } catch (err) {
      console.warn('Failed to dislike tip:', err);
    }
  };

  const handleAddTipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      setTipErrorMsg(t('tips.login_required'));
      return;
    }
    if (tipContent.trim().length < 5) {
      setTipErrorMsg(isArabic ? 'يرجى كتابة نصيحة واضحة لا تقل عن 5 أحرف.' : 'Please enter at least 5 characters.');
      return;
    }

    setIsSubmittingTip(true);
    setTipErrorMsg(null);
    try {
      const author = firebaseUser.displayName || profile.name || storedGuest?.fullName || (isArabic ? 'طالب هندسة اتصالات' : 'ECE Student');
      await firebaseSyncService.addCommunityTip({
        authorName: author,
        authorYear: profile.currentYear || 'طالب',
        courseId: course.id,
        courseNameAr: course.nameAr,
        content: tipContent.trim(),
        category: tipCategory
      });

      setTipContent('');
      setIsOpenAddTip(false);
      setTipSuccessMsg(isArabic ? 'تمت إضافة نصيحتك وتجربتك في هذا المقرر بنجاح!' : 'Your advice for this course has been published!');
      setTimeout(() => setTipSuccessMsg(null), 3500);
    } catch (err) {
      console.warn('Error adding course tip:', err);
      setTipErrorMsg(isArabic ? 'تعذر نشر النصيحة حالياً. يرجى المحاولة مجدداً.' : 'Failed to publish tip.');
    } finally {
      setIsSubmittingTip(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'study_tip': return isArabic ? 'نصيحة دراسية' : 'Study Tip';
      case 'exam_advice': return isArabic ? 'توجيه للامتحان' : 'Exam Advice';
      case 'lab_work': return isArabic ? 'مخبر وعملي' : 'Lab & Practice';
      case 'resource': return isArabic ? 'مصدر مقترح' : 'Resource';
      default: return isArabic ? 'عام' : 'General';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-modal-title"
    >
      <div 
        className="w-full max-w-3xl bg-[#091426] border border-cyan-700/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="relative px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-[#071324] to-slate-950">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-700/50 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  {isArabic ? `السنة ${course.year === 1 ? 'الأولى' : course.year === 2 ? 'الثانية' : course.year === 3 ? 'الثالثة' : course.year === 4 ? 'الرابعة' : 'الخامسة'}` : `Year ${course.year}`}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-slate-300 border border-slate-700/60">
                  {isArabic ? `الفصل ${course.semester === 1 ? 'الأول' : 'الثاني'}` : `Semester ${course.semester}`}
                </span>
                {course.tags.map((tag) => (
                  <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">
                    #{tag}
                  </span>
                ))}
              </div>

              <h2 id="course-modal-title" className="text-2xl font-black text-white tracking-tight mt-2">
                {course.nameAr}
              </h2>
              {course.nameEn && (
                <p className="text-sm font-mono text-cyan-400/90" dir="ltr">
                  {course.nameEn}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Section 1: نظرة سريعة & حالة المقرر في رحلتي */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] text-cyan-400 font-bold flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                {isArabic ? 'حالة المقرر في رحلتي الأكاديمية:' : 'Course Status in My Journey:'}
              </span>
              <div className="text-xs text-slate-300">
                {currentStatus === 'completed' && <span className="text-emerald-400 font-bold">{isArabic ? 'مقرر مجتاز ومكتمل ✅' : 'Completed Course ✅'}</span>}
                {currentStatus === 'important' && <span className="text-amber-300 font-bold">{isArabic ? 'مقرر أساسي ذو أولوية عالية ⭐' : 'High Priority Course ⭐'}</span>}
                {currentStatus === 'to_study' && <span className="text-blue-300 font-bold">{isArabic ? 'مقرر مخطط لدراسته في الخطة 📝' : 'Planned for Study 📝'}</span>}
                {!currentStatus && <span className="text-slate-400">{isArabic ? 'لم تقم بإضافته لرحلتك بعد' : 'Not added to journey yet'}</span>}
              </div>
            </div>

            {/* Quick Toggle Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleStatus('important')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  currentStatus === 'important'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-amber-300 border border-slate-800'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>{isArabic ? 'أساسي' : 'Key Course'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleStatus('to_study')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  currentStatus === 'to_study'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-blue-300 border border-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isArabic ? 'مخطط' : 'To Study'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleStatus('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  currentStatus === 'completed'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-emerald-300 border border-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isArabic ? 'مجتاز' : 'Passed'}</span>
              </button>
            </div>
          </div>

          {/* Section 2: نبذة وتوصيف المقرر */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              {isArabic ? 'التوصيف الأكاديمي والهدف التعليمي' : 'Academic Description & Learning Objectives'}
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
              {course.detailedDescription || course.shortDescription}
            </p>
          </div>

          {/* Section 3: ماذا تتعلم في هذا المقرر */}
          {course.whatYouLearn && course.whatYouLearn.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {isArabic ? 'المخرجات التعليمية والمفاهيم الأساسية' : 'Key Learning Outcomes'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {course.whatYouLearn.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span className="text-xs text-emerald-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: مصفوفة العلاقات الأكاديمية */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prerequisites */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <GitFork className="w-4 h-4 text-amber-400" />
                {isArabic ? 'المتطلبات السابقة' : 'Prerequisites'}
              </h3>
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 min-h-[80px] flex items-center flex-wrap gap-1.5">
                {course.prerequisites && course.prerequisites.length > 0 ? (
                  course.prerequisites.map((pre, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-amber-950/50 border border-amber-800/60 text-amber-200">
                      {pre}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">{isArabic ? 'لا توجد متطلبات سابقة مسجلة (مقرر تأسيسي)' : 'No prerequisites (Foundational course)'}</p>
                )}
              </div>
            </div>

            {/* Related Academic Courses */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                {isArabic ? 'مواد مرتبطة ولاحقة' : 'Follow-up / Related Courses'}
              </h3>
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex flex-wrap gap-1.5 min-h-[80px] items-center">
                {relatedCoursesList.length > 0 ? (
                  relatedCoursesList.map((rc) => (
                    <button
                      key={rc.id}
                      type="button"
                      onClick={() => onSelectRelatedCourse && onSelectRelatedCourse(rc)}
                      className="text-xs px-2.5 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/50 text-blue-200 flex items-center gap-1.5 transition-colors"
                    >
                      <span>{rc.nameAr}</span>
                      <span className="text-[10px] text-blue-400">(سنة {rc.year})</span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">{isArabic ? 'تعتبر محطة ختامية أو عامة في هذا المسار الأكاديمي.' : 'Concluding course in this track.'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: البرمجيات المرتبطة */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              {isArabic ? 'البرمجيات المرتبطة' : 'Linked Engineering Software'}
            </h3>
            {linkedSoftware.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {linkedSoftware.map((sw) => (
                  <div
                    key={sw.id}
                    onClick={() => onSelectSoftware && onSelectSoftware(sw)}
                    className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {sw.name}
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-1">{sw.purpose}</p>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 shrink-0 font-medium">
                      {isArabic ? 'عرض الأداة' : 'View Tool'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-400">
                {isArabic ? 'تركز هذه المادة على المفاهيم النظرية، التحليل الرياضي، أو التطبيق المخبري المباشر دون الحاجة لبرمجيات حاسوبية معقدة.' : 'Focuses on analytical principles and lab work.'}
              </div>
            )}
          </div>

          {/* Section 6: نصائح وتجارب الطلاب الخاصة بالمقرر (مع لايك وديسلايك) */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t('tips.course_tips_title')}</span>
                <span className="px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 text-[10px] border border-cyan-800/50 font-mono">
                  {courseTips.length}
                </span>
              </h3>

              <button
                type="button"
                onClick={() => {
                  setIsOpenAddTip(!isOpenAddTip);
                  setTipErrorMsg(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>{isOpenAddTip ? t('tips.cancel_btn') : t('tips.add_for_this_course')}</span>
              </button>
            </div>

            {/* Notifications */}
            {tipSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{tipSuccessMsg}</span>
              </div>
            )}

            {tipErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center justify-between gap-2">
                <span>{tipErrorMsg}</span>
                {!firebaseUser && (
                  <button
                    onClick={() => signInWithGoogle()}
                    className="px-2.5 py-1 rounded bg-cyan-500 text-slate-950 font-bold text-xs"
                  >
                    {t('nav.login')}
                  </button>
                )}
              </div>
            )}

            {/* Add Tip Inline Form */}
            {isOpenAddTip && (
              <form onSubmit={handleAddTipSubmit} className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    {isArabic ? 'النشر باسم الحساب:' : 'Publish under account:'} <span className="text-cyan-300">{firebaseUser?.displayName || profile.name || storedGuest?.fullName || (isArabic ? 'طالب' : 'Student')}</span>
                  </span>
                  <select
                    value={tipCategory}
                    onChange={(e) => setTipCategory(e.target.value as any)}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                  >
                    <option value="study_tip">{t('tips.cat_study')}</option>
                    <option value="exam_advice">{t('tips.cat_exam')}</option>
                    <option value="lab_work">{t('tips.cat_lab')}</option>
                    <option value="resource">{t('tips.cat_resource')}</option>
                  </select>
                </div>

                <textarea
                  rows={3}
                  value={tipContent}
                  onChange={(e) => setTipContent(e.target.value)}
                  placeholder={isArabic ? `اكتب نصيحتك وتجربتك في مادة ${course.nameAr}...` : `Share your advice for ${course.nameAr}...`}
                  required
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpenAddTip(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
                  >
                    {t('tips.cancel_btn')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTip || tipContent.trim().length < 5}
                    className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    {isSubmittingTip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{t('tips.publish_btn')}</span>
                  </button>
                </div>
              </form>
            )}

            {/* List of Tips for this Course */}
            {courseTips.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center space-y-2">
                <p className="text-xs text-slate-400">{t('tips.no_course_tips')}</p>
                <button
                  type="button"
                  onClick={() => setIsOpenAddTip(true)}
                  className="text-xs text-cyan-400 hover:underline font-bold"
                >
                  + {t('tips.add_for_this_course')}
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {courseTips.map((tip) => {
                  const isLiked = firebaseUser?.uid ? tip.likedBy?.includes(firebaseUser.uid) : false;
                  const isDisliked = firebaseUser?.uid ? (tip.dislikedBy?.includes(firebaseUser.uid) || false) : false;
                  const likesCount = tip.likesCount || 0;
                  const dislikesCount = tip.dislikesCount || 0;

                  return (
                    <div 
                      key={tip.id}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 font-bold text-[11px]">
                            {tip.authorName ? tip.authorName.charAt(0) : 'ط'}
                          </div>
                          <div>
                            <span className="font-bold text-white">{tip.authorName || (isArabic ? 'طالب' : 'Student')}</span>
                            <span className="text-[10px] text-slate-400 mr-1.5">
                              ({tip.authorYear === 'graduate' ? (isArabic ? 'خريج' : 'Graduate') : `${isArabic ? 'سنة' : 'Year'} ${tip.authorYear}`})
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                          {getCategoryLabel(tip.category)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line pr-1">
                        {tip.content}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px]">
                        <span className="text-slate-500 text-[10px]">
                          {tip.createdAt ? new Date(tip.createdAt).toLocaleDateString(isArabic ? 'ar-SY' : 'en-US') : ''}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Like Button */}
                          <button
                            onClick={() => handleLikeTip(tip)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] transition-colors ${
                              isLiked
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                                : 'text-slate-400 hover:text-cyan-300 bg-slate-900/60 border border-slate-800'
                            }`}
                          >
                            <ThumbsUp className={`w-3 h-3 ${isLiked ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                            <span>{likesCount}</span>
                          </button>

                          {/* Dislike Button */}
                          <button
                            onClick={() => handleDislikeTip(tip)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] transition-colors ${
                              isDisliked
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold'
                                : 'text-slate-400 hover:text-rose-300 bg-slate-900/60 border border-slate-800'
                            }`}
                          >
                            <ThumbsDown className={`w-3 h-3 ${isDisliked ? 'fill-rose-400 text-rose-400' : ''}`} />
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
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {isArabic ? 'رمز المقرر والمعلومات مستندة إلى الخطة الرسمية المعتمدة' : 'Official Curriculum Reference'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {isArabic ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
