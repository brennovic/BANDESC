import { CheckCircle2, Target } from 'lucide-react';
import { formatCDU } from '../utils/format.js';

export default function MissionsSection({ missions, completions, accountId, onCompleteMission }) {
  const completedIds = new Set(
    completions.filter((entry) => entry.accountId === accountId).map((entry) => entry.missionId)
  );

  return (
    <section className="missions-section" aria-labelledby="missions-heading">
      <div className="section-heading">
        <div>
          <h2 id="missions-heading">Missões educativas</h2>
          <p>Conclua desafios simulados para ganhar CDU e XP (uma conclusão por missão)</p>
        </div>
        <span className="count">
          {completedIds.size}/{missions.length} concluídas
        </span>
      </div>

      <div className="missions-grid">
        {missions.map((mission) => {
          const isDone = completedIds.has(mission.id);
          return (
            <article className={`mission-card ${isDone ? 'done' : ''}`} key={mission.id}>
              <div className="mission-card-top">
                <span className="mission-badge">{mission.category}</span>
                <span className="mission-reward">
                  +{formatCDU(mission.reward)} · +{mission.xpReward || 20} XP
                </span>
              </div>

              <h3>{mission.title}</h3>

              <button
                type="button"
                disabled={isDone}
                onClick={() => onCompleteMission(mission.id)}
              >
                {isDone ? (
                  <>
                    <CheckCircle2 size={15} aria-hidden="true" /> Concluída
                  </>
                ) : (
                  <>
                    <Target size={15} aria-hidden="true" /> Simular conclusão
                  </>
                )}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
