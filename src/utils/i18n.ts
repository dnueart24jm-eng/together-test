import { LanguageCode, LanguageOption, KoreanLevel, KoreanLevelOption } from '../types/lesson';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeName: 'English — 영어',
    welcomeMsg: 'Welcome to TogetherON! We learn together with friends.',
  },
  {
    code: 'vi',
    label: 'Tiếng Việt',
    nativeName: 'Tiếng Việt — 베트남어',
    welcomeMsg: 'Chào mừng bạn đến với Cùng nhau ON! Cùng học với các bạn nhé.',
  },
  {
    code: 'ru',
    label: 'Русский',
    nativeName: 'Русский — 러시아어',
    welcomeMsg: 'Добро пожаловать в TogetherON! Учимся вместе с друзьями.',
  },
  {
    code: 'uz-Latn',
    label: 'O‘zbekcha (Lotin)',
    nativeName: 'O‘zbekcha — 우즈베크어',
    welcomeMsg: 'TogetherON ga xush kelibsiz! Do‘stlarimiz bilan birga o‘rganamiz.',
  },
  {
    code: 'uz-Cyrl',
    label: 'Ўзбекча (Кирилл)',
    nativeName: 'Ўзбекча (Кирилл) — 우즈베크어',
    welcomeMsg: 'TogetherON га хуш келибсиз! Дўстларимиз билан бирга ўрганамиз.',
  },
  {
    code: 'zh-Hans',
    label: '简体中文',
    nativeName: '简体中文 — 중국어 간체',
    welcomeMsg: '欢迎来到“一起ON”！和同班同学们一起快乐学习吧。',
  },
  {
    code: 'zh-Hant',
    label: '繁體中文',
    nativeName: '繁體中文 — 중국어 번체',
    welcomeMsg: '歡迎來到「一起ON」！和同班同學們一起快樂學習吧。',
  },
  {
    code: 'ko',
    label: '한국어',
    nativeName: '한국어 — 한국어',
    welcomeMsg: '함께ON에 온 것을 환영해요! 친구들과 함께 즐겁게 수업에 참여해요.',
  },
];

