/* Gestion du popup newsletter avec animations */
export function popupNewsletter() {
  // Sélectionner les éléments nécessaires
  const popupComponent = document.querySelector('.popup-newsletter_component') as HTMLElement;
  const popupBackground = document.querySelector('.popup-newsletter_background') as HTMLElement;
  const popupCards = document.querySelector('.popup-newsletter_cards') as HTMLElement;
  const closeButton = document.querySelector('.popup-newsletter_close') as HTMLElement;
  const triggers = document.querySelectorAll('[trigger="popup-inscription"]');

  if (!popupComponent || !popupBackground || !popupCards) {
    // console.warn('Éléments popup newsletter non trouvés');
    return;
  }

  // Clé pour le localStorage
  const STORAGE_KEY = 'popup-newsletter-last-shown';
  const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

  // Vérifier si le popup peut être affiché automatiquement
  function canShowAutoPopup(): boolean {
    const lastShown = localStorage.getItem(STORAGE_KEY);
    if (!lastShown) {
      return true; // Jamais affiché
    }
    const lastShownTime = parseInt(lastShown, 10);
    const now = Date.now();
    return now - lastShownTime >= ONE_DAY_MS; // Plus de 24h
  }

  // Sauvegarder la date d'affichage
  function saveAutoPopupShown() {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }

  // Fonction pour ouvrir le popup
  function openPopup() {
    // Bloquer le scroll du body
    document.body.style.overflow = 'hidden';

    // Réinitialiser les styles
    popupComponent.style.display = 'flex';
    popupBackground.style.opacity = '0';
    popupCards.style.opacity = '0';
    popupCards.style.transform = 'translateY(8rem)';

    // Forcer un reflow pour que le navigateur prenne en compte le display:flex
    void popupComponent.offsetHeight;

    // Ajouter les transitions
    popupBackground.style.transition = 'opacity 0.6s ease-out';
    popupCards.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';

    // Déclencher les animations
    requestAnimationFrame(() => {
      popupBackground.style.opacity = '0.5';
      popupCards.style.opacity = '1';
      popupCards.style.transform = 'translateY(0rem)';
    });

    // Ajouter l'événement pour la touche Escape
    document.addEventListener('keydown', handleEscapeKey);
  }

  // Fonction pour fermer le popup
  function closePopup() {
    // Débloquer le scroll du body
    document.body.style.overflow = '';

    // Retirer l'événement de la touche Escape
    document.removeEventListener('keydown', handleEscapeKey);

    // Ajouter les transitions de fermeture
    popupBackground.style.transition = 'opacity 0.6s ease-out';
    popupCards.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';

    // Déclencher les animations de fermeture
    popupBackground.style.opacity = '0';
    popupCards.style.opacity = '0';
    popupCards.style.transform = 'translateY(8rem)';

    // Masquer complètement le popup après 0.6s
    setTimeout(() => {
      popupComponent.style.display = 'none';
    }, 600);
  }

  // Fonction pour gérer la touche Escape
  function handleEscapeKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      closePopup();
    }
  }

  // Ajouter les événements de clic sur les triggers d'ouverture
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openPopup();
    });
  });

  // Ajouter l'événement de clic sur le background pour fermer
  popupBackground.addEventListener('click', (e) => {
    e.preventDefault();
    closePopup();
  });

  // Ajouter l'événement de clic sur le bouton de fermeture
  if (closeButton) {
    closeButton.addEventListener('click', (e) => {
      e.preventDefault();
      closePopup();
    });
  }

  // Affichage automatique après 5 secondes (une fois par jour max)
  if (canShowAutoPopup()) {
    setTimeout(() => {
      openPopup();
      saveAutoPopupShown();
    }, 5000); // 5 secondes
  }
}
