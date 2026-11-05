import {
  AIExplainCurrentResponse,
  AIThinkingScaffoldResponse,
  AISpeechBridgeResponse,
  AITeacherPreviewResponse,
  LanguageCode,
  KoreanLevel,
  LessonInfo,
  LessonStage,
  LessonData,
  ClassroomSession,
  StudentSession,
  NotebookItem,
  NotebookFolder,
  SavedLessonRecord,
  TaskStatus,
  HelpReason,
} from '../types/lesson';

// In-memory session cache to avoid redundant API calls
const sessionCache = new Map<string, any>();

function getCacheKey(
  type: string,
  stageId: string,
  lang: LanguageCode,
  level: KoreanLevel,
  extra: string = ''
): string {
  return `${type}:${stageId}:${lang}:${level}:${extra}`;
}

export function clearSessionCache(): void {
  sessionCache.clear();
}

export async function checkApiHealth(): Promise<{ status: string; hasApiKey: boolean; model: string }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline', hasApiKey: false, model: 'local-fallback' };
  }
}

// ==========================================
// Teacher Authentication
// ==========================================

export async function teacherLogin(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/teacher/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || '로그인 실패' };
    }
    return { success: true, token: data.token };
  } catch (err: any) {
    return { success: false, error: '서버 연결 실패' };
  }
}

export async function teacherSetupPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/teacher/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || '비밀번호 변경 실패' };
    }
    return { success: true, token: data.token };
  } catch (err: any) {
    return { success: false, error: '서버 연결 실패' };
  }
}

export async function checkTeacherAuth(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch('/api/auth/teacher/check', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return Boolean(data.isValid);
  } catch {
    return false;
  }
}

// ==========================================
// Classroom Sync & Code Management
// ==========================================

export async function createClassroom(
  lessonData: LessonData,
  customCode?: string,
  teacherToken?: string
): Promise<{ success: boolean; classroom?: ClassroomSession; error?: string }> {
  try {
    const res = await fetch('/api/classroom/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken || ''}`,
      },
      body: JSON.stringify({ lessonData, customCode }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, classroom: data.classroom };
  } catch (err) {
    return { success: false, error: '수업 생성 실패' };
  }
}

export async function getClassroom(code: string): Promise<ClassroomSession | null> {
  try {
    const res = await fetch(`/api/classroom/${encodeURIComponent(code)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateClassroomStage(
  code: string,
  stageId: string,
  teacherToken?: string
): Promise<boolean> {
  try {
    const res = await fetch(`/api/classroom/${encodeURIComponent(code)}/stage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken || ''}`,
      },
      body: JSON.stringify({ stageId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function joinClassroom(
  code: string,
  nickname: string,
  language: LanguageCode,
  koreanLevel: KoreanLevel,
  studentId?: string
): Promise<{ success: boolean; student?: StudentSession; classroom?: any; error?: string }> {
  try {
    const res = await fetch(`/api/classroom/${encodeURIComponent(code)}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, language, koreanLevel, studentId }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, student: data.student, classroom: data.classroom };
  } catch {
    return { success: false, error: '수업 참여 실패' };
  }
}

