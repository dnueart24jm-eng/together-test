import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Eye,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import {
  LessonData,
  LessonStage,
  LanguageCode,
  KoreanLevel,
  AITeacherPreviewResponse,
} from '../../types/lesson';
import { parseLessonTxt } from '../../utils/txtParser';
import { SUPPORTED_LANGUAGES, KOREAN_LEVELS } from '../../utils/i18n';
import { DEFAULT_LESSON_RAW_TEXT, DEFAULT_LESSON_PARSED } from '../../data/defaultLesson';
import { fetchTeacherPreview, updateClassroomStage, updateClassroomLesson } from '../../services/apiService';
import { syncClassroomToFirestore } from '../../services/firebaseSync';
import { TeacherLiveDashboard } from './TeacherLiveDashboard';
import { TeacherLessonLibrary } from './TeacherLessonLibrary';
import { KeyRound } from 'lucide-react';

interface TeacherViewProps {
  lessonData: LessonData;
  onUpdateLessonData: (data: LessonData) => void;
  currentStageId: string;
  onSelectStage: (stageId: string) => void;
  onSwitchToStudentView: () => void;
  classCode: string;
  teacherToken?: string;
  onChangePasswordClick?: () => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  lessonData,
  onUpdateLessonData,
  currentStageId,
  onSelectStage,
  onSwitchToStudentView,
  classCode,
  teacherToken,
  onChangePasswordClick,
}) => {
  // Upload and parsing states
  const [uploadError, setUploadError] = useState<string[] | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Multilingual preview state
  const [previewStageId, setPreviewStageId] = useState<string>(currentStageId);
  const [previewStudentLang, setPreviewStudentLang] = useState<LanguageCode>('uz-Latn');
  const [previewStudentLevel, setPreviewStudentLevel] = useState<KoreanLevel>('beginner');
  const [reviewLanguage, setReviewLanguage] = useState<'ko' | 'en'>('ko');
  const [previewData, setPreviewData] = useState<AITeacherPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Active stage for preview
  const activePreviewStage =
    lessonData.stages.find((s) => s.id === previewStageId) ||
    lessonData.stages[0];

  // Load preview data
  const handleLoadPreview = async (refresh = false) => {
    if (!activePreviewStage) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const data = await fetchTeacherPreview(
        lessonData.info,
        activePreviewStage,
        previewStudentLang,
        previewStudentLevel,
        reviewLanguage,
        refresh
      );
      setPreviewData(data);
    } catch (err: any) {
      console.error('Failed to load teacher preview:', err);
      setPreviewError('미리보기를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setPreviewLoading(false);
    }
  };

  React.useEffect(() => {
    handleLoadPreview(false);
  }, [previewStageId, previewStudentLang, previewStudentLevel, reviewLanguage]);

  const [libraryRefresh, setLibraryRefresh] = useState<number>(0);

  // Handle file input
  const handleFileUpload = (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

    if (!file.name.toLowerCase().endsWith('.txt')) {
      setUploadError(['UTF-8 형식의 TXT 파일만 업로드할 수 있습니다.']);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (!content) {
        setUploadError(['파일 내용을 읽을 수 없습니다.']);
        return;
      }

      const result = parseLessonTxt(content);
      if (!result.success || !result.data) {
        setUploadError(result.errors || ['파일 파싱에 실패했습니다.']);
      } else {
        const syncRes = await updateClassroomLesson(classCode, result.data, teacherToken);
        if (!syncRes.success) {
          setUploadError([syncRes.error || '서버에 수업 자료를 저장하지 못했습니다.']);
          return;
        }
        onUpdateLessonData(result.data);
        setLibraryRefresh((n) => n + 1);
        setUploadSuccess(
          `수업 자료가 성공적으로 반영되었습니다! (${result.data.stages.length}개 수업 단계 등록 완료)`
        );
        if (result.data.stages.length > 0) {
          onSelectStage(result.data.stages[0].id);
          setPreviewStageId(result.data.stages[0].id);
        }
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Download sample TXT file
  const handleDownloadSample = () => {
    const blob = new Blob([DEFAULT_LESSON_RAW_TEXT], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'togetheron_sample_lesson.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset to default sample lesson
  const handleResetSample = async () => {
    await updateClassroomLesson(classCode, DEFAULT_LESSON_PARSED, teacherToken);
    onUpdateLessonData(DEFAULT_LESSON_PARSED);
    onSelectStage(DEFAULT_LESSON_PARSED.stages[0].id);
    setPreviewStageId(DEFAULT_LESSON_PARSED.stages[0].id);
    setLibraryRefresh((n) => n + 1);
    setUploadSuccess('기본 시연 수업(초등 사회 6~7차시)으로 초기화되었습니다.');
    setUploadError(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* 1. Real-time Student Connection & Help Request Live Dashboard */}
      <TeacherLiveDashboard
        classCode={classCode}
        teacherToken={teacherToken}
        currentStageId={currentStageId}
      />

      {/* 1-2. Lesson Library & Archive */}
      <TeacherLessonLibrary
        classCode={classCode}
        teacherToken={teacherToken}
        activeLessonId={lessonData.id}
        onActivateLesson={(newLesson) => {
          onUpdateLessonData(newLesson);
          if (newLesson.stages.length > 0) {
            onSelectStage(newLesson.stages[0].id);
            setPreviewStageId(newLesson.stages[0].id);
          }
        }}
        refreshTrigger={libraryRefresh}
      />

      {/* 2. Header Banner & Quick Action */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
            교사용 수업 관리실
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            {lessonData.info.subject}: {lessonData.info.topic}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {lessonData.info.unit} · {lessonData.info.period} · 교과서 {lessonData.info.textbookPages || '미지정'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onChangePasswordClick && (
            <button
              type="button"
              onClick={onChangePasswordClick}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>비밀번호 변경</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSwitchToStudentView}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
          >
            <PlayCircle className="w-4 h-4 text-amber-400" />
            <span>학생 화면으로 이동하기</span>
          </button>
        </div>
      </div>

      {/* 3. Live Stage Progression Controller */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              현재 교실 수업 단계 지정 (Classroom Stage)
            </h2>
            <p className="text-xs text-slate-500">
              선생님께서 단계를 클릭하면 모든 학생 기기에 실시간으로 동기화됩니다. (학생 기기 자동 새로고침)
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
            총 {lessonData.stages.length}개 수업 단계
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {lessonData.stages.map((st, idx) => {
            const isCurrent = st.id === currentStageId;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  onSelectStage(st.id);
                  setPreviewStageId(st.id);
                  updateClassroomStage(classCode, st.id, teacherToken);
                  void syncClassroomToFirestore(classCode, { currentStageId: st.id, isActive: true });
                }}
                className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-400/30 shadow-xs'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      isCurrent
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {idx + 1}단계 ({st.id})
                  </span>
                  {isCurrent && (
                    <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>현재 진행 중</span>
                    </span>
                  )}
                </div>

                <span className="text-sm font-bold text-slate-900 mb-1">
                  {st.title}
                </span>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {st.currentActivity}
                </p>

                {st.teacherQuestions && st.teacherQuestions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">발문: </span>
                    <span className="line-clamp-1">"{st.teacherQuestions[0]}"</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Section 4-4: Teacher Multilingual Preview (교사용 다국어 미리보기) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                교사용 다국어 비계 미리보기 (Multilingual Preview)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              학생 언어 및 한국어 이해 수준에 따라 실제 학생 화면에 어떻게 비계가 구성되는지 사전에 검토합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleLoadPreview(true)}
            disabled={previewLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${previewLoading ? 'animate-spin' : ''}`} />
            <span>새로고침</span>
          </button>
        </div>

        {/* Preview Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 mb-6">
          {/* 1. Stage selection */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              검토할 수업 단계
            </label>
            <select
              value={previewStageId}
              onChange={(e) => setPreviewStageId(e.target.value)}
              className="w-full text-xs font-medium p-2 bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
            >
              {lessonData.stages.map((st, i) => (
                <option key={st.id} value={st.id}>
                  {i + 1}. {st.title}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Target Student Language */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              학생 모국어 (Target Lang)
            </label>
            <select
              value={previewStudentLang}
              onChange={(e) => setPreviewStudentLang(e.target.value as LanguageCode)}
              className="w-full text-xs font-medium p-2 bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Student Korean Level */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              학생 한국어 수준 (Level)
            </label>
            <select
              value={previewStudentLevel}
              onChange={(e) => setPreviewStudentLevel(e.target.value as KoreanLevel)}
              className="w-full text-xs font-medium p-2 bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="beginner">초급 (모국어 중심 + 핵심 한국어)</option>
              <option value="intermediate">중급 (쉬운 한국어 + 모국어 보조)</option>
              <option value="advanced">상급 (한국어 중심 + 교과 어휘)</option>
            </select>
          </div>

          {/* 4. Review Language */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              교사 검토 언어 (Review In)
            </label>
            <div className="flex items-center gap-1 p-0.5 bg-white rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setReviewLanguage('ko')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
                  reviewLanguage === 'ko'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                한국어
              </button>
              <button
                type="button"
                onClick={() => setReviewLanguage('en')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
                  reviewLanguage === 'en'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* 3 Comparative Panes Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pane 1: Original Korean Lesson Content */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center">
                1
              </span>
              <span className="text-xs font-bold text-slate-800">
                원본 한국어 수업 내용
              </span>
            </div>
            <div className="space-y-3 flex-1 text-xs text-slate-700">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">단계 활동</span>
                <p className="font-semibold text-slate-900">
                  {activePreviewStage.currentActivity}
                </p>
              </div>
              {activePreviewStage.teacherQuestions?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">교사 발문</span>
                  <p className="text-slate-800 italic">
                    "{activePreviewStage.teacherQuestions[0]}"
                  </p>
                </div>
              )}
              {activePreviewStage.keyVocabulary?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">핵심 어휘</span>
                  <div className="flex flex-wrap gap-1">
                    {activePreviewStage.keyVocabulary.map((v, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pane 2: Student Actual View (Target Native Language) */}
          <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 flex flex-col">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-sky-200/60">
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] font-bold flex items-center justify-center">
                2
              </span>
              <span className="text-xs font-bold text-sky-900">
                학생에게 실제 표시될 언어 ({previewStudentLang})
              </span>
            </div>
            <div className="space-y-3 flex-1 text-xs text-slate-700">
              {previewLoading ? (
                <div className="p-6 text-center text-slate-400">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-sky-600" />
                  <span>학생 화면 설명 구성 중...</span>
                </div>
              ) : previewData ? (
                <div>
                  <span className="text-[10px] font-bold text-sky-700 block mb-1">
                    현지어 번역 및 비계 설명:
                  </span>
                  <p className="text-slate-800 leading-relaxed font-medium bg-white/70 p-2.5 rounded-lg border border-sky-200/50">
                    {previewData.studentNativeText}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400">미리보기 준비 중...</p>
              )}
            </div>
          </div>

          {/* Pane 3: Teacher Inspection View (Back-translation & pedagogical scaffolding) */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 flex flex-col">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-indigo-200/60">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-bold text-indigo-900">
                교사 검토용 설명 ({reviewLanguage === 'en' ? 'English' : '한국어'})
              </span>
            </div>
            <div className="space-y-3 flex-1 text-xs text-slate-700">
              {previewLoading ? (
                <div className="p-6 text-center text-slate-400">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-indigo-600" />
                  <span>검토용 역번역 및 비계 분석 중...</span>
                </div>
              ) : previewData ? (
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 block mb-1">
                    교육적 비계 및 의미 검증:
                  </span>
                  <p className="text-slate-800 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-indigo-200/50">
                    {previewData.teacherReviewText}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400">검토 준비 중...</p>
              )}
            </div>
          </div>
        </div>

        {/* Translation Disclaimer */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2 text-xs text-slate-600">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>교사용 알림:</strong> AI의 역번역과 모국어 변환은 자동 처리된 결과입니다. 언어적 정확성은 학생의 실제 교실 반응을 고려하여 교사의 교육적 판단으로 보완해 주세요.
          </span>
        </div>
      </div>

      {/* 4. Section 4-1 & 4-2: TXT File Upload & Parser Rules */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              새로운 수업 자료 업로드 (TXT)
            </h2>
            <p className="text-xs text-slate-500">
              교사가 준비한 UTF-8 형식의 구조화된 수업 계획안 TXT 파일을 업로드하여 사회, 과학, 국어 등 다양한 수업에 활용할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="샘플 양식 다운로드"
            >
              <Download className="w-3.5 h-3.5" />
              <span>양식 TXT 다운로드</span>
            </button>
            <button
              type="button"
              onClick={handleResetSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
              title="기본 시연 수업 복원"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>기본 수업 복원</span>
            </button>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
          }`}
        >
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            수업 자료 TXT 파일을 이곳에 끌어다 놓으세요
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            UTF-8 형식의 .txt 파일 (예: [수업_기본정보], [단계: INTRO] 등)
          </p>

          <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors shadow-xs">
            <FileText className="w-3.5 h-3.5" />
            <span>내 컴퓨터에서 파일 선택</span>
            <input
              type="file"
              accept=".txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>

        {/* Success / Error Feedback */}
        {uploadSuccess && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
            <div className="flex items-center gap-2 font-bold text-red-900">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>수업 자료 파싱 오류 안내:</span>
            </div>
            <ul className="list-disc list-inside pl-2 space-y-0.5">
              {uploadError.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
