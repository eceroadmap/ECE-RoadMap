/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActiveTab, Course, SoftwareTool, AcademicYearNumber } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CircuitBackground } from './components/CircuitBackground';
import { HomeHero } from './components/HomeHero';
import { JourneySelector } from './components/JourneySelector';
import { AcademicRoadmap } from './components/AcademicRoadmap';
import { CoursesSection } from './components/CoursesSection';
import { DevelopSection } from './components/DevelopSection';
import { SoftwareSection } from './components/SoftwareSection';
import { LaptopAdvisorSection } from './components/LaptopAdvisorSection';
import { StudentHubSection } from './components/StudentHubSection';
import { FaqSection } from './components/FaqSection';
import { CourseModal } from './components/CourseModal';
import { SoftwareModal } from './components/SoftwareModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { StudentDashboard } from './components/StudentDashboard';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthSyncModal } from './components/AuthSyncModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { AcademicRecordSection } from './components/AcademicRecordSection';
import { GraduationProjectNavigatorSection } from './components/GraduationProjectNavigatorSection';
import { FromCourseToSkillSection } from './components/FromCourseToSkillSection';
import { ExhibitionModeModal } from './components/ExhibitionModeModal';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { ArrowLeft, BookOpen, Cpu, Sparkles, Map, GraduationCap, Laptop, HelpCircle } from 'lucide-react';
import { COURSES_DATA } from './data/courses';
import { SOFTWARE_DATA } from './data/software';
import { useStudentState } from './services/useStudentState';
import { getProductionAppUrl } from './lib/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSoftware, setSelectedSoftware] = useState<SoftwareTool | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isExhibitionOpen, setIsExhibitionOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [courseYearFilter, setCourseYearFilter] = useState<AcademicYearNumber | 'all'>('all');
  const [roadmapInitialYear, setRoadmapInitialYear] = useState<AcademicYearNumber>(1);

  const { 
    profile, 
    updateProfile,
    graduationWorkspace,
    saveGraduationWorkspace,
    toggleStarredProject
  } = useStudentState();

  // Navigate between tabs cleanly
  const handleNavigateTab = (tab: ActiveTab, year?: AcademicYearNumber) => {
    if (tab === 'courses' && year) {
      setCourseYearFilter(year);
    } else if (tab === 'roadmap' && year) {
      setRoadmapInitialYear(year);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCourseByName = (name: string) => {
    const match = COURSES_DATA.find(
      (c) => c.nameAr.includes(name) || name.includes(c.nameAr) || c.id === name
    );
    if (match) {
      setSelectedCourse(match);
    }
  };

  const handleSelectSoftwareByName = (name: string) => {
    const match = SOFTWARE_DATA.find(
      (s) => s.name.toLowerCase() === name.toLowerCase() || (s.arabicName && s.arabicName.includes(name)) || s.id === name
    );
    if (match) {
      setSelectedSoftware(match);
    }
  };

  const handleScrollToJourney = () => {
    const el = document.getElementById('journey-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveTab('home');
      setTimeout(() => {
        document.getElementById('journey-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const currentAppUrl = getProductionAppUrl();

  if (activeTab === 'admin') {
    return <AdminLayout onBackToApp={() => handleNavigateTab('home')} />;
  }

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 flex flex-col relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Engineering Visuals */}
      <CircuitBackground />

      {/* Persistent App Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => handleNavigateTab(tab)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenExhibition={() => setIsExhibitionOpen(true)}
        onOpenQRModal={() => setIsQRModalOpen(true)}
      />

      {/* Main App Content View Container */}
      <main className="flex-1 z-10">
        {activeTab === 'home' && (
          <div className="space-y-16">
            {/* Hero Section */}
            <HomeHero
              onNavigateTab={(tab) => handleNavigateTab(tab)}
              onScrollToJourney={handleScrollToJourney}
              onOpenExhibition={() => setIsExhibitionOpen(true)}
              onOpenQRModal={() => setIsQRModalOpen(true)}
            />

            {/* Where are you in your journey? */}
            <JourneySelector
              onNavigateTab={(tab, year) => handleNavigateTab(tab, year)}
            />

            {/* From Course to Skill (من المادة إلى المهارة) Section */}
            <FromCourseToSkillSection
              onNavigateTab={(tab) => handleNavigateTab(tab)}
              onSelectCourseByName={handleSelectCourseByName}
              onSelectSoftwareByName={handleSelectSoftwareByName}
            />

            {/* Home Quick Feature Spotlights */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
              {/* Personal Student Journey Spotlight Banner */}
              <div className="rounded-3xl bg-gradient-to-r from-[#0a1e3a] via-[#08172c] to-[#071324] border border-cyan-500/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="space-y-2 text-right">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400">
                    <GraduationCap className="w-4 h-4" />
                    <span>مساحتك الأكاديمية التفاعلية: &quot;رحلتي&quot;</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    تابع تقدمك، موادك الهامة، وبرمجيات سنتك الدراسية
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    حدد سنتك الحالية ({profile.currentYear ? (profile.currentYear === 'graduate' ? 'خريج' : `السنة ${profile.currentYear}`) : 'غير محددة بعد'}) لتخصيص الواجهة، متابعة المقررات المنجزة، والاطلاع على التوجيهات الأكاديمية المناسبة لمرحلتك.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <button
                    onClick={() => handleNavigateTab('dashboard')}
                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-950 transition-transform active:scale-95"
                  >
                    <span>فتح لوحة &quot;رحلتي&quot;</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOnboardingOpen(true)}
                    className="px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                  >
                    تعديل السنة
                  </button>
                </div>
              </div>

              {/* Academic Roadmap Preview Banner */}
              <div className="rounded-3xl bg-gradient-to-r from-[#09172c] via-[#071324] to-[#0a1b33] border border-cyan-800/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-2 text-right">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400">
                    <Map className="w-4 h-4" />
                    <span>الخارطة الأكاديمية التفاعلية</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    تتبع تقدمك عبر 5 سنوات دراسية ومشروع التخرج
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                    استكشف كل سنة بمفردها، المقررات المرتبطة بها، والمهارات المكتسبة لكل مرحلة دراسية من السنة الأولى حتى السنة الخامسة.
                  </p>
                </div>

                <button
                  onClick={() => handleNavigateTab('roadmap')}
                  className="px-6 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shrink-0 transition-transform active:scale-95"
                >
                  <span>فتح الخارطة الأكاديمية</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Software & Laptop 2-Column Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Software Preview */}
                <div className="p-6 rounded-3xl bg-[#091527] border border-slate-800/90 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800/50 flex items-center justify-center text-blue-400 mb-3">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      حزمة البرمجيات والمحاكاة الهندسية (16 أداة)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      تعرف على برامج المحاكاة المعتمدة في مخابر الكلية: MATLAB, Quartus, HFSS, Proteus, Multisim، وكيف ترتبط بكل مقرر.
                    </p>
                  </div>

                  <button
                    onClick={() => handleNavigateTab('software')}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>استعراض جميع البرمجيات</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Laptop Advisor Preview */}
                <div className="p-6 rounded-3xl bg-[#091527] border border-slate-800/90 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-3">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      مستشار اللابتوب: فحص جهازك ومواصفاته
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      هل جهازك مناسب لتشغيل برامج هندسة الاتصالات والإلكترونيات؟ اختبر المعالج والرام وكرت الشاشة وقارنها مع متطلبات القسم.
                    </p>
                  </div>

                  <button
                    onClick={() => handleNavigateTab('laptop')}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>افحص مواصفات لابتوبك</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard "رحلتي" View */}
        {activeTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <StudentDashboard
              onNavigateTab={(tab) => handleNavigateTab(tab)}
              onSelectCourse={(course) => setSelectedCourse(course)}
              onSelectSoftware={(sw) => setSelectedSoftware(sw)}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onOpenSyncModal={() => setIsSyncModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <AcademicRoadmap
              initialYear={roadmapInitialYear}
              onSelectYearCourses={(year) => handleNavigateTab('courses', year)}
              onSelectCourse={(course) => setSelectedCourse(course)}
              onSelectSoftware={(sw) => setSelectedSoftware(sw)}
            />
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <CoursesSection
              initialYearFilter={courseYearFilter}
              onSelectCourse={(course) => setSelectedCourse(course)}
              onSelectSoftware={(sw) => setSelectedSoftware(sw)}
            />
          </div>
        )}

        {activeTab === 'develop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <DevelopSection />
          </div>
        )}

        {activeTab === 'software' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <SoftwareSection
              onSelectSoftware={(sw) => setSelectedSoftware(sw)}
              onSelectCourse={(course) => setSelectedCourse(course)}
            />
          </div>
        )}

        {activeTab === 'laptop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <LaptopAdvisorSection />
          </div>
        )}

        {activeTab === 'hub' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <StudentHubSection
              onSelectCourseName={handleSelectCourseByName}
            />
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <FaqSection />
          </div>
        )}

        {activeTab === 'academic_record' && (
          <AcademicRecordSection onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'graduation_projects' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <GraduationProjectNavigatorSection
              workspace={graduationWorkspace}
              onSaveWorkspace={saveGraduationWorkspace}
              onToggleStarred={toggleStarredProject}
            />
          </div>
        )}
      </main>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCourse={(course) => setSelectedCourse(course)}
        onSelectSoftware={(software) => setSelectedSoftware(software)}
        onNavigateTab={(tab) => handleNavigateTab(tab)}
      />

      {/* Onboarding / Year Selection Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={() => {
          setIsOnboardingOpen(false);
          setActiveTab('dashboard');
        }}
      />

      {/* Course Detail Modal */}
      <CourseModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onSelectSoftware={(sw) => {
          setSelectedCourse(null);
          setSelectedSoftware(sw);
        }}
        onSelectRelatedCourse={(relCourse) => {
          setSelectedCourse(relCourse);
        }}
      />

      {/* Software Detail Modal */}
      <SoftwareModal
        software={selectedSoftware}
        onClose={() => setSelectedSoftware(null)}
        onSelectCourse={(course) => {
          setSelectedSoftware(null);
          setSelectedCourse(course);
        }}
      />

      {/* Cloud Sync & Firebase Account Modal */}
      <AuthSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />

      {/* Exhibition Mode Modal */}
      <ExhibitionModeModal
        isOpen={isExhibitionOpen}
        onClose={() => setIsExhibitionOpen(false)}
      />

      {/* Quick QR Code Display Modal */}
      {isQRModalOpen && (
        <QRCodeDisplay
          title="امسح لفتح المنصة على هاتفك"
          subtitle="ECE RoadMap - هندسة الإلكترونيات والاتصالات - جامعة دمشق"
          url={currentAppUrl}
          badge="الرمز السريع"
          isModal={true}
          onClose={() => setIsQRModalOpen(false)}
        />
      )}

      {/* Persistent App Footer */}
      <Footer onSelectTab={(tab) => handleNavigateTab(tab)} />
    </div>
  );
}
