# Lots MVP et Version Complète — DogApp
**Version :** 1.0  
**Date :** Mai 2026  
**Statut :** Draft  

---

## Table des matières

1. [Principes de priorisation](#1-principes-de-priorisation)
2. [Synthèse des fonctionnalités par lot](#2-synthèse-des-fonctionnalités-par-lot)
3. [Lot 1 — MVP (Minimum Viable Product)](#3-lot-1--mvp-minimum-viable-product)
4. [Lot 2 — Version Enrichie](#4-lot-2--version-enrichie)
5. [Lot 3 — Version Complète (Full)](#5-lot-3--version-complète-full)
6. [Roadmap et jalons](#6-roadmap-et-jalons)
7. [Critères de passage d'un lot à l'autre](#7-critères-de-passage-dun-lot-à-lautre)
8. [Risques et hypothèses](#8-risques-et-hypothèses)

---

## 1. Principes de priorisation

Les fonctionnalités sont priorisées selon trois critères :

| Critère | Poids | Description |
|---------|-------|-------------|
| **Valeur utilisateur** | 40% | Impact direct sur l'expérience et la rétention |
| **Complexité technique** | 35% | Effort de développement estimé |
| **Différenciation marché** | 25% | Unicité de la fonctionnalité vs. concurrents |

Le **MVP** doit couvrir le cœur du produit et être utilisable de manière autonome et satisfaisante. Il ne contient que les fonctionnalités sans lesquelles l'application n'a pas de raison d'exister.

---

## 2. Synthèse des fonctionnalités par lot

| # | Fonctionnalité | Lot | Priorité |
|---|---------------|-----|----------|
| F01 | Carnet de santé numérique | **MVP** | 🔴 Critique |
| F02 | Rappels vaccinations et traitements | **MVP** | 🔴 Critique |
| F03 | Suivi des maladies et symptômes | **MVP** | 🔴 Critique |
| F04 | Programme de médication | **MVP** | 🔴 Critique |
| F05 | Suivi du poids et de la croissance | **MVP** | 🟠 Haute |
| F08 | Planification des soins d'hygiène | **MVP** | 🟠 Haute |
| F10 | Liste des vétérinaires (géolocalisée) | **MVP** | 🟠 Haute |
| F12 | Check-up rapide | **MVP** | 🟠 Haute |
| F06 | Planification des repas et nutrition | **Lot 2** | 🟡 Moyenne |
| F07 | Suivi de l'activité physique | **Lot 2** | 🟡 Moyenne |
| F13 | Partage des données avec le vétérinaire | **Lot 2** | 🟡 Moyenne |
| F09 | Pedigree et identité officielle | **Lot 3** | 🟢 Basse |
| F11 | Suivi des périodes de chaleur | **Lot 3** | 🟢 Basse |
| F14 | Réseau social et communauté | **Lot 3** | 🟢 Basse |

---

## 3. Lot 1 — MVP (Minimum Viable Product)

### Périmètre

Le MVP couvre les fonctionnalités de **santé et de suivi médical** qui constituent le cœur de valeur de DogApp. Un propriétaire peut gérer le dossier médical de son chien de manière complète et recevoir les alertes essentielles.

### Fonctionnalités incluses

#### Socle applicatif
- Inscription / connexion (email + mot de passe, OAuth Google)
- Gestion du profil propriétaire
- Création et gestion de **plusieurs profils chiens** (nom, race, sexe, date de naissance, photo)
- Navigation principale (bottom tabs mobile, sidebar web)
- Système de notifications push + email (infrastructure)

#### F01 — Carnet de santé numérique
- Ajout et consultation des visites vétérinaires
- Pièces jointes (photos d'ordonnances, PDF)
- Vue timeline des événements de santé

#### F02 — Rappels vaccinations et traitements
- Enregistrement des vaccins, vermifuges, antiparasitaires
- Notifications automatiques (J-30, J-14, J-7, J-1)
- Marquage "effectué" avec report automatique

#### F03 — Suivi des maladies et symptômes
- Journal de symptômes avec date, intensité, photo optionnelle
- Symptômes prédéfinis + champ libre
- Filtres par type et période

#### F04 — Programme de médication
- Création de programmes (nom, dosage, fréquence, durée)
- Alertes à l'heure de prise
- Historique des prises (confirmées / manquées)
- Alerte stock faible

#### F05 — Suivi du poids et de la croissance
- Enregistrement des pesées
- Courbe d'évolution du poids
- Plage de poids recommandée selon race et âge

#### F08 — Planification des soins d'hygiène
- Configuration des soins récurrents (brossage, griffes, bain…)
- Rappels automatiques
- Marquage comme effectué

#### F10 — Liste des vétérinaires
- Recherche géolocalisée de cliniques vétérinaires
- Fiche vétérinaire (adresse, tél, horaires, urgences 24h)
- Enregistrement d'un vétérinaire favori (appel direct depuis l'app)

#### F12 — Check-up rapide
- Questionnaire santé interactif (10–15 questions)
- Score et recommandation (surveiller / consulter)
- Enregistrement du résultat dans le carnet de santé

### Hors scope MVP

- GPS / tracé des promenades
- Suivi nutritionnel détaillé
- Pedigree LOF/LOMAD
- Réseau social
- Partage sécurisé avec le vétérinaire
- Suivi des chaleurs et reproduction

### Exigences techniques MVP

- **Plateformes** : iOS + Android (React Native Expo) + Web (Next.js)
- **Authentification** : email/password + OAuth Google
- **Offline** : Lecture des données santé disponible sans connexion
- **Backend** : API REST NestJS + PostgreSQL + Redis
- **Notifications** : Push via Expo (FCM + APNs) + Email transactionnel
- **Stockage fichiers** : S3 pour photos et documents
- **Déploiement** : environnements dev, staging, production

### Estimations MVP

| Module | Estimation (jours/développeur) |
|--------|-------------------------------|
| Socle (auth, profils, navigation, CI/CD) | 15 j |
| F01 — Carnet de santé | 10 j |
| F02 — Rappels vaccinations | 8 j |
| F03 — Suivi symptômes | 6 j |
| F04 — Médication | 8 j |
| F05 — Poids & croissance | 6 j |
| F08 — Soins hygiène | 4 j |
| F10 — Annuaire vétérinaires | 7 j |
| F12 — Check-up rapide | 5 j |
| Infra, DevOps, tests, QA | 12 j |
| **Total MVP** | **~81 j/dev** |

> Avec une équipe de 3 développeurs (1 mobile, 1 backend, 1 web/fullstack) : **~5 à 6 semaines de développement** + 2 semaines de QA/tests = **~2 mois.**

---

## 4. Lot 2 — Version Enrichie

### Objectif

Ajouter les fonctionnalités de **style de vie** (nutrition, activité) et améliorer la **connectivité professionnelle** (partage avec le vétérinaire). Ce lot renforce la fidélisation et la valeur perçue.

### Fonctionnalités incluses

#### F06 — Planification des repas et suivi nutritionnel
- Plan alimentaire configurable (type, grammage, fréquence)
- Calcul automatique des portions selon poids/race/âge/activité
- Rappels heure des repas
- Saisie des repas non consommés (détection perte d'appétit)
- Base de données aliments (intégration API ou saisie manuelle)

#### F07 — Suivi de l'activité physique
- Enregistrement manuel des promenades (durée, distance)
- Tracé GPS optionnel (carte interactive)
- Calendrier mensuel des balades
- Estimation des calories brûlées
- Planification des balades récurrentes

#### F13 — Partage des données avec le vétérinaire
- Génération d'un lien sécurisé (token, TTL 7 jours)
- Sélection des sections à partager
- Portail web d'accès (lecture seule, sans compte)
- Export PDF du dossier complet

#### Améliorations transverses
- Tableau de bord synthétique (vue d'ensemble santé du chien)
- Historique complet exportable (JSON/ZIP) — RGPD
- Notifications enrichies (récapitulatif hebdomadaire)
- Support multilingue (infrastructure i18n)

### Estimations Lot 2

| Module | Estimation (jours/développeur) |
|--------|-------------------------------|
| F06 — Nutrition | 10 j |
| F07 — Activité physique + GPS | 12 j |
| F13 — Partage vétérinaire + export PDF | 10 j |
| Tableau de bord | 6 j |
| RGPD export/delete | 4 j |
| i18n infrastructure | 3 j |
| Tests, QA, déploiement | 8 j |
| **Total Lot 2** | **~53 j/dev** |

> Avec la même équipe : **~3 à 4 semaines de développement** + QA = **~5 semaines.**

---

## 5. Lot 3 — Version Complète (Full)

### Objectif

Compléter l'offre avec les fonctionnalités **différenciantes et communautaires** : pedigree officiel, reproduction pour les éleveurs, et réseau social. Ce lot vise à transformer DogApp en plateforme complète de la filière canine.

### Fonctionnalités incluses

#### F09 — Pedigree et identité officielle
- Intégration LOF (API SCC) et LOMAD
- Affichage de l'arbre généalogique (3 générations)
- Numéro de puce, informations officielles en lecture seule
- Saisie manuelle en fallback si API indisponible

#### F11 — Suivi des périodes de chaleur et reproduction
- Journal des cycles de chaleur (début, fin, durée)
- Prédiction du prochain cycle
- Enregistrement des saillies (reproducteur, date)
- Suivi de gestation (date de mise-bas prévue, nombre de chiots)
- Accessible uniquement pour profil "femelle non stérilisée"

#### F14 — Réseau social et communauté
- Profil public du chien (photo, race, âge, description)
- Fil d'actualité (posts texte + photos, likes, commentaires)
- Groupes thématiques (par race, région, centre d'intérêt)
- Calendrier des événements canins (expositions, concours, balades collectives)
- Notification mensuelle des événements à venir
- Modération par les administrateurs

#### Fonctionnalités premium (monétisation)
- Abonnement mensuel/annuel (Stripe)
- Fonctionnalités premium : rapports avancés, accès pedigree, stockage illimité, historique illimité
- Plan gratuit : limité à 1 chien, 30 jours d'historique

#### Améliorations transverses
- Mode sombre (Dark Mode)
- Widget iOS/Android (résumé santé sur l'écran d'accueil)
- Intégration calendrier système (iOS Calendar, Google Calendar)
- Support multi-langues complet (EN, FR, MG…)

### Estimations Lot 3

| Module | Estimation (jours/développeur) |
|--------|-------------------------------|
| F09 — Pedigree | 12 j |
| F11 — Reproduction | 8 j |
| F14 — Réseau social (posts, groupes) | 20 j |
| F14 — Événements et calendrier | 8 j |
| Modération & admin | 6 j |
| Monétisation (Stripe, plans) | 8 j |
| Dark mode + widgets | 6 j |
| Multi-langue complet | 5 j |
| Tests, QA, déploiement | 10 j |
| **Total Lot 3** | **~83 j/dev** |

> Avec la même équipe : **~5 à 6 semaines de développement** + QA = **~7 semaines.**

---

## 6. Roadmap et jalons

```
MAI 2026          JUIN 2026         JUIL 2026         AOÛT 2026
────────────────────────────────────────────────────────────────
├── Lot 1 MVP ──────────────────────────────────────┤
│                                                   │
│  S1-S2           S3-S4            S5-S7           S8
│  Socle +         F01–F04          F05, F08,       QA + UAT
│  auth +          (santé core)     F10, F12        + launch
│  CI/CD                            (vétérinaire,   MVP
│                                   check-up)
│
SEPT 2026         OCT 2026          NOV 2026
────────────────────────────────────────────────────
├── Lot 2 ───────────────────────────────────────┤
│
│  S1-S3           S4-S6            S7-S9
│  F06 + F07       F13 (partage),   QA + Release
│  (nutrition,     dashboard,       Lot 2
│  activité GPS)   RGPD, i18n

DÉC 2026          JAN 2027          FÉV 2027          MARS 2027
────────────────────────────────────────────────────────────────
├── Lot 3 ─────────────────────────────────────────────────────┤
│
│  S1-S3           S4-S6            S7-S9             S10-S11
│  F09 pedigree    F14 réseau       Monétisation      QA + Release
│  F11 repro       social +         + widgets +       Lot 3 / Full
│                  events           multi-langue
```

### Jalons clés

| Jalon | Date cible | Critère de succès |
|-------|-----------|-------------------|
| 🚀 **Launch MVP** | Août 2026 | App publiée iOS + Android + web, 500 utilisateurs beta |
| 📊 **Review MVP** | Septembre 2026 | NPS ≥ 40, rétention J30 ≥ 35% |
| 🍽️ **Launch Lot 2** | Novembre 2026 | 2 000 utilisateurs actifs |
| 🌐 **Launch Full** | Mars 2027 | 5 000 utilisateurs actifs, 10% payants |

---

## 7. Critères de passage d'un lot à l'autre

### MVP → Lot 2

- [ ] Application publiée sur App Store et Google Play
- [ ] Taux de crash < 1% (Crashlytics)
- [ ] Taux de rétention à J7 ≥ 50%
- [ ] NPS ≥ 35 sur les premiers utilisateurs
- [ ] 0 bug bloquant ouvert
- [ ] Infrastructure de production stable (uptime ≥ 99,5% sur 30 jours)

### Lot 2 → Lot 3

- [ ] Taux de rétention à J30 ≥ 35%
- [ ] Fonctionnalités de partage vétérinaire utilisées par ≥ 20% des utilisateurs actifs
- [ ] Modèle de monétisation défini et validé
- [ ] Équipe scalée (recrutement dev communauté si nécessaire)

---

## 8. Risques et hypothèses

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|------------|
| API SCC (pedigree LOF) non disponible ou payante | Moyenne | Moyen | Prévoir saisie manuelle en fallback dès le Lot 3 |
| API LOMAD inexistante | Haute | Moyen | Saisie manuelle uniquement, prévoir intégration ultérieure |
| Délais de certification App Store / Google Play | Faible | Élevé | Soumettre 2 semaines avant la date de launch cible |
| Complexité modération réseau social sous-estimée | Moyenne | Moyen | Commencer avec modération manuelle (admins), automatiser en v2 |
| Faible adoption du réseau social | Moyenne | Moyen | Le social est en Lot 3 ; les lots 1 et 2 sont indépendants |
| Coûts infrastructure dépassant les prévisions | Faible | Moyen | Architecture auto-scalable, monitoring des coûts AWS Cost Explorer |
| RGPD : données de santé animale | Faible | Élevé | Bien que les données animales ne soient pas soumises au RGPD, les données propriétaires (localisation, email) le sont ; DPO à nommer |

### Hypothèses

- L'équipe de développement est composée de **3 développeurs** (mobile, backend, frontend/fullstack).
- Un **designer UX/UI** est disponible en amont de chaque lot pour livrer les maquettes.
- Un **chef de projet** assure la coordination et les tests fonctionnels.
- Les clés d'API tierces (Google Places, FCM, APNs) sont accessibles dès le début du développement.
- Le budget infrastructure AWS est provisionné avant le lancement MVP.
