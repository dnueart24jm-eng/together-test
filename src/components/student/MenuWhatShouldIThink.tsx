import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Volume2,
  ChevronRight,
  RefreshCw,
  Lightbulb,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import {
  LessonInfo,
  LessonStage,
  LanguageCode,
  KoreanLevel,
  AIThinkingScaffoldResponse,
} from '../../types/lesson';
import { UI_STRINGS } from '../../utils/i18n';
import { fetchThinkingScaffold, speakKoreanText } from '../../services/apiService';
import { getLocalizedStage } from '../../utils/lessonLocalization';

interface MenuWhatShouldIThinkProps {
  lessonInfo: LessonInfo;
  stage: LessonStage;
  studentLanguage: LanguageCode;
  koreanLevel: KoreanLevel;
}

export const MenuWhatShouldIThink: React.FC<MenuWhatShouldIThinkProps> = ({
  lessonInfo,
  stage,
  studentLanguage,
  koreanLevel,
}) => {
  const ui = UI_STRINGS[studentLanguage] || UI_STRINGS.en;
  const localizedStage = getLocalizedStage(stage.id, studentLanguage);

  const rawKoreanQuestions =
    stage.teacherQuestions && stage.teacherQuestions.length > 0
      ? stage.teacherQuestions
      : ['선생님께서 질문하신 내용을 다시 떠올려 볼까요?'];

  const nativeQuestions =
    localizedStage?.teacherQuestions && localizedStage.teacherQuestions.length === rawKoreanQuestions.length
      ? localizedStage.teacherQuestions
      : rawKoreanQuestions;

  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState<number>(0);
  const [revealedHintSteps, setRevealedHintSteps] = useState<number>(2);
  const [aiScaffold, setAiScaffold] = useState<AIThinkingScaffoldResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentKoreanQuestion = rawKoreanQuestions[selectedQuestionIdx] || rawKoreanQuestions[0];
  const currentNativeQuestion = nativeQuestions[selectedQuestionIdx] || currentKoreanQuestion;

  const loadScaffold = async (qIdx: number, refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchThinkingScaffold(
        lessonInfo,
        stage,
        qIdx,
        studentLanguage,
        koreanLevel,
        refresh
      );
      setAiScaffold(data);
    } catch {
      const isKo = studentLanguage === 'ko';
      setAiScaffold({
        hintSteps: [
          {
            step: 1,
            title: isKo ? '1단계: 질문의 핵심 찾기' : 'Step 1: Find the key point',
            hint: isKo
              ? '질문에서 가장 중요한 낱말이 무엇인지 찾아보세요.'
              : 'Look for the most important words in the question.',
          },
          {
            step: 2,
            title: isKo ? '2단계: 수업 내용 떠올리기' : 'Step 2: Recall the lesson',
            hint: isKo
              ? '방금 배운 내용이나 교과서 그림을 떠올려 보세요.'
              : 'Think about what we just learned or the pictures in the textbook.',
          },
          {
            step: 3,
            title: isKo ? '3단계: 이유 생각하기' : 'Step 3: Think about why',
            hint: isKo
              ? '왜 그렇게 생각했는지 한 가지 이유를 떠올려 보세요.'
              : 'Think of one reason why you think so.',
          },
          {
            step: 4,
            title: isKo ? '4단계: 내 생각 정리하기' : 'Step 4: Organize your idea',
            hint: isKo
              ? '모국어로 먼저 정리한 뒤, 한국어 표현으로 말해 보세요.'
              : 'Organize your idea in your language first, then try saying it in Korean.',
          },
        ],
        starterSentenceKorean: '제 생각에는 ~입니다. 왜냐하면 ~이기 때문입니다.',
        starterSentenceNative: isKo
          ? '제 생각에는 ~입니다. 왜냐하면 ~이기 때문입니다.'
          : 'In my opinion, ~ because ~.',
      } as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedQuestionIdx(0);
    setRevealedHintSteps(2);
    loadScaffold(0, false);
  }, [stage.id, stage.teacherQuestions?.join('|'), lessonInfo.topic, studentLanguage, koreanLevel]);

  const handleSelectQuestion = (idx: number) => {
    setSelectedQuestionIdx(idx);
    setRevealedHintSteps(2);
    loadScaffold(idx, false);
  };

  const handleRevealNextHint = () => {
    if (aiScaffold?.scaffoldingSteps) {
      setRevealedHintSteps((prev) => Math.min(prev + 1, aiScaffold.scaffoldingSteps.length));
    }
  };

  const handleSpeak = (text: string) => {
    speakKoreanText(text);
  };

  const labels: Record<LanguageCode, {
    categoryBadge: string;
    questionSelectorPrefix: string;
    nativeQuestionLabel: string;
    koreanQuestionLabel: string;
    listenTeacherKorean: string;
    thinkingScaffoldTitle: string;
    stepsOpenLabel: string;
    thinkPointLabel: string;
    nextStepLabel: string;
    bottomEncourage: string;
    moveToSpeechMenu: string;
  }> = {
    en: {
      categoryBadge: 'Understanding Teacher’s Questions',
      questionSelectorPrefix: 'Question',
      nativeQuestionLabel: 'Question Meaning (What the teacher is asking)',
      koreanQuestionLabel: 'Teacher’s Original Korean Question in Class',
      listenTeacherKorean: 'Listen to Korean question sound',
      thinkingScaffoldTitle: 'Step-by-Step Thinking Hints (Scaffolding)',
      stepsOpenLabel: 'steps unlocked',
      thinkPointLabel: 'Things to think about:',
      nextStepLabel: 'Show Next Thinking Step',
      bottomEncourage: 'Ready with your thoughts? Express them in Korean in Menu 4!',
      moveToSpeechMenu: 'Go to Menu 4 "How do I say it"',
    },
    vi: {
      categoryBadge: 'Hiểu câu hỏi của thầy cô',
      questionSelectorPrefix: 'Câu hỏi',
      nativeQuestionLabel: 'Ý nghĩa câu hỏi (Thầy cô đang hỏi điều gì)',
      koreanQuestionLabel: 'Câu hỏi tiếng Hàn của thầy cô trong lớp',
      listenTeacherKorean: 'Nghe phát âm câu hỏi tiếng Hàn',
      thinkingScaffoldTitle: 'Gợi ý suy nghĩ từng bước (Không tiết lộ đáp án)',
      stepsOpenLabel: 'bước đã mở',
      thinkPointLabel: 'Điều cần suy nghĩ:',
      nextStepLabel: 'Xem bước gợi ý tiếp theo',
      bottomEncourage: 'Em đã có suy nghĩ của mình chưa? Hãy chuyển sang mục 4 để nói bằng tiếng Hàn nhé!',
      moveToSpeechMenu: 'Đến mục 4 "Nói bằng tiếng Hàn như thế nào"',
    },
    ru: {
      categoryBadge: 'Понимание вопроса учителя',
      questionSelectorPrefix: 'Вопрос',
      nativeQuestionLabel: 'Смысл вопроса (О чем спрашивает учитель)',
      koreanQuestionLabel: 'Вопрос учителя на корейском языке в классе',
      listenTeacherKorean: 'Прослушать корейский вопрос',
      thinkingScaffoldTitle: 'Пошаговые подсказки для размышления',
      stepsOpenLabel: 'шагов открыто',
      thinkPointLabel: 'Над чем подумать:',
      nextStepLabel: 'Показать следующий шаг',
      bottomEncourage: 'Появилась мысль? Переходи в раздел 4, чтобы сказать это по-корейски!',
      moveToSpeechMenu: 'Перейти в раздел 4 «Как сказать это по-корейски»',
    },
    'uz-Latn': {
      categoryBadge: 'O‘qituvchining savolini tushunish',
      questionSelectorPrefix: 'Savol',
      nativeQuestionLabel: 'Savolning ma’nosi (O‘qituvchi nima deb so‘ramoqda)',
      koreanQuestionLabel: 'O‘qituvchining darsdagi asl koreyscha savoli',
      listenTeacherKorean: 'Koreyscha savol ovozini tinglash',
      thinkingScaffoldTitle: 'Bosqichma-bosqich fikrlash maslahatlari',
      stepsOpenLabel: 'qadam ochildi',
      thinkPointLabel: 'O‘ylab ko‘rish kerak bo‘lgan jihat:',
      nextStepLabel: 'Keyingi fikrlash qadamini ko‘rish',
      bottomEncourage: 'Fikringiz tayyormi? Uni 4-bo‘limda koreyscha aytishni mashq qiling!',
      moveToSpeechMenu: '4-bo‘lim "Koreyscha qanday aytiladi"ga o‘tish',
    },
    'uz-Cyrl': {
      categoryBadge: 'Ўқитувчининг саволини тушуниш',
      questionSelectorPrefix: 'Савол',
      nativeQuestionLabel: 'Саволнинг маъноси (Ўқитувчи нима деб сўрамоқда)',
      koreanQuestionLabel: 'Ўқитувчининг дарсдаги асл корейсча саволи',
      listenTeacherKorean: 'Корейсча савол овозини тинглаш',
      thinkingScaffoldTitle: 'Босқичма-босқич фикрлаш маслаҳатлари',
      stepsOpenLabel: 'қадам очилди',
      thinkPointLabel: 'Ўйлаб кўриш керак бўлган жиҳат:',
      nextStepLabel: 'Кейинги фикрлаш қадамини кўриш',
      bottomEncourage: 'Фикрингиз тайёрми? Уни 4-бўлимда корейсча айтишни машқ қилинг!',
      moveToSpeechMenu: '4-бўлим "Корейсча қандай айтилади"га ўтиш',
    },
    'zh-Hans': {
      categoryBadge: '理解老师的提问',
      questionSelectorPrefix: '提问',
      nativeQuestionLabel: '问题的含义（老师在问什么）',
      koreanQuestionLabel: '老师在课堂上的韩语提问原文',
      listenTeacherKorean: '听老师韩语提问发音',
      thinkingScaffoldTitle: '阶梯式思考提示（不直接给答案）',
      stepsOpenLabel: '步已展开',
      thinkPointLabel: '需要思考的要点：',
      nextStepLabel: '展开下一个思考提示',
      bottomEncourage: '有自己的想法了吗？在第4项练习用韩语告诉大家吧！',
      moveToSpeechMenu: '前往第4项“怎么用韩语表达”',
    },
    'zh-Hant': {
      categoryBadge: '理解老師的提問',
      questionSelectorPrefix: '提問',
      nativeQuestionLabel: '問題的涵義（老師在問什麼）',
      koreanQuestionLabel: '老師在課堂上的韓語提問原文',
      listenTeacherKorean: '聽老師韓語提問發音',
      thinkingScaffoldTitle: '階梯式思考提示（不直接給答案）',
      stepsOpenLabel: '步已展開',
      thinkPointLabel: '需要思考的要點：',
      nextStepLabel: '展開下一個思考提示',
      bottomEncourage: '有自己的想法了嗎？在第4項練習用韓語告訴大家吧！',
      moveToSpeechMenu: '前往第4項「怎麼用韓語表達」',
    },
    ko: {
      categoryBadge: '선생님의 질문 생각하기',
      questionSelectorPrefix: '질문',
      nativeQuestionLabel: '질문의 뜻',
      koreanQuestionLabel: '선생님의 한국어 질문 원문',
      listenTeacherKorean: '질문 듣기',
      thinkingScaffoldTitle: '단계별 생각 힌트 (비계 설정)',
      stepsOpenLabel: '단계 열림',
      thinkPointLabel: '생각해 볼 점:',
      nextStepLabel: '다음 힌트 보기',
      bottomEncourage: '생각이 떠올랐다면 다음 메뉴에서 한국어로 말할 준비를 해보세요!',
      moveToSpeechMenu: '4번 메뉴 \'어떻게 말해요?\' 로 이동',
    },
  };

  const text = labels[studentLanguage] || labels.en;

  return (
    <div className="space-y-5">
      {/* 1. Header Card & Question Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                {text.categoryBadge}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {studentLanguage === 'ko' ? ui.menu3.titleKo : `${ui.menu3.titleNative} (${ui.menu3.titleKo})`}
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
                  onClick={() => handleSelectQuestion(idx)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    selectedQuestionIdx === idx
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {text.questionSelectorPrefix} {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Primary Question Display Card: Native language prominent! */}
        <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-200/80 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-purple-600" />
              <span>{text.nativeQuestionLabel}</span>
            </span>
          </div>

          {/* Prominent Question in student's native language */}
          <h4 className="text-base sm:text-xl font-bold text-slate-900 leading-snug mb-3">
            "{aiScaffold?.questionInNative || currentNativeQuestion}"
          </h4>

          {/* Companion Korean Question with Audio sound button */}
          <div className="p-3 bg-white/90 rounded-xl border border-purple-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-800 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors shrink-0 self-start sm:self-center shadow-2xs"
              title="한국어 질문 발음 듣기"
            >
              <Volume2 className="w-3.5 h-3.5 text-purple-600" />
              <span>{text.listenTeacherKorean}</span>
            </button>
          </div>
        </div>

        {/* AI Educational Safety Guarantee Notice */}
        <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 mb-5 text-xs text-amber-900 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            {ui.notices.aiSafetyNotice}
          </div>
        </div>

        {/* Step-by-Step Thinking Hints (Scaffolding) - Native Language first! */}
        {loading ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-purple-500" />
            <span className="text-xs">Preparing thinking hints...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => loadScaffold(selectedQuestionIdx, true)}
              className="mt-2 text-xs font-semibold text-amber-900 underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{ui.buttons.retry}</span>
            </button>
          </div>
        ) : aiScaffold?.scaffoldingSteps ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                {text.thinkingScaffoldTitle}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {revealedHintSteps} / {aiScaffold.scaffoldingSteps.length} {text.stepsOpenLabel}
              </span>
            </div>

            <div className="space-y-3">
              {aiScaffold.scaffoldingSteps.slice(0, revealedHintSteps).map((step, sIdx) => (
                <div
                  key={sIdx}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-300 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center">
                      {step.stepNumber}
                    </span>
                    {/* Native guidance prominent */}
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {step.guideNative || step.guideKo}
                    </span>
                  </div>

                  {studentLanguage !== 'ko' && (
                    <p className="text-[11px] text-slate-500 pl-7 mb-2">
                      [한국어 비계]: {step.guideKo}
                    </p>
                  )}

                  <div className="pl-7 pt-2 border-t border-slate-100 flex items-start gap-2 text-xs sm:text-sm text-purple-950 font-medium">
                    <span className="text-purple-600 font-bold shrink-0">👉 {text.thinkPointLabel}</span>
                    <span>{step.promptToThink}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Next hint reveal button */}
            {revealedHintSteps < aiScaffold.scaffoldingSteps.length && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleRevealNextHint}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200 shadow-2xs"
                >
                  <span>{text.nextStepLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* Link to Menu 4 */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-slate-600">
            {text.bottomEncourage}
          </span>
          <span className="text-xs font-bold text-purple-700">
            {text.moveToSpeechMenu}
          </span>
        </div>
      </div>
    </div>
  );
};
