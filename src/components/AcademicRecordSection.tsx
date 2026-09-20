import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Save, 
  Plus, 
  Calculator, 
  Info,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { AcademicYearNumber, AcademicSemester, CourseGrade, GradeStatus } from '../types';
import { COURSES_DATA } from '../data/courses';
import { useStudentState } from '../services/useStudentState';
import { academicSettingsService, AcademicSettings, DEFAULT_ACADEMIC_SETTINGS } from '../services/academicSettingsService';

interface AcademicRecordSectionProps {
  onNavigateTab: (tab: any) => void;
}

export const AcademicRecordSection: React.FC<AcademicRecordSectionProps> = ({ onNavigateTab }) => {
  const { academicGrades, saveCourseGrade, removeCourseGrade } = useStudentState();
  const [settings, setSettings] = useState<AcademicSettings>(DEFAULT_ACADEMIC_SETTINGS);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [tempScore, setTempScore] = useState<string>('');
  const [tempNotes, setTempNotes] = useState<string>('');
  const [expandedYear, setExpandedYear] = useState<number | null>(3); // Default expand year 3 or current

  useEffect(() => {
    academicSettingsService.getSettings().then(setSettings).catch(() => {});
  }, []);

  const years: AcademicYearNumber[] = [1, 2, 3, 4, 5];
  const semesters: AcademicSemester[] = [1, 2];

  // Helper to determine status based on score and passing grade
  const determineStatus = (score: number, passing: number): GradeStatus => {
    if (score >= passing) return 'passed';
    return 'failed';
  };

  const handleSaveGrade = (courseId: string, year: AcademicYearNumber, semester: AcademicSemester) => {
    const num = parseFloat(tempScore);
    if (isNaN(num) || num < 0 || num > settings.maxGrade) {
      alert(`الرجاء إدخال علامة صحيحة بين 0 و ${settings.maxGrade}`);
      return;
    }

    const status = determineStatus(num, settings.passingGrade);
    const gradeRecord: CourseGrade = {
      courseId,
      totalScore: num,
      status,
      year,
      semester,
      notes: tempNotes.trim() || undefined,
      updatedAt: new Date().toISOString()
    };

    saveCourseGrade(gradeRecord);
    setEditingCourseId(null);
    setTempScore('');
    setTempNotes('');
  };

  const handleStartEdit = (courseId: string, currentGrade?: CourseGrade) => {
    setEditingCourseId(courseId);
    setTempScore(currentGrade ? String(currentGrade.totalScore) : '');
    setTempNotes(currentGrade?.notes || '');
  };

  const handleDelete = (courseId: string) => {
    if (window.confirm('هل أنت متأكد من حذف علامة هذه المادة؟')) {
      removeCourseGrade(courseId);
    }
  };

  // Calculations
  const allCoursesCount = COURSES_DATA.length;
  const enteredCoursesCount = Object.keys(academicGrades).length;
  const isMissingGrades = enteredCoursesCount < allCoursesCount;

  // Calculate semester average
  const getSemesterAverage = (year: AcademicYearNumber, semester: AcademicSemester) => {
    const semesterCourses = COURSES_DATA.filter(c => c.year === year && c.semester === semester);
    const scores: number[] = [];
    semesterCourses.forEach(c => {
      const g = academicGrades[c.id];
      if (g && typeof g.totalScore === 'number') {
        scores.push(g.totalScore);
      }
    });
    if (scores.length === 0) return null;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round((sum / scores.length) * 100) / 100;
  };

  // Calculate annual average
  const getAnnualAverage = (year: AcademicYearNumber) => {
    const sem1Avg = getSemesterAverage(year, 1);
    const sem2Avg = getSemesterAverage(year, 2);
    const avgs = [sem1Avg, sem2Avg].filter((v): v is number => v !== null);
    if (avgs.length === 0) return null;
    const sum = avgs.reduce((a, b) => a + b, 0);
    return Math.round((sum / avgs.length) * 100) / 100;
  };

  // Calculate cumulative GPA
  const getCumulativeGPA = () => {
    const allScores: number[] = [];
    Object.values(academicGrades).forEach(g => {
      if (g && typeof g.totalScore === 'number') {
        allScores.push(g.totalScore);
      }
    });
    if (allScores.length === 0) return null;
    const sum = allScores.reduce((a, b) => a + b, 0);
    return Math.round((sum / allScores.length) * 100) / 100;
  };

  const cumulativeGPA = getCumulativeGPA();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#09172c] via-[#071324] to-[#0a1f3d] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>السجل الأكاديمي الشخصي • Academic Record</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              سجلك الأكاديمي وعلامات المواد
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              أدخل علاماتك لكل مادة دراسية تابعة لمنهاج هندسة الاتصالات والإلكترونيات. يتم حساب المعدلات الفصلية، السنوية، والتراكمية تلقائياً بناءً على علاماتك المسجلة.
            </p>
          </div>

          {/* GPA Summary Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/40 shadow-xl flex items-center gap-4 shrink-0 min-w-[240px]">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Calculator className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <div className="text-[11px] text-slate-400 font-medium">المعدل التراكمي (GPA)</div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {cumulativeGPA !== null ? cumulativeGPA : '—'} <span className="text-xs text-slate-400 font-normal">/ {settings.maxGrade}</span>
              </div>
              <div className="text-[10px] text-cyan-400">
                {enteredCoursesCount} من {allCoursesCount} مادة مدخلة
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Missing Grades Warning Banner */}
      {isMissingGrades && (
        <div className="rounded-2xl bg-amber-950/30 border border-amber-500/40 p-4 flex items-start gap-3.5 text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
            <span className="font-bold">تنبيه معدل تقديري:</span>
            <span> هذا المعدل تقديري بناءً على العلامات التي أدخلتها، وقد يختلف عن المعدل الرسمي. يرجى إكمال إدخال باقي المواد للحصول على تقييم شامل.</span>
          </div>
        </div>
      )}

      {/* Academic Settings Info bar */}
      <div className="rounded-2xl bg-[#091527] border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>إعدادات النظام المعتمدة: الحد الأعلى للعلامة: <strong className="text-white">{settings.maxGrade}</strong> | علامة النجاح: <strong className="text-white">{settings.passingGrade}</strong> | طريقة الحساب: <strong className="text-white">{settings.calculationMethod === 'simple_average' ? 'المتوسط العادي' : 'المتوسط الموزون'}</strong></span>
        </div>
      </div>

      {/* Curriculum Accordion by Year -> Semester */}
      <div className="space-y-6">
        {years.map((yearNum) => {
          const isExpanded = expandedYear === yearNum;
          const yearCourses = COURSES_DATA.filter(c => c.year === yearNum);
          const yearAvg = getAnnualAverage(yearNum);

          return (
            <div 
              key={yearNum}
              className="rounded-3xl bg-[#091527] border border-slate-800/80 shadow-xl overflow-hidden transition-all"
            >
              {/* Year Header */}
              <button
                onClick={() => setExpandedYear(isExpanded ? null : yearNum)}
                className="w-full p-5 sm:p-6 bg-slate-900/60 hover:bg-slate-900 flex items-center justify-between gap-4 text-right transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold text-sm">
                    {yearNum}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      السنة الدراسية {yearNum}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {yearCourses.length} مقررات دراسية • المعدل السنوي: <span className="text-cyan-400 font-bold">{yearAvg !== null ? yearAvg : '—'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {yearAvg !== null && (
                    <span className="px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
                      معدل السنة: {yearAvg}
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </button>

              {/* Year Content (Semesters) */}
              {isExpanded && (
                <div className="p-5 sm:p-6 space-y-6 border-t border-slate-800/80">
                  {semesters.map((semNum) => {
                    const semCourses = yearCourses.filter(c => c.semester === semNum);
                    const semAvg = getSemesterAverage(yearNum, semNum);

                    return (
                      <div key={semNum} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                          <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                            <span>الفصل الدراسي {semNum === 1 ? 'الأول' : 'الثاني'}</span>
                            <span className="text-xs text-slate-500 font-normal">({semCourses.length} مواد)</span>
                          </h4>
                          {semAvg !== null && (
                            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/50">
                              معدل الفصل: {semAvg}
                            </span>
                          )}
                        </div>

                        {/* Courses Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {semCourses.map((course) => {
                            const gradeData = academicGrades[course.id];
                            const isEditing = editingCourseId === course.id;

                            return (
                              <div 
                                key={course.id}
                                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-3 hover:border-slate-700 transition-all"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="text-sm font-bold text-white">
                                      {course.nameAr}
                                    </div>
                                    {gradeData ? (
                                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                        gradeData.status === 'passed'
                                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                          : 'bg-rose-950/80 text-rose-300 border-rose-800'
                                      }`}>
                                        {gradeData.status === 'passed' ? 'ناجح' : 'غير ناجح'}
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                                        لم تدخل العلامة
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-mono">
                                    {course.nameEn || course.id}
                                  </div>
                                </div>

                                {/* Grade Display or Input Form */}
                                {isEditing ? (
                                  <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        min="0"
                                        max={settings.maxGrade}
                                        value={tempScore}
                                        onChange={(e) => setTempScore(e.target.value)}
                                        placeholder={`العلامة (من ${settings.maxGrade})`}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                                      />
                                    </div>
                                    <input
                                      type="text"
                                      value={tempNotes}
                                      onChange={(e) => setTempNotes(e.target.value)}
                                      placeholder="ملاحظات (اختياري، مثلاً: دورة تكميلية)"
                                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                                    />
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => setEditingCourseId(null)}
                                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                                      >
                                        إلغاء
                                      </button>
                                      <button
                                        onClick={() => handleSaveGrade(course.id, yearNum, semNum)}
                                        className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-md"
                                      >
                                        <Save className="w-3.5 h-3.5" />
                                        <span>حفظ</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-400">العلامة:</span>
                                      <span className="text-sm font-black font-mono text-white">
                                        {gradeData ? `${gradeData.totalScore} / ${settings.maxGrade}` : '—'}
                                      </span>
                                      {gradeData?.notes && (
                                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                                          {gradeData.notes}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => handleStartEdit(course.id, gradeData)}
                                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                                        <span>{gradeData ? 'تعديل' : 'إدخال'}</span>
                                      </button>
                                      {gradeData && (
                                        <button
                                          onClick={() => handleDelete(course.id)}
                                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                                          title="حذف العلامة"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
