# 🚌 Application de Réservation de Bus - Rentrée UGB (AERK)

Application web fullstack de réservation de places de bus pour le transport des étudiants pour la rentrée universitaire à l'Université Gaston Berger (UGB).

---

## 🚀 Fonctionnalités Principales

- **Réservation sans inscription** : L'étudiant renseigne ses informations (Nom, Prénom, Téléphone, Adresse).
- **Attribution Automatique** : Remplissage automatique des bus par tranche de **56 places** avec attribution du numéro de bus et de siège.
- **Paiement Intégré** : Intégration du paiement mobile via **Wave Business**.
- **Espace Administration** : 
  - Visualisation des bus et de leur taux d'occupation.
  - Liste détaillée des passagers par bus.
  - Exportation/Impression des listes de bus pour le jour du départ.

---

## 🛠️ Tech Stack

- **Frontend** : Angular, TypeScript, Tailwind CSS / Bootstrap
- **Backend** : Java, Spring Boot (Spring Data JPA, REST API)
- **Base de données** : PostgreSQL
- **Paiement** : API Wave Business

---

## ⚙️ Configuration & Lancement en Local

### Backend (Spring Boot)
1. Configurer la base de données PostgreSQL dans `application.properties`.
2. Définir les variables d'environnement nécessaires :
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `WAVE_API_KEY`
3. Lancer le backend :
   ```bash
   ./mvnw spring-boot:run