export const KOREAN_LEVELS: Record<LanguageCode, KoreanLevelOption[]> = {
  ko: [
    {
      level: 'beginner',
      titleKo: '초급',
      titleNative: '초급',
      descKo: '한국어를 거의 이해하지 못해요. 모국어 설명과 함께 핵심 한국어 단어를 배워요.',
      descNative: '모국어 설명 중심 + 핵심 한국어 단어',
      badge: '모국어 중심',
    },
    {
      level: 'intermediate',
      titleKo: '중급',
      titleNative: '중급',
      descKo: '쉬운 한국어를 어느 정도 이해해요. 쉬운 한국어를 중심으로 보고 필요할 때 모국어를 확인해요.',
      descNative: '쉬운 한국어 중심 + 필요시 모국어',
      badge: '쉬운 한국어',
    },
    {
      level: 'advanced',
      titleKo: '상급',
      titleNative: '상급',
      descKo: '대부분의 한국어를 이해해요. 한국어로 주로 배우며 어려운 교과 낱말만 도움을 받아요.',
      descNative: '한국어 중심 + 어려운 교과 어휘 지원',
      badge: '한국어 중심',
    },
  ],
  en: [
    {
      level: 'beginner',
      titleKo: '초급',
      titleNative: 'Beginner',
      descKo: '한국어를 거의 이해하지 못해요.',
      descNative: 'I understand little Korean. Explanations in English first, with core Korean words.',
      badge: 'English First',
    },
    {
      level: 'intermediate',
      titleKo: '중급',
      titleNative: 'Intermediate',
      descKo: '쉬운 한국어를 어느 정도 이해해요.',
      descNative: 'I understand simple Korean. Simple Korean first, English explanations when needed.',
      badge: 'Simple Korean',
    },
    {
      level: 'advanced',
      titleKo: '상급',
      titleNative: 'Advanced',
      descKo: '대부분의 한국어를 이해해요.',
      descNative: 'I understand most Korean. Mostly Korean with support for hard classroom terms.',
      badge: 'Full Korean',
    },
  ],
  vi: [
    {
      level: 'beginner',
      titleKo: '초급',
      titleNative: 'Sơ cấp',
      descKo: '한국어를 거의 이해하지 못해요.',
      descNative: 'Em chưa hiểu nhiều tiếng Hàn. Giải thích bằng tiếng Việt kèm từ vựng tiếng Hàn quan trọng.',
      badge: 'Tiếng Việt trước',
    },
    {
      level: 'intermediate',
      titleKo: '중급',
      titleNative: 'Trung cấp',
      descKo: '쉬운 한국어를 어느 정도 이해해요.',
      descNative: 'Em hiểu tiếng Hàn đơn giản. Tiếng Hàn dễ hiểu trước, tiếng Việt hỗ trợ khi cần.',
      badge: 'Tiếng Hàn dễ',
    },
    {
      level: 'advanced',
      titleKo: '상급',
      titleNative: 'Cao cấp',
      descKo: '대부분의 한국어를 이해해요.',
      descNative: 'Em hiểu hầu hết tiếng Hàn. Chủ yếu bằng tiếng Hàn, chỉ hỗ trợ từ vựng môn học khó.',
      badge: 'Tiếng Hàn chính',
    },
  ],
  ru: [
    {
      level: 'beginner',
      titleKo: '초급',
      titleNative: 'Начальный',
      descKo: '한국어를 거의 이해하지 못해요.',
      descNative: 'Почти не понимаю по-корейски. Объяснения на русском с ключевыми корейскими словами.',
      badge: 'Русский язык',
    },
    {
      level: 'intermediate',
      titleKo: '중급',
      titleNative: 'Средний',
      descKo: '쉬운 한국어를 어느 정도 이해해요.',
      descNative: 'Понимаю простой корейский. Простой корейский с поддержкой на русском при необходимости.',
      badge: 'Простой корейский',
    },
    {
      level: 'advanced',
      titleKo: '상급',
      titleNative: 'Продвинутый',
      descKo: '대부분의 한국어를 이해해요.',
      descNative: 'Понимаю большинство на корейском. Помощь только со сложными терминами.',
      badge: 'Корейский язык',
    },
  ],
  'uz-Latn': [
    {
      level: 'beginner',
      titleKo: '초급',
      titleNative: 'Boshlang‘ich',
      descKo: '한국어를 거의 이해하지 못해요.',
      descNative: 'Koreys tilini deyarli bilmayman. Asosiy tushuntirish o‘zbek tilida va muhim koreyscha so‘zlar bilan.',
      badge: 'O‘zbekcha birinchi',
    },
    {
      level: 'intermediate',
      titleKo: '중급',
      titleNative: 'O‘rta',
      descKo: '쉬운 한국어를 어느 정도 이해해요.',
      descNative: 'Oddiy koreys tilini tushunaman. Oson koreyscha asosiy, zarur bo‘lganda o‘zbekcha tushuntirish.',
      badge: 'Oson koreyscha',
    },
    {
      level: 'advanced',
      titleKo: '상급',
      titleNative: 'Yuqori',
      descKo: '대부분의 한국어를 이해해요.',
      descNative: 'Koreys tilini yaxshi tushunaman. Asosan koreyscha, faqat qiyin darslik atamalari uchun yordam.',
      badge: 'Asosan koreyscha',
    },
  ],
  'uz-Cyrl': [
    {
      level: 'beginner',
      titleKo: '초급',
      titleNative: 'Бошланғич',
      descKo: '한국어를 거의 이해하지 못해요.',
      descNative: 'Корейс тилини деярли билмайман. Асосий тушунтириш ўзбек тилида ва муҳим корейсча сўзлар билан.',
      badge: 'Ўзбекча биринчи',
    },
    {
      level: 'intermediate',
      titleKo: '중급',
      titleNative: 'Ўрта',
      descKo: '쉬운 한국어를 어느 정도 이해해요.',
      descNative: 'Оддий корейс тилини тушунаман. Осон корейсча асосий, зарур бўлганда ўзбекча тушунтириш.',
      badge: 'Осон корейсча',
    },
    {
      level: 'advanced',
      titleKo: '상급',
      titleNative: 'Юқори',
      descKo: '대부분의 한국어를 이해해요.',
      descNative: 'Корейс тилини яхши тушунаман. Асосан корейсча, фақат қийин дарслик атамалари учун ёрдам.',
      badge: 'Асосан корейсча',
    },
  ],
  'zh-Hans': [
    {
      level: 'beginner',
      titleKo: '초급',
      titleNative: '初级',
      descKo: '한국어를 거의 이해하지 못해요.',
      descNative: '几乎不懂韩语。以中文母语解释为主，同步学习关键韩语单词。',
      badge: '中文为主',
    },
    {
      level: 'intermediate',
      titleKo: '중급',
      titleNative: '中级',
      descKo: '쉬운 한국어를 어느 정도 이해해요.',
      descNative: '能听懂简单的韩语。以简单韩语为主，需要时查看中文解释。',
      badge: '简易韩语',
    },
    {
      level: 'advanced',
      titleKo: '상급',
      titleNative: '高级',
      descKo: '대부분의 한국어를 이해해요.',
      descNative: '大部分韩语能听懂。以韩语为主，仅在遇到学科生难词汇时提供辅助。',
      badge: '韩语为主',
    },
  ],
  'zh-Hant': [
    {
      level: 'beginner',
      titleKo: '초급',
      titleNative: '初級',
      descKo: '한국어를 거의 이해하지 못해요.',
      descNative: '幾乎不懂韓語。以繁體中文母語解釋為主，同步學習關鍵韓語單詞。',
      badge: '中文為主',
    },
    {
      level: 'intermediate',
      titleKo: '중급',
      titleNative: '中級',
      descKo: '쉬운 한국어를 어느 정도 이해해요.',
      descNative: '能聽懂簡單的韓語。以簡單韓語為主，需要時查看中文解釋。',
      badge: '簡易韓語',
    },
    {
      level: 'advanced',
      titleKo: '상급',
      titleNative: '高級',
      descKo: '대부분의 한국어를 이해해요.',
      descNative: '大部分韓語能聽懂。以韓語為主，僅在遇到學科生難詞彙時提供輔助。',
      badge: '韓語為主',
    },
  ],
};

