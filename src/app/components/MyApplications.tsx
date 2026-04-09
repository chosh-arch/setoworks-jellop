import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, FileText, Inbox } from 'lucide-react';

interface Application {
  id: string;
  companyName: string;
  productName: string;
  contactName: string;
  email: string;
  submitDate: string;
  status: string;
  platforms: string[];
  countries: string[];
  services: string[];
  [key: string]: unknown;
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
    companyName: '한셉트',
    productName: '제로 MK3 폴더블 펜',
    contactName: '이한셉',
    email: 'contact@hancept.com',
    submitDate: '2026-04-05',
    status: 'reviewing',
    platforms: ['Kickstarter'],
    countries: ['미국'],
    services: ['풀스택 패키지'],
  },
  {
    id: '2',
    companyName: '닥터서플라이',
    productName: '젠히트 프로 온열패드',
    contactName: '박닥터',
    email: 'biz@doctorsupply.kr',
    submitDate: '2026-04-08',
    status: 'submitted',
    platforms: ['Makuake', 'Wadiz'],
    countries: ['일본', '한국'],
    services: ['인플루언서 시딩', '광고 운영'],
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

  const formatList = (arr: unknown) =>
    Array.isArray(arr) && arr.length > 0 ? (arr as string[]).join(', ') : '-';

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
                            {app.companyName} - {app.productName}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          신청일: {app.submitDate} &middot; {formatList(app.platforms)} &middot; {formatList(app.countries)}
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
                            <span className="text-gray-500 font-medium">회사명</span>
                            <p className="text-gray-900">{app.companyName || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">제품명</span>
                            <p className="text-gray-900">{app.productName || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">담당자</span>
                            <p className="text-gray-900">{app.contactName || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">이메일</span>
                            <p className="text-gray-900">{app.email || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">희망 플랫폼</span>
                            <p className="text-gray-900">{formatList(app.platforms)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium">희망 국가</span>
                            <p className="text-gray-900">{formatList(app.countries)}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500 font-medium">희망 서비스</span>
                            <p className="text-gray-900">{formatList(app.services)}</p>
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
