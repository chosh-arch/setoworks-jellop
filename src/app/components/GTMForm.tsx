import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle, X } from 'lucide-react';

interface GTMFormProps {
  onClose: () => void;
}

interface FormData {
  // Step 1: 기본 정보
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  productName: string;
  productOneLiner: string;
  productCategory: string;
  productDescription: string;
  expectedPrice: string;
  // Step 2: 펀딩 계획
  platforms: string[];
  countries: string[];
  startTiming: string;
  fundingGoal: string;
  budgetRange: string;
  hasFundingExperience: string;
  fundingExperienceDetail: string;
  // Step 3: 필요 서비스
  services: string[];
  additionalNotes: string;
  referralSource: string;
}

const categoryOptions = [
  'IT·전자기기',
  '라이프스타일',
  '뷰티·헬스',
  '식품·음료',
  '패션·액세서리',
  '가구·인테리어',
  '아웃도어·스포츠',
  '기타',
];

const platformOptions = ['Kickstarter', 'Indiegogo', 'Wadiz', 'Makuake', '기타'];

const countryOptions = ['미국', '일본', '대만', '유럽', '동남아', '한국', '기타'];

const timingOptions = ['즉시', '1개월 내', '3개월 내', '6개월 내', '미정'];

const budgetOptions = [
  '500만원 미만',
  '500~1,000만원',
  '1,000~3,000만원',
  '3,000만원 이상',
  '협의 필요',
];

const serviceOptions = [
  '사전 예측 리포트 (AI 기반 펀딩 예측)',
  '인플루언서 시딩 (제품 리뷰/홍보)',
  '광고 운영 (Meta/Google 퍼포먼스)',
  '랜딩 페이지 제작',
  '영상 제작 (제품 소개/광고)',
  '풀스택 패키지 (전체 대행)',
  '이커머스 전환 (펀딩 후 커머스)',
  '기타',
];

const referralOptions = ['검색', '지인 추천', 'SNS', '기존 고객', '기타'];

const stepLabels = ['기본 정보', '펀딩 계획', '필요 서비스'];

function getInitialFormData(): FormData {
  return {
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    productName: '',
    productOneLiner: '',
    productCategory: '',
    productDescription: '',
    expectedPrice: '',
    platforms: [],
    countries: [],
    startTiming: '',
    fundingGoal: '',
    budgetRange: '',
    hasFundingExperience: '',
    fundingExperienceDetail: '',
    services: [],
    additionalNotes: '',
    referralSource: '',
  };
}

