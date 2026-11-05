import {
  Globe,
  GraduationCap,
  Users,
  KeyRound,
  MessageSquare,
  BookMarked,
  LogIn,
  Home,
} from 'lucide-react';
import { LanguageCode, KoreanLevel } from '../types/lesson';
import { SUPPORTED_LANGUAGES, KOREAN_LEVELS, UI_STRINGS } from '../utils/i18n';

interface TopNavProps {
  currentRole: 'student' | 'teacher';
  onRoleChange: (role: 'student' | 'teacher') => void;
  selectedLanguage: LanguageCode;
  selectedLevel: KoreanLevel;
  onOpenSettings: () => void;
  activeStageTitle?: string;
  classCode?: string;
  onOpenJoinModal?: () => void;
  onOpenCommunication?: () => void;
  onOpenNotebook?: () => void;
  isTeacherAuthenticated?: boolean;
  onGoHome?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentRole,
  onRoleChange,
  selectedLanguage,
  selectedLevel,
  onOpenSettings,
  activeStageTitle,
  classCode,
  onOpenJoinModal,
  onOpenCommunication,
  onOpenNotebook,
  isTeacherAuthenticated,
  onGoHome,
}) => {
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage);
  const currentLevelOptions = KOREAN_LEVELS[selectedLanguage] || KOREAN_LEVELS.en;
  const currentLevelObj = currentLevelOptions.find((l) => l.level === selectedLevel);
  const ui = UI_STRINGS[selectedLanguage] || UI_STRINGS.en;

  const labels: Record<LanguageCode, { classStage: string; classCodeBadge: string; joinClass: string }> = {
    en: { classStage: 'Current Stage', classCodeBadge: 'Code', joinClass: 'Join Class' },
    vi: { classStage: 'Giai đoạn lớp', classCodeBadge: 'Mã lớp', joinClass: 'Vào lớp' },
    ru: { classStage: 'Текущий этап', classCodeBadge: 'Код', joinClass: 'Войти в класс' },
    'uz-Latn': { classStage: 'Dars bosqichi', classCodeBadge: 'Kod', joinClass: 'Darsga kirish' },
    'uz-Cyrl': { classStage: 'Дарс босқичи', classCodeBadge: 'Код', joinClass: 'Дарсга кириш' },
    'zh-Hans': { classStage: '当前环节', classCodeBadge: '课堂码', joinClass: '加入课堂' },
    'zh-Hant': { classStage: '當前環節', classCodeBadge: '課堂碼', joinClass: '加入課堂' },
    ko: { classStage: '수업 진행', classCodeBadge: '수업 코드', joinClass: '수업 참여' },
  };

  const currentLabel = labels[selectedLanguage] || labels.en;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark (Click to return to Landing Page) */}
        <button
          type="button"
          onClick={onGoHome}
          title="첫 화면으로 돌아가기"
          className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center text-base shadow-xs">
            ON
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              함께ON <span className="text-xs font-semibold text-slate-400">TogetherON</span>
            </span>
          </div>
        </button>

        {onGoHome && (
          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 transition-colors shrink-0 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>첫 화면</span>
          </button>
        )}

        {/* Zone 2: Navigation & Context Info */}
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-500 whitespace-nowrap overflow-hidden">
          {classCode && (
            <button
              type="button"
              onClick={onOpenJoinModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-colors font-bold"
              title="수업 코드 변경 또는 학생 입장"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentLabel.classCodeBadge}: {classCode}</span>
            </button>
          )}

          {activeStageTitle && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{currentLabel.classStage}</span>
              <span className="text-slate-900 font-bold">{activeStageTitle}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
            </div>
          )}

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Language & Level Settings"
          >
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-bold">{currentLangObj?.label || 'English'}</span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span className="text-emerald-700 font-bold">{currentLevelObj?.titleNative || 'Beginner'}</span>
          </button>
        </div>

        {/* Zone 3: Primary Action / Mode Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick dialogue & notebook buttons for tablet & desktop */}
          {currentRole === 'student' && onOpenCommunication && (
            <button
              type="button"
              onClick={onOpenCommunication}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold rounded-lg transition-colors"
              title="교실 의사소통 도우미"
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
              <span>대화 도우미</span>
            </button>
          )}

          {currentRole === 'student' && onOpenNotebook && (
            <button
              type="button"
              onClick={onOpenNotebook}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-lg transition-colors"
              title="나만의 한국어 노트"
            >
              <BookMarked className="w-3.5 h-3.5 text-amber-600" />
              <span>내 노트</span>
            </button>
          )}

          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => onRoleChange('student')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                currentRole === 'student'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>{ui.studentMode}</span>
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('teacher')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                currentRole === 'teacher'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>{ui.teacherMode}</span>
              {!isTeacherAuthenticated && currentRole !== 'teacher' && (
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1 py-0.2 rounded font-mono">
                  🔒
                </span>
              )}
            </button>
          </div>

          {/* Mobile join / settings trigger */}
          {onOpenJoinModal && (
            <button
              type="button"
              onClick={onOpenJoinModal}
              className="md:hidden p-2 text-indigo-700 hover:bg-indigo-50 rounded-lg"
              title="수업 참여 코드"
            >
              <LogIn className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSettings}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            aria-label="언어 설정"
          >
            <Globe className="w-4 h-4 text-sky-600" />
          </button>
        </div>
      </div>
    </header>
  );
};
