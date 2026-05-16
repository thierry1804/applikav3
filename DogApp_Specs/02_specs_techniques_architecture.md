# Spécifications Techniques & Architecture Cible — DogApp
**Version :** 1.1  
**Date :** Mai 2026  
**Statut :** Draft — mis à jour suite à l'analyse critique v1.0  

---

## Table des matières

1. [Vue d'ensemble de l'architecture](#1-vue-densemble-de-larchitecture)
2. [Stack technique](#2-stack-technique)
3. [Architecture applicative](#3-architecture-applicative)
4. [Modèle de données](#4-modèle-de-données)
5. [APIs et intégrations externes](#5-apis-et-intégrations-externes)
6. [Sécurité](#6-sécurité)
7. [Infrastructure et déploiement](#7-infrastructure-et-déploiement)
8. [Notifications](#8-notifications)
9. [Hors-ligne et synchronisation](#9-hors-ligne-et-synchronisation)
10. [Performance et scalabilité](#10-performance-et-scalabilité)

---

## 1. Vue d'ensemble de l'architecture

DogApp adopte une architecture **découplée front/back** de type **API-first**, permettant de servir simultanément l'application mobile et l'application web depuis un socle backend unique.

> **Monolithe modulaire (v1) :** le backend est un **monolithe NestJS modulaire**, pas une architecture microservices. Les blocs du diagramme ci-dessous représentent des **modules logiques** au sein d'une seule application déployée. Un découpage en microservices n'est envisagé qu'au-delà d'un seuil à définir (ex. : > 100k utilisateurs actifs, ou équipe > 5 développeurs backend). Cette décision est documentée dans l'ADR correspondant.

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTS                          │
│  ┌──────────────┐          ┌──────────────────────┐ │
│  │  Mobile App  │          │      Web App         │ │
│  │ React Native │          │    React (Next.js)   │ │
│  └──────┬───────┘          └──────────┬───────────┘ │
└─────────┼────────────────────────────┼─────────────┘
          │           HTTPS / REST     │
          │         + WebSocket (notif)│
┌─────────▼────────────────────────────▼─────────────┐
│                   API GATEWAY                       │
│            (Kong / AWS API Gateway)                 │
│    Auth · Rate limiting · Routing · Logging         │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│               BACKEND (Node.js / NestJS)             │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │  Health  │ │ Activity │ │    Notifications      │ │
│  │ Module   │ │ Module   │ │      Module           │ │
│  └──────────┘ └──────────┘ └──────────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │  Social  │ │ Pedigree │ │    Export / PDF       │ │
│  │ Module   │ │ Module   │ │      Module           │ │
│  └──────────┘ └──────────┘ └──────────────────────┘ │
└───────────────────────────────┬─────────────────────┘
                                │
        ┌───────────────────────┼──────────────────┐
        │                       │                  │
┌───────▼──────┐    ┌───────────▼──────┐   ┌───────▼──────┐
│  Neon.tech   │    │      Redis       │   │   S3 / Blob  │
│ (PostgreSQL  │    │  (cache, queues, │   │  (fichiers,  │
│  serverless) │    │   sessions)      │   │  documents)  │
└──────────────┘    └──────────────────┘   └──────────────┘
```

---

## 2. Stack technique

### Frontend mobile — React Native (Expo)

| Élément | Choix | Justification |
|---------|-------|---------------|
| Framework | **React Native** (via Expo) | Code partagé iOS/Android, écosystème mature |
| Navigation | **React Navigation v7** | Standard de facto RN |
| State management | **Zustand** | Léger, simple, performant |
| Data fetching | **React Query (TanStack)** | Cache, invalidation, offline support |
| UI components | **NativeWind** (Tailwind pour RN) | Cohérence design, productivité |
| Graphiques | **Victory Native** | Charts SVG natifs RN |
| Cartes / GPS | **React Native Maps** + Expo Location | Géolocalisation, tracé promenades |
| Storage local | **MMKV** | Stockage chiffré rapide (offline) |
| Push notifs | **Expo Notifications** | Simplifie APNs + FCM |
| Tests | **Jest** + **Testing Library** | |

### Frontend web — Next.js

| Élément | Choix | Justification |
|---------|-------|---------------|
| Framework | **Next.js 14** (App Router) | SSR/SSG, SEO, performance |
| State management | **Zustand** | Cohérence avec mobile |
| Data fetching | **React Query (TanStack)** | Cohérence avec mobile |
| UI components | **shadcn/ui** + **Tailwind CSS** | Design system cohérent, personnalisable |
| Graphiques | **Recharts** | Léger, React-friendly |
| Cartes | **Leaflet.js** (via react-leaflet) | Open source, pas de coût d'API carte |
| Tests | **Jest** + **Playwright** (E2E) | |

### Backend — NestJS (Node.js)

| Élément | Choix | Justification |
|---------|-------|---------------|
| Runtime | **Node.js 22 LTS** | Performances I/O, large écosystème |
| Framework | **NestJS** | Architecture modulaire, DI, TypeScript natif |
| ORM | **Prisma** | Type-safe, migrations, support PostgreSQL natif |
| Validation | **Zod** + class-validator | Validation runtime des entrées |
| Auth | **Passport.js** + **JWT** | Standard, extensible (OAuth2 social login) |
| Queue / jobs | **BullMQ** (Redis) | Notifications différées, exports PDF |
| WebSocket | **Socket.io** | Notifications temps réel |
| PDF export | **pdf-lib** + **@react-pdf/renderer** | Génération PDF légère côté serveur, sans Chromium (gratuit, faible empreinte mémoire sur Fargate) |
| Contrat API | **@nestjs/swagger** (OpenAPI 3.1) | Génération automatique du contrat API depuis les décorateurs NestJS (gratuit) |
| Tests | **Jest** + **Supertest** | |

### Base de données

| Rôle | Technologie | Justification |
|------|-------------|---------------|
| Base principale | **Neon.tech** (PostgreSQL 16 serverless) | PostgreSQL managé, serverless avec autoscaling, branchement de DB pour staging/dev |
| Cache & sessions | **Upstash Redis** (serverless) | Gratuit jusqu'à 10 000 commandes/jour et 256 Mo — sans serveur, compatible BullMQ |
| Stockage fichiers | **Cloudflare R2** | 10 Go gratuits, 0 frais d'egress, compatibilité API S3 — meilleur tier gratuit que AWS S3 |
| Recherche | **PostgreSQL Full-Text Search** (intégré Neon) | Suffisant en v1 ; bascule vers Meilisearch ou Typesense si > 500k posts ou requêtes lentes |

> **Tiers gratuits retenus :**
> - **Neon** : free tier = 0,5 Go, 1 projet, branches illimitées, scale-to-zero. **Production = plan Pro ($19/mo) avec always-on obligatoire** (le scale-to-zero est incompatible avec l'objectif TTFB < 200 ms en p95). Dev et staging restent sur branches gratuites.
> - **Upstash Redis** : free tier suffisant pour MVP et staging. Passer au plan Pay-as-you-go dès dépassement des 10k commandes/jour en production.
> - **Cloudflare R2** : free tier (10 Go + sans egress) couvre les besoins jusqu'à ~10 000 utilisateurs actifs avec photos et PDF.

---

## 3. Architecture applicative

### Découpage en modules (Backend NestJS)

```
src/
├── auth/               # Authentification, JWT, refresh tokens
├── users/              # Gestion comptes propriétaires
├── dogs/               # Profils chiens (multi-chiens)
├── health/
│   ├── records/        # F01 - Carnet de santé
│   ├── reminders/      # F02 - Rappels vaccins/traitements
│   ├── symptoms/       # F03 - Journal symptômes
│   └── medications/    # F04 - Programme médication
├── tracking/
│   ├── weight/         # F05 - Suivi poids
│   ├── nutrition/      # F06 - Alimentation
│   ├── activity/       # F07 - Activité physique
│   └── hygiene/        # F08 - Soins hygiène
├── pedigree/           # F09 - Pedigree LOF/LOMAD
├── vets/               # F10 - Annuaire vétérinaires
├── reproduction/       # F11 - Chaleurs et reproduction
├── checkup/            # F12 - Check-up rapide
├── sharing/            # F13 - Partage vétérinaire
├── social/             # F14 - Réseau social
│   ├── posts/
│   ├── groups/
│   └── events/
├── notifications/      # Service transverse notifications
├── exports/            # Service export PDF
└── common/             # Guards, decorators, utils
```

### Pattern d'architecture par module

Chaque module suit le pattern **Controller → Service → Repository (Prisma)** :

```
Request
  └─► Controller (validation HTTP, routing)
        └─► Service (logique métier)
              └─► Repository / Prisma (accès données)
```

### API REST — conventions

- **Versioning** : `/api/v1/...`
- **Auth** : Bearer token JWT dans l'en-tête `Authorization`
- **Format** : JSON, `snake_case` pour les champs en transit API. Les clients (TypeScript) et le backend appliquent une **couche de mapping systématique** (`snake_case` ↔ `camelCase`) via un intercepteur NestJS côté serveur et une fonction utilitaire partagée côté clients, afin d'éviter tout écart entre équipes mobile, web et API.
- **Contrat API** : OpenAPI 3.1 généré automatiquement depuis les décorateurs `@nestjs/swagger`, versionné avec le code et exposé sur `/api/docs` (Swagger UI). Ce contrat est la **source de vérité unique** pour les deux clients.
- **Idempotence** : en-tête `Idempotency-Key` (UUID v4) requis sur les POST critiques : prise de médicament, pesée, marquage rappel effectué, génération de lien de partage. Le serveur rejette les doublons (clé déjà traitée) avec HTTP 409.
- **Pagination** : cursor-based (plus performante pour mobile)
- **Erreurs** : RFC 7807 (Problem Details)
- **Rate limiting** : 100 req/min par utilisateur authentifié

Exemple de routes principales :

```
GET    /api/v1/dogs                    # Liste des chiens du compte
POST   /api/v1/dogs                    # Créer un chien
GET    /api/v1/dogs/:id/health/records # Carnet de santé
POST   /api/v1/dogs/:id/health/records # Ajouter une visite
GET    /api/v1/dogs/:id/weight         # Historique poids
POST   /api/v1/dogs/:id/weight         # Ajouter une pesée
GET    /api/v1/vets?lat=&lng=&radius=  # Vétérinaires proches
POST   /api/v1/sharing/generate-link   # Générer lien de partage
GET    /api/v1/social/feed             # Fil communautaire
```

---

## 4. Modèle de données

### Schéma principal (simplifié)

```sql
-- Compte utilisateur
User
  id            UUID PK DEFAULT gen_random_uuid()
  email         VARCHAR UNIQUE
  password_hash VARCHAR
  name          VARCHAR
  avatar_url    VARCHAR
  role          ENUM(owner, vet, admin)
  created_at    TIMESTAMP DEFAULT now()

-- Profil chien
Dog
  id            UUID PK DEFAULT gen_random_uuid()
  owner_id      UUID FK → User
  name          VARCHAR
  breed         VARCHAR
  birth_date    DATE
  sex           ENUM(male, female)
  sterilized    BOOLEAN
  weight_kg     DECIMAL(5,2)
  lof_number    VARCHAR NULL
  lomad_number  VARCHAR NULL
  chip_number   VARCHAR NULL
  photo_url     VARCHAR NULL
  created_at    TIMESTAMP DEFAULT now()

-- Visite vétérinaire
HealthRecord
  id            UUID PK DEFAULT gen_random_uuid()
  dog_id        UUID FK → Dog
  vet_name      VARCHAR
  visit_date    DATE
  reason        TEXT
  diagnosis     TEXT
  notes         TEXT
  created_at    TIMESTAMP DEFAULT now()

-- Rappels (vaccins, traitements)
Reminder
  id            UUID PK DEFAULT gen_random_uuid()
  dog_id        UUID FK → Dog
  type          ENUM(vaccine, deworming, antiparasitic, custom)
  label         VARCHAR
  due_date      DATE
  recurrence_days INT NULL
  last_done_at  DATE NULL
  is_active     BOOLEAN DEFAULT true

-- Symptômes
SymptomLog
  id            UUID PK DEFAULT gen_random_uuid()
  dog_id        UUID FK → Dog
  logged_at     TIMESTAMP
  symptoms      JSONB       -- liste de symptômes
  severity      SMALLINT    -- 1-3
  notes         TEXT NULL
  photo_url     VARCHAR NULL

-- Médicaments
Medication
  id            UUID PK DEFAULT gen_random_uuid()
  dog_id        UUID FK → Dog
  name          VARCHAR
  dosage        VARCHAR
  frequency     JSONB       -- { times_per_day, interval_hours, ... }
  start_date    DATE
  end_date      DATE NULL
  stock_count   INT NULL
  stock_alert_threshold INT NULL
  is_active     BOOLEAN DEFAULT true

-- Pesées
WeightLog
  id            UUID PK DEFAULT gen_random_uuid()
  dog_id        UUID FK → Dog
  weighed_at    DATE
  weight_kg     DECIMAL(5,2)

-- Promenades
Activity
  id            UUID PK DEFAULT gen_random_uuid()
  dog_id        UUID FK → Dog
  started_at    TIMESTAMP
  duration_min  INT
  distance_km   DECIMAL(6,2) NULL
  calories_est  INT NULL
  gps_track     JSONB NULL   -- tableau de coordonnées
  notes         TEXT NULL

-- Événements sociaux
Event
  id            UUID PK DEFAULT gen_random_uuid()
  title         VARCHAR
  description   TEXT
  event_date    DATE
  location      VARCHAR
  created_by    UUID FK → User
  is_published  BOOLEAN DEFAULT false

-- Lien de partage vétérinaire
SharingLink
  id            UUID PK DEFAULT gen_random_uuid()
  dog_id        UUID FK → Dog
  token         VARCHAR UNIQUE
  expires_at    TIMESTAMP
  sections      JSONB       -- sections incluses dans le partage
  access_count  INT DEFAULT 0
  max_accesses  INT DEFAULT 10

-- Journal d'accès au lien de partage
SharingLinkAccess
  id            UUID PK DEFAULT gen_random_uuid()
  link_id       UUID FK → SharingLink
  accessed_at   TIMESTAMP
  ip_partial    VARCHAR    -- ex. "212.47.xxx.xxx"

-- Journal des prises de médicament (confirmées / manquées)
MedicationDoseLog
  id            UUID PK DEFAULT gen_random_uuid()
  medication_id UUID FK → Medication
  scheduled_at  TIMESTAMP
  taken_at      TIMESTAMP NULL
  status        ENUM(taken, missed, skipped)
  idempotency_key VARCHAR UNIQUE  -- prévention doubles soumissions

-- Plan nutritionnel (F06)
MealPlan
  id            UUID PK DEFAULT gen_random_uuid()
  dog_id        UUID FK → Dog
  food_type     ENUM(kibble, wet, barf, mixed)
  meals_per_day INT
  grams_per_meal DECIMAL(6,2)
  calories_per_day INT NULL
  notes         TEXT NULL
  is_active     BOOLEAN DEFAULT true
  created_at    TIMESTAMP DEFAULT now()

-- Rappels soins hygiène (F08)
HygieneCare
  id            UUID PK DEFAULT gen_random_uuid()
  dog_id        UUID FK → Dog
  care_type     ENUM(teeth, nails, bath, brushing, grooming, ears, custom)
  label         VARCHAR NULL   -- si custom
  frequency_days INT
  last_done_at  DATE NULL
  next_due_at   DATE
  is_active     BOOLEAN DEFAULT true

-- Cycles de chaleur (F11)
HeatCycle
  id            UUID PK DEFAULT gen_random_uuid()
  dog_id        UUID FK → Dog
  start_date    DATE
  end_date      DATE NULL
  duration_days INT NULL        -- calculé
  notes         TEXT NULL

-- Saillie et gestation (F11)
Reproduction
  id            UUID PK DEFAULT gen_random_uuid()
  dog_id        UUID FK → Dog
  heat_cycle_id UUID FK → HeatCycle NULL
  mating_date   DATE
  sire_name     VARCHAR NULL
  sire_chip     VARCHAR NULL
  expected_birth DATE NULL       -- mating_date + 63 jours
  actual_birth  DATE NULL
  pups_count    INT NULL

-- Résultats check-up (F12)
CheckupResult
  id            UUID PK DEFAULT gen_random_uuid()
  dog_id        UUID FK → Dog
  taken_at      TIMESTAMP
  score         SMALLINT        -- 0-100
  recommendation ENUM(good, watch, consult)
  answers       JSONB           -- réponses brutes
  saved_to_health_record BOOLEAN DEFAULT false

-- Posts communauté (F14)
Post
  id            UUID PK DEFAULT gen_random_uuid()
  author_id     UUID FK → User
  dog_id        UUID FK → Dog NULL
  group_id      UUID FK → Group NULL
  content       TEXT
  image_urls    JSONB NULL
  likes_count   INT DEFAULT 0
  created_at    TIMESTAMP DEFAULT now()
  is_deleted    BOOLEAN DEFAULT false

-- Groupes (F14)
Group
  id            UUID PK DEFAULT gen_random_uuid()
  name          VARCHAR
  description   TEXT
  created_by    UUID FK → User
  member_count  INT DEFAULT 0
  created_at    TIMESTAMP DEFAULT now()

-- Membres de groupes (F14)
GroupMember
  group_id      UUID FK → Group
  user_id       UUID FK → User
  joined_at     TIMESTAMP DEFAULT now()
  PRIMARY KEY (group_id, user_id)

-- Pièces jointes (F01 — ordonnances, photos)
Attachment
  id            UUID PK DEFAULT gen_random_uuid()
  health_record_id UUID FK → HealthRecord NULL
  symptom_log_id   UUID FK → SymptomLog NULL
  file_key      VARCHAR        -- clé Cloudflare R2
  file_name     VARCHAR
  file_size_bytes INT
  mime_type     VARCHAR
  uploaded_at   TIMESTAMP DEFAULT now()

-- Journal d'audit (données de santé)
AuditLog
  id            UUID PK DEFAULT gen_random_uuid()
  user_id       UUID FK → User
  action        VARCHAR        -- ex. READ_HEALTH_RECORD, UPDATE_MEDICATION
  entity_type   VARCHAR
  entity_id     UUID
  created_at    TIMESTAMP DEFAULT now()
  retention_until TIMESTAMP    -- created_at + 1 an

-- Feature flags (activation sans redéploiement)
FeatureFlag
  key           VARCHAR PK     -- ex. 'pedigree', 'social', 'reproduction'
  is_enabled    BOOLEAN DEFAULT false
  description   TEXT NULL
  updated_at    TIMESTAMP DEFAULT now()
```

---

## 5. APIs et intégrations externes

| Intégration | Usage | API / Source |
|-------------|-------|--------------|
| **SCC (Société Centrale Canine)** | Récupération pedigree LOF | API SCC (si disponible) — **fallback : saisie manuelle + badge "non vérifié"** |
| **LOMAD Madagascar** | Pedigree LOMAD | Pas d'API publique connue — **saisie manuelle uniquement en v1** |
| **Google Places API** | Annuaire vétérinaires géolocalisé | $200 crédit gratuit/mois (quota suffisant au démarrage). Cache Redis TTL 24h pour limiter les appels. Maximum 5 requêtes/utilisateur/heure. |
| **Firebase Cloud Messaging (FCM)** | Push notifications Android | Gratuit |
| **Apple Push Notification Service (APNs)** | Push notifications iOS | Gratuit |
| **Resend** | Emails transactionnels | **Gratuit jusqu'à 3 000 emails/mois** (1 domaine). Passer au plan Pro ($20/mo) si dépassement. |
| **Cloudflare R2** | Stockage fichiers (photos, PDF, ordonnances) | **10 Go gratuits, 0 frais d'egress**, API compatible S3 |
| **Stripe** | Monétisation (abonnement premium — Lot 3) | Sans abonnement mensuel, frais à la transaction uniquement (1,4% + 25¢ EU) |

---

## 6. Sécurité

### Authentification & autorisation

- **Authentification** : JWT (access token 15 min) + refresh token (30 jours, rotation à chaque usage).
- **Refresh token :** rotation à chaque usage (le précédent est invalidé immédiatement). En cas de détection de réutilisation d'un token révoqué, tous les tokens de l'utilisateur sont révoqués (protection contre le vol de session). Sur mobile, le refresh token est stocké dans le keychain sécurisé (Expo SecureStore).
- **OAuth2** : Connexion via Google en option (Apple en v1.1 si requis par App Store).
- **RBAC v1** : Rôles `owner` et `admin` uniquement. Le rôle `vet` est absent en v1 (accès par lien sécurisé sans compte). Le flag `is_breeder` est un champ booléen sur `User`, pas un rôle.
- Stockage du refresh token en base (révocable) et en `httpOnly cookie` côté web.
- **Révocation globale :** endpoint `POST /api/v1/auth/revoke-all` permettant à l'utilisateur de déconnecter tous ses appareils.

### Protection des données

- **Chiffrement en transit** : HTTPS/TLS 1.3 obligatoire.
- **Chiffrement au repos** : AES-256 pour les données sensibles (données de santé, documents).
- **Isolation multi-tenant** : Chaque requête filtrée par `owner_id` au niveau ORM (jamais de requêtes globales sans contexte utilisateur).

### RGPD

- Consentement explicite à la création de compte pour : traitement des données de santé, géolocalisation, notifications marketing.
- Endpoint `/api/v1/account/export` : export complet des données en JSON/ZIP.
- Endpoint `/api/v1/account/delete` : suppression définitive (soft delete 30 j puis purge).
- Logs d'accès aux données de santé conservés 1 an.

### Protection des données de santé (RGPD)

Les données de santé du chien sont qualifiées de données personnelles de leur propriétaire. Sous-traitants impliqués (DPA à signer) : Neon, Cloudflare R2, Upstash, Resend, Google (Places API), Stripe.

| Champ | Classification | Mesure |
|-------|---------------|--------|
| Données visites vétérinaires | Sensible | Chiffrées au repos (Neon encryption at rest) |
| Ordonnances / documents | Sensible | Chiffrées dans R2, URLs signées à durée limitée |
| Tracés GPS | Personnel | Opt-in explicite, stockage JSON en base |
| Email, nom propriétaire | Personnel standard | Non exposé publiquement |

### AuditLog

Toute lecture ou modification d'une donnée de santé est tracée dans la table `AuditLog` avec `user_id`, `action`, `entity_type`, `entity_id`, `created_at`. Rétention : 1 an. La table est en lecture seule pour tous les rôles sauf `admin`.

### Autres mesures

- Rate limiting par IP et par utilisateur (API Gateway).
- Validation stricte de toutes les entrées (Zod + class-validator).
- Dépendances auditées via `npm audit` en CI/CD.
- **Lien de partage vétérinaire :** token opaque 256 bits, TTL configurable, maximum 10 consultations, en-têtes `X-Robots-Tag: noindex` et `Referrer-Policy: no-referrer`, journal d'accès consultable par le propriétaire (table `SharingLinkAccess`).

---

## 7. Infrastructure et déploiement

### Environnements

| Env | Usage | Infrastructure |
|-----|-------|---------------|
| `development` | Développement local | Branche Neon `dev` dédiée par développeur (créée depuis la branche `main`) |
| `staging` | Tests d'intégration / validation | Branche Neon `staging` (isolée de la prod, données anonymisées) + Redis managé |
| `production` | Utilisateurs finaux | Branche Neon `main` (production) + pool de connexions intégré (PgBouncer) |

### Cloud cible

```
├── ECS Fargate (ou Railway/Render pour MVP)  → Backend NestJS (scalable)
├── Neon.tech Pro (always-on, prod)           → PostgreSQL principal
│     └── Branches Neon (staging, dev/*)     → Gratuit (free tier)
├── Upstash Redis                             → Cache + queues (gratuit au démarrage)
├── Cloudflare R2                             → Stockage fichiers (10 Go gratuits)
├── Cloudflare CDN                            → Assets statiques + cache (gratuit)
├── Cloudflare DNS                            → DNS (gratuit)
├── ACM (ou Cloudflare SSL)                   → Certificats SSL (gratuit)
├── Grafana Cloud (free tier)                 → Logs, métriques, traces (10k séries, 50 Go logs)
├── Better Uptime (free tier)                 → Monitoring uptime + alertes
└── GitHub Actions                            → CI/CD (2 000 min/mois gratuits)
```

> **Coût minimal au lancement :** Neon Pro (~$19/mo) + ECS Fargate (variable, ~$15-30/mo pour un service minimal). Tout le reste sur free tiers. Budget infrastructure MVP estimé à **~$50/mois**.

### CI/CD

```
Push branch → GitHub Actions
  ├── lint + typecheck
  ├── tests unitaires (Jest)
  ├── tests E2E (Playwright)
  ├── build Docker image
  ├── push image → ECR
  └── deploy → ECS Fargate (staging auto, prod manuel)
```

### Docker

- Backend : image Node.js Alpine multi-stage (CI/CD uniquement).
- **Pas de Docker en local** : chaque développeur se connecte directement à sa branche Neon dédiée via la variable d'environnement `DATABASE_URL`.
- Redis : instance Upstash (serverless Redis, sans Docker) partagée par environnement.
- `docker-compose.yml` non requis — le fichier `.env.local` suffit pour pointer vers la bonne branche Neon et Upstash.

---

## 8. Notifications

### Architecture

Les notifications transitent par un **service dédié** asynchrone basé sur **BullMQ** (Redis) :

```
Événement déclencheur (rappel, alerte stock…)
  └─► BullMQ Job ajouté à la queue
        └─► Worker (planifié ou immédiat)
              ├─► Push (FCM / APNs) via Expo Notifications
              ├─► Email (Resend)
              └─► In-app (Socket.io → client connecté)
```

### Types de notifications

| Type | Canal | Déclencheur |
|------|-------|-------------|
| Rappel vaccin/traitement | Push + Email | J-30, J-14, J-7, J-1 avant échéance |
| Alerte médicament | Push | Heure de prise configurée |
| Stock médicament faible | Push + Email | Seuil de stock atteint |
| Rappel repas | Push | Heure de repas configurée |
| Rappel soin hygiène | Push | Date calculée selon fréquence |
| Période chaleur imminente | Push | J-7 avant date prédite |
| Événement communautaire | Push + Email | Mensuel + J-3 avant événement |
| Lien de partage expiré | Email | J-1 avant expiration |

---

## 9. Hors-ligne et synchronisation

### Mobile (React Query + MMKV)

- **Cache persistant** : React Query persiste le cache sur MMKV (chiffré).
- **Données disponibles offline** : Carnet de santé, rappels, médicaments, poids, activités des 30 derniers jours.
- **Mutations offline** : Stockées en queue locale et rejouées à la reconnexion (React Query `useMutation` + retry).
- **Conflits** : La stratégie varie selon le type de donnée pour protéger les données de santé critiques :

| Type de donnée | Stratégie de conflit |
|---------------|---------------------|
| Préférences UI, paramètres de notification | Last write wins (timestamp serveur) |
| Pesées, activités, soins hygiène | Last write wins (timestamp serveur) |
| Carnet de santé, journal symptômes | Merge guidé : si conflit détecté, les deux versions sont conservées et l'utilisateur choisit laquelle conserver |
| Prises de médicament | Pas de merge — idempotency key côté serveur, la prise est enregistrée une seule fois |
| Rappels (marquage effectué) | Idempotency key, last write wins |

### Web

- **Service Worker** (Next.js) : mise en cache des assets et des données de lecture.
- **Offline write** : Non supporté sur web dans un premier temps (v1).

---

## 10. Performance et scalabilité

### Cibles de performance

| Indicateur | Cible |
|------------|-------|
| Time to First Byte (API) | < 200 ms (p95) |
| Chargement initial app mobile | < 3 s (réseau 4G) |
| Chargement initial web (LCP) | < 2,5 s |
| Disponibilité | 99,5% |

### Stratégies d'optimisation

- **Pagination cursor-based** sur tous les endpoints de liste (pas de `OFFSET` en base).
- **Index PostgreSQL** sur `dog_id`, `due_date`, `logged_at`, `owner_id`.
- **Pool de connexions Neon** : utiliser l'URL poolée (PgBouncer intégré) pour les environnements serverless/edge, l'URL directe pour les migrations Prisma.
- **Cache Redis** pour les résultats coûteux : liste vétérinaires par zone, référentiels races/poids.
- **CDN** (Cloudflare) pour les assets statiques et les fichiers R2 (photos, avatars, PDFs).
- **Lazy loading** des modules non critiques (réseau social, pedigree) — contrôlé par `FeatureFlag`.
- **Auto-scaling** : ECS Fargate scale horizontal selon CPU/mémoire (seuil 70%).
- **Neon always-on en production** : scale-to-zero désactivé sur la branche `main` (plan Pro) pour garantir le TTFB < 200 ms. Scale-to-zero activé sur branches dev/staging (économie gratuite).

### SLI / SLO

| Indicateur (SLI) | Cible (SLO) | Périmètre |
|-----------------|-------------|-----------|
| Disponibilité API santé | 99,5% / mois | Endpoints F01–F04, F12 |
| Latence p95 API | < 300 ms | Tous endpoints hors export PDF |
| Latence export PDF | < 10 s (p90) | Exclu du SLO principal |
| Erreur rate | < 1% | Toutes routes authentifiées |
| Fenêtre d'exclusion | Maintenance planifiée annoncée 48h avant | |

### Feature flags

Les modules F09, F11 et F14 sont activés/désactivés via la table `FeatureFlag` en base, sans redéploiement. La valeur est lue au démarrage du serveur et mise en cache Redis (TTL 5 min). Un endpoint admin `PATCH /api/v1/admin/feature-flags/:key` permet la modification à chaud.

### Monitoring (tiers gratuits)

- **Logs et traces** : **Grafana Cloud** (free tier : 50 Go logs, 10 000 séries de métriques, 50 Go traces). Logs structurés JSON expédiés via `winston` + transport Loki.
- **Alertes** : Grafana Alerting (intégré, gratuit) — erreur rate > 1%, latence p95 > 500 ms, CPU > 80%.
- **Uptime** : **Better Uptime** (free tier : monitoring toutes les 3 min, alertes email/Slack).
- Neon et Upstash proposent leurs propres dashboards de métriques intégrés (gratuits).
