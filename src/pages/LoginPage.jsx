import { useState } from 'react';
import { BadgeCheck, Briefcase, ChevronRight, GraduationCap, ShieldCheck } from 'lucide-react';
import { useDemoStore } from '../store/useDemoStore.js';

export default function LoginPage({ onLogin }) {
  const [profile, setProfile] = useState('student');
  const [accountNumber, setAccountNumber] = useState('');
  const [loginError, setLoginError] = useState('');

  const demoAccountNumber = useDemoStore((state) => state.account.number);
  const staff = useDemoStore((state) => state.staff);

  const handleProfileChange = (nextProfile) => {
    setProfile(nextProfile);
    setLoginError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const cleaned = accountNumber.trim();

    if (profile === 'student') {
      if (cleaned === demoAccountNumber) {
        setLoginError('');
        onLogin({ role: 'student', staffId: null });
        return;
      }
      setLoginError(`Conta não encontrada. Use a matrícula de demonstração ${demoAccountNumber}.`);
      return;
    }

    const matchedStaff = staff.find((member) => member.siape === cleaned);
    if (matchedStaff) {
      setLoginError('');
      onLogin({ role: 'teacher', staffId: matchedStaff.id });
      return;
    }

    setLoginError('Acesso não encontrado. Use um SIAPE de demonstração (900001, 900002 ou 900003).');
  };

  return (
    <div className="login-page">
      <div className="demo-ribbon">
        <ShieldCheck size={15} aria-hidden="true" />
        <span>DEMONSTRAÇÃO FICTÍCIA · DADOS SIMULADOS</span>
      </div>

      <section className="login-card" aria-labelledby="login-heading">
        <div className="brand login-brand">
          <span className="brand-mark" aria-hidden="true">
            B
          </span>
          <span>
            BANESC
            <small>Banco Escolar</small>
          </span>
        </div>

        <span className="login-kicker">ACESSO AO BANESC</span>
        <h1 id="login-heading">Como deseja entrar?</h1>
        <p>Escolha um perfil para explorar a demonstração educativa.</p>

        <div className="profile-choice" role="group" aria-label="Escolha o perfil">
          <button
            type="button"
            className={profile === 'student' ? 'chosen' : ''}
            aria-pressed={profile === 'student'}
            onClick={() => handleProfileChange('student')}
          >
            <GraduationCap size={18} aria-hidden="true" />
            <span>Sou estudante</span>
          </button>

          <button
            type="button"
            className={profile === 'teacher' ? 'chosen' : ''}
            aria-pressed={profile === 'teacher'}
            onClick={() => handleProfileChange('teacher')}
          >
            <Briefcase size={18} aria-hidden="true" />
            <span>Sou professor/servidor</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="account">
            {profile === 'student' ? 'Matrícula de demonstração' : 'SIAPE de demonstração'}
          </label>
          <input
            id="account"
            inputMode="numeric"
            autoComplete="off"
            placeholder={profile === 'student' ? `Ex.: ${demoAccountNumber}` : 'Ex.: 900001'}
            value={accountNumber}
            onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, ''))}
          />

          {loginError && (
            <div className="login-error" role="alert">
              {loginError}
            </div>
          )}

          <button type="submit" className="login-submit">
            Acessar demonstração <ChevronRight size={17} aria-hidden="true" />
          </button>
        </form>

        <div className="quick-fill-row">
          <button
            type="button"
            className="qr-demo"
            onClick={() => {
              setProfile('student');
              setAccountNumber(demoAccountNumber);
              setLoginError('');
            }}
          >
            Preencher estudante ({demoAccountNumber})
          </button>
          <button
            type="button"
            className="qr-demo"
            onClick={() => {
              setProfile('teacher');
              setAccountNumber(staff[0]?.siape || '900001');
              setLoginError('');
            }}
          >
            Preencher servidor ({staff[0]?.siape || '900001'})
          </button>
        </div>

        <div className="login-note">
          <BadgeCheck size={16} aria-hidden="true" />
          <span>Ambiente fictício, sem cadastro e sem dados pessoais reais.</span>
        </div>

        <small className="demo-account">
          Estudante: <b>{demoAccountNumber}</b> · Servidores: <b>900001</b>, <b>900002</b>,{' '}
          <b>900003</b>
        </small>
      </section>
    </div>
  );
}
