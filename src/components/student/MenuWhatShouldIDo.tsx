import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Sparkles,
  Users,
  Check,
  ListTodo,
  HelpCircle,
  X,
  Send,
} from 'lucide-react';
import {
  LessonStage,
  LanguageCode,
  KoreanLevel,
  TaskStatus,
  HelpReason,
} from '../../types/lesson';
import { UI_STRINGS } from '../../utils/i18n';
import { getLocalizedStage } from '../../utils/lessonLocalization';
import { updateStudentTaskStatus, translateDialogue } from '../../services/apiService';
import { syncStudentToFirestore } from '../../services/firebaseSync';

interface MenuWhatShouldIDoProps {
  stage: LessonStage;
  studentLanguage: LanguageCode;
  koreanLevel: KoreanLevel;
  classCode?: string;
  studentId?: string;
  isDefaultLesson?: boolean;
  initialTaskStates?: Record<string, { status: TaskStatus }>;
}

export const MenuWhatShouldIDo: React.FC<MenuWhatShouldIDoProps> = ({
  stage,
  studentLanguage,
  koreanLevel,
  classCode,
  studentId,
  isDefaultLesson = false,
  initialTaskStates,
}) => {
  const ui = UI_STRINGS[studentLanguage] || UI_STRINGS.en;
  const localizedStage = isDefaultLesson ? getLocalizedStage(stage.id, studentLanguage) : null;

  // Track task statuses: taskId -> TaskStatus
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatus>>(() => {
    const init: Record<string, TaskStatus> = {};
    if (initialTaskStates) {
      Object.entries(initialTaskStates).forEach(([k, v]) => {
        init[k] = v.status;
      });
    }
    return init;
  });

  React.useEffect(() => {
    if (initialTaskStates) {
      const next: Record<string, TaskStatus> = {};
      Object.entries(initialTaskStates).forEach(([k, v]) => {
        next[k] = v.status;
      });
      setTaskStatuses((prev) => ({ ...prev, ...next }));
    }
  }, [initialTaskStates]);

  const [syncNotice, setSyncNotice] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [activeHelpModalTask, setActiveHelpModalTask] = useState<{ idx: number; taskId: string } | null>(null);
  const [selectedReason, setSelectedReason] = useState<HelpReason>('dont_know_what_to_do');
  const [helpNote, setHelpNote] = useState<string>('');

  const rawKoreanTasks =
    stage.tasks && stage.tasks.length > 0
      ? stage.tasks
      : ['선생님의 설명을 듣고 교과서를 살펴봅니다.'];

  const [translatedTasks, setTranslatedTasks] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (studentLanguage === 'ko' || (localizedStage?.tasks && localizedStage.tasks.length === rawKoreanTasks.length)) {
      setTranslatedTasks(null);
      return;
    }
    Promise.all(
      rawKoreanTasks.map(async (task) => {
        const res = await translateDialogue(task, 'korean_to_native', studentLanguage, '수업 활동');
        return res.translatedText || task;
      })
    ).then((results) => {
      if (!cancelled) {
        setTranslatedTasks(results);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [stage.id, studentLanguage, rawKoreanTasks.join('|')]);

  const nativeTasks =
    localizedStage?.tasks && localizedStage.tasks.length === rawKoreanTasks.length
      ? localizedStage.tasks
      : (translatedTasks && translatedTasks.length === rawKoreanTasks.length ? translatedTasks : rawKoreanTasks);

  const handleSetStatus = async (
    idx: number,
    status: TaskStatus,
    reason?: HelpReason,
    note?: string
  ) => {
    const taskId = `${stage.id}-task-${idx}`;
    setTaskStatuses((prev) => ({
      ...prev,
      [taskId]: status,
    }));

    if (classCode && studentId) {
      try {
        const saved = localStorage.getItem('togetheron_student_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.taskStates = {
            ...(parsed.taskStates || {}),
            [taskId]: {
              taskId,
              stageId: stage.id,
              status,
              helpReason: reason,
              helpNote: note,
              updatedAt: Date.now(),
            },
          };
          localStorage.setItem('togetheron_student_session', JSON.stringify(parsed));
          void syncStudentToFirestore(classCode, parsed);
        }
      } catch {
        // ignore
      }
      const res = await updateStudentTaskStatus(
        classCode,
        studentId,
        taskId,
        stage.id,
        status,
        reason,
        note
      );
      if (res.success) {
        setSyncNotice({ type: 'ok', msg: '선생님 화면에 활동 상태가 저장되었습니다.' });
        setTimeout(() => setSyncNotice(null), 2500);
      } else {
        setSyncNotice({ type: 'err', msg: '상태 저장에 실패했습니다. 네트워크를 확인 후 다시 눌러주세요.' });
      }
    }
  };

  const handleOpenHelpModal = (idx: number) => {
    const taskId = `${stage.id}-task-${idx}`;
    setActiveHelpModalTask({ idx, taskId });
  };

  const handleSubmitHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHelpModalTask) return;
    await handleSetStatus(
      activeHelpModalTask.idx,
      'help_needed',
      selectedReason,
      helpNote
    );
    setActiveHelpModalTask(null);
    setHelpNote('');
  };

  const completedCount = rawKoreanTasks.filter(
    (_, idx) => taskStatuses[`${stage.id}-task-${idx}`] === 'done'
  ).length;
  const isAllCompleted =
    rawKoreanTasks.length > 0 && completedCount === rawKoreanTasks.length;

  const labels: Record<LanguageCode, {
    badge: string;
    progressText: string;
    peerMessage: string;
    koreanReferenceLabel: string;
    stepPrefix: string;
    congratsTitle: string;
    congratsDesc: string;
    statusDoing: string;
    statusDone: string;
    statusHelp: string;
    helpModalTitle: string;
    helpModalDesc: string;
    submitHelp: string;
    cancel: string;
    optionalNotePlaceholder: string;
    reasons: Record<HelpReason, string>;
  }> = {
    en: {
      badge: 'Activity Action Checklist',
      progressText: 'Progress',
      peerMessage: 'Your classmates are doing these exact steps right now. Check them off one by one!',
      koreanReferenceLabel: 'Classroom Korean text',
      stepPrefix: 'Step',
      congratsTitle: 'Great job! You finished all tasks for this stage.',
      congratsDesc: 'Now tap tab 3 "What should I think about?" to explore the teacher’s question.',
      statusDoing: 'Doing Now',
      statusDone: 'Done',
      statusHelp: 'Need Help?',
      helpModalTitle: 'Ask Teacher for Help',
      helpModalDesc: 'Select what is difficult so your teacher can support you right away:',
      submitHelp: 'Send Help Request to Teacher',
      cancel: 'Cancel',
      optionalNotePlaceholder: 'Add any specific detail (optional)...',
      reasons: {
        not_understand_teacher: "I didn't understand what the teacher said",
        dont_know_what_to_do: "I don't know what to do next",
        difficult_word: "The words or textbook reading are too difficult",
        cant_say_to_friend: "I can't say my idea to my friend in Korean",
        other: "I need other help",
      },
    },
    vi: {
      badge: 'Danh sách việc cần làm',
      progressText: 'Tiến độ',
      peerMessage: 'Các bạn trong lớp cũng đang làm theo các bước này. Hãy hoàn thành từng việc một nhé!',
      koreanReferenceLabel: 'Nhiệm vụ tiếng Hàn trong lớp',
      stepPrefix: 'Bước',
      congratsTitle: 'Giỏi lắm! Em đã hoàn thành tất cả nhiệm vụ.',
      congratsDesc: 'Bây giờ hãy nhấn vào mục 3 "Nên suy nghĩ về điều gì?" để xem câu hỏi của thầy cô.',
      statusDoing: 'Đang làm',
      statusDone: 'Đã xong',
      statusHelp: 'Cần giúp?',
      helpModalTitle: 'Yêu cầu thầy cô trợ giúp',
      helpModalDesc: 'Hãy chọn điều em đang gặp khó khăn để thầy cô đến hỗ trợ nhé:',
      submitHelp: 'Gửi yêu cầu giúp đỡ cho thầy cô',
      cancel: 'Hủy',
      optionalNotePlaceholder: 'Ghi chú thêm nếu muốn (không bắt buộc)...',
      reasons: {
        not_understand_teacher: 'Em chưa hiểu lời thầy cô hướng dẫn',
        dont_know_what_to_do: 'Em chưa biết phải làm gì tiếp theo',
        difficult_word: 'Từ vựng hoặc sách giáo khoa quá khó',
        cant_say_to_friend: 'Em không biết cách nói ý mình bằng tiếng Hàn cho bạn',
        other: 'Em cần sự trợ giúp khác',
      },
    },
    ru: {
      badge: 'Список заданий для выполнения',
      progressText: 'Прогресс',
      peerMessage: 'Твои одноклассники сейчас выполняют именно эти шаги. Отмечай каждый шаг!',
      koreanReferenceLabel: 'Задание на корейском в классе',
      stepPrefix: 'Шаг',
      congratsTitle: 'Отлично! Все задания этого этапа выполнены.',
      congratsDesc: 'Теперь переходи к разделу 3 «О чём нужно подумать?», чтобы разобрать вопрос учителя.',
      statusDoing: 'В процессе',
      statusDone: 'Готово',
      statusHelp: 'Нужна помощь?',
      helpModalTitle: 'Попросить помощь у учителя',
      helpModalDesc: 'Выбери, в чём возникла трудность, чтобы учитель подошёл помочь:',
      submitHelp: 'Отправить запрос учителю',
      cancel: 'Отмена',
      optionalNotePlaceholder: 'Дополнительное примечание (по желанию)...',
      reasons: {
        not_understand_teacher: 'Я не понял указания учителя',
        dont_know_what_to_do: 'Я не знаю, что делать дальше',
        difficult_word: 'Слова или учебник слишком сложные',
        cant_say_to_friend: 'Я не могу сказать мысль другу по-корейски',
        other: 'Мне нужна другая помощь',
      },
    },
    'uz-Latn': {
      badge: 'Bajarilishi kerak bo‘lgan vazifalar',
      progressText: 'Bajarildi',
      peerMessage: 'Sinfdoshlaringiz hozir aynan shu bosqichlarni bajarmoqda. Ketma-ket belgilab boring!',
      koreanReferenceLabel: 'Sinfdagi koreyscha topshiriq',
      stepPrefix: 'Qadam',
      congratsTitle: 'Barakalla! Ushbu bosqichdagi barcha ishlarni bajardingiz.',
      congratsDesc: 'Endi o‘qituvchining savolini tushunish uchun 3-bo‘lim "Nima haqida o‘ylashim kerak?"ga o‘ting.',
      statusDoing: 'Qilyapman',
      statusDone: 'Bajarildi',
      statusHelp: 'Yordam kerakmi?',
      helpModalTitle: 'O‘qituvchidan yordam so‘rash',
      helpModalDesc: 'O‘qituvchi yoningizga kelib yordam berishi uchun qiyinchilik sababini tanlang:',
      submitHelp: 'O‘qituvchiga yordam so‘rovi yuborish',
      cancel: 'Bekor qilish',
      optionalNotePlaceholder: 'Qo‘shimcha izoh (ixtiyoriy)...',
      reasons: {
        not_understand_teacher: 'O‘qituvchining aytganini tushunmadim',
        dont_know_what_to_do: 'Keyin nima qilishim kerakligini bilmayapman',
        difficult_word: 'So‘zlar yoki darslik matni juda qiyin',
        cant_say_to_friend: 'Fikrimni partadoshga koreyscha ayta olmayapman',
        other: 'Boshqa yordam kerak',
      },
    },
    'uz-Cyrl': {
      badge: 'Бажарилиши керак бўлган вазифалар',
      progressText: 'Бажарилди',
      peerMessage: 'Синфдошларингиз ҳозир айнан шу босқичларни бажармоқда. Кетма-кет белгилаб боринг!',
      koreanReferenceLabel: 'Синфдаги корейсча топшириқ',
      stepPrefix: 'Қадам',
      congratsTitle: 'Баракалла! Ушбу босқичдаги барча ишларни бажардингиз.',
      congratsDesc: 'Энди ўқитувчининг саволини тушуниш учун 3-бўлим "Нима ҳақида ўйлашим керак?"га ўтинг.',
      statusDoing: 'Қиляпман',
      statusDone: 'Бажарилди',
      statusHelp: 'Ёрдам керакми?',
      helpModalTitle: 'Ўқитувчидан ёрдам сўраш',
      helpModalDesc: 'Ўқитувчи ёнингизга келиб ёрдам бериши учун қийинчилик сабабини танланг:',
      submitHelp: 'Ўқитувчига ёрдам сўрови юбориш',
      cancel: 'Бекор қилиш',
      optionalNotePlaceholder: 'Қўшимча изоҳ (ихтиёрий)...',
      reasons: {
        not_understand_teacher: 'Ўқитувчининг айтганини тушунмадим',
        dont_know_what_to_do: 'Кейин нима қилишим кераклигини билмаяпман',
        difficult_word: 'Сўзлар ёки дарслик матни жуда қийин',
        cant_say_to_friend: 'Фикримни партадошга корейсча айта олмаяпман',
        other: 'Бошқа ёрдам керак',
      },
    },
    'zh-Hans': {
      badge: '课堂活动任务清单',
      progressText: '完成进度',
      peerMessage: '全班同学们现在也正在按照这个顺序进行活动。按步骤逐一完成并勾选吧！',
      koreanReferenceLabel: '课堂韩语任务原文',
      stepPrefix: '步骤',
      congratsTitle: '做得真棒！你已经完成了本环节的所有任务。',
      congratsDesc: '现在点击第3项“需要思考什么？”，一起来理解老师的提问吧。',
      statusDoing: '进行中',
      statusDone: '已完成',
      statusHelp: '需要帮助？',
      helpModalTitle: '向老师求助',
      helpModalDesc: '请选择你遇到的困难，老师会立刻看到并来帮助你：',
      submitHelp: '向老师发送求助请求',
      cancel: '取消',
      optionalNotePlaceholder: '补充说明（选填）...',
      reasons: {
        not_understand_teacher: '我没听懂老师的要求',
        dont_know_what_to_do: '我不知道下一步该做什么',
        difficult_word: '单词或课文意思太难了',
        cant_say_to_friend: '我不知道怎样用韩语向同桌表达',
        other: '我需要其他帮助',
      },
    },
    'zh-Hant': {
      badge: '課堂活動任務清單',
      progressText: '完成進度',
      peerMessage: '全班同學們現在也正在按照這個順序進行活動。按步驟逐一完成並勾選吧！',
      koreanReferenceLabel: '課堂韓語任務原文',
      stepPrefix: '步驟',
      congratsTitle: '做得真棒！你已經完成了本環節的所有任務。',
      congratsDesc: '現在點擊第3項「需要思考什麼？」，一起來理解老師的提問吧。',
      statusDoing: '進行中',
      statusDone: '已完成',
      statusHelp: '需要幫助？',
      helpModalTitle: '向老師求助',
      helpModalDesc: '請選擇你遇到的困難，老師會立刻看到並來幫助你：',
      submitHelp: '向老師發送求助請求',
      cancel: '取消',
      optionalNotePlaceholder: '補充說明（選填）...',
      reasons: {
        not_understand_teacher: '我沒聽懂老師的要求',
        dont_know_what_to_do: '我不知道下一步該做什麼',
        difficult_word: '單詞或課文意思太難了',
        cant_say_to_friend: '我不知道怎樣用韓語向同桌表達',
        other: '我需要其他幫助',
      },
    },
    ko: {
      badge: '활동 순서 체크리스트',
      progressText: '진행',
      peerMessage: '친구들도 지금 이 순서대로 활동하고 있어요. 차례대로 하나씩 따라 해보세요!',
      koreanReferenceLabel: '교실 한국어 활동',
      stepPrefix: '단계',
      congratsTitle: '참 잘했어요! 모든 활동을 마쳤어요.',
      congratsDesc: '이제 3번 메뉴 \'무엇을 생각해요?\'를 눌러 선생님의 질문을 함께 살펴보세요.',
      statusDoing: '하는 중',
      statusDone: '완료',
      statusHelp: '도움 요청',
      helpModalTitle: '선생님께 도움 요청하기',
      helpModalDesc: '선생님께서 바로 도와주실 수 있도록 어떤 점이 어려운지 알려주세요:',
      submitHelp: '선생님께 도움 요청 보내기',
      cancel: '취소',
      optionalNotePlaceholder: '더 적고 싶은 말이 있다면 적어주세요 (선택)...',
      reasons: {
        not_understand_teacher: '선생님 말씀을 잘 이해하지 못했어요',
        dont_know_what_to_do: '지금 무엇을 해야 할지 모르겠어요',
        difficult_word: '단어나 글의 뜻이 너무 어려워요',
        cant_say_to_friend: '친구에게 제 생각을 한국어로 말하기 어려워요',
        other: '기타 도움이 필요해요',
      },
    },
  };

  const text = labels[studentLanguage] || labels.en;

  return (
    <div className="space-y-5">
      {/* 1. Header Card with checklist status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                {text.badge}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {studentLanguage === 'ko'
                  ? ui.menu2.titleKo
                  : `${ui.menu2.titleNative} (${ui.menu2.titleKo})`}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              {text.progressText}: {completedCount} / {rawKoreanTasks.length}{' '}
              {ui.buttons.completed}
            </span>
          </div>
        </div>

        {/* Peer connection encouragement in native language */}
        <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/60 mb-5 flex items-center gap-2.5 text-xs text-emerald-950">
          <Users className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{text.peerMessage}</span>
        </div>

        {/* Server Sync Status Notice */}
        {syncNotice && (
          <div
            className={`p-3 rounded-xl border mb-4 text-xs font-semibold flex items-center gap-2 ${
              syncNotice.type === 'ok'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <span>{syncNotice.msg}</span>
          </div>
        )}

        {/* Task Cards List - Native language prominent, NO audio button */}
        <div className="space-y-3">
          {rawKoreanTasks.map((koreanTask, idx) => {
            const taskId = `${stage.id}-task-${idx}`;
            const status = taskStatuses[taskId] || 'not_started';
            const isDone = status === 'done';
            const isDoing = status === 'in_progress';
            const isHelp = status === 'help_needed';
            const nativeTask = nativeTasks[idx] || koreanTask;

            return (
              <div
                key={idx}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
                  isHelp
                    ? 'border-red-300 bg-red-50/50 shadow-2xs'
                    : isDone
                    ? 'border-emerald-300 bg-emerald-50/60 shadow-2xs'
                    : isDoing
                    ? 'border-amber-300 bg-amber-50/40 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    type="button"
                    onClick={() => handleSetStatus(idx, isDone ? 'not_started' : 'done')}
                    className="mt-0.5 shrink-0 focus:outline-hidden"
                    aria-label={isDone ? '완료 취소' : '할 일 완료'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 hover:text-emerald-500 transition-colors" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {text.stepPrefix} {idx + 1}
                      </span>
                      {isDone && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          {ui.buttons.completed}
                        </span>
                      )}
                      {isDoing && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{text.statusDoing}</span>
                        </span>
                      )}
                      {isHelp && (
                        <span className="text-[11px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded flex items-center gap-1 animate-pulse">
                          <AlertCircle className="w-3 h-3" />
                          <span>선생님께 도움 요청 중</span>
                        </span>
                      )}
                    </div>

                    {/* Primary instruction in student's native language */}
                    <p
                      className={`text-sm sm:text-base font-bold leading-relaxed ${
                        isDone ? 'text-slate-500 line-through' : 'text-slate-900'
                      }`}
                    >
                      {nativeTask}
                    </p>

                    {/* Classroom Korean instruction for real classroom reference */}
                    {studentLanguage !== 'ko' && (
                      <div className="mt-1.5 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-600">
                          [{text.koreanReferenceLabel}]:{' '}
                        </span>
                        <span>{koreanTask}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status action buttons (Doing, Done, Help) */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSetStatus(idx, isDoing ? 'not_started' : 'in_progress')}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isDoing
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="지금 하고 있어요"
                  >
                    {text.statusDoing}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetStatus(idx, isDone ? 'not_started' : 'done')}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{text.statusDone}</span>
                      </>
                    ) : (
                      <span>{ui.buttons.iDidThis}</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenHelpModal(idx)}
                    className={`p-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isHelp
                        ? 'bg-red-600 text-white shadow-2xs'
                        : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title={text.statusHelp}
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion celebration banner */}
        {isAllCompleted && (
          <div className="mt-5 p-4 bg-emerald-100/70 border border-emerald-300 rounded-xl flex items-center justify-between gap-3 text-emerald-900 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">{text.congratsTitle}</h4>
                <p className="text-xs text-emerald-800">{text.congratsDesc}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Help Request Reason Picker Modal */}
      {activeHelpModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-5 h-5" />
                <h3 className="text-base font-bold">{text.helpModalTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveHelpModalTask(null)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitHelp} className="p-5 space-y-4">
              <p className="text-xs text-slate-600">{text.helpModalDesc}</p>

              {/* 5 Reasons Options */}
              <div className="space-y-2">
                {(
                  [
                    'not_understand_teacher',
                    'dont_know_what_to_do',
                    'difficult_word',
                    'cant_say_to_friend',
                    'other',
                  ] as HelpReason[]
                ).map((rKey) => {
                  const isSelected = selectedReason === rKey;
                  return (
                    <label
                      key={rKey}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-red-500 bg-red-50/70 text-red-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="helpReason"
                        checked={isSelected}
                        onChange={() => setSelectedReason(rKey)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="text-xs">{text.reasons[rKey]}</span>
                    </label>
                  );
                })}
              </div>

              {/* Optional note */}
              <div>
                <input
                  type="text"
                  value={helpNote}
                  onChange={(e) => setHelpNote(e.target.value)}
                  placeholder={text.optionalNotePlaceholder}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-red-500 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveHelpModalTask(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {text.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{text.submitHelp}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
