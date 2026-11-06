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

const ONBOARDING_I18N: Record<
  LanguageCode,
  {
    backToHome: string;
    badge: string;
    welcomeTitle: string;
    welcomeDesc: string;
    nameLabel: string;
    namePlaceholder: string;
    classCodeLabel: string;
    languageLabel: string;
    levelLabel: string;
    submitButton: string;
    connecting: string;
    connectError: string;
  }
> = {
  ko: {
    backToHome: '첫 화면으로 돌아가기',
    badge: '학생 수업 입장',
    welcomeTitle: '반가워요! 수업 준비를 해볼까요?',
    welcomeDesc: '이름과 사용하는 언어를 선택하면 나에게 맞는 화면으로 수업이 열립니다.',
    nameLabel: '이름 또는 별명',
    namePlaceholder: '예: 민수, 7번, Alex',
    classCodeLabel: '수업 코드',
    languageLabel: '사용할 모국어 (My Language)',
    levelLabel: '한국어 이해 수준 (Korean Level)',
    submitButton: '수업 시작하기',
    connecting: '수업에 연결하는 중...',
    connectError: '수업에 연결하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  },
  en: {
    backToHome: 'Back to Home',
    badge: 'Student Class Entry',
    welcomeTitle: 'Welcome! Ready for today’s lesson?',
    welcomeDesc: 'Choose your name and language to customize the lesson screen for you.',
    nameLabel: 'Name or Nickname',
    namePlaceholder: 'e.g., Alex, Student 7, Minsu',
    classCodeLabel: 'Class Code',
    languageLabel: 'My Language',
    levelLabel: 'Korean Understanding Level',
    submitButton: 'Start Class',
    connecting: 'Connecting to class...',
    connectError: 'There was a problem connecting to the class. Please try again in a moment.',
  },
  vi: {
    backToHome: 'Quay lại trang chủ',
    badge: 'Vào lớp học dành cho học sinh',
    welcomeTitle: 'Rất vui được gặp em! Hãy chuẩn bị cho bài học nhé!',
    welcomeDesc: 'Nhập tên và chọn ngôn ngữ để màn hình bài học phù hợp nhất với em.',
    nameLabel: 'Tên hoặc Biệt danh',
    namePlaceholder: 'Ví dụ: Linh, Số 7, Alex',
    classCodeLabel: 'Mã lớp học',
    languageLabel: 'Tiếng mẹ đẻ của em',
    levelLabel: 'Mức độ hiểu tiếng Hàn',
    submitButton: 'Bắt đầu bài học',
    connecting: 'Đang kết nối vào lớp...',
    connectError: 'Có lỗi khi kết nối vào lớp. Vui lòng thử lại sau ít phút.',
  },
  ru: {
    backToHome: 'Назад на главную',
    badge: 'Вход на урок для ученика',
    welcomeTitle: 'Привет! Давай приготовимся к уроку!',
    welcomeDesc: 'Укажи имя и выбери язык, чтобы экран урока открылся на понятном тебе языке.',
    nameLabel: 'Имя или Никнейм',
    namePlaceholder: 'Например: Саша, №7, Alex',
    classCodeLabel: 'Код класса',
    languageLabel: 'Мой родной язык',
    levelLabel: 'Уровень понимания корейского языка',
    submitButton: 'Начать урок',
    connecting: 'Подключение к уроку...',
    connectError: 'Произошла ошибка при подключении к уроку. Попробуйте еще раз.',
  },
  'uz-Latn': {
    backToHome: 'Bosh sahifaga qaytish',
    badge: 'O‘quvchi darsga kirishi',
    welcomeTitle: 'Xush kelibsiz! Darsga tayyorlanamizmi?',
    welcomeDesc: 'Ismingiz va tilingizni tanlasangiz, dars ekrani sizga mos holda ochiladi.',
    nameLabel: 'Ism yoki taxallus',
    namePlaceholder: 'Masalan: Ali, 7-raqam, Alex',
    classCodeLabel: 'Sinf kodi',
    languageLabel: 'Mening ona tilim',
    levelLabel: 'Koreys tilini tushunish darajasi',
    submitButton: 'Darsni boshlash',
    connecting: 'Darsga ulanmoqda...',
    connectError: 'Darsga ulanishda xatolik yuz berdi. Birozdan so‘ng qayta urinib ko‘ring.',
  },
  'uz-Cyrl': {
    backToHome: 'Бош саҳифага қайтиш',
    badge: 'Ўқувчи дарсга кириши',
    welcomeTitle: 'Хуш келибсиз! Дарсга тайёрланамизми?',
    welcomeDesc: 'Исмингиз ва тилингизни танласангиз, дарс экрани сизга мос ҳолда очилади.',
    nameLabel: 'Исм ёки тахаллус',
    namePlaceholder: 'Масалан: Али, 7-рақам, Alex',
    classCodeLabel: 'Синф коди',
    languageLabel: 'Менинг она тилим',
    levelLabel: 'Корейс тилини тушуниш даражаси',
    submitButton: 'Дарсни бошлаш',
    connecting: 'Дарсга уланмоқда...',
    connectError: 'Дарсга уланишда хатолик юз берди. Бироздан сўнг қайта уриниб кўринг.',
  },
  'zh-Hans': {
    backToHome: '返回首页',
    badge: '学生进入课堂',
    welcomeTitle: '你好！准备好开始今天的课程了吗？',
    welcomeDesc: '输入名字并选择使用的语言，即可为你呈现专属的课堂界面。',
    nameLabel: '姓名或昵称',
    namePlaceholder: '例如：小明、7号、Alex',
    classCodeLabel: '课堂代码',
    languageLabel: '使用的母语',
    levelLabel: '韩语理解水平',
    submitButton: '开始上课',
    connecting: '正在连接课堂...',
    connectError: '连接课堂时出现问题，请稍后重试。',
  },
  'zh-Hant': {
    backToHome: '返回首頁',
    badge: '學生進入課堂',
    welcomeTitle: '你好！準備好開始今天的課程了嗎？',
    welcomeDesc: '輸入名字並選擇使用的語言，即可為你呈現專屬的課堂介面。',
    nameLabel: '姓名或暱稱',
    namePlaceholder: '例如：小明、7號、Alex',
    classCodeLabel: '課堂代碼',
    languageLabel: '使用的母語',
    levelLabel: '韓語理解水平',
    submitButton: '開始上課',
    connecting: '正在連接課堂...',
    connectError: '連接課堂時出現問題，請稍後重試。',
  },
};

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

  const t = ONBOARDING_I18N[language] || ONBOARDING_I18N.en;

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
      setError(t.connectError);
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
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToHome}</span>
        </button>

        <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <span className="inline-block text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full mb-2">
              {t.badge}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              {t.welcomeTitle}
            </h1>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              {t.welcomeDesc}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Nickname & Class Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>{t.nameLabel}</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full p-3.5 text-base font-semibold rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>{t.classCodeLabel}</span>
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
                <span>{t.languageLabel}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400/30 font-bold shadow-2xs'
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
                <span>{t.levelLabel}</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(KOREAN_LEVELS[language] || KOREAN_LEVELS.ko).map((lvl) => {
                  const isSelected = koreanLevel === lvl.level;
                  return (
                    <button
                      key={lvl.level}
                      type="button"
                      onClick={() => setKoreanLevel(lvl.level)}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400/30 font-bold shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-medium'
                      }`}
                    >
                      <span className="text-sm block font-bold">{lvl.titleNative}</span>
                      {language !== 'ko' && (
                        <span className="text-[11px] text-slate-400 block mt-0.5">({lvl.titleKo})</span>
                      )}
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
              className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{loading ? t.connecting : t.submitButton}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
