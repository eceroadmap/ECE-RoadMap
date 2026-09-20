import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  Search, 
  Map, 
  BookOpen, 
  Cpu, 
  Laptop, 
  Compass, 
  Users, 
  HelpCircle, 
  Sparkles, 
  Layers,
  GraduationCap,
  Cloud,
  ShieldCheck,
  QrCode,
  ChevronDown,
  MoreHorizontal,
  Award,
  FolderGit2,
  User,
  LogIn
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useStudentState } from '../services/useStudentState';
import { adminAuthService } from '../services/admin/adminAuth';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenSearch: () => void;
  onOpenSyncModal?: () => void;
  onOpenExhibition?: () => void;
  onOpenQRModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  onOpenSyncModal,
  onOpenExhibition,
  onOpenQRModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement | null>(null);
  const { profile, isCloudSynced, isLoggedInWithGoogle, firebaseUser } = useStudentState();

  useEffect(() => {
    const unsub = adminAuthService.subscribe((status) => {
      setIsAdmin(status);
    });
    return () => unsub();
  }, []);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  interface NavItem {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  // Primary core navigation items (always front-and-center on md screens and above)
  const primaryNavItems: NavItem[] = [
    { id: 'home', label: 'الرئيسية', icon: Compass },
    { 
      id: 'dashboard', 
      label: 'رحلتي', 
      icon: GraduationCap, 
      badge: profile.currentYear ? (profile.currentYear === 'graduate' ? 'خريج' : `سنة ${profile.currentYear}`) : undefined 
    },
    { id: 'roadmap', label: 'الخارطة الأكاديمية', icon: Map },
    { id: 'courses', label: 'المواد', icon: BookOpen },
    { id: 'software', label: 'البرامج', icon: Cpu },
  ];

  // Extended navigation items visible directly on wide screens (>= 1280px)
  const extendedNavItems: NavItem[] = [
    { id: 'laptop', label: 'مستشار اللابتوب', icon: Laptop },
    { id: 'academic_record', label: 'سجلي الأكاديمي', icon: Award },
  ];

  // Secondary items kept neatly inside the "المزيد" dropdown
  const secondaryNavItems: NavItem[] = [
    { id: 'graduation_projects', label: 'مشاريع التخرج', icon: FolderGit2 },
    { id: 'develop', label: 'طوّر نفسك', icon: Sparkles },
    { id: 'hub', label: 'Student Hub', icon: Users },
    { id: 'faq', label: 'الأسئلة الشائعة', icon: HelpCircle },
    { id: 'admin', label: 'لوحة الإدارة (CMS)', icon: ShieldCheck },
  ];

  const allNavItems = [
    ...primaryNavItems,
    ...extendedNavItems,
    ...secondaryNavItems
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isMoreActive = extendedNavItems.some((item) => item.id === activeTab) || secondaryNavItems.some((item) => item.id === activeTab);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-950/60 bg-[#050b14]/95 backdrop-blur-md">
      {/* Top Branding & Partner Placemarks Bar (Hidden on small mobile to conserve vertical space) */}
      <div className="border-b border-slate-800/40 bg-slate-950/60 px-3 sm:px-4 py-1 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center gap-1.5 text-cyan-400 font-medium truncate">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span className="truncate">هندسة الإلكترونيات والاتصالات</span>
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-400">كلية الهمك - جامعة دمشق</span>
          </div>

          {/* Top Quick Actions (Exhibition Mode, QR Code, Partners) */}
          <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
            {onOpenExhibition && (
              <button
                onClick={onOpenExhibition}
                title="وضع الملتقى الأكاديمي للشاشات الكبيرة والمعارض"
                className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 transition-colors font-semibold flex items-center gap-1 shadow-sm"
              >
                <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="hidden sm:inline">وضع الملتقى ✦</span>
                <span className="sm:hidden">الملتقى</span>
              </button>
            )}

            {onOpenQRModal && (
              <button
                onClick={onOpenQRModal}
                title="عرض رمز الـ QR للمسح عبر الهاتف"
                className="px-2 py-0.5 rounded border border-slate-700/80 bg-slate-900/60 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              >
                <QrCode className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="hidden sm:inline">رمز QR</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Responsive Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand Logo & Title */}
          <button
            id="brand-home-button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-right group focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-lg p-1 transition-transform active:scale-95 shrink-0 min-h-[44px]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white shadow-md shadow-cyan-950 border border-cyan-400/40 shrink-0">
              <Layers className="w-5 h-5 text-cyan-100 group-hover:rotate-6 transition-transform" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white font-mono">
                  ECE <span className="text-cyan-400">RoadMap</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-900/60 text-cyan-300 border border-cyan-700/40 font-mono hidden sm:inline">
                  DU
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 font-medium hidden sm:block">
                جامعة دمشق
              </p>
            </div>
          </button>

          {/* Main Navigation (Visible on md: and above - Orderly, Professional, No clutter) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {/* Core Primary Items: الرئيسية، رحلتي، الخارطة الأكاديمية، المواد، البرامج */}
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 whitespace-nowrap min-h-[38px] ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Extended Items visible directly on wide screens (>= 1280px) */}
            <div className="hidden xl:flex items-center gap-1 lg:gap-1.5">
              {extendedNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-link-xl-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 whitespace-nowrap min-h-[38px] ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* "المزيد" (More) Dropdown Menu */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                id="more-nav-dropdown-trigger"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[38px] ${
                  isMoreActive || moreDropdownOpen
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <span>المزيد</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180 text-cyan-400' : 'text-slate-400'}`} />
              </button>

              {moreDropdownOpen && (
                <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-[#081528]/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl p-1.5 z-50 animate-fadeIn">
                  {/* Items shown in dropdown on md/lg, but on xl shown in main bar */}
                  <div className="xl:hidden pb-1 mb-1 border-b border-slate-800/80">
                    {extendedNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-right transition-colors ${
                            isActive
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-cyan-400" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Secondary items */}
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-right transition-colors ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-cyan-400" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Action Tools: Global Search & Cloud Account & Admin & Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Academic Admin Link if authorized */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                title="لوحة الإدارة الأكاديمية (CMS)"
                className="flex items-center gap-1.5 px-2.5 py-2 text-xs text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 rounded-xl transition-all shadow-sm min-h-[44px]"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline text-[11px] font-bold">الإدارة</span>
              </button>
            )}

            {/* Student Profile & Cloud Sync */}
            {onOpenSyncModal && (
              <button
                id="cloud-sync-trigger"
                onClick={onOpenSyncModal}
                title={
                  isLoggedInWithGoogle 
                    ? `حساب Google: ${firebaseUser?.displayName || firebaseUser?.email}` 
                    : profile.name 
                      ? `الزائر: ${profile.name}` 
                      : "تسجيل الدخول أو الدخول كزائر"
                }
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all min-h-[44px]"
              >
                <div className="relative">
                  {isLoggedInWithGoogle ? (
                    <Cloud className={`w-4 h-4 ${isCloudSynced ? 'text-cyan-400' : 'text-slate-400'}`} />
                  ) : profile.name ? (
                    <User className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <LogIn className="w-4 h-4 text-cyan-400" />
                  )}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${isLoggedInWithGoogle || profile.name ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                </div>
                <span className="hidden xl:inline text-[11px] text-slate-300 font-medium">
                  {isLoggedInWithGoogle 
                    ? (firebaseUser?.displayName?.split(' ')[0] || 'حسابي') 
                    : profile.name 
                      ? profile.name.split(' ')[0] 
                      : 'تسجيل الدخول'}
                </span>
              </button>
            )}

            {/* Search Trigger */}
            <button
              id="global-search-trigger"
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-2 text-xs text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all group min-h-[44px]"
              aria-label="بحث شامل في المقررات والبرامج"
            >
              <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden 2xl:inline text-slate-300 font-medium">بحث في المواد والبرامج...</span>
              <kbd className="hidden 2xl:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
                Ctrl K
              </kbd>
            </button>

            {/* Mobile Menu Toggle (Hidden on Tablet & Desktop >= 768px) */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-900/90 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Quick Navigation Bar (< md) - Clean, Instant access to رحلتي and الخارطة */}
      <div className="md:hidden border-t border-slate-800/70 bg-[#040a14] px-2 py-1.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {[...primaryNavItems, ...extendedNavItems].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap min-h-[34px] ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Slide-Down Drawer Menu (for secondary items and exhibition) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#071120] px-4 pt-3 pb-6 shadow-2xl space-y-2 animate-fadeIn max-h-[85vh] overflow-y-auto">
          {/* Quick Exhibition Trigger inside drawer */}
          {onOpenExhibition && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenExhibition();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-500/50 text-cyan-300 mb-3 min-h-[44px]"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>وضع الملتقى الأكاديمي (Exhibition)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900 text-cyan-200">
                شاشة كاملة
              </span>
            </button>
          )}

          {/* Navigation Links Grid / List with 44px touch targets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors text-right min-h-[44px] ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
