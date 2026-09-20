import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Cloud, 
  BookOpen, 
  Cpu, 
  MessageSquare, 
  Laptop, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  GraduationCap,
  MonitorPlay
} from 'lucide-react';
import { PlatformStatistics, AdminActivityLog } from '../../types/admin';
import { fetchPlatformStatistics } from '../../services/admin/adminStats';
import { adminRepository } from '../../services/admin/adminRepository';
import { AcademicYearNumber } from '../../types';

interface AdminOverviewProps {
  onNavigateSection: (section: string) => void;
  onOpenSeeder: () => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ 
  onNavigateSection,
  onOpenSeeder 
}) => {
  const [stats, setStats] = useState<PlatformStatistics | null>(null);
  const [recentLogs, setRecentLogs] = useState<AdminActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, logsData] = await Promise.all([
        fetchPlatformStatistics(),
        adminRepository.getLogs(6)
      ]);
      setStats(statsData);
      setRecentLogs(logsData);
    } catch (e) {
      console.warn('Error loading admin overview statistics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/30 border border-cyan-500/30 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>لوحة القيادة الإدارية الموحدة • ECE RoadMap Admin</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            نظرة عامة على المنصة والبيانات الأكاديمية
          </h2>
          <p className="text-xs text-slate-400">
            إحصائيات مجمعة ومؤمنة تحترم خصوصية الطلاب، مع سجل العمليات الرقابي اللحظي.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenSeeder}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-950 transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>مزامنة الخطة الدراسية</span>
          </button>
        </div>
      </div>

      {/* 1. Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Students */}
        <div className="p-5 rounded-2xl bg-[#091527] border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">الطلاب المسجلين</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats?.totalRegisteredStudents ?? 0}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <Cloud className="w-3 h-3" />
            <span>{stats?.cloudSyncedStudentsCount ?? 0} متزامن سحابياً</span>
          </div>
        </div>

        {/* Card 2: Onboarding Completion */}
        <div className="p-5 rounded-2xl bg-[#091527] border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">إتمام التهيئة الأكاديمية</span>
            <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-800/50 flex items-center justify-center text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats?.onboardingCompletedCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-400">
            طالب حددوا سنتهم وفصلهم
          </div>
        </div>

        {/* Card 3: Laptop Profiles */}
        <div className="p-5 rounded-2xl bg-[#091527] border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">تخصيص اللابتوب</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats?.savedLaptopCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-400">
            لابتوبات خضعت للفحص الهندسي
          </div>
        </div>

        {/* Card 4: Community Tips & Interactions */}
        <div className="p-5 rounded-2xl bg-[#091527] border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">نصائح المجتمع الطلابي</span>
            <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats?.totalCommunityTips ?? 0}
          </div>
          <div className="text-[11px] text-amber-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{stats?.totalCommunityLikes ?? 0} تفاعل وتصويت إيجابي</span>
          </div>
        </div>
      </div>

      {/* 2. Middle Section: Academic Year Distribution & Popular Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Distribution by Year */}
        <div className="p-6 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">توزيع الطلاب حسب السنوات الدراسية</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              إجمالي الطلاب: {stats?.totalRegisteredStudents ?? 0}
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {([1, 2, 3, 4, 5] as AcademicYearNumber[]).map((yr) => {
              const count = stats?.studentsByYear[yr] || 0;
              const total = stats?.totalRegisteredStudents || 1;
              const pct = Math.round((count / (total > 0 ? total : 1)) * 100);

              return (
                <div key={yr} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">
                      السنة {yr} ({yr === 1 ? 'مستجد' : yr === 5 ? 'تخرج' : 'اختصاص'})
                    </span>
                    <span className="text-slate-400 font-mono">
                      {count} طالب ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Courses Aggregates */}
        <div className="p-6 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">أكثر المقررات تفاعلاً في رحلة الطلاب</h3>
            </div>
            <button
              onClick={() => onNavigateSection('courses')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>إدارة المقررات</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats?.popularCourses && stats.popularCourses.length > 0 ? (
            <div className="space-y-2.5">
              {stats.popularCourses.map((c, idx) => (
                <div 
                  key={c.courseId}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-cyan-400 font-bold flex items-center justify-center text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white">{c.courseNameAr}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {c.count} تفاعل
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
              سيظهر ترتيب المقررات تلقائياً عند تفاعل الطلاب وتسجيل تقدمهم الأكاديمي.
            </div>
          )}
        </div>
      </div>

      {/* 3. Quick Action Shortcuts */}
      <div className="p-6 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">إجراءات الوصول السريع لإدارة المنصة</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
          <button
            onClick={() => onNavigateSection('exhibition')}
            className="p-4 rounded-2xl bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-500/40 hover:border-cyan-400 text-right space-y-2 transition-all group"
          >
            <MonitorPlay className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-cyan-200">وضع الملتقى</div>
            <div className="text-[10px] text-slate-400">تعديل شرائح العرض المعرضي</div>
          </button>

          <button
            onClick={() => onNavigateSection('students')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-right space-y-2 transition-all group"
          >
            <GraduationCap className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">إدارة الطلاب</div>
            <div className="text-[10px] text-slate-500">عرض ملفات الطلاب ورحلاتهم الأكاديمية</div>
          </button>

          <button
            onClick={() => onNavigateSection('courses')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-right space-y-2 transition-all group"
          >
            <BookOpen className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">إدارة المقررات</div>
            <div className="text-[10px] text-slate-500">إضافة وتعديل الخطة</div>
          </button>

          <button
            onClick={() => onNavigateSection('software')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-right space-y-2 transition-all group"
          >
            <Cpu className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">إدارة البرمجيات</div>
            <div className="text-[10px] text-slate-500">أدوات المحاكاة والروابط</div>
          </button>

          <button
            onClick={() => onNavigateSection('resources')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-right space-y-2 transition-all group"
          >
            <Sparkles className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">مصادر فريق نُون</div>
            <div className="text-[10px] text-slate-500">روابط التلغرام والمستودعات</div>
          </button>

          <button
            onClick={() => onNavigateSection('faq')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-right space-y-2 transition-all group"
          >
            <MessageSquare className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">الأسئلة الشائعة</div>
            <div className="text-[10px] text-slate-500">إجابات وتوجيهات القسم</div>
          </button>

          <button
            onClick={() => onNavigateSection('community')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-right space-y-2 transition-all group"
          >
            <Users className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">الإشراف المجتمعي</div>
            <div className="text-[10px] text-slate-500">مراجعة نصائح الطلاب</div>
          </button>

          <button
            onClick={() => onNavigateSection('logs')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-right space-y-2 transition-all group"
          >
            <Clock className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">سجل العمليات</div>
            <div className="text-[10px] text-slate-500">التدقيق الأمني والنشاط</div>
          </button>
        </div>
      </div>

      {/* 4. Recent Activity Log Strip */}
      <div className="p-6 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">آخر النشاطات والعمليات الإدارية</h3>
          </div>
          <button
            onClick={() => onNavigateSection('logs')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>عرض السجل الكامل</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentLogs.length > 0 ? (
          <div className="divide-y divide-slate-800/80">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 font-mono text-[10px] border border-slate-700">
                    {log.actionType}
                  </span>
                  <span className="text-slate-200">{log.details}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 text-center py-4">
            لم تسجل أي عمليات إدارية بعد. ستظهر هنا كافة التعديلات والتحديثات فور حدوثها.
          </div>
        )}
      </div>
    </div>
  );
};
