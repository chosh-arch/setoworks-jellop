import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Check, CheckCircle } from 'lucide-react';

interface GTMFormProps {
  onClose: () => void;
}

interface KPIRow {
  label: string;
  targetValue: string;
  actualValue: string;
  memo: string;
}

interface PlatformResultRow {
  platform: string;
  funding: string;
  backers: string;
  conversion: string;
  roas: string;
  memo: string;
}

interface FormData {
  // Section 1
  projectName: string;
  pm: string;
  writeDate: string;
  startDate: string;
  endDate: string;
  endDateOngoing: boolean;
  // Section 2
  channels: string[];
  // Section 3
  countries: string[];
  // Section 4
  industries: string[];
  // Section 5
  companySize: string;
  // Section 6
  kpis: KPIRow[];
  // Section 7
  evaluation: string;
  // Section 8
  bestThing: string;
  worstThing: string;
  lesson: string;
  // New: Influencer seeding
  seedingTotal: string;
  seedingByTier: { nano: string; micro: string; mid: string; macro: string; mega: string };
  seedingROI: string;
  topInfluencer: { name: string; platform: string; conversions: string };
  seedingNotes: string;
  // New: Platform results
  platformResults: PlatformResultRow[];
  // New: Creative performance
  bestCreative: { name: string; roas: string };
  worstCreative: { name: string; roas: string };
  abTestInsight: string;
  // New: Ecommerce conversion
  ecommerceConverted: string;
  ecommercePlatforms: string[];
  ecommerceRevenue: string;
  repeatConversion: string;
  // New: AI prediction
  aiPredictedAmount: string;
  aiActualAmount: string;
  aiModelFeedback: string;
  // Section 9
  voucherUsage: string;
  followUpOptions: string[];
  recontractChance: string;
  recontractReason: string;
  // Section 10
  signPmName: string;
  signPmDate: string;
  signReviewerName: string;
  signReviewerDate: string;
}

const today = new Date().toISOString().split('T')[0];

const channelOptions = [
  '크라우드펀딩 -- Kickstarter',
  '크라우드펀딩 -- Indiegogo',
  '크라우드펀딩 -- 기타',
  '이커머스 -- Amazon',
  '이커머스 -- Rakuten',
  '이커머스 -- Qoo10',
  '글로벌 D2C -- Shopify',
  '글로벌 D2C -- 카페24/자사몰',
  '글로벌 바이어 발굴 (B2B)',
  '오프라인 현지 스토어 입점',
  'POC (개념검증)',
  'GTM 전략 컨설팅',
  '수출바우처 연계 집행',
  '기타',
];

const countryOptions = ['미국', '일본', '영국/유럽', '동남아', '중국/홍콩/대만', '기타'];

const industryOptions = [
  '소비재·라이프스타일',
  'IT·전자기기·IoT',
  '뷰티·헬스',
  '식품·음료',
  '패션·액세서리',
  'B2B 제조/기타',
];

const companySizeOptions = [
  '스타트업(초기)',
  '중소기업(~100억)',
  '중견기업(100억+)',
  '비공개',
];

const evaluationOptions = [
  { label: '실패 (<50%)', value: 'fail' },
  { label: '부분 성공 (50~79%)', value: 'partial' },
  { label: '성공 (80~99%)', value: 'success' },
  { label: '초과 달성 (100%+)', value: 'exceed' },
];

const voucherOptions = ['활용함', '미활용', '다음 예정'];
const followUpOptionsList = ['CF->커머스 전환', '추가 국가', '리텐션', '없음'];
const recontractOptions = ['높음', '보통', '낮음'];

const ecommercePlatformOptions = ['Shopify', 'Cafe24', 'Amazon', 'Rakuten', '기타'];

const defaultKPIs: KPIRow[] = [
  { label: '매출/펀딩액', targetValue: '', actualValue: '', memo: '' },
  { label: '후원자 수/주문 수', targetValue: '', actualValue: '', memo: '' },
  { label: '전환율', targetValue: '', actualValue: '', memo: '' },
  { label: '광고비 집행 총액', targetValue: '', actualValue: '', memo: '' },
  { label: 'ROI/ROAS', targetValue: '', actualValue: '', memo: '' },
];

