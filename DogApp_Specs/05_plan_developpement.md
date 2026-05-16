# Plan de Développement — DogApp
> **Ce document est la référence absolue pour tout développement sur DogApp.**  
> Cursor, Claude ou tout développeur doit le consulter avant d'écrire la moindre ligne de code.  
> En cas de doute entre ce document et une autre source, **ce document a priorité**.

**Version :** 1.0 | **Date :** Mai 2026 | **Stack :** NestJS · React Native (Expo) · Next.js · Neon (PostgreSQL) · Upstash Redis · Cloudflare R2

---

## Table des matières

1. [Structure du monorepo](#1-structure-du-monorepo)
2. [Setup initial et outils](#2-setup-initial-et-outils)
3. [Conventions de code](#3-conventions-de-code)
4. [Architecture Backend (NestJS)](#4-architecture-backend-nestjs)
5. [Base de données — Prisma + Neon](#5-base-de-données--prisma--neon)
6. [API REST — contrat et conventions](#6-api-rest--contrat-et-conventions)
7. [Authentification](#7-authentification)
8. [Architecture Mobile (React Native / Expo)](#8-architecture-mobile-react-native--expo)
9. [Architecture Web (Next.js)](#9-architecture-web-nextjs)
10. [Notifications](#10-notifications)
11. [Stockage fichiers (Cloudflare R2)](#11-stockage-fichiers-cloudflare-r2)
12. [Tests](#12-tests)
13. [Git workflow](#13-git-workflow)
14. [Environments et secrets](#14-environments-et-secrets)
15. [CI/CD](#15-cicd)
16. [Ordre d'implémentation — MVP](#16-ordre-dimplémentation--mvp)
17. [Checklist par feature](#17-checklist-par-feature)
18. [Definition of Done](#18-definition-of-done)
19. [Erreurs fréquentes à éviter](#19-erreurs-fréquentes-à-éviter)

---

## 1. Structure du monorepo

Le projet est un **monorepo pnpm + Turborepo**.

```
dogapp/
├── apps/
│   ├── api/                        # Backend NestJS
│   ├── mobile/                     # React Native (Expo)
│   └── web/                        # Next.js 14
│
├── packages/
│   ├── database/                   # Prisma schema, migrations, seed
│   ├── types/                      # Types TypeScript partagés (DTOs, enums)
│   └── utils/                      # Utilitaires partagés (snake_case↔camelCase, dates)
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json                    # Root devDependencies (prettier, eslint, turbo)
└── .env.example                    # Template d'environnement (jamais de vraies valeurs)
```

### apps/api/ (NestJS)

```
apps/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── auth/
│   ├── users/
│   ├── dogs/
│   ├── health/
│   │   ├── records/
│   │   ├── reminders/
│   │   ├── symptoms/
│   │   └── medications/
│   ├── tracking/
│   │   ├── weight/
│   │   ├── nutrition/
│   │   ├── activity/
│   │   └── hygiene/
│   ├── pedigree/
│   ├── vets/
│   ├── reproduction/
│   ├── checkup/
│   ├── sharing/
│   ├── social/
│   │   ├── posts/
│   │   ├── groups/
│   │   └── events/
│   ├── notifications/
│   ├── exports/
│   └── common/
│       ├── decorators/
│       ├── filters/
│       ├── guards/
│       ├── interceptors/
│       ├── pipes/
│       └── utils/
├── test/
│   ├── e2e/
│   └── fixtures/
├── nest-cli.json
└── tsconfig.json
```

### apps/mobile/ (Expo)

```
apps/mobile/
├── app/                            # Expo Router (file-based routing)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── onboarding.tsx
│   ├── (tabs)/
│   │   ├── index.tsx               # Accueil
│   │   ├── health/
│   │   ├── activity.tsx
│   │   ├── nutrition.tsx
│   │   └── community.tsx
│   └── _layout.tsx
├── components/
│   ├── ui/                         # Composants atomiques (Button, Input, Card...)
│   ├── health/                     # Composants spécifiques santé
│   ├── charts/                     # Courbes, graphiques
│   └── shared/                     # Composants transverses
├── hooks/                          # Custom hooks (useAuth, useDog, useReminders...)
├── store/                          # Zustand stores
├── services/                       # Appels API (React Query)
│   ├── api.ts                      # Client HTTP Axios configuré
│   └── [feature].service.ts
├── constants/
├── types/                          # Types locaux (import depuis @dogapp/types)
└── assets/
    ├── images/
    ├── fonts/
    └── illustrations/
```

### apps/web/ (Next.js)

```
apps/web/
├── app/                            # App Router Next.js 14
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar + Topbar
│   │   ├── page.tsx                # Dashboard
│   │   ├── health/
│   │   ├── weight/
│   │   ├── medications/
│   │   ├── share/[token]/          # Portail vétérinaire (accès public)
│   │   └── settings/
│   └── api/                        # Route handlers Next.js (si besoin BFF)
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── layout/                     # Sidebar, Topbar, Layout
│   ├── charts/                     # Recharts wrappers
│   └── [feature]/
├── hooks/
├── store/                          # Zustand (partagé mobile via @dogapp/utils si possible)
├── services/
└── lib/
    ├── api.ts
    └── utils.ts
```

### packages/database/

```
packages/database/
├── prisma/
│   ├── schema.prisma               # Source de vérité du schéma
│   ├── migrations/                 # Jamais modifiées manuellement
│   └── seed.ts                     # Données de seed pour dev/staging
├── src/
│   └── index.ts                    # Export du PrismaClient singleton
└── package.json
```

### packages/types/

```
packages/types/
└── src/
    ├── index.ts
    ├── auth.types.ts
    ├── dog.types.ts
    ├── health.types.ts
    ├── api.types.ts                # Response wrappers, Pagination, etc.
    └── enums.ts
```

---

## 2. Setup initial et outils

### Prérequis

- **Node.js** : 22 LTS (via `nvm` ou `.nvmrc`)
- **pnpm** : 9.x (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Turbo** : installé en root devDependency
- **Compte Neon** : créer le projet + branches `main`, `staging`
- **Compte Upstash** : créer une DB Redis par environnement
- **Compte Cloudflare** : créer un bucket R2 par environnement

### Initialisation

```bash
# Cloner et installer
git clone <repo>
cd dogapp
pnpm install

# Configurer l'environnement
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
cp .env.example apps/mobile/.env.local
# Remplir chaque .env avec les vraies valeurs (voir §14)

# Générer le client Prisma
pnpm --filter @dogapp/database db:generate

# Pousser le schéma sur la branche Neon dev
pnpm --filter @dogapp/database db:push

# Lancer en dev
pnpm dev          # Lance API + Web + Mobile en parallèle (Turborepo)
```

### Scripts Turborepo (root package.json)

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "db:generate": "turbo run db:generate --filter=@dogapp/database",
    "db:push": "turbo run db:push --filter=@dogapp/database",
    "db:migrate": "turbo run db:migrate --filter=@dogapp/database",
    "db:studio": "turbo run db:studio --filter=@dogapp/database"
  }
}
```

---

## 3. Conventions de code

### TypeScript — règles strictes

```json
// tsconfig.json (partagé)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Règles absolues :**
- `any` est **interdit** — utiliser `unknown` puis narrowing
- `as` (type assertion) est **interdit sauf** cas justifiés avec commentaire `// SAFE: ...`
- Toutes les fonctions publiques ont un type de retour explicite
- Pas de `!` (non-null assertion) sauf dans les tests

### Nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Fichiers | `kebab-case` | `health-record.service.ts` |
| Classes | `PascalCase` | `HealthRecordService` |
| Interfaces / Types | `PascalCase` + préfixe selon usage | `CreateHealthRecordDto`, `HealthRecord` |
| Fonctions / méthodes | `camelCase` | `findAllByDog()` |
| Variables | `camelCase` | `healthRecord` |
| Constantes | `SCREAMING_SNAKE_CASE` | `JWT_EXPIRY` |
| Enums | `PascalCase` (nom) + `SCREAMING_SNAKE_CASE` (valeurs) | `ReminderType.ANTI_PARASITIC` |
| Composants React | `PascalCase` | `HealthRecordCard` |
| Hooks | `camelCase` préfixé `use` | `useHealthRecords` |
| Stores Zustand | `camelCase` suffixé `Store` | `dogStore` |
| Routes API | `kebab-case` | `/health-records` |

### Formatage

- **Prettier** : enforced en pre-commit (Husky + lint-staged)
- **ESLint** : config stricte avec `@typescript-eslint/recommended-type-checked`
- Indentation : 2 espaces
- Guillemets : simples en TypeScript, doubles en JSX
- Longueur de ligne : 100 caractères
- Imports : triés (eslint-plugin-import), paths absolus via `@/`

### Commentaires

- Pas de commentaires qui expliquent **ce que** le code fait (ça se lit)
- Les commentaires expliquent **pourquoi** un choix non évident a été fait
- JSDoc obligatoire sur toutes les méthodes publiques des services
- `// TODO:` et `// FIXME:` toujours accompagnés d'un nom et d'une date

---

## 4. Architecture Backend (NestJS)

### Règle d'or : Controller → Service → Repository

```
HTTP Request
  └─► Controller      (validation HTTP, routing, transformation réponse)
        └─► Service   (logique métier, orchestration)
              └─► Repository (Prisma, accès DB uniquement)
```

**Interdictions :**
- Le Controller ne contient **jamais** de logique métier
- Le Service ne contient **jamais** d'appels Prisma directs — il passe par le Repository
- Le Repository ne contient **jamais** de logique métier — uniquement des requêtes DB

### Template d'un module

Chaque feature `[module]` suit exactement cette structure :

```
src/[module]/
├── [module].module.ts
├── [module].controller.ts
├── [module].service.ts
├── [module].repository.ts
├── dto/
│   ├── create-[module].dto.ts
│   ├── update-[module].dto.ts
│   └── [module]-response.dto.ts
└── [module].spec.ts          # Tests unitaires du service
```

### Template controller

```typescript
// health/records/health-record.controller.ts
@Controller('dogs/:dogId/health/records')
@UseGuards(JwtAuthGuard, DogOwnerGuard)   // Toujours les deux guards sur les routes chien
@ApiTags('health-records')
export class HealthRecordController {
  constructor(private readonly healthRecordService: HealthRecordService) {}

  @Get()
  @ApiOperation({ summary: 'List health records for a dog' })
  async findAll(
    @Param('dogId') dogId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<HealthRecordResponseDto>> {
    return this.healthRecordService.findAll(dogId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a health record' })
  async create(
    @Param('dogId') dogId: string,
    @Body() dto: CreateHealthRecordDto,
    @CurrentUser() user: AuthUser,
  ): Promise<HealthRecordResponseDto> {
    return this.healthRecordService.create(dogId, dto, user.id);
  }
}
```

### Template service

```typescript
// health/records/health-record.service.ts
@Injectable()
export class HealthRecordService {
  constructor(
    private readonly healthRecordRepository: HealthRecordRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll(
    dogId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<HealthRecordResponseDto>> {
    const records = await this.healthRecordRepository.findAllByDog(dogId, query);
    return toPaginatedResponse(records, HealthRecordResponseDto);
  }

  async create(
    dogId: string,
    dto: CreateHealthRecordDto,
    userId: string,
  ): Promise<HealthRecordResponseDto> {
    const record = await this.healthRecordRepository.create({ ...dto, dogId });
    await this.auditLogService.log(userId, 'CREATE_HEALTH_RECORD', 'HealthRecord', record.id);
    return toResponseDto(record, HealthRecordResponseDto);
  }
}
```

### Template repository

```typescript
// health/records/health-record.repository.ts
@Injectable()
export class HealthRecordRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByDog(
    dogId: string,
    query: PaginationQueryDto,
  ): Promise<{ data: HealthRecord[]; nextCursor: string | null }> {
    const records = await this.prisma.healthRecord.findMany({
      where: { dogId },
      take: query.limit + 1,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy: { visitDate: 'desc' },
    });

    const hasMore = records.length > query.limit;
    const data = hasMore ? records.slice(0, -1) : records;
    return { data, nextCursor: hasMore ? data.at(-1)!.id : null };
  }

  async create(data: Prisma.HealthRecordCreateInput): Promise<HealthRecord> {
    return this.prisma.healthRecord.create({ data });
  }
}
```

### Guards obligatoires

| Guard | Usage | Ce qu'il fait |
|-------|-------|--------------|
| `JwtAuthGuard` | Toutes les routes privées | Valide le JWT, injecte `req.user` |
| `DogOwnerGuard` | Toutes les routes `/:dogId/...` | Vérifie que `req.user.id === dog.ownerId` |
| `FeatureFlagGuard` | F09, F11, F14 | Vérifie que le feature flag est activé en DB |
| `AdminGuard` | Routes `/admin/...` | Vérifie le rôle `admin` |

### Intercepteurs globaux

Enregistrés dans `app.module.ts` :
- `TransformInterceptor` : enveloppe toutes les réponses dans `{ data, meta }` et convertit `camelCase → snake_case`
- `LoggingInterceptor` : log chaque requête (méthode, path, durée, statut)
- `IdempotencyInterceptor` : gère l'en-tête `Idempotency-Key` sur les POST critiques

### Filtres d'exception globaux

- `HttpExceptionFilter` : formate les erreurs en RFC 7807 (`type`, `title`, `status`, `detail`)
- `PrismaExceptionFilter` : traduit les erreurs Prisma (P2002 → 409 Conflict, P2025 → 404 Not Found)

### Décorateurs custom

```typescript
// common/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// common/decorators/idempotent.decorator.ts
export const Idempotent = () => SetMetadata('idempotent', true);
```

---

## 5. Base de données — Prisma + Neon

### Workflow de modification du schéma

```
⚠️ JAMAIS modifier les fichiers dans prisma/migrations/ manuellement
```

**Ajouter/modifier une table :**
1. Modifier `packages/database/prisma/schema.prisma`
2. `pnpm db:migrate -- --name description_courte` (branche dev Neon)
3. Vérifier le fichier de migration généré
4. Commit du schéma + migration ensemble
5. En staging/prod : `pnpm db:migrate:deploy` (via CI/CD uniquement)

**Règles Prisma :**
- Chaque modèle a un champ `id String @id @default(cuid())` — utiliser **cuid2** (plus court qu'UUID, URL-safe)
- Chaque modèle a `createdAt DateTime @default(now())` et `updatedAt DateTime @updatedAt`
- Les soft deletes utilisent `deletedAt DateTime?` (jamais de DELETE physique sur les données de santé)
- Les relations sont **toujours** typées des deux côtés
- Les champs JSON utilisent `Json` de Prisma (pas de `String` pour les JSON)

### Template modèle Prisma

```prisma
model HealthRecord {
  id          String    @id @default(cuid())
  dogId       String
  vetName     String
  visitDate   DateTime
  reason      String
  diagnosis   String?
  notes       String?
  deletedAt   DateTime?         // Soft delete
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  dog         Dog       @relation(fields: [dogId], references: [id], onDelete: Cascade)
  attachments Attachment[]

  @@index([dogId])
  @@index([visitDate])
  @@map("health_records")       // Snake_case en base
}
```

### Règles d'index

Créer systématiquement un index sur :
- Toute FK (`dogId`, `userId`, `ownerId`)
- Les champs filtrés fréquemment (`dueDate`, `visitDate`, `loggedAt`, `isActive`)
- Les champs de tri (`createdAt` — déjà indexé par défaut sur Neon via BRIN)

### Connexion Neon

```typescript
// packages/database/src/index.ts
import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);

export const prisma = new PrismaClient({ adapter });
```

**URLs Neon :**
- `DATABASE_URL` : URL **poolée** (PgBouncer) — pour l'API en production
- `DATABASE_URL_UNPOOLED` : URL directe — pour les migrations Prisma **uniquement**

---

## 6. API REST — contrat et conventions

### Format des réponses

**Réponse succès (liste) :**
```json
{
  "data": [ ... ],
  "meta": {
    "next_cursor": "clx12345",
    "has_more": true,
    "total": null
  }
}
```

**Réponse succès (objet unique) :**
```json
{
  "data": { ... }
}
```

**Réponse erreur (RFC 7807) :**
```json
{
  "type": "https://dogapp.io/errors/not-found",
  "title": "Resource not found",
  "status": 404,
  "detail": "Dog with id clx12345 was not found",
  "instance": "/api/v1/dogs/clx12345"
}
```

### Pagination — cursor-based

```typescript
// common/dto/pagination-query.dto.ts
export class PaginationQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
```

### Idempotence

Les endpoints marqués `@Idempotent()` :
- Lisent l'en-tête `Idempotency-Key` (UUID v4 généré par le client)
- Stockent le résultat dans Redis (TTL 24h) avec la clé comme identifiant
- Si la même clé est reçue → retournent le résultat mis en cache (HTTP 200) sans re-exécuter

**Endpoints idempotents obligatoires :**
- `POST /dogs/:id/health/medications/:medId/doses` (prise de médicament)
- `POST /dogs/:id/weight` (pesée)
- `PATCH /dogs/:id/health/reminders/:remId/done` (rappel effectué)
- `POST /sharing/links` (génération lien partage)

### Transformation snake_case ↔ camelCase

```typescript
// common/interceptors/transform.interceptor.ts
// L'intercepteur convertit automatiquement les réponses API de camelCase → snake_case
// Les clients (mobile et web) reconvertissent snake_case → camelCase

// packages/utils/src/case.ts
export const toSnakeCase = (obj: unknown): unknown => { /* ... */ };
export const toCamelCase = (obj: unknown): unknown => { /* ... */ };
```

---

## 7. Authentification

### Flow complet

```
1. POST /auth/register  → crée User + retourne { access_token, refresh_token }
2. POST /auth/login     → vérifie credentials + retourne { access_token, refresh_token }
3. POST /auth/refresh   → valide refresh_token + retourne nouveaux tokens (rotation)
4. POST /auth/logout    → révoque le refresh_token en base
5. POST /auth/revoke-all → révoque TOUS les refresh tokens du user (tous appareils)
```

### Structure des tokens

```typescript
// Access token JWT payload
interface JwtPayload {
  sub: string;        // userId
  email: string;
  role: 'owner' | 'admin';
  is_breeder: boolean;
  iat: number;
  exp: number;        // 15 minutes
}

// Refresh token : opaque (cuid2), stocké en base
// Table: RefreshToken { id, userId, token (hash bcrypt), expiresAt, createdAt, revokedAt? }
```

### Stockage côté client

| Plateforme | Access token | Refresh token |
|-----------|-------------|--------------|
| Mobile | Mémoire (Zustand) | `Expo.SecureStore` (chiffré) |
| Web | Mémoire (Zustand) | `httpOnly cookie` (SameSite=Strict) |

### Protection contre le vol de session

Si un refresh token révoqué est présenté → **révoquer tous les tokens de l'utilisateur** + logger l'incident dans `AuditLog`.

---

## 8. Architecture Mobile (React Native / Expo)

### Navigation — Expo Router

- **File-based routing** (Expo Router v3)
- Toutes les routes protégées dans `(tabs)/` — le `_layout.tsx` vérifie l'auth
- Redirections : si non authentifié → `/(auth)/login`
- Deep linking : configuré pour les notifications push

### État global — Zustand

```typescript
// store/dog.store.ts
interface DogState {
  dogs: Dog[];
  activeDogId: string | null;
  activeDog: Dog | undefined;
  setActiveDog: (id: string) => void;
  setDogs: (dogs: Dog[]) => void;
}

// store/auth.store.ts
interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}
```

**Règle :** les stores Zustand ne font **jamais** d'appels API — ils sont de simples conteneurs d'état. Les appels API sont dans les services (React Query).

### Data fetching — React Query

```typescript
// services/health-records.service.ts
export const useHealthRecords = (dogId: string) =>
  useInfiniteQuery({
    queryKey: ['health-records', dogId],
    queryFn: ({ pageParam }) => api.get(`/dogs/${dogId}/health/records`, {
      params: { cursor: pageParam, limit: 20 },
    }),
    getNextPageParam: (last) => last.data.meta.next_cursor ?? undefined,
    staleTime: 5 * 60 * 1000,     // 5 minutes
  });

export const useCreateHealthRecord = (dogId: string) =>
  useMutation({
    mutationFn: (dto: CreateHealthRecordDto) =>
      api.post(`/dogs/${dogId}/health/records`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records', dogId] });
    },
  });
```

**QueryKey convention :** `[feature, entityId, ...filters]`

### Offline

- `@tanstack/query-async-storage-persister` + MMKV pour persister le cache
- Les mutations échouées sont retentées automatiquement à la reconnexion (`networkMode: 'offlineFirst'`)
- Détecter la connectivité : `@react-native-community/netinfo`

### Composants

- Les composants dans `components/ui/` sont **purement présentationnels** (pas d'appels API, pas de stores)
- Les composants dans `components/[feature]/` peuvent accéder aux hooks et stores
- **Un composant = un fichier**. Pas de barrel exports surchargés.
- Props toujours typées avec `interface`, jamais avec `type` pour les composants

### Template composant

```typescript
// components/health/HealthRecordCard.tsx
interface HealthRecordCardProps {
  record: HealthRecord;
  onPress?: () => void;
  onDelete?: (id: string) => void;
}

export function HealthRecordCard({ record, onPress, onDelete }: HealthRecordCardProps) {
  // ...
}
```

---

## 9. Architecture Web (Next.js)

### App Router — conventions

- `page.tsx` : composant de page (Server Component par défaut)
- `layout.tsx` : layout partagé (Server Component)
- `loading.tsx` : skeleton de chargement
- `error.tsx` : gestion d'erreur de route
- Préfixer `'use client'` **uniquement** quand nécessaire (interactivité, hooks)

### Data fetching web

- **Server Components** : fetch direct côté serveur pour les données initiales (SEO, performance)
- **Client Components** : React Query pour les données interactives (filtres, mutations)
- Les appels API depuis le serveur utilisent `DATABASE_URL` directement si possible (pas de round-trip HTTP)

### Portail vétérinaire (`/share/[token]`)

- Route **publique**, pas d'auth requise
- Server Component qui vérifie le token et récupère les données
- Rendu statique avec revalidation (ISR 60s)
- Si token invalide/expiré → page d'erreur dédiée (pas de 404 générique)

---

## 10. Notifications

### Architecture BullMQ

```typescript
// notifications/notification.processor.ts
@Processor('notifications')
export class NotificationProcessor {
  @Process('send-push')
  async handlePush(job: Job<PushNotificationJob>): Promise<void> { ... }

  @Process('send-email')
  async handleEmail(job: Job<EmailNotificationJob>): Promise<void> { ... }
}
```

### Planification des rappels

Les rappels sont planifiés dans BullMQ avec `delay` calculé au moment de la création :

```typescript
// Exemple : rappel vaccin J-7
const delayMs = differenceInMilliseconds(subDays(reminder.dueDate, 7), new Date());
await this.notificationQueue.add('send-push', payload, { delay: delayMs, jobId: `reminder-${reminder.id}-7d` });
```

**jobId unique** → BullMQ déduplique automatiquement si le même job est ajouté deux fois.

### Nettoyage tokens push invalides

Après chaque envoi FCM/APNs, les tokens invalides (erreur `registration-token-not-registered`) sont supprimés de la table `DeviceToken`.

---

## 11. Stockage fichiers (Cloudflare R2)

### Convention de clés R2

```
Format : {env}/{ownerId}/{dogId}/{feature}/{uuid}.{ext}
Exemple: prod/usr_abc/dog_xyz/health-records/att_123.pdf
```

### Upload flow

```
Client → API (POST /upload/presigned-url)
       → API génère une URL pré-signée R2 (TTL 5 min)
       → Client upload directement sur R2 (pas de transit API)
       → Client confirme à l'API (POST avec la clé R2)
       → API enregistre la clé en base (table Attachment)
```

### Accès aux fichiers

- Jamais d'URL publique permanente — toujours des **URLs signées** (TTL 1h pour visualisation, 24h pour download)
- Générer l'URL signée à la demande dans le service, pas en base

---

## 12. Tests

### Stratégie

| Niveau | Outil | Couverture cible | Ce qu'on teste |
|--------|-------|-----------------|----------------|
| Unitaire | Jest | 80% services | Logique métier, transformations, calculs |
| Intégration | Jest + Supertest | Routes critiques | Auth, CRUD, guards, validation |
| E2E | Playwright | 5 parcours clés | Flux complets utilisateur |
| Mobile | Jest + RNTL | Composants UI | Rendu, interactions |

### Parcours E2E prioritaires (dans l'ordre)

1. `Inscription → Ajout chien → Création rappel vaccin → Notification → Marquage effectué`
2. `Login → Création programme médicament → Confirmation prise → Vérification historique`
3. `Saisie symptômes → Check-up rapide → Résultat → Redirection vétérinaires`
4. `Pesée → Affichage courbe → Alerte hors plage`
5. `Génération lien partage → Accès portail vétérinaire → Vérification données affichées`

### Template test unitaire service

```typescript
// health/records/health-record.service.spec.ts
describe('HealthRecordService', () => {
  let service: HealthRecordService;
  let repository: MockProxy<HealthRecordRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        HealthRecordService,
        { provide: HealthRecordRepository, useValue: createMock<HealthRecordRepository>() },
        { provide: AuditLogService, useValue: createMock<AuditLogService>() },
      ],
    }).compile();
    service = module.get(HealthRecordService);
    repository = module.get(HealthRecordRepository);
  });

  describe('create', () => {
    it('should create a health record and log the audit', async () => {
      // Arrange
      repository.create.mockResolvedValue(mockHealthRecord);
      // Act
      const result = await service.create('dog-id', mockCreateDto, 'user-id');
      // Assert
      expect(result).toMatchObject({ id: mockHealthRecord.id });
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ dogId: 'dog-id' }));
    });
  });
});
```

### Règles de test

- Pas de tests qui font des vrais appels réseau (mock tout)
- Les fixtures de test sont dans `test/fixtures/`
- Un test ne doit tester **qu'une seule chose** (une assertion par `it` autant que possible)
- Les tests de guard vérifient qu'un 403 est retourné si `dogId` n'appartient pas au user

---

## 13. Git workflow

### Branches

```
main          ← Production (protégée, merge uniquement via PR)
staging       ← Staging (merge depuis feature branches validées)
dev/[feature] ← Branches de feature (créées depuis main)
fix/[bug]     ← Branches de correction
```

**Neon branch mapping :**
- `main` → branche Neon `main` (production)
- `staging` → branche Neon `staging`
- `dev/*` → branche Neon individuelle (créée manuellement ou via script)

### Convention de commits (Conventional Commits)

```
type(scope): description courte

Types : feat | fix | refactor | test | docs | chore | perf | ci
Scope : api | mobile | web | db | auth | health | activity | social | infra

Exemples :
feat(api/health): add health record creation endpoint
fix(mobile/reminders): correct notification delay calculation
refactor(db): add index on reminder due_date
test(api/auth): add refresh token rotation tests
chore(deps): update prisma to 5.15.0
```

### Pull Requests

- PR title = titre du commit principal
- Template PR (`.github/pull_request_template.md`) :
  - Description des changements
  - Feature(s) impactée(s) — ex. F01, F02
  - Checklist DoD (voir §18)
  - Screenshots / enregistrements si UI
- Minimum **1 review** avant merge sur `staging`
- Minimum **2 reviews** avant merge sur `main`
- Squash merge systématique vers `main`

---

## 14. Environments et secrets

### Fichier `.env.example` (versionné)

```bash
# === API ===
NODE_ENV=development
PORT=3001

# Neon PostgreSQL
DATABASE_URL=postgresql://...@ep-xxx.neon.tech/dogapp?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://...@ep-xxx.neon.tech/dogapp?sslmode=require&pgbouncer=true

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# JWT
JWT_SECRET=min-32-chars-random-string
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Cloudflare R2
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=dogapp-dev
R2_PUBLIC_URL=https://xxx.r2.cloudflarestorage.com

# Resend (email)
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@dogapp.io

# Expo (notifications push)
EXPO_ACCESS_TOKEN=xxx

# Google Places (vétérinaires)
GOOGLE_PLACES_API_KEY=xxx

# === MOBILE ===
EXPO_PUBLIC_API_URL=http://localhost:3001/api/v1

# === WEB ===
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

**Règles absolues :**
- `.env` n'est **jamais commité** (`.gitignore`)
- Les secrets de production sont dans les **secrets GitHub Actions** + variables d'environnement Fargate
- Chaque développeur a sa **branche Neon dédiée** avec ses propres variables dev

---

## 15. CI/CD

### Pipeline GitHub Actions

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]

jobs:
  quality:
    steps:
      - Lint (ESLint + Prettier check)
      - Typecheck (tsc --noEmit)
      - Unit tests (Jest)
      - Coverage check (> 80% sur les services)

  build:
    needs: quality
    steps:
      - Build API (NestJS)
      - Build Web (Next.js)
      - Build Mobile (Expo export)

  e2e:
    needs: build
    if: branch == 'staging'
    steps:
      - Deploy sur environnement éphémère
      - Playwright E2E tests
      - Teardown

  deploy-staging:
    needs: [build, e2e]
    if: branch == 'staging'
    steps:
      - Push Docker image → ECR
      - Deploy → ECS Fargate staging
      - Prisma migrate deploy (DATABASE_URL staging)

  deploy-prod:
    needs: build
    if: branch == 'main'
    environment: production      # Approbation manuelle requise
    steps:
      - Push Docker image → ECR
      - Deploy → ECS Fargate prod
      - Prisma migrate deploy (DATABASE_URL prod)
```

### Règles de déploiement

- **Staging** : automatique à chaque merge sur `staging`
- **Production** : manuel (bouton "Approve" dans GitHub Actions), après validation staging
- Les **migrations Prisma** sont toujours appliquées **avant** le déploiement du nouveau code
- En cas d'échec de migration → rollback automatique de l'image Docker

---

## 16. Ordre d'implémentation — MVP

> Suivre **exactement** cet ordre. Ne pas commencer une étape avant que la précédente soit terminée et testée.

---

### ÉTAPE 0 — Fondations (Semaine 1–2)

**0.1 — Monorepo et tooling**
- [ ] Initialiser monorepo pnpm + Turborepo
- [ ] Configurer TypeScript strict (tsconfig partagé)
- [ ] Configurer ESLint + Prettier + Husky + lint-staged
- [ ] Configurer Conventional Commits (commitlint)
- [ ] Créer le package `@dogapp/types` avec les types de base
- [ ] Créer le package `@dogapp/utils` avec `toCamelCase` / `toSnakeCase`

**0.2 — Base de données**
- [ ] Créer le projet Neon (branches main, staging, dev/init)
- [ ] Initialiser `@dogapp/database` avec Prisma
- [ ] Créer le schéma complet (toutes les tables définies dans le design doc)
- [ ] Appliquer la migration initiale sur la branche dev
- [ ] Créer le seed de base (races, référentiel poids, feature flags)

**0.3 — Backend NestJS — Socle**
- [ ] Initialiser l'app NestJS avec Fastify (plus performant qu'Express)
- [ ] Configurer PrismaService (injection globale)
- [ ] Configurer ConfigModule (variables d'environnement validées avec Zod)
- [ ] Configurer les intercepteurs globaux (Transform, Logging, Idempotency)
- [ ] Configurer les filtres d'exception globaux (HTTP, Prisma)
- [ ] Configurer @nestjs/swagger (OpenAPI 3.1)
- [ ] Configurer BullMQ + Upstash Redis
- [ ] Configurer le module Cloudflare R2
- [ ] Écrire les tests des guards et intercepteurs

**0.4 — Authentification**
- [ ] Module `auth` complet (register, login, refresh, logout, revoke-all)
- [ ] `JwtAuthGuard`, `JwtRefreshGuard`
- [ ] Hachage bcrypt des mots de passe (cost factor 12)
- [ ] Rotation du refresh token
- [ ] Table `RefreshToken` + nettoyage des tokens expirés (cron job)
- [ ] Tests unitaires et d'intégration de l'auth

**0.5 — Module Users**
- [ ] CRUD profil utilisateur
- [ ] Upload avatar (R2)
- [ ] Endpoint `GET /account/me`
- [ ] Endpoint `DELETE /account` (soft delete + purge planifiée)
- [ ] Endpoint `GET /account/export` (JSON/ZIP)

**0.6 — Module Dogs**
- [ ] CRUD chiens (multi-chiens par compte)
- [ ] `DogOwnerGuard`
- [ ] Upload photo chien (R2)
- [ ] Endpoints : `GET /dogs`, `POST /dogs`, `GET /dogs/:id`, `PATCH /dogs/:id`, `DELETE /dogs/:id`

**0.7 — CI/CD de base**
- [ ] GitHub Actions : lint + typecheck + tests
- [ ] Build Docker de l'API
- [ ] Deploy automatique staging (Neon branch staging)

---

### ÉTAPE 1 — Santé core / MVP (Semaine 3–5)

> Toutes les features de cette étape suivent le même pattern : Backend → Mobile → Web → Tests

**1.1 — F01 Carnet de santé**
- [ ] Backend : module `health/records` complet (CRUD + pagination cursor)
- [ ] Backend : module `attachments` (presigned URL R2, confirmation, suppression)
- [ ] Backend : `AuditLog` tracé sur toutes les opérations CRUD
- [ ] Mobile : écran liste (timeline), écran détail, bottom sheet création, swipe delete
- [ ] Mobile : upload pièces jointes (caméra + galerie)
- [ ] Web : page liste table + formulaire création
- [ ] Tests : unitaires service + intégration routes + E2E parcours

**1.2 — F02 Rappels vaccinations**
- [ ] Backend : module `health/reminders` (CRUD + marquage effectué + calcul prochaine échéance)
- [ ] Backend : jobs BullMQ planifiés (J-30, J-14, J-7, J-1) à la création/modification
- [ ] Backend : idempotence sur `PATCH /:id/done`
- [ ] Mobile : écran liste rappels (filtrés par urgence), chips type, swipe "Effectué"
- [ ] Web : widget dashboard + page complète
- [ ] Tests : planification des jobs, calcul d'échéance, idempotence

**1.3 — F03 Journal symptômes**
- [ ] Backend : module `health/symptoms` (CRUD + photo optionnelle)
- [ ] Mobile : écran journal (chips symptômes prédéfinis + champ libre), filtre par type/période
- [ ] Web : page liste + création
- [ ] Tests

**1.4 — F04 Programme médication**
- [ ] Backend : module `health/medications` (CRUD programme + `MedicationDoseLog`)
- [ ] Backend : jobs BullMQ pour chaque prise planifiée
- [ ] Backend : alerte stock faible (calcul à chaque confirmation de prise)
- [ ] Backend : idempotence sur la confirmation de prise
- [ ] Mobile : écran médicaments actifs, confirmation prise, historique prises
- [ ] Web : tableau médicaments + widget dashboard
- [ ] Tests : calcul stock, alerte seuil, idempotence

**1.5 — F05 Suivi poids**
- [ ] Backend : module `tracking/weight` (CRUD + plages recommandées par race/âge)
- [ ] Backend : idempotence sur `POST /weight`
- [ ] Mobile : écran courbe animée, sélecteur période, liste pesées, FAB "Peser"
- [ ] Web : widget dashboard + page détail
- [ ] Tests : calcul plage recommandée, alerte hors plage

**1.6 — F08 Soins hygiène**
- [ ] Backend : module `tracking/hygiene` (CRUD + calcul `nextDueAt`)
- [ ] Backend : jobs BullMQ rappels
- [ ] Mobile : écran liste soins, configuration fréquence, swipe "Effectué"
- [ ] Web : liste + widget dashboard
- [ ] Tests

**1.7 — F10 Annuaire vétérinaires**
- [ ] Backend : module `vets` (proxy Google Places API avec cache Redis TTL 24h)
- [ ] Backend : gestion des favoris (table `FavoriteVet`)
- [ ] Mobile : écran carte + liste, détail vétérinaire, appel direct, favori
- [ ] Web : page liste + mini map
- [ ] Tests : cache Redis, rate limiting Google API

**1.8 — F12 Check-up rapide**
- [ ] Backend : module `checkup` (questions en base, calcul score, enregistrement résultat)
- [ ] Backend : questionnaire adapté à l'âge du chien
- [ ] Mobile : flux complet (intro → questions → résultat → actions)
- [ ] Web : page check-up
- [ ] Tests : calcul score, logique de recommandation

**1.9 — Notifications push (infrastructure)**
- [ ] Backend : `NotificationService` générique
- [ ] Backend : gestion des `DeviceToken` (enregistrement, nettoyage tokens invalides)
- [ ] Mobile : permission push, enregistrement token, réception en foreground/background
- [ ] Tests : envoi mock, nettoyage tokens

---

### ÉTAPE 2 — Version enrichie (Semaine 6–8)

**2.1 — F06 Nutrition**
- [ ] Backend + Mobile + Web : `MealPlan` CRUD, calcul portions (référentiel FEDIAF), rappels repas

**2.2 — F07 Activité physique**
- [ ] Backend + Mobile + Web : `Activity` CRUD, tracé GPS optionnel, calendrier balades, estimation calories

**2.3 — F13 Partage vétérinaire**
- [ ] Backend : génération token, TTL, max_accesses, révocation, journal `SharingLinkAccess`
- [ ] Backend : génération PDF (pdf-lib) avec watermark
- [ ] Backend : notification push au propriétaire à la première consultation
- [ ] Web : portail vétérinaire public (`/share/[token]`)
- [ ] Mobile : écran partage, sélection sections, affichage journal d'accès
- [ ] Tests : révocation, expiration, rate limit consultations, watermark PDF

**2.4 — Dashboard et améliorations**
- [ ] Web : dashboard complet avec widgets
- [ ] RGPD : endpoints export + delete complets
- [ ] Infrastructure i18n (react-i18next mobile, next-intl web)

---

### ÉTAPE 3 — Version complète (Semaine 9–12)

**3.1 — F09 Pedigree** (derrière `FeatureFlag 'pedigree'`)
- [ ] Backend : intégration SCC (si API dispo) + fallback saisie manuelle
- [ ] Mobile + Web : affichage arbre généalogique, badge "non vérifié"

**3.2 — F11 Reproduction** (derrière `FeatureFlag 'reproduction'`, `is_breeder = true`)
- [ ] Backend + Mobile + Web : `HeatCycle`, `Reproduction`, prédictions, notifications

**3.3 — F14 Réseau social** (derrière `FeatureFlag 'social'`)
- [ ] Backend : `Post`, `Group`, `GroupMember`, `Event`, modération
- [ ] Mobile + Web : fil d'actualité, groupes, événements, calendrier
- [ ] Modération : signalement, file de modération admin

**3.4 — Monétisation**
- [ ] Stripe : webhooks, gestion abonnement, middleware `PremiumGuard`
- [ ] Enforcement des limites gratuit/premium par feature

---

## 17. Checklist par feature

Avant de marquer une feature comme terminée, cocher **tous** ces points :

### Backend
- [ ] Controller avec décorateurs Swagger complets (`@ApiOperation`, `@ApiResponse`)
- [ ] DTOs validés avec `class-validator` (tous les champs typés)
- [ ] Guard `JwtAuthGuard` + `DogOwnerGuard` sur toutes les routes concernées
- [ ] Idempotence implémentée si applicable
- [ ] AuditLog tracé sur les opérations CRUD de données de santé
- [ ] Pagination cursor-based sur les endpoints de liste
- [ ] Réponses en format standard `{ data, meta }`
- [ ] Transformation `camelCase → snake_case` via intercepteur
- [ ] Tests unitaires du service (coverage > 80%)
- [ ] Tests d'intégration des routes (happy path + cas d'erreur)
- [ ] Documentation OpenAPI générée et vérifiée (`/api/docs`)

### Mobile
- [ ] Écran principal opérationnel (happy path)
- [ ] État vide avec illustration + CTA
- [ ] État de chargement (skeleton, pas de spinner seul)
- [ ] Gestion d'erreur avec message actionnable
- [ ] Offline : données lisibles sans réseau
- [ ] Mutations avec feedback visuel immédiat (optimistic update si pertinent)
- [ ] Pull-to-refresh fonctionnel
- [ ] Navigation correcte (back, deep links si applicable)
- [ ] Touch targets ≥ 44px sur tous les éléments interactifs

### Web
- [ ] Page responsive (mobile 640px, tablet 768px, desktop 1024px+)
- [ ] Loading state (skeleton)
- [ ] Gestion d'erreur
- [ ] SEO : `<title>` et `<meta description>` sur les pages publiques

### Tests et qualité
- [ ] Tests E2E du parcours principal (si dans les 5 parcours prioritaires)
- [ ] Lint + typecheck passent sans erreur
- [ ] Pas de `any`, `!`, `as` non justifiés introduits
- [ ] Review par un pair

---

## 18. Definition of Done

Une feature est **Done** quand :

1. **Code complet** : backend + mobile + web implémentés selon le plan
2. **Tests passent** : unitaires, intégration, E2E si applicable — CI vert
3. **Coverage** : ≥ 80% sur les services du module
4. **Revue de code** : au moins 1 approbation sur la PR
5. **Staging déployé** : feature validée sur l'environnement staging
6. **OpenAPI à jour** : les nouveaux endpoints apparaissent dans `/api/docs`
7. **Specs mises à jour** : si une décision change les specs, le document est mis à jour
8. **Pas de dette technique introduite** : pas de TODO non documenté, pas de hack temporaire sans issue créée

---

## 19. Erreurs fréquentes à éviter

| ❌ Ne jamais faire | ✅ Faire à la place |
|------------------|-------------------|
| Appeler Prisma directement dans un Controller ou Service | Passer systématiquement par le Repository |
| Retourner l'objet Prisma brut dans la réponse API | Toujours mapper vers un ResponseDto |
| Utiliser `DELETE` en base pour les données de santé | Soft delete (`deletedAt`) |
| Oublier `DogOwnerGuard` sur une route avec `:dogId` | Appliquer les deux guards systématiquement |
| Modifier un fichier de migration Prisma manuellement | Créer une nouvelle migration |
| Utiliser `DATABASE_URL_UNPOOLED` en production | Réserver à Prisma migrate uniquement |
| Committer un `.env` avec de vraies valeurs | Utiliser `.env.example` uniquement |
| Écrire de la logique dans un composant React | Extraire dans un hook ou un service |
| Utiliser `any` en TypeScript | `unknown` + narrowing ou typage précis |
| Faire un appel API depuis un Zustand store | Les stores sont de l'état pur — les appels dans React Query |
| Déployer en production sans migration testée en staging | Toujours staging avant prod |
| Hardcoder une URL ou une valeur de config | Passer par ConfigModule / variables d'env |
| Merger sur `main` sans approbation manuelle | Toujours approbation de déploiement prod |
| Implémenter une feature sans son test unitaire | Tests en même temps que le code (ou avant : TDD) |
| Sauter une étape de l'ordre d'implémentation | Suivre §16 à la lettre |
