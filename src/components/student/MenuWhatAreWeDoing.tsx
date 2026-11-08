import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  RefreshCw,
  BookOpen,
  Users,
  AlertCircle,
  HelpCircle,
  Globe,
} from 'lucide-react';
import {
  LessonInfo,
  LessonStage,
  LanguageCode,
  KoreanLevel,
  AIExplainCurrentResponse,
} from '../../types/lesson';
import { UI_STRINGS } from '../../utils/i18n';
import { fetchCurrentExplanation, speakKoreanText, saveNotebookItem } from '../../services/apiService';
import { getLocalizedLessonInfo, getLocalizedStage } from '../../utils/lessonLocalization';
import { Bookmark, Check } from 'lucide-react';
import { romanizeKorean, isMostlyKorean } from '../../utils/romanize';

interface MenuWhatAreWeDoingProps {
  lessonInfo: LessonInfo;
  stage: LessonStage;
  studentLanguage: LanguageCode;
  koreanLevel: KoreanLevel;
  classCode?: string;
  studentId?: string;
}

export const MenuWhatAreWeDoing: React.FC<MenuWhatAreWeDoingProps> = ({
  lessonInfo,
  stage,
  studentLanguage,
  koreanLevel,
  classCode,
  studentId,
}) => {
  const ui = UI_STRINGS[studentLanguage] || UI_STRINGS.en;
  const isDefaultLesson = lessonInfo.topic === '지능정보화로 달라진 생활 모습 살펴보기';
  const localizedInfo = isDefaultLesson ? getLocalizedLessonInfo(studentLanguage) : null;
  const localizedStage = isDefaultLesson ? getLocalizedStage(stage.id, studentLanguage) : null;

  const [aiData, setAiData] = useState<AIExplainCurrentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [simplifyMore, setSimplifyMore] = useState<boolean>(false);
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);
  const [savedWords, setSavedWords] = useState<Record<string, boolean>>({});

  const handleSaveWord = async (korean: string, native?: string, pronunciation?: string) => {
    if (!classCode || !studentId) return;
    try {
      await saveNotebookItem(classCode, studentId, {
        type: 'word',
        koreanText: korean,
        nativeText: native || '',
        pronunciation: pronunciation || '',
        subjectTopic: lessonInfo.topic,
        stageId: stage.id,
      });
      setSavedWords((prev) => ({ ...prev, [korean]: true }));
      setTimeout(() => {
        setSavedWords((prev) => ({ ...prev, [korean]: false }));
      }, 2000);
    } catch (err) {
      console.error('Save word failed:', err);
    }
  };

  const loadExplanation = async (simpler = false, refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCurrentExplanation(
        lessonInfo,
        stage,
        studentLanguage,
        koreanLevel,
        simpler,
        refresh
      );
      setAiData(data);
    } catch (err: any) {
      console.error('Failed to load explanation:', err);
      setError('AI 설명을 불러오는 중 일시적인 문제가 생겼지만, 아래 수업 원문 자료를 확인할 수 있어요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSimplifyMore(false);
    loadExplanation(false, false);
  }, [stage.id, stage.currentActivity, lessonInfo.topic, studentLanguage, koreanLevel]);

  const handleSimplifyClick = () => {
    const nextState = !simplifyMore;
    setSimplifyMore(nextState);
    loadExplanation(nextState, true);
  };

  const handleSpeak = (text: string) => {
    setSpeakingWord(text);
    speakKoreanText(text);
    setTimeout(() => setSpeakingWord(null), 1500);
  };

  const labels: Record<LanguageCode, {
    textbookPageLabel: string;
    learningGoalLabel: string;
    currentStageBadge: string;
    nativeExplanationTitle: string;
    koreanClassroomTextTitle: string;
    listenKoreanText: string;
    easyKoreanTitle: string;
    vocabSectionTitle: string;
    vocabSectionSub: string;
    classroomActionLabel: string;
  }> = {
    en: {
      textbookPageLabel: 'Textbook pp.',
      learningGoalLabel: "Today's Learning Goal",
      currentStageBadge: 'Current Lesson Stage',
      nativeExplanationTitle: "What's Happening in Class Right Now",
      koreanClassroomTextTitle: 'Classroom Korean Activity Text',
      listenKoreanText: 'Listen (Audio)',
      easyKoreanTitle: 'Easy Korean Expression',
      vocabSectionTitle: 'Key Classroom Korean Vocabulary',
      vocabSectionSub: 'Listen and practice saying these words',
      classroomActionLabel: 'What to do right now in class',
    },
    vi: {
      textbookPageLabel: 'Sách giáo khoa tr.',
      learningGoalLabel: 'Mục tiêu bài học hôm nay',
      currentStageBadge: 'Giai đoạn bài học hiện tại',
      nativeExplanationTitle: 'Lớp học hiện đang làm gì',
      koreanClassroomTextTitle: 'Văn bản hoạt động tiếng Hàn trong lớp',
      listenKoreanText: 'Nghe phát âm',
      easyKoreanTitle: 'Diễn đạt tiếng Hàn dễ hiểu',
      vocabSectionTitle: 'Từ vựng tiếng Hàn trọng tâm trong lớp',
      vocabSectionSub: 'Nghe và tập phát âm các từ này',
      classroomActionLabel: 'Việc cần làm ngay trong lớp',
    },
    ru: {
      textbookPageLabel: 'Учебник стр.',
      learningGoalLabel: 'Цель сегодняшнего урока',
      currentStageBadge: 'Текущий этап урока',
      nativeExplanationTitle: 'Что сейчас происходит на уроке',
      koreanClassroomTextTitle: 'Текст задания на корейском в классе',
      listenKoreanText: 'Прослушать',
      easyKoreanTitle: 'Простое объяснение на корейском',
      vocabSectionTitle: 'Ключевые слова на корейском для урока',
      vocabSectionSub: 'Слушай и повторяй эти слова',
      classroomActionLabel: 'Что делать сейчас в классе',
    },
    'uz-Latn': {
      textbookPageLabel: 'Darslik',
      learningGoalLabel: 'Bugungi dars maqsadi',
      currentStageBadge: 'Hozirgi dars bosqichi',
      nativeExplanationTitle: 'Darsda hozir nimalar o‘rganilmoqda',
      koreanClassroomTextTitle: 'Sinfdagi koreyscha dars matni',
      listenKoreanText: 'Tinglash',
      easyKoreanTitle: 'Oson koreyscha ifoda',
      vocabSectionTitle: 'Darsdagi muhim koreyscha so‘zlar',
      vocabSectionSub: 'Eshiting va talaffuzni mashq qiling',
      classroomActionLabel: 'Hozir sinfda nima qilish kerak',
    },
    'uz-Cyrl': {
      textbookPageLabel: 'Дарслик',
      learningGoalLabel: 'Бугунги дарс мақсади',
      currentStageBadge: 'Ҳозирги дарс босқичи',
      nativeExplanationTitle: 'Дарсда ҳозир нималар ўрганилмоқда',
      koreanClassroomTextTitle: 'Синфдаги корейсча дарс матни',
      listenKoreanText: 'Тинглаш',
      easyKoreanTitle: 'Осон корейсча ифода',
      vocabSectionTitle: 'Дарсдаги муҳим корейсча сўзлар',
      vocabSectionSub: 'Эшитинг ва талаффузни машқ қилинг',
      classroomActionLabel: 'Ҳозир синфда нима қилиш керак',
    },
    'zh-Hans': {
      textbookPageLabel: '课本页码',
      learningGoalLabel: '今天的学习目标',
      currentStageBadge: '当前课堂环节',
      nativeExplanationTitle: '现在课堂正在进行的内容',
      koreanClassroomTextTitle: '课堂韩语活动原文',
      listenKoreanText: '听发音',
      easyKoreanTitle: '简易韩语表达',
      vocabSectionTitle: '课堂核心韩语单词',
      vocabSectionSub: '边听发音边跟读练习',
      classroomActionLabel: '现在在教室里要做的事',
    },
    'zh-Hant': {
      textbookPageLabel: '課本頁碼',
      learningGoalLabel: '今天的學習目標',
      currentStageBadge: '當前課堂環節',
      nativeExplanationTitle: '現在課堂正在進行的內容',
      koreanClassroomTextTitle: '課堂韓語活動原文',
      listenKoreanText: '聽發音',
      easyKoreanTitle: '簡易韓語表達',
      vocabSectionTitle: '課堂核心韓語單詞',
      vocabSectionSub: '邊聽發音邊跟讀練習',
      classroomActionLabel: '現在在教室裡要做的事',
    },
    ko: {
      textbookPageLabel: '교과서 쪽수',
      learningGoalLabel: '오늘의 학습 목표',
      currentStageBadge: '현재 수업 단계',
      nativeExplanationTitle: '지금 배우는 내용',
      koreanClassroomTextTitle: '교과서 활동 원문',
      listenKoreanText: '소리 듣기',
      easyKoreanTitle: '쉬운 한국어 설명',
      vocabSectionTitle: '오늘의 핵심 한국어 낱말',
      vocabSectionSub: '소리를 들으며 따라 읽어보세요',
      classroomActionLabel: '지금 교실에서 할 일',
    },
  };

  const text = labels[studentLanguage] || labels.en;

  const currentTopic = localizedInfo?.topic || lessonInfo.topic;
  const currentGoal = localizedInfo?.goal || lessonInfo.goal;
  const currentSubject = localizedInfo?.subject || lessonInfo.subject;
  const currentUnit = localizedInfo?.unit || lessonInfo.unit;

  const nativeActivity = localizedStage?.currentActivity || stage.currentActivity;
  const nativeStageTitle = localizedStage?.title || stage.title;

  return (
    <div className="space-y-5">
      {/* 1. Header Card: Subject & Goal in Native Language First */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
              {currentSubject}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {currentUnit} {lessonInfo.period ? `(${lessonInfo.period})` : ''}
            </span>
            {studentLanguage !== 'ko' && (
              <span className="text-[11px] text-slate-400">
                · {lessonInfo.subject}
              </span>
            )}
          </div>
          {lessonInfo.textbookPages && (
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {text.textbookPageLabel} {lessonInfo.textbookPages}
            </span>
          )}
        </div>

        {/* Topic Title */}
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
          {currentTopic}
        </h2>
        {studentLanguage !== 'ko' && (
          <p className="text-xs text-slate-500 mb-3">
            [한국어 주제]: {lessonInfo.topic}
          </p>
        )}

        {/* Learning Goal */}
        <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
          <BookOpen className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-950">{text.learningGoalLabel}: </span>
            <span className="font-medium text-slate-800">{currentGoal}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Explanation Card: Native Language Explanations Front and Center */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wide">
                {nativeStageTitle} ({stage.title})
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {studentLanguage === 'ko' ? ui.menu1.titleKo : `${ui.menu1.titleNative} (${ui.menu1.titleKo})`}
              </h3>
            </div>
          </div>
        </div>

        {/* Primary Explanation in Student's Native Language */}
        <div className="p-5 bg-sky-50/70 rounded-2xl border border-sky-200/80 mb-4">
          <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5 mb-2">
            <Globe className="w-4 h-4 text-sky-600" />
            <span>{text.nativeExplanationTitle}</span>
          </span>

          <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
            {aiData?.nativeExplanation || nativeActivity}
          </p>
        </div>

        {/* Classroom Korean Activity Text (Companion Reference) */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block mb-1">
                {text.koreanClassroomTextTitle}
              </span>
              <p className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                "{studentLanguage === 'ko' ? stage.currentActivity : (nativeActivity || aiData?.nativeExplanation || stage.currentActivity)}"
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSpeak(stage.currentActivity)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shrink-0"
              title="한국어 활동 원문 소리 듣기"
            >
              <Volume2 className="w-3.5 h-3.5 text-slate-600" />
              <span>{text.listenKoreanText}</span>
            </button>
          </div>
        </div>

        {/* Easy Korean Scaffolding */}
        {aiData?.easyKorean && (
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{text.easyKoreanTitle}</span>
              </span>
              <button
                type="button"
                onClick={() => handleSpeak(aiData.easyKorean)}
                className="text-xs text-amber-800 hover:text-amber-950 flex items-center gap-1 font-semibold"
              >
                <Volume2 className="w-3 h-3" />
                <span>{text.listenKoreanText}</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              {aiData.easyKorean}
            </p>
          </div>
        )}

        {/* Immediate Classroom Action */}
        <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-950 mb-4">
          <Users className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>{text.classroomActionLabel}:</strong> {aiData?.classroomAction || '교과서를 펴고 선생님과 칠판을 함께 바라보아요.'}
          </span>
        </div>

        {/* Tiered Simplification Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSimplifyClick}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              simplifyMore
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>
              {simplifyMore ? 'Show Standard Explanation' : ui.buttons.explainMoreSimply}
            </span>
          </button>

          <span className="text-xs text-slate-500">
            {ui.notices.joinClassNotice}
          </span>
        </div>
      </div>

      {/* 3. Key Classroom Vocabulary Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-800">
            {text.vocabSectionTitle}
          </span>
          <span className="text-xs text-slate-400">
            {text.vocabSectionSub}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {aiData?.keyVocabulary && aiData.keyVocabulary.length > 0 ? (
            aiData.keyVocabulary.map((vocab, vIdx) => {
              const isPlaying = speakingWord === vocab.korean;
              return (
                <div
                  key={vIdx}
                  className="flex flex-col p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-amber-300 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base font-bold text-slate-900">
                      {vocab.korean}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSpeak(vocab.korean)}
                        className={`p-1.5 rounded-md transition-colors ${
                          isPlaying
                            ? 'bg-amber-500 text-white'
                            : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                        title="소리 듣기"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      {classCode && studentId && (
                        <button
                          type="button"
                          onClick={() => handleSaveWord(vocab.korean, vocab.native, vocab.pronunciation)}
                          className={`p-1.5 rounded-md transition-colors ${
                            savedWords[vocab.korean]
                              ? 'bg-emerald-500 text-white'
                              : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                          }`}
                          title="노트에 저장"
                        >
                          {savedWords[vocab.korean] ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  {(() => {
                    const pron =
                      vocab.pronunciation && !isMostlyKorean(vocab.pronunciation)
                        ? vocab.pronunciation
                        : romanizeKorean(vocab.korean);
                    if (!pron) return null;
                    return (
                      <span className="text-[11px] font-mono text-amber-800 font-semibold mb-0.5">
                        [{pron}]
                      </span>
                    );
                  })()}
                  {vocab.native && (
                    <span className="text-xs font-medium text-slate-700">
                      {vocab.native}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            stage.keyVocabulary.map((word, wIdx) => (
              <div
                key={wIdx}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/50"
              >
                <span className="text-sm font-bold text-slate-800">{word}</span>
                <button
                  type="button"
                  onClick={() => handleSpeak(word)}
                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
