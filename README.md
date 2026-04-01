# Todo App - TP Cloud Polytech

Ce projet est une application de gestion de tâches (Todo List) réalisée dans le cadre d'un TP sur le PaaS Clever Cloud.

## Fonctionnalités
- Gestion complète des tâches (CRUD)
- Filtrage par statut (`pending` / `done`)
- Liste des tâches en retard (`overdue`)
- Notifications en temps réel via **Server-Sent Events (SSE)**

## Installation

1. Cloner le repository
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Créer un fichier `.env` basé sur `.env.example` :
   ```bash
   cp .env.example .env
   ```

## Utilisation en local

Démarrez le serveur :
```bash
node index.js
```
L'application sera accessible sur `http://localhost:3000`.

## API Endpoints

- `GET /health` : Vérifie l'état de l'application et de la base de données.
- `GET /todos` : Liste toutes les tâches (filtre optionnel `?status=pending|done`).
- `POST /todos` : Crée une nouvelle tâche.
- `PATCH /todos/:id` : Mise à jour partielle d'une tâche.
- `DELETE /todos/:id` : Supprime une tâche.
- `GET /todos/overdue` : Liste les tâches en retard.
- `GET /alerts` : Flux SSE pour les notifications.
- `POST /todos/:id/notify` : Déclenche une alerte SSE pour une tâche spécifique.

## Déploiement

L'application est configurée pour être déployée sur **Clever Cloud** avec un add-on **PostgreSQL**.

Lien de l'application : [https://app-b869d626-bcdc-4b00-aa87-fafeecd6622e.cleverapps.io/](https://app-b869d626-bcdc-4b00-aa87-fafeecd6622e.cleverapps.io/)
