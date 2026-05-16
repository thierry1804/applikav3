# Spécifications Fonctionnelles — DogApp
**Version :** 1.1  
**Date :** Mai 2026  
**Statut :** Draft — mis à jour suite à l'analyse critique v1.0  

---

## Table des matières

1. [Contexte et objectifs](#1-contexte-et-objectifs)
2. [Utilisateurs cibles](#2-utilisateurs-cibles)
3. [Fonctionnalités détaillées](#3-fonctionnalités-détaillées)
   - [F01 — Carnet de santé numérique](#f01--carnet-de-santé-numérique)
   - [F02 — Rappels vaccinations et traitements](#f02--rappels-vaccinations-et-traitements)
   - [F03 — Suivi des maladies et symptômes](#f03--suivi-des-maladies-et-symptômes)
   - [F04 — Programme de médication](#f04--programme-de-médication)
   - [F05 — Suivi du poids et de la croissance](#f05--suivi-du-poids-et-de-la-croissance)
   - [F06 — Planification des repas et suivi nutritionnel](#f06--planification-des-repas-et-suivi-nutritionnel)
   - [F07 — Suivi de l'activité physique](#f07--suivi-de-lactivité-physique)
   - [F08 — Planification des soins d'hygiène](#f08--planification-des-soins-dhygiène)
   - [F09 — Pedigree et identité officielle](#f09--pedigree-et-identité-officielle)
   - [F10 — Liste des vétérinaires et services d'urgence](#f10--liste-des-vétérinaires-et-services-durgence)
   - [F11 — Suivi des périodes de chaleur et reproduction](#f11--suivi-des-périodes-de-chaleur-et-reproduction)
   - [F12 — Check-up rapide](#f12--check-up-rapide)
   - [F13 — Partage des données avec le vétérinaire](#f13--partage-des-données-avec-le-vétérinaire)
   - [F14 — Réseau social et communauté](#f14--réseau-social-et-communauté)
4. [Règles métier transverses](#4-règles-métier-transverses)
5. [Hors périmètre v1](#5-hors-périmètre-v1)
6. [Offres et monétisation](#6-offres-et-monétisation)
7. [Exigences non fonctionnelles](#7-exigences-non-fonctionnelles)

---

## 1. Contexte et objectifs

DogApp est une application de suivi et de gestion des chiens de compagnie, accessible sur **mobile (iOS & Android)** et **web**. Elle vise à centraliser toutes les informations relatives à la santé, l'alimentation, l'activité et l'identité d'un chien, tout en connectant le propriétaire à son vétérinaire et à une communauté de passionnés.

**Objectifs principaux :**
- Simplifier le suivi de la santé animale au quotidien
- Réduire les oublis (vaccins, médicaments, toilettage…) grâce aux notifications
- Offrir un dossier médical numérique partageable avec les professionnels de santé animale
- Fédérer une communauté de propriétaires de chiens

---

## 2. Utilisateurs cibles

| Rôle | Description | Compte requis |
|------|-------------|---------------|
| **Propriétaire** | Utilisateur principal. Gère un ou plusieurs chiens. | Oui |
| **Éleveur** | Propriétaire avec le flag `is_breeder` activé. Accède aux modules F09 (pedigree) et F11 (reproduction). Ce flag est activable par le propriétaire lui-même depuis son profil, sans rôle technique distinct. | Oui (flag sur profil) |
| **Vétérinaire** | Accède en lecture seule aux données partagées. **v1 : accès uniquement par lien sécurisé temporaire (token + TTL), sans obligation de créer un compte.** Le rôle technique `vet` est réservé à une version ultérieure avec compte dédié. | Non (lien invité) |
| **Administrateur** | Gestion de la plateforme, modération de la communauté. | Oui |

> **Décision actée (v1) :** Le vétérinaire accède via un lien de partage sécurisé sans compte (Option A). Un compte vétérinaire avec historique des dossiers partagés sera évalué en v2. Le rôle `vet` est absent du schéma de base de données en v1.

---

## 3. Fonctionnalités détaillées

---

### F01 — Carnet de santé numérique

**Description :** Espace centralisé regroupant l'historique médical complet du chien.

**User stories :**
- En tant que propriétaire, je veux enregistrer les visites vétérinaires (date, motif, diagnostic, vétérinaire) afin de conserver un historique complet.
- En tant que propriétaire, je veux attacher des ordonnances (PDF, photo) à une visite afin de retrouver facilement les prescriptions.
- En tant que propriétaire, je veux visualiser la chronologie des événements de santé sous forme de timeline.

**Données gérées :**
- Date et heure de la visite
- Vétérinaire (nom, clinique)
- Motif de consultation
- Diagnostic
- Traitements prescrits
- Documents joints (PDF, images)
- Notes libres

**Règles :**
- Les documents joints sont limités à 10 Mo par fichier.
- Seul le propriétaire peut créer/modifier/supprimer une entrée.
- Le vétérinaire partagé peut consulter en lecture seule.

---

### F02 — Rappels vaccinations et traitements

**Description :** Système de notifications automatiques pour les actes préventifs.

**User stories :**
- En tant que propriétaire, je veux enregistrer les vaccins passés et futurs avec leur date d'échéance.
- En tant que propriétaire, je veux recevoir une notification push et/ou email N jours avant l'échéance d'un vaccin ou traitement.
- En tant que propriétaire, je veux visualiser un calendrier de santé préventive.

**Types de rappels gérés :**
- Vaccins (rage, parvovirose, leptospirose, toux du chenil, etc.)
- Vermifuges
- Traitement antiparasitaire externe (anti-puces, anti-tiques)
- Rappels personnalisables (tout soin récurrent)

**Règles :**
- Délais de rappel configurables par l'utilisateur (ex. : 7 j, 14 j, 30 j avant échéance).
- Un rappel peut être marqué comme "effectué", ce qui décale automatiquement la prochaine échéance.
- Possibilité de désactiver les notifications par type de rappel.

---

### F03 — Suivi des maladies et symptômes

**Description :** Journal chronologique permettant de noter les observations de santé au quotidien.

**User stories :**
- En tant que propriétaire, je veux saisir rapidement un symptôme observé avec sa date et une description.
- En tant que propriétaire, je veux associer un symptôme à une visite vétérinaire existante.
- En tant que propriétaire, je veux filtrer les entrées par type de symptôme ou période.

**Symptômes prédéfinis (liste extensible) :**
- Vomissements / diarrhée
- Perte d'appétit
- Fatigue / léthargie
- Boiterie
- Grattage excessif
- Toux / éternuements
- Modifications comportementales
- Autres (champ libre)

**Règles :**
- Chaque entrée comporte : date, symptôme(s), intensité (1–3), notes libres, photo optionnelle.
- Le journal est exportable en PDF pour partage vétérinaire.

---

### F04 — Programme de médication

**Description :** Gestionnaire de médicaments avec alertes de prise et de stock.

**User stories :**
- En tant que propriétaire, je veux créer un programme de médicament (nom, dosage, fréquence, durée).
- En tant que propriétaire, je veux recevoir une notification à l'heure de chaque prise.
- En tant que propriétaire, je veux confirmer une prise pour que l'historique soit mis à jour.
- En tant que propriétaire, je veux être alerté quand le stock restant est faible.

**Données gérées :**
- Nom du médicament
- Dosage (quantité + unité)
- Fréquence (ex. : 2×/jour, toutes les 8h, etc.)
- Date de début / fin
- Stock disponible (nombre de comprimés, ml, etc.)
- Lien avec une ordonnance

**Règles :**
- Alerte stock faible configurable (seuil en nombre de prises restantes).
- Historique des prises consultable (confirmées / manquées).
- Un médicament peut être suspendu sans être supprimé.

---

### F05 — Suivi du poids et de la croissance

**Description :** Enregistrement du poids au fil du temps avec courbes et recommandations.

**User stories :**
- En tant que propriétaire, je veux saisir le poids de mon chien à une date donnée.
- En tant que propriétaire, je veux visualiser l'évolution du poids sur une courbe interactive.
- En tant que propriétaire, je veux que l'application me signale si le poids s'écarte de la plage recommandée pour la race et l'âge de mon chien.

**Données gérées :**
- Date de la pesée
- Poids (kg)
- Référentiel par race (poids idéal min/max selon l'âge)

**Règles :**
- La courbe affiche les 12 derniers mois par défaut, avec zoom possible.
- Les plages recommandées sont indicatives et ne remplacent pas l'avis du vétérinaire.
- Alerte visuelle si le poids sort de la plage recommandée.
- **Référentiel poids :** table interne maintenue par l'équipe éditoriale, basée sur les standards des associations de races (FCI). En cas de race inconnue ou mixte, la plage recommandée n'est pas affichée et un message invite à consulter un vétérinaire. Mise à jour du référentiel : au moins une fois par an.

---

### F06 — Planification des repas et suivi nutritionnel

**Description :** Gestion des repas quotidiens avec calcul des portions.

**User stories :**
- En tant que propriétaire, je veux définir un plan alimentaire (aliment, quantité, fréquence).
- En tant que propriétaire, je veux que l'application calcule automatiquement les portions recommandées selon le poids, l'âge, la race et le niveau d'activité de mon chien.
- En tant que propriétaire, je veux recevoir un rappel à l'heure des repas.
- En tant que propriétaire, je veux noter les aliments non consommés pour détecter une perte d'appétit.

**Données gérées :**
- Type d'aliment (croquettes, pâtées, BARF, mixte)
- Grammage / quantité par repas
- Nombre de repas par jour
- Valeur calorique estimée

**Règles :**
- Le calcul de portion est basé sur un référentiel nutritionnel standard (kcal/kg de poids corporel selon stade de vie).
- La gestion des marques / aliments spécifiques est possible via une base de données produits (saisie manuelle en v1 ; intégration API externe en v2).
- **Référentiel nutritionnel :** basé sur les recommandations FEDIAF (Fédération Européenne de l'Industrie des Aliments pour Animaux Familiers), intégré en base interne. Si la race est inconnue ou mixte, le calcul utilise les paramètres génériques (poids corporel + stade de vie uniquement). Responsabilité éditoriale : équipe produit. Mise à jour annuelle.

---

### F07 — Suivi de l'activité physique

**Description :** Enregistrement des promenades et calcul de l'activité quotidienne.

**User stories :**
- En tant que propriétaire, je veux enregistrer une promenade (durée, distance, tracé GPS optionnel).
- En tant que propriétaire, je veux voir un calendrier mensuel de toutes les balades effectuées.
- En tant que propriétaire, je veux visualiser les calories brûlées estimées par sortie.
- En tant que propriétaire, je veux planifier des balades récurrentes dans un calendrier.

**Données gérées :**
- Date et heure
- Durée (minutes)
- Distance (km)
- Tracé GPS (optionnel)
- Calories estimées
- Notes / lieu

**Règles :**
- Le calcul de calories brûlées est basé sur : poids du chien × distance × coefficient de race.
- L'intégration GPS est optionnelle et nécessite l'autorisation de localisation.
- Le calendrier des balades est synchronisé avec le calendrier des événements communautaires (F14).

---

### F08 — Planification des soins d'hygiène

**Description :** Rappels périodiques pour les soins courants de toilettage.

**User stories :**
- En tant que propriétaire, je veux configurer des rappels récurrents pour chaque type de soin.
- En tant que propriétaire, je veux marquer un soin comme effectué et reporter automatiquement le prochain rappel.

**Types de soins gérés :**
- Brossage des dents
- Coupe des griffes
- Bain / shampooing
- Brossage du pelage
- Toilettage professionnel
- Nettoyage des oreilles
- Autre (personnalisable)

**Règles :**
- Fréquence configurable indépendamment pour chaque soin.
- Historique des soins consultable.

---

### F09 — Pedigree et identité officielle

**Description :** Intégration et affichage du pedigree pour les chiens inscrits au LOF (Livre des Origines Françaises) ou au LOMAD (Madagasikara).

**User stories :**
- En tant que propriétaire, je veux renseigner le numéro d'inscription LOF / LOMAD de mon chien pour récupérer automatiquement son pedigree.
- En tant que propriétaire, je veux consulter l'arbre généalogique de mon chien (parents, grands-parents, etc.).
- En tant que propriétaire, je veux vérifier le numéro de puce officiel et les informations d'identité.

**Données affichées :**
- Numéro de puce électronique
- Numéro d'inscription LOF / LOMAD
- Nom officiel du chien
- Date de naissance
- Couleur de robe / standard de race
- Arbre généalogique (3 générations minimum)
- Titres obtenus

**Règles :**
- La récupération du pedigree se fait via l'API de la SCC (Société Centrale Canine) pour le LOF, et via le registre LOMAD pour Madagascar.
- En l'absence d'API disponible, la saisie manuelle est proposée en fallback.
- Les données officielles sont affichées en lecture seule ; seules les données complémentaires sont éditables par le propriétaire.

---

### F10 — Liste des vétérinaires et services d'urgence

**Description :** Annuaire géolocalisé des cliniques vétérinaires et services d'urgence.

**User stories :**
- En tant que propriétaire, je veux trouver les vétérinaires proches de ma position actuelle.
- En tant que propriétaire, je veux voir les horaires, le numéro de téléphone et l'adresse de chaque établissement.
- En tant que propriétaire, je veux identifier rapidement les cliniques ouvertes 24h/24 ou les services d'urgence.
- En tant que propriétaire, je veux enregistrer mon vétérinaire habituel en favori.

**Données affichées :**
- Nom de l'établissement
- Adresse et distance
- Numéro de téléphone (appel direct depuis l'app)
- Horaires d'ouverture
- Spécialités éventuelles
- Indicateur urgences 24h

**Règles :**
- Données alimentées via une API tiers (ex. : Google Places API) ou base de données propriétaire.
- La recherche fonctionne hors ligne pour les favoris enregistrés.

---

### F11 — Suivi des périodes de chaleur et reproduction

**Description :** Journal des cycles de chaleur pour les chiennes non stérilisées.

**User stories :**
- En tant que propriétaire, je veux enregistrer le début et la fin d'une période de chaleur.
- En tant que propriétaire, je veux que l'application me prévienne quand une prochaine période de chaleur est probable.
- En tant que propriétaire, je veux enregistrer une saillie et les informations de reproduction associées.
- En tant que propriétaire (éleveur), je veux suivre une gestation : date prévue de mise-bas, nombre de chiots.

**Données gérées :**
- Dates de début / fin de chaleur
- Durée du cycle (calculée et historisée)
- Date de saillie, reproducteur (nom, numéro puce)
- Date prévue de naissance (+ 63 jours)
- Nombre de chiots nés, date de naissance

**Règles :**
- Fonctionnalité disponible uniquement pour les profils "femelle" et "non stérilisée".
- La prédiction du prochain cycle est basée sur la moyenne des cycles précédents.

---

### F12 — Check-up rapide

**Description :** Questionnaire interactif d'auto-évaluation de la santé du chien.

**User stories :**
- En tant que propriétaire, je veux lancer un check-up rapide pour évaluer l'état général de mon chien.
- En tant que propriétaire, je veux recevoir une recommandation (tout va bien / surveiller / consulter un vétérinaire) à l'issue du questionnaire.

**Fonctionnement :**
1. Série de questions à choix simple ou multiple (10 à 15 questions), adaptées à l'âge du chien (chiot < 1 an, adulte, senior > 8 ans).
2. Thèmes couverts : appétit, hydratation, comportement, selles, mobilité, pelage, yeux/oreilles, respiration.
3. Score calculé à l'issue du questionnaire.
4. Recommandation affichée selon le score, avec actions concrètes liées :
   - Score faible → ouvre automatiquement l'annuaire vétérinaires (F10)
   - Score moyen → propose d'ajouter une entrée dans le journal des symptômes (F03)
   - Score élevé → message rassurant, proposition de refaire dans 7 jours

**Règles :**
- **Cadre légal :** disclaimer visible avant et après le questionnaire : *"Ce check-up est un outil d'orientation, pas un diagnostic médical. En cas de doute, consultez un vétérinaire."*
- Le disclaimer est accepté explicitement par l'utilisateur à la première utilisation.
- Les résultats sont enregistrés dans le carnet de santé (F01) avec date et score, consultables dans l'historique.
- Les questions et le barème sont validés par un vétérinaire conseil avant mise en production.

---

### F13 — Partage des données avec le vétérinaire

**Description :** Export et partage sécurisé du dossier santé vers un professionnel.

**User stories :**
- En tant que propriétaire, je veux générer un rapport PDF complet du dossier de mon chien en un clic.
- En tant que propriétaire, je veux partager un lien sécurisé (accès temporaire) à mon vétérinaire.
- En tant que propriétaire, je veux choisir les sections à inclure dans le partage (carnet de santé, médicaments, poids, etc.).

**Données exportables :**
- Carnet de santé (visites, ordonnances)
- Programme de médication en cours
- Historique du poids
- Journal des symptômes
- Pedigree et identité

**Sections exclues par défaut du partage :**
- Tracés GPS détaillés des promenades
- Posts et données du réseau social
- Historique d'activité (calories, pas)

**Règles :**
- Le lien de partage est valide 7 jours par défaut (configurable : 1, 3, 7, 14, 30 jours).
- Le vétérinaire accède aux données en lecture seule via un portail web, sans obligation de créer un compte.
- Le propriétaire peut **révoquer le lien à tout moment** avant expiration.
- Le propriétaire reçoit une **notification in-app** dès qu'un accès est effectué via le lien (première consultation uniquement).
- Le PDF exporté comporte un **watermark** avec le nom du chien, la date de génération et la mention "Confidentiel — usage médical uniquement".
- Le journal des accès au lien est consultable par le propriétaire (date, heure, adresse IP partielle).
- Rate limiting : maximum 10 consultations par lien (protection contre le partage non contrôlé).

---

### F14 — Réseau social et communauté

**Description :** Espace communautaire pour les propriétaires de chiens.

**User stories :**
- En tant que propriétaire, je veux créer un profil public pour mon chien (photo, nom, race, âge).
- En tant que propriétaire, je veux publier des posts (texte, photo) dans un fil communautaire.
- En tant que propriétaire, je veux rejoindre des groupes thématiques (par race, région, etc.).
- En tant que propriétaire, je veux consulter le calendrier des événements canins (expositions, concours, balades collectives).
- En tant que propriétaire, je veux recevoir une notification mensuelle récapitulant les événements à venir.

**Données gérées :**
- Profil chien : nom, race, âge, photo, description
- Posts : texte, images, likes, commentaires
- Groupes : nom, description, membres, posts
- Événements : titre, date, lieu, description, lien inscription

**Règles :**
- **Modération :** tout contenu peut être signalé par un utilisateur. Les admins examinent les signalements dans un délai de 48h. Les contenus interdits incluent : publicité non autorisée, contenus violents ou offensants, informations médicales non vérifiées présentées comme des faits.
- **Séparation données propriétaire / chien :** le profil public expose uniquement les données du chien (nom, race, photo, description). Le nom du propriétaire n'est jamais affiché sans consentement explicite. L'email et les coordonnées ne sont jamais publics.
- **Consentement :** à la création du profil public du chien, l'utilisateur valide un consentement explicite listant les données visibles par les autres membres.
- Le calendrier des événements est alimenté manuellement par les admins en v1.
- Un post peut être supprimé par son auteur à tout moment.

---

## 4. Règles métier transverses

| Règle | Description |
|-------|-------------|
| **Multi-chiens** | Un compte propriétaire peut gérer plusieurs profils chiens. Toutes les fonctionnalités sont contextualisées au chien sélectionné. |
| **Multi-propriétaire** | **Exclu en v1.** Un chien ne peut appartenir qu'à un seul compte. La co-gestion (couple, famille, gardien) sera évaluée en v2. |
| **Notifications** | Push (mobile), email et in-app. L'utilisateur contrôle les canaux activés par type de notification. |
| **Données offline** | Les données consultées récemment sont disponibles hors ligne (lecture). La synchronisation s'effectue à la reconnexion. En cas de conflit, la stratégie varie selon le type de donnée (voir specs techniques §9). |
| **RGPD** | Les données de santé et de localisation sont des données sensibles. Consentement explicite requis. Droit à l'export (JSON/ZIP) et à la suppression (soft delete 30 j puis purge définitive). Le propriétaire peut exporter ses données avant suppression. |
| **Accessibilité** | L'interface respecte les normes WCAG 2.1 niveau AA. Les parcours critiques (prise de médicament, urgence F10, rappels) sont testés avec VoiceOver (iOS) et TalkBack (Android). Contrastes et tailles de police conformes aux seuils AA. |
| **Internationalisation** | L'application est disponible en français. L'architecture prévoit l'ajout d'autres langues (EN, MG). |

---

## 5. Hors périmètre v1

Les éléments suivants sont **explicitement exclus** de la version 1 afin de maîtriser le périmètre et les délais.

| Élément | Raison / Horizon envisagé |
|---------|--------------------------|
| Télémédecine / téléconsultation intégrée | Réglementation complexe, partenariats nécessaires → v3+ |
| Diagnostic médical automatisé (IA) | Responsabilité légale, validation médicale — au-delà du disclaimer F12 | → post-v2 |
| Co-propriété d'un chien (multi-compte) | Complexité de gestion des permissions → v2 |
| Compte vétérinaire avec historique dossiers partagés | Accès par lien suffisant en v1 → v2 |
| Intégration API aliments (base de données marques) | Saisie manuelle en v1 → v2 |
| Protection par mot de passe du lien de partage | Bonne pratique, non bloquante → v2 |
| Module éleveur avancé (gestion portée, paiement saillie) | Scope B2B → v3 |
| Support multi-langue complet | Infrastructure i18n préparée, traductions EN/MG → v2 |
| Widgets iOS/Android (écran d'accueil) | Dépend stabilité v1 → v2 |
| Intégration calendrier système (Google Calendar, iOS) | Confort, non critique → v2 |

---

## 6. Offres et monétisation

Deux niveaux d'accès sont prévus. La distinction s'opère au niveau du compte propriétaire.

| Fonctionnalité | Gratuit | Premium |
|---------------|---------|---------|
| Nombre de chiens | 1 | Illimité |
| Historique données santé | 90 jours | Illimité |
| Stockage pièces jointes | 50 Mo | 2 Go |
| Rappels et notifications | Essentiels (F02, F04, F08) | Tous types |
| Export PDF dossier (F13) | ✗ | ✓ |
| Lien de partage vétérinaire (F13) | ✗ | ✓ |
| Check-up rapide (F12) | 1/mois | Illimité |
| Pedigree LOF/LOMAD (F09) | ✗ | ✓ |
| Suivi reproduction (F11) | ✗ | ✓ |
| Réseau social (F14) | ✓ (lecture) | ✓ (complet) |
| Support | Email | Email prioritaire |

**Tarif indicatif :** ~4,99 €/mois ou ~39,99 €/an (à valider par l'équipe produit).  
**Paiement :** Stripe (sans abonnement mensuel Stripe, facturation à la transaction uniquement).  
**Période d'essai :** 30 jours gratuits sur le plan Premium au moment de l'inscription.

> ⚠️ La monétisation est activée à partir du **Lot 3** uniquement. Les Lots 1 et 2 sont déployés en accès entièrement gratuit pour valider la rétention avant de monétiser.

---

## 7. Exigences non fonctionnelles

| Critère | Cible |
|---------|-------|
| **Disponibilité** | 99,5% uptime (hors maintenance planifiée) |
| **Temps de réponse** | < 2s pour 95% des requêtes |
| **Sécurité** | HTTPS obligatoire, chiffrement des données sensibles au repos (AES-256), authentification JWT + refresh token |
| **Scalabilité** | Architecture capable de supporter 50 000 utilisateurs actifs dès le lancement, extensible à 500 000 |
| **Plateformes** | iOS 15+, Android 10+, navigateurs modernes (Chrome, Firefox, Safari, Edge) |
| **Sauvegarde** | Sauvegardes quotidiennes avec rétention 30 jours |
