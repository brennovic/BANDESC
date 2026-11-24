import { useCallback, useEffect, useRef, useState } from 'react';
import Toast from './components/Toast.jsx';
import LoginPage from './pages/LoginPage.jsx';
import StudentArea from './pages/StudentArea.jsx';
import TeacherArea from './pages/TeacherArea.jsx';
import { useDemoStore } from './store/useDemoStore.js';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const activeRole = useDemoStore((state) => state.activeRole);
  const setSession = useDemoStore((state) => state.setSession);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  }, []);

  const notify = useCallback((message, tone = 'success') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, tone });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleLogin = ({ role, staffId }) => {
    setSession(role, staffId);
    setLoggedIn(true);
    window.location.hash = role === 'student' ? '/estudante/inicio' : '/professor/painel';
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setSession('student', null);
    window.location.hash = '';
    dismissToast();
  };

  return (
    <>
      {!loggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : activeRole === 'teacher' ? (
        <TeacherArea onLogout={handleLogout} onNotify={notify} />
      ) : (
        <StudentArea onLogout={handleLogout} onNotify={notify} />
      )}
      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