export function GTMForm({ onClose }: GTMFormProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(getInitialFormData);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const toggleArrayItem = (key: 'platforms' | 'countries' | 'services', item: string) => {
    setForm((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item],
      };
    });
  };

  const validateStep = (s: number): boolean => {
    const errs: Record<string, boolean> = {};
    if (s === 0) {
      if (!form.companyName.trim()) errs.companyName = true;
      if (!form.contactName.trim()) errs.contactName = true;
      if (!form.phone.trim()) errs.phone = true;
      if (!form.email.trim()) errs.email = true;
      if (!form.productName.trim()) errs.productName = true;
      if (!form.productOneLiner.trim()) errs.productOneLiner = true;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, 2));
  };
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = () => {
    if (!validateStep(step)) return;
    const entry = {
      id: Date.now().toString(),
      ...form,
      submitDate: new Date().toISOString().split('T')[0],
      status: 'submitted',
    };
    const stored = localStorage.getItem('gtm_applications');
    let apps: unknown[] = [];
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) apps = parsed;
      } catch { /* ignore */ }
    }
    apps.push(entry);
    localStorage.setItem('gtm_applications', JSON.stringify(apps));
    setShowSuccess(true);
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  // --- Render helpers ---

  const label = (text: string, required?: boolean) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {text}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );

  const inputCls = (key: string) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition ${
      errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  const checkboxBtn = (
    items: string[],
    selected: string[],
    toggle: (item: string) => void,
  ) => (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <button
            key={item}
            type="button"
            onClick={() => toggle(item)}
            className={`px-3.5 py-2 rounded-lg text-sm border transition ${
              active
                ? 'bg-red-50 border-red-400 text-red-700 font-medium'
                : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            {active && <Check className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
            {item}
          </button>
        );
      })}
    </div>
  );

  // --- Steps ---

  const renderStep0 = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          {label('회사명', true)}
          <input
            className={inputCls('companyName')}
            value={form.companyName}
            onChange={(e) => set('companyName', e.target.value)}
            placeholder="예: 세토웍스"
          />
        </div>
        <div>
          {label('담당자명', true)}
          <input
            className={inputCls('contactName')}
            value={form.contactName}
            onChange={(e) => set('contactName', e.target.value)}
            placeholder="예: 홍길동"
          />
        </div>
        <div>
          {label('연락처', true)}
          <input
            className={inputCls('phone')}
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="예: 010-1234-5678"
          />
        </div>
        <div>
          {label('이메일', true)}
          <input
            type="email"
            className={inputCls('email')}
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="예: contact@company.com"
          />
        </div>
      </div>

      <div>
        {label('제품명', true)}
        <input
          className={inputCls('productName')}
          value={form.productName}
          onChange={(e) => set('productName', e.target.value)}
          placeholder="예: 스마트 미니 프로젝터 X1"
        />
      </div>

      <div>
        {label('제품 한 줄 설명', true)}
        <input
          className={inputCls('productOneLiner')}
          value={form.productOneLiner}
          onChange={(e) => set('productOneLiner', e.target.value.slice(0, 100))}
          placeholder="100자 이내로 제품을 소개해주세요"
          maxLength={100}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{form.productOneLiner.length}/100</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          {label('제품 카테고리')}
          <select
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
            value={form.productCategory}
            onChange={(e) => set('productCategory', e.target.value)}
          >
            <option value="">선택해주세요</option>
            {categoryOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          {label('예상 판매 가격')}
          <input
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            value={form.expectedPrice}
            onChange={(e) => set('expectedPrice', e.target.value)}
            placeholder='예: 39,000원 또는 $49'
          />
        </div>
      </div>

      <div>
        {label('제품 상세 설명')}
        <textarea
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          rows={3}
          value={form.productDescription}
          onChange={(e) => set('productDescription', e.target.value)}
          placeholder="제품의 특징, 타겟 고객, 차별점 등을 자유롭게 적어주세요 (선택)"
        />
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        {label('희망 펀딩 플랫폼')}
        {checkboxBtn(platformOptions, form.platforms, (item) => toggleArrayItem('platforms', item))}
      </div>

      <div>
        {label('진출 희망 국가')}
        {checkboxBtn(countryOptions, form.countries, (item) => toggleArrayItem('countries', item))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          {label('희망 시작 시기')}
          <select
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
            value={form.startTiming}
            onChange={(e) => set('startTiming', e.target.value)}
          >
            <option value="">선택해주세요</option>
            {timingOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          {label('목표 펀딩액')}
          <input
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            value={form.fundingGoal}
            onChange={(e) => set('fundingGoal', e.target.value)}
            placeholder='예: 1억원 또는 $100,000'
          />
        </div>
      </div>

      <div>
        {label('예산 범위')}
        <select
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
          value={form.budgetRange}
          onChange={(e) => set('budgetRange', e.target.value)}
        >
          <option value="">선택해주세요</option>
          {budgetOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <div>
        {label('기존 펀딩 경험')}
        <div className="flex gap-4">
          {['있음', '없음'].map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="fundingExp"
                checked={form.hasFundingExperience === opt}
                onChange={() => {
                  set('hasFundingExperience', opt);
                  if (opt === '없음') set('fundingExperienceDetail', '');
                }}
                className="w-4 h-4 text-red-500 focus:ring-red-400"
              />
              <span className="text-sm text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {form.hasFundingExperience === '있음' && (
        <div>
          {label('기존 경험 상세')}
          <textarea
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            rows={3}
            value={form.fundingExperienceDetail}
            onChange={(e) => set('fundingExperienceDetail', e.target.value)}
            placeholder="이전 펀딩 플랫폼, 달성 금액, 경험 등을 알려주세요"
          />
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        {label('희망 서비스')}
        {checkboxBtn(serviceOptions, form.services, (item) => toggleArrayItem('services', item))}
      </div>

      <div>
        {label('추가 요청사항')}
        <textarea
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          rows={3}
          value={form.additionalNotes}
          onChange={(e) => set('additionalNotes', e.target.value)}
          placeholder="궁금한 점이나 요청사항이 있으면 자유롭게 적어주세요 (선택)"
        />
      </div>

      <div>
        {label('어떻게 세토웍스를 알게 되셨나요?')}
        <select
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
          value={form.referralSource}
          onChange={(e) => set('referralSource', e.target.value)}
        >
          <option value="">선택해주세요</option>
          {referralOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
    </div>
  );

  // --- Success Modal ---
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md mx-4 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-9 h-9 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">신청이 완료되었습니다</h3>
          <p className="text-gray-500 text-sm mb-6">
            입력하신 연락처로 24시간 내 담당자가 연락드리겠습니다.
          </p>
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-[#ff003b] text-white rounded-lg font-medium hover:bg-red-600 transition"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  // --- Main Form ---
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-start justify-center overflow-y-auto py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl mx-4 my-4">
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#ff003b] rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="font-bold text-sm tracking-widest text-gray-800">SETOWORKS</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">프로젝트 의뢰 신청서</h2>
          <p className="text-sm text-gray-500">
            간단한 정보를 입력하시면 담당자가 24시간 내 연락드립니다
          </p>
        </div>

        {/* Progress Bar */}
        <div className="px-8 py-4">
          <div className="flex items-center gap-2">
            {stepLabels.map((sl, i) => (
              <div key={sl} className="flex-1 flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        i < step
                          ? 'bg-[#ff003b] text-white'
                          : i === step
                          ? 'bg-[#ff003b] text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        i <= step ? 'text-gray-800' : 'text-gray-400'
                      }`}
                    >
                      {sl}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        i <= step ? 'bg-[#ff003b]' : 'bg-gray-200'
                      }`}
                      style={{ width: i < step ? '100%' : i === step ? '50%' : '0%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-8 py-6">
          <div className="bg-gray-50 rounded-xl p-6">
            {step === 0 && renderStep0()}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-8 pb-8 flex justify-between">
          {step > 0 ? (
            <button
              onClick={goPrev}
              className="flex items-center gap-1.5 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              이전
            </button>
          ) : (
            <div />
          )}

          {step < 2 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#ff003b] text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
            >
              다음
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#ff003b] text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
            >
              <CheckCircle className="w-4 h-4" />
              신청 완료
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
