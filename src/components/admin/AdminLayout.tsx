import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  BookOpen, 
  Cpu, 
  Sparkles, 
  HelpCircle, 
  Clock, 
  LogOut, 
  Home, 
  LayoutDashboard, 
  Menu, 
  X, 
  RefreshCw,
  Lock,
  ChevronLeft,
  UserCheck,
  GraduationCap,
  MonitorPlay,
  Settings,
  FolderGit2
} from 'lucide-react';
import { auth, signInWithGoogle, signOutUser, User } from '../../lib/firebase';
import { adminAuthService } from '../../services/admin/adminAuth';
import { AdminRecord } from '../../types/admin';
import { AdminOverview } from './AdminOverview';
import { StudentsManager } from './StudentsManager';
import { CoursesManager } from './CoursesManager';
import { SoftwareManager } from './SoftwareManager';
import { ResourcesManager } from './ResourcesManager';
import { FaqManager } from './FaqManager';
import { CommunityModeration } from './CommunityModeration';
import { ActivityLogView } from './ActivityLogView';
import { CurriculumSeederModal } from './CurriculumSeederModal';
import { ExhibitionManager } from './ExhibitionManager';
import { AdminSettingsView } from './AdminSettingsView';
import { AdminGraduationProjectsView } from './AdminGraduationProjectsView';
import { CourseSkillsManager } from './CourseSkillsManager';
import { ModeratorsManager } from './ModeratorsManager';
import { GitMerge, UserPlus } from 'lucide-react';

interface AdminLayoutProps {
  onBackToApp: () => void;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMsg: string;
}

class AdminErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMsg: error?.message || 'حدث خطأ غير متوقع' };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Admin Module Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-3xl bg-[#091527] border border-rose-500/40 text-center space-y-4 my-6" dir="rtl">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">حدث خطأ أثناء عرض هذا القسم الإداري</h3>
            <p className="text-xs text-slate-400 font-mono max-w-md mx-auto truncate">
              {this.state.errorMsg}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, errorMsg: '' })}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            إعادة تحميل القسم
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToApp }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(adminAuthService.getIsAdmin());
  const [adminRecord, setAdminRecord] = useState<AdminRecord | null>(adminAuthService.getAdminRecord());
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSeederModalOpen, setIsSeederModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingPasscode, setIsSubmittingPasscode] = useState(false);

  useEffect(() => {
    const unsub = adminAuthService.subscribe((status, record) => {
      setIsAdmin(status);
      setAdminRecord(record);
      setCurrentUser(auth.currentUser);
      setIsChecking(false);
    });

    return () => unsub();
  }, []);

  const handleSignInWithGoogle = async () => {
    setIsChecking(true);
    setAuthError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        const authorized = await adminAuthService.checkIsAdmin(user);
        if (!authorized) {
          setAuthError(`الحساب (${user.email}) غير مضاف في قائمة المشرفين المصرح لهم.`);
        }
      } else {
        setAuthError('تعذر تسجيل الدخول بـ Google أو تم إغلاق النافذة المنبثقة.');
      }
    } catch (e: any) {
      console.warn('Google sign in error:', e);
      setAuthError(e?.message || 'فشل الاتصال بخدمة Google المصادقة.');
    } finally {
      setIsChecking(false);
    }
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setIsSubmittingPasscode(true);
    setAuthError(null);
    try {
      const res = await adminAuthService.loginWithPasscode(passcode);
      if (!res.success) {
        setAuthError(res.message);
      }
    } catch (err: any) {
      setAuthError('حدث خطأ أثناء التحقق من الرمز.');
    } finally {
      setIsSubmittingPasscode(false);
    }
  };

  const handleSignOut = async () => {
    adminAuthService.logout();
    await signOutUser();
    setIsAdmin(false);
    setAdminRecord(null);
    setAuthError(null);
  };

  // 1. Loading State
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#050b14] text-slate-100 flex flex-col items-center justify-center p-6" dir="rtl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 animate-pulse shadow-lg shadow-cyan-950">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin absolute -top-1 -right-1" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">التحقق من الصلاحيات الإدارية</h3>
            <p className="text-xs text-slate-400 font-mono">
              Verifying administrative authorization and role security...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Access Denied State (Not an Administrator)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050b14] text-slate-100 flex items-center justify-center p-4 selection:bg-cyan-500/30 selection:text-cyan-200" dir="rtl">
        <div className="w-full max-w-md rounded-3xl bg-[#091527] border border-cyan-500/30 shadow-2xl p-6 sm:p-7 space-y-5 text-center">
          <div className="w-16 h-16 rounded-3xl bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mx-auto shadow-lg shadow-cyan-950">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-bold">
              بوابة الإدارة الأكاديمية • CMS
            </span>
            <h2 className="text-xl font-black text-white">
              تسجيل دخول إدارة ECE RoadMap
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              هذه اللوحة مخصصة لإدارة ومحرري قسم هندسة الإلكترونيات والاتصالات لإدارة المقررات، البرمجيات، والطلاب.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-xs text-rose-300 text-right space-y-1 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>تنبيه المصادقة</span>
              </div>
              <p className="text-[11px] leading-relaxed pr-5">{authError}</p>
            </div>
          )}

          {/* Form: Passcode / Email Direct Login */}
          <form onSubmit={handlePasscodeSubmit} className="space-y-3 pt-1 text-right">
            <label className="block text-xs font-semibold text-slate-300">
              الدخول المباشر (رمز المرور أو البريد الإلكتروني للمشرف):
            </label>
            <div className="relative">
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="أدخل رمز المرور أو بريد المالك..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-white text-xs placeholder:text-slate-500 font-mono transition-all outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmittingPasscode || !passcode.trim()}
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950 transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              {isSubmittingPasscode ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
              <span>دخول لوحة الإدارة</span>
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase font-mono">أو عبر Google</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleSignInWithGoogle}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700 hover:border-cyan-500/40 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>تسجيل الدخول بحساب Google المشرف</span>
            </button>

            <button
              onClick={onBackToApp}
              className="w-full py-2.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white font-medium text-xs border border-slate-800 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Home className="w-4 h-4" />
              <span>العودة للواجهة الطلابية</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Administrator Dashboard
  const isOwner = adminRecord?.isOwner === true || adminAuthService.getIsOwner();

  // Redirect supervisors away from owner-only sections
  useEffect(() => {
    if (!isOwner && (activeSection === 'logs' || activeSection === 'moderators')) {
      setActiveSection('overview');
    }
  }, [isOwner, activeSection]);

  const navItems = [
    { id: 'overview', label: 'لوحة القيادة والإحصائيات', icon: LayoutDashboard },
    ...(isOwner ? [{ id: 'moderators', label: 'إدارة المشرفين والصلاحيات', icon: UserPlus }] : []),
    { id: 'exhibition', label: 'إدارة شرائح وضع الملتقى', icon: MonitorPlay },
    { id: 'graduation_projects', label: 'إدارة مشاريع التخرج', icon: FolderGit2 },
    { id: 'students', label: 'إدارة الطلاب', icon: GraduationCap },
    { id: 'courses', label: 'إدارة المقررات الدراسية', icon: BookOpen },
    { id: 'course_skills', label: 'تعديل (من المادة إلى المهارة)', icon: GitMerge },
    { id: 'software', label: 'إدارة برمجيات المحاكاة', icon: Cpu },
    { id: 'resources', label: 'موارد ومصادر فريق نُون', icon: Sparkles },
    { id: 'faq', label: 'الأسئلة الشائعة الأكاديمية', icon: HelpCircle },
    { id: 'community', label: 'الإشراف على نصائح الطلاب', icon: Users },
    ...(isOwner ? [{ id: 'logs', label: 'سجل العمليات الإدارية', icon: Clock }] : []),
    { id: 'settings', label: 'إعدادات النظام الأكاديمي', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 h-16 bg-[#091527]/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="القائمة الجانبية"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <span>إدارة ECE RoadMap الأكاديمية</span>
                <span className={`hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  isOwner 
                    ? 'bg-amber-950/80 text-amber-300 border-amber-800' 
                    : 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                }`}>
                  {isOwner ? 'المالك (مدير المنصة)' : 'مشرف معتمد (صلاحيات تحرير)'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Academic Administration & Curriculum CMS
              </div>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="max-w-[150px] truncate">{currentUser?.email}</span>
          </div>

          <button
            onClick={onBackToApp}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[44px]"
            title="العودة للواجهة الرئيسية"
          >
            <Home className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">الواجهة الطلابية</span>
          </button>

          <button
            onClick={handleSignOut}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="flex-1 flex relative">
        {/* Mobile Backdrop Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 bg-[#07101e] border-l border-slate-800 p-4 flex flex-col justify-between transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-1.5 overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-500 px-3 pb-2 uppercase tracking-wider">
              أقسام الإدارة
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-right min-h-[44px] ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer: Seeder trigger */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <button
              onClick={() => setIsSeederModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-slate-300 text-xs font-bold flex items-center justify-between transition-colors min-h-[44px]"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>مزامنة الخطة الأكاديمية</span>
              </div>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <div className="text-[10px] text-slate-500 font-mono text-center">
              ECE RoadMap Platform v4.0
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <AdminErrorBoundary>
            {activeSection === 'overview' && (
              <AdminOverview 
                onNavigateSection={setActiveSection}
                onOpenSeeder={() => setIsSeederModalOpen(true)}
                isOwner={isOwner}
              />
            )}

            {activeSection === 'moderators' && isOwner && <ModeratorsManager />}

            {activeSection === 'exhibition' && <ExhibitionManager />}

            {activeSection === 'graduation_projects' && <AdminGraduationProjectsView />}

            {activeSection === 'students' && <StudentsManager isOwner={isOwner} />}

            {activeSection === 'courses' && <CoursesManager />}

            {activeSection === 'course_skills' && <CourseSkillsManager />}

            {activeSection === 'software' && <SoftwareManager />}

            {activeSection === 'resources' && <ResourcesManager />}

            {activeSection === 'faq' && <FaqManager />}

            {activeSection === 'community' && <CommunityModeration />}

            {activeSection === 'logs' && isOwner && <ActivityLogView />}

            {activeSection === 'settings' && <AdminSettingsView />}
          </AdminErrorBoundary>
        </main>
      </div>

      {/* Curriculum Seeder Modal */}
      <CurriculumSeederModal 
        isOpen={isSeederModalOpen}
        onClose={() => setIsSeederModalOpen(false)}
      />
    </div>
  );
};
