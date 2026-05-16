# Design Book — DogApp
**Version :** 1.0  
**Date :** Mai 2026  
**Usage :** Direction design à soumettre à l'outil de design pour la création des interfaces web et mobile  

---

## Table des matières

1. [Vision design](#1-vision-design)
2. [Identité de marque](#2-identité-de-marque)
3. [Palette de couleurs](#3-palette-de-couleurs)
4. [Typographie](#4-typographie)
5. [Iconographie et illustrations](#5-iconographie-et-illustrations)
6. [Espacements et grille](#6-espacements-et-grille)
7. [Composants fondamentaux](#7-composants-fondamentaux)
8. [Patterns UI spécifiques à DogApp](#8-patterns-ui-spécifiques-à-dogapp)
9. [Direction mobile (React Native)](#9-direction-mobile-react-native)
10. [Direction web (Next.js)](#10-direction-web-nextjs)
11. [Ton, voix et microcopy](#11-ton-voix-et-microcopy)
12. [Direction des écrans clés](#12-direction-des-écrans-clés)
13. [Accessibilité](#13-accessibilité)
14. [Ce qu'il faut éviter](#14-ce-quil-faut-éviter)

---

## 1. Vision design

### Positionnement

DogApp n'est pas une application médicale froide ni un simple carnet de notes. C'est le **compagnon numérique quotidien** d'un propriétaire de chien : chaleureux comme le lien avec son animal, précis comme un carnet de santé professionnel, dynamique comme un outil qu'on a envie d'ouvrir chaque jour.

### Les deux axes de l'ambiance

| Axe | Ce que ça traduit visuellement |
|-----|-------------------------------|
| **Chaleureuse & familiale** | Formes arrondies, palette chaude (corail, ambre), illustrations expressives, micro-animations bienveillantes, langage proche et humain |
| **Moderne & dynamique** | Typographie affirmée et contrastée, hiérarchie visuelle forte, layouts épurés sans surcharge, couleurs saturées, feedbacks instantanés |

### La métaphore design

> "Un vétérinaire moderne qui a du caractère."  
> Précis et fiable, mais chaleureux et humain — jamais clinique, jamais infantilisant.

### Références visuelles (moodboard)

- **Duolingo** → récompenses, gamification, bienveillance visuelle
- **Headspace** → espace blanc, calme, lisibilité
- **Linear** → typographie forte, hiérarchie propre, productivité
- **Hatch (baby tracker)** → émotionnel, couleurs chaudes, données présentées avec douceur
- **Notion** → flexibilité, composants modulaires

---

## 2. Identité de marque

### Nom & logo (direction)

Le logo DogApp doit incarner à la fois le chien et la modernité numérique.

**Direction logo recommandée :**
- Symbole : une **silhouette de chien stylisée** (oreille proéminente, forme simple et mémorisable) inscrite dans un **carré arrondi** (super-ellipse, `border-radius: 28%`), comme une icône d'application
- Le symbole peut être accompagné du wordmark "DogApp" en typographie bold et arrondie
- Couleur principale du symbole : corail chaud (`#FF6340`) sur fond blanc ou fond corail sur icône d'app

**Variations :**
- Icône seule (app icon mobile)
- Symbole + wordmark horizontal (header web, onboarding)
- Wordmark seul (navigation compacte)

**Style du logo :**
- Trait épais (stroke 2.5–3px) et arrondi (`stroke-linecap: round`)
- Pas de détail excessif — reconnaissable à 20px
- Pas d'ombres portées

### Tagline

> *"Le compagnon santé de votre chien."*  
> (usage : onboarding, App Store, marketing)

---

## 3. Palette de couleurs

### Couleurs principales

| Rôle | Nom | Hex | Usage |
|------|-----|-----|-------|
| **Primary** | Corail vif | `#FF6340` | CTA, boutons primaires, accents forts, icônes actives |
| **Primary Dark** | Corail foncé | `#D94B2B` | États hover/pressed, textes sur fond clair |
| **Primary Light** | Corail pâle | `#FFE8E3` | Backgrounds de cards, badges, highlights |
| **Secondary** | Marine profond | `#1B2D5A` | Textes titres, header, éléments premium, navigation |
| **Secondary Mid** | Marine moyen | `#2E4A8C` | Liens, états actifs secondaires |
| **Secondary Light** | Marine pâle | `#E8EDF7` | Fond sections secondaires, hover états |
| **Accent** | Or chaud | `#FFB800` | Badges de récompense, notifications positives, étoiles |

### Couleurs neutres

| Nom | Hex | Usage |
|-----|-----|-------|
| **Background** | `#FAFAF8` | Fond général de l'app (légèrement chaud, pas blanc pur) |
| **Surface** | `#FFFFFF` | Cards, modales, input backgrounds |
| **Surface Alt** | `#F4F3F0` | Fond sections alternées, sidebar web |
| **Border** | `#E5E4E0` | Séparateurs, bordures de cards, inputs au repos |
| **Text Primary** | `#1A1815` | Titres, corps de texte principal |
| **Text Secondary** | `#706D66` | Sous-titres, labels, métadonnées |
| **Text Disabled** | `#ABABAB` | Textes désactivés, placeholders |

### Couleurs sémantiques

| Rôle | Hex | Usage |
|------|-----|-------|
| **Success** | `#22C55E` | Rappel effectué, check-up positif, sync réussie |
| **Success Light** | `#DCFCE7` | Fond badge succès |
| **Warning** | `#F59E0B` | Stocks faibles, alertes modérées |
| **Warning Light** | `#FEF3C7` | Fond badge warning |
| **Error** | `#EF4444` | Erreurs, champs invalides, alertes critiques |
| **Error Light** | `#FEE2E2` | Fond badge erreur |
| **Info** | `#3B82F6` | Informations neutres, conseils |
| **Info Light** | `#DBEAFE` | Fond badge info |

### Mode sombre (Dark Mode — v2)

Prévoir dès le design system :
- Background dark : `#13120F`
- Surface dark : `#1E1D1A`
- Border dark : `#2E2D29`
- Le corail `#FF6340` reste identique (couleur suffisamment lumineuse)
- Le marine devient `#7B9FD4` (version claire pour textes sur fond sombre)

### Règle d'utilisation des couleurs

- **Ratio 60-30-10** : 60% neutres (backgrounds, surfaces), 30% secondary (navy), 10% primary (corail, accents).
- Le corail ne doit jamais être utilisé comme fond de grandes surfaces textuelles.
- Toujours vérifier le ratio de contraste WCAG AA avant d'utiliser une couleur sur une autre.

---

## 4. Typographie

### Familles de polices

| Rôle | Police | Justification |
|------|--------|---------------|
| **Display & Titres** | **Plus Jakarta Sans** | Arrondie, moderne, forte personnalité, excellent support latin étendu |
| **Corps & UI** | **Inter** | Lisibilité maximale à petite taille, standard design system |
| **Données & chiffres** | **JetBrains Mono** | Chiffres tabulaires (poids, doses, calories) alignés proprement |

> Ces trois polices sont **open source et gratuites** (Google Fonts / JetBrains).

### Échelle typographique

| Niveau | Police | Taille | Graisse | Line Height | Usage |
|--------|--------|--------|---------|-------------|-------|
| **Display XL** | Plus Jakarta Sans | 40px / 2.5rem | 800 | 1.1 | Onboarding, splash |
| **Display L** | Plus Jakarta Sans | 32px / 2rem | 700 | 1.15 | Titres de page principale |
| **Heading 1** | Plus Jakarta Sans | 24px / 1.5rem | 700 | 1.2 | Titres de section |
| **Heading 2** | Plus Jakarta Sans | 20px / 1.25rem | 600 | 1.3 | Sous-titres, card headers |
| **Heading 3** | Plus Jakarta Sans | 17px / 1.063rem | 600 | 1.35 | Labels de groupe, item headers |
| **Body L** | Inter | 16px / 1rem | 400 | 1.5 | Corps de texte principal |
| **Body M** | Inter | 14px / 0.875rem | 400 | 1.5 | Corps secondaire, descriptions |
| **Body S** | Inter | 12px / 0.75rem | 400 | 1.5 | Métadonnées, timestamps, légendes |
| **Label** | Inter | 13px / 0.813rem | 500 | 1.4 | Labels de formulaire, badges |
| **Caption** | Inter | 11px / 0.688rem | 400 | 1.4 | Copyright, mentions légales |
| **Data** | JetBrains Mono | 16px / 1rem | 500 | 1.3 | Poids, doses, calories, chiffres clés |

### Règles typographiques

- **Jamais plus de 2 polices visibles simultanément** sur un même écran.
- Titres en Plus Jakarta Sans, tout le reste en Inter.
- JetBrains Mono uniquement pour les valeurs numériques dans les tableaux et les cartes de données.
- Pas de `text-transform: uppercase` sur les corps de texte.
- `letter-spacing: -0.02em` sur les titres Display pour un look plus serré et premium.
- Alignement **gauche** systématique (pas de centré sauf onboarding et vides d'état).

---

## 5. Iconographie et illustrations

### Icônes

**Bibliothèque :** [Lucide Icons](https://lucide.dev/) — open source, trait fin et homogène, parfaitement compatible React et React Native.

**Paramètres standards :**
- `stroke-width: 1.75` (ni trop fin ni trop épais)
- `stroke-linecap: round`
- `stroke-linejoin: round`
- Taille de base : 24×24px (mobile), 20×20px (web dense)

**Icônes navigation (bottom tabs mobile) :**
- Accueil : `Home`
- Santé : `Heart` (ou `Stethoscope`)
- Activité : `Activity`
- Nutrition : `Utensils`
- Communauté : `Users`
- Profil : `User`

**Règle :** une icône seule sans label n'est jamais utilisée pour une action critique. Toujours accompagnée d'un label ou d'un tooltip.

### Illustrations

**Style :** illustrations vectorielles plates avec une légère **profondeur (2.5D)**, trait arrondi, palette limitée aux couleurs de la charte. Les personnages (chiens et propriétaires) sont représentés de manière **inclusive et diversifiée**.

**Usage :**
- États vides (liste vide, pas encore de chien ajouté)
- Onboarding (3 à 5 slides illustrés)
- Écrans de succès et récompenses
- Fond des cartes de profil chien

**Races représentées dans les illustrations :** labrador, golden retriever, berger allemand, bulldog, chihuahua, border collie (couverture des races les plus populaires).

**Style des chiens :** expressifs, caractère fort, yeux grands, postures joyeuses ou curieuses. Éviter le réalisme photographique.

### Photographies (si utilisées)

- Uniquement dans la section communauté (posts d'utilisateurs)
- Style naturel, lumière chaude, profondeur de champ légère
- Jamais de photos stock génériques — la communauté génère son propre contenu

### Emojis animaux

Utilisables avec parcimonie dans les messages de félicitation et les états vides. Préférer les illustrations maison sur les surfaces de marque.

---

## 6. Espacements et grille

### Unité de base

L'unité de base est **4px**. Tous les espacements sont des multiples de 4.

| Token | Valeur | Usage |
|-------|--------|-------|
| `space-1` | 4px | Micro-espacement (entre icône et label) |
| `space-2` | 8px | Espacement interne compact (padding input) |
| `space-3` | 12px | Espacement interne standard |
| `space-4` | 16px | Padding de card, espacement entre éléments |
| `space-5` | 20px | Padding horizontal de page (mobile) |
| `space-6` | 24px | Espacement entre sections |
| `space-8` | 32px | Marges de section importantes |
| `space-10` | 40px | Espacement entre blocs majeurs |
| `space-12` | 48px | Hauteur bottom tab bar (mobile) |
| `space-16` | 64px | Espacement vertical onboarding |

### Border radius

| Token | Valeur | Usage |
|-------|--------|-------|
| `radius-sm` | 6px | Badges, tags, chips |
| `radius-md` | 12px | Boutons, inputs, petites cards |
| `radius-lg` | 16px | Cards principales, modales |
| `radius-xl` | 24px | Bottom sheets, grandes modales |
| `radius-full` | 9999px | Pills, avatars, boutons ronds |

### Ombres

| Token | Valeur CSS | Usage |
|-------|-----------|-------|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.06)` | Inputs au focus, petits éléments flottants |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Cards, dropdowns |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.10)` | Modales, bottom sheets |
| `shadow-primary` | `0 4px 16px rgba(255,99,64,0.25)` | Bouton CTA primaire au hover |

**Règle :** pas d'ombre sur les éléments en état disabled. Les ombres sont utilisées avec parcimonie — l'élévation se communique principalement par la couleur de fond et les bordures.

### Grille — Mobile

- Marges horizontales : `space-5` (20px) de chaque côté
- Colonne unique (pas de grille multi-colonnes sur mobile sauf listes 2×2)
- Safe area top et bottom toujours respectées

### Grille — Web

- Container max : 1280px centré
- Sidebar fixe : 240px
- Contenu : fluid jusqu'à 1040px
- Grille intérieure : 12 colonnes, gutter 24px
- Breakpoints : `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`

---

## 7. Composants fondamentaux

### Boutons

**Primaire :**
- Background : `#FF6340`
- Texte : blanc, Inter 14px 600
- Border-radius : `radius-md` (12px)
- Padding : `12px 24px`
- Ombre : `shadow-primary` au hover
- État pressed : `#D94B2B`
- État disabled : `#ABABAB` background, texte `#FFFFFF` à 60%

**Secondaire (outlined) :**
- Border : `2px solid #1B2D5A`
- Texte : `#1B2D5A`, Inter 14px 600
- Background : transparent (hover : `#E8EDF7`)

**Tertiaire (ghost) :**
- Texte : `#FF6340`
- Background : transparent (hover : `#FFE8E3`)
- Pas de bordure

**Destructif :**
- Background : `#EF4444` (primaire) ou texte `#EF4444` (ghost)

**Taille des boutons :**
- `sm` : height 36px — actions secondaires, dans les cards
- `md` : height 44px — standard (minimum touch target mobile)
- `lg` : height 52px — CTA principal, onboarding

### Inputs

- Border : `1.5px solid #E5E4E0`
- Border au focus : `1.5px solid #FF6340`
- Background : `#FFFFFF`
- Border-radius : `radius-md` (12px)
- Padding : `14px 16px`
- Label : Inter 13px 500, `#706D66`, positionné au-dessus
- Placeholder : Inter 14px 400, `#ABABAB`
- Message d'erreur : Inter 12px 400, `#EF4444`, sous le champ avec icône `AlertCircle`
- Input invalide : border `#EF4444`, background `#FEE2E2` léger

### Cards

**Card standard :**
- Background : `#FFFFFF`
- Border : `1px solid #E5E4E0`
- Border-radius : `radius-lg` (16px)
- Shadow : `shadow-md`
- Padding : `space-4` (16px)

**Card de chien (profil) :**
- Gradient subtil de `#FF6340` vers `#FFB800` en header (hauteur 80px)
- Photo du chien en cercle, border 3px blanc, chevauchant le header
- Nom en Plus Jakarta Sans 20px 700, blanc sur le gradient

**Card santé (entrée carnet) :**
- Bordure gauche colorée de 4px : rouge pour alerte, vert pour OK, orange pour watch
- Date en JetBrains Mono 12px, `#706D66`

### Badges / Tags

- Border-radius : `radius-sm` (6px)
- Padding : `4px 8px`
- Inter 12px 500
- Couleurs : calquer les couleurs sémantiques (fond light + texte foncé)
- Jamais de badges avec fond sombre sur fond sombre

### Avatars

- Shape : cercle (`radius-full`)
- Taille : 32px (compact), 48px (standard), 64px (profil), 96px (header profil)
- Fallback (pas de photo) : initiale du nom en Plus Jakarta Sans bold, sur fond dégradé corail→ambre

### Navigation tabs (mobile — bottom bar)

- Hauteur : 56px + safe area bottom
- Background : `#FFFFFF` avec `shadow-lg` inversé (ombre vers le haut)
- Icône active : `#FF6340`, taille 24px
- Icône inactive : `#ABABAB`, taille 24px
- Label : Inter 10px 500
- Indicateur actif : point corail 4px sous l'icône (pas de soulignement)

### Chips de sélection

- Fond au repos : `#F4F3F0`, texte `#706D66`
- Fond sélectionné : `#FFE8E3`, texte `#FF6340`, border `1px solid #FF6340`
- Border-radius : `radius-full`
- Padding : `8px 16px`

---

## 8. Patterns UI spécifiques à DogApp

### Timeline de santé (F01)

La timeline est le cœur visuel du carnet de santé. Elle doit être **claire, lisible en un coup d'œil** et **émotionnellement rassurante**.

**Structure :**
- Axe vertical centré : ligne continue `2px solid #E5E4E0`
- Points sur la ligne : cercles 12px, couleur selon le type d'événement
  - Visite véto : marine `#1B2D5A`
  - Vaccin effectué : vert `#22C55E`
  - Symptôme noté : orange `#F59E0B`
  - Médicament : corail `#FF6340`
  - Pesée : bleu `#3B82F6`
- Card événement : à droite du point, card standard avec bordure gauche colorée
- Date : JetBrains Mono 11px, gris, au-dessus de la card
- Regroupement par mois : header de section avec le mois en Plus Jakarta Sans 13px 600 uppercase

### Courbe de poids (F05)

- Fond de graphique : `#FAFAF8`
- Ligne de données : `#FF6340`, stroke 2.5px, coins arrondis
- Zone sous la courbe : gradient corail à 10% d'opacité
- Zone recommandée : rectangle semi-transparent vert `#22C55E` à 8%
- Points de données : cercles blancs bordure corail 2px, visibles uniquement au touch/hover
- Axe Y : JetBrains Mono 11px, `#ABABAB`
- Axe X : Inter 11px, `#ABABAB`
- Label valeur courante : badge flottant corail avec la valeur en JetBrains Mono 14px 700

### Cards rappels et médicaments (F02, F04)

**Rappel à venir :**
```
[ Icône type ] [ Label ]           [ Badge jours restants ]
               [ Date échéance ]   [ Bouton "Effectué" ]
```
- Border gauche 4px : rouge si < 7j, orange si < 30j, vert si > 30j
- Bouton "Effectué" : ghost corail, compact

**Médicament actif :**
```
[ Nom médicament ]                 [ Stock restant (nb prises) ]
[ Dosage · Fréquence ]             [ Prochaine prise : HH:MM ]
[ Barre de progression durée ]
```
- Barre de progression : fond `#FFE8E3`, remplie corail
- Stock faible : badge warning, icône `Package` orange

### Check-up rapide — flux questionnaire (F12)

- Une question par écran (pas de scroll)
- Progress bar horizontale en haut : fond `#E5E4E0`, remplie corail, animée
- Numéro de question : Inter 12px, `#ABABAB`, ex. "3 / 12"
- Question : Plus Jakarta Sans 20px 700, centré, `#1A1815`
- Réponses : chips de sélection empilées verticalement, largeur 100%
- Animation de transition : slide horizontal (gauche vers droite)
- Résultat final : illustration + score + recommandation + boutons d'action

### Carte vétérinaire (F10)

```
[ Nom clinique ]           [ Bouton appel ]
[ Adresse · Distance ]     [ Badge "Urgences 24h" si applicable ]
[ Horaires du jour ]       [ Étoile favori ]
```
- Map intégrée en header de l'écran (hauteur 200px)
- Pins sur la map : cercle corail pour vétérinaires standards, pin rouge pour urgences 24h
- Card vétérinaire en bottom sheet scrollable sur la map

### États vides

Chaque liste vide a une illustration dédiée + titre + sous-titre + CTA.

| Écran | Illustration | Titre | CTA |
|-------|-------------|-------|-----|
| Pas de chien | Chien assis curieux | "Commencez l'aventure" | "Ajouter mon chien" |
| Carnet vide | Chien + carnet ouvert | "Votre carnet est vierge" | "Ajouter une visite" |
| Pas de rappels | Calendrier vide | "Tout est à jour !" | "Configurer les rappels" |
| Fil social vide | Chiots jouant | "Rejoignez la communauté" | "Explorer les groupes" |

### Notifications et toasts

- Position : top de l'écran (sous la status bar mobile, top-right sur web)
- Durée : 3 secondes (informatif), persistant (erreur, action requise)
- Border-radius : `radius-md`
- Icône à gauche selon le type (Check, AlertTriangle, Info, X)
- Animation : slide down + fade in

### Onboarding (3 écrans)

**Structure par écran :**
- Illustration grand format (60% de l'écran) en haut
- Titre Display L centré
- Sous-titre Body L centré, `#706D66`
- Indicateurs de pagination : 3 points, actif en corail, inactifs en `#E5E4E0`
- Bouton "Suivant" primaire pleine largeur en bas

**Thèmes des 3 écrans :**
1. "Votre chien mérite le meilleur suivi" — illustration chien + propriétaire heureux
2. "Ne ratez plus jamais un vaccin" — calendrier avec notifications animées
3. "Rejoignez des milliers de passionnés" — illustration communauté de chiens

---

## 9. Direction mobile (React Native)

### Philosophie mobile

L'expérience mobile est **native-first** : les gestes, animations et comportements respectent les conventions iOS et Android. Pas de compromis entre les deux plateformes — chaque plateforme reçoit ses patterns natifs.

### Navigation

**Structure de navigation :**
```
Root Stack
├── Auth Stack (Login, Register, Onboarding)
└── Main Tab Navigator
    ├── Home (Accueil)
    │   └── Dog Stack (sélection chien + contexte)
    ├── Health Stack (F01–F04, F12)
    ├── Activity Stack (F07)
    ├── Nutrition Stack (F06)
    └── Community Stack (F14)
    
Modales globales (accessibles depuis n'importe quel tab) :
├── Vétérinaires (F10)
├── Profil chien
└── Paramètres
```

**Bottom Tab Bar :**
- Toujours visible (sauf pendant l'onboarding et les modales plein écran)
- Labels visibles sur iOS, icônes + labels sur Android
- Badge rouge (nombre) sur l'onglet Santé si rappels en retard

### Gestes

- **Swipe gauche** sur une card de rappel : action rapide "Effectué" (green check)
- **Long press** sur une entrée du carnet : menu contextuel (modifier, supprimer, partager)
- **Pull-to-refresh** sur toutes les listes
- **Swipe down** sur les bottom sheets pour fermer
- **Pinch** sur les graphiques de poids pour zoomer

### Bottom Sheets

Utilisées systématiquement à la place des modales plein écran pour :
- Ajout rapide (pesée, symptôme, soin hygiène)
- Détail d'un vétérinaire
- Sélection du chien actif

**Snap points :** 40%, 70%, 100%

### Animations

- **Transitions de page :** slide horizontal (iOS), fade + scale (Android)
- **Apparition de cards :** stagger animation (délai de 50ms entre chaque card)
- **Bouton CTA :** spring scale à 0.97 au press, retour élastique
- **Confetti / succès :** animation de particules corail + or au marquage d'un rappel effectué
- **Graphique de poids :** dessin animé de la courbe au premier affichage (0.6s ease-out)
- Utiliser `react-native-reanimated` pour toutes les animations (performances natives)

### Typographie mobile — ajustements

- Dynamic Type (iOS) et font scaling (Android) supportés
- Taille minimale : 11px (jamais en dessous)
- `allowFontScaling: false` uniquement pour les icônes et les indicateurs numériques purs

### Touch targets

- Minimum 44×44px sur tous les éléments interactifs (Apple HIG)
- Boutons d'action dans les lists : minimum 48×48px (Material)

---

## 10. Direction web (Next.js)

### Philosophie web

Le web est une **expérience de consultation enrichie** : tableaux de bord, graphiques larges, historiques complets. Les actions rapides restent simples, mais la surface d'écran permet une densité d'information plus élevée qu'en mobile.

### Layout général

```
┌─────────────────────────────────────────────────────┐
│  TOPBAR (64px)                                      │
│  Logo · Sélecteur chien · Notifications · Profil    │
├────────────────┬────────────────────────────────────┤
│  SIDEBAR       │  MAIN CONTENT                      │
│  (240px fixe)  │  (fluid, max 1040px)               │
│                │                                    │
│  Navigation    │  Page header                       │
│  principale    │  ──────────                        │
│                │  Contenu principal                 │
│  ──────────    │                                    │
│  Liens rapides │                                    │
│  ──────────    │                                    │
│  Chien actif   │                                    │
│  (mini card)   │                                    │
└────────────────┴────────────────────────────────────┘
```

### Sidebar

- Background : `#F4F3F0` (légèrement distinct du fond principal)
- Largeur : 240px (fixe), collapsable sur `md` breakpoint (icônes seules, 64px)
- Liens actifs : fond `#FFE8E3`, texte `#FF6340`, icône `#FF6340`
- Liens inactifs : texte `#706D66`, hover fond `#FFFFFF`
- Section du chien actif en bas de sidebar : mini card avec photo + nom + switcher si multi-chiens

### Topbar

- Background : `#FFFFFF`, border-bottom `1px solid #E5E4E0`
- Hauteur : 64px
- Logo à gauche
- Sélecteur de chien actif au centre (dropdown)
- Icône cloche (notifications) + avatar (menu profil) à droite

### Dashboard (Accueil web)

Grille de widgets en 2 colonnes sur `lg`, 1 colonne sur `md` :

| Widget | Taille | Contenu |
|--------|--------|---------|
| Rappels urgents | Full width | Liste des rappels < 7j, bouton "Effectué" |
| Courbe de poids | 1 col | Graphique 3 mois glissants |
| Prochaine balade | 1 col | Prochain calendrier + météo (si dispo) |
| Médicaments du jour | Full width | Liste prises du jour avec statut |
| Activité récente | 1 col | Dernières 5 entrées du carnet |
| Check-up | 1 col | Score dernier check-up + bouton relancer |

### Tables et listes web

- Header de colonne : Inter 12px 600 uppercase, `#706D66`, border-bottom `2px solid #E5E4E0`
- Lignes : hover fond `#FAFAF8`, border-bottom `1px solid #E5E4E0`
- Actions de ligne : apparaissent au hover (icônes edit, delete, share)
- Pagination : cursor-based, boutons "Précédent" / "Suivant" + info "1–20 sur 47"

### Responsive

| Breakpoint | Comportement |
|-----------|-------------|
| `< 640px` | Layout mobile (renvoyer vers l'app mobile recommandé) |
| `640–1024px` | Sidebar en overlay, topbar conservée, contenu 1 colonne |
| `> 1024px` | Layout complet sidebar + contenu 2 colonnes |

---

## 11. Ton, voix et microcopy

### Personnalité de la marque

DogApp parle comme **un ami passionné de chiens qui a aussi des connaissances en santé animale**. Jamais condescendant, jamais alarmiste sans raison, toujours bienveillant.

### Adjectifs de ton

| Oui | Non |
|-----|-----|
| Chaleureux | Clinique |
| Direct | Jargonneux |
| Encourageant | Culpabilisant |
| Humain | Robotique |
| Précis | Vague |

### Exemples de microcopy

**Actions :**
- ✅ "Ajouter une visite" — ❌ "Créer un enregistrement médical"
- ✅ "C'est fait !" — ❌ "Opération réussie"
- ✅ "On note ça." — ❌ "Données enregistrées"

**États vides :**
- ✅ "Max n'a pas encore de pesées. La première, c'est maintenant ?" — ❌ "Aucune donnée disponible"

**Erreurs :**
- ✅ "Quelque chose a mal tourné. On réessaie ?" — ❌ "Erreur 500 : Internal Server Error"
- ✅ "Ce champ est obligatoire" — ❌ "Validation error: field required"

**Notifications :**
- ✅ "🐾 Le rappel anti-puces de Rex arrive dans 7 jours" — ❌ "Rappel échéant dans 7 jours"
- ✅ "Bravo ! Médicament pris pour aujourd'hui ✓" — ❌ "Dose confirmée"

**Check-up :**
- ✅ "Tout a l'air bien pour Max aujourd'hui !" — ❌ "Score : 85/100. Statut : Normal"
- ✅ "Quelques points à surveiller. Rien d'urgent, mais gardez un œil." — ❌ "Score modéré détecté"

### Règles de rédaction

- Tutoiement systématique (proximité, communauté)
- Prénom du chien utilisé dès que connu (pas "votre animal")
- Les messages d'erreur proposent toujours une action ("réessayer", "contacter le support")
- Les disclaimers médicaux sont courts, clairs, jamais envahissants
- Ponctuation : pas de point final sur les titres et les labels courts

---

## 12. Direction des écrans clés

> Ces descriptions sont destinées à guider la création des maquettes. Chaque écran est décrit dans son état principal (happy path).

---

### Écran 1 — Accueil / Dashboard mobile

**Header :**
- "Bonjour, [Prénom] 👋" — Plus Jakarta Sans 24px 700
- Date du jour — Inter 14px, `#706D66`
- Switcher chien (si multi-chiens) : chips horizontaux scrollables

**Section Rappels urgents :**
- Titre : "À faire" + badge rouge (nombre)
- 2–3 cards rappels avec border gauche rouge/orange

**Section Activité du jour :**
- Card prise médicament du jour (statut visuel des prises)
- Mini graphique poids (7 derniers jours, inline)

**Section Découvrir :**
- "Check-up rapide" — card avec illustration + bouton
- "Événement à venir" — card événement communautaire le plus proche

**FAB (Floating Action Button) :**
- `+` corail, 56px, bottom-right
- Au tap : menu radial avec : "Ajouter une visite", "Noter un symptôme", "Peser [Chien]"

---

### Écran 2 — Profil du chien

**Header avec gradient :**
- Photo du chien centrée (96px, border blanche)
- Nom + race — Plus Jakarta Sans 24px 700 blanc
- "3 ans · Mâle · 28,5 kg" — Inter 14px blanc à 80%

**Chips d'information rapide (scrollables) :**
- Dernière visite véto, Prochain vaccin, Dernier poids

**Sections :**
- Carnet de santé (timeline preview 3 derniers événements + "Voir tout")
- Médicaments actifs (liste compacte)
- Poids (mini graphique inline)
- Informations officielles (numéro puce, LOF/LOMAD si renseigné)

---

### Écran 3 — Carnet de santé (liste)

**Filter bar :**
- Chips : "Tout", "Visites", "Vaccins", "Symptômes", "Médicaments"
- Bouton "+" à droite

**Timeline :**
- Axe vertical + events empilés chronologiquement
- Regroupement par mois (header sticky)
- Swipe gauche sur une card → options (modifier, supprimer)

---

### Écran 4 — Ajout d'une visite (Bottom sheet / Modale)

**Header :**
- "Nouvelle visite" — Plus Jakarta Sans 20px 700
- Bouton "Annuler" gauche, "Enregistrer" droite (corail, disabled jusqu'à champs requis remplis)

**Formulaire :**
1. Date de la visite (date picker natif)
2. Nom du vétérinaire (input texte + suggestion favoris)
3. Motif (input texte)
4. Diagnostic (textarea)
5. Notes (textarea, optionnel)
6. Pièces jointes (bouton "Ajouter photo / PDF")

---

### Écran 5 — Suivi du poids

**Header :**
- Titre "Poids de [Chien]"
- Poids actuel : JetBrains Mono 40px 700, corail
- Variation vs pesée précédente : Inter 14px vert (↑) ou rouge (↓)

**Graphique principal :**
- Sélecteur de période : 1M · 3M · 6M · 1A · Tout
- Courbe animée
- Zone verte "poids recommandé" pour la race

**Historique :**
- Liste des pesées, date + valeur + variation
- Swipe gauche pour supprimer une entrée

**FAB :** "Peser maintenant" (bottom right)

---

### Écran 6 — Check-up rapide

**Écran intro :**
- Illustration chien + stéthoscope
- Titre "Comment va [Chien] aujourd'hui ?"
- Sous-titre "15 questions · 2 minutes"
- Bouton "Commencer" + lien "En savoir plus" (ouvre le disclaimer légal)

**Écran question (× 15) :**
- Progress bar animée (top)
- "Question X / 15" — Inter 12px gris
- Question — Plus Jakarta Sans 20px 700
- Réponses — chips pleine largeur, sélection unique
- Bouton "Suivant" en bas (disabled si aucune réponse)

**Écran résultat :**
- Illustration selon le résultat (chien heureux / chien inquiet)
- Score visuel (jauge arc de cercle, corail pour bon, orange pour moyen, rouge pour urgent)
- Recommandation — Inter 16px centré
- Actions : "Appeler un vétérinaire" (si critique), "Voir l'annuaire", "Enregistrer dans le carnet"

---

### Écran 7 — Dashboard web (Accueil)

**Layout 2 colonnes :**

Colonne gauche (60%) :
- Widget rappels urgents (liste avec actions inline)
- Widget médicaments du jour (tableau des prises)

Colonne droite (40%) :
- Widget poids (graphique 3 mois)
- Widget prochain événement communautaire

**Section inférieure (full width) :**
- Timeline des 5 derniers événements de santé
- Bouton "Voir le carnet complet"

---

## 13. Accessibilité

### Contrastes (WCAG 2.1 AA)

| Combinaison | Ratio | Valide |
|-------------|-------|--------|
| Texte `#1A1815` sur `#FAFAF8` | 17.1:1 | ✅ AAA |
| Texte `#706D66` sur `#FFFFFF` | 4.8:1 | ✅ AA |
| Texte blanc sur `#FF6340` | 3.1:1 | ⚠️ AA pour grand texte uniquement — ne pas utiliser pour body text |
| Texte `#FF6340` sur `#FFFFFF` | 3.5:1 | ⚠️ Grands textes / icônes uniquement |
| Texte blanc sur `#1B2D5A` | 10.4:1 | ✅ AAA |

> **Règle :** les textes body (< 18px) sur fond corail sont interdits. Le corail est réservé aux titres larges, icônes, bordures et fonds de petites surfaces.

### Focus visible

- Outline focus : `2px solid #FF6340`, offset `2px`
- Jamais `outline: none` sans remplacement visible

### Labels et alternatives texte

- Toutes les icônes interactives ont un `aria-label`
- Les images d'illustration ont un `alt` descriptif (ou `alt=""` si purement décoratives)
- Les graphiques ont une description textuelle alternative accessible

### Tailles minimales

- Texte : 12px minimum (11px toléré uniquement pour les légendes non interactives)
- Touch targets : 44×44px minimum
- Inputs : hauteur minimale 44px

---

## 14. Ce qu'il faut éviter

| À éviter | Pourquoi | Alternative |
|----------|---------|-------------|
| Fond corail sur grandes surfaces | Fatigue visuelle, mauvais contraste texte | Fond `#FAFAF8` ou blanc, accent corail en détail |
| Trop de couleurs simultanées | Surcharge cognitive | Max 3 couleurs par écran |
| Ombres portées épaisses | Look daté | Ombres légères `shadow-md` ou bordures |
| Texte centré dans les listes | Difficile à scanner | Alignement gauche systématique |
| Toasts d'erreur sans action | Frustrant | Toujours proposer "Réessayer" ou "En savoir plus" |
| Animations lentes (> 400ms) | Ressenti lent | 200–300ms pour les transitions, 600ms max pour les graphiques |
| Modales plein écran sur mobile | Natif désagréable | Bottom sheets avec snap points |
| Illustrations génériques/stock | Perd le caractère de marque | Illustrations custom style charte |
| Jargon médical dans l'UI | Peur/incompréhension | Langage simple, termes validés |
| Notifications trop fréquentes | Désinstallation | Regroupement intelligent, préférences fines |

---

## Annexe — Tokens résumés

```js
// Couleurs
colors: {
  primary: '#FF6340',
  primaryDark: '#D94B2B',
  primaryLight: '#FFE8E3',
  secondary: '#1B2D5A',
  secondaryMid: '#2E4A8C',
  secondaryLight: '#E8EDF7',
  accent: '#FFB800',
  background: '#FAFAF8',
  surface: '#FFFFFF',
  surfaceAlt: '#F4F3F0',
  border: '#E5E4E0',
  textPrimary: '#1A1815',
  textSecondary: '#706D66',
  textDisabled: '#ABABAB',
  success: '#22C55E',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
}

// Typographie
fonts: {
  display: 'Plus Jakarta Sans',
  body: 'Inter',
  mono: 'JetBrains Mono',
}

// Espacements (px)
spacing: { 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 8:32, 10:40, 12:48, 16:64 }

// Border radius
radius: { sm:6, md:12, lg:16, xl:24, full:9999 }
```