const defaultPlatformResults: PlatformResultRow[] = [
  { platform: 'Kickstarter', funding: '', backers: '', conversion: '', roas: '', memo: '' },
  { platform: 'Indiegogo', funding: '', backers: '', conversion: '', roas: '', memo: '' },
  { platform: 'Wadiz', funding: '', backers: '', conversion: '', roas: '', memo: '' },
  { platform: 'Makuake', funding: '', backers: '', conversion: '', roas: '', memo: '' },
  { platform: '기타', funding: '', backers: '', conversion: '', roas: '', memo: '' },
];

const STORAGE_KEY = 'gtm_form_autosave';

const stepLabels = [
  '기본 정보',
  '목표·평가',
  '판단 기록',
  '성과 분석',
  '후속·서명',
];

function getInitialFormData(): FormData {
  return {
    projectName: '',
    pm: '',
    writeDate: today,
    startDate: '',
    endDate: '',
    endDateOngoing: false,
    channels: [],
    countries: [],
    industries: [],
    companySize: '',
    kpis: defaultKPIs.map((k) => ({ ...k })),
    evaluation: '',
    bestThing: '',
    worstThing: '',
    lesson: '',
    seedingTotal: '',
    seedingByTier: { nano: '', micro: '', mid: '', macro: '', mega: '' },
    seedingROI: '',
    topInfluencer: { name: '', platform: '', conversions: '' },
    seedingNotes: '',
    platformResults: defaultPlatformResults.map((r) => ({ ...r })),
    bestCreative: { name: '', roas: '' },
    worstCreative: { name: '', roas: '' },
    abTestInsight: '',
    ecommerceConverted: '',
    ecommercePlatforms: [],
    ecommerceRevenue: '',
    repeatConversion: '',
    aiPredictedAmount: '',
    aiActualAmount: '',
    aiModelFeedback: '',
    voucherUsage: '',
    followUpOptions: [],
    recontractChance: '',
    recontractReason: '',
    signPmName: '',
    signPmDate: today,
    signReviewerName: '',
    signReviewerDate: today,
  };
}

