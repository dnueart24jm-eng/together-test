import React from 'react';
import {
  Globe,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Languages,
  X,
} from 'lucide-react';
import {
  LanguageCode,
  KoreanLevel,
} from '../types/lesson';
import {
  SUPPORTED_LANGUAGES,
  KOREAN_LEVELS,
  UI_STRINGS,
} from '../utils/i18n';

interface LanguageLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: LanguageCode;
  selectedLevel: KoreanLevel;
  onSave: (lang: LanguageCode, level: KoreanLevel) => void;
  isInitialSetup?: boolean;
}

export const LanguageLevelModal: React.FC<LanguageLevelModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  selectedLevel,
  onSave,
  isInitialSetup = false,
}) => {
  const [tempLang, setTempLang] = React.useState<LanguageCode>(selectedLanguage);
  const [tempLevel, setTempLevel] = React.useState<KoreanLevel>(selectedLevel);

  React.useEffect(() => {
    setTempLang(selectedLanguage);
    setTempLevel(selectedLevel);
  }, [selectedLanguage, selectedLevel, isOpen]);

  if (!isOpen) return null;

  const currentUi = UI_STRINGS[tempLang] || UI_STRINGS.en;
  const levelOptions = KOREAN_LEVELS[tempLang] || KOREAN_LEVELS.en;

  const handleApply = () => {
    onSave(tempLang, tempLevel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-amber-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isInitialSetup ? '환영해요! 언어를 선택해 주세요' : '언어 및 한국어 수준 설정'}
              </h2>
              <p className="text-xs text-slate-500">
                Choose your native language and Korean learning level
              </p>
            </div>
          </div>
          {!isInitialSetup && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Language selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-600" />
                <span>내가 편한 모국어 (Native Language)</span>
              </label>
              <span className="text-xs text-slate-500">
                기본 언어: English (언제든 변경 가능)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = tempLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setTempLang(lang.code)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/80 shadow-xs ring-1 ring-sky-500'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm font-bold text-slate-800">
                      {lang.label}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5">
                      {lang.nativeName.split('—')[1]?.trim() || lang.nativeName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Korean Comprehension Level */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>나의 한국어 이해 수준 (Korean Level)</span>
              </label>
              <span className="text-xs text-slate-500">
                수준에 맞춰 화면 설명이 조절돼요
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {levelOptions.map((opt) => {
                const isSelected = tempLevel === opt.level;
                return (
                  <button
                    key={opt.level}
                    type="button"
                    onClick={() => setTempLevel(opt.level)}
                    className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-800">
                          {opt.titleKo} ({opt.titleNative})
                        </span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-100/60 rounded px-1.5 py-0.5 w-fit mb-2">
                      {opt.badge}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {opt.descNative}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Educational safety notice */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>함께ON 안내:</strong> 한국어가 익숙하지 않아도 친구들과 같은 활동을 할 수 있어요. 모국어와 한국어를 함께 보며 편안하게 수업에 참여해 보세요.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          {!isInitialSetup && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
            >
              취소
            </button>
          )}
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            {currentUi.buttons.applySettings}
          </button>
        </div>
      </div>
    </div>
  );
};
