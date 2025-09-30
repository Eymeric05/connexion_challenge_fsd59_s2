// Scripts pour l'app de connexion
// J'ai ajouté quelques fonctions utiles pour améliorer l'UX

// Fonction pour vérifier si l'utilisateur est toujours connecté
async function checkStatus() {
    try {
        console.log('Vérification du statut...');
        const response = await fetch('/api/status');
        const data = await response.json();
        
        console.log('Réponse du serveur:', data);
        
        if (data.connected) {
            const usernameElement = document.getElementById('username');
            const userInfoElement = document.getElementById('userInfo');
            const tokenExpiryElement = document.getElementById('tokenExpiry');
            
            if (usernameElement) {
                usernameElement.textContent = data.user;
            }
            if (userInfoElement) {
                userInfoElement.style.display = 'block';
            }
            
            // Calcul approximatif de l'expiration du token (1h)
            const now = new Date();
            const expiry = new Date(now.getTime() + 60 * 60 * 1000);
            if (tokenExpiryElement) {
                tokenExpiryElement.textContent = expiry.toLocaleString('fr-FR');
            }
            
            showNotification('Statut vérifié avec succès !', 'success');
        } else {
            const usernameElement = document.getElementById('username');
            if (usernameElement) {
                usernameElement.textContent = 'Non connecté';
            }
            showNotification('Vous n\'êtes pas connecté.', 'warning');
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        showNotification('Erreur lors de la vérification du statut.', 'danger');
    }
}

// Fonction pour rafraîchir le token (bonus)
async function refreshToken() {
    try {
        console.log('Actualisation du token...');
        const response = await fetch('/api/status');
        const data = await response.json();
        
        if (data.connected) {
            showNotification('Token actualisé avec succès !', 'success');
            checkStatus();
        } else {
            showNotification('Vous n\'êtes pas connecté.', 'warning');
        }
    } catch (error) {
        console.error('Erreur lors de l\'actualisation du token:', error);
        showNotification('Erreur lors de l\'actualisation du token.', 'danger');
    }
}

// Fonction pour afficher des notifications toast (j'ai ajouté ça pour améliorer l'UX)
function showNotification(message, type = 'info') {
    // Créer une alerte Bootstrap
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-suppression après 3 secondes
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 3000);
}

// Validation basique du formulaire (évite les soumissions vides)
function validateLoginForm() {
    const login = document.getElementById('login');
    const password = document.getElementById('password');
    
    if (!login.value.trim()) {
        alert('Veuillez saisir votre login.');
        login.focus();
        return false;
    }
    
    if (!password.value.trim()) {
        alert('Veuillez saisir votre mot de passe.');
        password.focus();
        return false;
    }
    
    return true;
}

// Event listeners au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form[action="/login"]');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            if (!validateLoginForm()) {
                e.preventDefault();
            }
        });
    }
});

// Fonction pour afficher un spinner pendant la connexion (petit détail UX)
function showLoading() {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Connexion...';
        submitBtn.disabled = true;
    }
}

// Ajouter l'effet de chargement au formulaire
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form[action="/login"]');
    if (loginForm) {
        loginForm.addEventListener('submit', showLoading);
    }
});
