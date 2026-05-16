# CLAUDE.md — DogApp

> Ce fichier est lu automatiquement par Claude et Cursor à chaque session.  
> Il contient les règles non négociables du projet. En cas de doute, **ce fichier + `DogApp_Specs/05_plan_developpement.md` ont autorité sur tout le reste.**

---

## Ce qu'est ce projet

Application de suivi et gestion de chiens de compagnie.  
**Monorepo pnpm + Turborepo** avec 3 apps et 2 packages partagés.

```
apps/api/        → Backend NestJS (Fastify)
apps/mobile/     → React Native (Expo Router)
apps/web/        → Next.js 14 (App Router)
packages/database/  → Prisma + Neon (PostgreSQL)
packages/types/     → Types TypeScript partagés
packages/utils/     → Utilitaires partagés (case conversion, dates)
```

**Stack complète :** NestJS · React Native Expo · Next.js · Neon (PostgreSQL 16) · Upstash Redis · Cloudflare R2 · BullMQ · React Query · Zustand · Prisma · @nestjs/swagger · pdf-lib · Resend · Expo Notifications

---

## Lire avant de coder

| Document | Contenu |
|----------|---------|
| `DogApp_Specs/01_specs_fonctionnelles.md` | Les 14 fonctionnalités (F01–F14), user stories, règles métier |
| `DogApp_Specs/02_specs_techniques_architecture.md` | Stack, schéma DB, APIs, sécurité, infra |
| `DogApp_Specs/03_lots_mvp_et_full.md` | Ce qui est dans le MVP vs Lot 2 vs Lot 3 |
| `DogApp_Specs/04_design_book.md` | Palette, typographie, composants, direction UI |
| `DogApp_Specs/05_plan_developpement.md` | **Référence principale** : architecture exacte, templates, ordre d'implémentation, checklists |

---

## Règles TypeScript — non négociables

```json
// tsconfig : strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitReturns
```

- `any` → **INTERDIT**. Utiliser `unknown` + narrowing.
- `as` → **INTERDIT** sauf commentaire `// SAFE: raison`.
- `!` (non-null assertion) → **INTERDIT** sauf dans les tests.
- Toutes les fonctions publiques ont un **type de retour explicite**.
- Les interfaces sont `PascalCase`. Les fichiers sont `kebab-case`.

---

## Architecture backend — règle d'or

```
Controller → Service → Repository (Prisma)
```

- Le **Controller** ne contient jamais de logique métier.
- Le **Service** ne fait jamais d'appels Prisma directs.
- Le **Repository** ne contient que des requêtes DB, zéro logique.
- Chaque module suit la structure : `controller · service · repository · dto/ · *.spec.ts`

### Guards obligatoires

Toute route avec `:dogId` dans l'URL **doit** avoir :
```typescript
@UseGuards(JwtAuthGuard, DogOwnerGuard)
```
Ne jamais oublier le `DogOwnerGuard` — c'est une faille de sécurité.

### Réponses API

Format standard **obligatoire** sur tous les endpoints :
```json
{ "data": { ... } }                          // objet unique
{ "data": [...], "meta": { "next_cursor": "..." , "has_more": true } }  // liste
```
Erreurs en RFC 7807 : `{ "type", "title", "status", "detail", "instance" }`

Transformation `camelCase → snake_case` via `TransformInterceptor` global — ne pas le faire manuellement.

---

## Base de données — règles Prisma

- Chaque modèle a : `id String @id @default(cuid())` + `createdAt` + `updatedAt`
- Les données de santé utilisent **soft delete** : `deletedAt DateTime?` — jamais de DELETE physique.
- **Ne jamais modifier** un fichier dans `prisma/migrations/` manuellement.
- `DATABASE_URL` (poolé) → API en production.
- `DATABASE_URL_UNPOOLED` → Prisma migrate **uniquement**.
- Index obligatoire sur toutes les FK et les champs filtrés (`dogId`, `dueDate`, `isActive`…).

---

## Conventions de nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Fichiers | `kebab-case` | `health-record.service.ts` |
| Classes / Interfaces | `PascalCase` | `HealthRecordService` |
| DTOs | `PascalCase` + suffixe | `CreateHealthRecordDto` |
| Fonctions | `camelCase` | `findAllByDog()` |
| Constantes | `SCREAMING_SNAKE_CASE` | `JWT_EXPIRY` |
| Composants React | `PascalCase` | `HealthRecordCard` |
| Hooks | `use` + `camelCase` | `useHealthRecords` |
| Routes API | `kebab-case` | `/health-records` |
| Commits | Conventional Commits | `feat(api/health): add record endpoint` |

