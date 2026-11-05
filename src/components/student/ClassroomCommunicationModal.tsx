import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  X,
  Sparkles,
  Bookmark,
  Check,
  Maximize2,
  Minimize2,
  Users,
  AlertCircle,
} from 'lucide-react';
import {
  LanguageCode,
  KoreanLevel,
} from '../../types/lesson';
import {
  translateDialogue,
  speakKoreanText,
  saveNotebookItem,
} from '../../services/apiService';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
} from '../../utils/speechUtils';

interface ClassroomCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentLanguage: LanguageCode;
  koreanLevel: KoreanLevel;
  lessonTopic: string;
  classCode: string;
  studentId: string;
}

type VoiceStatus = 'idle' | 'listening' | 'recognized' | 'failed';

export const ClassroomCommunicationModal: React.FC<ClassroomCommunicationModalProps> = ({
  isOpen,
  onClose,
  studentLanguage,
  lessonTopic,
  classCode,
  studentId,
}) => {
  // Mode: 'speak' (Student native -> Korean) or 'listen' (Korean -> Student native)
  const [mode, setMode] = useState<'speak' | 'listen'>('speak');
  const [inputText, setInputText] = useState<string>('');
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [recognizer, setRecognizer] = useState<{ start: () => void; stop: () => void } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    translatedText: string;
    politeAlternative?: string;
    pronunciation?: string;
  } | null>(null);
  const [isBigDisplay, setIsBigDisplay] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.85);

  const speechSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    if (!isOpen) {
      if (voiceStatus === 'listening' && recognizer) {
        recognizer.stop();
      }
      setVoiceStatus('idle');
      setVoiceError(null);
      setTranslationError(null);
      setTtsError(null);
      setIsBigDisplay(false);
      setResult(null);
      setInputText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1-4: Mic click -> Permission check -> Start recognition in selected language -> Display recognized text for user editing
  const handleToggleVoice = async () => {
    setVoiceError(null);
    setTtsError(null);

    if (voiceStatus === 'listening') {
      recognizer?.stop();
      setVoiceStatus(inputText.trim() ? 'recognized' : 'idle');
      return;
    }

    if (!speechSupported) {
      setVoiceStatus('failed');
      setVoiceError('현재 브라우저에서는 음성 인식이 지원되지 않습니다. Chrome 브라우저를 사용하거나 아래 입력창에 직접 텍스트를 입력해 주세요.');
      return;
    }

    // Request microphone permission if available, but still allow SpeechRecognition (Google engine) to try
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (permErr: any) {
        const errName = permErr?.name || '';
        if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
          setVoiceStatus('failed');
          setVoiceError('연결된 마이크를 찾을 수 없습니다. 마이크 연결을 확인하거나 아래 입력창에 직접 입력해 주세요.');
          return;
        }
        // For NotAllowedError in iframe, continue to SpeechRecognition.start() so Chrome's built-in engine can prompt
      }
    }

    const recLang = mode === 'speak' ? studentLanguage : 'ko';
    const rec = createSpeechRecognizer(
      recLang,
      (text, isFinal) => {
        setInputText(text);
        if (isFinal) {
          setVoiceStatus('recognized');
        }
      },
      (errMsg) => {
        setVoiceStatus('failed');
        setVoiceError(errMsg);
      },
      () => {
        setVoiceStatus((prev) => (prev === 'listening' ? (inputText.trim() ? 'recognized' : 'idle') : prev));
      }
    );

    if (rec) {
      setRecognizer(rec);
      setVoiceStatus('listening');
      rec.start();
    } else {
      setVoiceStatus('failed');
      setVoiceError('음성 인식을 시작할 수 없습니다. 텍스트로 직접 입력해 주세요.');
    }
  };

  // Step 6-8: User clicks Translate -> Gemini translates confirmed text -> Display result
  const handleTranslate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    // Never translate while recognition is still failing without text
    if (voiceStatus === 'listening' && recognizer) {
      recognizer.stop();
      setVoiceStatus('recognized');
    }

    setLoading(true);
    setTranslationError(null);
    setTtsError(null);
    setResult(null);

    try {
      const direction = mode === 'speak' ? 'native_to_korean' : 'korean_to_native';
      const data = await translateDialogue(
        inputText.trim(),
        direction,
        studentLanguage,
        lessonTopic
      );
      if (data.error || !data.translatedText) {
        setTranslationError(data.error || '번역에 실패했습니다. 다시 시도해 주세요.');
      } else {
        setResult(data);
      }
    } catch {
      setTranslationError('번역 중 오류가 발생했습니다. 네트워크 연결을 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  // Step 9: Audio playback with distinct error handling
  const handleSpeak = (text: string) => {
    setTtsError(null);
    const ok = speakKoreanText(text, speechRate);
    if (!ok) {
      setTtsError('현재 브라우저에서 음성 재생(TTS)을 지원하지 않거나 재생에 실패했습니다.');
    }
  };

  const handleSaveToNotebook = async () => {
    if (!result) return;
    try {
      const res = await saveNotebookItem(classCode, studentId, {
        type: mode === 'speak' ? 'my_sentence' : 'expression',
        koreanText: mode === 'speak' ? result.translatedText : inputText,
        nativeText: mode === 'speak' ? inputText : result.translatedText,
        pronunciation: result.pronunciation,
        subjectTopic: lessonTopic,
      });
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Save to notebook failed:', err);
    }
  };

  const titles: Record<LanguageCode, {
    modalTitle: string;
    speakTab: string;
    listenTab: string;
    speakPlaceholder: string;
    listenPlaceholder: string;
    translateBtn: string;
    bigDisplayBtn: string;
    saveNotebookBtn: string;
    slowAudio: string;
    normalAudio: string;
    closeBig: string;
    friendSentenceLabel: string;
    teacherSentenceLabel: string;
  }> = {
    en: {
      modalTitle: 'Classroom Dialogue Helper (Talk with Friends & Teacher)',
      speakTab: '1. Speak to Friends (English → Korean)',
      listenTab: '2. Understand Friend/Teacher (Korean → English)',
      speakPlaceholder: 'Type or speak in English, then review/edit before translating...',
      listenPlaceholder: 'Type or speak the Korean phrase you heard in class...',
      translateBtn: 'Translate Confirmed Text',
      bigDisplayBtn: 'Show Big to Classmate',
      saveNotebookBtn: 'Save to Notebook',
      slowAudio: 'Slow',
      normalAudio: 'Normal',
      closeBig: 'Close Big Display',
      friendSentenceLabel: 'To friend (Friendly)',
      teacherSentenceLabel: 'To teacher (Polite)',
    },
    vi: {
      modalTitle: 'Trợ thủ giao tiếp trong lớp (Nói chuyện với bạn & Thầy cô)',
      speakTab: '1. Nói với bạn (Tiếng Việt → Tiếng Hàn)',
      listenTab: '2. Hiểu bạn/thầy cô nói (Tiếng Hàn → Tiếng Việt)',
      speakPlaceholder: 'Nhập hoặc nói bằng tiếng Việt, kiểm tra lại rồi bấm Dịch...',
      listenPlaceholder: 'Nhập hoặc nói câu tiếng Hàn em vừa nghe được trong lớp...',
      translateBtn: 'Dịch văn bản đã xác nhận',
      bigDisplayBtn: 'Hiện chữ lớn cho bạn xem',
      saveNotebookBtn: 'Lưu vào sổ tay',
      slowAudio: 'Chậm',
      normalAudio: 'Bình thường',
      closeBig: 'Đóng màn hình lớn',
      friendSentenceLabel: 'Nói với bạn (Thân mật)',
      teacherSentenceLabel: 'Nói với thầy cô (Kính ngữ)',
    },
    ru: {
      modalTitle: 'Помощник общения в классе (Разговор с друзьями и учителем)',
      speakTab: '1. Сказать друзьям (Русский → Корейский)',
      listenTab: '2. Понять друга/учителя (Корейский → Русский)',
      speakPlaceholder: 'Напишите или произнесите по-русски, проверьте текст и нажмите Перевести...',
      listenPlaceholder: 'Напишите или продиктуйте фразу на корейском, которую вы услышали...',
      translateBtn: 'Перевести подтверждённый текст',
      bigDisplayBtn: 'Показать крупно другу',
      saveNotebookBtn: 'Сохранить в тетрадь',
      slowAudio: 'Медленно',
      normalAudio: 'Обычно',
      closeBig: 'Закрыть крупный экран',
      friendSentenceLabel: 'Другу (Дружеский)',
      teacherSentenceLabel: 'Учителю (Вежливый)',
    },
    'uz-Latn': {
      modalTitle: 'Sinfdoshlar va o‘qituvchi bilan muloqot yordamchisi',
      speakTab: '1. Do‘stimga aytish (O‘zbekcha → Koreyscha)',
      listenTab: '2. Do‘st/o‘qituvchini tushunish (Koreyscha → O‘zbekcha)',
      speakPlaceholder: 'O‘zbek tilida yozing yoki ayting, matnni tekshirib Tarjima qilishni bosing...',
      listenPlaceholder: 'Sinfda eshitgan koreyscha gapingizni yozing yoki ayting...',
      translateBtn: 'Tasdiqlangan matnni tarjima qilish',
      bigDisplayBtn: 'Partadoshga katta harfda ko‘rsatish',
      saveNotebookBtn: 'Daftarga saqlash',
      slowAudio: 'Sekin',
      normalAudio: 'Oddiy',
      closeBig: 'Katta oynani yopish',
      friendSentenceLabel: 'Do‘stga (Samimiy)',
      teacherSentenceLabel: 'O‘qituvchiga (Xushmuomala)',
    },
    'uz-Cyrl': {
      modalTitle: 'Синфдошлар ва ўқитувчи билан мулоқот ёрдамчиси',
      speakTab: '1. Дўстимга айтиш (Ўзбекча → Корейсча)',
      listenTab: '2. Дўст/ўқитувчини тушуниш (Корейсча → Ўзбекча)',
      speakPlaceholder: 'Ўзбек тилида ёзинг ёки айтинг, матнни текшириб Таржима қилишни босинг...',
      listenPlaceholder: 'Синфда эшитган корейсча гапингизни ёзинг ёки айтинг...',
      translateBtn: 'Тасдиқланган матнни таржима қилиш',
      bigDisplayBtn: 'Партадошга катта ҳарфда кўрсатиш',
      saveNotebookBtn: 'Дафтарга сақлаш',
      slowAudio: 'Секин',
      normalAudio: 'Оддий',
      closeBig: 'Катта ойнани ёпиш',
      friendSentenceLabel: 'Дўстга (Самимий)',
      teacherSentenceLabel: 'Ўқитувчига (Хушмуомала)',
    },
    'zh-Hans': {
      modalTitle: '课堂交流小帮手（与同学、老师对话）',
      speakTab: '1. 对同桌/朋友说（中文 → 韩语）',
      listenTab: '2. 听懂朋友/老师的话（韩语 → 中文）',
      speakPlaceholder: '用中文输入或语音输入，确认文字后点击翻译...',
      listenPlaceholder: '输入或说出你在课堂上听到的韩语句子...',
      translateBtn: '翻译确认后的文字',
      bigDisplayBtn: '大字卡展示给同桌看',
      saveNotebookBtn: '保存到笔记本',
      slowAudio: '慢速',
      normalAudio: '正常',
      closeBig: '关闭大字展示',
      friendSentenceLabel: '对朋友说（日常口语）',
      teacherSentenceLabel: '对老师说（礼貌敬语）',
    },
    'zh-Hant': {
      modalTitle: '課堂交流小幫手（與同學、老師對話）',
      speakTab: '1. 對同桌/朋友說（中文 → 韓語）',
      listenTab: '2. 聽懂朋友/老師的話（韓語 → 中文）',
      speakPlaceholder: '用中文輸入或語音輸入，確認文字後點擊翻譯...',
      listenPlaceholder: '輸入或說出你在課堂上聽到的韓語句子...',
      translateBtn: '翻譯確認後的文字',
      bigDisplayBtn: '大字卡展示給同桌看',
      saveNotebookBtn: '保存到筆記本',
      slowAudio: '慢速',
      normalAudio: '正常',
      closeBig: '關閉大字展示',
      friendSentenceLabel: '對朋友說（日常口語）',
      teacherSentenceLabel: '對老師說（禮貌敬語）',
    },
    ko: {
      modalTitle: '교실 의사소통 도우미 (친구·선생님과 대화)',
      speakTab: '1. 친구에게 하고 싶은 말 (모국어 → 한국어)',
      listenTab: '2. 친구나 선생님이 한 말 이해하기 (한국어 → 모국어)',
      speakPlaceholder: '전하고 싶은 말을 입력하거나 마이크로 말한 뒤, 내용을 확인하고 번역하세요...',
      listenPlaceholder: '교실에서 들은 한국어 말을 입력하거나 마이크로 들려주세요...',
      translateBtn: '확인한 내용 번역하기',
      bigDisplayBtn: '친구에게 크게 보여주기',
      saveNotebookBtn: '노트에 저장',
      slowAudio: '느리게',
      normalAudio: '보통',
      closeBig: '크게 보기 닫기',
      friendSentenceLabel: '친구에게 (반말/친근한 말)',
      teacherSentenceLabel: '선생님께 (존댓말)',
    },
  };

  const t = titles[studentLanguage] || titles.en;

  if (isBigDisplay && result) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 bg-amber-500 text-white animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-white" />
            <span className="text-lg font-bold">친구에게 보여주세요 (Show to Classmate)</span>
          </div>
          <button
            type="button"
            onClick={() => setIsBigDisplay(false)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
            <span>{t.closeBig}</span>
          </button>
        </div>

        <div className="my-auto text-center space-y-6 max-w-4xl mx-auto">
          <p className="text-4xl sm:text-6xl font-black leading-tight tracking-wide drop-shadow-sm">
            "{result.translatedText}"
          </p>
          {result.pronunciation && (
            <p className="text-xl sm:text-2xl font-medium text-amber-100">
              [{result.pronunciation}]
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handleSpeak(result.translatedText)}
            className="flex items-center gap-2 px-6 py-3.5 bg-white text-amber-900 rounded-xl font-bold shadow-lg hover:bg-amber-50 transition-colors text-base"
          >
            <Volume2 className="w-5 h-5 text-amber-600" />
            <span>소리로 들려주기 (Speak Audio)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">{t.modalTitle}</h3>
              <p className="text-xs text-sky-100">주제: {lessonTopic}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Tabs: Speak vs Listen */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('speak');
                setResult(null);
                setInputText('');
                setVoiceStatus('idle');
                setVoiceError(null);
                setTranslationError(null);
              }}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                mode === 'speak'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.speakTab}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('listen');
                setResult(null);
                setInputText('');
                setVoiceStatus('idle');
                setVoiceError(null);
                setTranslationError(null);
              }}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                mode === 'listen'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.listenTab}
            </button>
          </div>

          {/* Voice Recognition Status Badge */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">
              입력 언어: <strong className="text-slate-900">{mode === 'speak' ? studentLanguage.toUpperCase() : 'KO (한국어)'}</strong>
            </span>
            <div className="flex items-center gap-2">
              {voiceStatus === 'listening' && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold animate-pulse">
                  ● 듣는 중 (Listening...)
                </span>
              )}
              {voiceStatus === 'recognized' && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                  ✓ 인식 완료 (인식된 문장을 확인·수정 후 번역하세요)
                </span>
              )}
              {voiceStatus === 'failed' && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                  ! 인식 실패 (텍스트로 직접 입력 가능)
                </span>
              )}
            </div>
          </div>

          {/* Voice Recognition Error Banner */}
          {voiceError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{voiceError}</span>
            </div>
          )}

          {/* Input form */}
          <form onSubmit={handleTranslate} className="space-y-3">
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={mode === 'speak' ? t.speakPlaceholder : t.listenPlaceholder}
                rows={3}
                className="w-full text-sm font-medium p-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-sky-500 transition-colors text-slate-900 pr-12"
              />

              <button
                type="button"
                onClick={handleToggleVoice}
                className={`absolute right-3 bottom-3 p-2.5 rounded-xl transition-all ${
                  voiceStatus === 'listening'
                    ? 'bg-red-500 text-white animate-pulse'
                    : speechSupported
                    ? 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                    : 'bg-slate-200 text-slate-500'
                }`}
                title={voiceStatus === 'listening' ? '음성인식 중지' : '음성인식 시작 (Speak Voice)'}
              >
                {voiceStatus === 'listening' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.translateBtn}</span>
                </>
              )}
            </button>
          </form>

          {/* Translation Error Banner */}
          {translationError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{translationError}</span>
            </div>
          )}

          {/* TTS Playback Error Banner */}
          {ttsError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{ttsError}</span>
            </div>
          )}

          {/* Translation Result Card */}
          {result && (
            <div className="p-4 bg-sky-50/70 rounded-xl border border-sky-200/80 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-800 uppercase tracking-wide">
                  {mode === 'speak' ? '한국어 표현 (Korean)' : '나의 언어 번역 (Translated)'}
                </span>

                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-sky-200 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setSpeechRate(0.75)}
                    className={`px-2 py-0.5 rounded ${
                      speechRate === 0.75 ? 'bg-sky-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    {t.slowAudio} 0.75x
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeechRate(1.0)}
                    className={`px-2 py-0.5 rounded ${
                      speechRate === 1.0 ? 'bg-sky-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    {t.normalAudio} 1.0x
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-sky-100 shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">
                      {mode === 'speak' ? t.friendSentenceLabel : '번역 결과'}
                    </span>
                    <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      "{result.translatedText}"
                    </p>
                    {result.pronunciation && (
                      <p className="text-xs text-sky-700 font-medium mt-1">
                        [{result.pronunciation}]
                      </p>
                    )}
                  </div>

                  {mode === 'speak' && (
                    <button
                      type="button"
                      onClick={() => handleSpeak(result.translatedText)}
                      className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs shrink-0 transition-colors"
                      title="소리 듣기"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                {mode === 'speak' && (
                  <button
                    type="button"
                    onClick={() => setIsBigDisplay(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>{t.bigDisplayBtn}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveToNotebook}
                  disabled={savedSuccess}
                  className={`flex items-center gap-1.5 px-3 py-2 font-bold text-xs rounded-xl transition-colors ${
                    savedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>저장 완료!</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t.saveNotebookBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
