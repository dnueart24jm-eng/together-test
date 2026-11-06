import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Volume2,
  Globe,
  ArrowRight,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import {
  LessonInfo,
  LessonStage,
  LanguageCode,
  KoreanLevel,
} from '../../types/lesson';
import { UI_STRINGS } from '../../utils/i18n';
import { speakKoreanText, translateDialogue } from '../../services/apiService';
import { getLocalizedStage } from '../../utils/lessonLocalization';

interface MenuWhatShouldIThinkProps {
  lessonInfo: LessonInfo;
  stage: LessonStage;
  studentLanguage: LanguageCode;
  koreanLevel: KoreanLevel;
  onNavigateToMenu4?: () => void;
}

const THINK_LABELS: Record<
  LanguageCode,
  {
    categoryBadge: string;
    questionSelectorPrefix: string;
    nativeQuestionLabel: string;
    koreanQuestionLabel: string;
    listenTeacherKorean: string;
    thinkingTipTitle: string;
    thinkingTipDesc: string;
    bottomEncourage: string;
    moveToSpeechMenu: string;
    translatingText: string;
  }
> = {
  ko: {
    categoryBadge: '선생님의 질문 생각하기',
    questionSelectorPrefix: '질문',
    nativeQuestionLabel: '선생님이 묻고 계신 질문의 뜻',
    koreanQuestionLabel: '선생님의 한국어 질문 원문',
    listenTeacherKorean: '한국어 질문 소리 듣기',
    thinkingTipTitle: '생각해 볼 점',
    thinkingTipDesc: '정답은 하나로 정해져 있지 않아요! 여러분의 생각과 느낌이 모두 훌륭한 답이 됩니다. 편안하게 생각을 정리해 보세요.',
    bottomEncourage: '생각이 떠올랐다면 4번 메뉴에서 한국어로 바꿔 말할 준비를 해보세요!',
    moveToSpeechMenu: '4번 "어떻게 말해요?" 로 이동하기',
    translatingText: '질문 번역 중...',
  },
  en: {
    categoryBadge: 'Understanding Teacher’s Question',
    questionSelectorPrefix: 'Question',
    nativeQuestionLabel: 'Question Meaning (What the teacher is asking)',
    koreanQuestionLabel: 'Teacher’s Original Korean Question in Class',
    listenTeacherKorean: 'Listen to Korean question sound',
    thinkingTipTitle: 'Things to Think About',
    thinkingTipDesc: 'There is no single correct answer! Your own thoughts and feelings are great answers. Feel free to organize your thoughts in your own language first.',
    bottomEncourage: 'Ready with your thoughts? Turn them into Korean speech in Menu 4!',
    moveToSpeechMenu: 'Go to Menu 4 "How do I say it"',
    translatingText: 'Translating question...',
  },
  vi: {
    categoryBadge: 'Hiểu câu hỏi của thầy cô',
    questionSelectorPrefix: 'Câu hỏi',
    nativeQuestionLabel: 'Ý nghĩa câu hỏi (Thầy cô đang hỏi điều gì)',
    koreanQuestionLabel: 'Câu hỏi tiếng Hàn của thầy cô trong lớp',
    listenTeacherKorean: 'Nghe phát âm câu hỏi tiếng Hàn',
    thinkingTipTitle: 'Gợi ý suy nghĩ',
    thinkingTipDesc: 'Không có một đáp án cố định nào cả! Mọi suy nghĩ và cảm xúc của em đều là câu trả lời tuyệt vời. Hãy thoải mái sắp xếp suy nghĩ bằng tiếng mẹ đẻ trước nhé.',
    bottomEncourage: 'Em đã có suy nghĩ của mình chưa? Hãy chuyển sang mục 4 để chuẩn bị nói bằng tiếng Hàn nhé!',
    moveToSpeechMenu: 'Đến mục 4 "Nói bằng tiếng Hàn như thế nào"',
    translatingText: 'Đang dịch câu hỏi...',
  },
  ru: {
    categoryBadge: 'Понимание вопроса учителя',
    questionSelectorPrefix: 'Вопрос',
    nativeQuestionLabel: 'Смысл вопроса (О чем спрашивает учитель)',
    koreanQuestionLabel: 'Вопрос учителя на корейском языке в классе',
    listenTeacherKorean: 'Прослушать корейский вопрос',
    thinkingTipTitle: 'Над чем подумать',
    thinkingTipDesc: 'Здесь нет единственно правильного ответа! Любые твои мысли и чувства — это замечательный ответ. Сначала спокойно подумай на своем родном языке.',
    bottomEncourage: 'Появилась мысль? Переходи в раздел 4, чтобы сформулировать её по-корейски!',
    moveToSpeechMenu: 'Перейти в раздел 4 «Как сказать это по-корейски»',
    translatingText: 'Перевод вопроса...',
  },
  'uz-Latn': {
    categoryBadge: 'O‘qituvchining savolini tushunish',
    questionSelectorPrefix: 'Savol',
    nativeQuestionLabel: 'Savolning ma’nosi (O‘qituvchi nima deb so‘ramoqda)',
    koreanQuestionLabel: 'O‘qituvchining darsdagi asl koreyscha savoli',
    listenTeacherKorean: 'Koreyscha savol ovozini tinglash',
    thinkingTipTitle: 'O‘ylab ko‘rish uchun maslahat',
    thinkingTipDesc: 'Bitta to‘g‘ri javobning o‘zi yo‘q! Sizning har qanday fikringiz va his-tuyg‘ularingiz ajoyib javobdir. Avval ona tilingizda bemalol o‘ylab oling.',
    bottomEncourage: 'Fikringiz tayyormi? Uni 4-bo‘limda koreyscha aytishga tayyorlaning!',
    moveToSpeechMenu: '4-bo‘lim "Koreyscha qanday aytiladi"ga o‘tish',
    translatingText: 'Savol tarjima qilinmoqda...',
  },
  'uz-Cyrl': {
    categoryBadge: 'Ўқитувчининг саволини тушуниш',
    questionSelectorPrefix: 'Савол',
    nativeQuestionLabel: 'Саволнинг маъноси (Ўқитувчи нима деб сўрамоқда)',
    koreanQuestionLabel: 'Ўқитувчининг дарсдаги асл корейсча саволи',
    listenTeacherKorean: 'Корейсча савол овозини тинглаш',
    thinkingTipTitle: 'Ўйлаб кўриш учун маслаҳат',
    thinkingTipDesc: 'Битта тўғри жавобнинг ўзи йўқ! Сизнинг ҳар қандай фикрингиз ва ҳис-туйғуларингиз ажойиб жавобдир. Аввал она тилингизда бемалол ўйлаб олинг.',
    bottomEncourage: 'Фикрингиз тайёрми? Уни 4-бўлимда корейсча айтишга тайёрланинг!',
    moveToSpeechMenu: '4-бўлим "Корейсча қандай айтилади"га ўтиш',
    translatingText: 'Савол таржима қилинмоқда...',
  },
  'zh-Hans': {
    categoryBadge: '理解老师的提问',
    questionSelectorPrefix: '提问',
    nativeQuestionLabel: '问题的含义（老师在问什么）',
    koreanQuestionLabel: '老师在课堂上的韩语提问原文',
    listenTeacherKorean: '听老师韩语提问发音',
    thinkingTipTitle: '思考小建议',
    thinkingTipDesc: '答案并不唯一！你的真实想法和感受就是最好的回答。先用母语轻松地整理自己的想法吧。',
    bottomEncourage: '有想法了吗？在第4项练习用韩语告诉大家吧！',
    moveToSpeechMenu: '前往第4项“怎么用韩语表达”',
    translatingText: '正在翻译问题...',
  },
  'zh-Hant': {
    categoryBadge: '理解老師的提問',
    questionSelectorPrefix: '提問',
    nativeQuestionLabel: '問題的涵義（老師在問什麼）',
    koreanQuestionLabel: '老師在課堂上的韓語提問原文',
    listenTeacherKorean: '聽老師韓語提問發音',
    thinkingTipTitle: '思考小建議',
    thinkingTipDesc: '答案並不唯一！你的真實想法和感受就是最好的回答。先用母語輕鬆地整理自己的想法吧。',
    bottomEncourage: '有想法了嗎？在第4項練習用韓語告訴大家吧！',
    moveToSpeechMenu: '前往第4項「怎麼用韓語表達」',
    translatingText: '正在翻譯問題...',
  },
};

