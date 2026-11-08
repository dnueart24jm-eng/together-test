import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { DEFAULT_LESSON_PARSED } from './src/data/defaultLesson.ts';
import {
  LessonData,
  ClassroomSession,
  StudentSession,
  StudentTaskState,
  NotebookItem,
  CommunicationMessage,
} from './src/types/lesson.ts';

dotenv.config();

const __dirname =
  typeof import.meta !== 'undefined' && import.meta.url
    ? path.dirname(fileURLToPath(import.meta.url))
    : process.cwd();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI instance
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (e) {
    console.warn('Could not initialize GoogleGenAI client:', e);
  }
}

// Timeout helper & circuit breaker to ensure snappy classroom responsiveness
const aiResponseCache = new Map<string, any>();
let geminiQuotaCooldownUntil = 0;

async function generateWithTimeout(callPromise: Promise<any>, timeoutMs = 3500): Promise<any> {
  return Promise.race([
    callPromise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('AI response timed out')), timeoutMs)),
  ]);
}

async function callGeminiSafe(
  params: { model: string; contents: string; config?: any },
  cacheKey?: string
): Promise<any | null> {
  if (cacheKey && aiResponseCache.has(cacheKey)) {
    return aiResponseCache.get(cacheKey);
  }
  if (!ai || Date.now() < geminiQuotaCooldownUntil) {
    return null;
  }
  try {
    const response = await generateWithTimeout(ai.models.generateContent(params));
    if (response?.text) {
      const parsed = JSON.parse(response.text);
      if (cacheKey) {
        aiResponseCache.set(cacheKey, parsed);
      }
      return parsed;
    }
    return null;
  } catch (err: any) {
    const msg = String(err?.message || err || '');
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('403')) {
      geminiQuotaCooldownUntil = Date.now() + 10 * 60 * 1000; // 10-minute cooldown
      console.info('[TogetherON] Gemini free-tier quota reached; using built-in multilingual educational fallback.');
    } else {
      console.info('[TogetherON] Gemini unavailable; using built-in multilingual educational fallback.');
    }
    return null;
  }
}

const GTX_LANG_MAP: Record<string, string> = {
  ko: 'ko',
  en: 'en',
  vi: 'vi',
  ru: 'ru',
  'uz-Latn': 'uz',
  'uz-Cyrl': 'uz',
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
};

async function translateTextFree(text: string, targetLang: string, sourceLang?: string): Promise<string | null> {
  if (!text || !text.trim()) return null;
  const trimmed = text.trim();
  const tl = GTX_LANG_MAP[targetLang] || targetLang || 'en';
  const sl = sourceLang
    ? (GTX_LANG_MAP[sourceLang] || sourceLang)
    : (/[가-힣]/.test(trimmed) ? 'ko' : 'en');
  if (sl === tl) return trimmed;

  // 1. Try Google Translate gtx
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (resp.ok) {
      const data = (await resp.json()) as any;
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map((item: any) => (Array.isArray(item) ? item[0] : '')).join('').trim();
        if (translated) return translated;
      }
    }
  } catch {
    // Fall through to MyMemory
  }

  // 2. Fallback to MyMemory free translation API
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${encodeURIComponent(`${sl}|${tl}`)}`;
    const resp = await fetch(mmUrl, { signal: controller.signal });
    clearTimeout(timer);
    if (resp.ok) {
      const data = (await resp.json()) as any;
      const translated = data?.responseData?.translatedText;
      if (typeof translated === 'string' && translated.trim() && !translated.includes('MYMEMORY WARNING')) {
        return translated.trim();
      }
    }
  } catch {
    // Ignore
  }

  return null;
}

// ==========================================
// File-Backed Server State (100% Free, Multi-Device)
// ==========================================
const IS_SERVERLESS = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = IS_SERVERLESS ? '/tmp/togetheron_data' : path.resolve(__dirname, 'data');
const STATE_FILE = path.resolve(DATA_DIR, 'togetheron_store.json');

async function publishRelay(topic: string, payload: unknown): Promise<void> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    await fetch(`https://ntfy.sh/togetheron-v5-${encodeURIComponent(topic)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch {
    // Non-blocking relay
  }
}

async function pollRelay(topic: string): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const resp = await fetch(`https://ntfy.sh/togetheron-v5-${encodeURIComponent(topic)}/json?poll=1&since=30m`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!resp.ok) return [];
    const text = await resp.text();
    const results: any[] = [];
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        if (parsed?.event === 'message' && parsed?.message) {
          results.push(JSON.parse(parsed.message));
        }
      } catch {
        // ignore malformed line
      }
    }
    return results;
  } catch {
    return [];
  }
}

interface ServerStoreData {
  teacherSalt: string;
  teacherPasswordHash: string;
  classrooms: Record<string, ClassroomSession>;
  notebooks: Record<string, NotebookItem[]>; // key: `${classCode}:${studentId}`
  notebookFolders: Record<string, Array<{ id: string; name: string; isDefault?: boolean }>>;
  lessons: Record<string, {
    id: string;
    title: string;
    subject: string;
    unit: string;
    period: string;
    stageCount: number;
    uploadedAt: string;
    isArchived: boolean;
    lessonData: LessonData;
  }>;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex');
}

// Initialize default store
const defaultSalt = 'togetheron-salt-seed';

let serverStore: ServerStoreData = {
  teacherSalt: defaultSalt,
  teacherPasswordHash: '',
  classrooms: {
    'ON-7429': {
      code: 'ON-7429',
      title: '초등 사회: 지능정보화로 달라진 생활 모습',
      currentStageId: 'INTRO',
      lessonData: DEFAULT_LESSON_PARSED,
      createdAt: Date.now(),
      isActive: true,
      students: {},
    },
  },
  notebooks: {},
  notebookFolders: {},
  lessons: {
    [DEFAULT_LESSON_PARSED.id]: {
      id: DEFAULT_LESSON_PARSED.id,
      title: DEFAULT_LESSON_PARSED.title || '초등 사회: 지능정보화로 달라진 생활 모습',
      subject: DEFAULT_LESSON_PARSED.info.subject,
      unit: DEFAULT_LESSON_PARSED.info.unit,
      period: DEFAULT_LESSON_PARSED.info.period,
      stageCount: DEFAULT_LESSON_PARSED.stages.length,
      uploadedAt: new Date().toLocaleDateString('ko-KR'),
      isArchived: false,
      lessonData: DEFAULT_LESSON_PARSED,
    },
  },
};

// Load existing state from disk if exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(STATE_FILE)) {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    serverStore = {
      ...serverStore,
      ...parsed,
      classrooms: parsed.classrooms || serverStore.classrooms,
      notebooks: parsed.notebooks || {},
      notebookFolders: parsed.notebookFolders || {},
      lessons: parsed.lessons || serverStore.lessons,
    };
    // Ensure ON-7429 exists
    if (!serverStore.classrooms['ON-7429']) {
      serverStore.classrooms['ON-7429'] = {
        code: 'ON-7429',
        title: '초등 사회: 지능정보화로 달라진 생활 모습',
        currentStageId: 'INTRO',
        lessonData: DEFAULT_LESSON_PARSED,
        createdAt: Date.now(),
        isActive: true,
        students: {},
      };
    }
  } else {
    fs.writeFileSync(STATE_FILE, JSON.stringify(serverStore, null, 2), 'utf-8');
  }
} catch (err) {
  console.warn('Could not read/write local store file:', err);
}

function saveStoreToDisk() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(serverStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save store to disk:', err);
  }
}

// Active teacher session tokens (in-memory)
const activeTeacherTokens = new Set<string>();

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    model: 'gemini-3.8-flash',
    activeClassrooms: Object.keys(serverStore.classrooms).length,
  });
});

// ==========================================
// Teacher Authentication Endpoints
// ==========================================

function getAuthSecret(): string {
  return process.env.TEACHER_AUTH_SECRET || process.env.GEMINI_API_KEY || serverStore.teacherSalt || 'togetheron-hmac-secret';
}

function createSignedTeacherToken(): string {
  const payload = `teacher.${Date.now()}.${crypto.randomBytes(8).toString('hex')}`;
  const sig = crypto.createHmac('sha256', getAuthSecret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifySignedTeacherToken(token?: string): boolean {
  if (!token) return false;
  if (activeTeacherTokens.has(token)) return true;
  const parts = token.split('.');
  if (parts.length !== 4 || parts[0] !== 'teacher') return false;
  const payload = `${parts[0]}.${parts[1]}.${parts[2]}`;
  const sig = parts[3];
  const expected = crypto.createHmac('sha256', getAuthSecret()).update(payload).digest('hex');
  return sig === expected;
}

// Teacher login
app.post('/api/auth/teacher/login', (req: Request, res: Response): void => {
  const { password } = req.body;
  if (!password) {
    res.status(400).json({ error: '비밀번호를 입력해 주세요.' });
    return;
  }

  const envPassword = process.env.TEACHER_PASSWORD;
  const hasConfiguredPassword = Boolean(envPassword || serverStore.teacherPasswordHash);

  if (!hasConfiguredPassword) {
    res.status(500).json({
      error: '서버에 교사 비밀번호(TEACHER_PASSWORD)가 설정되지 않았습니다. Netlify 환경변수를 확인해 주세요.',
    });
    return;
  }

  const isMatch = envPassword
    ? password === envPassword
    : hashPassword(password, serverStore.teacherSalt) === serverStore.teacherPasswordHash;

  if (!isMatch) {
    res.status(401).json({ error: '비밀번호가 올바르지 않습니다.' });
    return;
  }

  const token = createSignedTeacherToken();
  activeTeacherTokens.add(token);

  res.json({
    success: true,
    token,
    message: '교사 인증 성공',
  });
});

// Teacher password change / setup
app.post('/api/auth/teacher/setup', (req: Request, res: Response): void => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    res.status(400).json({ error: '새 비밀번호는 최소 4자 이상이어야 합니다.' });
    return;
  }

  // If already set, verify current
  if (serverStore.teacherPasswordHash) {
    const envPassword = process.env.TEACHER_PASSWORD;
    const computedCurrent = hashPassword(currentPassword || '', serverStore.teacherSalt);
    const isCurrentValid =
      (envPassword && currentPassword === envPassword) ||
      computedCurrent === serverStore.teacherPasswordHash;
    if (!isCurrentValid) {
      res.status(401).json({ error: '현재 비밀번호가 일치하지 않습니다.' });
      return;
    }
  }

  const newSalt = crypto.randomBytes(8).toString('hex');
  const newHash = hashPassword(newPassword, newSalt);
  serverStore.teacherSalt = newSalt;
  serverStore.teacherPasswordHash = newHash;
  saveStoreToDisk();

  const token = createSignedTeacherToken();
  activeTeacherTokens.add(token);

  res.json({
    success: true,
    token,
    message: '교사 비밀번호가 안전하게 변경되었습니다.',
  });
});

