/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LessonData,
  LanguageCode,
  KoreanLevel,
  StudentSession,
} from './types/lesson';
import { DEFAULT_LESSON_PARSED } from './data/defaultLesson';
import { getLocalizedStage } from './utils/lessonLocalization';
import { getClassroom, checkTeacherAuth, clearSessionCache } from './services/apiService';
import {
  syncClassroomToFirestore,
  subscribeClassroomFromFirestore,
  syncStudentToFirestore,
} from './services/firebaseSync';
import { TopNav } from './components/TopNav';
import { StudentView } from './components/student/StudentView';
import { TeacherView } from './components/teacher/TeacherView';
import { LanguageLevelModal } from './components/LanguageLevelModal';
import { TeacherLoginModal } from './components/auth/TeacherLoginModal';
import { JoinClassModal } from './components/auth/JoinClassModal';
import { ClassroomCommunicationModal } from './components/student/ClassroomCommunicationModal';
import { NotebookModal } from './components/student/NotebookModal';

export default function App() {
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const urlCode = urlParams?.get('code') || urlParams?.get('join');
  const urlRole = urlParams?.get('role');

  // Current app role: student or teacher
  const [role, setRole] = useState<'student' | 'teacher'>(urlRole === 'teacher' ? 'teacher' : 'student');

  // Classroom Code System (Default: ON-7429)
  const [classCode, setClassCode] = useState<string>(urlCode ? urlCode.toUpperCase() : 'ON-7429');

  // Student Session (persisted in localStorage across refreshes)
  const [studentSession, setStudentSession] = useState<StudentSession>(() => {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('togetheron_student_session') : null;
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      id: 'stu-sample-7',
      classCode: 'ON-7429',
      nickname: '학생 (7번)',
      language: 'en',
      koreanLevel: 'beginner',
      currentStageId: 'INTRO',
      taskStates: {},
      lastActive: Date.now(),
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('togetheron_student_session', JSON.stringify(studentSession));
    } catch {
      // ignore
    }
  }, [studentSession]);

  // Teacher Auth Token
  const [teacherToken, setTeacherToken] = useState<string | null>(() => {
    return typeof localStorage !== 'undefined'
      ? localStorage.getItem('togetheron_teacher_token')
      : null;
  });
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(false);

  // Active lesson plan state (defaulting to elementary social studies lesson)
  const [lessonData, setLessonData] = useState<LessonData>(DEFAULT_LESSON_PARSED);

  // Active stage ID (set by teacher, synchronized to student devices via server polling)
  const [currentStageId, setCurrentStageId] = useState<string>(
    DEFAULT_LESSON_PARSED.stages[0]?.id || 'INTRO'
  );

  // Student language and Korean level settings
  // Default test language is English ('en') as requested, switchable anytime
  const [studentLanguage, setStudentLanguage] = useState<LanguageCode>('en');
  const [koreanLevel, setKoreanLevel] = useState<KoreanLevel>('beginner');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isTeacherLoginOpen, setIsTeacherLoginOpen] = useState<boolean>(false);
  const [teacherLoginMode, setTeacherLoginMode] = useState<'login' | 'setup'>('login');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [isCommunicationOpen, setIsCommunicationOpen] = useState<boolean>(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState<boolean>(false);

  // Verify teacher token on mount or token change
  useEffect(() => {
    if (teacherToken) {
      checkTeacherAuth(teacherToken).then((valid) => {
        setIsTeacherAuthenticated(valid);
        if (!valid) {
          setTeacherToken(null);
          localStorage.removeItem('togetheron_teacher_token');
        }
      });
    } else {
      setIsTeacherAuthenticated(false);
    }
  }, [teacherToken]);

  // Real-time synchronization polling:
  // When student device is running, poll classroom stage every 3 seconds
  // so if teacher moves the class to ACT1 or ACT2, student screen updates!
  useEffect(() => {
    let isMounted = true;
    let hasFirestoreSync = false;

    const syncClassroom = async () => {
      if (!classCode || hasFirestoreSync) return;
      try {
        const cls = await getClassroom(classCode);
        if (cls && isMounted && !hasFirestoreSync) {
          if (cls.currentStageId && cls.currentStageId !== currentStageId) {
            setCurrentStageId(cls.currentStageId);
          }
          if (cls.lessonData && cls.lessonData.stages?.length > 0 && cls.lessonData.id !== lessonData.id) {
            setLessonData(cls.lessonData);
          }
        }
      } catch (err) {
        // Soft fail
      }
    };

    syncClassroom();
    const interval = setInterval(syncClassroom, 3000);
    const unsubFirestore = subscribeClassroomFromFirestore(classCode, (data) => {
      if (!isMounted) return;
      hasFirestoreSync = true;
      if (data.currentStageId) {
        setCurrentStageId((prev) => (prev !== data.currentStageId ? data.currentStageId! : prev));
      }
      if (data.lessonData && data.lessonData.stages?.length > 0) {
        setLessonData((prev) => (prev.id !== data.lessonData!.id ? data.lessonData! : prev));
      }
    });
    return () => {
      isMounted = false;
      clearInterval(interval);
      unsubFirestore();
    };
  }, [classCode]);

  const activeStage =
    lessonData.stages.find((s) => s.id === currentStageId) ||
    lessonData.stages[0];

  const isDefaultLesson = lessonData.info.topic === '지능정보화로 달라진 생활 모습 살펴보기';
  const localizedStage = isDefaultLesson ? getLocalizedStage(currentStageId, studentLanguage) : null;
  const stageTitleToDisplay = localizedStage?.title || activeStage?.title;

  const handleUpdateLessonData = (newLesson: LessonData) => {
    setLessonData(newLesson);
    if (newLesson.stages.length > 0) {
      setCurrentStageId(newLesson.stages[0].id);
    }
  };

  const handleSaveSettings = (lang: LanguageCode, level: KoreanLevel) => {
    clearSessionCache();
    setStudentLanguage(lang);
    setKoreanLevel(level);
    setStudentSession((prev) => ({
      ...prev,
      language: lang,
      koreanLevel: level,
    }));
  };

  const handleRoleChange = (targetRole: 'student' | 'teacher') => {
    if (targetRole === 'teacher') {
      if (!isTeacherAuthenticated) {
        setTeacherLoginMode('login');
        setIsTeacherLoginOpen(true);
        return;
      }
      setRole('teacher');
    } else {
      setRole('student');
    }
  };

  const handleTeacherLoginSuccess = (token: string) => {
    setTeacherToken(token);
    setIsTeacherAuthenticated(true);
    localStorage.setItem('togetheron_teacher_token', token);
    setIsTeacherLoginOpen(false);
    setRole('teacher');
  };

  const handleStudentJoined = (code: string, session: StudentSession) => {
    setClassCode(code);
    setStudentSession(session);
    setStudentLanguage(session.language);
    setKoreanLevel(session.koreanLevel);
    clearSessionCache();
    void syncStudentToFirestore(code, session);
  };

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col">
      {/* 1. Header with Top Bar Contract & Role Switcher */}
      <TopNav
        currentRole={role}
        onRoleChange={handleRoleChange}
        selectedLanguage={studentLanguage}
        selectedLevel={koreanLevel}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeStageTitle={stageTitleToDisplay}
        classCode={classCode}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
        onOpenCommunication={() => setIsCommunicationOpen(true)}
        onOpenNotebook={() => setIsNotebookOpen(true)}
        isTeacherAuthenticated={isTeacherAuthenticated}
      />

      {/* 2. Main Viewport Container */}
      <div className="flex-1">
        {role === 'student' ? (
          <StudentView
            lessonData={lessonData}
            currentStageId={currentStageId}
            studentLanguage={studentLanguage}
            koreanLevel={koreanLevel}
            onOpenSettings={() => setIsSettingsOpen(true)}
            classCode={classCode}
            studentId={studentSession.id}
            studentNickname={studentSession.nickname}
            onOpenCommunication={() => setIsCommunicationOpen(true)}
            onOpenNotebook={() => setIsNotebookOpen(true)}
          />
        ) : (
          <TeacherView
            lessonData={lessonData}
            onUpdateLessonData={handleUpdateLessonData}
            currentStageId={currentStageId}
            onSelectStage={setCurrentStageId}
            onSwitchToStudentView={() => setRole('student')}
            classCode={classCode}
            teacherToken={teacherToken || undefined}
            onChangePasswordClick={() => {
              setTeacherLoginMode('setup');
              setIsTeacherLoginOpen(true);
            }}
          />
        )}
      </div>

      {/* 3. Language & Level Configuration Modal */}
      <LanguageLevelModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedLanguage={studentLanguage}
        selectedLevel={koreanLevel}
        onSave={handleSaveSettings}
      />

      {/* 4. Teacher Password Login & Setup Modal */}
      <TeacherLoginModal
        isOpen={isTeacherLoginOpen}
        onClose={() => setIsTeacherLoginOpen(false)}
        onSuccess={handleTeacherLoginSuccess}
        initialMode={teacherLoginMode}
      />

      {/* 5. Student Join Classroom Modal */}
      <JoinClassModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        currentClassCode={classCode}
        currentStudentSession={studentSession}
        onJoined={handleStudentJoined}
      />

      {/* 6. Classroom Dialogue (Text & Voice) Helper Modal */}
      <ClassroomCommunicationModal
        isOpen={isCommunicationOpen}
        onClose={() => setIsCommunicationOpen(false)}
        studentLanguage={studentLanguage}
        koreanLevel={koreanLevel}
        lessonTopic={lessonData.info.topic}
        classCode={classCode}
        studentId={studentSession.id}
      />

      {/* 7. My Korean Learning Notebook Modal */}
      <NotebookModal
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
        studentLanguage={studentLanguage}
        classCode={classCode}
        studentId={studentSession.id}
        studentNickname={studentSession.nickname}
      />
    </div>
  );
}
