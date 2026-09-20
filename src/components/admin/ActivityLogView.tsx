import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Search, 
  ShieldCheck, 
  RefreshCw, 
  Filter,
  FileText,
  User,
  Calendar
} from 'lucide-react';
import { AdminActivityLog } from '../../types/admin';
import { adminRepository } from '../../services/admin/adminRepository';

export const ActivityLogView: React.FC = () => {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await adminRepository.getLogs(100);
      setLogs(data);
    } catch (e) {
      console.warn('Failed to load admin logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actionType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.targetContentType === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATED') || action.includes('SEEDED')) {
      return 'bg-emerald-950 text-emerald-400 border-emerald-800/50';
    }
    if (action.includes('UPDATED')) {
      return 'bg-cyan-950 text-cyan-400 border-cyan-800/50';
    }
    if (action.includes('ARCHIVED')) {
      return 'bg-rose-950 text-rose-400 border-rose-800/50';
    }
    if (action.includes('RESTORED')) {
      return 'bg-blue-950 text-blue-400 border-blue-800/50';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#091527] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>سجل العمليات والتدقيق الأمني الإداري</span>
          </div>
          <h2 className="text-lg font-black text-white">
            Audit Activity Log ({logs.length} عملية مسجلة)
          </h2>
          <p className="text-xs text-slate-400">
            سجل غير قابل للتعديل أو الحذف، يوثق كافة التعديلات والإضافات التي تمت على الخطة الدراسية والموارد.
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>تحديث السجل</span>
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="p-4 rounded-2xl bg-[#091527] border border-slate-800 shadow-md flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في تفاصيل العملية، المشرف، أو النوع..."
            className="w-full pr-9 pl-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-slate-400 ml-1">نوع الكيان:</span>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'course', label: 'المقررات' },
            { id: 'software', label: 'البرمجيات' },
            { id: 'resource', label: 'الموارد' },
            { id: 'faq', label: 'الأسئلة' },
            { id: 'community_tip', label: 'المجتمع' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActionFilter(f.id)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                actionFilter === f.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl bg-[#091527] border border-slate-800 overflow-hidden shadow-xl">
        {filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">العملية الإدارية</th>
                  <th className="py-3.5 px-5">التفاصيل</th>
                  <th className="py-3.5 px-5">المشرف المنفذ</th>
                  <th className="py-3.5 px-5">التوقيت والتاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-200">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${getActionBadgeColor(log.actionType)}`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 max-w-md">
                      <div className="font-medium text-white">{log.details}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        الكيان: {log.targetContentType} • المعرف: {log.targetDocId}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{log.adminEmail}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{new Date(log.timestamp).toLocaleDateString('ar-SY')}</span>
                        <span className="text-slate-600">|</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="font-bold text-slate-400">لا توجد عمليات مسجلة مطابقة للبحث</div>
          </div>
        )}
      </div>
    </div>
  );
};
