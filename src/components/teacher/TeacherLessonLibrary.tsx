import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  CheckCircle2,
  Play,
  Edit3,
  Archive,
  RotateCcw,
  Trash2,
  Check,
  X,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { LessonData, SavedLessonRecord } from '../../types/lesson';
import {
  fetchSavedLessons,
  updateSavedLesson,
  deleteSavedLesson,
  updateClassroomLesson,
} from '../../services/apiService';

interface TeacherLessonLibraryProps {
  classCode: string;
  teacherToken?: string;
  activeLessonId: string;
  onActivateLesson: (lessonData: LessonData) => void;
  refreshTrigger?: number;
}

export const TeacherLessonLibrary: React.FC<TeacherLessonLibraryProps> = ({
  classCode,
  teacherToken,
  activeLessonId,
  onActivateLesson,
  refreshTrigger,
}) => {
  const [lessons, setLessons] = useState<SavedLessonRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadLessons = async () => {
    setLoading(true);
    try {
      const list = await fetchSavedLessons(teacherToken);
      setLessons(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, [teacherToken, refreshTrigger]);

  const handleActivate = async (record: SavedLessonRecord) => {
    const res = await updateClassroomLesson(classCode, record.lessonData, teacherToken);
    if (res.success) {
      onActivateLesson(record.lessonData);
      setStatusMsg(`"${record.title}" 수업이 활성화되어 학생 화면에 반영되었습니다.`);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) return;
    const res = await updateSavedLesson(id, { title: editTitle.trim() }, teacherToken);
    if (res.success && res.lessons) {
      setLessons(res.lessons);
      setEditingId(null);
    }
  };

  const handleToggleArchive = async (record: SavedLessonRecord) => {
    const res = await updateSavedLesson(
      record.id,
      { isArchived: !record.isArchived },
      teacherToken
    );
    if (res.success && res.lessons) {
      setLessons(res.lessons);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteSavedLesson(id, teacherToken);
    if (res.success && res.lessons) {
      setLessons(res.lessons);
      setConfirmDeleteId(null);
    }
  };

  const visibleLessons = lessons.filter((l) => (showArchived ? l.isArchived : !l.isArchived));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <FolderArchive className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              수업 자료 보관함 (Lesson Library & Archive)
            </h2>
            <p className="text-xs text-slate-500">
              업로드한 TXT 수업 자료를 보관·재사용하고, 현재 학급에 적용할 수업을 선택합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setShowArchived(false)}
            className={`px-3 py-1 rounded-lg transition-colors ${
              !showArchived ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            사용 중 ({lessons.filter((l) => !l.isArchived).length})
          </button>
          <button
            type="button"
            onClick={() => setShowArchived(true)}
            className={`px-3 py-1 rounded-lg transition-colors ${
              showArchived ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            보관함 ({lessons.filter((l) => l.isArchived).length})
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">수업 보관함을 불러오는 중...</div>
      ) : visibleLessons.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
          {showArchived ? '보관된 수업 자료가 없습니다.' : '등록된 수업 자료가 없습니다.'}
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleLessons.map((rec) => {
            const isActive = rec.id === activeLessonId;
            return (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isActive
                    ? 'border-indigo-400 bg-indigo-50/50 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {rec.subject}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {rec.period} · {rec.stageCount}개 단계
                    </span>
                    <span className="text-[11px] text-slate-400">
                      업로드: {rec.uploadedAt}
                    </span>
                    {isActive && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">
                        현재 활성 수업
                      </span>
                    )}
                  </div>

                  {editingId === rec.id ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-sm font-bold px-2.5 py-1 border border-slate-300 rounded-lg flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRename(rec.id)}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1.5 bg-slate-100 text-slate-600 rounded-lg"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {rec.title}
                    </h4>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  {!isActive && !rec.isArchived && (
                    <button
                      type="button"
                      onClick={() => handleActivate(rec)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-2xs"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>수업 활성화</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(rec.id);
                      setEditTitle(rec.title);
                    }}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    title="수업 이름 변경"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleArchive(rec)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                    title={rec.isArchived ? '보관함에서 복원' : '보관함으로 이동'}
                  >
                    {rec.isArchived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                  </button>

                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(rec.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="수업 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2.5 text-red-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold">수업 자료를 삭제하시겠습니까?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              삭제하면 보관함에서 수업 자료가 영구적으로 제거됩니다. (이미 학생이 개인 노트에 저장한 단어와 학급의 현재 활동 기록은 유지됩니다.)
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
              >
                영구 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
