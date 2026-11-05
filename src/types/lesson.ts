export type LanguageCode =
  | 'ko'
  | 'en'
  | 'vi'
  | 'ru'
  | 'uz-Latn'
  | 'uz-Cyrl'
  | 'zh-Hans'
  | 'zh-Hant';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  flagEmoji?: string;
  welcomeMsg: string;
}

export type KoreanLevel = 'beginner' | 'intermediate' | 'advanced';

export interface KoreanLevelOption {
  level: KoreanLevel;
  titleKo: string;
  titleNative: string;
  descKo: string;
  descNative: string;
  badge: string;
}

export interface LessonInfo {
  subject: string;            // 교과 (예: 초등 사회)
  unit: string;               // 단원 (예: 1. 사회 변화와 다양한 문화)
  period: string;             // 차시 (예: 6~7/18)
  topic: string;              // 학습주제 (예: 지능정보화로 달라진 생활 모습 살펴보기)
  goal: string;               // 학습목표
  achievementStandard: string;// 성취기준
  textbookPages: string;      // 교과서 쪽수 (예: 24~29쪽)
  defaultStudentLang?: string;// 기본 학생 언어 (참고용)
  customFields: Record<string, string>;
}

export interface VocabularyItem {
  korean: string;
  native?: string;
  pronunciation?: string;
  meaning?: string;
}

export interface LessonStage {
  id: string;                 // 단계_ID (INTRO, WAKE, ACT1, ACT2, ACT3, CLOSE)
  title: string;              // 단계명_원문
  description?: string;       // 단계 설명
  currentActivity: string;    // 학생지원_현재활동
  tasks: string[];            // 학생지원_지금할일_1, 2...
  teacherQuestions: string[]; // 교사_원문발문_1, 2...
  questionGuidance: string[]; // 학생지원_질문이해_1, 2...
  thinkingPrompts: string[];  // 학생지원_생각돕기_1, 2...
  keyVocabulary: string[];    // 학생지원_핵심어휘
  sentenceFrames: string[];   // 학생지원_표현틀
  coreConcepts: string[];     // 교과서_핵심개념_1, 2...
  extraFields: Record<string, string | string[]>;
}

export interface LessonData {
  id: string;
  title: string;
  info: LessonInfo;
  commonPrinciples: string[];
  stages: LessonStage[];
  rawText?: string;
}

// Student Task Progress & Help Status
export type TaskStatus = 'not_started' | 'in_progress' | 'done' | 'help_needed';

export type HelpReason =
  | 'not_understand_teacher'
  | 'dont_know_what_to_do'
  | 'difficult_word'
  | 'cant_say_to_friend'
  | 'other';

export interface StudentTaskState {
  taskId: string;
  stageId: string;
  status: TaskStatus;
  helpReason?: HelpReason;
  helpNote?: string;
  updatedAt: number;
}

export interface StudentSession {
  id: string;
  classCode: string;
  nickname: string;
  language: LanguageCode;
  koreanLevel: KoreanLevel;
  currentStageId: string;
  taskStates: Record<string, StudentTaskState>;
  lastActive: number;
}

export interface ClassroomSession {
  code: string;
  title: string;
  currentStageId: string;
  lessonData: LessonData;
  createdAt: number;
  isActive: boolean;
  students: Record<string, StudentSession>;
}

export interface SavedLessonRecord {
  id: string;
  title: string;
  subject: string;
  unit: string;
  period: string;
  stageCount: number;
  uploadedAt: string;
  isArchived: boolean;
  lessonData: LessonData;
}

export interface NotebookFolder {
  id: string;
  name: string;
  isDefault?: boolean;
}

// Personal Notebook Item
export interface NotebookItem {
  id: string;
  studentId: string;
  classCode: string;
  folderId?: string;
  type: 'word' | 'expression' | 'concept' | 'my_sentence';
  koreanText: string;
  nativeText: string;
  pronunciation?: string;
  exampleSentence?: string;
  subjectTopic?: string;
  stageId?: string;
  dateSaved: string;
}

// Classroom Dialogue Message (Text / Voice translation)
export interface CommunicationMessage {
  id: string;
  sender: 'student' | 'partner_or_teacher';
  originalText: string;
  originalLang: string;
  translatedText: string;
  translatedLang: string;
  pronunciation?: string;
  timestamp: number;
}

// AI response interfaces
export interface AIExplainCurrentResponse {
  easyKorean: string;
  nativeExplanation: string;
  keyVocabulary: Array<{
    korean: string;
    native: string;
    pronunciation: string;
    meaning: string;
  }>;
  connectionNote: string;
  classroomAction: string;
}

export interface AIThinkingScaffoldResponse {
  questionEasyKorean: string;
  questionInNative: string;
  comparisonTarget: string;
  scaffoldingSteps: Array<{
    stepNumber: number;
    guideKo: string;
    guideNative: string;
    promptToThink: string;
  }>;
  reminderNotice: string;
}

export interface AISpeechBridgeResponse {
  studentThoughtConfirmed: string;
  koreanSentenceEasy: string;
  koreanSentencePolite: string;
  pronunciationGuide: string;
  pronunciationTip?: string;
  keyWordsUsed: Array<{
    korean: string;
    native: string;
    pronunciation: string;
  }>;
  speakingTip: string;
}

export interface AITeacherPreviewResponse {
  originalKorean: string;
  studentNativeText: string;
  teacherReviewText: string;
  reviewLanguage: 'ko' | 'en';
  pedagogicalSafetyNote: string;
}
