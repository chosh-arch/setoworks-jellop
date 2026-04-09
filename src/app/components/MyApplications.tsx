import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, FileText, Inbox } from 'lucide-react';

interface Application {
  id: string;
  projectName: string;
  pm: string;
  submitDate: string;
  status: string;
  formData: Record<string, unknown>;
}

interface MyApplicationsProps {
  onClose: () => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  submitted: { label: '신청완료', color: 'bg-blue-100 text-blue-700' },
  reviewing: { label: '검토중', color: 'bg-yellow-100 text-yellow-700' },
  inProgress: { label: '진행중', color: 'bg-green-100 text-green-700' },
  completed: { label: '완료', color: 'bg-gray-100 text-gray-600' },
};

const demoApplications: Application[] = [
  {
    id: '1',
    projectName: '한셉트 제로 MK3 킥스타터 US',
    pm: '김세토',
    submitDate: '2026-04-05',
    status: 'reviewing',
    formData: {
      channels: ['크라우드펀딩 -- Kickstarter'],
      countries: ['미국'],
      industries: ['IT·전자기기·IoT'],
      companySize: '스타트업(초기)',
      evaluation: '',
      bestThing: '',
      worstThing: '',
      lesson: '',
    },
  },
  {
    id: '2',
    projectName: '스마트 온열패드 일본 마쿠아케',
    pm: '박운영',
    submitDate: '2026-04-08',
    status: 'submitted',
    formData: {
      channels: ['크라우드펀딩 -- 기타'],
      countries: ['일본'],
      industries: ['소비재·라이프스타일'],
      companySize: '중소기업(~100억)',
      evaluation: '',
      bestThing: '',
      worstThing: '',
      lesson: '',
    },
  },
];

export function MyApplications({ onClose }: MyApplicationsProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('gtm_applications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setApplications(parsed);
          return;
        }
      } catch { /* ignore */ }
    }
    // Seed demo data if empty
    localStorage.setItem('gtm_applications', JSON.stringify(demoApplications));
    setApplications(demoApplications);
  }, []);

  const getStatus = (status: string) => statusConfig[status] || statusConfig.submitted;

  const getSummary = (app: Application) => {
    const fd = app.formData || {};
    const channels = Array.isArray(fd.channels) ? (fd.channels as string[]).join(', ') : '';
    const countries = Array.isArray(fd.countries) ? (fd.countries as string[]).join(', ') : '';
    const parts: string[] = [];
    if (channels) parts.push(channels);
    if (countries) parts.push(countries);
    return parts.join(' | ') || '-';
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-start justify-center overflow-y-auto py-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-[#ff003b]" />
            <h2 className="text-xl font-bold text-gray-900">내 신청 내역</h2>
            <span className="px-2.5 py-0.5 bg-[#ff003b] text-white rounded-full text-sm font-medium">
              {applications.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Inbox className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">아직 신청한 프로젝트가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const st = getStatus(app.status);
                const isExpanded = expandedId === app.id;
                return (
                  <div
                    key={app.id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : app.id)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-gray-900 truncate">
                            {app.projectName}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          신청일: {app.submitDate} &middot; {getSummary(app)}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-5 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
                          <div>
                            <span className="text-gray-500 font-medium">프로젝트명</span>
                            <p className="text-gray-900">{app.projectName}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">담당 PM</span>
                            <p className="text-gray-900">{app.pm}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">GTM 채널</span>
                            <p className="text-gray-900">
                              {Array.isArray(app.formData?.channels)
                                ? (app.formData.channels as string[]).join(', ')
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">대상 국가</span>
                            <p className="text-gray-900">
                              {Array.isArray(app.formData?.countries)
                                ? (app.formData.countries as string[]).join(', ')
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">산업군</span>
                            <p className="text-gray-900">
                              {Array.isArray(app.formData?.industries)
                                ? (app.formData.industries as string[]).join(', ')
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">기업 규모</span>
                            <p className="text-gray-900">
                              {(app.formData?.companySize as string) || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
