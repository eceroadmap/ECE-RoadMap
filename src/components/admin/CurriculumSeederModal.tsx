import React, { useState } from 'react';
import { 
  Database, 
  X, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  BookOpen, 
  HelpCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { adminContentService } from '../../services/admin/adminContent';

interface CurriculumSeederModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSeeded?: () => void;
}

export const CurriculumSeederModal: React.FC<CurriculumSeederModalProps> = ({
  isOpen,
  onClose,
  onSeeded
}) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [result, setResult] = useState<{
    courses: number;
    software: number;
    resources: number;
    faqs: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleStartSeed = async () => {
    setIsSeeding(true);
    setStatusMessage('جاري الاتصال بقاعدة بيانات Cloud Firestore...');
    try {
      const counts = await adminContentService.seedExistingCurriculum((msg) => {
        setStatusMessage(msg);
      });
      setResult(counts);
      if (onSeeded) onSeeded();
    } catch (e: any) {
      console.error('Error during curriculum seeding:', e);
      setStatusMessage('حدث خطأ أثناء مزامنة الخطة الدراسية.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-[#091527] border border-cyan-500/30 shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Database className="w-5 h-5" />
            <h3 className="text-base font-black text-white">مزامنة واستيراد الخطة الدراسية</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSeeding}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            تقوم هذه الأداة بأخذ بيانات المقررات، برمجيات المحاكاة، مصادر فريق نُون، والأسئلة الشائعة الموجودة مسبقاً في المنصة ورفعها إلى مجموعات Cloud Firestore بشكل آمن.
          </p>

          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-300 space-y-1 text-[11px]">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>ضمان عدم التكرار والأمان الأكاديمي:</span>
            </div>
            <div>
              تعتمد العملية على معرّفات ثابتة (Deterministic Document IDs) وتدمج البيانات دون حذف أي تعديلات سابقة أو استبدال المحتوى بقيم فارغة.
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs flex items-center gap-2">
            {isSeeding && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />}
            {!isSeeding && result && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            <span>{statusMessage}</span>
          </div>
        )}

        {result && (
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">المقررات الدراسية</span>
              <span className="font-mono font-bold text-cyan-400">{result.courses} مقرر</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">البرمجيات الهندسية</span>
              <span className="font-mono font-bold text-blue-400">{result.software} برنامج</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">مصادر فريق نُون</span>
              <span className="font-mono font-bold text-amber-400">{result.resources} مورد</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">الأسئلة الشائعة</span>
              <span className="font-mono font-bold text-indigo-400">{result.faqs} سؤال</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            disabled={isSeeding}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700 text-xs"
          >
            {result ? 'إغلاق' : 'إلغاء'}
          </button>
          {!result && (
            <button
              onClick={handleStartSeed}
              disabled={isSeeding}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950 flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              <span>{isSeeding ? 'جاري المزامنة...' : 'بدء استيراد الخطة إلى Firestore'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
