import React, { useState } from 'react';
import {
  LogIn,
  KeyRound,
  Languages,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import {
  LanguageCode,
  KoreanLevel,
  StudentSession,
} from '../../types/lesson';
import { SUPPORTED_LANGUAGES, KOREAN_LEVELS } from '../../utils/i18n';
import { joinClassroom } from '../../services/apiService';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClassCode: string;
  currentStudentSession: StudentSession | null;
  onJoined: (code: string, session: StudentSession) => void;
}

const JOIN_MODAL_I18N: Record<
  LanguageCode,
  {
    headerTitle: string;
    headerDesc: string;
    codeLabel: string;
    codeHint: string;
    codePlaceholder: string;
    nameLabel: string;
    nameHint: string;
    namePlaceholder: string;
    langLabel: string;
    levelLabel: string;
    submit: string;
    connecting: string;
    errorMissingCode: string;
    errorMissingName: string;
    errorGeneral: string;
  }
> = {
  ko: {
    headerTitle: '수업 참여하기',
    headerDesc: '선생님께 받은 수업 코드를 입력하고 바로 참여해요',
    codeLabel: '1. 수업 참여 코드 (Class Code)',
    codeHint: '선생님 화면의 대시보드에 표시된 코드를 입력하세요 (기본: ON-7429).',
    codePlaceholder: '예: ON-7429',
    nameLabel: '2. 별명 또는 번호 (Nickname / Number)',
    nameHint: '* 실명을 적지 않아도 괜찮아요. 선생님이 구분할 수 있는 번호나 별명을 적어주세요.',
    namePlaceholder: '예: 민수(3번), 5번, Alex',
    langLabel: '3. 나의 모국어 선택 (My Native Language)',
    levelLabel: '4. 한국어 이해 수준 (Korean Level)',
    submit: '수업 입장하기',
    connecting: '수업에 연결하는 중...',
    errorMissingCode: '선생님께 받은 수업 코드를 입력해 주세요.',
    errorMissingName: '별명이나 번호를 입력해 주세요.',
    errorGeneral: '수업에 참여하는 중 오류가 발생했습니다.',
  },
  en: {
    headerTitle: 'Join Classroom',
    headerDesc: 'Enter the class code from your teacher to join the lesson',
    codeLabel: '1. Class Code',
    codeHint: 'Enter the code shown on your teacher’s screen (Default: ON-7429).',
    codePlaceholder: 'e.g., ON-7429',
    nameLabel: '2. Name or Nickname',
    nameHint: '* Real name is optional. You can use your class number or nickname.',
    namePlaceholder: 'e.g., Alex, Student 7, Minsu',
    langLabel: '3. My Native Language',
    levelLabel: '4. Korean Understanding Level',
    submit: 'Enter Classroom',
    connecting: 'Connecting...',
    errorMissingCode: 'Please enter the class code from your teacher.',
    errorMissingName: 'Please enter your name or nickname.',
    errorGeneral: 'An error occurred while joining the class.',
  },
  vi: {
    headerTitle: 'Vào lớp học',
    headerDesc: 'Nhập mã lớp từ thầy cô để tham gia tiết học',
    codeLabel: '1. Mã lớp học (Class Code)',
    codeHint: 'Nhập mã hiển thị trên màn hình của thầy cô (Mặc định: ON-7429).',
    codePlaceholder: 'Ví dụ: ON-7429',
    nameLabel: '2. Tên hoặc Biệt danh (Nickname)',
    nameHint: '* Không nhất thiết dùng tên thật. Có thể dùng số thứ tự hoặc biệt danh.',
    namePlaceholder: 'Ví dụ: Linh, Số 7, Alex',
    langLabel: '3. Chọn tiếng mẹ đẻ của em',
    levelLabel: '4. Mức độ hiểu tiếng Hàn',
    submit: 'Vào lớp học ngay',
    connecting: 'Đang kết nối...',
    errorMissingCode: 'Vui lòng nhập mã lớp học từ thầy cô.',
    errorMissingName: 'Vui lòng nhập tên hoặc biệt danh của em.',
    errorGeneral: 'Đã xảy ra lỗi khi tham gia lớp học.',
  },
  ru: {
    headerTitle: 'Войти в класс',
    headerDesc: 'Введите код класса от учителя, чтобы присоединиться к уроку',
    codeLabel: '1. Код класса (Class Code)',
    codeHint: 'Введите код с экрана учителя (По умолчанию: ON-7429).',
    codePlaceholder: 'Например: ON-7429',
    nameLabel: '2. Имя или номер (Nickname)',
    nameHint: '* Настоящее имя необязательно. Можно указать номер в классе или никнейм.',
    namePlaceholder: 'Например: Саша, №7, Alex',
    langLabel: '3. Выбор родного языка',
    levelLabel: '4. Уровень понимания корейского языка',
    submit: 'Войти на урок',
    connecting: 'Подключение...',
    errorMissingCode: 'Пожалуйста, введите код класса.',
    errorMissingName: 'Пожалуйста, укажите имя или номер.',
    errorGeneral: 'Произошла ошибка при входе в класс.',
  },
  'uz-Latn': {
    headerTitle: 'Darsga qo‘shilish',
    headerDesc: 'Darsga kirish uchun o‘qituvchidan olingan kodni kiriting',
    codeLabel: '1. Sinf kodi (Class Code)',
    codeHint: 'O‘qituvchi ekranidagi kodni kiriting (Standart: ON-7429).',
    codePlaceholder: 'Masalan: ON-7429',
    nameLabel: '2. Ism yoki taxallus (Nickname)',
    nameHint: '* Haqiqiy ism shart emas. Raqamingiz yoki taxallusingizni yozishingiz mumkin.',
    namePlaceholder: 'Masalan: Ali, 7-raqam, Alex',
    langLabel: '3. Ona tilini tanlash',
    levelLabel: '4. Koreys tilini tushunish darajasi',
    submit: 'Darsga kirish',
    connecting: 'Ulanmoqda...',
    errorMissingCode: 'Iltimos, o‘qituvchidan olgan sinf kodini kiriting.',
    errorMissingName: 'Iltimos, ismingiz yoki raqamingizni kiriting.',
    errorGeneral: 'Darsga qo‘shilishda xatolik yuz berdi.',
  },
  'uz-Cyrl': {
    headerTitle: 'Дарсга қўшилиш',
    headerDesc: 'Дарсга кириш учун ўқитувчидан олинган кодни киритинг',
    codeLabel: '1. Синф коди (Class Code)',
    codeHint: 'Ўқитувчи экранидаги кодни киритинг (Стандарт: ON-7429).',
    codePlaceholder: 'Масалан: ON-7429',
    nameLabel: '2. Исм ёки тахаллус (Nickname)',
    nameHint: '* Ҳақиқий исм шарт эмас. Рақамингиз ёки тахаллусингизни ёзишингиз мумкин.',
    namePlaceholder: 'Масалан: Али, 7-рақам, Alex',
    langLabel: '3. Она тилини танлаш',
    levelLabel: '4. Корейс тилини тушуниш даражаси',
    submit: 'Дарсга кириш',
    connecting: 'Уланмоқда...',
    errorMissingCode: 'Илтимос, ўқитувчидан олган синф кодини киритинг.',
    errorMissingName: 'Илтимос, исмингиз ёки рақамингизни киритинг.',
    errorGeneral: 'Дарсга қўшилишда хатолик юз берди.',
  },
  'zh-Hans': {
    headerTitle: '加入课堂',
    headerDesc: '输入老师提供的课堂代码即可进入课堂',
    codeLabel: '1. 课堂代码 (Class Code)',
    codeHint: '请输入老师界面显示的课堂代码（默认：ON-7429）。',
    codePlaceholder: '例如：ON-7429',
    nameLabel: '2. 姓名或昵称 (Nickname / Number)',
    nameHint: '* 不必填写真实姓名，填写学号或昵称即可。',
    namePlaceholder: '例如：小明(3号)、5号、Alex',
    langLabel: '3. 选择我的母语 (My Native Language)',
    levelLabel: '4. 韩语理解水平 (Korean Level)',
    submit: '进入课堂',
    connecting: '正在进入课堂...',
    errorMissingCode: '请输入老师提供的课堂代码。',
    errorMissingName: '请输入昵称或学号。',
    errorGeneral: '加入课堂时出现错误。',
  },
  'zh-Hant': {
    headerTitle: '加入課堂',
    headerDesc: '輸入老師提供的課堂代碼即可進入課堂',
    codeLabel: '1. 課堂代碼 (Class Code)',
    codeHint: '請輸入老師介面顯示的課堂代碼（預設：ON-7429）。',
    codePlaceholder: '例如：ON-7429',
    nameLabel: '2. 姓名或暱稱 (Nickname / Number)',
    nameHint: '* 不必填寫真實姓名，填寫座號或暱稱即可。',
    namePlaceholder: '例如：小明(3號)、5號、Alex',
    langLabel: '3. 選擇我的母語 (My Native Language)',
    levelLabel: '4. 韓語理解水平 (Korean Level)',
    submit: '進入課堂',
    connecting: '正在進入課堂...',
    errorMissingCode: '請輸入老師提供的課堂代碼。',
    errorMissingName: '請輸入暱稱或座號。',
    errorGeneral: '加入課堂時出現錯誤。',
  },
};

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

  const t = JOIN_MODAL_I18N[selectedLanguage] || JOIN_MODAL_I18N.en;
  const levelOptions = KOREAN_LEVELS[selectedLanguage] || KOREAN_LEVELS.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) {
      setError(t.errorMissingCode);
      return;
    }
    if (!nickname.trim()) {
      setError(t.errorMissingName);
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
        setError(res.error || t.errorMissingCode);
        return;
      }

      onJoined(classCode.trim().toUpperCase(), res.student);
      onClose();
    } catch {
      setError(t.errorGeneral);
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
              <h3 className="text-lg font-bold">{t.headerTitle}</h3>
              <p className="text-xs text-amber-100">{t.headerDesc}</p>
            </div>
          </div>
          {currentStudentSession && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
              {t.codeLabel}
            </label>
            <div className="relative">
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder={t.codePlaceholder}
                className="w-full text-base font-bold uppercase tracking-widest px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 transition-colors text-slate-900"
                required
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{t.codeHint}</p>
          </div>

          {/* 2. Nickname or Number */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {t.nameLabel}
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t.namePlaceholder}
              maxLength={20}
              className="w-full text-sm font-semibold px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 transition-colors text-slate-900"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">{t.nameHint}</p>
          </div>

          {/* 3. Native Language Selection (8 languages) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-sky-600" />
              <span>{t.langLabel}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
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
              {t.levelLabel}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {levelOptions.map((lvl) => {
                const isSelected = selectedLevel === lvl.level;
                return (
                  <button
                    key={lvl.level}
                    type="button"
                    onClick={() => setSelectedLevel(lvl.level)}
                    className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400/40 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold">{lvl.titleNative}</span>
                    {selectedLanguage !== 'ko' && (
                      <span className="text-[10px] text-slate-500">{lvl.titleKo}</span>
                    )}
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
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.submit}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
