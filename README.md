# AP - Mapa Ações

Plataforma de análise tática de futebol com estatísticas agregadas.

## Stack Técnico

- Next.js App Router + TypeScript
- PostgreSQL (Neon)
- Drizzle ORM + SQL migrations
- TailwindCSS + shadcn-style UI components
- Recharts

## Funcionalidades Principais

- Gestão de administração:
  - `/admin/seasons`
  - `/admin/competitions`
  - `/admin/teams`
  - `/admin/players`
  - `/admin/matches`
  - `/admin/gps/matches` (GPS values by player and match)
  - `/admin/gps/training` (training units, participants and GPS values)
  - `/admin/stats` (fluxo competição -> jogo -> equipa -> jogador)
- Painel:
  - `/dashboard`
  - totais por competição
  - evolução por jogo
  - comparações de jogadores
  - distribuição ofensiva
  - perfil radar
- Relatório público:
  - `/report/player/[id]`
  - URL direta partilhável
  - sem navegação de administração

## Base de Dados

O schema Drizzle e a migração inicial incluem:

- `seasons`
- `competitions`
- `teams`
- `team_competitions`
- `players`
- `matches`
- `player_match_stats`
- `goalkeeper_match_stats`
- `team_match_stats`
- `player_gps_match_stats`
- `training_sessions`
- `training_participants`
- `player_gps_training_stats`

## GPS

- GPS Matches keeps the existing competition and match workflow.
- GPS Training reuses the registered team and players, while storing its records separately by season, date, microcycle and training unit.
- Team values are calculated from player records. Training duration is stored once per session and is not multiplied by the number of players.
- Multi-select filters include Select all and Clear controls for players, matches/trainings and chart metrics.
- GPS administration lists saved records with safe edit and delete-statistics actions. Deleting statistics keeps the player, match and training.

## Métricas Dinâmicas

Calculadas no código, sem persistência:

- Percentagens:
  - precisão de passe
  - precisão de cruzamento
  - taxa de sucesso em duelos
  - precisão de remate
- Per 90:
  - `(stat / minutes_played) * 90`

## Configuração Local

1. Configure o ambiente:
   - Copie `.env.example` para `.env`
   - Defina `DATABASE_URL` com o URL Neon/PostgreSQL
2. Instale as dependências:
   - `npm install`
3. Execute as migrações:
   - `npm run db:migrate`
4. Insira dados de exemplo:
   - `npm run db:seed`
5. Inicie o servidor de desenvolvimento:
   - `npm run dev`

## Scripts Úteis

- `npm run dev`
- `npm run build`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:push`
- `npm run db:studio`
- `npm run db:seed`

## Integração com VideoAnaliseJogadores

O endpoint `POST /api/integrations/video-analysis` recebe épocas, competições,
equipas/plantéis e snapshots completos de jogos. Cada entidade fica ligada pelo
ID estável da aplicação de vídeo, pelo que reenviar um jogo atualiza os dados em
vez de os duplicar.

Cada utilizador liga a sua própria conta: em `Administração → Integrações` cria
um código temporário e cola-o no ecrã `Structure` do VideoAnaliseJogadores. O
código expira ao fim de 30 minutos, só pode ser usado uma vez e cria uma
credencial exclusiva e revogável para os dois espaços de trabalho. Não são
necessários tokens globais em variáveis de ambiente.

Os jogos sincronizados ficam apenas de leitura na introdução manual de
estatísticas; as correções devem ser feitas na análise de vídeo e reenviadas.

## Estrutura do Projeto

- `app/` rotas e layouts
- `components/` componentes de UI, gráficos e layout
- `actions/` server actions
- `lib/` queries, calculadores de estatísticas e validadores
- `db/` schema, SQL de migração e cliente de base de dados
- `scripts/seed.ts` dados de exemplo
