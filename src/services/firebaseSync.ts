import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { LessonData, StudentSession } from '../types/lesson';

let dbInstance: Firestore | null = null;

function getDb(): Firestore | null {
  if (dbInstance) return dbInstance;
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    return dbInstance;
  } catch (err) {
    console.warn('[TogetherON] Firestore init failed:', err);
    return null;
  }
}

export async function syncClassroomToFirestore(
  code: string,
  data: {
    currentStageId?: string;
    lessonData?: LessonData;
    title?: string;
    isActive?: boolean;
  }
): Promise<void> {
  const db = getDb();
  if (!db || !code) return;
  try {
    const cleanData: Record<string, unknown> = {
      code: code.toUpperCase(),
      updatedAt: Date.now(),
    };
    if (data.currentStageId !== undefined) cleanData.currentStageId = data.currentStageId;
    if (data.lessonData !== undefined) cleanData.lessonData = JSON.parse(JSON.stringify(data.lessonData));
    if (data.title !== undefined) cleanData.title = data.title;
    if (data.isActive !== undefined) cleanData.isActive = data.isActive;

    await setDoc(doc(db, 'classrooms', code.toUpperCase()), cleanData, { merge: true });
  } catch (err) {
    console.warn('[TogetherON] Firestore classroom sync error:', err);
  }
}

export function subscribeClassroomFromFirestore(
  code: string,
  onUpdate: (data: { currentStageId?: string; lessonData?: LessonData; title?: string }) => void
): () => void {
  const db = getDb();
  if (!db || !code) return () => {};
  try {
    return onSnapshot(doc(db, 'classrooms', code.toUpperCase()), (snap) => {
      if (snap.exists()) {
        const d = snap.data() as any;
        onUpdate({
          currentStageId: d.currentStageId,
          lessonData: d.lessonData,
          title: d.title,
        });
      }
    });
  } catch {
    return () => {};
  }
}

export async function syncStudentToFirestore(
  code: string,
  student: StudentSession
): Promise<void> {
  const db = getDb();
  if (!db || !code || !student?.id) return;
  try {
    const cleanStudent = JSON.parse(JSON.stringify({
      ...student,
      classCode: code.toUpperCase(),
      lastActive: Date.now(),
    }));
    await setDoc(
      doc(db, 'classrooms', code.toUpperCase(), 'students', student.id),
      cleanStudent,
      { merge: true }
    );
  } catch (err) {
    console.warn('[TogetherON] Firestore student sync error:', err);
  }
}

export async function removeStudentFromFirestore(
  code: string,
  studentId: string
): Promise<void> {
  const db = getDb();
  if (!db || !code || !studentId) return;
  try {
    await deleteDoc(doc(db, 'classrooms', code.toUpperCase(), 'students', studentId));
  } catch {
    // ignore
  }
}

export function subscribeStudentsFromFirestore(
  code: string,
  onUpdate: (students: StudentSession[]) => void
): () => void {
  const db = getDb();
  if (!db || !code) return () => {};
  try {
    return onSnapshot(collection(db, 'classrooms', code.toUpperCase(), 'students'), (snap) => {
      const list: StudentSession[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as StudentSession);
      });
      onUpdate(list);
    });
  } catch {
    return () => {};
  }
}
