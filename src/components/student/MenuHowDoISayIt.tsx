import React, { useState } from 'react';
import {
  MessageSquare,
  Volume2,
  Sparkles,
  Send,
  Users,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  HeartHandshake,
  Bookmark,
  RotateCcw,
} from 'lucide-react';
import {
  LessonInfo,
  LessonStage,
  LanguageCode,
  KoreanLevel,
  AISpeechBridgeResponse,
} from '../../types/lesson';
import { UI_STRINGS } from '../../utils/i18n';
import { fetchSpeechBridge, speakKoreanText, saveNotebookItem } from '../../services/apiService';
import { getLocalizedStage } from '../../utils/lessonLocalization';
import { romanizeKorean, isMostlyKorean } from '../../utils/romanize';

interface MenuHowDoISayItProps {
  lessonInfo: LessonInfo;
  stage: LessonStage;
  studentLanguage: LanguageCode;
  koreanLevel: KoreanLevel;
  classCode?: string;
  studentId?: string;
}

export const MenuHowDoISayIt: React.FC<MenuHowDoISayItProps> = ({
  lessonInfo,
  stage,
  studentLanguage,
  koreanLevel,
  classCode,
  studentId,
}) => {
  const ui = UI_STRINGS[studentLanguage] || UI_STRINGS.en;
  const localizedStage = getLocalizedStage(stage.id, studentLanguage);

  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [speechData, setSpeechData] = useState<AISpeechBridgeResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.85);
  const [savedSentence, setSavedSentence] = useState<boolean>(false);

  const rawKoreanFrames =
    stage.sentenceFrames && stage.sentenceFrames.length > 0
      ? stage.sentenceFrames
      : ['옛날에는 ______했지만, 오늘날에는 ______해요.'];

  const nativeFrames =
    localizedStage?.sentenceFrames && localizedStage.sentenceFrames.length > 0
      ? localizedStage.sentenceFrames
      : rawKoreanFrames;

  const handleApplyFrame = (frame: string) => {
    setInputText((prev) => (prev ? `${prev} ${frame}` : frame));
  };

  const handleGenerateKorean = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchSpeechBridge(
        lessonInfo,
        stage,
        inputText,
        studentLanguage,
        koreanLevel
      );
      setSpeechData(data);
    } catch (err: any) {
      console.error('Speech bridge failed:', err);
      setError('한국어 표현을 만드는 중 일시적인 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    speakKoreanText(text, speechRate);
  };

  const handleSaveSentence = async (korean: string, type: 'my_sentence' | 'expression' = 'my_sentence') => {
    if (!classCode || !studentId) return;
    try {
      await saveNotebookItem(classCode, studentId, {
        type,
        koreanText: korean,
        nativeText: inputText,
        pronunciation: speechData?.pronunciationGuide,
        subjectTopic: lessonInfo.topic,
        stageId: stage.id,
      });
      setSavedSentence(true);
      setTimeout(() => setSavedSentence(false), 2000);
    } catch (err) {
      console.error('Save sentence failed:', err);
    }
  };

  const handleCopy = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const labels: Record<LanguageCode, {
    categoryBadge: string;
    starterFramesLabel: string;
    inputPromptLabel: string;
    inputPlaceholder: string;
    aiGuaranteeNote: string;
    generateButtonLabel: string;
    confirmedThoughtLabel: string;
    friendCardTitle: string;
    teacherCardTitle: string;
    audioListenLabel: string;
    copyLabel: string;
    vocabHeader: string;
    peerActionHeader: string;
  }> = {
    en: {
      categoryBadge: 'Say It in Korean to Friends & Teacher',
      starterFramesLabel: 'Need help starting? Tap a sentence starter frame:',
      inputPromptLabel: 'Write your thought in English (or your language):',
      inputPlaceholder: 'e.g. Robot vacuum cleaners make cleaning easy so we have more free time to read books.',
      aiGuaranteeNote: '* AI strictly preserves your own thought without adding claims or opinions you didn’t write.',
      generateButtonLabel: 'Turn into Korean Speech',
      confirmedThoughtLabel: 'Your Confirmed Idea:',
      friendCardTitle: 'To say to your classmate (Friendly / Casual Korean)',
      teacherCardTitle: 'To present to the teacher (Polite Korean)',
      audioListenLabel: 'Listen (Audio)',
      copyLabel: 'Copy',
      vocabHeader: 'Core Words in this Sentence',
      peerActionHeader: 'Classroom Participation Tip',
    },
    vi: {
      categoryBadge: 'Nói bằng tiếng Hàn với bạn bè & Thầy cô',
      starterFramesLabel: 'Nếu thấy khó bắt đầu, hãy nhấn vào khung câu mẫu:',
      inputPromptLabel: 'Viết suy nghĩ của em bằng tiếng Việt (hoặc ngôn ngữ của em):',
      inputPlaceholder: 'Ví dụ: Robot hút bụi giúp dọn dẹp dễ dàng hơn nên em có nhiều thời gian đọc sách hơn.',
      aiGuaranteeNote: '* AI giữ nguyên ý tưởng của em mà không tự ý thêm bớt ý kiến em chưa viết.',
      generateButtonLabel: 'Chuyển sang câu tiếng Hàn',
      confirmedThoughtLabel: 'Ý tưởng đã xác nhận của em:',
      friendCardTitle: 'Nói với bạn cùng bàn (Tiếng Hàn thân mật)',
      teacherCardTitle: 'Nói khi phát biểu với thầy cô (Tiếng Hàn kính ngữ)',
      audioListenLabel: 'Nghe phát âm',
      copyLabel: 'Sao chép',
      vocabHeader: 'Từ vựng cốt lõi trong câu',
      peerActionHeader: 'Lời khuyên khi tham gia vào lớp học',
    },
    ru: {
      categoryBadge: 'Говорим по-корейски с друзьями и учителем',
      starterFramesLabel: 'Трудно начать? Нажми на готовую речевую конструкцию:',
      inputPromptLabel: 'Напиши свою мысль на русском (или родном языке):',
      inputPlaceholder: 'Например: Робот-пылесос облегчает уборку, поэтому у нас больше свободного времени.',
      aiGuaranteeNote: '* ИИ точно сохраняет твою мысль, не добавляя мнений, которых ты не писал.',
      generateButtonLabel: 'Сформулировать по-корейски',
      confirmedThoughtLabel: 'Твоя подтвержденная мысль:',
      friendCardTitle: 'Сказать соседу по парте (Дружеский корейский)',
      teacherCardTitle: 'Сказать при ответе учителю (Вежливый корейский)',
      audioListenLabel: 'Прослушать',
      copyLabel: 'Копировать',
      vocabHeader: 'Ключевые слова в предложении',
      peerActionHeader: 'Совет для общения в классе',
    },
    'uz-Latn': {
      categoryBadge: 'Do‘stlar va o‘qituvchi bilan koreyscha gaplashish',
      starterFramesLabel: 'Boshlash qiyin bo‘lsa, tayyor gap qolipini bosing:',
      inputPromptLabel: 'Fikringizni o‘zbek tilida (yoki o‘z tilingizda) yozing:',
      inputPlaceholder: 'Masalan: Robot changyutgich tozalashni osonlashtiradi, shuning uchun kitob o‘qishga ko‘proq vaqt qoladi.',
      aiGuaranteeNote: '* AI siz yozmagan fikr yoki sabablarni qo‘shmasdan, faqat o‘z fikringizni ifodalaydi.',
      generateButtonLabel: 'Koreyscha jumlaga aylantirish',
      confirmedThoughtLabel: 'Tasdiqlangan fikringiz:',
      friendCardTitle: 'Partadoshga aytish uchun (Do‘stona koreyscha)',
      teacherCardTitle: 'O‘qituvchiga javob berish uchun (Xushmuomala koreyscha)',
      audioListenLabel: 'Tinglash',
      copyLabel: 'Nusxa olish',
      vocabHeader: 'Jumlada ishlatilgan muhim so‘zlar',
      peerActionHeader: 'Darsda ishtirok etish bo‘yicha maslahat',
    },
    'uz-Cyrl': {
      categoryBadge: 'Дўстлар ва ўқитувчи билан корейсча гаплашиш',
      starterFramesLabel: 'Бошлаш қийин бўлса, тайёр гап қолипини босинг:',
      inputPromptLabel: 'Фикрингизни ўзбек тилида (ёки ўз тилингизда) ёзинг:',
      inputPlaceholder: 'Масалан: Робот чангютгич тозалашни осонлаштиради, шунинг учун китоб ўқишга кўпроқ вақт қолади.',
      aiGuaranteeNote: '* AI сиз ёзмаган фикр ёки сабабларни қўшмасдан, фақат ўз фикрингизни ифодалайди.',
      generateButtonLabel: 'Корейсча жумлага айлантириш',
      confirmedThoughtLabel: 'Тасдиқланган фикрингиз:',
      friendCardTitle: 'Партадошга айтиш учун (Дўстона корейсча)',
      teacherCardTitle: 'Ўқитувчига жавоб бериш учун (Хушмуомала корейсча)',
      audioListenLabel: 'Тинглаш',
      copyLabel: 'Нусха олиш',
      vocabHeader: 'Жумлада ишлатилган муҳим сўзлар',
      peerActionHeader: 'Дарсда иштирок этиш бўйича маслаҳат',
    },
    'zh-Hans': {
      categoryBadge: '用韩语和同学、老师交流',
      starterFramesLabel: '觉得起头有困难？点击句型支架：',
      inputPromptLabel: '用中文（或母语）写下你的想法：',
      inputPlaceholder: '例如：扫地机器人让打扫变得很轻松，所以我们有更多时间看书。',
      aiGuaranteeNote: '* AI将严格保留你的原意，绝不会随意添加你未表达的观点。',
      generateButtonLabel: '转换为韩语表达',
      confirmedThoughtLabel: '已确认的你的想法：',
      friendCardTitle: '告诉同桌或朋友时（亲切日常韩语）',
      teacherCardTitle: '向老师发言回答时（礼貌敬语韩语）',
      audioListenLabel: '听发音',
      copyLabel: '复制',
      vocabHeader: '句子中的核心单词',
      peerActionHeader: '课堂互动小提示',
    },
    'zh-Hant': {
      categoryBadge: '用韓語和同學、老師交流',
      starterFramesLabel: '覺得起頭有困難？點擊句型支架：',
      inputPromptLabel: '用中文（或母語）寫下你的想法：',
      inputPlaceholder: '例如：掃地機器人讓打掃變得很輕鬆，所以我們有更多時間看書。',
      aiGuaranteeNote: '* AI將嚴格保留你的原意，絕不會隨意添加你未表達的觀點。',
      generateButtonLabel: '轉換為韓語表達',
      confirmedThoughtLabel: '已確認的你的想法：',
      friendCardTitle: '告訴同桌或朋友時（親切日常韓語）',
      teacherCardTitle: '向老師發言回答時（禮貌敬語韓語）',
      audioListenLabel: '聽發音',
      copyLabel: '複製',
      vocabHeader: '句子中的核心單詞',
      peerActionHeader: '課堂互動小提示',
    },
    ko: {
      categoryBadge: '내 생각 한국어로 말하기',
      starterFramesLabel: '말하기가 어려울 땐 문장 틀을 눌러보세요:',
      inputPromptLabel: '내 모국어나 한국어로 내 생각을 적어보세요:',
      inputPlaceholder: '예: 로봇 청소기 덕분에 청소가 편해져서 책 읽을 시간이 많아져요.',
      aiGuaranteeNote: '* AI는 학생이 적은 생각만 바른 한국어로 이어주며 새 내용을 지어내지 않아요.',
      generateButtonLabel: '한국어로 바꿔 말하기',
      confirmedThoughtLabel: '확인한 내 생각:',
      friendCardTitle: '짝꿍에게 말할 때 (친구용)',
      teacherCardTitle: '선생님께 발표할 때 (존댓말)',
      audioListenLabel: '소리 듣기',
      copyLabel: '복사',
      vocabHeader: '문장에 쓰인 핵심 낱말',
      peerActionHeader: '실제 교실 참여하기',
    },
  };

  const text = labels[studentLanguage] || labels.en;

  return (
    <div className="space-y-5">
      {/* 1. Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                {text.categoryBadge}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {studentLanguage === 'ko' ? ui.menu4.titleKo : `${ui.menu4.titleNative} (${ui.menu4.titleKo})`}
              </h3>
            </div>
          </div>
        </div>

        {/* 2. Sentence Starter Frames (문장 틀 디딤돌) */}
        <div className="mb-5">
          <label className="text-xs font-bold text-slate-700 block mb-2">
            {text.starterFramesLabel}
          </label>
          <div className="flex flex-wrap gap-2">
            {nativeFrames.map((frame, fIdx) => (
              <button
                key={fIdx}
                type="button"
                onClick={() => handleApplyFrame(frame)}
                className="px-3 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl transition-all text-left shadow-2xs"
              >
                + "{frame}"
              </button>
            ))}
          </div>
        </div>

        {/* 3. Input Box for Student's Thought */}
        <form onSubmit={handleGenerateKorean} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              {text.inputPromptLabel}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={text.inputPlaceholder}
              rows={3}
              className="w-full p-3.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-slate-400 bg-slate-50/50 resize-none font-medium"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500">
              {text.aiGuaranteeNote}
            </span>
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-xs shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{text.generateButtonLabel}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* 4. Generated Korean Speech Bridge Result */}
        {speechData && (
          <div className="mt-6 space-y-4 pt-5 border-t border-slate-100">
            {/* Student thought confirmed */}
            <div className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{text.confirmedThoughtLabel} </span>
              <strong className="text-slate-900 font-bold">
                {speechData.studentThoughtConfirmed}
              </strong>
            </div>

            {/* Audio speed controls & save button */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/50">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <span>말하기 속도:</span>
                <button
                  type="button"
                  onClick={() => setSpeechRate(0.75)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    speechRate === 0.75 ? 'bg-amber-500 text-white shadow-2xs' : 'bg-white text-slate-700 border border-amber-200'
                  }`}
                >
                  느리게 0.75x
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechRate(1.0)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    speechRate === 1.0 ? 'bg-amber-500 text-white shadow-2xs' : 'bg-white text-slate-700 border border-amber-200'
                  }`}
                >
                  보통 1.0x
                </button>
              </div>

              {classCode && studentId && (
                <button
                  type="button"
                  onClick={() => handleSaveSentence(speechData.koreanSentenceEasy)}
                  disabled={savedSentence}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    savedSentence
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-amber-900 hover:bg-amber-100 border border-amber-300 shadow-2xs'
                  }`}
                >
                  {savedSentence ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>노트에 저장됨!</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                      <span>내 노트에 저장</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Speaking Card: Casual for Friends (with Audio TTS!) */}
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  <span>{text.friendCardTitle}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSpeak(speechData.koreanSentenceEasy)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white text-amber-800 hover:bg-amber-100 rounded-lg border border-amber-200 shadow-2xs"
                    title="소리 듣고 따라하기"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>{text.audioListenLabel}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSpeak(speechData.koreanSentenceEasy)}
                    className="p-1.5 bg-white text-amber-800 hover:bg-amber-100 rounded-lg border border-amber-200"
                    title="다시 듣기 (Repeat)"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(speechData.koreanSentenceEasy)}
                    className="p-1.5 bg-white text-amber-800 hover:bg-amber-100 rounded-lg border border-amber-200"
                    title={text.copyLabel}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <p className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                "{speechData.koreanSentenceEasy}"
              </p>
              {(() => {
                const guide =
                  speechData.pronunciationGuide && !isMostlyKorean(speechData.pronunciationGuide)
                    ? speechData.pronunciationGuide
                    : romanizeKorean(speechData.koreanSentenceEasy);
                if (!guide) return null;
                return (
                  <p className="text-xs font-mono text-amber-800 font-semibold tracking-wide">
                    [{guide}]
                  </p>
                );
              })()}
              {speechData.pronunciationTip && (
                <div className="mt-2 pt-2 border-t border-amber-200/50 text-[11px] text-amber-900 font-medium flex items-center gap-1.5">
                  <span className="font-bold text-amber-700">발음 꿀팁:</span>
                  <span>{speechData.pronunciationTip}</span>
                </div>
              )}
            </div>

            {/* Polite card removed per user request */}

            {/* Key vocabulary words used */}
            {speechData.keyWordsUsed && speechData.keyWordsUsed.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  {text.vocabHeader}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {speechData.keyWordsUsed.map((kw: { korean: string; native: string }, kwIdx: number) => (
                    <div
                      key={kwIdx}
                      className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {kw.korean}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {kw.native}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSpeak(kw.korean)}
                        className="text-slate-400 hover:text-amber-600 p-1 rounded"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Speaking encouragement prompt */}
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-950">
              <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>{text.peerActionHeader}: </strong>
                <span>{speechData.speakingTip || ui.buttons.shareWithFriend}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
