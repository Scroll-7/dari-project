# Rapport de Projet : Application "Dari"

## 1. Présentation Générale
**Dari** est une application mobile immobilière innovante conçue pour centraliser et simplifier la recherche de logements, la mise en relation avec des colocataires compatibles, et la réservation de prestataires de services locaux. Développée avec une interface utilisateur moderne et premium (Glassmorphism), l'application vise à offrir une expérience fluide, centralisée et sécurisée pour les locataires, les acheteurs et les propriétaires.

---

## 2. Fonctionnalités Principales

### 🏡 2.1. Recherche de Biens Immobiliers
- **Exploration diversifiée :** Catalogue incluant des appartements, maisons, chambres privées et locaux commerciaux.
- **Détails enrichis :** Fiches de propriétés avec galeries photos, descriptions détaillées, équipements (Wi-Fi, parking, climatisation), et carte de localisation.
- **Filtres et Catégories :** Navigation simplifiée par catégories de biens immobiliers.
- **Système de Favoris :** Possibilité d'enregistrer des propriétés ("Saved Properties") pour les consulter ultérieurement.

### 🤝 2.2. Matching de Colocataires
- **Profils détaillés :** Présentation des candidats avec âge, profession, budget, intérêts, et habitudes de vie (fumeur, animaux, etc.).
- **Algorithme de Compatibilité :** Un score en pourcentage (CompatRing) indique la compatibilité entre l'utilisateur et un colocataire potentiel en fonction de leurs styles de vie.
- **Avis et Expériences :** Historique des expériences de colocation passées avec un système de notation par étoiles.

### 🛠 2.3. Répertoire de Prestataires de Services
- **Services du quotidien :** Mise en relation directe avec des professionnels : Plombiers, Électriciens, Agents d'entretien, Déménageurs, Peintres, et Menuisiers.
- **Détails des prestataires :** Tarifs horaires, années d'expérience, disponibilité en temps réel, spécialités et avis clients.
- **Actions rapides :** Possibilité d'appeler directement le prestataire, de le contacter via WhatsApp ou via la messagerie interne de l'application.

### 💬 2.4. Messagerie Intégrée (Inbox & Chat)
- **Centralisation des échanges :** Un système de chat en temps réel permettant de discuter avec les annonceurs de biens, les colocataires potentiels, et les prestataires de services.
- **Gestion intelligente :** Organisation des conversations par "Tags" (Service, Colocataire) avec des avatars générés dynamiquement.

### 🎨 2.5. Design System & Thème Dynamique
- **Mode Sombre / Mode Clair :** L'application intègre un système de thème dynamique (`ThemeContext`) qui bascule de façon réactive entre un thème clair lumineux et un mode sombre premium.
- **Interface "Glassmorphism" :** Utilisation d'effets de flou, de dégradés et de transparences pour une UI moderne et engageante.

---

## 3. Architecture Technique et Stack

L'application est construite sur des technologies mobiles modernes assurant performance et maintenabilité :

*   **Framework Mobile :** React Native (avec Expo)
*   **Navigation :** React Navigation (Bottom Tabs, Stack Navigator)
*   **Backend & Base de données :** Firebase (Authentification, Firestore pour la base de données en temps réel)
*   **Gestion d'état (State Management) :** Utilisation intensive de l'API Context de React :
    *   `AuthContext` : Gestion de la session utilisateur.
    *   `ThemeContext` : Gestion centralisée des couleurs et de l'apparence (Light/Dark mode).
    *   `ConversationContext` : Gestion de l'état des discussions et des messages non lus.
    *   `UserContext` : Informations de profil de l'utilisateur (nom, avatar, préférences).
*   **Style :** Vanilla React Native StyleSheet optimisé avec des générateurs de styles dynamiques (`getStyles(colors)`) pour répondre aux changements de thèmes instantanément.

---

## 4. Structure des Écrans (User Flow)

1.  **Écrans d'Authentification :** Login, Signup, Welcome (Onboarding).
2.  **Home Screen (Accueil) :** Tableau de bord avec les catégories de biens, les colocataires recommandés, et les accès rapides.
3.  **Search & Explorer :** Cartes interactives des propriétés par catégories (Appartements, Maisons, Commercial).
4.  **Property Detail :** Vue complète d'un bien immobilier.
5.  **Roommates Screen :** Liste des colocataires triée par algorithme de compatibilité.
6.  **Services Screen :** Grille des services disponibles avec bannières d'urgences.
7.  **Inbox & Chat :** Liste des conversations récentes et interface d'échange de messages.
8.  **Profile & Settings :** Gestion des informations personnelles, statistiques du marché immobilier (Market Insights), propriétés enregistrées et déconnexion.

---

## 5. Aspects Clés pour le Rapport

Pour un rapport de soutenance ou de présentation de projet, voici les points forts à mettre en avant :

