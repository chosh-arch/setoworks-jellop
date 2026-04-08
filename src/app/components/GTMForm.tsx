import { useState } from 'react';
import { ArrowLeft, Download, Save } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType, BorderStyle, Footer } from 'docx';
import { saveAs } from 'file-saver';

interface GTMFormProps {
  onClose: () => void;
}

interface KPIRow {
  label: string;
  targetValue: string;
  actualValue: string;
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

const defaultKPIs: KPIRow[] = [
  { label: '매출/펀딩액', targetValue: '', actualValue: '', memo: '' },
  { label: '후원자 수/주문 수', targetValue: '', actualValue: '', memo: '' },
  { label: '전환율', targetValue: '', actualValue: '', memo: '' },
  { label: '광고비 집행 총액', targetValue: '', actualValue: '', memo: '' },
  { label: 'ROI/ROAS', targetValue: '', actualValue: '', memo: '' },
];

export function GTMForm({ onClose }: GTMFormProps) {
  const [formData, setFormData] = useState<FormData>({
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
    voucherUsage: '',
    followUpOptions: [],
    recontractChance: '',
    recontractReason: '',
    signPmName: '',
    signPmDate: today,
    signReviewerName: '',
    signReviewerDate: today,
  });

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: 'channels' | 'countries' | 'industries' | 'followUpOptions', item: string) => {
    setFormData((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item],
      };
    });
  };

  const updateKPI = (index: number, field: keyof KPIRow, value: string) => {
    setFormData((prev) => {
      const kpis = [...prev.kpis];
      kpis[index] = { ...kpis[index], [field]: value };
      return { ...prev, kpis };
    });
  };

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

  const handleTempSave = () => {
    localStorage.setItem('gtm_form_temp', JSON.stringify(formData));
    alert('임시 저장되었습니다.');
  };

  const generateDocx = async () => {
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    const cb = (checked: boolean) => (checked ? '\u2611' : '\u2610');

    const sectionTitle = (text: string) =>
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 28, color: 'ff003b' })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      });

    const labelValue = (label: string, value: string) =>
      new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true, size: 22 }),
          new TextRun({ text: value, size: 22 }),
        ],
        spacing: { after: 100 },
      });

    const checkboxLine = (items: string[], selected: string[]) =>
      new Paragraph({
        children: items.map(
          (item) =>
            new TextRun({ text: `${cb(selected.includes(item))} ${item}   `, size: 20 })
        ),
        spacing: { after: 100 },
      });

    const noBorder = {
      top: { style: BorderStyle.NONE, size: 0 },
      bottom: { style: BorderStyle.NONE, size: 0 },
      left: { style: BorderStyle.NONE, size: 0 },
      right: { style: BorderStyle.NONE, size: 0 },
    } as const;

    const thinBorder = {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
    } as const;

    const kpiTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: ['KPI', '목표값', '실제 달성값', '메모'].map(
            (h) =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20 })] })],
                width: { size: 25, type: WidthType.PERCENTAGE },
                borders: thinBorder,
              })
          ),
        }),
        ...formData.kpis.map(
          (kpi) =>
            new TableRow({
              children: [kpi.label, kpi.targetValue || '-', kpi.actualValue || '-', kpi.memo || '-'].map(
                (val) =>
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: val, size: 20 })] })],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    borders: thinBorder,
                  })
              ),
            })
        ),
      ],
    });

    const evalLabel = evaluationOptions.find((e) => e.value === formData.evaluation)?.label || '';

    const doc = new Document({
      sections: [
        {
          properties: {},
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'SETOWORKS GROUP | GTM Project Intelligence Record | \uae30\ubc00',
                      size: 16,
                      color: '999999',
                    }),
                  ],
                }),
              ],
            }),
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'SETOWORKS GROUP | FORM-1', bold: true, size: 32, color: 'ff003b' })],
              spacing: { after: 100 },
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'GTM \ud504\ub85c\uc81d\ud2b8 \uc2e4\ud589 \uae30\ub85d\ubd80 \u2014 1\ub2e8\uacc4 \ud544\uc218 \uae30\uc785\ud615',
                  size: 24,
                  color: '666666',
                }),
              ],
              spacing: { after: 400 },
            }),

            // Section 1
            sectionTitle('1. \ud504\ub85c\uc81d\ud2b8 \uae30\ubcf8 \uc815\ubcf4'),
            labelValue('\ud504\ub85c\uc81d\ud2b8\uba85', formData.projectName),
            labelValue('\ub2f4\ub2f9 PM', formData.pm),
            labelValue('\uc791\uc131\uc77c', formData.writeDate),
            labelValue('\ud504\ub85c\uc81d\ud2b8 \uc2dc\uc791\uc77c', formData.startDate),
            labelValue('\ud504\ub85c\uc81d\ud2b8 \uc885\ub8cc\uc77c', formData.endDateOngoing ? '\uc9c4\ud589 \uc911' : formData.endDate),

            // Section 2
            sectionTitle('2. GTM \ucc44\ub110\xb7\uc720\ud615'),
            checkboxLine(channelOptions, formData.channels),

            // Section 3
            sectionTitle('3. \uc9c4\ucd9c \ub300\uc0c1 \uad6d\uac00'),
            checkboxLine(countryOptions, formData.countries),

            // Section 4
            sectionTitle('4. \ud074\ub77c\uc774\uc5b8\ud2b8 \uc5c5\uc885'),
            checkboxLine(industryOptions, formData.industries),

            // Section 5
            sectionTitle('5. \ud074\ub77c\uc774\uc5b8\ud2b8 \uaddc\ubaa8'),
            new Paragraph({
              children: companySizeOptions.map(
                (opt) =>
                  new TextRun({
                    text: `${cb(formData.companySize === opt)} ${opt}   `,
                    size: 20,
                  })
              ),
              spacing: { after: 100 },
            }),

            // Section 6
            sectionTitle('6. \ubaa9\ud45c vs \uc2e4\uc81c \uacb0\uacfc'),
            kpiTable,

            // Section 7
            sectionTitle('7. \ud504\ub85c\uc81d\ud2b8 \ucd5c\uc885 \ud3c9\uac00'),
            new Paragraph({
              children: evaluationOptions.map(
                (opt) =>
                  new TextRun({
                    text: `${cb(formData.evaluation === opt.value)} ${opt.label}   `,
                    size: 20,
                  })
              ),
              spacing: { after: 100 },
            }),

            // Section 8
            sectionTitle('8. \ud575\uc2ec \ud310\ub2e8 \uae30\ub85d'),
            labelValue('\uac00\uc7a5 \uc798 \ub41c \uac83 1\uac00\uc9c0', formData.bestThing),
            labelValue('\uac00\uc7a5 \uc2e4\ud328\ud55c \uac83 1\uac00\uc9c0', formData.worstThing),
            labelValue('\ub2e4\uc74c \ud504\ub85c\uc81d\ud2b8 \uad50\ud6c8', formData.lesson),

            // Section 9
            sectionTitle('9. \uc218\ucd9c\ubc14\uc6b0\ucc98 & \ud6c4\uc18d \uae30\ud68c'),
            new Paragraph({
              children: [
                new TextRun({ text: '\uc218\ucd9c\ubc14\uc6b0\ucc98 \ud65c\uc6a9: ', bold: true, size: 20 }),
                ...voucherOptions.map(
                  (opt) => new TextRun({ text: `${cb(formData.voucherUsage === opt)} ${opt}   `, size: 20 })
                ),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '\ud6c4\uc18d \ud504\ub85c\uc81d\ud2b8: ', bold: true, size: 20 }),
                ...followUpOptionsList.map(
                  (opt) =>
                    new TextRun({
                      text: `${cb(formData.followUpOptions.includes(opt))} ${opt}   `,
                      size: 20,
                    })
                ),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '\ud074\ub77c\uc774\uc5b8\ud2b8 \uc7ac\uacc4\uc57d: ', bold: true, size: 20 }),
                ...recontractOptions.map(
                  (opt) =>
                    new TextRun({ text: `${cb(formData.recontractChance === opt)} ${opt}   `, size: 20 })
                ),
              ],
              spacing: { after: 50 },
            }),
            ...(formData.recontractReason
              ? [labelValue('\uc774\uc720', formData.recontractReason)]
              : []),

            // Section 10
            sectionTitle('10. \uc11c\uba85'),
            labelValue('\uc791\uc131 PM', `${formData.signPmName}   \uc77c\uc790: ${formData.signPmDate}`),
            labelValue('\uac80\ud1a0\uc790', `${formData.signReviewerName}   \uc77c\uc790: ${formData.signReviewerDate}`),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const dateStr = formData.writeDate.replace(/-/g, '');
    saveAs(blob, `\uc138\ud1a0\uc6cd\uc2a4_GTM\uae30\ub85d\ubd80_${formData.projectName}_${dateStr}.docx`);
  };

  // Try to load temp save
  const loadTemp = () => {
    const saved = localStorage.getItem('gtm_form_temp');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFormData(data);
      } catch {
        // ignore
      }
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#ff003b] focus:ring-1 focus:ring-[#ff003b] focus:outline-none transition-colors';
  const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';
  const requiredStar = <span className="text-[#ff003b] ml-0.5">*</span>;
  const doubleRequiredStar = <span className="text-[#ff003b] ml-0.5">**</span>;

  return (
    <div className="fixed inset-0 z-[100] bg-[#F5F7FA] overflow-y-auto">
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
          </div>
          <button
            onClick={loadTemp}
            className="text-sm text-gray-500 hover:text-[#ff003b] transition-colors"
          >
            임시저장 불러오기
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GTM 프로젝트 실행 기록부</h1>
          <p className="text-gray-500">FORM-1 | 1단계 필수 기입형</p>
        </div>

        {/* Section 1: 프로젝트 기본 정보 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-[#ff003b] p-6 mb-6">
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

        {/* Section 2: GTM 채널·유형 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
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

        {/* Section 6: 목표 vs 실제 결과 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-[#ff003b] p-6 mb-6">
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
                        {idx < 2 && <span className="text-[#ff003b] ml-0.5">*</span>}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <input
                        type="text"
                        value={kpi.targetValue}
                        onChange={(e) => updateKPI(idx, 'targetValue', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#ff003b] focus:outline-none"
                        placeholder={idx < 2 ? '필수' : '선택'}
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <input
                        type="text"
                        value={kpi.actualValue}
                        onChange={(e) => updateKPI(idx, 'actualValue', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#ff003b] focus:outline-none"
                        placeholder={idx < 2 ? '필수' : '선택'}
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="text"
                        value={kpi.memo}
                        onChange={(e) => updateKPI(idx, 'memo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#ff003b] focus:outline-none"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-[#ff003b] p-6 mb-6">
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

        {/* Section 8: 핵심 판단 기록 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-[#ff003b] p-6 mb-6">
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

        {/* Section 9: 수출바우처 & 후속 기회 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">9. 수출바우처 & 후속 기회</h2>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-5">10. 서명</h2>
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

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 pb-12">
          <button
            onClick={handleTempSave}
            className="flex items-center gap-2 px-8 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            <Save className="w-5 h-5" />
            임시 저장
          </button>
          <button
            onClick={generateDocx}
            className="flex items-center gap-2 px-8 py-3.5 bg-[#ff003b] text-white rounded-xl font-semibold hover:bg-[#cc0030] transition-colors shadow-lg hover:shadow-xl"
          >
            <Download className="w-5 h-5" />
            완료 및 다운로드
          </button>
        </div>
      </div>
    </div>
  );
}
