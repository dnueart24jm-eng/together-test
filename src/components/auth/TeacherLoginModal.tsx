import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  KeyRound,
  X,
  AlertCircle,
  CheckCircle2,
  Key,
} from 'lucide-react';
import { teacherLogin, teacherSetupPassword } from '../../services/apiService';

interface TeacherLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (token: string) => void;
  onSuccess?: (token: string) => void;
  initialMode?: 'login' | 'setup';
}

export const TeacherLoginModal: React.FC<TeacherLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onSuccess,
  initialMode = 'login',
}) => {
  const handleSuccessCallback = (token: string) => {
    if (onLoginSuccess) onLoginSuccess(token);
    if (onSuccess) onSuccess(token);
  };

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password change mode
  const [isChangingPassword, setIsChangingPassword] = useState(initialMode === 'setup');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    setIsChangingPassword(initialMode === 'setup');
    setError(null);
    setChangeSuccess(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await teacherLogin(password);
      if (res.success && res.token) {
        handleSuccessCallback(res.token);
        onClose();
      } else {
        setError(res.error || '비밀번호가 올바르지 않습니다.');
      }
    } catch {
      setError('서버 연결 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setError('새 비밀번호와 확인이 일치하지 않습니다.');
      return;
    }
    if (newPw.length < 4) {
      setError('새 비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await teacherSetupPassword(currentPw, newPw);
      if (res.success && res.token) {
        setChangeSuccess('비밀번호가 안전하게 변경되었습니다.');
        handleSuccessCallback(res.token);
        setTimeout(() => {
          setIsChangingPassword(false);
          onClose();
        }, 1200);
      } else {
        setError(res.error || '비밀번호 변경 실패');
      }
    } catch {
      setError('서버 연결 오류');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-indigo-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isChangingPassword ? '교사 비밀번호 변경' : '교사용 관리자 인증'}
              </h3>
              <p className="text-xs text-slate-500">
                {isChangingPassword ? '새로운 관리 비밀번호 설정' : '교사 인증 후 수업 관리 및 대시보드 접근'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {!isChangingPassword ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>교사 비밀번호 입력</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="교사 비밀번호를 입력하세요"
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/60"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  * 서버 환경변수(<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-600">TEACHER_PASSWORD</code>)에 설정된 교사 비밀번호를 입력하세요.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading || !password.trim()}
                  className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs"
                >
                  {loading ? '인증 확인 중...' : '교사 관리실 입장'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(true);
                    setError(null);
                  }}
                  className="text-xs text-slate-500 hover:text-indigo-600 py-1 transition-colors flex items-center justify-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>비밀번호 변경하기</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="현재 비밀번호"
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  새 비밀번호 (4자 이상)
                </label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="새로운 비밀번호"
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="새 비밀번호 다시 입력"
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              {changeSuccess && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{changeSuccess}</span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading || !newPw || !confirmPw}
                  className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {loading ? '변경 중...' : '비밀번호 저장'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
