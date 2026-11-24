import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { catalog, demoAccount, events, missions, staff, students } from '../data/demo.js';

const clone = (value) => structuredClone(value);

const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const makeInitialState = () => ({
  account: clone(demoAccount),
  students: clone(students),
  staff: clone(staff),
  catalog: clone(catalog),
  missions: clone(missions),
  events: clone(events),
  issuances: [],
  orders: [],
  reserves: [],
  missionCompletions: [],
  eventAttendance: [],
  audit: [],
  activeRole: 'student',
  activeStaffId: staff[0].id,
});

function getActiveStaff(state) {
  return state.staff.find((member) => member.id === state.activeStaffId) || state.staff[0];
}

function makeAuditEntry(state, { action, targetId = null, detail = '', overrideActor = null }) {
  const staffMember = getActiveStaff(state);
  const actorRole = overrideActor?.role || state.activeRole;
  const actorId =
    overrideActor?.id || (actorRole === 'teacher' ? staffMember.id : state.account.id);
  const actorName =
    overrideActor?.name || (actorRole === 'teacher' ? staffMember.name : state.account.name);

  return {
    id: createId(),
    actorRole,
    actorId,
    actorName,
    action,
    targetId,
    detail,
    at: new Date().toISOString(),
  };
}

// Store local para demonstração. As mesmas ações podem ser conectadas a serviços Supabase futuramente.
export const useDemoStore = create(
  persist(
    (set, get) => ({
      ...makeInitialState(),

      reset: () =>
        set((state) => ({
          ...makeInitialState(),
          activeRole: state.activeRole,
          activeStaffId: state.activeStaffId,
        })),

      setSession: (activeRole, activeStaffId = null) =>
        set((state) => ({
          activeRole,
          activeStaffId: activeStaffId || state.activeStaffId || state.staff[0].id,
        })),

      setRole: (activeRole) => set({ activeRole }),

      recordAudit: (action, targetId = null, detail = '') =>
        set((state) => ({
          audit: [makeAuditEntry(state, { action, targetId, detail }), ...state.audit],
        })),

      setPhoto: (studentId, fotoUrl) =>
        set((state) => {
          const cleanUrl = fotoUrl?.trim() || null;
          return {
            students: state.students.map((student) =>
              student.id === studentId ? { ...student, fotoUrl: cleanUrl } : student
            ),
            audit: [
              makeAuditEntry(state, {
                action: cleanUrl ? 'Foto de perfil atualizada' : 'Foto de perfil removida',
                targetId: studentId,
                detail: cleanUrl ? 'Imagem definida nas preferências' : 'Exibindo iniciais',
              }),
              ...state.audit,
            ],
          };
        }),

      setPrivacyPreferences: (studentId, updates) =>
        set((state) => ({
          students: state.students.map((student) =>
            student.id === studentId ? { ...student, ...updates } : student
          ),
          audit: [
            makeAuditEntry(state, {
              action: 'Preferências de privacidade atualizadas',
              targetId: studentId,
              detail: Object.entries(updates)
                .map(([key, value]) => `${key}: ${value ? 'ativo' : 'inativo'}`)
                .join(' · '),
            }),
            ...state.audit,
          ],
        })),

      confirmEvent: (eventId) => {
        const state = get();
        const alreadyConfirmed = state.eventAttendance.some(
          (entry) => entry.eventId === eventId && entry.studentId === state.account.id
        );
        if (alreadyConfirmed) {
          return { error: 'Sua presença neste evento já foi confirmada.' };
        }

        const event = state.events.find((entry) => entry.id === eventId);
        if (!event) {
          return { error: 'Evento não encontrado.' };
        }

        const now = new Date().toISOString();
        const xpGain = Number(event.xpBonus) || 10;
        const tx = {
          id: createId(),
          type: 'credit',
          label: `Presença em evento: ${event.title}`,
          amount: event.bonus,
          date: now,
          eventId: `evento-${event.id}`,
        };

        set({
          eventAttendance: [
            {
              id: createId(),
              eventId: event.id,
              studentId: state.account.id,
              confirmedAt: now,
            },
            ...state.eventAttendance,
          ],
          account: {
            ...state.account,
            available: state.account.available + event.bonus,
            xp: state.account.xp + xpGain,
            transactions: [tx, ...state.account.transactions],
          },
          students: state.students.map((student) =>
            student.id === state.account.id
              ? {
                  ...student,
                  available: student.available + event.bonus,
                  xp: student.xp + xpGain,
                }
              : student
          ),
          audit: [
            makeAuditEntry(state, {
              action: 'Presença confirmada em evento',
              targetId: event.id,
              detail: `${event.title} (+${event.bonus} CDU, +${xpGain} XP)`,
            }),
            ...state.audit,
          ],
        });

        return { success: true, event, xpGain };
      },

      completeMission: (missionId) => {
        const state = get();
        const alreadyDone = state.missionCompletions.some(
          (entry) => entry.missionId === missionId && entry.accountId === state.account.id
        );
        if (alreadyDone) {
          return { error: 'Esta missão já foi concluída.' };
        }

        const mission = state.missions.find((entry) => entry.id === missionId);
        if (!mission) {
          return { error: 'Missão não encontrada.' };
        }

        const now = new Date().toISOString();
        const xpGain = Number(mission.xpReward) || 20;
        const tx = {
          id: createId(),
          type: 'credit',
          label: `Missão concluída: ${mission.title}`,
          amount: mission.reward,
          date: now,
          eventId: `missao-${mission.id}`,
        };

        set({
          missionCompletions: [
            {
              id: createId(),
              accountId: state.account.id,
              missionId: mission.id,
              title: mission.title,
              reward: mission.reward,
              completedAt: now,
            },
            ...state.missionCompletions,
          ],
          account: {
            ...state.account,
            available: state.account.available + mission.reward,
            xp: state.account.xp + xpGain,
            transactions: [tx, ...state.account.transactions],
          },
          students: state.students.map((student) =>
            student.id === state.account.id
              ? {
                  ...student,
                  available: student.available + mission.reward,
                  xp: student.xp + xpGain,
                }
              : student
          ),
          audit: [
            makeAuditEntry(state, {
              action: 'Missão concluída',
              targetId: mission.id,
              detail: `${mission.title} (+${mission.reward} CDU, +${xpGain} XP)`,
            }),
            ...state.audit,
          ],
        });

        return { success: true, mission, xpGain };
      },

      createReserve: ({ goal, amount }) => {
        const state = get();
        const cleanGoal = String(goal || '').trim();
        const value = Number(amount);

        if (!cleanGoal) {
          return { error: 'Informe o nome da sua meta de reserva.' };
        }
        if (!Number.isFinite(value) || value <= 0) {
          return { error: 'Informe um valor maior que zero para reservar.' };
        }
        if (state.account.available < value) {
          return { error: 'Saldo disponível insuficiente para esta reserva.' };
        }

        const now = new Date().toISOString();
        const reserve = {
          id: createId(),
          accountId: state.account.id,
          goal: cleanGoal,
          amount: value,
          status: 'active',
          createdAt: now,
          redeemedAt: null,
        };
        const tx = {
          id: createId(),
          type: 'reserve',
          label: `Reserva criada: ${cleanGoal}`,
          amount: value,
          date: now,
          reserveId: reserve.id,
        };

        set({
          reserves: [reserve, ...state.reserves],
          account: {
            ...state.account,
            available: state.account.available - value,
            reserved: state.account.reserved + value,
            transactions: [tx, ...state.account.transactions],
          },
          students: state.students.map((student) =>
            student.id === state.account.id
              ? {
                  ...student,
                  available: student.available - value,
                  reserved: student.reserved + value,
                }
              : student
          ),
          audit: [
            makeAuditEntry(state, {
              action: 'Reserva de meta criada',
              targetId: reserve.id,
              detail: `${cleanGoal} (${value} CDU)`,
            }),
            ...state.audit,
          ],
        });

        return { reserve };
      },

      redeemReserve: (reserveId) => {
        const state = get();
        const reserve = state.reserves.find(
          (entry) => entry.id === reserveId && entry.status === 'active'
        );
        if (!reserve) {
          return { error: 'Reserva ativa não encontrada.' };
        }

        const now = new Date().toISOString();
        const tx = {
          id: createId(),
          type: 'release',
          label: `Resgate de reserva: ${reserve.goal}`,
          amount: reserve.amount,
          date: now,
          reserveId: reserve.id,
        };

        set({
          reserves: state.reserves.map((entry) =>
            entry.id === reserveId ? { ...entry, status: 'redeemed', redeemedAt: now } : entry
          ),
          account: {
            ...state.account,
            available: state.account.available + reserve.amount,
            reserved: Math.max(0, state.account.reserved - reserve.amount),
            transactions: [tx, ...state.account.transactions],
          },
          students: state.students.map((student) =>
            student.id === state.account.id
              ? {
                  ...student,
                  available: student.available + reserve.amount,
                  reserved: Math.max(0, student.reserved - reserve.amount),
                }
              : student
          ),
          audit: [
            makeAuditEntry(state, {
              action: 'Reserva resgatada',
              targetId: reserve.id,
              detail: `${reserve.goal} (+${reserve.amount} CDU disponível)`,
            }),
            ...state.audit,
          ],
        });

        return { success: true, reserve };
      },

      issueCredit: ({ studentId, eventId, action, amount }) => {
        const state = get();
        const cleanEventId = String(eventId || '').trim();
        const cleanAction = String(action || '').trim();
        const value = Number(amount);
        const staffMember = getActiveStaff(state);
        const targetStudent =
          state.students.find((student) => student.id === (studentId || state.account.id)) ||
          state.students[0];

        if (!cleanEventId || !cleanAction) {
          return { error: 'Preencha o ID único do evento e o motivo da emissão.' };
        }
        if (!Number.isFinite(value) || value <= 0) {
          return { error: 'O valor deve ser maior que zero.' };
        }

        const normalizedEventId = cleanEventId.toLowerCase();
        const duplicatedInIssuances = state.issuances.some(
          (entry) => entry.eventId.trim().toLowerCase() === normalizedEventId
        );
        const duplicatedInTransactions = state.account.transactions.some(
          (tx) => tx.eventId && tx.eventId.trim().toLowerCase() === normalizedEventId
        );

        if (duplicatedInIssuances || duplicatedInTransactions) {
          return { error: 'Este ID de evento já foi lançado. Use um identificador único.' };
        }

        const now = new Date().toISOString();
        const entry = {
          id: createId(),
          accountId: targetStudent.id,
          studentName: targetStudent.name,
          eventId: cleanEventId,
          action: cleanAction,
          amount: value,
          responsible: staffMember.name,
          staffId: staffMember.id,
          date: now,
        };

        const isDemoAccount = targetStudent.id === state.account.id;
        const nextAccount = isDemoAccount
          ? {
              ...state.account,
              available: state.account.available + value,
              transactions: [
                {
                  id: createId(),
                  type: 'credit',
                  label: cleanAction,
                  amount: value,
                  date: now,
                  eventId: cleanEventId,
                  responsible: staffMember.name,
                },
                ...state.account.transactions,
              ],
            }
          : state.account;

        set({
          issuances: [entry, ...state.issuances],
          account: nextAccount,
          students: state.students.map((student) =>
            student.id === targetStudent.id
              ? { ...student, available: student.available + value }
              : student
          ),
          audit: [
            makeAuditEntry(state, {
              action: 'Emissão de CDU',
              targetId: targetStudent.id,
              detail: `${cleanAction} · +${value} CDU para ${targetStudent.name} (evento: ${cleanEventId})`,
              overrideActor: {
                role: 'teacher',
                id: staffMember.id,
                name: staffMember.name,
              },
            }),
            ...state.audit,
          ],
        });

        return { entry };
      },

      purchase: (itemOrId) => {
        const state = get();
        const normalizedId = typeof itemOrId === 'string' ? itemOrId : itemOrId?.id;
        const item = state.catalog.find((entry) => entry.id === normalizedId);

        if (!item) {
          return { error: 'Benefício não encontrado.' };
        }
        if (!Number.isFinite(item.price) || item.price <= 0) {
          return { error: 'Preço inválido.' };
        }
        if (state.account.available < item.price) {
          return { error: 'Saldo disponível insuficiente.' };
        }

        const now = new Date().toISOString();

        if (item.requiresApproval) {
          const order = {
            id: createId(),
            accountId: state.account.id,
            studentName: state.account.name,
            itemId: item.id,
            itemName: item.name,
            amount: item.price,
            status: 'pending',
            createdAt: now,
            decidedAt: null,
            decidedBy: null,
          };

          const tx = {
            id: createId(),
            type: 'reserve',
            label: `Pedido pendente: ${item.name}`,
            amount: item.price,
            date: now,
            orderId: order.id,
          };

          set({
            account: {
              ...state.account,
              available: state.account.available - item.price,
              reserved: state.account.reserved + item.price,
              transactions: [tx, ...state.account.transactions],
            },
            students: state.students.map((student) =>
              student.id === state.account.id
                ? {
                    ...student,
                    available: student.available - item.price,
                    reserved: student.reserved + item.price,
                  }
                : student
            ),
            orders: [order, ...state.orders],
            audit: [
              makeAuditEntry(state, {
                action: 'Pedido enviado para aprovação',
                targetId: order.id,
                detail: `${item.name} (${item.price} CDU reservados)`,
              }),
              ...state.audit,
            ],
          });

          return { order, requiresApproval: true };
        }

        const tx = {
          id: createId(),
          type: 'debit',
          label: `Compra: ${item.name}`,
          amount: item.price,
          date: now,
          orderId: null,
        };

        set({
          account: {
            ...state.account,
            available: state.account.available - item.price,
            transactions: [tx, ...state.account.transactions],
          },
          students: state.students.map((student) =>
            student.id === state.account.id
              ? { ...student, available: student.available - item.price }
              : student
          ),
          audit: [
            makeAuditEntry(state, {
              action: 'Compra de benefício',
              targetId: item.id,
              detail: `${item.name} (−${item.price} CDU)`,
            }),
            ...state.audit,
          ],
        });

        return { receipt: tx, requiresApproval: false };
      },

      approveOrder: (orderId) => {
        const state = get();
        const order = state.orders.find(
          (entry) => entry.id === orderId && entry.status === 'pending'
        );
        if (!order) {
          return { error: 'Pedido pendente não encontrado.' };
        }

        const staffMember = getActiveStaff(state);
        const now = new Date().toISOString();
        const tx = {
          id: createId(),
          type: 'debit',
          label: `Pedido aprovado: ${order.itemName}`,
          amount: order.amount,
          date: now,
          orderId: order.id,
          responsible: staffMember.name,
        };

        const isDemoAccount = order.accountId === state.account.id;
        set({
          orders: state.orders.map((entry) =>
            entry.id === orderId
              ? { ...entry, status: 'approved', decidedAt: now, decidedBy: staffMember.name }
              : entry
          ),
          account: isDemoAccount
            ? {
                ...state.account,
                reserved: Math.max(0, state.account.reserved - order.amount),
                transactions: [tx, ...state.account.transactions],
              }
            : state.account,
          students: state.students.map((student) =>
            student.id === order.accountId
              ? { ...student, reserved: Math.max(0, student.reserved - order.amount) }
              : student
          ),
          audit: [
            makeAuditEntry(state, {
              action: 'Pedido aprovado',
              targetId: order.id,
              detail: `${order.itemName} (${order.amount} CDU) para ${order.studentName}`,
              overrideActor: {
                role: 'teacher',
                id: staffMember.id,
                name: staffMember.name,
              },
            }),
            ...state.audit,
          ],
        });

        return { success: true };
      },

      rejectOrder: (orderId) => {
        const state = get();
        const order = state.orders.find(
          (entry) => entry.id === orderId && entry.status === 'pending'
        );
        if (!order) {
          return { error: 'Pedido pendente não encontrado.' };
        }

        const staffMember = getActiveStaff(state);
        const now = new Date().toISOString();
        const tx = {
          id: createId(),
          type: 'release',
          label: `Pedido recusado (estorno): ${order.itemName}`,
          amount: order.amount,
          date: now,
          orderId: order.id,
          responsible: staffMember.name,
        };

        const isDemoAccount = order.accountId === state.account.id;
        set({
          orders: state.orders.map((entry) =>
            entry.id === orderId
              ? { ...entry, status: 'rejected', decidedAt: now, decidedBy: staffMember.name }
              : entry
          ),
          account: isDemoAccount
            ? {
                ...state.account,
                available: state.account.available + order.amount,
                reserved: Math.max(0, state.account.reserved - order.amount),
                transactions: [tx, ...state.account.transactions],
              }
            : state.account,
          students: state.students.map((student) =>
            student.id === order.accountId
              ? {
                  ...student,
                  available: student.available + order.amount,
                  reserved: Math.max(0, student.reserved - order.amount),
                }
              : student
          ),
          audit: [
            makeAuditEntry(state, {
              action: 'Pedido recusado',
              targetId: order.id,
              detail: `${order.itemName} (${order.amount} CDU devolvidos a ${order.studentName})`,
              overrideActor: {
                role: 'teacher',
                id: staffMember.id,
                name: staffMember.name,
              },
            }),
            ...state.audit,
          ],
        });

        return { success: true };
      },

      transfer: () => ({
        error:
          'Transferências entre estudantes são bloqueadas. CDU só pode ser usada em benefícios educativos.',
      }),
    }),
    {
      name: 'banesc-demo-v3',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
