import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  Home,
  Lock,
  LogOut,
  PiggyBank,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Trophy,
  Unlock,
  Wallet,
} from 'lucide-react';
import EventsSection from '../components/EventsSection.jsx';
import MissionsSection from '../components/MissionsSection.jsx';
import PhotoAvatar from '../components/PhotoAvatar.jsx';
import ProductCard from '../components/ProductCard.jsx';
import RankingPanel from '../components/RankingPanel.jsx';
import { useDemoStore } from '../store/useDemoStore.js';
import { formatCDU, formatDateTime } from '../utils/format.js';

const NAV_ITEMS = [
  { label: 'Início', icon: Home },
  { label: 'Carteira', icon: Wallet },
  { label: 'Ranking', icon: Trophy },
  { label: 'Loja', icon: ShoppingBag },
];

const ORDER_STATUS_LABELS = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Recusado',
};

export default function StudentArea({ onLogout, onNotify }) {
  const [tab, setTab] = useState('Início');
  const [storeCategory, setStoreCategory] = useState('Todos');
  const [reserveGoal, setReserveGoal] = useState('');
  const [reserveAmount, setReserveAmount] = useState('');
  const [photoInput, setPhotoInput] = useState('');
  const reserveInputRef = useRef(null);

  const account = useDemoStore((state) => state.account);
  const students = useDemoStore((state) => state.students);
  const catalog = useDemoStore((state) => state.catalog);
  const events = useDemoStore((state) => state.events);
  const missions = useDemoStore((state) => state.missions);
  const eventAttendance = useDemoStore((state) => state.eventAttendance);
  const missionCompletions = useDemoStore((state) => state.missionCompletions);
  const reserves = useDemoStore((state) => state.reserves);
  const orders = useDemoStore((state) => state.orders);

  const confirmEvent = useDemoStore((state) => state.confirmEvent);
  const completeMission = useDemoStore((state) => state.completeMission);
  const purchase = useDemoStore((state) => state.purchase);
  const createReserve = useDemoStore((state) => state.createReserve);
  const redeemReserve = useDemoStore((state) => state.redeemReserve);
  const setPhoto = useDemoStore((state) => state.setPhoto);
  const setPrivacyPreferences = useDemoStore((state) => state.setPrivacyPreferences);
  const reset = useDemoStore((state) => state.reset);

  const currentStudent = useMemo(
    () => students.find((student) => student.id === account.id) || students[0],
    [students, account.id]
  );

  const categories = useMemo(
    () => ['Todos', ...new Set(catalog.map((item) => item.category))],
    [catalog]
  );

  const filteredCatalog = useMemo(
    () =>
      storeCategory === 'Todos'
        ? catalog
        : catalog.filter((item) => item.category === storeCategory),
    [catalog, storeCategory]
  );

  const activeReserves = useMemo(
    () => reserves.filter((entry) => entry.accountId === account.id && entry.status === 'active'),
    [reserves, account.id]
  );

  const studentOrders = useMemo(
    () => orders.filter((entry) => entry.accountId === account.id),
    [orders, account.id]
  );

  const handleBuy = (item) => {
    const result = purchase(item.id);
    if (result.error) {
      onNotify(result.error, 'error');
      return;
    }
    if (result.requiresApproval) {
      onNotify(
        `Pedido enviado para aprovação! ${formatCDU(item.price)} reservados até a decisão.`,
        'info'
      );
      return;
    }
    onNotify(`Compra confirmada! ${formatCDU(item.price)} debitados.`, 'success');
  };

  const handleConfirmEvent = (eventId) => {
    const result = confirmEvent(eventId);
    if (result?.error) {
      onNotify(result.error, 'error');
      return;
    }
    onNotify(
      `Presença confirmada! +${formatCDU(result.event.bonus)} e +${result.xpGain} XP creditados.`,
      'success'
    );
  };

  const handleCompleteMission = (missionId) => {
    const result = completeMission(missionId);
    if (result?.error) {
      onNotify(result.error, 'error');
      return;
    }
    onNotify(
      `Missão concluída! +${formatCDU(result.mission.reward)} e +${result.xpGain} XP creditados.`,
      'success'
    );
  };

  const handleCreateReserve = (event) => {
    event.preventDefault();
    const result = createReserve({ goal: reserveGoal, amount: reserveAmount });
    if (result.error) {
      onNotify(result.error, 'error');
      return;
    }
    setReserveGoal('');
    setReserveAmount('');
    onNotify(`Reserva "${result.reserve.goal}" criada (${formatCDU(result.reserve.amount)}).`, 'success');
  };

  const handleRedeemReserve = (reserveId) => {
    const result = redeemReserve(reserveId);
    if (result.error) {
      onNotify(result.error, 'error');
      return;
    }
    onNotify(
      `Reserva "${result.reserve.goal}" resgatada para o saldo disponível.`,
      'success'
    );
  };

  const handleOpenReserves = () => {
    setTab('Carteira');
    requestAnimationFrame(() => {
      reserveInputRef.current?.focus();
    });
  };

  const handleSavePhoto = (event) => {
    event.preventDefault();
    setPhoto(account.id, photoInput);
    onNotify(
      photoInput.trim() ? 'Foto de perfil atualizada na demonstração.' : 'Foto removida.',
      'success'
    );
  };

  const handleTogglePrivacy = (field, nextValue) => {
    setPrivacyPreferences(account.id, { [field]: nextValue });
    onNotify('Preferência de privacidade atualizada.', 'info');
  };

  const handleReset = () => {
    reset();
    setPhotoInput('');
    setReserveGoal('');
    setReserveAmount('');
    onNotify('Demonstração reiniciada para os dados iniciais.', 'info');
  };

  return (
    <div className="app-shell">
      <div className="demo-ribbon">
        <ShieldCheck size={15} aria-hidden="true" />
        <span className="ribbon-text">
          SISTEMA 100% EDUCATIVO. APENAS O ENGAJAMENTO (XP) É PÚBLICO; O SALDO DE CADA ALUNO É
          PRIVADO.
        </span>
        <button type="button" onClick={handleReset} aria-label="Reiniciar demonstração">
          <RotateCcw size={14} aria-hidden="true" />
          <span className="ribbon-btn-label">Reiniciar demonstração</span>
        </button>
      </div>

      <aside className="sidebar" aria-label="Menu do estudante">
        <button type="button" className="brand brand-button" onClick={() => setTab('Início')}>
          <span className="brand-mark" aria-hidden="true">
            B
          </span>
          <span>
            BANESC
            <small>Banco Escolar</small>
          </span>
        </button>

        <div className="side-label">MENU</div>

        <nav className="side-nav" aria-label="Seções principais">
          {NAV_ITEMS.map(({ label, icon: Icon }) => (
            <button
              type="button"
              key={label}
              className={`nav-item ${tab === label ? 'active' : ''}`}
              aria-current={tab === label ? 'page' : undefined}
              onClick={() => setTab(label)}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
              {tab === label && <ChevronRight className="nav-arrow" size={15} aria-hidden="true" />}
            </button>
          ))}
        </nav>

        <div className="side-help">
          <CircleHelp size={18} aria-hidden="true" />
          <div>
            <b>Aprenda fazendo</b>
            <small>Explore o banco escolar de forma segura.</small>
          </div>
        </div>

        <div className="user-mini">
          <PhotoAvatar student={currentStudent} size="mini-avatar" />
          <div className="user-mini-copy">
            <b>{account.nickname}</b>
            <small>{account.classroom}</small>
          </div>
          <button
            type="button"
            className="logout-icon-btn"
            onClick={onLogout}
            aria-label="Sair da conta"
            title="Sair"
          >
            <LogOut size={16} aria-hidden="true" />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark" aria-hidden="true">
              B
            </span>
            <span>BANESC</span>
          </div>

          <span className="breadcrumb">
            Área do estudante <span aria-hidden="true">/</span> {tab}
          </span>

          <div className="top-right">
            <span className="status">
              <i aria-hidden="true" /> Conta ativa
            </span>
            <PhotoAvatar student={currentStudent} size="mini-avatar" />
            <button type="button" className="topbar-logout" onClick={onLogout}>
              <LogOut size={15} aria-hidden="true" />
              <span>Sair</span>
            </button>
          </div>
        </header>

        <div className="content">
          <div className="welcome">
            <PhotoAvatar student={currentStudent} size="large" />
            <div className="welcome-copy">
              <div className="eyebrow">ÁREA DO ESTUDANTE</div>
              <h1>{tab === 'Início' ? `Olá, ${account.nickname}!` : tab}</h1>
              <p>
                {account.classroom} · Matrícula {account.number}
              </p>
            </div>
            <button type="button" className="welcome-balance" onClick={() => setTab('Carteira')}>
              <span>CARTEIRA · SALDO PRIVADO</span>
              <b>{formatCDU(account.available)}</b>
              <small>
                Ver carteira <ChevronRight size={13} aria-hidden="true" />
              </small>
            </button>
          </div>

          {tab === 'Início' && (
            <>
              <RankingPanel students={students} selfId={account.id} />

              <div className="balance-grid">
                <motion.section
                  className="balance-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="card-top">
                    <span>Saldo disponível</span>
                    <span className="wallet-icon" aria-hidden="true">
                      <Wallet size={18} />
                    </span>
                  </div>
                  <div className="balance">{formatCDU(account.available)}</div>
                  <div className="balance-sub">Pronto para usar em benefícios educativos</div>
                  <div className="card-footer">
                    <span>
                      <i aria-hidden="true" /> Simulado
                    </span>
                    <span>Atualizado agora</span>
                  </div>
                </motion.section>

                <section className="reserved-card">
                  <div className="card-top">
                    <span>Saldo reservado</span>
                    <span className="reserved-icon" aria-hidden="true">
                      <BadgeCheck size={18} />
                    </span>
                  </div>
                  <div className="balance dark">{formatCDU(account.reserved)}</div>
                  <div className="balance-sub">Guardado para metas e pedidos pendentes</div>
                  <button type="button" className="text-link" onClick={handleOpenReserves}>
                    Gerenciar BANESC Reserva <ChevronRight size={15} aria-hidden="true" />
                  </button>
                </section>
              </div>

              <div className="section-heading">
                <div>
                  <h2>Acesso rápido</h2>
                  <p>O que você gostaria de fazer agora?</p>
                </div>
              </div>

              <div className="quick-grid">
                <button type="button" onClick={() => setTab('Loja')}>
                  <span className="quick-icon green" aria-hidden="true">
                    <ShoppingBag size={17} />
                  </span>
                  <b>Ver loja</b>
                  <small>Benefícios disponíveis</small>
                  <ChevronRight className="quick-chevron" size={17} aria-hidden="true" />
                </button>

                <button type="button" onClick={() => setTab('Carteira')}>
                  <span className="quick-icon blue" aria-hidden="true">
                    <BookOpen size={17} />
                  </span>
                  <b>Minha carteira</b>
                  <small>Extrato, pedidos e privacidade</small>
                  <ChevronRight className="quick-chevron" size={17} aria-hidden="true" />
                </button>

                <button type="button" onClick={handleOpenReserves}>
                  <span className="quick-icon amber" aria-hidden="true">
                    <CreditCard size={17} />
                  </span>
                  <b>Guardar CDU</b>
                  <small>Planeje uma meta de reserva</small>
                  <ChevronRight className="quick-chevron" size={17} aria-hidden="true" />
                </button>
              </div>

              <EventsSection
                events={events}
                attendance={eventAttendance}
                studentId={account.id}
                onConfirmEvent={handleConfirmEvent}
              />

              <MissionsSection
                missions={missions}
                completions={missionCompletions}
                accountId={account.id}
                onCompleteMission={handleCompleteMission}
              />

              <div className="section-heading product-title">
                <div>
                  <h2>Em destaque</h2>
                  <p>Benefícios educativos para você</p>
                </div>
                <button type="button" className="link-button" onClick={() => setTab('Loja')}>
                  Ver loja <ChevronRight size={15} aria-hidden="true" />
                </button>
              </div>

              <div className="product-grid">
                {catalog.slice(0, 2).map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    availableBalance={account.available}
                    onBuy={handleBuy}
                  />
                ))}
              </div>

              <div className="tip">
                <span aria-hidden="true">✦</span>
                <div>
                  <b>Dica financeira</b>
                  <p>
                    Antes de gastar, pense no que é prioridade para você. Reservar parte dos seus
                    CDU ajuda a alcançar metas maiores sem comprometer o saldo.
                  </p>
                </div>
              </div>
            </>
          )}

          {tab === 'Loja' && (
            <section aria-labelledby="store-heading">
              <div className="section-heading">
                <div>
                  <h2 id="store-heading">Catálogo de benefícios</h2>
                  <p>
                    Itens de Direção de Ensino reservam o valor até a aprovação de um servidor.
                  </p>
                </div>
                <span className="count">{filteredCatalog.length} itens</span>
              </div>

              <div className="category-pills" role="group" aria-label="Filtrar por categoria">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`category-pill ${storeCategory === category ? 'active' : ''}`}
                    onClick={() => setStoreCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="product-grid catalog-grid">
                {filteredCatalog.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    availableBalance={account.available}
                    onBuy={handleBuy}
                  />
                ))}
              </div>
            </section>
          )}

          {tab === 'Carteira' && (
            <div className="wallet-stack">
              <div className="balance-grid">
                <section className="balance-card">
                  <div className="card-top">
                    <span>Saldo disponível</span>
                    <span className="wallet-icon" aria-hidden="true">
                      <Wallet size={18} />
                    </span>
                  </div>
                  <div className="balance">{formatCDU(account.available)}</div>
                  <div className="balance-sub">Livre para compras ou novas reservas</div>
                </section>

                <section className="reserved-card">
                  <div className="card-top">
                    <span>Saldo reservado</span>
                    <span className="reserved-icon" aria-hidden="true">
                      <PiggyBank size={18} />
                    </span>
                  </div>
                  <div className="balance dark">{formatCDU(account.reserved)}</div>
                  <div className="balance-sub">
                    Inclui metas ativas e pedidos aguardando aprovação
                  </div>
                </section>
              </div>

              <section className="panel-card" aria-labelledby="reserves-heading">
                <div className="statement-head">
                  <div>
                    <h2 id="reserves-heading">BANESC Reserva (Metas)</h2>
                    <p>Separe CDU do saldo disponível para planejar objetivos maiores</p>
                  </div>
                  <span className="count">{activeReserves.length} ativas</span>
                </div>

                <form className="inline-form" onSubmit={handleCreateReserve}>
                  <label>
                    Nome da meta
                    <input
                      ref={reserveInputRef}
                      type="text"
                      required
                      placeholder="Ex.: Mochila institucional"
                      value={reserveGoal}
                      onChange={(event) => setReserveGoal(event.target.value)}
                    />
                  </label>
                  <label>
                    Valor em CDU
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Ex.: 50"
                      value={reserveAmount}
                      onChange={(event) => setReserveAmount(event.target.value)}
                    />
                  </label>
                  <button type="submit" className="primary-btn">
                    <PiggyBank size={16} aria-hidden="true" /> Reservar CDU
                  </button>
                </form>

                {activeReserves.length > 0 ? (
                  <div className="list-rows">
                    {activeReserves.map((reserve) => (
                      <div className="list-row" key={reserve.id}>
                        <span className="tx-icon reserve" aria-hidden="true">
                          <Lock size={16} />
                        </span>
                        <div className="tx-desc">
                          <b>{reserve.goal}</b>
                          <small>Criada em {formatDateTime(reserve.createdAt)}</small>
                        </div>
                        <strong className="reserve">{formatCDU(reserve.amount)}</strong>
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => handleRedeemReserve(reserve.id)}
                        >
                          <Unlock size={14} aria-hidden="true" /> Resgatar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">Nenhuma reserva de meta ativa no momento.</p>
                )}
              </section>

              <section className="panel-card" aria-labelledby="student-orders-heading">
                <div className="statement-head">
                  <div>
                    <h2 id="student-orders-heading">Meus pedidos com aprovação</h2>
                    <p>Acompanhe solicitações enviadas à Direção de Ensino</p>
                  </div>
                  <span className="count">{studentOrders.length} pedidos</span>
                </div>

                {studentOrders.length > 0 ? (
                  <div className="list-rows">
                    {studentOrders.map((order) => (
                      <div className="list-row" key={order.id}>
                        <div className="tx-desc">
                          <b>{order.itemName}</b>
                          <small>
                            Solicitado em {formatDateTime(order.createdAt)}
                            {order.decidedBy ? ` · Decisão por ${order.decidedBy}` : ''}
                          </small>
                        </div>
                        <span className={`status-badge status-${order.status}`}>
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                        <strong>{formatCDU(order.amount)}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">
                    Você ainda não solicitou itens que exigem aprovação.
                  </p>
                )}
              </section>

              <section className="panel-card" aria-labelledby="privacy-heading">
                <div className="statement-head">
                  <div>
                    <h2 id="privacy-heading">Preferências de privacidade</h2>
                    <p>Controle sua participação no ranking público e exibição de avatar</p>
                  </div>
                </div>

                <div className="privacy-controls">
                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      checked={Boolean(currentStudent?.rankingOptIn)}
                      onChange={(event) =>
                        handleTogglePrivacy('rankingOptIn', event.target.checked)
                      }
                    />
                    <span>
                      <b>Participar do Ranking de Engajamento (opt-in)</b>
                      <small>Exibe apenas seu nome, turma e XP. Saldo continua privado.</small>
                    </span>
                  </label>

                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      checked={Boolean(currentStudent?.autorizouFoto)}
                      onChange={(event) =>
                        handleTogglePrivacy('autorizouFoto', event.target.checked)
                      }
                    />
                    <span>
                      <b>Autorizar exibição de imagem de perfil</b>
                      <small>Quando desativado, apenas suas iniciais são exibidas.</small>
                    </span>
                  </label>

                  <form className="inline-form photo-form" onSubmit={handleSavePhoto}>
                    <label>
                      URL da imagem de avatar (opcional, fictícia)
                      <input
                        type="url"
                        placeholder="https://exemplo.com/avatar.png"
                        value={photoInput}
                        onChange={(event) => setPhotoInput(event.target.value)}
                      />
                    </label>
                    <button type="submit" className="secondary-btn">
                      Salvar foto
                    </button>
                  </form>
                </div>
              </section>

              <section className="statement" aria-labelledby="statement-heading">
                <div className="statement-head">
                  <div>
                    <h2 id="statement-heading">Movimentações</h2>
                    <p>Histórico completo e auditável da sua conta de demonstração</p>
                  </div>
                  <span className="count">{account.transactions.length} registros</span>
                </div>

                {account.transactions.map((tx) => {
                  const isCreditLike = tx.type === 'credit' || tx.type === 'release';
                  const prefix =
                    tx.type === 'credit'
                      ? '+'
                      : tx.type === 'debit'
                        ? '−'
                        : tx.type === 'reserve'
                          ? '⇄ '
                          : '+';

                  return (
                    <div className="transaction" key={tx.id}>
                      <span className={`tx-icon ${tx.type}`} aria-hidden="true">
                        {tx.type === 'reserve' ? (
                          <Lock size={16} />
                        ) : tx.type === 'release' ? (
                          <Unlock size={16} />
                        ) : isCreditLike ? (
                          <ArrowDownLeft size={18} />
                        ) : (
                          <ArrowUpRight size={18} />
                        )}
                      </span>
                      <div className="tx-desc">
                        <b>{tx.label}</b>
                        <small>
                          <Clock3 size={12} aria-hidden="true" /> {formatDateTime(tx.date)}
                        </small>
                      </div>
                      <strong className={tx.type}>
                        {prefix}
                        {formatCDU(tx.amount)}
                      </strong>
                    </div>
                  );
                })}
              </section>
            </div>
          )}

          {tab === 'Ranking' && <RankingPanel students={students} selfId={account.id} />}

          <footer>
            <span>Projeto educacional · IFPI Campus Piripiri</span>
            <span>© BANESC · Ambiente fictício</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
