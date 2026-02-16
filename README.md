# Systeme de Gestion Integree de Stock avec ERP

### Internship Project – 2024/2025

**Entreprise : BC Skills**  
**Realise par : Ilham Elazzam**

---

## Description du Projet

Ce projet consiste en la conception et le developpement d'un **module web de gestion de stock integre a un ERP (Business Suite)**.

L'objectif principal est de :

- Centraliser les operations d'achats
- Automatiser le suivi des commandes
- Assurer la tracabilite des produits
- Optimiser la gestion des stocks

Le systeme permet de gerer :

- Les demandes d'achat
- Les commandes fournisseurs
- Les mouvements de stock
- Les rapports et statistiques
- Les utilisateurs et roles

---

## Technologies Utilisees

### Backend
- **Node.js**
- **Express.js**
- **Prisma ORM**
- **JWT (authentification securisee)**
- **PostgreSQL**

### Frontend
- **React.js**
- **Tailwind CSS**
- **React Router**

### Outils
- VS Code
- Postman
- pgAdmin
- Prisma Studio
- Git / GitHub

---

## Architecture

Architecture client-serveur REST :

Frontend (React)
-> API REST (Node + Express)
-> Base de donnees PostgreSQL

Cette architecture garantit :

- Separation des responsabilites
- Securite
- Scalabilite
- Maintenabilite

*(Architecture detaillee visible dans le rapport – Chapitre 3)*

---

## Acteurs du Systeme

- **Administrateur**
- **Responsable de departement**
- **Fournisseur**

---

## Fonctionnalites Principales

### Espace Administrateur
- Authentification securisee (JWT)
- Gestion des utilisateurs
- Gestion des produits
- Validation des demandes d'achat
- Gestion des commandes
- Rapports et statistiques
- Parametres systeme

Captures incluses :
- Connexion Admin
- Dashboard Administrateur
- Liste des utilisateurs
- Gestion des produits
- Rapports & statistiques

### Espace Utilisateur
- Creation de demandes d'achat
- Suivi des statuts
- Consultation du stock
- Gestion du profil
- Reinitialisation mot de passe

Captures incluses :
- Dashboard utilisateur
- Creation de demande
- Consultation stock
- Suivi des statuts

---

## Fonctionnalites Cles

- Suivi des entrees / sorties de stock  
- Gestion des seuils critiques  
- Generation de rapports  
- Export PDF / Excel  
- Alertes et notifications  
- Authentification securisee

---

## Enjeux du Projet

- Reduction des erreurs manuelles
- Amelioration de la tracabilite
- Centralisation des donnees
- Automatisation des processus
- Aide a la prise de decision

---
## La conception

<img width="2108" height="1372" alt="UseCase Diagram0" src="https://github.com/user-attachments/assets/fd133675-be09-447c-ab06-2c5958a3768b" />
<img width="1298" height="1137" alt="Class Diagram0" src="https://github.com/user-attachments/assets/da7d592d-eb54-43b0-8620-d15274f14a56" />
<img width="2685" height="1448" alt="Sequence Diagram0" src="https://github.com/user-attachments/assets/a169d385-c722-4bd6-a16e-0e9754e2794f" />

---

## Captures d'ecran

Le dossier `captures/` contient toutes les illustrations ci-dessous :

![Capture 1](captures/capture1.png)
![Capture 2](captures/capture2.png)
![Capture 3](captures/capture3.png)
![Capture 4](captures/capture4.png)
![Capture 5](captures/capture5.png)
![Capture 6](captures/capture6.png)
![Capture 7](captures/capture7.png)
![Capture 8](captures/capture8.png)
![Capture 9](captures/capture9.png)
![Capture 10](captures/capture10.png)
![Capture 11](captures/capture11.png)
![Capture 12](captures/capture12.png)
![Capture 13](captures/capture13.png)
![Capture 14](captures/capture14.png)
![Capture 15](captures/capture15.png)
![Capture 16](captures/capture16.png)
![Capture 17](captures/capture17.png)
![Capture 18](captures/capture18.png)
![Capture 19](captures/capture19.png)
![Capture 20](captures/capture20.png)
![Capture 21](captures/capture21.png)
![Capture 22](captures/capture22.png)
![Capture 23](captures/capture23.png)
![Capture 24](captures/capture24.png)
![Capture 25](captures/capture25.png)
![Capture 26](captures/capture26.png)
![Capture 27](captures/capture27.png)
![Capture 28](captures/capture28.png)
![Capture 29](captures/capture29.png)
![Capture 30](captures/capture30.png)
![Capture 31](captures/capture31.png)
![Capture 32](captures/capture32.png)
![Capture 33](captures/capture33.png)
![Capture 34](captures/capture34.png)
![Capture 35](captures/capture35.png)

---

## Perspectives d'Amelioration

- Notifications automatiques (email / SMS)
- Integration Business Intelligence
- Deploiement Cloud
- Dashboard analytique avance

---

## Rapport Complet

Le rapport detaille du projet est disponible dans le fichier :

`rapport de stage.pdf`

---

## Conclusion

Ce projet represente une solution complete de digitalisation du processus d'achat et de gestion de stock.

Il combine :

- Conception UML
- Architecture REST moderne
- Securite JWT
- Interface ergonomique
- Base de donnees robuste

Il demontre la coherence entre :

- Analyse
- Conception
- Implementation
- Resultats