export async function updateStudentTaskStatus(
  code: string,
  studentId: string,
  taskId: string,
  stageId: string,
  status: TaskStatus,
  helpReason?: HelpReason,
  helpNote?: string
): Promise<{ success: boolean; currentStageId?: string }> {
  try {
    const res = await fetch(`/api/classroom/${encodeURIComponent(code)}/student-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, taskId, stageId, status, helpReason, helpNote }),
    });
    const data = await res.json();
    return { success: res.ok, currentStageId: data.currentStageId };
  } catch {
    return { success: false };
  }
}

export async function getClassroomDashboard(
  code: string,
  teacherToken?: string
): Promise<{ students: StudentSession[]; currentStageId: string; isActive: boolean } | null> {
  try {
    const res = await fetch(`/api/classroom/${encodeURIComponent(code)}/dashboard`, {
      headers: { Authorization: `Bearer ${teacherToken || ''}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function resolveStudentHelp(
  code: string,
  studentId: string,
  taskId: string,
  teacherToken?: string
): Promise<boolean> {
  try {
    const res = await fetch(`/api/classroom/${encodeURIComponent(code)}/resolve-help`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken || ''}`,
      },
      body: JSON.stringify({ studentId, taskId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function endClassroom(code: string, teacherToken?: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/classroom/${encodeURIComponent(code)}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken || ''}`,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateClassroomLesson(
  code: string,
  lessonData: LessonData,
  teacherToken?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/classroom/${encodeURIComponent(code)}/lesson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken || ''}`,
      },
      body: JSON.stringify({ lessonData }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    clearSessionCache();
    return { success: true };
  } catch {
    return { success: false, error: '서버에 수업 자료를 반영하지 못했습니다.' };
  }
}

// ==========================================
// Lesson Library & Archive Management
// ==========================================

export async function fetchSavedLessons(teacherToken?: string): Promise<SavedLessonRecord[]> {
  try {
    const res = await fetch('/api/lessons', {
      headers: { Authorization: `Bearer ${teacherToken || ''}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.lessons || [];
  } catch {
    return [];
  }
}

export async function updateSavedLesson(
  id: string,
  updates: { title?: string; isArchived?: boolean },
  teacherToken?: string
): Promise<{ success: boolean; lessons?: SavedLessonRecord[] }> {
  try {
    const res = await fetch(`/api/lessons/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken || ''}`,
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    return { success: res.ok, lessons: data.lessons };
  } catch {
    return { success: false };
  }
}

export async function deleteSavedLesson(
  id: string,
  teacherToken?: string
): Promise<{ success: boolean; lessons?: SavedLessonRecord[] }> {
  try {
    const res = await fetch(`/api/lessons/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${teacherToken || ''}` },
    });
    const data = await res.json();
    return { success: res.ok, lessons: data.lessons };
  } catch {
    return { success: false };
  }
}

// ==========================================
// Personal Korean Learning Notebook
// ==========================================

export async function fetchNotebookData(
  classCode: string,
  studentId: string
): Promise<{ items: NotebookItem[]; folders: NotebookFolder[] }> {
  try {
    const res = await fetch(`/api/notebook/${encodeURIComponent(classCode)}/${encodeURIComponent(studentId)}`);
    if (!res.ok) return { items: [], folders: [] };
    const data = await res.json();
    return { items: data.items || [], folders: data.folders || [] };
  } catch {
    return { items: [], folders: [] };
  }
}

export async function saveNotebookItem(
  classCode: string,
  studentId: string,
  item: {
    type: 'word' | 'expression' | 'concept' | 'my_sentence';
    koreanText: string;
    nativeText: string;
    pronunciation?: string;
    exampleSentence?: string;
    folderId?: string;
    subjectTopic?: string;
    stageId?: string;
  }
): Promise<{ success: boolean; duplicate?: boolean; items?: NotebookItem[]; folders?: NotebookFolder[] }> {
  try {
    const res = await fetch(`/api/notebook/${encodeURIComponent(classCode)}/${encodeURIComponent(studentId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    const data = await res.json();
    return { success: res.ok, duplicate: data.duplicate, items: data.items, folders: data.folders };
  } catch {
    return { success: false };
  }
}

export async function updateNotebookItem(
  classCode: string,
  studentId: string,
  noteId: string,
  updates: { koreanText?: string; nativeText?: string; folderId?: string }
): Promise<{ success: boolean; items?: NotebookItem[] }> {
  try {
    const res = await fetch(
      `/api/notebook/${encodeURIComponent(classCode)}/${encodeURIComponent(studentId)}/${encodeURIComponent(noteId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }
    );
    const data = await res.json();
    return { success: res.ok, items: data.items };
  } catch {
    return { success: false };
  }
}

export async function deleteNotebookItem(
  classCode: string,
  studentId: string,
  noteId: string
): Promise<{ success: boolean; items?: NotebookItem[] }> {
  try {
    const res = await fetch(
      `/api/notebook/${encodeURIComponent(classCode)}/${encodeURIComponent(studentId)}/${encodeURIComponent(noteId)}`,
      { method: 'DELETE' }
    );
    const data = await res.json();
    return { success: res.ok, items: data.items };
  } catch {
    return { success: false };
  }
}

export async function createNotebookFolder(
  classCode: string,
  studentId: string,
  name: string
): Promise<{ success: boolean; folders?: NotebookFolder[] }> {
  try {
    const res = await fetch(
      `/api/notebook/${encodeURIComponent(classCode)}/${encodeURIComponent(studentId)}/folders`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }
    );
    const data = await res.json();
    return { success: res.ok, folders: data.folders };
  } catch {
    return { success: false };
  }
}

export async function renameNotebookFolder(
  classCode: string,
  studentId: string,
  folderId: string,
  name: string
): Promise<{ success: boolean; folders?: NotebookFolder[] }> {
  try {
    const res = await fetch(
      `/api/notebook/${encodeURIComponent(classCode)}/${encodeURIComponent(studentId)}/folders/${encodeURIComponent(folderId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }
    );
    const data = await res.json();
    return { success: res.ok, folders: data.folders };
  } catch {
    return { success: false };
  }
}

export async function lookupNotebookExpression(
  query: string,
  studentLanguage: LanguageCode
): Promise<{
  koreanText: string;
  nativeText: string;
  explanation: string;
  exampleSentence: string;
  pronunciation: string;
} | null> {
  try {
    const res = await fetch('/api/gemini/notebook-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, studentLanguage }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ==========================================
// Dialogue Translation (Text & Voice)
// ==========================================

export async function translateDialogue(
  text: string,
  direction: 'native_to_korean' | 'korean_to_native',
  studentLanguage: LanguageCode,
  lessonTopic: string
): Promise<{ translatedText: string; politeAlternative?: string; pronunciation?: string; error?: string }> {
  try {
    const res = await fetch('/api/gemini/translate-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, direction, studentLanguage, lessonTopic }),
    });
    if (!res.ok) {
      return {
        translatedText: '',
        error: '번역 서버 응답에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      };
    }
    return await res.json();
  } catch {
    return {
      translatedText: '',
      error: '네트워크 연결이 불안정하여 번역할 수 없습니다.',
    };
  }
}

// ==========================================
// Core Lesson AI Queries
// ==========================================

export async function fetchCurrentExplanation(
  lessonInfo: LessonInfo,
  stage: LessonStage,
  studentLanguage: LanguageCode,
  koreanLevel: KoreanLevel,
  simplifyMore: boolean = false,
  forceRefresh: boolean = false
): Promise<AIExplainCurrentResponse> {
  const cacheKey = getCacheKey(
    'explain-current',
    `${lessonInfo.topic}:${stage.id}`,
    studentLanguage,
    koreanLevel,
    simplifyMore ? 'simple' : 'standard'
  );

  if (!forceRefresh && sessionCache.has(cacheKey)) {
    return sessionCache.get(cacheKey);
  }

  const response = await fetch('/api/gemini/explain-current', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lessonInfo,
      stage,
      studentLanguage,
      koreanLevel,
      simplifyMore,
    }),
  });

  if (!response.ok) {
    throw new Error(`서버 응답 오류 (${response.status})`);
  }

  const data: AIExplainCurrentResponse = await response.json();
  sessionCache.set(cacheKey, data);
  return data;
}

export async function fetchThinkingScaffold(
  lessonInfo: LessonInfo,
  stage: LessonStage,
  questionIndex: number,
  studentLanguage: LanguageCode,
  koreanLevel: KoreanLevel,
  forceRefresh: boolean = false
): Promise<AIThinkingScaffoldResponse> {
  const cacheKey = getCacheKey(
    'thinking-scaffold',
    `${lessonInfo.topic}:${stage.id}`,
    studentLanguage,
    koreanLevel,
    `q-${questionIndex}`
  );

  if (!forceRefresh && sessionCache.has(cacheKey)) {
    return sessionCache.get(cacheKey);
  }

  const response = await fetch('/api/gemini/scaffold-thinking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lessonInfo,
      stage,
      questionIndex,
      studentLanguage,
      koreanLevel,
    }),
  });

  if (!response.ok) {
    throw new Error(`서버 응답 오류 (${response.status})`);
  }

  const data: AIThinkingScaffoldResponse = await response.json();
  sessionCache.set(cacheKey, data);
  return data;
}

export async function fetchSpeechBridge(
  lessonInfo: LessonInfo,
  stage: LessonStage,
  studentInput: string,
  studentLanguage: LanguageCode,
  koreanLevel: KoreanLevel
): Promise<AISpeechBridgeResponse> {
  const cacheKey = getCacheKey(
    'speech-bridge',
    `${lessonInfo.topic}:${stage.id}`,
    studentLanguage,
    koreanLevel,
    studentInput.trim()
  );

  if (sessionCache.has(cacheKey)) {
    return sessionCache.get(cacheKey);
  }

  const response = await fetch('/api/gemini/speech-bridge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lessonInfo,
      stage,
      studentInput,
      studentLanguage,
      koreanLevel,
    }),
  });

  if (!response.ok) {
    throw new Error(`서버 응답 오류 (${response.status})`);
  }

  const data: AISpeechBridgeResponse = await response.json();
  sessionCache.set(cacheKey, data);
  return data;
}

export async function fetchTeacherPreview(
  lessonInfo: LessonInfo,
  stage: LessonStage,
  studentLanguage: LanguageCode,
  koreanLevel: KoreanLevel,
  reviewLanguage: 'ko' | 'en',
  forceRefresh: boolean = false
): Promise<AITeacherPreviewResponse> {
  const cacheKey = getCacheKey(
    'teacher-preview',
    `${lessonInfo.topic}:${stage.id}`,
    studentLanguage,
    koreanLevel,
    reviewLanguage
  );

  if (!forceRefresh && sessionCache.has(cacheKey)) {
    return sessionCache.get(cacheKey);
  }

  const response = await fetch('/api/gemini/teacher-preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lessonInfo,
      stage,
      studentLanguage,
      koreanLevel,
      reviewLanguage,
    }),
  });

  if (!response.ok) {
    throw new Error(`서버 응답 오류 (${response.status})`);
  }

  const data: AITeacherPreviewResponse = await response.json();
  sessionCache.set(cacheKey, data);
  return data;
}

// Enhanced Web Speech API TTS helper with speed controls and natural voice selection
export function speakKoreanText(text: string, rate: number = 0.85): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = rate; // 0.75 for slower language learner mode, 0.85 default, 1.0 normal
    utterance.pitch = 1.0;

    // Pick natural voice if available in browser
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(
      (v) => (v.lang === 'ko-KR' || v.lang.startsWith('ko')) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Yuna'))
    ) || voices.find((v) => v.lang.startsWith('ko'));

    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis error:', err);
    return false;
  }
}
