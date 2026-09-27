# Admin et paiement Wave

## Premier compte administrateur

Au premier démarrage seulement, si la table PostgreSQL `admin_users` est vide, l'application crée
le compte fourni par `ADMIN_USERNAME` et `ADMIN_PASSWORD`. Le mot de passe est stocké sous forme
de hash BCrypt, jamais en clair. La table est créée automatiquement par JPA (`ddl-auto=update`).
Lors des démarrages suivants, l'authentification lit le compte depuis PostgreSQL; les variables
de bootstrap n'ont alors plus besoin d'être définies.

Pour le premier démarrage local, ouvrir PowerShell, définir les identifiants ainsi que la clé Wave,
puis lancer le backend dans **la même fenêtre** :

```powershell
cd C:\Users\dell\Documents\AERK\app_caravance\back-end
$env:ADMIN_USERNAME = "aerk-admin"
$securePassword = Read-Host "Mot de passe admin" -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $securePassword).Password
$secureWaveKey = Read-Host "Clé API Wave Business" -AsSecureString
$env:WAVE_API_KEY = [System.Net.NetworkCredential]::new("", $secureWaveKey).Password
.\mvnw.cmd spring-boot:run
```

Ne pas envoyer ces valeurs dans un chat, ne pas les mettre dans Angular, et ne pas les committer.
Les variables définies dans PowerShell ne sont transmises qu'aux processus lancés depuis cette
fenêtre. Pour déployer, définir `ADMIN_USERNAME` et `ADMIN_PASSWORD` comme secrets d'environnement
du service backend au premier démarrage avec la base persistante. Conserver PostgreSQL et ses
données lors des redéploiements; sinon le compte devra être bootstrapé à nouveau.

L'écran d'administration se trouve à `http://localhost:4200/#admin`. L'authentification est
contrôlée par Spring Security avec HTTP Basic; laisser le backend actif pendant la connexion.

## Activer la clé Wave

Dans le portail Wave Business, créer une clé dans Developer Portal avec l'autorisation Checkout
requise par l'API. La clé API complète n'est affichée qu'à sa création. La définir dans
`WAVE_API_KEY` comme ci-dessus. Le secret reste ainsi côté Spring Boot; Angular ne reçoit que
l'URL de Checkout et un jeton de paiement aléatoire.

L'application crée une Checkout Session de **6 500 XOF** puis redirige le passager vers Wave.
Au retour, le backend vérifie lui-même le statut, le montant, la devise et la référence auprès de
Wave avant de créer la réservation et son billet. L'URL de succès/erreur locale par défaut est
`http://localhost:4200/?payment=success&token={token}`. Pour un déploiement, définir aussi :

```powershell
$env:WAVE_SUCCESS_URL = "https://<site-public>/?payment=success&token={token}"
$env:WAVE_ERROR_URL = "https://<site-public>/?payment=error&token={token}"
```

Le site de retour doit être publiquement accessible depuis le téléphone du passager. Les URL
locales ne conviennent qu'aux tests sur la même machine. La clé Wave n'est jamais nécessaire dans
le navigateur.

Orange Money est affiché comme « Bientôt disponible » et aucun paiement OM n'est accepté.

## Si l'admin refuse encore les identifiants

1. Vérifier que la console indique que l'authentification admin utilise la table PostgreSQL, ou que le premier compte a été créé. Si elle dit « No admin account exists », aucun identifiant n'a été initialisé.
2. Vérifier que PostgreSQL est disponible et que la table `admin_users` contient le compte.
3. Si cette table est vide, définir `ADMIN_USERNAME` et `ADMIN_PASSWORD` avant de redémarrer Spring Boot.
4. Ouvrir `http://localhost:8080/api/admin/auth-check` et vérifier que le navigateur demande
   l'identifiant/mot de passe; le front Angular envoie lui-même l'en-tête Basic après connexion.
5. Si le port 8080 est déjà occupé, arrêter l'autre instance Spring Boot avant d'en démarrer une nouvelle.