// Check teacher token validity
app.get('/api/auth/teacher/check', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  const isValid = verifySignedTeacherToken(token);
  res.json({ isValid });
});

// Middleware for teacher protected routes
function requireTeacherAuth(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!verifySignedTeacherToken(token)) {
    res.status(401).json({ error: '교사 인증이 필요합니다.' });
    return;
  }
  next();
}

// ==========================================
// Classroom Code & Sync Endpoints (Multi-Device)
// ==========================================

// Create or update a classroom session (Teacher only)
app.post('/api/classroom/create', requireTeacherAuth, (req: Request, res: Response): void => {
  const { lessonData, customCode } = req.body;
  const code = (customCode || `ON-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase();

  const session: ClassroomSession = {
    code,
    title: lessonData?.title || '수업',
    currentStageId: lessonData?.stages?.[0]?.id || 'INTRO',
    lessonData: lessonData || DEFAULT_LESSON_PARSED,
    createdAt: Date.now(),
    isActive: true,
    students: {},
  };

  serverStore.classrooms[code] = session;
  saveStoreToDisk();

  res.json({
    success: true,
    classroom: session,
  });
});

// Get classroom status (Student / Teacher lookup)
app.get('/api/classroom/:code', async (req: Request, res: Response): Promise<void> => {
  const code = req.params.code.toUpperCase();
  const classroom = serverStore.classrooms[code];

  if (!classroom) {
    res.status(404).json({ error: '존재하지 않거나 만료된 수업 코드입니다.' });
    return;
  }

  if (!classroom.isActive) {
    res.status(403).json({ error: '선생님께서 종료한 수업입니다.' });
    return;
  }

  // Merge any cross-container updates from teacher
  const relayMsgs = await pollRelay(`class-${code}`);
  if (relayMsgs.length > 0) {
    const latest = relayMsgs[relayMsgs.length - 1];
    if (latest?.currentStageId) {
      classroom.currentStageId = latest.currentStageId;
    }
    if (latest?.lessonData?.stages?.length > 0) {
      classroom.lessonData = latest.lessonData;
      classroom.title = latest.title || classroom.title;
    }
  }

  res.json({
    code: classroom.code,
    title: classroom.title,
    currentStageId: classroom.currentStageId,
    lessonData: classroom.lessonData,
    isActive: classroom.isActive,
    studentCount: Object.keys(classroom.students || {}).length,
  });
});

// Teacher changes current stage (Sync to all students)
app.post('/api/classroom/:code/stage', requireTeacherAuth, async (req: Request, res: Response): Promise<void> => {
  const code = req.params.code.toUpperCase();
  const { stageId } = req.body;
  const classroom = serverStore.classrooms[code];

  if (!classroom) {
    res.status(404).json({ error: '수업을 찾을 수 없습니다.' });
    return;
  }

  classroom.currentStageId = stageId;
  saveStoreToDisk();
  await publishRelay(`class-${code}`, {
    currentStageId: classroom.currentStageId,
    lessonData: classroom.lessonData,
    title: classroom.title,
    updatedAt: Date.now(),
  });

  res.json({
    success: true,
    currentStageId: classroom.currentStageId,
  });
});

// Teacher updates active lesson for classroom (Sync to all students)
app.post('/api/classroom/:code/lesson', requireTeacherAuth, (req: Request, res: Response): void => {
  const code = req.params.code.toUpperCase();
  const { lessonData } = req.body as { lessonData: LessonData };
  const classroom = serverStore.classrooms[code];

  if (!classroom) {
    res.status(404).json({ error: '수업을 찾을 수 없습니다.' });
    return;
  }
  if (!lessonData || !lessonData.stages || lessonData.stages.length === 0) {
    res.status(400).json({ error: '유효한 수업 자료가 아닙니다.' });
    return;
  }

  classroom.lessonData = lessonData;
  classroom.title = lessonData.title || `${lessonData.info.subject}: ${lessonData.info.topic}`;
  classroom.currentStageId = lessonData.stages[0].id;
  aiResponseCache.clear();

  // Also save/update in lesson library
  serverStore.lessons[lessonData.id] = {
    id: lessonData.id,
    title: classroom.title,
    subject: lessonData.info.subject,
    unit: lessonData.info.unit,
    period: lessonData.info.period,
    stageCount: lessonData.stages.length,
    uploadedAt: new Date().toLocaleDateString('ko-KR'),
    isArchived: false,
    lessonData,
  };

  saveStoreToDisk();

  res.json({
    success: true,
    classroom: {
      code: classroom.code,
      title: classroom.title,
      currentStageId: classroom.currentStageId,
      lessonData: classroom.lessonData,
    },
  });
});

// ==========================================
// Lesson Library & Archive Endpoints
// ==========================================

app.get('/api/lessons', requireTeacherAuth, (_req: Request, res: Response): void => {
  const list = Object.values(serverStore.lessons || {});
  res.json({ lessons: list });
});

app.post('/api/lessons', requireTeacherAuth, (req: Request, res: Response): void => {
  const { lessonData } = req.body as { lessonData: LessonData };
  if (!lessonData || !lessonData.id) {
    res.status(400).json({ error: '유효한 수업 자료가 아닙니다.' });
    return;
  }
  const record = {
    id: lessonData.id,
    title: lessonData.title || `${lessonData.info.subject}: ${lessonData.info.topic}`,
    subject: lessonData.info.subject,
    unit: lessonData.info.unit,
    period: lessonData.info.period,
    stageCount: lessonData.stages.length,
    uploadedAt: new Date().toLocaleDateString('ko-KR'),
    isArchived: false,
    lessonData,
  };
  serverStore.lessons[lessonData.id] = record;
  saveStoreToDisk();
  res.json({ success: true, lesson: record, lessons: Object.values(serverStore.lessons) });
});

app.patch('/api/lessons/:id', requireTeacherAuth, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { title, isArchived } = req.body;
  const existing = serverStore.lessons[id];
  if (!existing) {
    res.status(404).json({ error: '수업 자료를 찾을 수 없습니다.' });
    return;
  }
  if (typeof title === 'string' && title.trim()) {
    existing.title = title.trim();
    existing.lessonData.title = title.trim();
  }
  if (typeof isArchived === 'boolean') {
    existing.isArchived = isArchived;
  }
  saveStoreToDisk();
  res.json({ success: true, lesson: existing, lessons: Object.values(serverStore.lessons) });
});

app.delete('/api/lessons/:id', requireTeacherAuth, (req: Request, res: Response): void => {
  const { id } = req.params;
  if (!serverStore.lessons[id]) {
    res.status(404).json({ error: '수업 자료를 찾을 수 없습니다.' });
    return;
  }
  delete serverStore.lessons[id];
  saveStoreToDisk();
  res.json({ success: true, lessons: Object.values(serverStore.lessons) });
});

// Student joins class with nickname, language, level
app.post('/api/classroom/:code/join', async (req: Request, res: Response): Promise<void> => {
  const code = req.params.code.toUpperCase();
  const { nickname, language, koreanLevel, studentId } = req.body;

  const classroom = serverStore.classrooms[code];
  if (!classroom || !classroom.isActive) {
    res.status(404).json({ error: '유효한 수업 코드가 아닙니다.' });
    return;
  }

  const sId = studentId || `std_${crypto.randomBytes(6).toString('hex')}`;
  const existing = classroom.students[sId];

  const studentSession: StudentSession = {
    id: sId,
    classCode: code,
    nickname: nickname || (existing ? existing.nickname : `학생 ${Object.keys(classroom.students).length + 1}`),
    language: language || (existing ? existing.language : 'en'),
    koreanLevel: koreanLevel || (existing ? existing.koreanLevel : 'beginner'),
    currentStageId: classroom.currentStageId,
    taskStates: existing ? existing.taskStates : {},
    lastActive: Date.now(),
  };

  classroom.students[sId] = studentSession;
  saveStoreToDisk();
  await publishRelay(`students-${code}`, { student: studentSession, updatedAt: Date.now() });

  res.json({
    success: true,
    student: studentSession,
    classroom: {
      code: classroom.code,
      title: classroom.title,
      currentStageId: classroom.currentStageId,
      lessonData: classroom.lessonData,
    },
  });
});

// Student updates task progress & help status
app.post('/api/classroom/:code/student-status', async (req: Request, res: Response): Promise<void> => {
  const code = req.params.code.toUpperCase();
  const { studentId, taskId, stageId, status, helpReason, helpNote } = req.body;

  const classroom = serverStore.classrooms[code];
  if (!classroom) {
    res.status(404).json({ error: '수업을 찾을 수 없습니다.' });
    return;
  }

  const student = classroom.students[studentId];
  if (!student) {
    res.status(404).json({ error: '학생 정보를 찾을 수 없습니다.' });
    return;
  }

  student.lastActive = Date.now();
  if (taskId) {
    student.taskStates[taskId] = {
      taskId,
      stageId: stageId || classroom.currentStageId,
      status: status || 'not_started',
      helpReason,
      helpNote,
      updatedAt: Date.now(),
    };
  }

  saveStoreToDisk();
  await publishRelay(`students-${code}`, { student, updatedAt: Date.now() });

  res.json({
    success: true,
    taskStates: student.taskStates,
    currentStageId: classroom.currentStageId,
  });
});

// Teacher dashboard: get all student live statuses
app.get('/api/classroom/:code/dashboard', requireTeacherAuth, async (req: Request, res: Response): Promise<void> => {
  const code = req.params.code.toUpperCase();
  const classroom = serverStore.classrooms[code];

  if (!classroom) {
    res.status(404).json({ error: '수업을 찾을 수 없습니다.' });
    return;
  }

  const studentMsgs = await pollRelay(`students-${code}`);
  for (const msg of studentMsgs) {
    if (msg?.student?.id) {
      const existing = classroom.students[msg.student.id];
      if (!existing || (msg.student.lastActive || 0) >= (existing.lastActive || 0)) {
        classroom.students[msg.student.id] = msg.student;
      }
    }
  }

  const studentList = Object.values(classroom.students || {});

  res.json({
    code: classroom.code,
    title: classroom.title,
    currentStageId: classroom.currentStageId,
    isActive: classroom.isActive,
    students: studentList,
  });
});

// Teacher marks help request as resolved
app.post('/api/classroom/:code/resolve-help', requireTeacherAuth, (req: Request, res: Response): void => {
  const code = req.params.code.toUpperCase();
  const { studentId, taskId } = req.body;

  const classroom = serverStore.classrooms[code];
  if (!classroom || !classroom.students[studentId]) {
    res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
    return;
  }

  const student = classroom.students[studentId];
  if (student.taskStates[taskId]) {
    student.taskStates[taskId].status = 'in_progress';
    student.taskStates[taskId].helpReason = undefined;
    student.taskStates[taskId].updatedAt = Date.now();
  }

  saveStoreToDisk();
  res.json({ success: true, taskStates: student.taskStates });
});

// Teacher ends classroom code
app.post('/api/classroom/:code/end', requireTeacherAuth, (req: Request, res: Response): void => {
  const code = req.params.code.toUpperCase();
  const classroom = serverStore.classrooms[code];

  if (!classroom) {
    res.status(404).json({ error: '수업을 찾을 수 없습니다.' });
    return;
  }

  classroom.isActive = false;
  saveStoreToDisk();

  res.json({ success: true, message: '수업이 안전하게 종료되었습니다.' });
});

// ==========================================
// Personal Korean Learning Notebook Endpoints
// ==========================================

function getDefaultNotebookFolders() {
  return [
    { id: 'folder_words', name: '새로 배운 단어', isDefault: true },
    { id: 'folder_sentences', name: '유용한 한국어 문장', isDefault: true },
    { id: 'folder_subject', name: '교과별 핵심 표현', isDefault: true },
    { id: 'folder_mine', name: '내가 직접 만든 표현', isDefault: true },
  ];
}

// Get student's notebook items & folders
app.get('/api/notebook/:classCode/:studentId', (req: Request, res: Response): void => {
  const { classCode, studentId } = req.params;
  const key = `${classCode.toUpperCase()}:${studentId}`;
  const items = serverStore.notebooks[key] || [];
  if (!serverStore.notebookFolders[key]) {
    serverStore.notebookFolders[key] = getDefaultNotebookFolders();
  }
  res.json({ items, folders: serverStore.notebookFolders[key] });
});

// Add item to notebook
app.post('/api/notebook/:classCode/:studentId', (req: Request, res: Response): void => {
  const { classCode, studentId } = req.params;
  const { type, koreanText, nativeText, pronunciation, exampleSentence, folderId, subjectTopic, stageId } = req.body;

  if (!koreanText || !nativeText) {
    res.status(400).json({ error: '내용이 누락되었습니다.' });
    return;
  }

  const key = `${classCode.toUpperCase()}:${studentId}`;
  if (!serverStore.notebooks[key]) {
    serverStore.notebooks[key] = [];
  }
  if (!serverStore.notebookFolders[key]) {
    serverStore.notebookFolders[key] = getDefaultNotebookFolders();
  }

  const defaultFolderForType =
    type === 'my_sentence'
      ? 'folder_mine'
      : type === 'concept' || type === 'expression'
      ? 'folder_subject'
      : 'folder_words';

  // Avoid duplicates
  const exists = serverStore.notebooks[key].some(
    (item) => item.koreanText.trim() === koreanText.trim()
  );
  if (exists) {
    res.json({
      success: true,
      duplicate: true,
      items: serverStore.notebooks[key],
      folders: serverStore.notebookFolders[key],
    });
    return;
  }

  const newItem: NotebookItem = {
    id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    studentId,
    classCode: classCode.toUpperCase(),
    folderId: folderId || defaultFolderForType,
    type: type || 'word',
    koreanText: koreanText.trim(),
    nativeText: nativeText.trim(),
    pronunciation,
    exampleSentence,
    subjectTopic,
    stageId,
    dateSaved: new Date().toLocaleDateString('ko-KR'),
  };

  serverStore.notebooks[key].unshift(newItem);
  saveStoreToDisk();

  res.json({
    success: true,
    duplicate: false,
    item: newItem,
    items: serverStore.notebooks[key],
    folders: serverStore.notebookFolders[key],
  });
});

// Update / move notebook item
app.patch('/api/notebook/:classCode/:studentId/:noteId', (req: Request, res: Response): void => {
  const { classCode, studentId, noteId } = req.params;
  const { koreanText, nativeText, folderId } = req.body;
  const key = `${classCode.toUpperCase()}:${studentId}`;
  const items = serverStore.notebooks[key] || [];
  const target = items.find((i) => i.id === noteId);
  if (!target) {
    res.status(404).json({ error: '노트 항목을 찾을 수 없습니다.' });
    return;
  }
  if (typeof koreanText === 'string' && koreanText.trim()) target.koreanText = koreanText.trim();
  if (typeof nativeText === 'string' && nativeText.trim()) target.nativeText = nativeText.trim();
  if (typeof folderId === 'string') target.folderId = folderId;
  saveStoreToDisk();
  res.json({ success: true, item: target, items });
});

// Delete item from notebook
app.delete('/api/notebook/:classCode/:studentId/:noteId', (req: Request, res: Response): void => {
  const { classCode, studentId, noteId } = req.params;
  const key = `${classCode.toUpperCase()}:${studentId}`;

  if (serverStore.notebooks[key]) {
    serverStore.notebooks[key] = serverStore.notebooks[key].filter((item) => item.id !== noteId);
    saveStoreToDisk();
  }

  res.json({ success: true, items: serverStore.notebooks[key] || [] });
});

// Create custom folder
app.post('/api/notebook/:classCode/:studentId/folders', (req: Request, res: Response): void => {
  const { classCode, studentId } = req.params;
  const { name } = req.body;
  if (!name || !name.trim()) {
    res.status(400).json({ error: '폴더 이름을 입력해 주세요.' });
    return;
  }
  const key = `${classCode.toUpperCase()}:${studentId}`;
  if (!serverStore.notebookFolders[key]) {
    serverStore.notebookFolders[key] = getDefaultNotebookFolders();
  }
  const newFolder = {
    id: `folder_${Date.now()}`,
    name: name.trim(),
    isDefault: false,
  };
  serverStore.notebookFolders[key].push(newFolder);
  saveStoreToDisk();
  res.json({ success: true, folder: newFolder, folders: serverStore.notebookFolders[key] });
});

// Rename folder
app.patch('/api/notebook/:classCode/:studentId/folders/:folderId', (req: Request, res: Response): void => {
  const { classCode, studentId, folderId } = req.params;
  const { name } = req.body;
  const key = `${classCode.toUpperCase()}:${studentId}`;
  const folders = serverStore.notebookFolders[key] || [];
  const folder = folders.find((f) => f.id === folderId);
  if (!folder) {
    res.status(404).json({ error: '폴더를 찾을 수 없습니다.' });
    return;
  }
  if (typeof name === 'string' && name.trim()) {
    folder.name = name.trim();
    saveStoreToDisk();
  }
  res.json({ success: true, folders });
});

// AI Notebook Word / Sentence Lookup
app.post('/api/gemini/notebook-lookup', async (req: Request, res: Response): Promise<void> => {
  const { query, studentLanguage = 'en' } = req.body;
  if (!query || !query.trim()) {
    res.status(400).json({ error: '검색어를 입력해 주세요.' });
    return;
  }

  const parsed = await callGeminiSafe(
    {
      model: 'gemini-3.8-flash',
      contents: `학생이 한국어 학습 노트에 저장하기 위해 "${query.trim()}"을(를) 검색했습니다.
학생의 모국어 코드는 "${studentLanguage}"입니다.
초등학생이 이해하기 쉽게 다음 JSON 형식으로 응답하세요:
{
  "koreanText": "한국어 단어 또는 문장",
  "nativeText": "학생 모국어(${studentLanguage}) 뜻",
  "explanation": "학생 모국어(${studentLanguage})로 된 쉬운 설명 (1~2문장)",
  "exampleSentence": "초등학생이 교실에서 쓸 수 있는 간단한 한국어 예문",
  "pronunciation": "로마자 발음 표기"
}`,
      config: {
        systemInstruction: '당신은 이주배경 초등학생의 한국어 학습을 돕는 친절한 선생님입니다. 반드시 요청된 JSON 형식으로만 응답하세요.',
        responseMimeType: 'application/json',
      },
    },
    `lookup:${studentLanguage}:${query.trim()}`
  );

  if (parsed?.koreanText && parsed?.nativeText) {
    if (!parsed.pronunciation || isMostlyKorean(parsed.pronunciation)) {
      parsed.pronunciation = romanizeKorean(parsed.koreanText);
    }
    res.json(parsed);
    return;
  }

  // Intelligent fallback when offline/quota-limited
  const q = query.trim();
  const isKorean = /[가-힣]/.test(q);
  const translated = await translateTextFree(q, isKorean ? studentLanguage : 'ko');
  const targetKorean = isKorean ? q : (translated || q);
  const fallbackExplanations: Record<string, string> = {
    en: `Elementary-friendly Korean expression for "${q}". Practice saying it aloud with your classmates!`,
    vi: `Biểu hiện tiếng Hàn dễ hiểu cho "${q}". Hãy luyện đọc to cùng các bạn nhé!`,
    ru: `Понятное корейское выражение для «${q}». Потренируйся произносить его вслух!`,
    'uz-Latn': `"${q}" uchun boshlang‘ich sinf o‘quvchilariga mos koreyscha ibora.`,
    'uz-Cyrl': `"${q}" учун бошланғич синф ўқувчиларига мос корейсча ибора.`,
    'zh-Hans': `适合小学生学习的韩语表达“${q}”。试着和同学们一起大声读出来吧！`,
    'zh-Hant': `適合小學生學習的韓語表達「${q}」。試著和同學們一起大聲讀出來吧！`,
    ko: `"${q}"의 뜻을 익히고 교실에서 친구들과 함께 사용해 보세요.`,
  };

  res.json({
    koreanText: isKorean ? q : (translated || `${q} (한국어 표현)`),
    nativeText: isKorean ? (translated || `${q} (${studentLanguage})`) : q,
    explanation: fallbackExplanations[studentLanguage] || fallbackExplanations.en,
    exampleSentence: isKorean ? `오늘 수업에서 "${q}"을(를) 배웠어요.` : `친구에게 "${translated || q}"라고 말해요.`,
    pronunciation: romanizeKorean(targetKorean),
  });
});

// ==========================================
// Classroom Dialogue Translation (Text & Voice)
// ==========================================
app.post('/api/gemini/translate-speech', async (req: Request, res: Response): Promise<void> => {
  const {
    text,
    direction = 'native_to_korean', // 'native_to_korean' | 'korean_to_native'
    studentLanguage = 'en',
    lessonTopic = '사회 수업',
  } = req.body;

  if (!text || !text.trim()) {
    res.status(400).json({ error: '번역할 내용이 없습니다.' });
    return;
  }

  if (ai) {
    try {
      const systemInstruction = `
당신은 대한민국 초등학교 교실에서 다문화 이주배경 학생과 한국인 짝꿍/선생님 간의 즉각적인 교실 의사소통을 돕는 통역 AI '함께ON'입니다.
규칙:
1. 학생이 말하지 않은 정보를 절대 지어내지 마세요.
2. 초등학생 눈높이에 맞는 자연스럽고 친절한 대화체 문장을 만듭니다.
3. 한국어 발음 안내(로마자)를 정확하게 제공합니다.
`;

      const prompt = direction === 'native_to_korean'
        ? `[상황: 수업 주제 "${lessonTopic}"]
학생의 모국어(${studentLanguage}) 발화: "${text}"
이를 초등학교 교실에서 친구나 선생님에게 전달할 수 있는 자연스러운 한국어 문장으로 번역하세요.
JSON 형식:
{
  "translatedText": "자연스러운 한국어 문장",
  "pronunciation": "로마자 발음 표기",
  "detectedMeaning": "원문 확인"
}`
        : `[상황: 수업 주제 "${lessonTopic}"]
친구 또는 선생님의 한국어 발화: "${text}"
이를 이주배경 학생의 모국어(${studentLanguage})로 쉽고 친절하게 번역하세요.
JSON 형식:
{
  "translatedText": "학생 모국어 번역 문장",
  "pronunciation": "",
  "detectedMeaning": "한국어 원문"
}`;

      const parsed = await callGeminiSafe(
        {
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        },
        `translate:${direction}:${studentLanguage}:${text.trim()}`
      );

      if (parsed?.translatedText) {
        if (direction === 'native_to_korean') {
          if (!parsed.pronunciation || isMostlyKorean(parsed.pronunciation)) {
            parsed.pronunciation = romanizeKorean(parsed.translatedText);
          }
        }
        res.json(parsed);
        return;
      }
    } catch {
      // Fallback below
    }
  }

  // Accurate free translation fallback
  if (direction === 'native_to_korean') {
    const koTranslated = await translateTextFree(text, 'ko');
    const finalKo = koTranslated || `${text}라고 생각해요.`;
    res.json({
      translatedText: finalKo,
      pronunciation: romanizeKorean(finalKo),
      detectedMeaning: text,
    });
  } else {
    const nativeTranslated = await translateTextFree(text, studentLanguage);
    res.json({
      translatedText: nativeTranslated || text,
      pronunciation: '',
      detectedMeaning: text,
    });
  }
});

// ==========================================
// Core Lesson AI Endpoints
// ==========================================

// 1. Explain Current Stage (/api/gemini/explain-current)
app.post('/api/gemini/explain-current', async (req: Request, res: Response): Promise<void> => {
  const {
    lessonInfo,
    stage,
    studentLanguage = 'en',
    koreanLevel = 'beginner',
    simplifyMore = false,
  } = req.body;

  if (!stage) {
    res.status(400).json({ error: 'Stage data is required' });
    return;
  }

  if (ai) {
    try {
      const systemInstruction = `
당신은 대한민국 초등학교 일반학급에서 수업을 듣는 '이주배경 초등학생'의 수업 이해와 참여를 돕는 따뜻하고 친절한 교육 지원 AI 도우미 '함께ON'입니다.
절대적 교육 원칙:
1. 교사가 제공한 수업 자료와 학습 목표를 철저히 존중하고 바탕으로 삼습니다.
2. 학생의 한국어 능력 부족을 사고력 부족으로 오해하지 마세요.
3. 정답을 대신 적어주거나 지어내지 마세요.
4. 초등학생 눈높이에 맞춘 친절하고 명확한 문장을 사용합니다.
5. 학생이 설명을 확인한 뒤 실제 교실 활동(선생님 말씀 듣기, 교과서 보기, 짝꿍과 이야기하기)으로 돌아갈 수 있도록 이끕니다.
6. 학생의 모국어(${studentLanguage})와 한국어 이해 수준(${koreanLevel})에 맞추어 언어 균형을 맞춥니다:
   - 초급(beginner): 모국어 설명 중심 + 핵심 한국어 단어(소리/뜻)
   - 중급(intermediate): 쉬운 한국어 중심 + 모국어 보조 설명
   - 상급(advanced): 한국어 중심 + 어려운 교과 어휘 보충
`;

      const prompt = `
[수업 정보]
- 교과: ${lessonInfo?.subject || '사회'}
- 주제: ${lessonInfo?.topic || '학습 주제'}
- 학습목표: ${lessonInfo?.goal || '학습 목표'}
- 현재 단계: ${stage.title}
- 현재 활동: ${stage.currentActivity}
- 학생 할 일: ${stage.tasks?.join(' / ')}
- 교과서 핵심개념: ${stage.coreConcepts?.join(' / ')}
- 핵심 어휘: ${stage.keyVocabulary?.join(', ')}

[학생 설정]
- 학생 모국어 코드: ${studentLanguage}
- 한국어 이해 수준: ${koreanLevel}
- 추가로 더 쉽게 설명 요청 여부: ${simplifyMore ? '예(더욱 짧고 쉬운 어휘로 설명)' : '아니오'}

다음 JSON 형식으로만 응답하세요:
{
  "easyKorean": "초등학생 수준의 쉬운 한국어 설명 (2문장 내외)",
  "nativeExplanation": "학생의 모국어로 작성된 친절한 설명",
  "keyVocabulary": [
    {
      "korean": "핵심 낱말",
      "native": "모국어 번역",
      "pronunciation": "로마자 발음 표기",
      "meaning": "초등학생용 쉬운 뜻"
    }
  ],
  "connectionNote": "친구들과 지금 같은 내용을 배우고 있음을 알려주는 격려 문장",
  "classroomAction": "지금 교실에서 친구들과 함께 할 수 있는 즉각적인 작은 행동"
}
`;

      const parsed = await callGeminiSafe(
        {
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        },
        `explain:${stage.id}:${studentLanguage}:${koreanLevel}:${Boolean(simplifyMore)}`
      );

      if (parsed?.easyKorean && parsed?.nativeExplanation) {
        if (Array.isArray(parsed.keyVocabulary)) {
          parsed.keyVocabulary = parsed.keyVocabulary.map((v: any) => ({
            ...v,
            pronunciation:
              v.pronunciation && !isMostlyKorean(v.pronunciation)
                ? v.pronunciation
                : romanizeKorean(v.korean),
          }));
        }
        res.json(parsed);
        return;
      }
    } catch {
      // Fallback below
    }
  }

  // Robust intelligent multilingual educational generator
  const fallback = await getIntelligentCurrentExplanation(stage, studentLanguage, koreanLevel, simplifyMore);
  if (studentLanguage !== 'ko' && stage?.currentActivity) {
    const translatedActivity = await translateTextFree(stage.currentActivity, studentLanguage);
    if (translatedActivity) {
      fallback.nativeExplanation = translatedActivity;
    }
  }
  res.json(fallback);
});

// 2. Scaffold Thinking (/api/gemini/scaffold-thinking)
// IMPORTANT: Prompt specifically instructs promptToThink to be generated in studentLanguage!
app.post('/api/gemini/scaffold-thinking', async (req: Request, res: Response): Promise<void> => {
  const {
    lessonInfo,
    stage,
    questionIndex = 0,
    studentLanguage = 'en',
    koreanLevel = 'beginner',
  } = req.body;

  const teacherQuestion =
    stage?.teacherQuestions?.[questionIndex] ||
    stage?.teacherQuestions?.[0] ||
    '오늘 배운 내용에서 어떤 점이 인상 깊었나요?';

  if (ai) {
    try {
      const systemInstruction = `
당신은 이주배경 초등학생이 교사의 질문을 올바르게 이해하고 스스로 깊이 생각할 수 있도록 돕는 교육 전문 AI '함께ON'입니다.
[엄격한 교육 안전 규칙 - CRITICAL]:
1. **절대로 질문의 정답이나 결론을 먼저 제시하거나 유출하지 마세요!**
2. 질문이 무엇과 무엇을 비교하는지, 또는 무엇을 관찰해야 하는지 '생각의 틀(디딤돌)'만 단계별로 제시합니다.
3. 단계별 힌트 구성:
   - 1단계: 질문이 무엇을 묻고 있는지 질문의 핵심 구조(비교 대상 등) 설명
   - 2단계: 과거 또는 기준이 되는 모습을 먼저 관찰하도록 유도
   - 3단계: 현재 또는 변화된 점을 찾도록 유도
   - 4단계: 학생 스스로 생각과 느낌(좋은 점, 차이점)을 정할 수 있도록 되묻는 질문
4. [CRITICAL LANGUAGE REQUIREMENT]:
   - guideNative 와 promptToThink 는 반드시 학생의 모국어(${studentLanguage})로 작성해야 합니다!
   - 학생이 외국인이므로 생각 힌트 질문(promptToThink)이 한국어로 나가면 이해할 수 없습니다.
`;

      const prompt = `
[수업 정보]
- 학습 주제: ${lessonInfo?.topic || '수업 주제'}
- 현재 단계: ${stage?.title || '활동'}
- 교사의 원래 발문: "${teacherQuestion}"
- 수업 자료 속 질문 이해 안내: ${stage?.questionGuidance?.join(' / ') || '없음'}
- 수업 자료 속 생각 돕기 힌트: ${stage?.thinkingPrompts?.join(' / ') || '없음'}

[학생 설정]
- 학생 모국어 코드: ${studentLanguage}
- 한국어 수준: ${koreanLevel}

다음 JSON 형식으로만 응답하세요:
{
  "questionEasyKorean": "교사의 질문을 초등학생 눈높이로 다시 푼 쉬운 한국어 질문",
  "questionInNative": "학생 모국어로 번역한 질문의 의미",
  "comparisonTarget": "질문에서 살펴봐야 할 대상",
  "scaffoldingSteps": [
    {
      "stepNumber": 1,
      "guideKo": "1단계 안내 (한국어)",
      "guideNative": "1단계 모국어 안내 (${studentLanguage})",
      "promptToThink": "스스로 관찰해 볼 첫 번째 포인트 (반드시 학생 모국어 ${studentLanguage}로 작성!)"
    },
    {
      "stepNumber": 2,
      "guideKo": "2단계 안내 (한국어)",
      "guideNative": "2단계 모국어 안내 (${studentLanguage})",
      "promptToThink": "구체적으로 찾아볼 점 (반드시 학생 모국어 ${studentLanguage}로 작성!)"
    },
    {
      "stepNumber": 3,
      "guideKo": "3단계 안내 (한국어)",
      "guideNative": "3단계 모국어 안내 (${studentLanguage})",
      "promptToThink": "변화된 점을 찾아보는 질문 (반드시 학생 모국어 ${studentLanguage}로 작성!)"
    },
    {
      "stepNumber": 4,
      "guideKo": "4단계 안내 (한국어)",
      "guideNative": "4단계 모국어 안내 (${studentLanguage})",
      "promptToThink": "내 생각을 짝꿍에게 말할 준비 질문 (반드시 학생 모국어 ${studentLanguage}로 작성!)"
    }
  ],
  "reminderNotice": "정답은 정해져 있지 않아요! 여러분의 솔직한 생각이 가장 멋진 답이에요."
}
`;

      const parsed = await callGeminiSafe(
        {
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        },
        `scaffold:${stage.id}:${studentLanguage}:${koreanLevel}:${teacherQuestion}`
      );

      if (parsed?.scaffoldingSteps && parsed?.scaffoldingSteps.length > 0) {
        res.json(parsed);
        return;
      }
    } catch {
      // Fallback below
    }
  }

  res.json(await getIntelligentThinkingScaffold(teacherQuestion, stage, studentLanguage, koreanLevel));
});

// 3. Speech Bridge (/api/gemini/speech-bridge)
app.post('/api/gemini/speech-bridge', async (req: Request, res: Response): Promise<void> => {
  const {
    lessonInfo,
    stage,
    studentInput,
    studentLanguage = 'en',
    koreanLevel = 'beginner',
  } = req.body;

  if (!studentInput || !studentInput.trim()) {
    res.status(400).json({ error: 'Student input is required' });
    return;
  }

  if (ai) {
    try {
      const systemInstruction = `
당신은 이주배경 초등학생이 자신의 생각(모국어나 서툰 한국어로 작성)을 교실에서 친구나 선생님에게 직접 말할 수 있도록 돕는 '한국어 말하기 발판 AI'입니다.
[절대적 교육 규칙 - CRITICAL]:
1. **학생이 입력하지 않은 의견, 주장, 사례, 이유를 절대로 임의로 추가하거나 지어내지 마세요!**
2. 학생이 입력한 본래 의미를 정확하게 유지합니다.
3. 초등학생 실제 화자가 사용하는 생생하고 자연스러운 표현:
   - koreanSentenceEasy: 짝꿍이나 모둠 친구에게 말할 때 쓰는 친근한 표현 (반말 또는 부드러운 존댓말)
   - koreanSentencePolite: 선생님께 발표하거나 질문할 때 쓰는 정중하고 바른 표현
4. 발음 안내(pronunciationGuide): 표준 발음법에 따른 정확하고 쉬운 로마자 발음 표기
5. pronunciationTip: 학생의 모국어(${studentLanguage})로 이해하기 쉽게 작성한 한국어 발음 요령
6. speakingTip: 학생의 모국어(${studentLanguage})로 용기를 주는 교실 대화 팁
`;

      const prompt = `
[수업 맥락]
- 주제: ${lessonInfo?.topic || '수업 주제'}
- 현재 활동: ${stage?.currentActivity || '활동'}
- 권장 표현틀: ${stage?.sentenceFrames?.join(' / ') || '저는 ______라고 생각해요.'}
- 핵심 어휘: ${stage?.keyVocabulary?.join(', ') || ''}

[학생 정보]
- 학생 모국어 코드: ${studentLanguage}
- 한국어 수준: ${koreanLevel}
- 학생의 실제 입력: "${studentInput}"

다음 JSON 형식으로만 응답하세요:
{
  "studentThoughtConfirmed": "학생이 표현하고자 한 원래 생각의 핵심 확인 (학생 모국어)",
  "koreanSentenceEasy": "친구에게 말할 수 있는 자연스러운 한국어 문장",
  "koreanSentencePolite": "선생님이나 발표 때 쓸 수 있는 바른 존댓말 한국어 문장",
  "pronunciationGuide": "외국인 초등학생이 쉽게 읽을 수 있는 로마자 발음 표기",
  "pronunciationTip": "학생 모국어(${studentLanguage})로 작성된 한국어 발음 꿀팁",
  "keyWordsUsed": [
    {
      "korean": "문장에 쓰인 핵심 낱말",
      "native": "모국어 뜻",
      "pronunciation": "로마자 발음"
    }
  ],
  "speakingTip": "짝꿍에게 자신 있게 말해보도록 이끄는 친절한 조언 (${studentLanguage})"
}
`;

      const parsed = await callGeminiSafe(
        {
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        },
        `speech:${stage.id}:${studentLanguage}:${koreanLevel}:${studentInput.trim()}`
      );

      if (parsed?.koreanSentenceEasy) {
        if (!parsed.pronunciationGuide || isMostlyKorean(parsed.pronunciationGuide)) {
          parsed.pronunciationGuide = romanizeKorean(parsed.koreanSentenceEasy);
        }
        res.json(parsed);
        return;
      }
    } catch {
      // Fallback below
    }
  }

  const bridgeFallback = await getIntelligentSpeechBridge(studentInput, stage, studentLanguage, koreanLevel);
  const koTranslated = await translateTextFree(studentInput, 'ko');
  if (koTranslated) {
    bridgeFallback.koreanSentenceEasy = koTranslated;
    bridgeFallback.pronunciationGuide = romanizeKorean(koTranslated);
    bridgeFallback.koreanSentencePolite = koTranslated.endsWith('요.') || koTranslated.endsWith('다.') ? koTranslated : `${koTranslated}입니다.`;
  }
  res.json(bridgeFallback);
});

// 4. Teacher Multilingual Preview (/api/gemini/teacher-preview)
app.post('/api/gemini/teacher-preview', async (req: Request, res: Response): Promise<void> => {
  const {
    lessonInfo,
    stage,
    studentLanguage = 'uz-Latn',
    koreanLevel = 'beginner',
    reviewLanguage = 'ko',
  } = req.body;

  const revLang = reviewLanguage === 'en' ? 'en' : 'ko';

  if (ai) {
    try {
      const systemInstruction = `
당신은 초등학교 교사가 다문화/이주배경 학생 화면에 제공되는 맞춤형 AI 지원 내용을 사전 검토할 수 있도록 돕는 장학 및 수업 설계 지원 AI입니다.
교사가 다음 세 가지 관점을 명확히 비교할 수 있도록 구조화된 검토 자료를 작성하세요:
1. 원본 한국어 수업 내용
2. 학생에게 실제 제공되는 모국어(${studentLanguage}) 설명
3. 교사가 검토할 수 있는 검토 언어(${revLang === 'en' ? 'English' : '한국어'}) 설명 (역번역 및 교육적 발판 원리 설명)
주의: 기계 자동 번역에 대한 교육적 유의사항을 명시하세요.
`;

      const prompt = `
[수업 단계 정보]
- 교과: ${lessonInfo?.subject || '사회'}
- 단계명: ${stage?.title}
- 활동: ${stage?.currentActivity}
- 학생 할 일: ${stage?.tasks?.join('; ')}
- 교사 발문: ${stage?.teacherQuestions?.join('; ')}
- 핵심 어휘: ${stage?.keyVocabulary?.join(', ')}

[검토 조건]
- 대상 학생 모국어: ${studentLanguage}
- 대상 학생 한국어 수준: ${koreanLevel}
- 교사 검토 언어: ${revLang}

다음 JSON 형식으로만 응답하세요:
{
  "originalKorean": "수업 자료의 핵심 원문 요약 (한국어)",
  "studentNativeText": "학생의 모국어로 제공되는 실제 UI 및 발판 설명 내용",
  "teacherReviewText": "교사를 위한 ${revLang === 'en' ? 'English' : '한국어'} 검토 설명",
  "reviewLanguage": "${revLang}",
  "pedagogicalSafetyNote": "자동 생성 번역 결과이므로 실제 다문화 학생과의 상호작용 시 교사의 추가 확인이 권장된다는 교육적 안내"
}
`;

      const parsed = await callGeminiSafe(
        {
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        },
        `preview:${stage.id}:${studentLanguage}:${koreanLevel}:${revLang}`
      );

      if (parsed?.studentNativeText) {
        res.json(parsed);
        return;
      }
    } catch {
      // Fallback below
    }
  }

  res.json(getIntelligentTeacherPreview(stage, studentLanguage, koreanLevel, revLang));
});

// ==========================================
// Intelligent Multilingual Educational Fallback Engines
// ==========================================

async function getIntelligentCurrentExplanation(stage: any, lang: string, level: string, simpler: boolean) {
  const stageTitle = stage?.title || '수업 단계';
  const activity = stage?.currentActivity || '친구들과 함께 교과서를 살펴보고 있습니다.';

  const nativeExplanations: Record<string, string> = {
    en: simpler
      ? `We are doing '${stageTitle}'. Look at the pictures with your friends and listen to the teacher.`
      : `Right now, our class is at '${stageTitle}'. Activity: ${activity} We are participating in the same activity as our classmates.`,
    vi: simpler
      ? `Lớp mình đang ở '${stageTitle}'. Cùng nhìn sách giáo khoa với các bạn và lắng nghe thầy cô nhé.`
      : `Hiện tại lớp chúng ta đang ở '${stageTitle}'. Hoạt động: ${activity} Em đang tham gia cùng một hoạt động với các bạn trong lớp.`,
    ru: simpler
      ? `Сейчас у нас '${stageTitle}'. Посмотри в учебник вместе с соседом по парте и слушай учителя.`
      : `Сейчас наш класс находится на этапе '${stageTitle}'. Задание: ${activity} Мы делаем это задание вместе со всеми ребятами.`,
    'uz-Latn': simpler
      ? `Hozir darsimizda '${stageTitle}' bosqichi. Do‘stlaringiz bilan darslikka qarang va o‘qituvchini tinglang.`
      : `Hozir darsimizda '${stageTitle}' bosqichi o‘tilmoqda. Mashg‘ulot: ${activity} Biz barcha sinfdoshlarimiz bilan birgalikda o‘rganmoqdamiz.`,
    'uz-Cyrl': simpler
      ? `Ҳозир дарсимизда '${stageTitle}' босқичи. Дўстларингиз билан дарсликка қаранг ва ўқитувчини тингланг.`
      : `Ҳозир дарсимизда '${stageTitle}' босқичи ўтилмоқда. Машғулот: ${activity} Биз барча синфдошларимиз билан биргаликда ўрганмоқдамиз.`,
    'zh-Hans': simpler
      ? `现在正在进行‘${stageTitle}’。请和同桌一起看课本，认真听老师讲解。`
      : `现在全班正在进行‘${stageTitle}’环节。活动内容：${activity}。你正在和同班同学们一起参加相同的学习活动。`,
    'zh-Hant': simpler
      ? `現在正在進行‘${stageTitle}’。請和同桌一起看課本，認真聽老師講解。`
      : `現在全班正在進行‘${stageTitle}’環節。活動內容：${activity}。你正在和同班同學們一起參加相同的學習活動。`,
    ko: simpler
      ? `지금은 '${stageTitle}' 시간이에요. 짝꿍과 함께 교과서를 보고 선생님 말씀을 들어요.`
      : `지금 우리 반은 '${stageTitle}' 단계를 공부하고 있어요. 활동: ${activity} 친구들과 같은 공부를 하고 있어요.`,
  };

  const vocabDict: Record<string, Record<string, { native: string; pron: string; meaning: string }>> = {
    '정보화 사회': {
      en: { native: 'Information Society', pron: 'jeong-bo-hwa sa-hoe', meaning: 'A society where information is the most important resource.' },
      vi: { native: 'Xã hội thông tin', pron: 'jeong-bo-hwa sa-hoe', meaning: 'Xã hội nơi thông tin là tài nguyên quan trọng nhất.' },
      ru: { native: 'Информационное общество', pron: 'jeong-bo-hwa sa-hoe', meaning: 'Общество, где информация является главным ресурсом.' },
      'uz-Latn': { native: 'Axborot jamiyati', pron: 'jeong-bo-hwa sa-hoe', meaning: 'Axborot eng muhim boylik bo‘lgan jamiyat.' },
      'zh-Hans': { native: '信息化社会', pron: 'jeong-bo-hwa sa-hoe', meaning: '信息成为社会最重要资源的社会。' },
    },
    '지능정보화': {
      en: { native: 'Intelligent Information Tech', pron: 'ji-neung-jeong-bo-hwa', meaning: 'AI and computer technology combined together.' },
      vi: { native: 'Trí tuệ thông tin hóa', pron: 'ji-neung-jeong-bo-hwa', meaning: 'Trí tuệ nhân tạo kết hợp với công nghệ thông tin.' },
      ru: { native: 'Интеллектуальная информатизация', pron: 'ji-neung-jeong-bo-hwa', meaning: 'Сочетание искусственного интеллекта и ИТ.' },
      'uz-Latn': { native: 'Intellektual axborotlashtirish', pron: 'ji-neung-jeong-bo-hwa', meaning: 'Sun’iy intellekt va axborot texnologiyalari birlashuvi.' },
      'zh-Hans': { native: '智能信息化', pron: 'ji-neung-jeong-bo-hwa', meaning: '人工智能与信息通信技术相结合。' },
    },
    '로봇 청소기': {
      en: { native: 'Robot Vacuum', pron: 'ro-bot cheong-so-gi', meaning: 'A machine that cleans the floor by itself.' },
      vi: { native: 'Robot hút bụi', pron: 'ro-bot cheong-so-gi', meaning: 'Máy tự động lau dọn nhà cửa.' },
      ru: { native: 'Робот-пылесос', pron: 'ro-bot cheong-so-gi', meaning: 'Устройство, которое убирает пол самостоятельно.' },
      'uz-Latn': { native: 'Robot changyutgich', pron: 'ro-bot cheong-so-gi', meaning: 'O‘zi mustaqil tozalaydigan mashina.' },
      'zh-Hans': { native: '扫地机器人', pron: 'ro-bot cheong-so-gi', meaning: '能够自主清扫地面的机器。' },
    },
    '옛날': {
      en: { native: 'The Past / Old days', pron: 'yet-nal', meaning: 'Time long ago before modern technology.' },
      vi: { native: 'Ngày xưa', pron: 'yet-nal', meaning: 'Thời xưa khi chưa có máy móc hiện đại.' },
      ru: { native: 'Прошлое / Раньше', pron: 'yet-nal', meaning: 'Прежнее время до появления современных технологий.' },
      'uz-Latn': { native: 'Qadimda / Ilgari', pron: 'yet-nal', meaning: 'Zamonaviy texnika bo‘lmagan o‘tmish davr.' },
      'zh-Hans': { native: '过去 / 从前', pron: 'yet-nal', meaning: '还没有现代科技的过去时光。' },
    },
    '오늘날': {
      en: { native: 'Today / Present day', pron: 'o-neul-nal', meaning: 'The present time we live in today.' },
      vi: { native: 'Ngày nay', pron: 'o-neul-nal', meaning: 'Thời đại hiện nay chúng ta đang sống.' },
      ru: { native: 'Сегодня / Настоящее время', pron: 'o-neul-nal', meaning: 'Время, в котором мы живем сейчас.' },
      'uz-Latn': { native: 'Bugungi kun', pron: 'o-neul-nal', meaning: 'Biz hozir yashayotgan zamon.' },
      'zh-Hans': { native: '当今 / 现今', pron: 'o-neul-nal', meaning: '我们今天生活的现代。' },
    },
    '편리함': {
      en: { native: 'Convenience', pron: 'pyeon-ri-ham', meaning: 'Making life much easier and comfortable.' },
      vi: { native: 'Sự tiện lợi', pron: 'pyeon-ri-ham', meaning: 'Làm cho cuộc sống dễ dàng và thoải mái hơn.' },
      ru: { native: 'Удобство', pron: 'pyeon-ri-ham', meaning: 'То, что делает жизнь легче и комфортнее.' },
      'uz-Latn': { native: 'Qulaylik', pron: 'pyeon-ri-ham', meaning: 'Hayotni oson va qulay qiluvchi holat.' },
      'zh-Hans': { native: '便利 / 方便', pron: 'pyeon-ri-ham', meaning: '让生活变得轻松舒适。' },
    },
  };

  const rawVocabs = stage?.keyVocabulary || ['옛날', '오늘날', '편리함'];
  const keyVocabulary = await Promise.all(
    rawVocabs.slice(0, 4).map(async (w: string) => {
      const dictEntry = vocabDict[w]?.[lang] || vocabDict[w]?.['en'];
      if (dictEntry) {
        return {
          korean: w,
          native: dictEntry.native,
          pronunciation: dictEntry.pron,
          meaning: dictEntry.meaning,
        };
      }
      const translated = lang === 'ko' ? w : await translateTextFree(w, lang);
      return {
        korean: w,
        native: translated || w,
        pronunciation: romanizeKorean(w),
        meaning: '',
      };
    })
  );

  return {
    easyKorean: simpler
      ? `지금은 '${stageTitle}' 단계예요. 친구들과 함께 교과서를 살펴보고 선생님의 설명을 들어요.`
      : `지금 우리 반은 '${stageTitle}' 시간이에요. ${activity} 친구들과 함께 같은 주제를 배우고 있어요.`,
    nativeExplanation: nativeExplanations[lang] || nativeExplanations.en,
    keyVocabulary,
    connectionNote:
      lang === 'en'
        ? 'Your classmates are looking at the exact same textbook page right now!'
        : '지금 교실에서 모든 친구들이 같은 교과서 쪽수를 함께 보고 있어요!',
    classroomAction: '교과서를 펴고 짝꿍과 함께 그림이나 글을 손가락으로 짚어보세요.',
  };
}

// Fixed getIntelligentThinkingScaffold: promptToThink is FULLY translated for all 8 languages!
async function getIntelligentThinkingScaffold(question: string, stage: any, lang: string, level: string) {
  const isComparing = question.includes('비교') || question.includes('옛날') || question.includes('오늘날');

  let translatedQ = question;
  if (lang !== 'ko') {
    translatedQ = (await translateTextFree(question, lang)) || question;
  }

  const nativeQuestionTranslations: Record<string, string> = {
    en: isComparing
      ? 'Comparing homes from the past and today, what are the good points of today’s life?'
      : translatedQ,
    vi: isComparing
      ? 'So với ngôi nhà ngày xưa, ngôi nhà ngày nay có điểm gì tốt hơn?'
      : translatedQ,
    ru: isComparing
      ? 'Если сравнить дома в прошлом и сегодня, в чем преимущества современной жизни?'
      : translatedQ,
    'uz-Latn': isComparing
      ? 'Qadimgi uy hayoti bilan solishtirganda, bugungi zamonaviy uyning qanday afzalliklari bor?'
      : translatedQ,
    'uz-Cyrl': isComparing
      ? 'Қадимги уй ҳаёти билан солиштирганда, бугунги замонавий уйнинг қандай афзалликлари бор?'
      : translatedQ,
    'zh-Hans': isComparing
      ? '与过去的家庭相比，当今的家庭有哪些优点？'
      : translatedQ,
    'zh-Hant': isComparing
      ? '與過去的家庭相比，當今的家庭有哪些優點？'
      : translatedQ,
    ko: question,
  };

  // Full native prompt translations fixing the reported bug!
  const promptTranslations: Record<string, string[]> = {
    en: [
      'First, imagine in your mind the two pictures: homes in the past and homes today.',
      'In the past without vacuum cleaners or computers, how much time and effort did people have to spend by hand?',
      'What changes happened when moving robot cleaners or smart AI started doing tasks in place of people?',
      'Do you like it because it saves time, or because it takes less physical effort? Get ready to share your own idea with your partner!',
    ],
    vi: [
      'Trước tiên, hãy hình dung trong đầu hai hình ảnh: ngôi nhà ngày xưa và ngôi nhà ngày nay.',
      'Ngày xưa khi chưa có máy hút bụi hay máy tính, con người đã tốn bao nhiêu thời gian và công sức để làm việc?',
      'Khi robot dọn dẹp hoặc AI bắt đầu làm việc thay cho con người, điều gì đã thay đổi?',
      'Điều đó tốt vì tiết kiệm thời gian hay vì đỡ tốn sức hơn? Hãy chuẩn bị chia sẻ suy nghĩ của em với bạn cùng bàn nhé!',
    ],
    ru: [
      'Сначала представь себе две картины: дома в прошлом и дома сегодня.',
      'Сколько времени и сил тратили люди вручную, когда раньше не было пылесосов или компьютеров?',
      'Какие изменения произошли, когда роботы-пылесосы или умный ИИ стали выполнять работу вместо людей?',
      'Это хорошо потому, что экономит время, или потому, что требует меньше усилий? Подготовься рассказать соседу по парте!',
    ],
    'uz-Latn': [
      'Avval xayolingizda ikki holatni tasavvur qiling: o‘tmishdagi uylar va bugungi uylar.',
      'Ilgari changyutgich yoki kompyuter bo‘lmaganda, odamlar qo‘lda qancha vaqt va kuch sarflab ishlagan?',
      'Robot changyutgich yoki aqlli AI insonlar o‘rniga ish bajara boshlagach, qanday o‘zgarishlar yuz berdi?',
      'Bu vaqtni tejagani uchun yaxshimi yoki kamroq kuch sarflangani uchunmi? Partadoshingizga aytishga tayyorlaning!',
    ],
    'uz-Cyrl': [
      'Аввал хаёлингизда икки ҳолатни тасаввур қилинг: ўтмишдаги уйлар ва бугунги уйлар.',
      'Илгари чангютгич ёки компьютер бўлмаганда, одамлар қўлда қанча вақт ва куч сарфлаб ишлаган?',
      'Робот чангютгич ёки ақлли AI инсонлар ўрнига иш бажара бошлагач, қандай ўзгаришлар юз берди?',
      'Бу вақтни тежагани учун яхшими ёки камроқ куч сарфлангани учунми? Партадошингизга айтишга тайёрланинг!',
    ],
    'zh-Hans': [
      '首先在脑海中浮现出两种画面：过去的家和今天的家。',
      '在过去没有吸尘器或电脑的时代，人们亲自动手要做多少家务、耗费多少时间和力气？',
      '当扫地机器人或AI开始代替人们完成工作时，生活发生了怎样的改变？',
      '是因为节省了时间好呢，还是因为省力更轻松？准备好告诉同桌你的想法吧！',
    ],
    'zh-Hant': [
      '首先在腦海中浮現出兩種畫面：過去的家和今天的家。',
      '在過去沒有吸塵器或電腦的時代，人們親自動手要做多少家務、耗費多少時間和力氣？',
      '當掃地機器人或AI開始代替人們完成工作時，生活發生了怎樣的改變？',
      '是因為節省了時間好呢，還是因為省力更輕鬆？準備好告訴同桌你的想法吧！',
    ],
    ko: [
      "'옛날의 모습'과 '오늘날의 모습' 두 가지를 먼저 머릿속에 떠올려 보세요.",
      '옛날에는 청소기나 컴퓨터가 없었을 때 사람이 직접 얼마나 많은 시간과 힘을 들였을까요?',
      '로봇 청소기나 인공지능이 사람 대신 일해주면 어떤 변화가 생겼나요?',
      '시간을 아낄 수 있어서 좋은가요, 아니면 힘이 덜 들어서 좋은가요? 짝꿍에게 말할 준비를 해보세요.',
    ],
  };

  const guidesKo = [
    '질문이 무엇을 묻고 있는지 비교 대상을 확인해요.',
    '먼저 기준이 되는 옛날의 모습을 살펴보아요.',
    '오늘날 새롭게 생긴 기술과 달라진 점을 찾아요.',
    '내가 생각하는 가장 좋은 점을 나만의 생각으로 골라요.',
  ];

  const guidesNative: Record<string, string[]> = {
    en: [
      'Check what two things this question asks you to compare.',
      'First, look at how people did things in the past without machines.',
      'Next, notice what has changed today with smart robots and AI.',
      'Form your own personal thought: Which good point matters most to you?',
    ],
    vi: [
      'Xác định câu hỏi yêu cầu so sánh hai đối tượng nào.',
      'Trước tiên, hãy nhìn vào cách con người làm việc trong quá khứ khi chưa có máy móc.',
      'Tiếp theo, tìm những điểm đã thay đổi ngày nay với robot thông minh và AI.',
      'Hình thành suy nghĩ của riêng em: Điểm tốt nào em thấy quan trọng nhất?',
    ],
    ru: [
      'Определи, какие две вещи предлагает сравнить этот вопрос.',
      'Сначала посмотри, как люди делали дела в прошлом без машин.',
      'Затем заметь, что изменилось сегодня благодаря умным роботам и ИИ.',
      'Сформулируй свою собственную мысль: Какое преимущество важнее всего для тебя?',
    ],
    'uz-Latn': [
      'Savol qaysi ikki narsani solishtirishni so‘rayotganini aniqlang.',
      'Avval o‘tmishda odamlar texnikasiz qanday ishlaganini eslang.',
      'Keyin, aqlli robotlar va texnologiyalar tufayli nimalar o‘zgarganini toping.',
      'O‘z shaxsiy fikringizni tanlang: Siz uchun eng muhim yaxshi tomon qaysi?',
    ],
    'uz-Cyrl': [
      'Савол қайси икки нарсани солиштиришни сўраётганини аниқланг.',
      'Аввал ўтмишда одамлар техникасиз қандай ишлаганини эсланг.',
      'Кейин, ақлли роботлар ва технологиялар туфайли нималар ўзгарганини топинг.',
      'Ўз шахсий фикрингизни танланг: Сиз учун энг муҳим яхши томон қайси?',
    ],
    'zh-Hans': [
      '明确提问要求我们对比的两个对象是什么。',
      '首先回顾过去在没有机器帮助时，人们是怎样生活的。',
      '接着观察今天有了智能机器人和AI之后，发生了哪些变化。',
      '形成属于你自己的想法：你认为哪一个优点最棒？',
    ],
    'zh-Hant': [
      '明確提問要求我們對比的兩個對象是什麼。',
      '首先回顧過去在沒有機器幫助時，人們是怎樣生活的。',
      '接著觀察今天有了智慧型機器人和AI之後，發生了哪些變化。',
      '形成屬於你自己的想法：你認為哪一個優點最棒？',
    ],
    ko: guidesKo,
  };

  const nativePrompts = promptTranslations[lang] || promptTranslations.en;
  const nativeGuides = guidesNative[lang] || guidesNative.en;

  const steps = [0, 1, 2, 3].map((i) => ({
    stepNumber: i + 1,
    guideKo: guidesKo[i],
    guideNative: nativeGuides[i],
    promptToThink: nativePrompts[i],
  }));

  return {
    questionEasyKorean: `선생님께서 물어보셨어요: "${question}" (옛날과 지금의 다른 점을 생각해보라는 뜻이에요)`,
    questionInNative: nativeQuestionTranslations[lang] || nativeQuestionTranslations.en,
    comparisonTarget: '옛날의 생활 모습과 오늘날 지능정보 기술로 편리해진 생활 모습',
    scaffoldingSteps: steps,
    reminderNotice:
      lang === 'en'
        ? 'AI will never tell you the final answer! Your own honest thought is the best answer in class.'
        : 'AI는 정답을 미리 알려주지 않아요! 여러분의 솔직한 생각이 교실에서 가장 멋진 답이에요.',
  };
}

const INITIAL_CONSONANTS = [
  'g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's',
  'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h',
];

const MEDIAL_VOWELS = [
  'a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa',
  'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i',
];

const FINAL_CONSONANTS = [
  '', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'p', 't', 't', 'p', 't',
  'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't',
];

function romanizeKorean(text: string): string {
  if (!text) return '';
  let result = '';
  let prevWasHangul = false;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const offset = code - 0xac00;
      const initialIdx = Math.floor(offset / 588);
      const medialIdx = Math.floor((offset % 588) / 28);
      const finalIdx = offset % 28;

      const init = INITIAL_CONSONANTS[initialIdx];
      const med = MEDIAL_VOWELS[medialIdx];
      const fin = FINAL_CONSONANTS[finalIdx];
      const syllable = init + med + fin;

      if (prevWasHangul) {
        result += '-' + syllable;
      } else {
        result += syllable;
      }
      prevWasHangul = true;
    } else {
      result += text[i];
      prevWasHangul = false;
    }
  }

  const trimmed = result.trim();
  if (trimmed.length > 0 && /[a-z]/i.test(trimmed[0])) {
    return trimmed[0].toUpperCase() + trimmed.slice(1);
  }
  return trimmed;
}

function isMostlyKorean(text: string): boolean {
  if (!text) return false;
  let hangulCount = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) {
      hangulCount++;
    }
  }
  return hangulCount > text.length * 0.3;
}

async function getIntelligentSpeechBridge(input: string, stage: any, lang: string, level: string) {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  let easySentence = '로봇 청소기 덕분에 청소하기가 훨씬 편해.';
  let politeSentence = '로봇 청소기가 스스로 일해 주어서 청소하기가 훨씬 편리해졌습니다.';
  let pron = 'Ro-bot cheong-so-gi deok-bun-e cheong-so-ha-gi-ga hweol-ssin pyeon-hae.';
  let pronTip = 'Pronounce "deok-bun-e" smoothly: [deok-bu-ne]. In Korean, it means "thanks to".';

  if (lower.includes('time') || lower.includes('시간') || lower.includes('vaqt') || lower.includes('thời gian')) {
    easySentence = '기계가 일을 대신해 줘서 남는 시간에 책을 읽을 수 있어서 좋아.';
    politeSentence = '기계가 일을 대신해 주어 절약된 시간에 가족과 함께 여유를 보낼 수 있어 좋습니다.';
    pron = 'Gi-gye-ga il-eul dae-sin-hae jwo-seo nam-neun si-gan-e chaek-eul ilg-eul su iss-eo-seo joh-a.';
    pronTip = 'In "chaek-eul", connect the sounds softly: [chae-geul].';
  } else if (lower.includes('clean') || lower.includes('청소') || lower.includes('tozalash') || lower.includes('dọn')) {
    easySentence = '사람이 힘들게 청소하지 않아도 되어서 참 편해.';
    politeSentence = '사람이 직접 힘들여 청소하지 않아도 스스로 깨끗해져서 편리합니다.';
    pron = 'Sa-ram-i him-deul-ge cheong-so-ha-ji anh-a-do dwae-seo cham pyeon-hae.';
    pronTip = '"him-deul-ge" means "with difficulty" or "tiring".';
  } else if (lower.includes('safe') || lower.includes('안전') || lower.includes('xavfsiz') || lower.includes('an toàn')) {
    easySentence = '위험한 일을 기계가 대신해 주어서 더 안전해.';
    politeSentence = '위험하거나 힘든 작업을 기술이 대신 수행하여 더욱 안전해졌습니다.';
    pron = 'Wi-heom-han il-eul gi-gye-ga dae-sin-hae jwo-seo deo an-jeon-hae.';
    pronTip = '"an-jeon-hae" ends with a comfortable vowel sound, meaning "it is safe".';
  } else {
    const koTranslated = lang === 'ko' ? trimmed : (await translateTextFree(trimmed, 'ko')) || trimmed;
    easySentence = koTranslated;
    politeSentence = '';
    pron = koTranslated;
    pronTip = '"saeng-gak-hae" means "I think" when talking to classmates.';
  }

  return {
    studentThoughtConfirmed:
      lang === 'en'
        ? `Your thought: "${trimmed}"`
        : `[${lang}] "${trimmed}"`,
    koreanSentenceEasy: easySentence,
    koreanSentencePolite: politeSentence,
    pronunciationGuide: pron,
    pronunciationTip: pronTip,
    keyWordsUsed: [
      {
        korean: '편리함',
        native: lang === 'en' ? 'Convenience' : lang === 'uz-Latn' ? 'Qulaylik' : '편리함',
        pronunciation: 'pyeon-ri-ham',
      },
      {
        korean: '생활 모습',
        native: lang === 'en' ? 'Daily life' : lang === 'uz-Latn' ? 'Turmush tarzi' : '생활 모습',
        pronunciation: 'saeng-hwal mo-seup',
      },
      {
        korean: '시간 절약',
        native: lang === 'en' ? 'Saving time' : lang === 'uz-Latn' ? 'Vaqtni tejash' : '시간 절약',
        pronunciation: 'si-gan jeol-yak',
      },
    ],
    speakingTip:
      lang === 'en'
        ? "Turn to your partner with a smile and practice saying: '" + easySentence + "'"
        : "옆에 있는 짝꿍을 바라보며 자신 있게 말해 보세요: '" + easySentence + "'",
  };
}

function getIntelligentTeacherPreview(stage: any, lang: string, level: string, revLang: 'ko' | 'en') {
  const isEn = revLang === 'en';
  const stageTitle = stage?.title || '수업 단계';
  const question = stage?.teacherQuestions?.[0] || '교사 발문';

  const sampleNativeByLang: Record<string, string> = {
    'uz-Latn': `[O‘zbekcha - ${level}] Hozir '${stageTitle}' bosqichi. Savol: "${question}". O‘qituvchining savolini o‘zbek tilida tushunib, 4 bosqichli maslahat orqali mustaqil fikrlaydi.`,
    en: `[English - ${level}] Currently at '${stageTitle}'. Question: "${question}". Students receive scaffolded hints breaking down comparison without spoiling the answer.`,
    vi: `[Tiếng Việt - ${level}] Hiện tại đang ở '${stageTitle}'. Câu hỏi: "${question}". Cung cấp gợi ý từng bước để học sinh tự suy nghĩ mà không làm lộ đáp án.`,
    ru: `[Русский - ${level}] Сейчас этап '${stageTitle}'. Вопрос: "${question}". Пошаговые подсказки без раскрытия готовых ответов.`,
    'zh-Hans': `[简体中文 - ${level}] 当前阶段‘${stageTitle}’。提问：“${question}”。通过阶梯式提示引导学生自主思考，不直接提供答案。`,
    ko: `[한국어 - ${level}] 현재 '${stageTitle}' 단계. 발문: "${question}". 단계별 발판을 통해 스스로 생각하도록 지원합니다.`,
  };

  return {
    originalKorean: `[${stageTitle}] 활동: ${stage?.currentActivity || '활동 내용'} / 교사 발문: "${question}" / 어휘: ${(stage?.keyVocabulary || []).join(', ')}`,
    studentNativeText: sampleNativeByLang[lang] || sampleNativeByLang.en,
    teacherReviewText: isEn
      ? `Pedagogical Scaffold Analysis: In this stage, the student (${lang}, level: ${level}) is guided to analyze the comparison between past and present through 4 non-spoil hint steps. Vocabulary is presented with audio pronunciation. Student’s thoughts are directly bridged into elementary conversational Korean for peer sharing.`
      : `교육적 비계 설정 분석: 대상 학생(언어: ${lang}, 수준: ${level})에게 질문의 정답을 노출하지 않고 '비교 대상 파악 -> 과거 모습 관찰 -> 현재 변화 포착 -> 나만의 생각 도출' 4단계 발판을 제공합니다. 또한 짝꿍과 협력 대화할 수 있도록 친구용 쉬운 표현과 발표용 표현을 함께 제공합니다.`,
    reviewLanguage: revLang,
    pedagogicalSafetyNote: isEn
      ? 'Note: Multilingual translations are machine-assisted bridges. Teacher direct feedback and emotional encouragement during real classroom interaction remain primary.'
      : '안내: 본 미리보기는 자동 번역 및 AI 비계 설정 결과이므로, 교실 수업에서는 교사의 직접적인 관찰과 피드백을 우선해 주시기 바랍니다.',
  };
}

export { app };
export default app;
