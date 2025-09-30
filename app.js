const express = require('express');
const crypto = require('crypto-js');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration basique du serveur

// Configuration des sessions - j'ai mis un secret basique pour le dev
app.use(session({
  secret: 'mon-secret-de-dev-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // TODO: passer à true en prod avec HTTPS
}));

// Middleware pour parser les données du formulaire
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir les fichiers statiques (CSS, JS, images)
app.use(express.static('public'));

// Utilisateur unique pour ce projet
const user = {
  login: "Alan",
  password: "73a056240baf641c8dc2c9bab20e0c2b457bd6e4" // hash SHA1 de "4l4n"
};

// Secret pour signer les JWT - à changer en production
const JWT_SECRET = 'mon-secret-jwt-dev-2024';

// Middleware pour vérifier si l'utilisateur est connecté
const verifyToken = (req, res, next) => {
  const token = req.session.token;
  
  if (!token) {
    return res.status(401).send(`
      <div class="container mt-5">
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">Accès refusé !</h4>
          <p>Vous devez être connecté pour accéder à cette page.</p>
          <hr>
          <a href="/" class="btn btn-primary">Retour à la connexion</a>
        </div>
      </div>
    `);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Token expiré ou invalide, on détruit la session
    req.session.destroy();
    return res.status(401).send(`
      <div class="container mt-5">
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">Session expirée !</h4>
          <p>Votre session a expiré. Veuillez vous reconnecter.</p>
          <hr>
          <a href="/" class="btn btn-primary">Retour à la connexion</a>
        </div>
      </div>
    `);
  }
};

// Page d'accueil - formulaire de connexion
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Traitement de la connexion
app.post('/login', (req, res) => {
  const { login, password } = req.body;
  
  console.log('Tentative de connexion:');
  console.log('Login saisi:', login);
  console.log('Password saisi:', password);
  
  // On hash le mot de passe saisi pour le comparer avec celui stocké
  const hashedPassword = crypto.SHA1(password).toString();
  console.log('Hash généré:', hashedPassword);
  console.log('Hash attendu:', user.password);
  
  // Vérification des identifiants
  if (login === user.login && hashedPassword === user.password) {
    // Création du token JWT pour la session
    const token = jwt.sign(
      { login: user.login, id: 1 },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // On stocke le token dans la session
    req.session.token = token;
    
    res.redirect('/secure');
  } else {
    res.send(`
      <div class="container mt-5">
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">Erreur de connexion !</h4>
          <p>Login ou mot de passe incorrect.</p>
          <hr>
          <a href="/" class="btn btn-primary">Réessayer</a>
        </div>
      </div>
    `);
  }
});

// Page sécurisée - accessible seulement si connecté
app.get('/secure', verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'secure.html'));
});

// Déconnexion - on détruit la session
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
    res.redirect('/');
  });
});

// API pour vérifier si l'utilisateur est connecté (utilisé par le JS côté client)
app.get('/api/status', (req, res) => {
  if (req.session.token) {
    try {
      const decoded = jwt.verify(req.session.token, JWT_SECRET);
      res.json({ connected: true, user: decoded.login });
    } catch (err) {
      res.json({ connected: false });
    }
  } else {
    res.json({ connected: false });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log('📝 Identifiants de test: Alan / 4l4n');
});