export interface UiTranslations {
  appName: string;
  tagline: string;
  studentMode: string;
  teacherMode: string;
  roleSwitcher: string;
  currentLesson: string;
  languageAndLevel: string;
  menu1: {
    titleKo: string;
    titleNative: string;
    shortDesc: string;
  };
  menu2: {
    titleKo: string;
    titleNative: string;
    shortDesc: string;
  };
  menu3: {
    titleKo: string;
    titleNative: string;
    shortDesc: string;
  };
  menu4: {
    titleKo: string;
    titleNative: string;
    shortDesc: string;
  };
  buttons: {
    explainMoreSimply: string;
    showNativeText: string;
    hideNativeText: string;
    listenPronunciation: string;
    showHint: string;
    nextHint: string;
    sayInKorean: string;
    iDidThis: string;
    completed: string;
    retry: string;
    applySettings: string;
    shareWithFriend: string;
  };
  notices: {
    aiSafetyNotice: string;
    joinClassNotice: string;
    noAnswersNotice: string;
    listenPrompt: string;
  };
}

export const UI_STRINGS: Record<LanguageCode, UiTranslations> = {
  ko: {
    appName: '함께ON',
    tagline: '친구들과 함께하는 즐거운 수업',
    studentMode: '학생 화면',
    teacherMode: '교사용 관리',
    roleSwitcher: '화면 전환',
    currentLesson: '현재 수업',
    languageAndLevel: '언어 및 한국어 수준 설정',
    menu1: {
      titleKo: '지금 뭐 해요?',
      titleNative: '지금 뭐 해요?',
      shortDesc: '지금 우리가 배우는 내용과 활동을 확인해요.',
    },
    menu2: {
      titleKo: '뭘 하면 돼요?',
      titleNative: '뭘 하면 돼요?',
      shortDesc: '내가 해야 할 일들을 차례대로 확인해요.',
    },
    menu3: {
      titleKo: '무엇을 생각해요?',
      titleNative: '무엇을 생각해요?',
      shortDesc: '선생님의 질문을 이해하고 내 생각을 열어요.',
    },
    menu4: {
      titleKo: '어떻게 말해요?',
      titleNative: '어떻게 말해요?',
      shortDesc: '내 생각을 한국어로 표현해 친구와 이야기해요.',
    },
    buttons: {
      explainMoreSimply: '더 쉽게 설명해 줘',
      showNativeText: '모국어 설명 보기',
      hideNativeText: '모국어 설명 접기',
      listenPronunciation: '발음 듣기',
      showHint: '생각 힌트 보기',
      nextHint: '다음 힌트 보기',
      sayInKorean: '한국어로 바꿔 말하기',
      iDidThis: '다 했어요!',
      completed: '완료됨',
      retry: '다시 시도',
      applySettings: '설정 완료',
      shareWithFriend: '이제 짝꿍에게 말해 보세요!',
    },
    notices: {
      aiSafetyNotice: 'AI는 정답을 대신 적어주지 않고, 스스로 생각하도록 힌트를 주어요.',
      joinClassNotice: '지금 교실에서 친구들과 같은 활동을 하고 있어요.',
      noAnswersNotice: '선생님의 질문을 곰곰이 생각하며 나만의 생각을 찾아보세요.',
      listenPrompt: '스피커를 누르면 한국어 소리를 들을 수 있어요.',
    },
  },
  en: {
    appName: 'TogetherON',
    tagline: 'Learning and participating together in class',
    studentMode: 'Student Mode',
    teacherMode: 'Teacher Mode',
    roleSwitcher: 'Switch View',
    currentLesson: 'Current Lesson',
    languageAndLevel: 'Language & Korean Level Settings',
    menu1: {
      titleKo: '지금 뭐 해요?',
      titleNative: 'What are we doing now?',
      shortDesc: 'Understand the current lesson stage and topic.',
    },
    menu2: {
      titleKo: '뭘 하면 돼요?',
      titleNative: 'What should I do?',
      shortDesc: 'Step-by-step checklist of classroom tasks.',
    },
    menu3: {
      titleKo: '무엇을 생각해요?',
      titleNative: 'What should I think about?',
      shortDesc: "Understand teacher's questions with thinking hints.",
    },
    menu4: {
      titleKo: '어떻게 말해요?',
      titleNative: 'How do I say it in Korean?',
      shortDesc: 'Express your thoughts in natural Korean sentences.',
    },
    buttons: {
      explainMoreSimply: 'Explain more simply',
      showNativeText: 'Show English translation',
      hideNativeText: 'Hide English translation',
      listenPronunciation: 'Listen (Audio)',
      showHint: 'Show Thinking Hint',
      nextHint: 'Next Hint',
      sayInKorean: 'Turn into Korean',
      iDidThis: 'I did this!',
      completed: 'Completed',
      retry: 'Retry',
      applySettings: 'Save & Continue',
      shareWithFriend: 'Now try sharing with your partner!',
    },
    notices: {
      aiSafetyNotice: 'AI never gives answers directly. It provides hints so you can think on your own.',
      joinClassNotice: "You are doing the exact same activity as your classmates right now.",
      noAnswersNotice: "Take your time to think through the teacher's question.",
      listenPrompt: 'Tap the audio button to hear native Korean pronunciation.',
    },
  },
  vi: {
    appName: 'TogetherON',
    tagline: 'Cùng nhau học tập và tham gia vào lớp học',
    studentMode: 'Màn hình học sinh',
    teacherMode: 'Quản lý giáo viên',
    roleSwitcher: 'Chuyển chế độ',
    currentLesson: 'Bài học hiện tại',
    languageAndLevel: 'Cài đặt ngôn ngữ và trình độ tiếng Hàn',
    menu1: {
      titleKo: '지금 뭐 해요?',
      titleNative: 'Bây giờ đang làm gì?',
      shortDesc: 'Tìm hiểu nội dung và hoạt động hiện tại trong lớp.',
    },
    menu2: {
      titleKo: '뭘 하면 돼요?',
      titleNative: 'Em cần làm những gì?',
      shortDesc: 'Danh sách các việc cần làm theo từng bước.',
    },
    menu3: {
      titleKo: '무엇을 생각해요?',
      titleNative: 'Nên suy nghĩ về điều gì?',
      shortDesc: 'Hiểu câu hỏi của thầy cô qua các gợi ý suy nghĩ.',
    },
    menu4: {
      titleKo: '어떻게 말해요?',
      titleNative: 'Nói bằng tiếng Hàn như thế nào?',
      shortDesc: 'Biến suy nghĩ của em thành câu tiếng Hàn tự nhiên.',
    },
    buttons: {
      explainMoreSimply: 'Giải thích đơn giản hơn',
      showNativeText: 'Xem tiếng Việt',
      hideNativeText: 'Ẩn tiếng Việt',
      listenPronunciation: 'Nghe phát âm',
      showHint: 'Xem gợi ý',
      nextHint: 'Gợi ý tiếp theo',
      sayInKorean: 'Chuyển sang tiếng Hàn',
      iDidThis: 'Em đã làm xong!',
      completed: 'Đã hoàn thành',
      retry: 'Thử lại',
      applySettings: 'Lưu cài đặt',
      shareWithFriend: 'Bây giờ hãy nói với bạn cùng bàn nhé!',
    },
    notices: {
      aiSafetyNotice: 'AI không đưa ra câu trả lời trực tiếp mà gợi ý để em tự suy nghĩ.',
      joinClassNotice: 'Em đang tham gia cùng một hoạt động với các bạn trong lớp.',
      noAnswersNotice: 'Hãy bình tĩnh suy nghĩ câu hỏi của thầy cô nhé.',
      listenPrompt: 'Nhấn vào loa để nghe cách đọc tiếng Hàn.',
    },
  },
  ru: {
    appName: 'TogetherON',
    tagline: 'Учимся и участвуем в уроке вместе с классом',
    studentMode: 'Режим ученика',
    teacherMode: 'Режим учителя',
    roleSwitcher: 'Сменить режим',
    currentLesson: 'Текущий урок',
    languageAndLevel: 'Настройки языка и уровня корейского',
    menu1: {
      titleKo: '지금 뭐 해요?',
      titleNative: 'Что мы сейчас делаем?',
      shortDesc: 'Узнай тему и то, что сейчас происходит на уроке.',
    },
    menu2: {
      titleKo: '뭘 하면 돼요?',
      titleNative: 'Что мне нужно делать?',
      shortDesc: 'Пошаговый список заданий для выполнения.',
    },
    menu3: {
      titleKo: '무엇을 생각해요?',
      titleNative: 'О чём нужно подумать?',
      shortDesc: 'Пойми вопрос учителя с помощью подсказок.',
    },
    menu4: {
      titleKo: '어떻게 말해요?',
      titleNative: 'Как сказать это по-корейски?',
      shortDesc: 'Сформулируй свои мысли на корейском языке.',
    },
    buttons: {
      explainMoreSimply: 'Объясни проще',
      showNativeText: 'Показать на русском',
      hideNativeText: 'Скрыть русский текст',
      listenPronunciation: 'Прослушать произношение',
      showHint: 'Показать подсказку',
      nextHint: 'Следующая подсказка',
      sayInKorean: 'Перевести на корейский',
      iDidThis: 'Я сделал это!',
      completed: 'Готово',
      retry: 'Повторить',
      applySettings: 'Сохранить настройки',
      shareWithFriend: 'Теперь расскажи об этом соседу по парте!',
    },
    notices: {
      aiSafetyNotice: 'ИИ не дает готовых ответов, а помогает думать самостоятельно.',
      joinClassNotice: 'Ты выполняешь то же задание, что и твои одноклассники.',
      noAnswersNotice: 'Подумай над вопросом учителя шаг за шагом.',
      listenPrompt: 'Нажми на значок звука, чтобы услышать корейскую речь.',
    },
  },
  'uz-Latn': {
    appName: 'TogetherON',
    tagline: 'Do‘stlar bilan birga o‘rganish va darsda qatnashish',
    studentMode: 'O‘quvchi rejimi',
    teacherMode: 'O‘qituvchi rejimi',
    roleSwitcher: 'Rejimni almashtirish',
    currentLesson: 'Hozirgi dars',
    languageAndLevel: 'Til va koreys tili darajasini sozlash',
    menu1: {
      titleKo: '지금 뭐 해요?',
      titleNative: 'Hozir nima qilyapmiz?',
      shortDesc: 'Dars bosqichi va mavzusini tushuning.',
    },
    menu2: {
      titleKo: '뭘 하면 돼요?',
      titleNative: 'Nima qilishim kerak?',
      shortDesc: 'Bajarilishi kerak bo‘lgan vazifalar ro‘yxati.',
    },
    menu3: {
      titleKo: '무엇을 생각해요?',
      titleNative: 'Nima haqida o‘ylashim kerak?',
      shortDesc: 'O‘qituvchining savolini tushunish uchun maslahatlar.',
    },
    menu4: {
      titleKo: '어떻게 말해요?',
      titleNative: 'Koreyscha qanday aytiladi?',
      shortDesc: 'O‘z fikringizni koreys tilida ifodalang.',
    },
    buttons: {
      explainMoreSimply: 'Osonroq tushuntir',
      showNativeText: 'O‘zbekcha matnni ko‘rsat',
      hideNativeText: 'O‘zbekcha matnni yashir',
      listenPronunciation: 'Talaffuzni tinglash',
      showHint: 'Maslahatni ko‘rish',
      nextHint: 'Keyingi maslahat',
      sayInKorean: 'Koreys tilida ifodalash',
      iDidThis: 'Bajarib bo‘ldim!',
      completed: 'Bajarildi',
      retry: 'Qayta urinish',
      applySettings: 'Sozlamalarni saqlash',
      shareWithFriend: 'Endi partadoshingizga aytib bering!',
    },
    notices: {
      aiSafetyNotice: 'AI tayyor javob bermaydi, balki mustaqil fikrlashingizga yordam beradi.',
      joinClassNotice: 'Siz hozir sinfdoshlaringiz bilan bir xil mashg‘ulotni bajaryapsiz.',
      noAnswersNotice: 'O‘qituvchi savoli haqida yaxshilab o‘ylab ko‘ring.',
      listenPrompt: 'Koreyscha talaffuzni eshitish uchun dinamikni bosing.',
    },
  },
  'uz-Cyrl': {
    appName: 'TogetherON',
    tagline: 'Дўстлар билан бирга ўрганиш ва дарсда қатнашиш',
    studentMode: 'Ўқувчи режими',
    teacherMode: 'Ўқитувчи режими',
    roleSwitcher: 'Режимни алмаштириш',
    currentLesson: 'Ҳозирги дарс',
    languageAndLevel: 'Тил ва корейс тили даражасини созлаш',
    menu1: {
      titleKo: '지금 뭐 해요?',
      titleNative: 'Ҳозир нима қиляпмиз?',
      shortDesc: 'Дарс босқичи ва мавзусини тушунинг.',
    },
    menu2: {
      titleKo: '뭘 하면 돼요?',
      titleNative: 'Нима қилишим керак?',
      shortDesc: 'Бажарилиши керак бўлган вазифалар рўйхати.',
    },
    menu3: {
      titleKo: '무엇을 생각해요?',
      titleNative: 'Нима ҳақида ўйлашим керак?',
      shortDesc: 'Ўқитувчининг саволини тушуниш учун маслаҳатлар.',
    },
    menu4: {
      titleKo: '어떻게 말해요?',
      titleNative: 'Корейсча қандай айтилади?',
      shortDesc: 'Ўз фикрингизни корейс тилида ифодаланг.',
    },
    buttons: {
      explainMoreSimply: 'Осонроқ тушунтир',
      showNativeText: 'Ўзбекча матнни кўрсат',
      hideNativeText: 'Ўзбекча матнни яшир',
      listenPronunciation: 'Талаффузни тинглаш',
      showHint: 'Маслаҳатни кўриш',
      nextHint: 'Кейинги маслаҳат',
      sayInKorean: 'Корейс тилида ифодалаш',
      iDidThis: 'Бажариб бўлдим!',
      completed: 'Бажарилди',
      retry: 'Қайта уриниш',
      applySettings: 'Созламаларни сақлаш',
      shareWithFriend: 'Энди партадошингизга айтиб беринг!',
    },
    notices: {
      aiSafetyNotice: 'AI тайёр жавоб бермайди, балки мустақил фикрлашингизга ёрдам беради.',
      joinClassNotice: 'Сиз ҳозир синфдошларингиз билан бир хил машғулотни бажаряпсиз.',
      noAnswersNotice: 'Ўқитувчи саволи ҳақида яхшилаб ўйлаб кўринг.',
      listenPrompt: 'Корейсча талаффузни эшитиш учун динамикни босинг.',
    },
  },
  'zh-Hans': {
    appName: '一起ON',
    tagline: '和朋友们一起快乐参与课堂',
    studentMode: '学生模式',
    teacherMode: '教师管理',
    roleSwitcher: '切换视角',
    currentLesson: '当前课程',
    languageAndLevel: '母语及韩语水平设置',
    menu1: {
      titleKo: '지금 뭐 해요?',
      titleNative: '现在在做什么？',
      shortDesc: '了解当前课堂阶段和正在学习的核心内容。',
    },
    menu2: {
      titleKo: '뭘 하면 돼요?',
      titleNative: '我需要做什么？',
      shortDesc: '按步骤查看并勾选当前课堂活动任务。',
    },
    menu3: {
      titleKo: '무엇을 생각해요?',
      titleNative: '需要思考什么？',
      shortDesc: '理解老师的提问，借助阶梯提示自主思考。',
    },
    menu4: {
      titleKo: '어떻게 말해요?',
      titleNative: '怎么用韩语表达？',
      shortDesc: '将自己的想法转化为适合课堂交流的自然韩语句子。',
    },
    buttons: {
      explainMoreSimply: '更简单地解释',
      showNativeText: '显示中文解释',
      hideNativeText: '收起中文解释',
      listenPronunciation: '听发音',
      showHint: '查看思考提示',
      nextHint: '下一个提示',
      sayInKorean: '转换为韩语表达',
      iDidThis: '我做好了！',
      completed: '已完成',
      retry: '重试',
      applySettings: '保存设置',
      shareWithFriend: '现在试着告诉同桌吧！',
    },
    notices: {
      aiSafetyNotice: 'AI不会代替你写出答案，而是引导你一步步自主思考。',
      joinClassNotice: '你现在正在和全班同学们进行相同的课堂活动。',
      noAnswersNotice: '仔细思考老师的问题，找到属于你自己的想法。',
      listenPrompt: '点击扬声器图标可以听纯正的韩语发音。',
    },
  },
  'zh-Hant': {
    appName: '一起ON',
    tagline: '和朋友們一起快樂參與課堂',
    studentMode: '學生模式',
    teacherMode: '教師管理',
    roleSwitcher: '切換視角',
    currentLesson: '當前課程',
    languageAndLevel: '母語及韓語水平設置',
    menu1: {
      titleKo: '지금 뭐 해요?',
      titleNative: '現在在做什麼？',
      shortDesc: '了解當前課堂階段和正在學習的核心內容。',
    },
    menu2: {
      titleKo: '뭘 하면 돼요?',
      titleNative: '我需要做什麼？',
      shortDesc: '按步驟查看並勾選當前課堂活動任務。',
    },
    menu3: {
      titleKo: '무엇을 생각해요?',
      titleNative: '需要思考什麼？',
      shortDesc: '理解老師的提問，借助階梯提示自主思考。',
    },
    menu4: {
      titleKo: '어떻게 말해요?',
      titleNative: '怎麼用韓語表達？',
      shortDesc: '將自己的想法轉化為適合課堂交流的自然韓語句子。',
    },
    buttons: {
      explainMoreSimply: '更簡單地解釋',
      showNativeText: '顯示中文解釋',
      hideNativeText: '收起中文解釋',
      listenPronunciation: '聽發音',
      showHint: '查看思考提示',
      nextHint: '下一個提示',
      sayInKorean: '轉換為韓語表達',
      iDidThis: '我做好了！',
      completed: '已完成',
      retry: '重試',
      applySettings: '保存設置',
      shareWithFriend: '現在試著告訴同桌吧！',
    },
    notices: {
      aiSafetyNotice: 'AI不會代替你寫出答案，而是引導你一步步自主思考。',
      joinClassNotice: '你現在正在和全班同學們進行相同的課堂活動。',
      noAnswersNotice: '仔細思考老師的問題，找到屬於你自己的想法。',
      listenPrompt: '點擊揚聲器圖標可以聽純正的韓語發音。',
    },
  },
};