---

## Architecture mobile (React Native)

- **Expo Router** (file-based routing) — routes protégées dans `(tabs)/`
- **Zustand** : état global uniquement, **jamais d'appels API dans un store**
- **React Query** : tous les appels API et la gestion du cache
- **QueryKey convention** : `[feature, entityId, ...filters]`
- Composants dans `components/ui/` → purement présentationnels, zéro store, zéro API
- Touch targets : **minimum 44×44px** sur tous les éléments interactifs

---

## Architecture web (Next.js)

- Server Components par défaut — `'use client'` uniquement si interactivité nécessaire
- React Query pour les données interactives côté client
- Le portail vétérinaire `/share/[token]` est **public**, pas d'auth

---

## Idempotence — obligatoire sur ces endpoints

Utiliser l'en-tête `Idempotency-Key` (UUID v4 généré par le client) :
- `POST /dogs/:id/health/medications/:medId/doses` (prise médicament)
- `POST /dogs/:id/weight` (pesée)
- `PATCH /dogs/:id/health/reminders/:remId/done` (rappel effectué)
- `POST /sharing/links` (génération lien partage)

---

## Stockage fichiers (Cloudflare R2)

Clé R2 : `{env}/{ownerId}/{dogId}/{feature}/{uuid}.{ext}`  
Upload : URL pré-signée (TTL 5 min) → client upload directement → client confirme à l'API.  
Accès : URLs signées à durée limitée (1h lecture, 24h download) — **jamais d'URL publique permanente**.

---

## Notifications

BullMQ + Upstash Redis. Workers dans `notifications/notification.processor.ts`.  
`jobId` unique sur chaque job de rappel pour éviter les doublons.  
Nettoyage des tokens push invalides après chaque envoi FCM/APNs.

---

## Tests — règles minimales

- Coverage **≥ 80%** sur tous les services avant de merger
- Pas de vrais appels réseau dans les tests — tout est mocké
- Un `it()` teste **une seule chose**
- Les 5 parcours E2E (définis dans `05_plan_developpement.md §12`) sont la priorité

---

## Git

- Branches : `main` (prod) · `staging` · `dev/[feature]` · `fix/[bug]`
- Format commit : `type(scope): description` — ex. `feat(api/health): add record endpoint`
- Merge sur `main` : approbation **manuelle** obligatoire (environnement GitHub Actions protégé)
- Squash merge systématique vers `main`

---

## Secrets — règles absolues

- `.env` n'est **jamais commité** — `.env.example` uniquement
- Chaque dev a sa propre branche Neon pour le développement local
- Pas de Docker en local pour la DB — Neon uniquement

---

## Ordre d'implémentation (MVP)

Suivre **exactement** cet ordre (détail dans `05_plan_developpement.md §16`) :

```
0. Fondations       → Monorepo · Prisma/Neon · NestJS socle · Auth · Users · Dogs · CI/CD
1. Santé core MVP   → F01 Carnet · F02 Rappels · F03 Symptômes · F04 Médicaments
                      F05 Poids · F08 Hygiène · F10 Vétérinaires · F12 Check-up · Notifs push
2. Enrichi          → F06 Nutrition · F07 Activité · F13 Partage vétérinaire · Dashboard
3. Complet          → F09 Pedigree · F11 Reproduction · F14 Social · Monétisation Stripe
```

**Ne pas commencer une étape avant que la précédente soit terminée ET testée.**

---

## Feature flags

F09, F11 et F14 sont désactivés par défaut en table `FeatureFlag`.  
Les activer via `PATCH /api/v1/admin/feature-flags/:key` sans redéploiement.  
Utiliser `@FeatureFlagGuard('pedigree')` sur les routes concernées.

---

## Ce qui est exclu en v1

- Microservices (monolithe modulaire uniquement)
- Docker en local (Neon + Upstash directement)
- Compte vétérinaire (lien invité uniquement)
- Multi-propriétaire d'un chien
- Télémédecine, IA diagnostic
- Dark Mode (prévu v2)

---

## Checklist avant chaque PR

- [ ] Lint + typecheck passent (`pnpm lint && pnpm typecheck`)
- [ ] Tests passent, coverage ≥ 80% sur les services modifiés (`pnpm test`)
- [ ] Pas de `any`, `!`, `as` non justifiés
- [ ] `DogOwnerGuard` présent sur toutes les routes `:dogId`
- [ ] Réponses API au format standard `{ data, meta }`
- [ ] OpenAPI à jour (visible sur `/api/docs`)
- [ ] État vide + loading + erreur implémentés côté client
- [ ] Touch targets ≥ 44px (mobile)
