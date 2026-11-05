import React, { useState } from 'react';
import {
  Users,
  LogIn,
  KeyRound,
  Languages,
  Check,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import {
  LanguageCode,
  KoreanLevel,
  StudentSession,
} from '../../types/lesson';
import { SUPPORTED_LANGUAGES, KOREAN_LEVELS, UI_STRINGS } from '../../utils/i18n';
import { joinClassroom } from '../../services/apiService';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClassCode: string;
  currentStudentSession: StudentSession | null;
  onJoined: (code: string, session: StudentSession) => void;
}

export const JoinClassModal: React.FC<JoinClassModalProps> = ({
  isOpen,
  onClose,
  currentClassCode,
  currentStudentSession,
  onJoined,
}) => {
  const [classCode, setClassCode] = useState<string>(currentClassCode || 'ON-7429');
  const [nickname, setNickname] = useState<string>(
    currentStudentSession?.nickname || '학생 (7번)'
  );
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(
    currentStudentSession?.language || 'en'
  );
  const [selectedLevel, setSelectedLevel] = useState<KoreanLevel>(
    currentStudentSession?.koreanLevel || 'beginner'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const ui = UI_STRINGS[selectedLanguage] || UI_STRINGS.en;
  const levelOptions = KOREAN_LEVELS[selectedLanguage] || KOREAN_LEVELS.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) {
      setError('선생님께 받은 수업 코드를 입력해 주세요.');
      return;
    }
    if (!nickname.trim()) {
      setError('별명이나 번호를 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await joinClassroom(
        classCode.trim().toUpperCase(),
        nickname.trim(),
        selectedLanguage,
        selectedLevel,
        currentStudentSession?.id
      );

      if (!res.success || !res.student) {
        setError(res.error || '수업 코드를 확인해 주세요.');
        return;
      }

      onJoined(classCode.trim().toUpperCase(), res.student);
      onClose();
    } catch (err: any) {
      setError('수업에 참여하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <LogIn className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">수업 참여하기 / Join Classroom</h3>
              <p className="text-xs text-amber-100">
                선생님께 받은 수업 코드를 입력하고 바로 참여해요
              </p>
            </div>
          </div>
          {currentStudentSession && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Class Code */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              1. 수업 참여 코드 (Class Code)
            </label>
            <div className="relative">
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="예: ON-7429"
                className="w-full text-base font-bold uppercase tracking-widest px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 transition-colors text-slate-900"
                required
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              선생님 화면의 대시보드에 표시된 코드를 입력하세요 (기본: ON-7429).
            </p>
          </div>

          {/* 2. Nickname or Number */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              2. 별명 또는 번호 (Nickname / Number)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 알리(3번), 5번, Maria"
              maxLength={20}
              className="w-full text-sm font-semibold px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 transition-colors text-slate-900"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              * 실명을 적지 않아도 괜찮아요. 선생님이 구분할 수 있는 번호나 별명을 적어주세요.
            </p>
          </div>

          {/* 3. Native Language Selection (8 languages) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-sky-600" />
              <span>3. 나의 모국어 선택 (My Native Language)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-400/40 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold">{lang.label}</span>
                    <span className="text-[10px] text-slate-500">{lang.nativeName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Korean Comprehension Level */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              4. 한국어 이해 수준 (Korean Level)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {levelOptions.map((lvl) => {
                const isSelected = selectedLevel === lvl.level;
                return (
                  <button
                    key={lvl.level}
                    type="button"
                    onClick={() => setSelectedLevel(lvl.level)}
                    className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400/40 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold">{lvl.titleNative}</span>
                    <span className="text-[10px] text-slate-500">{lvl.titleKo}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>수업 입장하기 (Join Lesson)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
