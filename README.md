<p align="center">
    <img src="https://raw.githubusercontent.com/lonk/mjrt/master/web/public/logo.png" alt="Mjrt logo" width="300" />
</p>

Ce projet est une recréation avec des technologies actuelles de Majority, de la Motion Twin.
La dernière version officielle est en ligne sur https://mjrt.net/

Sentez-vous libre de proposer des PR en respectant la philosophie suivante:
- Pas d'inscription
- Compatibilité navigateur et mobile

## Technologies utilisées
- Node.js + Express + Socket.io pour l'API
- React + Socket.io pour le front

## Prérequis
- Node 12
- Yarn
- Une base de données de questions et réponses

## Lancement de la stack

Créez les fichiers de configuration suivants :
- `api/.env` : Fichier de configuration du serveur. Voir le fichier `api/.env.example`.
- `api/database/vox-questions.json` : Base de données de questions. Voir le fichier `api/database/vox-questions.json.example`.
- `api/database/vox-answers.json` : Base de données de réponses. Voir le fichier `api/database/vox-answers.json.example`.

### En utilisant Yarn

```sh
git clone https://github.com/lonk/mjrt
cd mjrt
yarn
yarn deploy
yarn serve # (port 3001)
```

### En utilisant Docker

```sh
docker build -t my-mjrt-app .
docker run -p 3001:3001 my-mjrt-app
```

Accès via [localhost:3001](http://localhost:3001).