import React from 'react';
import { 
  Send, 
  Instagram, 
  FileText, 
  Globe, 
  BookOpen, 
  Cpu, 
  Bookmark, 
  Video, 
  ExternalLink,
  Layers,
  GraduationCap
} from 'lucide-react';
import { StudentResource, ResourceType } from '../types';

interface ResourceCardProps {
  resource: StudentResource;
  onSelectCourseName?: (courseName: string) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onSelectCourseName
}) => {
  // Determine icon & badge styles based on ResourceType
  const getTypeConfig = (type?: ResourceType) => {
    switch (type) {
      case 'telegram':
        return {
          icon: Send,
          label: 'Telegram',
          badgeBg: 'bg-sky-950/80 text-sky-300 border-sky-800/50',
          iconColor: 'text-sky-400'
        };
      case 'instagram':
        return {
          icon: Instagram,
          label: 'Instagram',
          badgeBg: 'bg-pink-950/80 text-pink-300 border-pink-800/50',
          iconColor: 'text-pink-400'
        };
      case 'pdf':
        return {
          icon: FileText,
          label: 'ملف PDF / ملحق',
          badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-800/50',
          iconColor: 'text-rose-400'
        };
      case 'video':
        return {
          icon: Video,
          label: 'تسجيل مرئي',
          badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-800/50',
          iconColor: 'text-amber-400'
        };
      case 'course':
        return {
          icon: BookOpen,
          label: 'مادة دراسية',
          badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/50',
          iconColor: 'text-cyan-400'
        };
      case 'software':
        return {
          icon: Cpu,
          label: 'برمجية / أداة',
          badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-800/50',
          iconColor: 'text-purple-400'
        };
      case 'reference':
        return {
          icon: Bookmark,
          label: 'مرجع علمي',
          badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/50',
          iconColor: 'text-indigo-400'
        };
      case 'website':
      default:
        return {
          icon: Globe,
          label: 'رابط ويب',
          badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50',
          iconColor: 'text-emerald-400'
        };
    }
  };

  const typeConfig = getTypeConfig(resource.type);
  const IconComponent = typeConfig.icon;

  return (
    <div className={`p-5 rounded-3xl bg-[#091527] border transition-all duration-200 shadow-xl flex flex-col justify-between group text-right ${
      resource.isFeatured 
        ? 'border-cyan-500/50 ring-1 ring-cyan-500/30 bg-gradient-to-b from-[#0a182e] to-[#071324]' 
        : 'border-slate-800/80 hover:border-cyan-500/40'
    }`}>
      <div className="space-y-3.5">
        {/* Top Badges */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 ${typeConfig.badgeBg}`}>
            <IconComponent className={`w-3.5 h-3.5 ${typeConfig.iconColor}`} />
            <span>{typeConfig.label}</span>
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            {resource.year && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                السنة {resource.year}
              </span>
            )}
            {resource.categoryLabelAr && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-900 text-slate-400 border border-slate-800">
                {resource.categoryLabelAr}
              </span>
            )}
          </div>
        </div>

        {/* Title and Source */}
        <div className="space-y-1">
          <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
            {resource.titleAr}
          </h4>
          {resource.source && (
            <p className="text-xs text-cyan-400 font-medium">
              المصدر: {resource.source}
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed">
          {resource.descriptionAr}
        </p>

        {/* Related Course pill */}
        {resource.relatedCourse && (
          <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2">
            <span className="text-[11px] text-slate-400">مقرر مرتبط:</span>
            <button
              type="button"
              onClick={() => onSelectCourseName && onSelectCourseName(resource.relatedCourse!)}
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-950/60 text-blue-300 border border-blue-800/40 hover:bg-blue-900/60"
            >
              {resource.relatedCourse}
            </button>
          </div>
        )}

        {/* Sub-sections if available */}
        {resource.sections && resource.sections.length > 0 && (
          <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
            {resource.sections.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-slate-300 p-2 rounded-xl bg-slate-950/50 border border-slate-850">
                <span>{s.labelAr}</span>
                {s.isPlaceholder && (
                  <span className="text-[10px] text-slate-500 italic">
                    سيتم تفعيل الرابط
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
        {resource.url ? (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
          >
            <span>الانتقال للمصدر</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="text-[11px] text-slate-500 italic">
            سيتم توفير الرابط المعتمد لاحقاً
          </span>
        )}

        <div className="flex items-center gap-1">
          {resource.tags.slice(0, 2).map((t, idx) => (
            <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
              #{t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
