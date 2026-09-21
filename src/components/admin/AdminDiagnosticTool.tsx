import React, { useState, useEffect } from 'react';
import { auth, db, doc, getDoc, setDoc } from '../../lib/firebase';
import { ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, Terminal } from 'lucide-react';
import { BOOTSTRAP_ADMIN_EMAIL } from '../../services/admin/adminAuth';

export const AdminDiagnosticTool: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    uid?: string;
    email?: string;
    tokenEmail?: string;
    adminDocExists?: boolean;
    adminDocData?: any;
    systemConfigExists?: boolean;
    systemConfigData?: any;
    writeTestSuccess?: boolean;
    writeTestError?: string;
    error?: string;
  } | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    const currentUser = auth.currentUser;
    const result: any = {
      uid: currentUser?.uid || 'Not logged in',
      email: currentUser?.email || 'No email on currentUser',
    };

    try {
      // Get token result / claims if possible
      if (currentUser) {
        const tokenResult = await currentUser.getIdTokenResult();
        result.tokenEmail = tokenResult.claims.email || 'No email in token claims';
      }

      // Check /admins/{uid}
      if (currentUser) {
        const adminRef = doc(db, 'admins', currentUser.uid);
        const adminSnap = await getDoc(adminRef);
        result.adminDocExists = adminSnap.exists();
        result.adminDocData = adminSnap.exists() ? adminSnap.data() : null;
      }

      // Check system_config/moderators_list
      const cfgRef = doc(db, 'system_config', 'moderators_list');
      const cfgSnap = await getDoc(cfgRef);
      result.systemConfigExists = cfgSnap.exists();
      result.systemConfigData = cfgSnap.exists() ? cfgSnap.data() : null;

      // Test write to system_config/diagnostic_test
      if (currentUser) {
        try {
          const testRef = doc(db, 'system_config', 'diagnostic_test');
          await setDoc(testRef, { lastTested: new Date().toISOString(), testedBy: currentUser.email }, { merge: true });
          result.writeTestSuccess = true;
        } catch (writeErr: any) {
          result.writeTestSuccess = false;
          result.writeTestError = writeErr.message || String(writeErr);
        }
      }

    } catch (err: any) {
      result.error = err.message || String(err);
    } finally {
      setDiagnosticResult(result);
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 my-4 shadow-lg">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white text-base">أداة تشخيص الصلاحيات (Admin Diagnostic Tool)</h3>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          إعادة فحص التشخيص
        </button>
      </div>

      {diagnosticResult && (
        <div className="space-y-3 text-xs font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400">Current User UID:</span>{' '}
              <span className="text-cyan-300">{diagnosticResult.uid}</span>
            </div>
            <div>
              <span className="text-slate-400">Auth Email:</span>{' '}
              <span className="text-cyan-300">{diagnosticResult.email}</span>
            </div>
            <div>
              <span className="text-slate-400">Token Email Claim:</span>{' '}
              <span className="text-cyan-300">{diagnosticResult.tokenEmail}</span>
            </div>
            <div>
              <span className="text-slate-400">Bootstrap Admin Target:</span>{' '}
              <span className="text-emerald-400">{BOOTSTRAP_ADMIN_EMAIL}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className={`p-3 rounded-lg border ${diagnosticResult.adminDocExists ? 'bg-emerald-950/30 border-emerald-800/50' : 'bg-rose-950/30 border-rose-800/50'}`}>
              <div className="font-semibold mb-1 text-slate-300">Admin Document (/admins/uid)</div>
              <div>Status: {diagnosticResult.adminDocExists ? <span className="text-emerald-400">Exists ✅</span> : <span className="text-rose-400">Missing ❌</span>}</div>
              {diagnosticResult.adminDocData && (
                <div className="mt-1 text-[10px] text-slate-400 truncate">
                  Role: {diagnosticResult.adminDocData.role} | Owner: {String(diagnosticResult.adminDocData.isOwner)}
                </div>
              )}
            </div>

            <div className={`p-3 rounded-lg border ${diagnosticResult.systemConfigExists ? 'bg-emerald-950/30 border-emerald-800/50' : 'bg-amber-950/30 border-amber-800/50'}`}>
              <div className="font-semibold mb-1 text-slate-300">System Config (moderators_list)</div>
              <div>Status: {diagnosticResult.systemConfigExists ? <span className="text-emerald-400">Exists ✅</span> : <span className="text-amber-400">Not Created Yet</span>}</div>
              {diagnosticResult.systemConfigData && (
                <div className="mt-1 text-[10px] text-slate-400 truncate">
                  Active Count: {diagnosticResult.systemConfigData.activeEmails?.length || 0}
                </div>
              )}
            </div>

            <div className={`p-3 rounded-lg border ${diagnosticResult.writeTestSuccess ? 'bg-emerald-950/30 border-emerald-800/50' : 'bg-rose-950/30 border-rose-800/50'}`}>
              <div className="font-semibold mb-1 text-slate-300">Firestore Write Test</div>
              <div>Result: {diagnosticResult.writeTestSuccess ? <span className="text-emerald-400">Passed ✅</span> : <span className="text-rose-400">Failed ❌</span>}</div>
              {diagnosticResult.writeTestError && (
                <div className="mt-1 text-[10px] text-rose-300 break-words">
                  {diagnosticResult.writeTestError}
                </div>
              )}
            </div>
          </div>

          {diagnosticResult.error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-rose-300">
              Diagnostic Error: {diagnosticResult.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
