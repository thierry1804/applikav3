# Recommandations d'amélioration — DogApp

**Version :** 1.0  
**Date :** Mai 2026  
**Statut :** Proposition  
**Documents sources :** `01_specs_fonctionnelles.md`, `02_specs_techniques_architecture.md`

---

## Table des matières

1. [Synthèse](#1-synthèse)
2. [Incohérences à trancher](#2-incohérences-à-trancher)
3. [Périmètre MVP et roadmap](#3-périmètre-mvp-et-roadmap)
4. [Spécification fonctionnelle — compléments](#4-spécification-fonctionnelle--compléments)
5. [Spécification technique — risques et améliorations](#5-spécification-technique--risques-et-améliorations)
6. [Sécurité et conformité](#6-sécurité-et-conformité)
7. [Intégrations externes — plans de secours](#7-intégrations-externes--plans-de-secours)
8. [Observabilité et qualité](#8-observabilité-et-qualité)
9. [Processus documentaire](#9-processus-documentaire)
10. [Actions prioritaires](#10-actions-prioritaires)

---

## 1. Synthèse

Les spécifications fonctionnelles et techniques constituent une base solide : vision produit claire (14 fonctionnalités), stack moderne cohérente (API-first, NestJS, Neon, clients React Native + Next.js), et bonnes pratiques transverses (RGPD, offline mobile, notifications asynchrones).

Les recommandations ci-dessous visent à **réduire les ambiguïtés avant le développement**, **aligner les deux documents**, et **éviter la sur-ingénierie** sur un périmètre initial trop large.

---

## 2. Incohérences à trancher

Ces points bloquent des choix de conception s'ils restent implicites.

### 2.1 Rôle vétérinaire

| Document | Position actuelle |
|----------|-------------------|
| Fonctionnel | Rôle « Vétérinaire » avec consultation en lecture des données partagées |
| Technique | Portail web via lien sécurisé **sans obligation de compte** ; RBAC inclut `vet` |

**Recommandation :** Trancher explicitement dans les deux specs :

- **Option A (v1 minimal)** : accès uniquement par lien de partage (invité, lecture seule, token + TTL).
- **Option B** : compte vétérinaire dédié (historique des dossiers partagés, favoris).
- **Option C** : les deux — lien pour consultation ponctuelle, compte pour suivi récurrent.

**À documenter :** parcours d'invitation, révocation, et si le rôle `vet` en base est requis en v1.

### 2.2 Rôle éleveur

Le rôle « Éleveur » est décrit côté fonctionnel (pedigree, reproduction F11) mais le schéma technique ne propose que `owner | vet | admin`.

**Recommandation :** Choisir une règle unique :

- Ajouter un rôle `breeder` ou un flag `is_breeder` sur `User`, **ou**
- Définir l'éleveur comme `owner` avec activation conditionnelle des modules F09/F11 (documenter les prérequis : race, LOF/LOMAD, sexe, stérilisation).

### 2.3 Monétisation (Stripe)

Stripe est mentionné dans la spec technique (abonnement premium) mais absent des fonctionnalités fonctionnelles.

**Recommandation :** Ajouter une section **Offres et monétisation** (gratuit vs premium : limites, fonctionnalités payantes) **ou** retirer Stripe du draft technique jusqu'à décision produit.

### 2.4 Architecture microservices vs monolithe

Le diagramme d'architecture montre des services séparés (Health, Activity, Social, etc.) alors que l'implémentation cible est un **monolithe NestJS modulaire**.

**Recommandation :** Clarifier dans la spec technique que les blocs du diagramme sont des **modules logiques** en v1, et que le découpage en microservices n'est envisagé qu'au-delà d'un seuil de charge ou d'équipe défini (à préciser).

---

## 3. Périmètre MVP et roadmap

Quatorze fonctionnalités + social + pedigree + offline + intégrations externes représentent un lot important pour un premier livrable.

### 3.1 Découpage proposé

| Phase | Fonctionnalités suggérées | Objectif |
|-------|---------------------------|----------|
| **MVP** | F01–F04, F05, F10 (basique), F13 (export PDF), auth, multi-chiens, notifications essentielles | Valeur santé immédiate |
| **v1.1** | F06–F08, F12, renforcement offline mobile | Quotidien et prévention |
| **v2** | F09 (LOF/LOMAD), F11, F14 (social complet) | Éleveurs et communauté |

### 3.2 Critères d'acceptation

Pour chaque fonctionnalité F01–F14, compléter les user stories par des **critères d'acceptation testables** (format Given / When / Then ou checklist QA), pas seulement une description narrative.

### 3.3 Section « Hors périmètre v1 »

Documenter explicitement ce qui n'est **pas** prévu au premier lancement, par exemple :

- Télémédecine ou téléconsultation intégrée
- Diagnostic médical automatisé (au-delà du disclaimer F12)
- Co-propriété d'un chien par plusieurs comptes (sauf décision contraire)

---

## 4. Spécification fonctionnelle — compléments

### 4.1 F12 — Check-up rapide

- Renforcer le **cadre légal** : disclaimer visible, absence de diagnostic, conservation des résultats, adaptation des questions à l'âge du chien.
- Lier les recommandations du score à des **actions concrètes** (ex. ouverture de l'annuaire F10, ajout d'une entrée symptôme F03).

### 4.2 F13 — Partage vétérinaire

Préciser :

- Révocation du lien avant expiration
- Notification au propriétaire en cas d'accès au lien
- Watermark ou métadonnées sur les PDF exportés
- Sections **exclues par défaut** (réseau social, tracés GPS détaillés, etc.)

### 4.3 F14 — Réseau social

Compléter :

- Politique de modération (signalement, délais, contenus interdits)
- Gestion des données personnelles vs profil public du chien
- Consentement explicite pour toute exposition du propriétaire

### 4.4 Référentiels métier (F05, F06)

Les plages de poids et calculs nutritionnels dépendent de données externes non spécifiées.

**Recommandation :** Documenter la **source des référentiels** (base interne, partenaire, mise à jour, responsabilité éditoriale) et le comportement si la race est inconnue ou mixte.

### 4.5 Multi-propriétaire / foyer

Si un même chien peut être géré par plusieurs comptes (couple, famille, gardien) :

- Le spécifier avec règles d'invitation et de permissions ;
- Sinon, **exclure explicitement** en v1 pour éviter des demandes de changement tardives.

### 4.6 Accessibilité (WCAG 2.1 AA)

Aller au-delà de la mention générale :

- Contraste et tailles de police minimales
- Parcours critiques testés avec VoiceOver (iOS) et TalkBack (Android) : médication, urgence F10, rappels

---

## 5. Spécification technique — risques et améliorations

### 5.1 Offline et résolution de conflits

La stratégie « last write wins » est simple mais **risquée** pour les données de santé et les prises de médicament.

| Type de donnée | Stratégie recommandée |
|---------------|------------------------|
| Préférences utilisateur, UI | Last write wins |
| Carnet de santé, symptômes, prises médicament | Merge guidé ou notification de conflit à l'utilisateur |

Documenter la règle par entité dans la section hors-ligne (spec technique §9).

### 5.2 Neon scale-to-zero

Le scale-to-zero peut dégrader la latence au réveil de la base et contredire l'objectif TTFB &lt; 200 ms (p95).

**Recommandation :** Production en mode always-on ou politique de warmup ; accepter une latence de pic documentée pour staging/dev.

### 5.3 Export PDF (Puppeteer)

Puppeteer sur Fargate est coûteux en mémoire et sensible aux cold starts.

**Alternatives à évaluer :** service dédié (ex. Gotenberg), worker isolé, file d'attente avec timeout et retry documentés.

### 5.4 Convention snake_case (API) vs camelCase (TypeScript)

La spec impose `snake_case` en JSON. **Recommandation :** une phrase explicite : les clients et le backend appliquent une couche de mapping systématique pour éviter les écarts entre équipes mobile, web et API.

### 5.5 Contrat API (OpenAPI)

La liste d'exemples de routes est insuffisante pour maintenir deux clients.

**Recommandation :** OpenAPI 3.1 comme **contrat unique** (généré depuis NestJS ou maintenu en source), versionné avec le code.

### 5.6 Schéma de données incomplet

Entités ou tables à aligner avec F01–F14 avant migration Prisma :

- Plans nutritionnels et repas (F06)
- Rappels et historique hygiène (F08)
- Cycles de chaleur, saillie, gestation (F11)
- Résultats de check-up (F12)
- Posts, groupes, membres (F14)
- Pièces jointes des visites (métadonnées en base, fichiers sur S3)
- Journal des prises de médicament (`MedicationDoseLog` : confirmée / manquée)

### 5.7 Recherche full-text

PostgreSQL full-text suffit en phase initiale. **Recommandation :** définir un seuil de bascule vers Elasticsearch (ex. volume de posts communautaires ou requêtes lentes).

---

## 6. Sécurité et conformité

### 6.1 Classification des données

Lister explicitement les champs « données de santé » au sens RGPD et les sous-traitants concernés (Neon, S3, SendGrid/Resend, Google Places, etc.) avec mention des DPA.

### 6.2 Lien de partage vétérinaire

Compléter les mesures existantes (token 256 bits, TTL) :

- Rate limiting sur les consultations du lien
- En-têtes empêchant l'indexation (`Referrer-Policy`, etc.)
- Option mot de passe sur le lien (v2)
- Journal d'accès consultable par le propriétaire

### 6.3 Refresh token

Préciser : rotation à chaque usage, révocation de tous les appareils, gestion du vol de session sur mobile.

### 6.4 Audit et rétention

| Élément | Spec actuelle | Action |
|---------|---------------|--------|
| Logs d'accès santé | 1 an (technique) | Table `AuditLog` + politique de rétention |
| Sauvegardes | 30 jours | Vérifier compatibilité avec droit à l'effacement |
| Suppression compte | Soft delete 30 j puis purge (technique) | Reprendre côté fonctionnel (droit à l'oubli, export préalable) |

---

## 7. Intégrations externes — plans de secours

| Intégration | Risque | Mesure à documenter |
|-------------|--------|---------------------|
| API SCC (LOF) | Indisponibilité, absence d'API publique stable | Saisie manuelle + badge « non vérifié » |
| Registre LOMAD | Même risque | Fallback manuel déjà évoqué — détailler le workflow |
| Google Places | Coût, quotas, conditions d'utilisation | Cache Redis, TTL, limites de requêtes par utilisateur |
| FCM / APNs | Tokens invalides | Nettoyage périodique des device tokens |

---

## 8. Observabilité et qualité

### 8.1 SLI / SLO

Relier l'objectif de disponibilité 99,5 % à des indicateurs mesurables :

- Quels endpoints entrent dans le SLO (exclure les exports PDF longs ?)
- Fenêtres de mesure et exclusions (maintenance planifiée)

### 8.2 Idempotence

Exiger un en-tête `Idempotency-Key` sur les POST critiques (prise de médicament, pesée, marquage rappel effectué).

### 8.3 Feature flags

Permettre d'activer F09, F11, F14 sans redéploiement complet (LaunchDarkly, config env, ou table `FeatureFlag`).

### 8.4 Tests

Définir des parcours E2E prioritaires, par exemple :

1. Création chien → rappel vaccin → notification → marquage effectué  
2. Programme médicament → notification prise → confirmation  
3. Génération PDF / lien partage → consultation portail véto  

---

## 9. Processus documentaire

### 9.1 Matrice de traçabilité

Maintenir une table croisée :

```
F01–F14  ↔  module NestJS  ↔  tables SQL  ↔  routes API  ↔  tests E2E
```

### 9.2 Architecture Decision Records (ADR)

Rédiger des ADR courts pour les choix structurants, par exemple :

- Neon vs RDS classique  
- Monolithe modulaire vs microservices  
- Puppeteer vs service PDF dédié  

### 9.3 Glossaire

Définir : LOF, LOMAD, « effectué » (rappel), stérilisé, sections exportables, etc.

---

## 10. Actions prioritaires

| Priorité | Action | Responsable suggéré |
|----------|--------|---------------------|
| **P0** | Trancher accès vétérinaire (lien seul vs compte) | Produit + Tech |
| **P0** | Définir périmètre MVP et hors scope v1 | Produit |
| **P0** | Compléter schéma données + OpenAPI minimal MVP | Tech |
| **P1** | Section monétisation ou retrait Stripe du draft | Produit |
| **P1** | Règles offline / conflits par type de donnée | Tech |
| **P1** | Sources référentiels poids / nutrition | Produit + Métier |
| **P2** | Politique modération F14 | Produit + Legal |
| **P2** | ADR infra (Neon prod, PDF, recherche) | Tech |
| **P2** | Critères d'acceptation par feature | Produit + QA |

---

## Historique des révisions

| Version | Date | Auteur | Modifications |
|---------|------|--------|---------------|
| 1.0 | Mai 2026 | — | Création du document à partir de l'analyse des specs v1.0 |