*   **Approche "Tout-en-un" :** Contrairement aux applications immobilières classiques, Dari résout 3 problèmes majeurs en une seule plateforme : trouver le bien, trouver la personne avec qui le partager, et trouver les prestataires pour l'entretenir.
*   **Expérience Utilisateur (UX) :** Résolution des problèmes de performance et implémentation d'un design fluide et sans crash grâce à une gestion rigoureuse de l'arborescence des composants React et de leurs cycles de vie.
*   **Évolutivité (Scalability) :** L'architecture basée sur des *Context Providers* et Firebase permet à l'application de s'étendre facilement (ajout de nouvelles villes, de nouveaux types de services, ou de méthodes de paiement in-app).

---

## 6. Structure de la Base de Données (Firebase Firestore)

L'application repose sur une base de données NoSQL (Firestore) organisée autour des collections principales suivantes :

### 👤 `users` (Utilisateurs)
- **Document ID :** `uid` (issu de Firebase Authentication)
- **Champs principaux :** `name`, `email`, `role`, `createdAt`, `avatar`, `preferences` (thème, notifications).
- **Rôle :** Centralise les données de profil et les paramètres utilisateurs.

### 🏠 `properties` (Biens Immobiliers)
- **Document ID :** Auto-généré
- **Champs principaux :** `title`, `description`, `price`, `location` (ville, coordonnées GPS), `type` (appartement, maison, etc.), `amenities` (liste), `images` (URLs), `ownerId` (référence vers `users`), `status` (disponible, loué).
- **Rôle :** Stocke toutes les annonces immobilières affichées dans l'application.

### 🤝 `roommatePosts` (Annonces Colocation)
- **Document ID :** Auto-généré
- **Champs principaux :** `uid` (référence utilisateur), `name`, `description` (bio), `budget`, `city`, `interests` (tableau), `habits` (tableau), `createdAt`.
- **Rôle :** Alimente l'algorithme de compatibilité et la liste des candidats à la colocation.

### 💬 `conversations` (Messagerie)
- **Document ID :** Auto-généré
- **Champs principaux :** `participants` (tableau des `uid`), `lastMessage`, `lastUpdated`, `type` (chat standard, contact prestataire).
- **Sous-collection `messages` :**
  - **Champs :** `senderId`, `text`, `timestamp`, `read` (booléen).
- **Rôle :** Gère la messagerie interne en temps réel entre locataires, propriétaires et prestataires.

### 🛠 `services` (Prestataires) *[Mock / Future Collection]*
- **Document ID :** Auto-généré
- **Champs principaux :** `name`, `category` (Plomberie, Électricité...), `rating`, `reviews`, `price`, `phone`, `specialty`, `available`.
- **Rôle :** Annuaire des professionnels pour l'entretien et les réparations.

## 7. Diagrammes de Cas d'Utilisation (UML)

L'application identifie trois acteurs principaux : l'**Utilisateur Standard** (locataire/acheteur/colocataire), le **Propriétaire** (bailleur) et le **Prestataire de services**.

### 7.1. Cas d'utilisation : Utilisateur Standard & Propriétaire

```mermaid
usecaseDiagram
    actor "Utilisateur Standard" as User
    actor "Propriétaire" as Owner

    package "Application Dari" {
        usecase "S'authentifier (Login/Signup)" as UC1
        usecase "Gérer son profil" as UC2
        
        usecase "Rechercher des biens immobiliers" as UC3
        usecase "Ajouter un bien aux favoris" as UC4
        
        usecase "Rechercher un colocataire" as UC5
        usecase "Consulter le score de compatibilité" as UC6
        
        usecase "Publier une annonce immobilière" as UC7
        usecase "Gérer ses annonces" as UC8
        
        usecase "Envoyer/Recevoir des messages" as UC9
    }

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC9

    Owner --> UC1
    Owner --> UC2
    Owner --> UC7
    Owner --> UC8
    Owner --> UC9
```

### 7.2. Cas d'utilisation : Prestataires de Services

```mermaid
usecaseDiagram
    actor "Utilisateur Standard" as User
    actor "Prestataire de Services" as Pro

    package "Module de Services Dari" {
        usecase "Rechercher un professionnel" as SP1
        usecase "Consulter les avis et tarifs" as SP2
        usecase "Contacter via Messagerie interne" as SP3
        usecase "Contacter via Appel / WhatsApp" as SP4
        usecase "Gérer sa disponibilité" as SP5
        usecase "Répondre aux demandes clients" as SP6
    }

    User --> SP1
    User --> SP2
    User --> SP3
    User --> SP4

    Pro --> SP5
    Pro --> SP6
    Pro --> SP3
    Pro --> SP4
```

---

## 8. Perspectives d'Évolution
*   Intégration d'une API de cartographie (Google Maps/Mapbox) complète pour la recherche géographique.
*   Paiement intégré sécurisé pour la réservation de prestataires ou le dépôt de garantie de location.
*   Système de vérification d'identité (KYC) renforcé pour certifier les colocataires et les prestataires de services.
