import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { formatCDU, formatEventDate } from '../utils/format.js';

export default function EventsSection({ events, attendance, studentId, onConfirmEvent }) {
  const confirmedIds = new Set(
    attendance.filter((entry) => entry.studentId === studentId).map((entry) => entry.eventId)
  );

  return (
    <section className="events-section" aria-labelledby="events-heading">
      <div className="section-heading">
        <div>
          <h2 id="events-heading">Agenda de eventos</h2>
          <p>Confirme presença para somar CDU e XP na demonstração</p>
        </div>
      </div>

      <div className="events-grid">
        {events.map((event) => {
          const isConfirmed = confirmedIds.has(event.id);
          return (
            <article className="event-card" key={event.id}>
              <div className="event-card-top">
                <span className="event-icon" aria-hidden="true">
                  <CalendarDays size={18} />
                </span>
                <span className="event-bonus">
                  +{formatCDU(event.bonus)} · +{event.xpBonus || 10} XP
                </span>
              </div>

              <h3>{event.title}</h3>
              <small>
                {formatEventDate(event.date)} · {event.time}
              </small>

              <button
                type="button"
                disabled={isConfirmed}
                onClick={() => onConfirmEvent(event.id)}
              >
                {isConfirmed ? (
                  <>
                    <CheckCircle2 size={15} aria-hidden="true" /> Presença confirmada
                  </>
                ) : (
                  'Confirmar presença'
                )}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