export const MenuWhatShouldIThink: React.FC<MenuWhatShouldIThinkProps> = ({
  lessonInfo,
  stage,
  studentLanguage,
  koreanLevel,
  onNavigateToMenu4,
}) => {
  const ui = UI_STRINGS[studentLanguage] || UI_STRINGS.en;
  const localizedStage = getLocalizedStage(stage.id, studentLanguage);

  const rawKoreanQuestions =
    stage.teacherQuestions && stage.teacherQuestions.length > 0
      ? stage.teacherQuestions
      : ['선생님께서 질문하신 내용을 다시 떠올려 볼까요?'];

  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState<number>(0);
  const [nativeQuestion, setNativeQuestion] = useState<string>('');
  const [translating, setTranslating] = useState<boolean>(false);

  const currentKoreanQuestion =
    rawKoreanQuestions[selectedQuestionIdx] || rawKoreanQuestions[0];

  const text = THINK_LABELS[studentLanguage] || THINK_LABELS.en;

  // Translate teacher question into student's native language accurately
  useEffect(() => {
    let active = true;

    if (studentLanguage === 'ko') {
      setNativeQuestion(currentKoreanQuestion);
      return;
    }

    // Check localized preset first
    const preset = localizedStage?.teacherQuestions?.[selectedQuestionIdx];
    if (preset && preset !== currentKoreanQuestion) {
      setNativeQuestion(preset);
    } else {
      setNativeQuestion('');
    }

    setTranslating(true);
    translateDialogue(
      currentKoreanQuestion,
      'korean_to_native',
      studentLanguage,
      lessonInfo.topic
    )
      .then((res) => {
        if (active && res.translatedText && res.translatedText.trim()) {
          setNativeQuestion(res.translatedText.trim());
        }
      })
      .catch((err) => {
        console.warn('Teacher question translation error:', err);
      })
      .finally(() => {
        if (active) {
          setTranslating(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    currentKoreanQuestion,
    studentLanguage,
    selectedQuestionIdx,
    localizedStage,
    lessonInfo.topic,
  ]);

  const handleSpeak = (speechText: string) => {
    speakKoreanText(speechText);
  };

  const displayedNativeQuestion =
    nativeQuestion ||
    (translating ? text.translatingText : currentKoreanQuestion);

  return (
    <div className="space-y-5">
      {/* 1. Header Card & Question Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                {text.categoryBadge}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {studentLanguage === 'ko'
                  ? ui.menu3.titleKo
                  : `${ui.menu3.titleNative} (${ui.menu3.titleKo})`}
              </h3>
            </div>
          </div>

          {/* Multiple questions selector */}
          {rawKoreanQuestions.length > 1 && (
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
              {rawKoreanQuestions.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedQuestionIdx(idx)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    selectedQuestionIdx === idx
                      ? 'bg-white text-purple-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {text.questionSelectorPrefix} {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Primary Question Display Card: Student's Native language first & prominent! */}
        <div className="p-5 sm:p-6 bg-purple-50/70 rounded-2xl border border-purple-200 mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-purple-600" />
              <span>{text.nativeQuestionLabel}</span>
            </span>
          </div>

          {/* Prominent Question in student's native language */}
          <h4 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug mb-4">
            "{displayedNativeQuestion}"
          </h4>

          {/* Original Korean Question with Audio listen button */}
          <div className="p-3.5 bg-white rounded-xl border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                {text.koreanQuestionLabel}
              </span>
              <p className="text-xs sm:text-sm font-bold text-purple-950">
                "{currentKoreanQuestion}"
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSpeak(currentKoreanQuestion)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-800 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors shrink-0 self-start sm:self-center shadow-2xs cursor-pointer"
              title="한국어 질문 발음 듣기"
            >
              <Volume2 className="w-3.5 h-3.5 text-purple-600" />
              <span>{text.listenTeacherKorean}</span>
            </button>
          </div>
        </div>

        {/* 2. Helpful Thinking Tip (No complex scaffolding errors) */}
        <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 mb-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs sm:text-sm font-bold text-amber-950 mb-1">
              {text.thinkingTipTitle}
            </h5>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              {text.thinkingTipDesc}
            </p>
          </div>
        </div>

        {/* 3. Smooth Bridge to Menu 4 (Speak in Korean) */}
        <div className="pt-2">
          {onNavigateToMenu4 ? (
            <button
              type="button"
              onClick={onNavigateToMenu4}
              className="w-full py-3.5 px-5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{text.moveToSpeechMenu}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>{text.bottomEncourage}</span>
              <span className="font-bold text-purple-700">
                {text.moveToSpeechMenu}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
