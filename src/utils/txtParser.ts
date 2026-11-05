import { LessonData, LessonInfo, LessonStage } from '../types/lesson';

export interface ParseResult {
  success: boolean;
  data?: LessonData;
  errors?: string[];
  warnings?: string[];
}

export function parseLessonTxt(rawText: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!rawText || !rawText.trim()) {
    return {
      success: false,
      errors: ['업로드된 파일이 비어 있습니다. 유효한 수업 자료 TXT 파일을 선택해 주세요.'],
    };
  }

  // Normalize line breaks
  const lines = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  interface RawSection {
    header: string;
    stageId?: string;
    entries: Array<{ key: string; value: string; lineNo: number }>;
  }

  const sections: RawSection[] = [];
  let currentSection: RawSection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    const lineNo = i + 1;

    // Skip empty lines or comment lines
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
      continue;
    }

    // Check for section header [ ... ]
    const sectionMatch = trimmed.match(/^\[(.*?)\]$/);
    if (sectionMatch) {
      const headerName = sectionMatch[1].trim();
      let stageId: string | undefined;

      const stageMatch = headerName.match(/^(?:단계|STAGE)\s*:\s*(.+)$/i);
      if (stageMatch) {
        stageId = stageMatch[1].trim();
      }

      currentSection = {
        header: headerName,
        stageId,
        entries: [],
      };
      sections.push(currentSection);
      continue;
    }

    // Parse key: value
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) {
      // Line without colon inside a section
      if (currentSection) {
        warnings.push(`[${lineNo}번째 줄] '항목: 내용' 형식이 아닌 줄이 있습니다: "${trimmed}"`);
      }
      continue;
    }

    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();

    if (currentSection) {
      currentSection.entries.push({ key, value, lineNo });
    } else {
      warnings.push(`[${lineNo}번째 줄] 섹션 시작 표시([섹션명]) 이전에 항목이 나타났습니다: "${key}"`);
    }
  }

  if (sections.length === 0) {
    return {
      success: false,
      errors: [
        '파일에서 섹션([수업_기본정보], [단계: ...])을 찾을 수 없습니다.',
        '예시 형식: [수업_기본정보], [단계: INTRO], [단계: ACT1] 등을 포함해야 합니다.',
      ],
    };
  }

  // 1. Find info section
  const infoSection = sections.find(
    (s) => s.header === '수업_기본정보' || s.header.includes('기본정보') || s.header.toLowerCase().includes('info')
  );

  const lessonInfo: LessonInfo = {
    subject: '교과 미지정',
    unit: '단원 미지정',
    period: '차시 미지정',
    topic: '학습주제 미지정',
    goal: '학습목표 미지정',
    achievementStandard: '',
    textbookPages: '',
    defaultStudentLang: 'en',
    customFields: {},
  };

  if (infoSection) {
    for (const { key, value } of infoSection.entries) {
      const normKey = key.replace(/\s+/g, '');
      if (normKey === '교과' || normKey === '과목') {
        lessonInfo.subject = value;
      } else if (normKey === '단원' || normKey === '대단원' || normKey === '중단원') {
        lessonInfo.unit = value;
      } else if (normKey === '차시') {
        lessonInfo.period = value;
      } else if (normKey === '학습주제' || normKey === '주제' || normKey === '공부할문제') {
        lessonInfo.topic = value;
      } else if (normKey === '학습목표' || normKey === '수업목표') {
        lessonInfo.goal = value;
      } else if (normKey === '성취기준') {
        lessonInfo.achievementStandard = value;
      } else if (normKey === '교과서_쪽수' || normKey === '교과서쪽수' || normKey === '쪽수') {
        lessonInfo.textbookPages = value;
      } else if (normKey === '기본_학생_언어' || normKey === '기본학생언어' || normKey === '언어') {
        lessonInfo.defaultStudentLang = value;
      } else {
        lessonInfo.customFields[key] = value;
      }
    }
  } else {
    warnings.push('[수업_기본정보] 섹션이 명시적으로 발견되지 않아 기본 템플릿 정보가 설정됩니다.');
  }

  // 2. Common principles
  const principlesSection = sections.find(
    (s) => s.header === '앱_공통원칙' || s.header.includes('원칙') || s.header.toLowerCase().includes('principle')
  );
  const commonPrinciples: string[] = [];
  if (principlesSection) {
    for (const { value } of principlesSection.entries) {
      if (value) commonPrinciples.push(value);
    }
  }

  // 3. Stage sections
  const stageSections = sections.filter((s) => s.stageId !== undefined);

  if (stageSections.length === 0) {
    errors.push('수업 단계([단계: INTRO], [단계: ACT1] 등)가 하나도 발견되지 않았습니다.');
    return {
      success: false,
      errors,
      warnings,
    };
  }

  const stages: LessonStage[] = [];

  for (let sIdx = 0; sIdx < stageSections.length; sIdx++) {
    const s = stageSections[sIdx];
    const stageId = s.stageId || `STAGE_${sIdx + 1}`;

    let stageTitle = `단계 ${sIdx + 1}`;
    let stageDesc = '';
    let currentActivity = '';
    const tasksMap = new Map<number, string>();
    const teacherQuestionsMap = new Map<number, string>();
    const questionGuidanceMap = new Map<number, string>();
    const thinkingPromptsMap = new Map<number, string>();
    const coreConceptsMap = new Map<number, string>();
    let keyVocabulary: string[] = [];
    let sentenceFrames: string[] = [];
    const extraFields: Record<string, string | string[]> = {};

    for (const { key, value } of s.entries) {
      const normKey = key.replace(/\s+/g, '');

      if (normKey === '단계_ID' || normKey === '단계ID') {
        // preserve stage id if specified
        continue;
      } else if (normKey === '단계명_원문' || normKey === '단계명' || normKey === '제목') {
        stageTitle = value;
      } else if (normKey === '단계_설명' || normKey === '단계설명' || normKey === '설명') {
        stageDesc = value;
      } else if (normKey === '학생지원_현재활동' || normKey === '현재활동' || normKey === '활동') {
        currentActivity = value;
      } else if (normKey.startsWith('학생지원_지금할일') || normKey.startsWith('지금할일')) {
        const numMatch = normKey.match(/(\d+)$/);
        const idx = numMatch ? parseInt(numMatch[1], 10) : tasksMap.size + 1;
        tasksMap.set(idx, value);
      } else if (normKey.startsWith('교사_원문발문') || normKey.startsWith('교사발문') || normKey.startsWith('발문')) {
        const numMatch = normKey.match(/(\d+)$/);
        const idx = numMatch ? parseInt(numMatch[1], 10) : teacherQuestionsMap.size + 1;
        teacherQuestionsMap.set(idx, value);
      } else if (normKey.startsWith('학생지원_질문이해') || normKey.startsWith('질문이해')) {
        const numMatch = normKey.match(/(\d+)$/);
        const idx = numMatch ? parseInt(numMatch[1], 10) : questionGuidanceMap.size + 1;
        questionGuidanceMap.set(idx, value);
      } else if (normKey.startsWith('학생지원_생각돕기') || normKey.startsWith('생각돕기') || normKey.startsWith('생각힌트')) {
        const numMatch = normKey.match(/(\d+)$/);
        const idx = numMatch ? parseInt(numMatch[1], 10) : thinkingPromptsMap.size + 1;
        thinkingPromptsMap.set(idx, value);
      } else if (normKey.startsWith('교과서_핵심개념') || normKey.startsWith('핵심개념')) {
        const numMatch = normKey.match(/(\d+)$/);
        const idx = numMatch ? parseInt(numMatch[1], 10) : coreConceptsMap.size + 1;
        coreConceptsMap.set(idx, value);
      } else if (normKey === '학생지원_핵심어휘' || normKey === '핵심어휘' || normKey === '어휘') {
        keyVocabulary = value
          .split(/[,/·;]+/)
          .map((v) => v.trim())
          .filter(Boolean);
      } else if (normKey === '학생지원_표현틀' || normKey === '표현틀' || normKey === '문장틀') {
        sentenceFrames = value
          .split(/[\n;]+/)
          .map((v) => v.trim())
          .filter(Boolean);
      } else {
        // Collect extra fields
        if (extraFields[key]) {
          if (Array.isArray(extraFields[key])) {
            (extraFields[key] as string[]).push(value);
          } else {
            extraFields[key] = [extraFields[key] as string, value];
          }
        } else {
          extraFields[key] = value;
        }
      }
    }

    const sortMapValues = (m: Map<number, string>) =>
      Array.from(m.entries())
        .sort(([a], [b]) => a - b)
        .map(([, val]) => val);

    const tasks = sortMapValues(tasksMap);
    const teacherQuestions = sortMapValues(teacherQuestionsMap);
    const questionGuidance = sortMapValues(questionGuidanceMap);
    const thinkingPrompts = sortMapValues(thinkingPromptsMap);
    const coreConcepts = sortMapValues(coreConceptsMap);

    stages.push({
      id: stageId,
      title: stageTitle,
      description: stageDesc,
      currentActivity: currentActivity || stageTitle,
      tasks: tasks.length > 0 ? tasks : ['선생님의 설명을 듣고 교과서를 살펴봅니다.'],
      teacherQuestions,
      questionGuidance,
      thinkingPrompts,
      keyVocabulary,
      sentenceFrames: sentenceFrames.length > 0 ? sentenceFrames : ['저는 ______라고 생각해요.'],
      coreConcepts,
      extraFields,
    });
  }

  const lessonData: LessonData = {
    id: `lesson-${Date.now()}`,
    title: `${lessonInfo.subject}: ${lessonInfo.topic}`,
    info: lessonInfo,
    commonPrinciples,
    stages,
    rawText,
  };

  return {
    success: true,
    data: lessonData,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
