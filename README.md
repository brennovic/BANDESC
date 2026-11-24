# BANESC — Banco Escolar Digital

Aplicação educacional fictícia do IFPI Campus Piripiri. A moeda CDU não representa reais, não pode ser comprada nem convertida.

## Modelo de dados do MVP

| Entidade | Campos principais | Regra |
| --- | --- | --- |
| Conta | id, número, apelido, turma, saldo disponível, saldo reservado | Somente identidades fictícias na demonstração. |
| Transação | id, conta_id, tipo, descrição, valor, data, referência_evento, responsável | ID único; valor positivo; saldo nunca pode ficar negativo. |
| Catálogo | id, nome, categoria, descrição, preço, ativo | Preço maior que zero; itens fictícios. |
| Pedido | id, conta_id, item_id, valor, status, criado_em, autorizado_por, concluído_em | Na etapa de pedidos, reservar valor até decisão. |
| Reserva | id, conta_id, meta, valor, status, criada_em | Valor reservado não aparece como disponível. |
| Emissão | id, conta_id, ação, valor, evento_id, responsável, data | `evento_id` único para impedir emissão duplicada. |
| Missão / conclusão | missão_id, título, recompensa / id, conta_id, missão_id, concluída_em | Uma conclusão por pessoa e missão, conforme regra definida. |
| Ranking mensal | mês, tipo, participante_ref, apelido/avatar, pontos | Opt-in, Top 10; nunca armazena saldo ou notas. Calculado a partir de evolução, missões e participação coletiva. |
| Contestação | id, conta_id, transação_id, motivo, status, resposta, criada_em | Correções geram transação compensatória auditável; histórico não é apagado. |

Em armazenamento remoto, validar as regras também no servidor e usar Supabase Auth + Row Level Security. O armazenamento local do MVP é exclusivo para demonstração e pode ser alterado por quem usa o navegador; não guardar dados pessoais ou reais.

## Executar

1. Instale Node.js LTS.
2. Na pasta do projeto, execute `npm install`.
3. Execute `npm run dev` e abra o endereço informado pelo Vite.
4. Para gerar os arquivos de publicação, execute `npm run build`.

O modo de demonstração inicia com 200 CDU de nota azul simulada e 50 CDU por missão simulada. Use “Reiniciar conta” para restaurar esses dados fictícios.
