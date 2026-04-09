import { useState, useEffect } from 'react';
import { X, Lock, ChevronRight, Save, LogOut } from 'lucide-react';

interface Application {
  id: string;
  projectName: string;
  pm: string;
  submitDate: string;
  status: string;
  formData: Record<string, unknown>;
}

interface AdminData {
  [appId: string]: {
    stage: number;
    stageHistory: { stage: number; date: string }[];
    notes: string;
    status: string;
  };
}

interface AdminTrackerProps {
  onClose: () => void;
}

const STAGES = [
  '1.신청접수',
  '2.내부검토',
  '3.견적발송',
  '4.계약체결',
  '5.프로젝트진행',
  '6.완료/정산',
];

const STATUS_OPTIONS = [
  { value: 'submitted', label: '신청완료', color: 'bg-blue-100 text-blue-700' },
  { value: 'reviewing', label: '검토중', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'quoteSent', label: '견적발송', color: 'bg-purple-100 text-purple-700' },
  { value: 'contracted', label: '계약', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'inProgress', label: '진행중', color: 'bg-green-100 text-green-700' },
  { value: 'completed', label: '완료', color: 'bg-gray-100 text-gray-600' },
  { value: 'onHold', label: '보류', color: 'bg-red-100 text-red-700' },
];

const PASSWORD = 'setoworks2026';
const AUTH_KEY = 'admin_auth';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function AdminTracker({ onClose }: AdminTrackerProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [adminData, setAdminData] = useState<AdminData>({});

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) === 'true') {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const stored = localStorage.getItem('gtm_applications');
    if (stored) {
      try {
        setApplications(JSON.parse(stored));
      } catch { /* ignore */ }
    }
    const admin = localStorage.getItem('gtm_admin_data');
    if (admin) {
      try {
        setAdminData(JSON.parse(admin));
      } catch { /* ignore */ }
    }
  }, [authenticated]);

  const handleLogin = () => {
    if (passwordInput === PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem(AUTH_KEY, 'true');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
    onClose();
  };

  const getAppAdmin = (appId: string) => {
    return adminData[appId] || {
      stage: 0,
      stageHistory: [{ stage: 0, date: getToday() }],
      notes: '',
      status: 'submitted',
    };
  };

  const updateAdminField = (appId: string, field: string, value: unknown) => {
    setAdminData((prev) => {
      const current = prev[appId] || {
        stage: 0,
        stageHistory: [{ stage: 0, date: getToday() }],
        notes: '',
        status: 'submitted',
      };
      const updated = { ...prev, [appId]: { ...current, [field]: value } };
      localStorage.setItem('gtm_admin_data', JSON.stringify(updated));
      return updated;
    });
  };

  const advanceStage = (appId: string) => {
    const current = getAppAdmin(appId);
    if (current.stage >= STAGES.length - 1) return;
    const newStage = current.stage + 1;
    const newHistory = [...(current.stageHistory || []), { stage: newStage, date: getToday() }];
    setAdminData((prev) => {
      const updated = {
        ...prev,
        [appId]: { ...current, stage: newStage, stageHistory: newHistory },
      };
      localStorage.setItem('gtm_admin_data', JSON.stringify(updated));
      // Also sync status to gtm_applications
      syncApplicationStatus(appId, current.status);
      return updated;
    });
  };

  const changeStatus = (appId: string, newStatus: string) => {
    updateAdminField(appId, 'status', newStatus);
    syncApplicationStatus(appId, newStatus);
  };

  const syncApplicationStatus = (appId: string, status: string) => {
    try {
      const stored = localStorage.getItem('gtm_applications');
      if (stored) {
        const apps = JSON.parse(stored) as Application[];
        const updated = apps.map((a) => (a.id === appId ? { ...a, status } : a));
        localStorage.setItem('gtm_applications', JSON.stringify(updated));
      }
    } catch { /* ignore */ }
  };

  // Password gate
  if (!authenticated) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">내부 관리 접근</h2>
          </div>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setPasswordError(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="비밀번호를 입력하세요"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
              passwordError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#ff003b]'
            }`}
          />
          {passwordError && (
            <p className="text-red-500 text-sm mt-2">비밀번호가 올바르지 않습니다.</p>
          )}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleLogin}
              className="flex-1 px-4 py-3 bg-[#ff003b] text-white rounded-xl hover:bg-[#cc0030] transition-colors font-medium"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#F5F7FA] overflow-y-auto">
      {/* Dark header bar */}
      <div className="bg-gray-900 text-white px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tracking-wider text-gray-300">SETOWORKS</span>
          <span className="text-white font-bold text-lg">내부 관리 시스템</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            전체 신청 관리 ({applications.length}건)
          </h2>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400">
            등록된 신청이 없습니다.
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => {
              const admin = getAppAdmin(app.id);
              const currentStatus = STATUS_OPTIONS.find((s) => s.value === admin.status) || STATUS_OPTIONS[0];

              return (
                <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Application header */}
                  <div className="px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{app.projectName}</h3>
                        <p className="text-sm text-gray-500">
                          PM: {app.pm} &middot; 신청일: {app.submitDate}
                        </p>
                      </div>
                      <select
                        value={admin.status}
                        onChange={(e) => changeStatus(app.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border-0 cursor-pointer ${currentStatus.color}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Stage pipeline */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                      {STAGES.map((stage, idx) => (
                        <div key={stage} className="flex items-center">
                          <button
                            onClick={() => {
                              if (idx <= admin.stage + 1) {
                                // Allow clicking to set stage
                                const newHistory = [
                                  ...(admin.stageHistory || []),
                                  { stage: idx, date: getToday() },
                                ];
                                setAdminData((prev) => {
                                  const updated = {
                                    ...prev,
                                    [app.id]: { ...admin, stage: idx, stageHistory: newHistory },
                                  };
                                  localStorage.setItem('gtm_admin_data', JSON.stringify(updated));
                                  return updated;
                                });
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                              idx <= admin.stage
                                ? 'bg-[#ff003b] text-white'
                                : idx === admin.stage + 1
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer'
                                : 'bg-gray-50 text-gray-400'
                            }`}
                          >
                            {stage}
                          </button>
                          {idx < STAGES.length - 1 && (
                            <ChevronRight className="w-3 h-3 text-gray-300 mx-0.5 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => advanceStage(app.id)}
                        disabled={admin.stage >= STAGES.length - 1}
                        className="ml-2 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        다음 단계
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="px-6 py-4 grid grid-cols-3 gap-4 text-sm border-b border-gray-100">
                    <div>
                      <span className="text-gray-500">GTM 채널</span>
                      <p className="text-gray-900">
                        {Array.isArray(app.formData?.channels)
                          ? (app.formData.channels as string[]).join(', ')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">대상 국가</span>
                      <p className="text-gray-900">
                        {Array.isArray(app.formData?.countries)
                          ? (app.formData.countries as string[]).join(', ')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">산업군</span>
                      <p className="text-gray-900">
                        {Array.isArray(app.formData?.industries)
                          ? (app.formData.industries as string[]).join(', ')
                          : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Stage history */}
                  {admin.stageHistory && admin.stageHistory.length > 0 && (
                    <div className="px-6 py-3 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">단계 이력</p>
                      <div className="flex flex-wrap gap-2">
                        {admin.stageHistory.map((h, i) => (
                          <span key={i} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                            {STAGES[h.stage]} ({h.date})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-500">내부 메모</p>
                      <Save className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <textarea
                      value={admin.notes}
                      onChange={(e) => updateAdminField(app.id, 'notes', e.target.value)}
                      placeholder="내부 메모를 입력하세요..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#ff003b] transition-colors resize-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
