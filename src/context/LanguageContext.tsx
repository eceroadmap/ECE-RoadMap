import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ar' | 'en';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isArabic: boolean;
  dir: 'rtl' | 'ltr';
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.dashboard': 'رحلتي',
    'nav.roadmap': 'الخارطة الأكاديمية',
    'nav.courses': 'المواد',
    'nav.software': 'البرامج',
    'nav.laptop': 'مستشار اللابتوب',
    'nav.academic_record': 'سجلي الأكاديمي',
    'nav.graduation_projects': 'مشاريع التخرج',
    'nav.develop': 'طوّر نفسك',
    'nav.hub': 'Student Hub',
    'nav.faq': 'الأسئلة الشائعة',
    'nav.admin': 'لوحة الإدارة (CMS)',
    'nav.more': 'المزيد',
    'nav.search': 'بحث سريع...',
    'nav.exhibition': 'وضع الملتقى ✦',
    'nav.qr': 'رمز QR',
    'nav.login': 'تسجيل الدخول',
    'nav.my_account': 'حسابي',
    'nav.dept_title': 'هندسة الإلكترونيات والاتصالات',
    'nav.faculty': 'كلية الهمك - جامعة دمشق',

    // Language
    'lang.toggle': 'English',
    'lang.current': 'العربية',
    'lang.select': 'لغة العرض',
    'sound.mute': 'كتم المؤثرات الصوتية',
    'sound.unmute': 'تفعيل الأصوات التفاعلية',

    // Registration & Login Modal
    'auth.portal_title': 'بوابة الانضمام والتعريف',
    'auth.welcome_title': 'منصة ECE RoadMap الأكاديمية',
    'auth.dept_desc': 'قسم هندسة الإلكترونيات والاتصالات - كلية الهمك بجامعة دمشق',
    'auth.welcome_subtitle': 'سجل هويتك للوصول الكامل إلى الخطة الدراسية، مستشار اللابتوب، وتجارب الزملاء',
    'auth.google_login_title': 'الدخول المباشر بحساب Google',
    'auth.google_login_desc': 'مزامنة سحابية مستمرة لحسابك وتجاربك ودرجاتك الأكاديمية',
    'auth.or_quick_guest': 'أو الدخول السريع كطالب / زائر',
    'auth.credentials_login_title': 'الدخول باسم المستخدم وكلمة المرور',
    'auth.credentials_login_desc': 'تسجيل الدخول باستخدام بيانات حسابك الأكاديمي',
    'auth.username_label': 'اسم المستخدم (Username)',
    'auth.username_placeholder': 'مثال: ahmad_ece أو رقم القيد...',
    'auth.password_label': 'كلمة المرور',
    'auth.password_placeholder': 'أدخل كلمة المرور الخاصة بحسابك...',
    'auth.login_btn': 'تسجيل الدخول إلى حسابي',
    'auth.quick_login_title': 'الدخول بالاسم والسنة الدراسية',
    'auth.quick_login_desc': 'بدون كلمة سر - حفظ محلي فوري على جهازك الحالي',
    'auth.first_name_label': 'الاسم الأول',
    'auth.first_name_placeholder': 'مثال: محمد، سارة...',
    'auth.last_name_label': 'الكنية / اسم العائلة',
    'auth.last_name_placeholder': 'مثال: الأحمد، علي...',
    'auth.academic_year_label': 'السنة الدراسية الحالية',
    'auth.google_btn': 'المتابعة بحساب Google',
    'auth.google_desc': 'مزامنة سحابية مستمرة لرحلتك الأكاديمية ودرجاتك ومشاريعك',
    'auth.guest_btn': 'الدخول كطالب / زائر بالاسم',
    'auth.guest_desc': 'حفظ محلي فوري لرحلتك ومعدلك وسنتك الدراسية',
    'auth.first_name': 'الاسم الأول',
    'auth.last_name': 'الكنية / اسم العائلة',
    'auth.academic_year': 'السنة الدراسية الحالية',
    'auth.year_1': 'السنة الأولى',
    'auth.year_2': 'السنة الثانية',
    'auth.year_3': 'السنة الثالثة',
    'auth.year_4': 'السنة الرابعة',
    'auth.year_5': 'السنة الخامسة',
    'auth.graduate': 'خريج / مهندس',
    'auth.submit_guest': 'تأكيد الدخول وبدء الرحلة',
    'auth.confirm_start': 'تأكيد وبدء الرحلة الأكاديمية',
    'auth.back': 'رجوع',
    'auth.or': 'أو',
    'auth.signed_in_as': 'مسجل حالياً باسم:',
    'auth.sign_out': 'تسجيل الخروج',
    'auth.switch_account': 'تبديل الحساب',

    // Community Tips
    'tips.feed_title': 'تجارب ونَصائح الطلاب (Community Feed)',
    'tips.feed_desc': 'شارك نصائحك وتوجيهاتك للامتحانات والمخابر في كلية الهمك بكل خصوصية ومسؤولية.',
    'tips.add_btn': 'أضف نصيحة أو تجربة',
    'tips.cancel_btn': 'إلغاء',
    'tips.sort_by': 'ترتيب النصائح:',
    'tips.sort_likes': 'الأعلى إعجاباً ⭐',
    'tips.sort_newest': 'الأحدث نشراً 🕒',
    'tips.author_name_label': 'اسم الكاتب (تلقائياً من حسابك):',
    'tips.course_label': 'المقرر المرتبط:',
    'tips.general_course': 'نصيحة عامة في القسم',
    'tips.category_label': 'نوع النصيحة:',
    'tips.cat_study': 'نصيحة دراسية عامة',
    'tips.cat_exam': 'توجيه امتحاني ومسائل',
    'tips.cat_lab': 'مخبر وعملي وبرمجيات',
    'tips.cat_resource': 'ملخص أو كتاب مقترح',
    'tips.content_label': 'نص النصيحة أو التجربة:',
    'tips.content_placeholder': 'اكتب خلاصة تجربتك أو توجيهك لزملائك الطلاب في المقرر أو المخابر...',
    'tips.publish_btn': 'نشر في المجتمع',
    'tips.like': 'مفيدة',
    'tips.dislike': 'غير مفيدة',
    'tips.course_tips_title': 'نصائح وتجارب الطلاب في هذا المقرر',
    'tips.no_course_tips': 'لا توجد نصائح مضافة لهذا المقرر بعد. كن أول من يضيف تجربة لزملائه!',
    'tips.add_for_this_course': 'أضف نصيحة لهذا المقرر',
    'tips.posted_by': 'بواسطة',
    'tips.login_required': 'يرجى تسجيل الدخول بحساب Google للتفاعل أو إضافة نصيحة.',
    'tips.first_to_share': 'كن أول من يشارك تجربة أو نصيحة!',
    'tips.loading': 'جاري تحميل التجارب والنصائح من Cloud Firestore...',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'My Journey',
    'nav.roadmap': 'Roadmap',
    'nav.courses': 'Courses',
    'nav.software': 'Software',
    'nav.laptop': 'Laptop Advisor',
    'nav.academic_record': 'Academic Record',
    'nav.graduation_projects': 'Graduation Projects',
    'nav.develop': 'Self-Development',
    'nav.hub': 'Student Hub',
    'nav.faq': 'FAQ',
    'nav.admin': 'Admin CMS',
    'nav.more': 'More',
    'nav.search': 'Quick search...',
    'nav.exhibition': 'Exhibition Mode ✦',
    'nav.qr': 'QR Code',
    'nav.login': 'Sign In',
    'nav.my_account': 'My Account',
    'nav.dept_title': 'Electronics & Communications Engineering',
    'nav.faculty': 'Faculty of Mechanical & Electrical Eng. - Damascus University',

    // Language
    'lang.toggle': 'العربية',
    'lang.current': 'English',
    'lang.select': 'Language',
    'sound.mute': 'Mute UI sound effects',
    'sound.unmute': 'Enable interactive UI sound effects',

    // Registration & Login Modal
    'auth.portal_title': 'Welcome & Identity Portal',
    'auth.welcome_title': 'ECE RoadMap Academic Platform',
    'auth.dept_desc': 'Electronics & Communications Engineering - Damascus University',
    'auth.welcome_subtitle': 'Identify yourself for full access to curriculum paths, laptop advisor, and peer advice',
    'auth.google_login_title': 'Direct Login with Google',
    'auth.google_login_desc': 'Persistent cloud synchronization for your journey, grades, and projects',
    'auth.or_quick_guest': 'OR Quick Entry as Student / Guest',
    'auth.credentials_login_title': 'Login with Username & Password',
    'auth.credentials_login_desc': 'Sign in with your registered student account credentials',
    'auth.username_label': 'Username',
    'auth.username_placeholder': 'e.g. ahmad_ece or student ID...',
    'auth.password_label': 'Password',
    'auth.password_placeholder': 'Enter your account password...',
    'auth.login_btn': 'Sign In to My Account',
    'auth.quick_login_title': 'Enter with Name & Academic Year',
    'auth.quick_login_desc': 'No password required - instant local save on your current device',
    'auth.first_name_label': 'First Name',
    'auth.first_name_placeholder': 'e.g. Alex, Sarah...',
    'auth.last_name_label': 'Last Name / Surname',
    'auth.last_name_placeholder': 'e.g. Smith, Johnson...',
    'auth.academic_year_label': 'Current Academic Year',
    'auth.google_btn': 'Continue with Google',
    'auth.google_desc': 'Persistent cloud synchronization for your journey, grades, and projects',
    'auth.guest_btn': 'Enter as Student / Guest',
    'auth.guest_desc': 'Instant local save for your progress, GPA, and academic year',
    'auth.first_name': 'First Name',
    'auth.last_name': 'Last Name',
    'auth.academic_year': 'Current Academic Year',
    'auth.year_1': 'Year 1',
    'auth.year_2': 'Year 2',
    'auth.year_3': 'Year 3',
    'auth.year_4': 'Year 4',
    'auth.year_5': 'Year 5',
    'auth.graduate': 'Graduate / Engineer',
    'auth.submit_guest': 'Confirm & Start Journey',
    'auth.confirm_start': 'Confirm & Start Academic Journey',
    'auth.back': 'Back',
    'auth.or': 'OR',
    'auth.signed_in_as': 'Currently signed in as:',
    'auth.sign_out': 'Sign Out',
    'auth.switch_account': 'Switch Account',

    // Community Tips
    'tips.feed_title': 'Student Experiences & Tips (Community Feed)',
    'tips.feed_desc': 'Share your advice for exams and lab sessions in ECE with privacy and responsibility.',
    'tips.add_btn': 'Add Tip or Experience',
    'tips.cancel_btn': 'Cancel',
    'tips.sort_by': 'Sort Tips:',
    'tips.sort_likes': 'Highest Likes ⭐',
    'tips.sort_newest': 'Newest First 🕒',
    'tips.author_name_label': 'Author Name (From your account):',
    'tips.course_label': 'Related Course:',
    'tips.general_course': 'General Department Advice',
    'tips.category_label': 'Category:',
    'tips.cat_study': 'Study Method',
    'tips.cat_exam': 'Exam Advice',
    'tips.cat_lab': 'Lab & Software',
    'tips.cat_resource': 'Suggested Resource',
    'tips.content_label': 'Tip Content:',
    'tips.content_placeholder': 'Write your practical advice or guidance for fellow students in this course or lab...',
    'tips.publish_btn': 'Publish to Community',
    'tips.like': 'Helpful',
    'tips.dislike': 'Not Helpful',
    'tips.course_tips_title': 'Student Tips & Advice for this Course',
    'tips.no_course_tips': 'No tips added for this course yet. Be the first to share your experience!',
    'tips.add_for_this_course': 'Add a tip for this course',
    'tips.posted_by': 'By',
    'tips.login_required': 'Please sign in with Google to react or share a tip.',
    'tips.first_to_share': 'Be the first to share an experience or tip!',
    'tips.loading': 'Loading student advice from Cloud Firestore...',
  }
};

const LANGUAGE_STORAGE_KEY = 'ece_platform_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (saved === 'ar' || saved === 'en') return saved;
    }
    return 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // Ignore local storage write errors
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const isArabic = language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = dir;
      document.documentElement.lang = language;
    }
  }, [language, dir]);

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const fallbackDict = translations.ar;
    if (fallbackDict && fallbackDict[key]) {
      return fallbackDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isArabic, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
