import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Medal, ShieldCheck, Trophy, X } from 'lucide-react';
import PhotoAvatar from './PhotoAvatar.jsx';

const FILTER_TABS = ['Geral', 'Cursos', 'Turmas', 'Minha Sala'];

export default function RankingPanel({ students = [], selfId }) {
  const self = useMemo(
    () => students.find((student) => student.id === selfId) || students[0] || null,
    [students, selfId]
  );

  const courses = useMemo(
    () => [...new Set(students.map((student) => student.course))],
    [students]
  );
  const classrooms = useMemo(
    () => [...new Set(students.map((student) => student.classroom))].sort(),
    [students]
  );

  const [filter, setFilter] = useState('Geral');
  const [selectedCourse, setSelectedCourse] = useState(self?.course || courses[0] || '');
  const [selectedClassroom, setSelectedClassroom] = useState(
    self?.classroom || classrooms[0] || ''
  );
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (!selectedStudent) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedStudent(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStudent]);

  const rankedAll = useMemo(() => {
    const activeCourse = selectedCourse || self?.course || courses[0];
    const activeClassroom = selectedClassroom || self?.classroom || classrooms[0];

    return [...students]
      .filter((student) => student.rankingOptIn)
      .filter((student) => {
        if (filter === 'Cursos') return student.course === activeCourse;
        if (filter === 'Turmas') return student.classroom === activeClassroom;
        if (filter === 'Minha Sala') return self ? student.classroom === self.classroom : true;
        return true;
      })
      .sort((a, b) => b.xp - a.xp);
  }, [students, filter, selectedCourse, selectedClassroom, self, courses, classrooms]);

  const topList = rankedAll.slice(0, 10);
  const podiumOrder = [
    topList[1] ? { student: topList[1], place: 2 } : null,
    topList[0] ? { student: topList[0], place: 1 } : null,
    topList[2] ? { student: topList[2], place: 3 } : null,
  ].filter(Boolean);
  const others = topList.slice(3);
  const maxXp = Math.max(1, topList[0]?.xp || 1);
  const ownIndex = self ? rankedAll.findIndex((student) => student.id === self.id) : -1;
  const studentAbove = ownIndex > 0 ? rankedAll[ownIndex - 1] : null;

  return (
    <section className="ranking-panel" aria-labelledby="ranking-heading">
      <div className="ranking-intro">
        <span className="rank-icon" aria-hidden="true">
          <Trophy size={22} />
        </span>
        <div>
          <h2 id="ranking-heading">Ranking de Engajamento</h2>
          <p>Classificação por XP (Top 10). Saldo, patrimônio e notas são privados.</p>
        </div>
      </div>

      <div className="rank-tabs" role="tablist" aria-label="Filtros do ranking">
        {FILTER_TABS.map((choice) => (
          <button
            key={choice}
            type="button"
            role="tab"
            aria-selected={filter === choice}
            className={filter === choice ? 'selected' : ''}
            onClick={() => setFilter(choice)}
          >
            {choice}
          </button>
        ))}
      </div>

      {filter === 'Cursos' && courses.length > 0 && (
        <div className="rank-subfilter">
          <label htmlFor="rank-course-select">Curso:</label>
          <select
            id="rank-course-select"
            value={selectedCourse}
            onChange={(event) => setSelectedCourse(event.target.value)}
          >
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      )}

      {filter === 'Turmas' && classrooms.length > 0 && (
        <div className="rank-subfilter">
          <label htmlFor="rank-classroom-select">Turma:</label>
          <select
            id="rank-classroom-select"
            value={selectedClassroom}
            onChange={(event) => setSelectedClassroom(event.target.value)}
          >
            {classrooms.map((classroom) => (
              <option key={classroom} value={classroom}>
                {classroom}
              </option>
            ))}
          </select>
        </div>
      )}

      {topList.length === 0 ? (
        <p className="empty-state">
          Nenhum estudante optou por participar do ranking neste filtro.
        </p>
      ) : (
        <>
          <div className="podium">
            {podiumOrder.map(({ student, place }) => {
              const Icon = place === 1 ? Crown : Medal;
              return (
                <motion.button
                  layout
                  type="button"
                  key={student.id}
                  className={`podium-person place-${place}`}
                  onClick={() => setSelectedStudent(student)}
                  aria-label={`${place}º lugar: ${student.name}, ${student.xp} XP. Ver perfil`}
                >
                  <PhotoAvatar student={student} size="podium-avatar" />
                  <Icon className="podium-medal" size={20} aria-hidden="true" />
                  <b>{student.name}</b>
                  <small>
                    {student.course} · {student.classroom}
                  </small>
                  <span>{student.xp} XP</span>
                  <div className="podium-base" aria-hidden="true">
                    {place}º
                  </div>
                </motion.button>
              );
            })}
          </div>

          {others.length > 0 && (
            <div className="rank-list">
              {others.map((student, index) => {
                const barWidth = Math.min(100, Math.max(12, Math.round((student.xp / maxXp) * 100)));
                return (
                  <motion.button
                    layout
                    type="button"
                    className={`rank-row ${student.id === self?.id ? 'is-self' : ''}`}
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <span className="rank-number">{index + 4}º</span>
                    <PhotoAvatar student={student} size="rank-avatar" />
                    <div className="rank-name">
                      <b>{student.name}</b>
                      <small>
                        {student.course} · {student.classroom}
                      </small>
                      <span className="rank-bar" aria-hidden="true">
                        <span style={{ width: `${barWidth}%` }} />
                      </span>
                    </div>
                    <strong>{student.xp} XP</strong>
                  </motion.button>
                );
              })}
            </div>
          )}
        </>
      )}

      {self && (
        <div className="my-rank">
          <PhotoAvatar student={self} size="rank-avatar" />
          <div>
            {!self.rankingOptIn ? (
              <>
                <b>Participação no ranking desativada</b>
                <small>
                  Ative o opt-in nas preferências da sua carteira para aparecer na classificação.
                </small>
              </>
            ) : ownIndex === -1 ? (
              <>
                <b>Fora deste recorte de filtro</b>
                <small>
                  Sua turma atual é {self.classroom}. Selecione &ldquo;Geral&rdquo; ou &ldquo;Minha
                  Sala&rdquo; para ver sua posição.
                </small>
              </>
            ) : (
              <>
                <b>Sua posição: Nº {ownIndex + 1}</b>
                <small>
                  {ownIndex === 0
                    ? 'Você está na liderança deste ranking!'
                    : `${Math.max(0, (studentAbove?.xp ?? self.xp) - self.xp)} XP para alcançar o ${ownIndex}º lugar`}
                </small>
              </>
            )}
          </div>
          <strong>{self.xp} XP</strong>
        </div>
      )}

      {selectedStudent && (
        <div
          className="profile-backdrop"
          onClick={() => setSelectedStudent(null)}
          role="presentation"
        >
          <div
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="profile-close"
              onClick={() => setSelectedStudent(null)}
              aria-label="Fechar perfil"
            >
              <X size={18} />
            </button>
            <PhotoAvatar student={selectedStudent} size="profile-avatar" />
            <h3 id="profile-modal-title">{selectedStudent.name}</h3>
            <p>
              {selectedStudent.course} · {selectedStudent.classroom}
            </p>
            <b>{selectedStudent.xp} XP</b>
            <div className="achievements-list">
              {(selectedStudent.achievements || []).map((achievement) => (
                <span className="achievement" key={achievement}>
                  {achievement}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="rank-privacy">
        <ShieldCheck size={15} aria-hidden="true" /> Apenas engajamento (XP) é público por opt-in;
        dados financeiros e acadêmicos permanecem privados.
      </p>
    </section>
  );
}
