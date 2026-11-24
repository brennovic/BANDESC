// Massa de demonstração inteiramente fictícia. CDU não representa dinheiro real.

const studentNames = [
  'Lia Monteiro',
  'Caio Nascimento',
  'Maya Ribeiro',
  'Theo Carvalho',
  'Nina Barros',
  'Davi Freitas',
  'Luna Ferreira',
  'Enzo Martins',
  'Bia Cardoso',
  'Ravi Lima',
  'Clara Mendes',
  'Noah Costa',
  'Yara Alves',
  'Ivo Rocha',
  'Cora Duarte',
];

const courses = ['Informática', 'Administração', 'Vestuário'];
const initialXp = [840, 760, 710, 680, 630, 590, 550, 510, 470, 420, 390, 340, 300, 250, 190];

export const students = studentNames.map((name, index) => {
  const course = courses[index % courses.length];
  const grade = index % 2 === 0 ? '3º' : '2º';

  return {
    id: `aluno-${String(index + 1).padStart(3, '0')}`,
    enrollment: `2026${String(index + 1).padStart(4, '0')}`,
    name,
    nickname: name.split(' ')[0],
    course,
    classroom: `${grade} ${course}`,
    xp: initialXp[index],
    available: index === 0 ? 250 : 120 + (index % 5) * 30,
    reserved: 0,
    fotoUrl: null,
    autorizouFoto: index % 4 !== 0,
    rankingOptIn: true,
    achievements:
      index < 3
        ? ['Destaque em missões', 'Participação coletiva']
        : ['Missão concluída'],
  };
});

export const demoAccount = {
  id: students[0].id,
  number: students[0].enrollment,
  name: students[0].name,
  nickname: students[0].nickname,
  course: students[0].course,
  classroom: students[0].classroom,
  available: 250,
  reserved: 0,
  xp: students[0].xp,
  transactions: [
    {
      id: 'tx-demo-002',
      type: 'credit',
      label: 'Missão financeira concluída',
      amount: 50,
      date: '2026-11-19T10:00:00.000Z',
      eventId: 'missao-demo-001',
    },
    {
      id: 'tx-demo-001',
      type: 'credit',
      label: 'Nota azul simulada',
      amount: 200,
      date: '2026-11-19T09:00:00.000Z',
      eventId: 'nota-demo-001',
    },
  ],
};

export const staff = [
  {
    id: 'srv-001',
    siape: '900001',
    name: 'Professora Marina Lopes',
    role: 'Professora',
    pinEnabled: true,
  },
  {
    id: 'srv-002',
    siape: '900002',
    name: 'Renato Alves',
    role: 'Direção de Ensino',
    pinEnabled: true,
  },
  {
    id: 'srv-003',
    siape: '900003',
    name: 'Joana Pires',
    role: 'Cantina',
    pinEnabled: true,
  },
];

export const missions = [
  {
    id: 'mis-001',
    title: 'Completar sete dias letivos',
    category: 'Presença',
    reward: 15,
    xpReward: 15,
    status: 'disponível',
  },
  {
    id: 'mis-002',
    title: 'Alcançar nota azul',
    category: 'Desempenho',
    reward: 200,
    xpReward: 30,
    status: 'disponível',
  },
  {
    id: 'mis-003',
    title: 'Alcançar nota máxima',
    category: 'Desempenho',
    reward: 400,
    xpReward: 45,
    status: 'disponível',
  },
  {
    id: 'mis-004',
    title: 'Entregar atividade no prazo',
    category: 'Atividade',
    reward: 50,
    xpReward: 20,
    status: 'disponível',
  },
  {
    id: 'mis-005',
    title: 'Concluir atividade complementar',
    category: 'Atividade',
    reward: 80,
    xpReward: 25,
    status: 'disponível',
  },
  {
    id: 'mis-006',
    title: 'Participar de monitoria',
    category: 'Colaboração',
    reward: 60,
    xpReward: 25,
    status: 'disponível',
  },
  {
    id: 'mis-007',
    title: 'Colaborar em projeto coletivo',
    category: 'Colaboração',
    reward: 100,
    xpReward: 35,
    status: 'disponível',
  },
  {
    id: 'mis-008',
    title: 'Concluir missão de educação financeira',
    category: 'Educação financeira',
    reward: 50,
    xpReward: 20,
    status: 'disponível',
  },
];

export const events = [
  {
    id: 'evt-001',
    title: 'Feira de Ciências',
    date: '2026-11-26',
    time: '09:00',
    bonus: 30,
    xpBonus: 10,
  },
  {
    id: 'evt-002',
    title: 'Olimpíadas do Campus',
    date: '2026-12-03',
    time: '08:30',
    bonus: 25,
    xpBonus: 10,
  },
  {
    id: 'evt-003',
    title: 'Oficina de Educação Financeira',
    date: '2026-12-10',
    time: '14:00',
    bonus: 20,
    xpBonus: 10,
  },
];

const rawCatalog = [
  ['caneta', 'Caneta', 'Materiais', 30, 'Material escolar', 'pen'],
  ['borracha', 'Borracha', 'Materiais', 20, 'Material escolar', 'eraser'],
  ['caderno', 'Caderno', 'Materiais', 150, 'Caderno institucional', 'book'],
  ['estojo', 'Estojo', 'Materiais', 200, 'Material escolar', 'briefcase'],
  ['mochila', 'Mochila', 'Materiais', 800, 'Material escolar', 'backpack'],
  ['suco', 'Suco', 'Cantina', 60, 'Suco do dia', 'cup'],
  ['salgado', 'Salgado', 'Cantina', 100, 'Salgado da cantina', 'utensils'],
  ['combo', 'Combo da cantina', 'Cantina', 150, 'Combo ilustrativo', 'coffee'],
  ['kit-esportivo', 'Kit esportivo', 'Esporte e Lazer', 60, 'Benefício esportivo', 'dumbbell'],
  ['quadra', 'Uso da quadra', 'Esporte e Lazer', 120, 'Atividade esportiva', 'trophy'],
  ['aula', 'Aula diferenciada', 'Direção de Ensino', 300, 'Atividade educativa', 'graduation'],
  ['oficina', 'Oficina extra', 'Direção de Ensino', 250, 'Atividade educativa', 'sparkles'],
  [
    'folga',
    'Folga pedagógica simulada',
    'Direção de Ensino',
    600,
    'Benefício fictício sujeito às regras escolares',
    'calendar',
  ],
  [
    'visto-1',
    'Visto pedagógico simulado I',
    'Direção de Ensino',
    100,
    'Simulação sujeita às normas escolares',
    'badge',
  ],
  [
    'visto-2',
    'Visto pedagógico simulado II',
    'Direção de Ensino',
    180,
    'Simulação sujeita às normas escolares',
    'badge',
  ],
  [
    'visto-3',
    'Visto pedagógico simulado III',
    'Direção de Ensino',
    350,
    'Simulação sujeita às normas escolares',
    'badge',
  ],
];

export const catalog = rawCatalog.map(([id, name, category, price, description, iconKey]) => ({
  id,
  name,
  category,
  price,
  description,
  iconKey,
  requiresApproval: category === 'Direção de Ensino',
}));
