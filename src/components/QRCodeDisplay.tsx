import React, { useState, useRef } from 'react';
import { 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  Smartphone, 
  Share2, 
  Download,
  X 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { CANONICAL_PRODUCTION_URL } from '../lib/firebase';

interface QRCodeDisplayProps {
  title: string;
  subtitle?: string;
  url?: string;
  badge?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  title,
  subtitle = 'امسح الرمز بكاميرا هاتفك لفتح الرابط مباشرة',
  url,
  badge = 'ECE RoadMap',
  onClose,
  isModal = false
}) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const qrRef = useRef<SVGSVGElement | null>(null);

  // Normalize target URL to permanent production link if empty or dev placeholder
  const activeUrl = (!url || url.includes('localhost') || url.includes('127.0.0.1'))
    ? CANONICAL_PRODUCTION_URL 
    : url;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    try {
      const svgData = new XMLSerializer().serializeToString(qrRef.current);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `ece-roadmap-qr-${Date.now()}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      console.error('Failed to download QR SVG:', err);
    }
  };

  const content = (
    <div className="space-y-4 text-center text-slate-100" dir="rtl">
      {/* Badge & Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-600/70 text-cyan-300 text-xs font-mono shadow-sm">
          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>{badge}</span>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-300 max-w-xs mx-auto">{subtitle}</p>}
      </div>

      {/* High-Contrast Optical QR Plate for 100% Mobile Camera Recognition */}
      <div className="relative inline-block p-3 sm:p-4 rounded-3xl bg-[#071324] border-2 border-cyan-500/50 shadow-2xl shadow-cyan-950/80 group">
        {/* Corner Circuit Accents */}
        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 rounded-tr" />
        <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 rounded-tl" />
        <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 rounded-br" />
        <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 rounded-bl" />

        {/* Optical Pure White Scan Plate - Guarantees Instant Detection on all Cameras */}
        <div className="p-3 sm:p-4 bg-white rounded-2xl shadow-inner flex items-center justify-center">
          <QRCodeSVG
            ref={qrRef}
            value={activeUrl}
            size={200}
            level="Q"
            bgColor="#FFFFFF"
            fgColor="#051329"
            includeMargin={false}
            className="w-36 h-36 xs:w-44 xs:h-44 sm:w-52 sm:h-52"
          />
        </div>

        {/* Scan Instruction Footer */}
        <div className="mt-2 text-[10px] sm:text-xs text-cyan-300 font-mono font-bold flex items-center justify-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>وجّه كاميرا هاتفك للمسح الفوري</span>
        </div>
      </div>

      {/* URL Display & Action Bar */}
      <div className="space-y-2.5 max-w-sm mx-auto">
        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/95 border border-slate-800 text-[11px] font-mono text-cyan-300 truncate text-left select-all" dir="ltr">
          {activeUrl}
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs font-bold">
          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            title="نسخ الرابط إلى الحافظة"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">تم</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>نسخ</span>
              </>
            )}
          </button>

          {/* Download SVG QR */}
          <button
            onClick={handleDownloadQR}
            className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            title="تحميل صورة الرمز بدقة عالية (SVG)"
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">حُفظ</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>تحميل</span>
              </>
            )}
          </button>

          {/* Open Link Directly */}
          <a
            href={activeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 flex items-center justify-center gap-1.5 transition-colors"
            title="فتح الرابط في تبويب جديد"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>فتح</span>
          </a>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-md bg-[#091426] border border-cyan-700/50 rounded-3xl p-5 sm:p-6 shadow-2xl relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 left-4 sm:top-5 sm:left-5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-[#091527] border border-cyan-900/50 shadow-xl">
      {content}
    </div>
  );
};