export function GTMForm({ onClose }: GTMFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));
  const [showSuccess, setShowSuccess] = useState(false);
  const [autoSaveMsg, setAutoSaveMsg] = useState(false);
  const [fadeDir, setFadeDir] = useState<'in' | 'out' | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formData, setFormData] = useState<FormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure new fields exist
        return { ...getInitialFormData(), ...parsed };
      }
    } catch { /* ignore */ }
    return getInitialFormData();
  });

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      setAutoSaveMsg(true);
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => setAutoSaveMsg(false), 2000);
    }, 30000);
    return () => {
      clearInterval(interval);
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [formData]);

  const update = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleArrayItem = useCallback((key: 'channels' | 'countries' | 'industries' | 'followUpOptions' | 'ecommercePlatforms', item: string) => {
    setFormData((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item],
      };
    });
  }, []);

  const updateKPI = useCallback((index: number, field: keyof KPIRow, value: string) => {
    setFormData((prev) => {
      const kpis = [...prev.kpis];
      kpis[index] = { ...kpis[index], [field]: value };
      return { ...prev, kpis };
    });
  }, []);

  const updatePlatformResult = useCallback((index: number, field: keyof PlatformResultRow, value: string) => {
    setFormData((prev) => {
      const platformResults = [...prev.platformResults];
      platformResults[index] = { ...platformResults[index], [field]: value };
      return { ...prev, platformResults };
    });
  }, []);

  const updateSeedingTier = useCallback((tier: keyof FormData['seedingByTier'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      seedingByTier: { ...prev.seedingByTier, [tier]: value },
    }));
  }, []);

  const updateTopInfluencer = useCallback((field: keyof FormData['topInfluencer'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      topInfluencer: { ...prev.topInfluencer, [field]: value },
    }));
  }, []);

  const updateCreative = useCallback((which: 'bestCreative' | 'worstCreative', field: 'name' | 'roas', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [which]: { ...(prev[which] as { name: string; roas: string }), [field]: value },
    }));
  }, []);

  const validate = (): string | null => {
    if (!formData.projectName.trim()) return '프로젝트명을 입력하세요.';
    if (!formData.pm.trim()) return '담당 PM을 입력하세요.';
    if (!formData.writeDate) return '작성일을 입력하세요.';
    if (!formData.startDate) return '프로젝트 시작일을 입력하세요.';
    if (!formData.endDateOngoing && !formData.endDate) return '프로젝트 종료일을 입력하거나 "진행 중"을 선택하세요.';
    if (!formData.kpis[0].targetValue.trim()) return '매출/펀딩액 목표값을 입력하세요.';
    if (!formData.kpis[0].actualValue.trim()) return '매출/펀딩액 실제 달성값을 입력하세요.';
    if (!formData.kpis[1].targetValue.trim()) return '후원자 수/주문 수 목표값을 입력하세요.';
    if (!formData.kpis[1].actualValue.trim()) return '후원자 수/주문 수 실제 달성값을 입력하세요.';
    if (!formData.evaluation) return '프로젝트 최종 평가를 선택하세요.';
    if (!formData.bestThing.trim()) return '가장 잘 된 것 1가지를 입력하세요.';
    if (!formData.worstThing.trim()) return '가장 실패한 것 1가지를 입력하세요.';
    if (!formData.lesson.trim()) return '다음 프로젝트 교훈을 입력하세요.';
    return null;
  };

  const handleSubmit = () => {
    const error = validate();
    if (error) {
      alert(error);
      return;
    }
    setShowSuccess(true);
    successTimer.current = setTimeout(() => {
      setShowSuccess(false);
      localStorage.removeItem(STORAGE_KEY);
      onClose();
    }, 3000);
  };

  const handleSuccessConfirm = () => {
    if (successTimer.current) clearTimeout(successTimer.current);
    setShowSuccess(false);
    localStorage.removeItem(STORAGE_KEY);
    onClose();
  };

  const goToStep = (step: number) => {
    setFadeDir('out');
    setTimeout(() => {
      setCurrentStep(step);
      setVisitedSteps((prev) => new Set([...prev, step]));
      setFadeDir('in');
      setTimeout(() => setFadeDir(null), 300);
    }, 200);
  };

  const nextStep = () => {
    if (currentStep < 4) goToStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) goToStep(currentStep - 1);
  };

  // AI prediction accuracy
  const aiAccuracy = (() => {
    const predicted = parseFloat(formData.aiPredictedAmount.replace(/[^0-9.]/g, ''));
    const actual = parseFloat(formData.aiActualAmount.replace(/[^0-9.]/g, ''));
    if (predicted > 0 && actual > 0) {
      return ((actual / predicted) * 100).toFixed(1) + '%';
    }
    return '-';
  })();

  const inputClass =
    'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff003b] focus:outline-none transition-colors';
  const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';
  const requiredStar = <span className="text-[#ff003b] ml-0.5">★</span>;
  const doubleRequiredStar = <span className="text-[#ff003b] ml-0.5">★</span>;

  const fadeClass =
    fadeDir === 'out'
      ? 'opacity-0 translate-y-2 transition-all duration-200'
      : fadeDir === 'in'
      ? 'opacity-100 translate-y-0 transition-all duration-300'
      : 'opacity-100 translate-y-0';

  // ─── STEP RENDERERS ───

  const renderStep1 = () => (
    <>
      {/* Section 1: 프로젝트 기본 정보 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 border-t-4 border-t-[#ff003b] p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">1. 프로젝트 기본 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>프로젝트명 {requiredStar}</label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => update('projectName', e.target.value)}
              className={inputClass}
              placeholder="예: 큐비오X 킥스타터 캠페인"
            />
          </div>
          <div>
            <label className={labelClass}>담당 PM {requiredStar}</label>
            <input
              type="text"
              value={formData.pm}
              onChange={(e) => update('pm', e.target.value)}
              className={inputClass}
              placeholder="이름"
            />
          </div>
          <div>
            <label className={labelClass}>작성일 {requiredStar}</label>
            <input
              type="date"
              value={formData.writeDate}
              onChange={(e) => update('writeDate', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>프로젝트 시작일 {requiredStar}</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => update('startDate', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>프로젝트 종료일 {requiredStar}</label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => update('endDate', e.target.value)}
                className={`${inputClass} ${formData.endDateOngoing ? 'opacity-50' : ''}`}
                disabled={formData.endDateOngoing}
              />
              <label className="flex items-center gap-2 whitespace-nowrap cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.endDateOngoing}
                  onChange={(e) => update('endDateOngoing', e.target.checked)}
                  className="w-4 h-4 text-[#ff003b] rounded"
                />
                <span className="text-sm text-gray-600">진행 중</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: GTM 채널 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">2. GTM 채널·유형</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {channelOptions.map((ch) => (
            <label key={ch} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={formData.channels.includes(ch)}
                onChange={() => toggleArrayItem('channels', ch)}
                className="w-4 h-4 text-[#ff003b] rounded"
              />
              <span className="text-sm text-gray-700">{ch}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Section 3: 진출 대상 국가 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">3. 진출 대상 국가</h2>
        <div className="flex flex-wrap gap-3">
          {countryOptions.map((c) => (
            <label key={c} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 transition-colors">
              <input
                type="checkbox"
                checked={formData.countries.includes(c)}
                onChange={() => toggleArrayItem('countries', c)}
                className="w-4 h-4 text-[#ff003b] rounded"
              />
              <span className="text-sm text-gray-700">{c}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Section 4: 클라이언트 업종 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">4. 클라이언트 업종</h2>
        <div className="flex flex-wrap gap-3">
          {industryOptions.map((ind) => (
            <label key={ind} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 transition-colors">
              <input
                type="checkbox"
                checked={formData.industries.includes(ind)}
                onChange={() => toggleArrayItem('industries', ind)}
                className="w-4 h-4 text-[#ff003b] rounded"
              />
              <span className="text-sm text-gray-700">{ind}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Section 5: 클라이언트 규모 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">5. 클라이언트 규모</h2>
        <div className="flex flex-wrap gap-3">
          {companySizeOptions.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 transition-colors">
              <input
                type="radio"
                name="companySize"
                checked={formData.companySize === opt}
                onChange={() => update('companySize', opt)}
                className="w-4 h-4 text-[#ff003b]"
              />
              <span className="text-sm text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      {/* Section 6: 목표 vs 실제 결과 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 border-t-4 border-t-[#ff003b] p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">6. 목표 vs 실제 결과</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left text-sm font-semibold text-gray-600 py-3 pr-4 w-[180px]">KPI</th>
                <th className="text-left text-sm font-semibold text-gray-600 py-3 pr-4">목표값</th>
                <th className="text-left text-sm font-semibold text-gray-600 py-3 pr-4">실제 달성값</th>
                <th className="text-left text-sm font-semibold text-gray-600 py-3">메모</th>
              </tr>
            </thead>
            <tbody>
              {formData.kpis.map((kpi, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-3 pr-4">
                    <span className="text-sm font-medium text-gray-800">
                      {kpi.label}
                      {idx < 2 && <span className="text-[#ff003b] ml-0.5">★</span>}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      value={kpi.targetValue}
                      onChange={(e) => updateKPI(idx, 'targetValue', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-[#ff003b] focus:outline-none"
                      placeholder={idx < 2 ? '필수' : '선택'}
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      value={kpi.actualValue}
                      onChange={(e) => updateKPI(idx, 'actualValue', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-[#ff003b] focus:outline-none"
                      placeholder={idx < 2 ? '필수' : '선택'}
                    />
                  </td>
                  <td className="py-3">
                    <input
                      type="text"
                      value={kpi.memo}
                      onChange={(e) => updateKPI(idx, 'memo', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-[#ff003b] focus:outline-none"
                      placeholder="비고"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 7: 프로젝트 최종 평가 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 border-t-4 border-t-[#ff003b] p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">7. 프로젝트 최종 평가 {requiredStar}</h2>
        <div className="flex flex-wrap gap-3">
          {evaluationOptions.map((opt) => (
            <label key={opt.value} className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg border-2 transition-all ${
              formData.evaluation === opt.value
                ? 'border-[#ff003b] bg-[#ff003b]/5 text-[#ff003b]'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}>
              <input
                type="radio"
                name="evaluation"
                checked={formData.evaluation === opt.value}
                onChange={() => update('evaluation', opt.value)}
                className="w-4 h-4 text-[#ff003b]"
              />
              <span className="text-sm font-medium">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      {/* Section 8: 핵심 판단 기록 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 border-t-4 border-t-[#ff003b] p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">8. 핵심 판단 기록</h2>
        <div className="space-y-5">
          <div>
            <label className={labelClass}>가장 잘 된 것 1가지 {doubleRequiredStar}</label>
            <textarea
              value={formData.bestThing}
              onChange={(e) => update('bestThing', e.target.value)}
              className={`${inputClass} min-h-[100px] resize-y`}
              placeholder="구체적으로 작성해주세요"
            />
          </div>
          <div>
            <label className={labelClass}>가장 실패한 것 1가지 {doubleRequiredStar}</label>
            <textarea
              value={formData.worstThing}
              onChange={(e) => update('worstThing', e.target.value)}
              className={`${inputClass} min-h-[100px] resize-y`}
              placeholder="구체적으로 작성해주세요"
            />
          </div>
          <div>
            <label className={labelClass}>다음 프로젝트 교훈 {doubleRequiredStar}</label>
            <textarea
              value={formData.lesson}
              onChange={(e) => update('lesson', e.target.value)}
              className={`${inputClass} min-h-[100px] resize-y`}
              placeholder="이번 프로젝트에서 배운 점을 정리해주세요"
            />
          </div>
        </div>
      </div>
    </>
  );

  const renderStep4 = () => (
    <>
      {/* New Section: 인플루언서 시딩 성과 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">9. 인플루언서 시딩 성과</h2>
        <div className="space-y-5">
          <div>
            <label className={labelClass}>총 시딩 인플루언서 수</label>
            <input
              type="number"
              value={formData.seedingTotal}
              onChange={(e) => update('seedingTotal', e.target.value)}
              className={inputClass}
              placeholder="숫자 입력"
            />
          </div>
          <div>
            <label className={labelClass}>Tier별 인원</label>
            <div className="grid grid-cols-5 gap-3">
              {([
                ['nano', '나노'],
                ['micro', '마이크로'],
                ['mid', '미드'],
                ['macro', '매크로'],
                ['mega', '메가'],
              ] as const).map(([key, label]) => (
                <div key={key}>
                  <span className="block text-xs text-gray-500 mb-1 text-center">{label}</span>
                  <input
                    type="number"
                    value={formData.seedingByTier[key]}
                    onChange={(e) => updateSeedingTier(key, e.target.value)}
                    className={inputClass}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>전체 시딩 ROI</label>
            <input
              type="text"
              value={formData.seedingROI}
              onChange={(e) => update('seedingROI', e.target.value)}
              className={inputClass}
              placeholder="예: 350%"
            />
          </div>
          <div>
            <label className={labelClass}>최고 전환 인플루언서</label>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={formData.topInfluencer.name}
                onChange={(e) => updateTopInfluencer('name', e.target.value)}
                className={inputClass}
                placeholder="이름"
              />
              <input
                type="text"
                value={formData.topInfluencer.platform}
                onChange={(e) => updateTopInfluencer('platform', e.target.value)}
                className={inputClass}
                placeholder="플랫폼"
              />
              <input
                type="text"
                value={formData.topInfluencer.conversions}
                onChange={(e) => updateTopInfluencer('conversions', e.target.value)}
                className={inputClass}
                placeholder="전환 수"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>시딩 관련 특이사항</label>
            <textarea
              value={formData.seedingNotes}
              onChange={(e) => update('seedingNotes', e.target.value)}
              className={`${inputClass} min-h-[80px] resize-y`}
              placeholder="특이사항을 기록해주세요"
            />
          </div>
        </div>
      </div>

      {/* New Section: 플랫폼별 성과 분리 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">10. 플랫폼별 성과 분리</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left text-sm font-semibold text-gray-600 py-3 pr-2 w-[110px]">플랫폼</th>
                <th className="text-left text-sm font-semibold text-gray-600 py-3 pr-2">펀딩액</th>
                <th className="text-left text-sm font-semibold text-gray-600 py-3 pr-2">백커 수</th>
                <th className="text-left text-sm font-semibold text-gray-600 py-3 pr-2">전환율</th>
                <th className="text-left text-sm font-semibold text-gray-600 py-3 pr-2">ROAS</th>
                <th className="text-left text-sm font-semibold text-gray-600 py-3">메모</th>
              </tr>
            </thead>
            <tbody>
              {formData.platformResults.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2 pr-2">
                    <span className="text-sm font-medium text-gray-800">{row.platform}</span>
                  </td>
                  {(['funding', 'backers', 'conversion', 'roas', 'memo'] as const).map((field) => (
                    <td key={field} className="py-2 pr-2">
                      <input
                        type="text"
                        value={row[field]}
                        onChange={(e) => updatePlatformResult(idx, field, e.target.value)}
                        className="w-full px-2 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-[#ff003b] focus:outline-none"
                        placeholder="-"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Section: 광고 소재별 성과 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">11. 광고 소재별 성과</h2>
        <div className="space-y-5">
          <div>
            <label className={labelClass}>최고 ROAS 소재</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.bestCreative.name}
                onChange={(e) => updateCreative('bestCreative', 'name', e.target.value)}
                className={inputClass}
                placeholder="소재명"
              />
              <input
                type="text"
                value={formData.bestCreative.roas}
                onChange={(e) => updateCreative('bestCreative', 'roas', e.target.value)}
                className={inputClass}
                placeholder="ROAS 수치"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>최저 ROAS 소재</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.worstCreative.name}
                onChange={(e) => updateCreative('worstCreative', 'name', e.target.value)}
                className={inputClass}
                placeholder="소재명"
              />
              <input
                type="text"
                value={formData.worstCreative.roas}
                onChange={(e) => updateCreative('worstCreative', 'roas', e.target.value)}
                className={inputClass}
                placeholder="ROAS 수치"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>A/B 테스트 핵심 인사이트</label>
            <textarea
              value={formData.abTestInsight}
              onChange={(e) => update('abTestInsight', e.target.value)}
              className={`${inputClass} min-h-[80px] resize-y`}
              placeholder="테스트 결과에서 얻은 핵심 인사이트를 작성해주세요"
            />
          </div>
        </div>
      </div>

      {/* New Section: 이커머스 전환 추적 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">12. 이커머스 전환 추적</h2>
        <div className="space-y-5">
          <div>
            <label className={labelClass}>펀딩 → 이커머스 전환 여부</label>
            <div className="flex flex-wrap gap-3">
              {['전환함', '미전환', '예정'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="ecommerceConverted"
                    checked={formData.ecommerceConverted === opt}
                    onChange={() => update('ecommerceConverted', opt)}
                    className="w-4 h-4 text-[#ff003b]"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>이커머스 플랫폼</label>
            <div className="flex flex-wrap gap-3">
              {ecommercePlatformOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.ecommercePlatforms.includes(opt)}
                    onChange={() => toggleArrayItem('ecommercePlatforms', opt)}
                    className="w-4 h-4 text-[#ff003b] rounded"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>이커머스 매출</label>
            <input
              type="text"
              value={formData.ecommerceRevenue}
              onChange={(e) => update('ecommerceRevenue', e.target.value)}
              className={inputClass}
              placeholder="예: $50,000"
            />
          </div>
          <div>
            <label className={labelClass}>백커 → 리피트 전환율</label>
            <input
              type="text"
              value={formData.repeatConversion}
              onChange={(e) => update('repeatConversion', e.target.value)}
              className={inputClass}
              placeholder="예: 12.5%"
            />
          </div>
        </div>
      </div>

      {/* New Section: AI 예측 vs 실제 비교 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">13. AI 예측 vs 실제 비교</h2>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>AI 예측 펀딩액</label>
              <input
                type="text"
                value={formData.aiPredictedAmount}
                onChange={(e) => update('aiPredictedAmount', e.target.value)}
                className={inputClass}
                placeholder="예: $100,000"
              />
            </div>
            <div>
              <label className={labelClass}>실제 펀딩액</label>
              <input
                type="text"
                value={formData.aiActualAmount}
                onChange={(e) => update('aiActualAmount', e.target.value)}
                className={inputClass}
                placeholder="예: $120,000"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>예측 정확도</label>
            <div className="px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-700 font-semibold">
              {aiAccuracy}
            </div>
          </div>
          <div>
            <label className={labelClass}>예측 모델 피드백</label>
            <textarea
              value={formData.aiModelFeedback}
              onChange={(e) => update('aiModelFeedback', e.target.value)}
              className={`${inputClass} min-h-[80px] resize-y`}
              placeholder="모델이 놓친 변수, 개선점 등을 기록해주세요"
            />
          </div>
        </div>
      </div>
    </>
  );

  const renderStep5 = () => (
    <>
      {/* Section 9: 수출바우처 & 후속 기회 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">14. 수출바우처 & 후속 기회</h2>
        <div className="space-y-5">
          <div>
            <label className={labelClass}>수출바우처 활용</label>
            <div className="flex flex-wrap gap-3">
              {voucherOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="voucher"
                    checked={formData.voucherUsage === opt}
                    onChange={() => update('voucherUsage', opt)}
                    className="w-4 h-4 text-[#ff003b]"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>후속 프로젝트 가능성</label>
            <div className="flex flex-wrap gap-3">
              {followUpOptionsList.map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.followUpOptions.includes(opt)}
                    onChange={() => toggleArrayItem('followUpOptions', opt)}
                    className="w-4 h-4 text-[#ff003b] rounded"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>클라이언트 재계약 가능성</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {recontractOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="recontract"
                    checked={formData.recontractChance === opt}
                    onChange={() => update('recontractChance', opt)}
                    className="w-4 h-4 text-[#ff003b]"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
            <input
              type="text"
              value={formData.recontractReason}
              onChange={(e) => update('recontractReason', e.target.value)}
              className={inputClass}
              placeholder="이유 (선택)"
            />
          </div>
        </div>
      </div>

      {/* Section 10: 서명 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-5">15. 서명</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>작성 PM 이름</label>
            <input
              type="text"
              value={formData.signPmName}
              onChange={(e) => update('signPmName', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>일자</label>
            <input
              type="date"
              value={formData.signPmDate}
              onChange={(e) => update('signPmDate', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>검토자 이름</label>
            <input
              type="text"
              value={formData.signReviewerName}
              onChange={(e) => update('signReviewerName', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>일자</label>
            <input
              type="date"
              value={formData.signReviewerDate}
              onChange={(e) => update('signReviewerDate', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </>
  );

  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];

  return (
    <div className="fixed inset-0 z-[100] bg-[#F5F7FA] overflow-y-auto">
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md mx-4 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">요청이 완료되었습니다.</p>
            <p className="text-gray-500 mb-6">담당자가 확인 후 연락드리겠습니다.</p>
            <button
              onClick={handleSuccessConfirm}
              className="px-8 py-3 bg-[#ff003b] text-white rounded-xl font-semibold hover:bg-[#cc0030] transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-600 hover:text-[#ff003b] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">돌아가기</span>
          </button>
          <div className="flex items-center gap-2">
            <img src="/setoworks_logo.png" alt="SETOWORKS" className="h-5" />
            {autoSaveMsg && (
              <span className="text-xs text-green-500 ml-2 animate-pulse">자동 저장됨</span>
            )}
          </div>
          <div className="w-[100px]" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GTM 프로젝트 실행 기록부</h1>
          <p className="text-gray-500">FORM-1 | 1단계 필수 기입형</p>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            {stepLabels.map((label, idx) => {
              const isActive = idx === currentStep;
              const isVisited = visitedSteps.has(idx) && idx !== currentStep;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center relative">
                  {/* Connector line */}
                  {idx > 0 && (
                    <div
                      className={`absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                        visitedSteps.has(idx) ? 'bg-[#ff003b]' : 'bg-gray-200'
                      }`}
                      style={{ zIndex: 0 }}
                    />
                  )}
                  <button
                    onClick={() => goToStep(idx)}
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-[#ff003b] text-white shadow-lg scale-110'
                        : isVisited
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isVisited ? <Check className="w-4 h-4" /> : idx + 1}
                  </button>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isActive ? 'text-[#ff003b]' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className={fadeClass}>
          {stepRenderers[currentStep]()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pb-12">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold transition-colors ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            이전
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-8 py-3.5 bg-[#ff003b] text-white rounded-xl font-semibold hover:bg-[#cc0030] transition-colors shadow-lg hover:shadow-xl"
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-8 py-3.5 bg-[#ff003b] text-white rounded-xl font-semibold hover:bg-[#cc0030] transition-colors shadow-lg hover:shadow-xl"
            >
              요청 완료
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
