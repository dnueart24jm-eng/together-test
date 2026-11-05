import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Globe, User, Sparkles, KeyRound } from 'lucide-react';
import { LanguageCode, KoreanLevel, StudentSession } from '../../types/lesson';
import { SUPPORTED_LANGUAGES, KOREAN_LEVELS } from '../../utils/i18n';
import { joinClassroom } from '../../services/apiService';

interface StudentOnboardingProps {
  initialClassCode: string;
  initialLanguage: LanguageCode;
  initialLevel: KoreanLevel;
  onBack: () => void;
  onComplete: (code: string, session: StudentSession) => void;
}

export const StudentOnboarding: React.FC<StudentOnboardingProps> = ({
  initialClassCode,
  initialLanguage,
  initialLevel,
  onBack,
  onComplete,
}) => {
  const [nickname, setNickname] = useState<string>('');
  const [classCode, setClassCode] = useState<string>(initialClassCode || 'ON-7429');
  const [language, setLanguage] = useState<LanguageCode>(initialLanguage || 'en');
  const [koreanLevel, setKoreanLevel] = useState<KoreanLevel>(initialLevel || 'beginner');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nickname.trim() || '학생';
    const trimmedCode = classCode.trim().toUpperCase() || 'ON-7429';

    setLoading(true);
    setError(null);

    try {
      const studentId = `stu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const res = await joinClassroom(trimmedCode, trimmedName, language, koreanLevel, studentId);
      if (res.success && res.student) {
        onComplete(trimmedCode, res.student);
      } else {
        // Fallback local session if server classroom not yet created
        onComplete(trimmedCode, {
          id: studentId,
          classCode: trimmedCode,
          nickname: trimmedName,
          language,
          koreanLevel,
          currentStageId: 'INTRO',
          taskStates: {},
          lastActive: Date.now(),
        });
      }
    } catch {
      setError('수업에 연결하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 flex flex-col justify-center px-4 py-8">
      <div className="w-full max-w-xl mx-auto">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>첫 화면으로 돌아가기</span>
        </button>

        <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <span className="inline-block text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full mb-2">
              학생 수업 입장
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              반가워요! 수업 준비를 해볼까요?
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              이름과 사용하는 언어를 선택하면 나에게 맞는 화면으로 수업이 열립니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Nickname & Class Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>이름 또는 별명 (Nickname)</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="예: 민수, 7번, Alex"
                  className="w-full p-3.5 text-base font-semibold rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>수업 코드</span>
                </label>
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="ON-7429"
                  className="w-full p-3.5 text-base font-mono font-bold uppercase rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            {/* 2. Native Language */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-600" />
                <span>사용할 모국어 (My Language)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400/30 font-bold'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-medium'
                      }`}
                    >
                      <span className="text-sm block truncate">{lang.nativeName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Korean Level */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>한국어 이해 수준 (Korean Level)</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(KOREAN_LEVELS[language] || KOREAN_LEVELS.ko).map((lvl) => {
                  const isSelected = koreanLevel === lvl.level;
                  return (
                    <button
                      key={lvl.level}
                      type="button"
                      onClick={() => setKoreanLevel(lvl.level)}
                      className={`p-3.5 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400/30 font-bold'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-medium'
                      }`}
                    >
                      <span className="text-sm block">{lvl.titleKo}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{loading ? '수업에 연결하는 중...' : '수업 시작하기'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
