import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  Briefcase,
  Check,
  ChevronRight,
  ClipboardList,
  Home,
  LogOut,
  Search,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import PhotoAvatar from '../components/PhotoAvatar.jsx';
import { useDemoStore } from '../store/useDemoStore.js';
import { formatCDU, formatDateTime } from '../utils/format.js';

const TEACHER_PAGES = [
  { name: 'Painel', icon: Home },
  { name: 'Estudantes', icon: Users },
  { name: 'Emissões', icon: Wallet },
  { name: 'Missões', icon: BadgeCheck },
  { name: 'Pedidos', icon: ClipboardList },
  { name: 'Auditoria', icon: ShieldCheck },
];

const ORDER_STATUS_LABELS = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Recusado',
};

export default function TeacherArea({ onLogout, onNotify }) {
  const [tab, setTab] = useState('Painel');
  const [searchTerm, setSearchTerm] = useState('');
  const [notice, setNotice] = useState('');

  const students = useDemoStore((state) => state.students);
  const staff = useDemoStore((state) => state.staff);
  const activeStaffId = useDemoStore((state) => state.activeStaffId);
  const orders = useDemoStore((state) => state.orders);
  const missions = useDemoStore((state) => state.missions);
  const missionCompletions = useDemoStore((state) => state.missionCompletions);
  const issuances = useDemoStore((state) => state.issuances);
  const audit = useDemoStore((state) => state.audit);

  const issueCredit = useDemoStore((state) => state.issueCredit);
  const approveOrder = useDemoStore((state) => state.approveOrder);
  const rejectOrder = useDemoStore((state) => state.rejectOrder);

  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id || '');
  const [eventId, setEventId] = useState('');
  const [action, setAction] = useState('');
  const [amount, setAmount] = useState('');

  const activeStaff = useMemo(
    () => staff.find((member) => member.id === activeStaffId) || staff[0],
    [staff, activeStaffId]
  );

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) =>
      `${student.name} ${student.enrollment} ${student.course} ${student.classroom}`
        .toLowerCase()
        .includes(query)
    );
  }, [students, searchTerm]);

  const pendingOrdersCount = useMemo(
    () => orders.filter((order) => order.status === 'pending').length,
    [orders]
  );

  const totalIssued = useMemo(
    () => issuances.reduce((sum, entry) => sum + entry.amount, 0),
    [issuances]
  );

  const handleIssueSubmit = (event) => {
    event.preventDefault();
    const result = issueCredit({
      studentId: targetStudentId || students[0]?.id,
      eventId,
      action,
      amount,
    });

    if (result.error) {
      setNotice(result.error);
      onNotify?.(result.error, 'error');
      return;
    }

    const message = `Emissão de ${formatCDU(result.entry.amount)} registrada para ${result.entry.studentName} e auditada.`;
    setNotice(message);
    onNotify?.(message, 'success');
    setEventId('');
    setAction('');
    setAmount('');
  };

  const handleApproveOrder = (orderId) => {
    const result = approveOrder(orderId);
    if (result.error) {
      onNotify?.(result.error, 'error');
      return;
    }
    onNotify?.('Pedido aprovado! Reserva convertida em débito auditado.', 'success');
  };

  const handleRejectOrder = (orderId) => {
    const result = rejectOrder(orderId);
    if (result.error) {
      onNotify?.(result.error, 'error');
      return;
    }
    onNotify?.('Pedido recusado! Valor devolvido ao saldo disponível do estudante.', 'info');
  };

  return (
    <div className="teacher-shell">
      <header className="teacher-top">
        <div className="teacher-brand">
          <span className="brand-mark" aria-hidden="true">
            B
          </span>
          <b>
            BANESC <small>Área do professor / servidor</small>
          </b>
        </div>

        <span className="teacher-mode">
          <Briefcase size={15} aria-hidden="true" />
          <span>
            {activeStaff.name} · {activeStaff.role}
          </span>
        </span>

        <button type="button" onClick={onLogout}>
          <LogOut size={14} aria-hidden="true" /> Sair da área
        </button>
      </header>

      <div className="teacher-layout">
        <aside className="teacher-nav" aria-label="Menu administrativo">
          {TEACHER_PAGES.map(({ name, icon: Icon }) => (
            <button
              type="button"
              key={name}
              className={tab === name ? 'active' : ''}
              aria-current={tab === name ? 'page' : undefined}
              onClick={() => {
                setTab(name);
                setNotice('');
              }}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{name}</span>
              {name === 'Pedidos' && pendingOrdersCount > 0 && (
                <span className="nav-badge">{pendingOrdersCount}</span>
              )}
            </button>
          ))}

          <button
            type="button"
            className="readonly-switch"
            onClick={() =>
              onNotify?.(
                'A visualização do estudante é somente leitura a partir do painel administrativo. Saia para entrar como estudante.',
                'info'
              )
            }
          >
            Visualizar como estudante
          </button>
        </aside>

        <main className="teacher-content">
          <div className="teacher-title">
            <div>
              <span className="eyebrow">ADMINISTRAÇÃO ESCOLAR</span>
              <h1>{tab}</h1>
              <p>
                Ações de demonstração são fictícias, auditadas e registradas localmente em nome de{' '}
                <b>{activeStaff.name}</b>.
              </p>
            </div>
          </div>

          {tab === 'Painel' && (
            <>
              <div className="admin-stats">
                <div>
                  <small>Estudantes</small>
                  <b>{students.length}</b>
                </div>
                <div>
                  <small>Pedidos pendentes</small>
                  <b>{pendingOrdersCount}</b>
                </div>
                <div>
                  <small>Missões</small>
                  <b>{missions.length}</b>
                </div>
                <div>
                  <small>CDU emitidos</small>
                  <b>{formatCDU(totalIssued)}</b>
                </div>
              </div>

              <div className="admin-shortcuts">
                {['Estudantes', 'Emissões', 'Missões', 'Pedidos'].map((sectionName) => (
                  <button type="button" key={sectionName} onClick={() => setTab(sectionName)}>
                    <span>{sectionName}</span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </>
          )}

          {tab === 'Estudantes' && (
            <section className="admin-table" aria-labelledby="students-table-heading">
              <div className="admin-table-head">
                <b id="students-table-heading">
                  Estudantes fictícios ({filteredStudents.length})
                </b>
                <label className="search-field">
                  <Search size={15} aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Buscar por nome, matrícula ou turma"
                    aria-label="Buscar estudante"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </label>
              </div>

              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <div className="admin-row" key={student.id}>
                    <PhotoAvatar student={student} size="rank-avatar" />
                    <span>
                      <b>{student.name}</b>
                      <small>
                        {student.enrollment} · {student.course} · {student.classroom}
                      </small>
                    </span>
                    <strong>{student.xp} XP</strong>
                  </div>
                ))
              ) : (
                <p className="empty-state">Nenhum estudante encontrado para &ldquo;{searchTerm}&rdquo;.</p>
              )}
            </section>
          )}

          {tab === 'Emissões' && (
            <div className="teacher-stack">
              <section className="admin-form" aria-labelledby="issue-form-heading">
                <h2 id="issue-form-heading">Lançar emissão de CDU</h2>
                <p>
                  O ID do evento deve ser único para impedir duplicidade. Responsável:{' '}
                  <b>{activeStaff.name}</b>.
                </p>

                <form onSubmit={handleIssueSubmit}>
                  <label htmlFor="issue-student">
                    Estudante destinatário
                    <select
                      id="issue-student"
                      value={targetStudentId}
                      onChange={(event) => setTargetStudentId(event.target.value)}
                    >
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} ({student.enrollment} · {student.classroom})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label htmlFor="issue-event-id">
                    ID único do evento
                    <input
                      id="issue-event-id"
                      required
                      value={eventId}
                      onChange={(event) => setEventId(event.target.value)}
                      placeholder="Ex.: atividade-turma-001"
                    />
                  </label>

                  <label htmlFor="issue-action">
                    Ação / motivo
                    <input
                      id="issue-action"
                      required
                      value={action}
                      onChange={(event) => setAction(event.target.value)}
                      placeholder="Ex.: Participação na Feira de Ciências"
                    />
                  </label>

                  <label htmlFor="issue-amount">
                    Valor em CDU
                    <input
                      id="issue-amount"
                      required
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="Ex.: 50"
                    />
                  </label>

                  <button type="submit" className="login-submit">
                    Registrar emissão
                  </button>
                </form>

                {notice && (
                  <p className="admin-notice" role="status">
                    {notice}
                  </p>
                )}
              </section>

              <section className="admin-table" aria-labelledby="issuances-history-heading">
                <div className="admin-table-head">
                  <b id="issuances-history-heading">Histórico de emissões ({issuances.length})</b>
                </div>

                {issuances.length > 0 ? (
                  issuances.map((entry) => (
                    <div className="admin-row" key={entry.id}>
                      <Wallet size={18} aria-hidden="true" />
                      <span>
                        <b>
                          {entry.action} · {entry.studentName}
                        </b>
                        <small>
                          Evento: {entry.eventId} · Por {entry.responsible} ·{' '}
                          {formatDateTime(entry.date)}
                        </small>
                      </span>
                      <strong>+{formatCDU(entry.amount)}</strong>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">Nenhuma emissão registrada nesta sessão.</p>
                )}
              </section>
            </div>
          )}

          {tab === 'Missões' && (
            <section className="admin-table" aria-labelledby="teacher-missions-heading">
              <div className="admin-table-head">
                <b id="teacher-missions-heading">Catálogo de missões ({missions.length})</b>
                <span className="count">{missionCompletions.length} conclusões simuladas</span>
              </div>

              {missions.map((mission) => {
                const count = missionCompletions.filter(
                  (entry) => entry.missionId === mission.id
                ).length;

                return (
                  <div className="admin-row" key={mission.id}>
                    <BadgeCheck size={18} aria-hidden="true" />
                    <span>
                      <b>{mission.title}</b>
                      <small>
                        {mission.category} · Recompensa: {formatCDU(mission.reward)} · +
                        {mission.xpReward || 20} XP · {count}{' '}
                        {count === 1 ? 'conclusão' : 'conclusões'}
                      </small>
                    </span>
                    <span className="status-badge status-approved">{mission.status}</span>
                  </div>
                );
              })}
            </section>
          )}

          {tab === 'Pedidos' && (
            <section className="admin-table" aria-labelledby="teacher-orders-heading">
              <div className="admin-table-head">
                <b id="teacher-orders-heading">Pedidos de benefícios ({orders.length})</b>
                <span className="count">{pendingOrdersCount} pendentes</span>
              </div>

              {orders.length > 0 ? (
                orders.map((order) => (
                  <div className="admin-row order-row" key={order.id}>
                    <ClipboardList size={18} aria-hidden="true" />
                    <span>
                      <b>
                        {order.itemName || order.itemId} · {order.studentName}
                      </b>
                      <small>
                        Criado em {formatDateTime(order.createdAt)}
                        {order.decidedBy ? ` · Decisão: ${order.decidedBy}` : ''}
                      </small>
                    </span>
                    <span className={`status-badge status-${order.status}`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                    <strong>{formatCDU(order.amount)}</strong>

                    {order.status === 'pending' && (
                      <div className="order-actions">
                        <button
                          type="button"
                          className="approve-btn"
                          onClick={() => handleApproveOrder(order.id)}
                        >
                          <Check size={15} aria-hidden="true" /> Aprovar
                        </button>
                        <button
                          type="button"
                          className="reject-btn"
                          onClick={() => handleRejectOrder(order.id)}
                        >
                          <X size={15} aria-hidden="true" /> Recusar
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="empty-state">
                  Nenhum pedido registrado. Solicite um item de Direção de Ensino na área do
                  estudante para testar o fluxo de aprovação.
                </p>
              )}
            </section>
          )}

          {tab === 'Auditoria' && (
            <section className="admin-table" aria-labelledby="audit-heading">
              <div className="admin-table-head">
                <b id="audit-heading">Registro de auditoria ({audit.length})</b>
              </div>

              {audit.length > 0 ? (
                audit.map((entry) => (
                  <div className="admin-row" key={entry.id}>
                    <ShieldCheck size={18} aria-hidden="true" />
                    <span>
                      <b>{entry.action}</b>
                      <small>
                        {entry.detail} · Responsável: {entry.actorName || entry.actorId} ·{' '}
                        {formatDateTime(entry.at)}
                      </small>
                    </span>
                  </div>
                ))
              ) : (
                <p className="empty-state">Nenhuma ação registrada na auditoria ainda.</p>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
