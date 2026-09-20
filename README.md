# ECE RoadMap — هندسة الإلكترونيات والاتصالات (جامعة دمشق)

> **خارطتك الأكاديمية من أول يوم حتى التخرج**  
> المنصة الإرشادية والتفاعلية المتكاملة لطلاب ومهندسي قسم هندسة الإلكترونيات والاتصالات في كلية الهندسة الميكانيكية والكهربائية — جامعة دمشق.

---

## 📌 نبذة عن المشروع (Overview)

منصة **ECE RoadMap** هي بيئة ويب حديثة صُممت خصيصاً لمرافقة الطالب في مسيرته الجامعية عبر 5 سنوات دراسية، وتوفير دليل شامل لـ:
- **الخارطة الأكاديمية التفاعلية**: استعراض مقررات السنوات الخمس وفصولها بتفاصيل دقيقة.
- **توصيف المقررات والمخابر**: مخرجات التعلم، المراجع، ومشاريع العملي.
- **حزمة برمجيات الهندسة والمحاكاة**: أدوات التصميم والمحاكاة (MATLAB, Proteus, Quartus, CST, Altium, وغيرها) وروابط التثبيت والشروحات.
- **مرشد اختيار الحاسوب المحمول**: توصيات تقنية مخصصة تناسب متطلبات برمجيات ومخابر القسم.
- **لوحة تحكم الطالب (Student Dashboard)**: تتبع الإنجاز الأكاديمي، المقررات المنجزة، وحساب معدل الإنجاز مع خيارات التخزين المحلي والمزامنة السحابية.
- **ملتقى الطلاب ومصادر فريق نون (Student Hub & Team Noun)**: قنوات تيليغرام، سلاسل المحاضرات، بنك الأسئلة، وتجارب الزملاء.
- **وضع الملتقى السينمائي (Exhibition Mode)**: شاشة عرض تفاعلية للأجنحة الجامعية والمعارض مزودة بانتقالات حركية وتحكم بالسرعة ورموز استجابة سريعة (QR Code).
- **لوحة الإدارة المتكاملة (Admin CMS)**: إدارة المحتوى، المقررات، البرمجيات، الأسئلة الشائعة، وشرائح وضع الملتقى مع صلاحيات أمان صارمة.

---

## 🛠 التقنيات المستخدمة (Tech Stack)

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons & Motion**: [Lucide React](https://lucide.dev/) + [Motion](https://motion.dev/)
- **Backend & Cloud Database**: [Firebase](https://firebase.google.com/) (Authentication & Cloud Firestore)
- **Deployment Target**: [Cloudflare Pages](https://pages.cloudflare.com/) / Static Hosting

---

## ⚙️ متطلبات التشغيل المحلي (Prerequisites & Local Setup)

### 1. المتطلبات:
- **Node.js**: الإصدار 18 أو أحدث (يوصى بـ LTS v20+)
- **npm** أو **pnpm** أو **yarn**

### 2. التثبيت والتشغيل:
```bash
# استنساخ المستودع
git clone https://github.com/your-username/ece-roadmap.git
cd ece-roadmap

# تثبيت الحزم البرمجية
npm install

# نسخ ملف متغيرات البيئة
cp .env.example .env

# تشغيل خادم التطوير المحلي
npm run dev
```
سيعمل الخادم المحلي على الرابط: `http://localhost:3000`

---

## 🔐 متغيرات البيئة (Environment Variables)

قم بإنشاء ملف `.env` في جذر المشروع وضع المتغيرات التالية وفقاً لبيانات مشروعك في Firebase:

| المتغير | الوصف | إلزامي للإنتاج |
|---|---|:---:|
| `VITE_FIREBASE_API_KEY` | مفتاح Firebase Web API Key | نعم |
| `VITE_FIREBASE_AUTH_DOMAIN` | نطاق Firebase Auth Domain | نعم |
| `VITE_FIREBASE_PROJECT_ID` | معرّف المشروع في Firebase | نعم |
| `VITE_FIREBASE_STORAGE_BUCKET` | نطاق التخزين السحابي | نعم |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | معرّف الإرسال السحابي | نعم |
| `VITE_FIREBASE_APP_ID` | معرّف التطبيق في Firebase | نعم |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | معرّف قاعدة البيانات (اختياري لقواعد مخصصة) | اختياري |
| `VITE_PUBLIC_APP_URL` | الرابط الإنتاجي الثابت للمنصة (لتوليد QR Code ثابت) | نعم |

> ⚠️ **ملاحظة أمان**: لا تقم برفع ملف `.env` إلى مستودع Git العام. استخدم `.env.example` كنموذج إرشادي فقط.

---

## 🚀 البناء والنشر على Cloudflare Pages (Production Deployment)

### 1. إعدادات Cloudflare Pages:
- **Framework Preset**: `Vite` أو `None`
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`
- **Node.js Version**: `20` أو أعلى (يمكن ضبط متغير `NODE_VERSION=20`)

### 2. دعم الروابط المباشرة (SPA Routing Fallback):
المشروع مجهز مسبقاً بملف `public/_redirects` يحتوي على قاعدة التحويل `/* /index.html 200` لضمان عمل كافة الروابط الداخلية والتحديث المباشر للصحفات (Page Refresh) بدون أخطاء `404`.

### 3. إعدادات نطاق Firebase المعتمد (Authorized Domains):
بعد الحصول على رابط النشر من Cloudflare Pages (مثلاً: `https://ece-roadmap.pages.dev` أو الدومين المخصص)، يجب إضافته في لوحة تحكم Firebase:
1. انتقل إلى **Firebase Console** > **Authentication** > **Settings** > **Authorized domains**.
2. أضف نطاق موقعك الجديد لتمكين تسجيل الدخول عبر Google بسلاسة.

---

## 🛡️ أمان البيانات وقواعد Firestore (Security & Privacy)

- **بيانات الطلاب (`students/{userId}`)**: يملك الطالب فقط صلاحية قراءة وكتابة وتعديل بيانات رحلته الأكاديمية محلياً وسحابياً (`isOwner`).
- **لوحة الإدارة (`admins/`)**: محمية بقواعد أمان صارمة تتحقق من وثائق المشرفين المعتمدين في Firestore وGoogle Auth المعتمد، ولا يمكن اختراقها عبر تعديل المتصفح أو الروابط.
- **وضع عدم الاتصال والتخزين المحلي**: تدعم المنصة العمل الكامل بدون اتصال بالإنترنت مع مزامنة ذكية عند العودة للاتصال.

---

## 📱 توليد رمز الاستجابة السريعة (QR Code Architecture)

يعتمد رمز الاستجابة السريعة في المنصة وشاشة الملتقى على المتغير `VITE_PUBLIC_APP_URL`. بمجرد ربط الدومين الإنتاجي، يظل الرمز ثابتاً وموثوقاً حتى مع استمرار عمليات التحديث والنشر المستمرة على GitHub وCloudflare Pages.

---

## 📄 الترخيص (License)
Apache-2.0 License.
جامعة دمشق — كلية الهندسة الميكانيكية والكهربائية — قسم هندسة الإلكترونيات والاتصالات.
