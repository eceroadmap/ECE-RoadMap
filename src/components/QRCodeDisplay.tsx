import React, { useState } from 'react';
import { 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  Smartphone, 
  Layers, 
  Sparkles,
  Download,
  X
} from 'lucide-react';

interface QRCodeDisplayProps {
  title: string;
  subtitle?: string;
  url: string;
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

  // High-contrast clean QR Code URL via standard SVG endpoint or vector QR renderer
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    url
  )}&color=06b6d4&bgcolor=060d1a&margin=10`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const content = (
    <div className="space-y-4 text-center text-slate-100" dir="rtl">
      {/* Badge & Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{badge}</span>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 max-w-xs mx-auto">{subtitle}</p>}
      </div>

      {/* QR Code Container with Engineering Frame */}
      <div className="relative inline-block p-4 rounded-2xl bg-[#060d1a] border-2 border-cyan-500/40 shadow-2xl shadow-cyan-950/80 group">
        {/* Corner Circuit Accents */}
        <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />

        {/* QR Image with Fallback */}
        <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-xl overflow-hidden bg-[#060d1a] flex items-center justify-center relative">
          <img
            src={qrImageUrl}
            alt={`QR Code - ${title}`}
            className="w-full h-full object-contain filter contrast-125"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {/* Subtle central watermark */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
            <Layers className="w-16 h-16 text-cyan-400" />
          </div>
        </div>

        {/* Scan Instruction Footer */}
        <div className="mt-2 text-[10px] text-cyan-400/90 font-mono flex items-center justify-center gap-1">
          <Smartphone className="w-3 h-3" />
          <span>Scan with Mobile Camera</span>
        </div>
      </div>

      {/* URL Link & Actions */}
      <div className="space-y-2 max-w-xs mx-auto">
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-cyan-300 truncate text-left" dir="ltr">
          {url}
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>نسخ الرابط</span>
              </>
            )}
          </button>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>فتح الرابط</span>
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
        <div className="w-full max-w-md bg-[#091426] border border-cyan-700/50 rounded-3xl p-6 shadow-2xl relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
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
    <div className="p-6 rounded-3xl bg-[#091527] border border-cyan-900/50 shadow-xl">
      {content}
    </div>
  );
};
