import { db, collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from '../lib/firebase';

export interface SkillPipeline {
  id: string;
  category: 'signals' | 'embedded' | 'networks' | 'rf' | 'circuits' | 'ai' | 'iot' | string;
  categoryLabelAr: string;
  courseNameAr: string;
  courseId: string;
  courseYear: number;
  toolName: string;
  toolCategory: string;
  learningCourseTitle: string;
  learningPlatform: string;
  practicalSkillTitle: string;
  skillOutcomeAr: string;
  careerPathAr: string;
  accentColor?: string;
  updatedAt?: string;
}

export const DEFAULT_SKILL_PIPELINES: SkillPipeline[] = [
  {
    id: 'dsp-pipeline',
    category: 'signals',
    categoryLabelAr: 'معالجة الإشارة والاتصالات الرقمية',
    courseNameAr: 'معالجة الإشارة 1 و 2',
    courseId: 'dsp-1',
    courseYear: 3,
    toolName: 'MATLAB',
    toolCategory: 'محاكاة رياضية وتحليل طيفي',
    learningCourseTitle: 'DSP Specialization & Filters',
    learningPlatform: 'Coursera / Coursera DSP',
    practicalSkillTitle: 'تصميم المرشحات الرقمية وتحليل طيف التردد',
    skillOutcomeAr: 'تحويل النماذج الرياضية للإشارات إلى خوارزميات برمجية قابلة للتطبيق العملي في الاتصالات والصوتيات والرادار.',
    careerPathAr: 'مهندس معالجة إشارة واتصالات رقمية (DSP Engineer)',
    accentColor: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300'
  },
  {
    id: 'fpga-pipeline',
    category: 'embedded',
    categoryLabelAr: 'الأنظمة المدمجة والمنطق الرقمي',
    courseNameAr: 'الدارات المنطقية وهندسة المعالجات',
    courseId: 'logic-circuits',
    courseYear: 2,
    toolName: 'Intel Quartus & ModelSim',
    toolCategory: 'توصيف العتاد ومحاكاة FPGA',
    learningCourseTitle: 'VHDL & FPGA Design Essentials',
    learningPlatform: 'Udemy / OpenCores',
    practicalSkillTitle: 'برمجة وتصميم الدارات المتكاملة القابلة للبرمجة',
    skillOutcomeAr: 'كتابة شيفرات VHDL/Verilog وتنزيلها على شرائح FPGA لمعالجة البيانات الضخمة في الزمن الحقيقي.',
    careerPathAr: 'مهندس تصميم عتاد ونظم رقمية مدمجة (FPGA / ASIC Engineer)',
    accentColor: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-300'
  },
  {
    id: 'rf-pipeline',
    category: 'rf',
    categoryLabelAr: 'الأمواج الكهرومغناطيسية والهوائيات',
    courseNameAr: 'حقول كهرومغناطيسية وهوائيات',
    courseId: 'em-fields',
    courseYear: 3,
    toolName: 'Ansys HFSS',
    toolCategory: 'محاكاة كهرومغناطيسية ثلاثية الأبعاد',
    learningCourseTitle: 'Antenna Theory & RF Design',
    learningPlatform: 'IEEE / Microwave Lab',
    practicalSkillTitle: 'نمذجة وتصميم الهوائيات ودارات الميكروويف',
    skillOutcomeAr: 'حساب مخططات الإشعاع، معامل الانعكاس S11، ومطابقة الممانعات لهوائيات 5G والاتصالات اللاسلكية.',
    careerPathAr: 'مهندس ترددات راديوية وهوائيات (RF & Antenna Engineer)',
    accentColor: 'from-sky-500/20 to-cyan-500/20 border-sky-500/40 text-sky-300'
  },
  {
    id: 'network-pipeline',
    category: 'networks',
    categoryLabelAr: 'هندسة الشبكات والبروتوكولات',
    courseNameAr: 'شبكات الحاسب 1 و 2',
    courseId: 'computer-networks',
    courseYear: 4,
    toolName: 'Cisco Packet Tracer',
    toolCategory: 'محاكاة وتوجيه الشبكات',
    learningCourseTitle: 'Cisco CCNA (200-301) Routing & Switching',
    learningPlatform: 'Cisco Networking Academy',
    practicalSkillTitle: 'بناء وإدارة البنى التحتية وبروتوكولات التوجيه IP',
    skillOutcomeAr: 'تكوين موجهات وسويتشات Cisco، وتأمين الشبكات، وتقسيم الشبكات الفرعية VLANs، وبروتوكولات OSPF/BGP.',
    careerPathAr: 'مهندس شبكات وبنية تحتية سحابية (Network Engineer)',
    accentColor: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300'
  },
  {
    id: 'hardware-pipeline',
    category: 'circuits',
    categoryLabelAr: 'الإلكترونيات وتصميم الدارات المطبوعة',
    courseNameAr: 'إلكترونيات 1 و 2 ومخابر الدارات',
    courseId: 'electronics-1',
    courseYear: 2,
    toolName: 'NI Multisim & Proteus',
    toolCategory: 'محاكاة الدارات وتصميم اللوحات المطبوعة PCB',
    learningCourseTitle: 'Practical PCB Design with Altium / KiCad',
    learningPlatform: 'Coursera / YouTube Tech',
    practicalSkillTitle: 'تصميم واختبار اللوحات الإلكترونية وتصنيعها',
    skillOutcomeAr: 'رسم المخططات التخطيطية Schematic، وتوجيه المسارات Routing، واختبار الدارات التماثلية والرقمية مخبرياً.',
    careerPathAr: 'مهندس عتاد وتصميم إلكتروني (Hardware & PCB Designer)',
    accentColor: 'from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-300'
  }
];

const COLLECTION_NAME = 'course_skill_pipelines';

export const courseSkillsService = {
  subscribePipelines(callback: (pipelines: SkillPipeline[], loading: boolean) => void) {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      return onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: SkillPipeline[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as SkillPipeline);
            });
            // Sort by courseYear ascending
            list.sort((a, b) => a.courseYear - b.courseYear);
            callback(list, false);
          } else {
            callback(DEFAULT_SKILL_PIPELINES, false);
          }
        },
        (error) => {
          console.warn('Firestore pipelines subscription notice:', error);
          callback(DEFAULT_SKILL_PIPELINES, false);
        }
      );
    } catch (e) {
      console.warn('Firestore pipelines error, using defaults:', e);
      callback(DEFAULT_SKILL_PIPELINES, false);
      return () => {};
    }
  },

  async savePipeline(pipeline: SkillPipeline): Promise<void> {
    const pipelineDocRef = doc(db, COLLECTION_NAME, pipeline.id);
    const updated: SkillPipeline = {
      ...pipeline,
      updatedAt: new Date().toISOString()
    };
    await setDoc(pipelineDocRef, updated);
  },

  async deletePipeline(pipelineId: string): Promise<void> {
    const pipelineDocRef = doc(db, COLLECTION_NAME, pipelineId);
    await deleteDoc(pipelineDocRef);
  },

  async seedDefaultPipelines(): Promise<number> {
    let count = 0;
    for (const pipeline of DEFAULT_SKILL_PIPELINES) {
      const pipelineDocRef = doc(db, COLLECTION_NAME, pipeline.id);
      await setDoc(pipelineDocRef, {
        ...pipeline,
        updatedAt: new Date().toISOString()
      });
      count++;
    }
    return count;
  }
};
