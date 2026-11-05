import React from 'react';
import { Check, Compass } from 'lucide-react';
import { LessonStage, LanguageCode } from '../../types/lesson';
import { getLocalizedStage } from '../../utils/lessonLocalization';

interface StageProgressBarProps {
  stages: LessonStage[];
  currentStageId: string;
  studentLanguage: LanguageCode;
  isDefaultLesson?: boolean;
}

export const StageProgressBar: React.FC<StageProgressBarProps> = ({
  stages,
  currentStageId,
  studentLanguage,
  isDefaultLesson = false,
}) => {
  const currentIdx = stages.findIndex((s) => s.id === currentStageId);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  const headerLabels: Record<LanguageCode, { title: string; currentTag: string; stepUnit: string }> = {
    en: { title: 'Classroom Progress', currentTag: 'We are here!', stepUnit: 'Stage' },
    vi: { title: 'Tiến trình lớp học', currentTag: 'Đang ở đây!', stepUnit: 'Giai đoạn' },
    ru: { title: 'Ход урока', currentTag: 'Мы здесь!', stepUnit: 'Этап' },
    'uz-Latn': { title: 'Dars bosqichlari', currentTag: 'Hozir shu yerda!', stepUnit: 'Bosqich' },
    'uz-Cyrl': { title: 'Дарс босқичлари', currentTag: 'Ҳозир шу ерда!', stepUnit: 'Босқич' },
    'zh-Hans': { title: '课堂进程', currentTag: '正进行到这里！', stepUnit: '环节' },
    'zh-Hant': { title: '課堂進程', currentTag: '正進行到這裡！', stepUnit: '環節' },
    ko: { title: '수업 진행 순서', currentTag: '지금 여기!', stepUnit: '단계' },
  };

  const labels = headerLabels[studentLanguage] || headerLabels.en;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-slate-800">
            {labels.title}
          </span>
          {studentLanguage !== 'ko' && (
            <span className="text-[11px] text-slate-400">수업 진행</span>
          )}
        </div>
        <div className="text-xs text-slate-500 font-medium">
          <span className="font-bold text-amber-700">{activeIdx + 1}</span>
          <span> / {stages.length} {labels.stepUnit}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {stages.map((stage, idx) => {
          const isCurrent = stage.id === currentStageId;
          const isPast = idx < activeIdx;
          const localized = isDefaultLesson ? getLocalizedStage(stage.id, studentLanguage) : null;
          const nativeTitle = localized?.title || stage.title;

          return (
            <div
              key={stage.id}
              className={`flex flex-col p-2.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'border-amber-400 bg-amber-50/80 shadow-xs ring-2 ring-amber-400/30'
                  : isPast
                  ? 'border-emerald-200 bg-emerald-50/40 text-slate-600'
                  : 'border-slate-100 bg-slate-50/60 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isCurrent
                      ? 'bg-amber-500 text-white'
                      : isPast
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isPast ? <Check className="w-2.5 h-2.5 inline" /> : `${idx + 1}`}
                </span>
                {isCurrent && (
                  <span className="text-[10px] font-bold text-amber-700 animate-pulse">
                    {labels.currentTag}
                  </span>
                )}
              </div>

              {/* Native title prominent on top */}
              <span
                className={`text-xs font-bold truncate ${
                  isCurrent ? 'text-slate-900' : isPast ? 'text-slate-700' : 'text-slate-500'
                }`}
                title={nativeTitle}
              >
                {nativeTitle}
              </span>

              {/* Korean title as classroom reference */}
              {studentLanguage !== 'ko' && (
                <span className="text-[10px] text-slate-400 truncate mt-0.5">
                  {stage.title}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
