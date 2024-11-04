# Github Action Logs Workflows [FR]

**Description**  
Cette application permet de visualiser les workflows GitHub en fonction de leur état d'exécution en temps réel. Elle se connecte à l'API de GitHub et utilise GitHub SSO pour authentifier les utilisateurs. Les workflows peuvent être affichés avec les statuts suivants :

- **En cours** (Running)
- **Annulé** (Cancelled)
- **Échec** (Failure)
- **Succès** (Success)

L'application permet également de télécharger les logs associés à chaque workflow, facilitant ainsi le suivi et le débogage.

## Fonctionnalités

- **Visualisation des workflows GitHub** : Affichage des workflows GitHub avec leur état actuel.
- **Filtrage par statut** : Affichage des workflows en fonction de leur statut spécifique (en cours, annulé, échec, succès).
- **Téléchargement des logs** : Possibilité de télécharger les logs pour chaque workflow directement depuis l'interface.
- **Authentification GitHub SSO** : Authentification sécurisée via GitHub SSO pour accéder aux données des workflows.

## Prérequis

Pour utiliser cette application, vous devez disposer de vos **credentials GitHub** (token personnel ou client ID/client secret pour OAuth). Ceux-ci sont nécessaires pour autoriser les appels à l'API de GitHub.

## Installation

### Prérequis Techniques

- **Node.js** (version >= 20)
- **npm** (ou **yarn**)
- **GitHub Credentials** : Créez une application OAuth sur votre compte GitHub pour obtenir les credentials nécessaires (client ID et secret).

### Configuration de l'application

1. Clonez le dépôt dans votre environnement local :

   ```bash
   git clone https://github.com/votre_utilisateur/votre_application.git
   cd votre_application
   ```

2. Installez les dépendances :

   ```bash
   yarn install
   ```

3. Créez un fichier `.env.local` à la racine de votre projet pour stocker vos credentials GitHub :

   ```plaintext
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

   Remplacez `your_client_id` et `your_client_secret` par vos identifiants GitHub.

### Démarrage de l'application

1. Démarrez l'application avec la commande suivante :

   ```bash
   yarn dev
   ```

2. L'application sera disponible à l'adresse `http://localhost:3000`.

## Utilisation

1. Accédez à `http://localhost:3000` dans votre navigateur.
2. Connectez-vous via GitHub SSO pour autoriser l'accès aux données de workflows.
3. La page principale affiche la liste des workflows GitHub associés à votre compte ou organisation.
4. Utilisez les filtres pour afficher uniquement les workflows selon leur statut actuel.
5. Pour chaque workflow, cliquez sur le bouton "Télécharger les logs" pour obtenir un fichier contenant les logs du workflow.

## Architecture

L'application est construite avec les technologies suivantes :

- **Framework** : Next.js 15 avec App Router pour une gestion avancée des routes et de l'authentification.
- **Authentification** : GitHub SSO via OAuth pour une connexion sécurisée.
- **API** : Intégration avec l'API de GitHub pour récupérer les données de workflows en temps réel.

## Contribution

1. Forkez le projet.
2. Créez une nouvelle branche pour vos modifications (`git checkout -b feature/ma-feature`).
3. Committez vos changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`).
4. Poussez vers la branche (`git push origin feature/ma-feature`).
5. Créez une Pull Request.

## Auteurs

- **Nom du Développeur** - Développeur principal
- **Nom des Contributeurs** - Contributeurs éventuels

## Licence

Ce projet est sous licence MIT - consultez le fichier [LICENSE](LICENSE) pour plus de détails.

---

Ce README offre une documentation adaptée pour les utilisateurs souhaitant installer et utiliser l'application avec Next.js, GitHub SSO, et les appels à l'API GitHub pour la gestion des workflows.