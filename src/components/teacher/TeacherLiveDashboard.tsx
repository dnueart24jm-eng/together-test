import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Copy,
  Check,
  RefreshCw,
  Power,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  StudentSession,
  HelpReason,
  TaskStatus,
} from '../../types/lesson';
import {
  getClassroomDashboard,
  resolveStudentHelp,
  endClassroom,
} from '../../services/apiService';
import { subscribeStudentsFromFirestore } from '../../services/firebaseSync';

interface TeacherLiveDashboardProps {
  classCode: string;
  teacherToken?: string;
  currentStageId: string;
  onRefreshStage?: () => void;
}

export const TeacherLiveDashboard: React.FC<TeacherLiveDashboardProps> = ({
  classCode,
  teacherToken,
  currentStageId,
  onRefreshStage,
}) => {
  const [students, setStudents] = useState<StudentSession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchDashboard = async () => {
    if (!classCode) return;
    try {
      const data = await getClassroomDashboard(classCode, teacherToken);
      if (data && data.students) {
        setStudents(data.students);
      }
    } catch (err) {
      console.warn('Dashboard poll error:', err);
    }
  };

  // Poll every 3 seconds + subscribe to Firestore for live student status and help requests
  useEffect(() => {
    let hasFirestoreStudents = false;
    fetchDashboard();
    const interval = setInterval(() => {
      if (!hasFirestoreStudents) {
        fetchDashboard();
      }
    }, 3000);
    const unsub = subscribeStudentsFromFirestore(classCode, (firestoreStudents) => {
      hasFirestoreStudents = true;
      const now = Date.now();
      const activeOnly = firestoreStudents.filter(
        (s) => now - (s.lastActive || 0) < 60 * 1000
      );
      setStudents(activeOnly);
    });
    return () => {
      clearInterval(interval);
      unsub();
    };
  }, [classCode, teacherToken]);

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(classCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleResolveHelp = async (studentId: string, taskId: string) => {
    const key = `${studentId}-${taskId}`;
    setResolvingId(key);
    try {
      await resolveStudentHelp(classCode, studentId, taskId, teacherToken);
      await fetchDashboard();
    } catch (err) {
      console.error('Resolve help failed:', err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleEndClass = async () => {
    if (window.confirm('정말 현재 수업을 종료하고 코드를 비활성화하시겠습니까?')) {
      await endClassroom(classCode, teacherToken);
      await fetchDashboard();
    }
  };

  // Find all help requests across students
  const activeHelpRequests: Array<{
    student: StudentSession;
    taskId: string;
    stageId: string;
    reason?: HelpReason;
    note?: string;
    updatedAt: number;
  }> = [];

  students.forEach((stu) => {
    if (stu.taskStates) {
      Object.entries(stu.taskStates).forEach(([taskId, state]) => {
        if (state.status === 'help_needed') {
          activeHelpRequests.push({
            student: stu,
            taskId,
            stageId: state.stageId,
            reason: state.helpReason,
            note: state.helpNote,
            updatedAt: state.updatedAt,
          });
        }
      });
    }
  });

  const getReasonLabel = (reason?: HelpReason) => {
    switch (reason) {
      case 'not_understand_teacher':
        return '선생님 말씀을 잘 이해하지 못했어요';
      case 'dont_know_what_to_do':
        return '지금 무엇을 해야 할지 모르겠어요';
      case 'difficult_word':
        return '단어나 글의 뜻이 너무 어려워요';
      case 'cant_say_to_friend':
        return '친구에게 제 생각을 한국어로 말하기 어려워요';
      case 'other':
      default:
        return '도움이 필요해요 (기타)';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Classroom Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 bg-white/10 px-2.5 py-0.5 rounded-full">
                실시간 수업 참여 관리
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                라이브 연동 중 (3초 주기)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              학생 기기 접속 안내
            </h2>
            <p className="text-xs text-indigo-200 mt-1">
              학생들이 본인의 태블릿이나 스마트폰에서 함께ON에 접속한 뒤 아래 수업 코드를 입력하도록 안내해 주세요.
            </p>
          </div>

          {/* Big Code Card */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 block">
                수업 참여 코드
              </span>
              <span className="text-2xl sm:text-3xl font-black tracking-widest text-amber-300">
                {classCode}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-3 bg-white text-indigo-950 hover:bg-indigo-50 rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5 text-xs"
              title="코드 복사"
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>코드 복사</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Urgent Help Requests Section */}
      {activeHelpRequests.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 shadow-xs animate-fadeIn">
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-red-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
                <AlertCircle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-bold text-red-900">
                  도움 요청 발생! ({activeHelpRequests.length}명)
                </h3>
                <p className="text-xs text-red-700">
                  수업 활동 중 어려움을 겪는 이주배경 학생이 교사의 도움을 요청했습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeHelpRequests.map((req, idx) => {
              const resolveKey = `${req.student.id}-${req.taskId}`;
              return (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-xl border border-red-200 shadow-2xs flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-slate-900">
                        {req.student.nickname}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {req.student.language.toUpperCase()} · {req.stageId}
                      </span>
                    </div>

                    <div className="p-2.5 bg-red-50/70 rounded-lg border border-red-100 text-xs font-semibold text-red-900 mb-1">
                      ⚠️ {getReasonLabel(req.reason)}
                    </div>

                    {req.note && (
                      <p className="text-xs text-slate-600 italic">
                        "{req.note}"
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleResolveHelp(req.student.id, req.taskId)}
                    disabled={resolvingId === resolveKey}
                    className="self-end px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>개별 지도 완료 (해결)</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Connected Students List & Task Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                참여 중인 학생 현황 ({students.length}명 접속 중)
              </h3>
              <p className="text-xs text-slate-500">
                학생의 모국어, 한국어 수준, 활동 진행 상황을 한눈에 관찰할 수 있습니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchDashboard}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>새로고침</span>
          </button>
        </div>

        {students.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">아직 접속한 학생이 없습니다.</p>
            <p className="text-xs text-slate-400 mt-1">
              학생 기기에서 수업 코드 <span className="font-bold text-amber-600">{classCode}</span> 를 입력하면 실시간으로 여기에 나타납니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map((stu) => {
              const taskEntries = Object.values(stu.taskStates || {});
              const doneCount = taskEntries.filter((t) => t.status === 'done').length;
              const hasHelp = taskEntries.some((t) => t.status === 'help_needed');

              return (
                <div
                  key={stu.id}
                  className={`p-4 rounded-xl border transition-all ${
                    hasHelp
                      ? 'border-red-300 bg-red-50/50 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-900">
                      {stu.nickname}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {stu.language.toUpperCase()} · {stu.koreanLevel}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mb-2">
                    현재 단계: <span className="font-bold text-indigo-700">{stu.currentStageId || currentStageId}</span>
                  </div>

                  {/* Task progress stats */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>완료: {doneCount}건</span>
                    </div>

                    {hasHelp && (
                      <span className="text-xs font-bold text-red-600 flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>도움 필요</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
