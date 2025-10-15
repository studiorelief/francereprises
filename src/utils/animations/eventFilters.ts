/* Système de filtre pour la collection CMS Webflow Événements */

// Constantes pour les sélecteurs CSS
const SELECTORS = {
  COLLECTION_LIST: '.event_hub_collection-list',
  DATE_ELEMENT: '.event_hub_cards-date-referal',
  COLLECTION_ITEM: '.event_hub_collection-item',
  DATE_FIELD: '.event_hub_filters-date-field',
  TYPE_FIELD: '.event_hub_filters-type-field',
  EMPTY_MESSAGE: '.filter_empty.is-event',
  TRIGGER_DATE_WEEK: '#trigger-date-week',
  TRIGGER_DATE_MONTH: '#trigger-date-month',
  TRIGGER_DATE_ALL: '#trigger-date-tous',
  TRIGGER_TYPE_ALL: '#trigger-type-tous',
  TRIGGER_TYPE_WEBINAR: '#trigger-type-webinar',
  TRIGGER_TYPE_PHYSIQUE: '#trigger-type-physique',
  TRIGGER_TYPE_PAST: '#trigger-type-past',
  TRIGGER_TYPE_PREMIUM: '#trigger-type-premium',
  RESET_BUTTON: '#reset-all',
  FILTER_TYPE_WEBINAR: '#filter-type-webinar',
  FILTER_TYPE_PHYSIQUE: '#filter-type-physique',
  FILTER_TYPE_PREMIUM: '#filter-type-premium',
} as const;

// Constantes pour les limites
const MAX_LOAD_ATTEMPTS = 50; // Maximum 5 secondes d'attente (50 * 100ms)

/**
 * Système de filtre pour la collection CMS Webflow Événements
 * Gère les filtres de date (semaine, mois, tous) et de type (webinar, physique, passé, premium)
 */
export function eventFilters() {
  const collectionList = document.querySelector(SELECTORS.COLLECTION_LIST) as HTMLElement;

  // Filtres de date
  const triggerDateWeek = document.querySelector(SELECTORS.TRIGGER_DATE_WEEK) as HTMLElement;
  const triggerDateMonth = document.querySelector(SELECTORS.TRIGGER_DATE_MONTH) as HTMLElement;
  const triggerDateAll = document.querySelector(SELECTORS.TRIGGER_DATE_ALL) as HTMLElement;

  // Filtres de type
  const triggerTypeAll = document.querySelector(SELECTORS.TRIGGER_TYPE_ALL) as HTMLElement;
  const triggerTypeWebinar = document.querySelector(SELECTORS.TRIGGER_TYPE_WEBINAR) as HTMLElement;
  const triggerTypePhysique = document.querySelector(
    SELECTORS.TRIGGER_TYPE_PHYSIQUE
  ) as HTMLElement;
  const triggerTypePast = document.querySelector(SELECTORS.TRIGGER_TYPE_PAST) as HTMLElement;
  const triggerTypePremium = document.querySelector(SELECTORS.TRIGGER_TYPE_PREMIUM) as HTMLElement;

  // Bouton reset et message vide
  const resetAllButton = document.querySelector(SELECTORS.RESET_BUTTON) as HTMLElement;
  const emptyFilterMessage = document.querySelector(SELECTORS.EMPTY_MESSAGE) as HTMLElement;

  // Vérifier que les éléments existent
  if (
    !collectionList ||
    !triggerDateWeek ||
    !triggerDateMonth ||
    !triggerDateAll ||
    !triggerTypeAll ||
    !triggerTypeWebinar ||
    !triggerTypePhysique ||
    !triggerTypePast ||
    !triggerTypePremium
  ) {
    console.error('Éléments de filtre événements non trouvés');
    return;
  }

  // État des filtres actifs
  let activeDateFilter: 'all' | 'week' | 'month' = 'all';
  let activeTypeFilter: 'all' | 'webinar' | 'physique' | 'past' | 'premium' = 'all';

  /**
   * Récupère la date d'un item depuis l'élément DOM
   * @param item - L'élément HTML de l'item
   * @returns La date parsée ou null si non trouvée
   */
  function getDateFromItem(item: HTMLElement): Date | null {
    const dateElement = item.querySelector(SELECTORS.DATE_ELEMENT);
    if (!dateElement) {
      console.error("Élément de date non trouvé dans l'item");
      return null;
    }

    const dateString = dateElement.textContent?.trim() || '';
    if (!dateString) {
      console.error('Contenu de date vide');
      return null;
    }

    const parsedDate = parseDateString(dateString);
    if (!parsedDate) {
      console.error('Impossible de parser la date:', dateString);
      return null;
    }

    return parsedDate;
  }

  /**
   * Récupère le numéro de semaine ISO 8601 pour une date donnée
   * @param date - La date pour laquelle calculer le numéro de semaine
   * @returns Le numéro de semaine ISO 8601
   */
  function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Vérifie si une date est dans la semaine en cours
   * @param itemDate - La date à vérifier
   * @returns true si la date est dans la semaine courante, false sinon
   */
  function isInCurrentWeek(itemDate: Date): boolean {
    try {
      const currentDate = new Date();

      // Vérifier que la date est valide
      if (isNaN(itemDate.getTime())) {
        console.error('Date invalide:', itemDate);
        return false;
      }

      const itemWeek = getWeekNumber(itemDate);
      const currentWeek = getWeekNumber(currentDate);
      const itemYear = itemDate.getFullYear();
      const currentYear = currentDate.getFullYear();

      return itemWeek === currentWeek && itemYear === currentYear;
    } catch (error) {
      console.error('Erreur lors de la vérification de la semaine:', error);
      return false;
    }
  }

  /**
   * Vérifie si une date est dans le mois en cours
   * @param itemDate - La date à vérifier
   * @returns true si la date est dans le mois courant, false sinon
   */
  function isInCurrentMonth(itemDate: Date): boolean {
    try {
      const currentDate = new Date();

      // Vérifier que la date est valide
      if (isNaN(itemDate.getTime())) {
        console.error('Date invalide:', itemDate);
        return false;
      }

      const itemMonth = itemDate.getMonth();
      const currentMonth = currentDate.getMonth();
      const itemYear = itemDate.getFullYear();
      const currentYear = currentDate.getFullYear();

      return itemMonth === currentMonth && itemYear === currentYear;
    } catch (error) {
      console.error('Erreur lors de la vérification du mois:', error);
      return false;
    }
  }

  /**
   * Parse une date au format "december 11, 2025" vers un objet Date
   * @param dateString - La chaîne de date à parser
   * @returns L'objet Date parsé ou null si le parsing échoue
   */
  function parseDateString(dateString: string): Date | null {
    try {
      // Nettoyer la chaîne de caractères
      const cleanDateString = dateString.trim().toLowerCase();

      // Essayer de parser directement avec Date constructor
      const directParse = new Date(cleanDateString);
      if (!isNaN(directParse.getTime())) {
        return directParse;
      }

      // Si le parsing direct échoue, essayer de parser manuellement
      // Format attendu: "december 11, 2025" ou "december 11 2025"
      const months: { [key: string]: number } = {
        january: 0,
        february: 1,
        march: 2,
        april: 3,
        may: 4,
        june: 5,
        july: 6,
        august: 7,
        september: 8,
        october: 9,
        november: 10,
        december: 11,
        janvier: 0,
        février: 1,
        mars: 2,
        avril: 3,
        mai: 4,
        juin: 5,
        juillet: 6,
        août: 7,
        septembre: 8,
        octobre: 9,
        novembre: 10,
        décembre: 11,
      };

      // Regex pour capturer mois, jour et année
      const match = cleanDateString.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/);
      if (match) {
        const [, monthName, day, year] = match;
        const monthIndex = months[monthName];

        if (monthIndex !== undefined) {
          const dayNum = parseInt(day, 10);
          const yearNum = parseInt(year, 10);

          if (dayNum >= 1 && dayNum <= 31 && yearNum >= 1900) {
            return new Date(yearNum, monthIndex, dayNum);
          }
        }
      }

      console.error('Impossible de parser la date:', dateString);
      return null;
    } catch (error) {
      console.error('Erreur lors du parsing de la date:', error);
      return null;
    }
  }

  /**
   * Vérifie si un item passe le filtre de date actif
   * @param item - L'élément HTML de l'item à vérifier
   * @returns true si l'item passe le filtre de date, false sinon
   */
  function passesDateFilter(item: HTMLElement): boolean {
    if (activeDateFilter === 'all') {
      return true;
    }

    const parsedDate = getDateFromItem(item);
    if (!parsedDate) {
      return false;
    }

    if (activeDateFilter === 'week') {
      return isInCurrentWeek(parsedDate);
    }

    if (activeDateFilter === 'month') {
      return isInCurrentMonth(parsedDate);
    }

    return true;
  }

  /**
   * Vérifie si une date est dans le passé (inclut aujourd'hui)
   * @param itemDate - La date à vérifier
   * @returns true si la date est dans le passé ou aujourd'hui, false sinon
   */
  function isPastEvent(itemDate: Date): boolean {
    try {
      const currentDate = new Date();

      // Vérifier que la date est valide
      if (isNaN(itemDate.getTime())) {
        console.error('Date invalide pour vérification passé:', itemDate);
        return false;
      }

      // Comparer les dates (sans l'heure)
      const itemDateOnly = new Date(
        itemDate.getFullYear(),
        itemDate.getMonth(),
        itemDate.getDate()
      );
      const currentDateOnly = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );

      // Ajouter 1 jour à la date actuelle pour inclure les événements d'aujourd'hui
      const tomorrowDate = new Date(currentDateOnly);
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);

      return itemDateOnly < tomorrowDate;
    } catch (error) {
      console.error('Erreur lors de la vérification si événement passé:', error);
      return false;
    }
  }

  /**
   * Vérifie si un item passe le filtre de type actif
   * @param item - L'élément HTML de l'item à vérifier
   * @returns true si l'item passe le filtre de type, false sinon
   */
  function passesTypeFilter(item: HTMLElement): boolean {
    if (activeTypeFilter === 'all') {
      return true;
    }

    // Pour le filtre "past", on utilise la logique de date
    if (activeTypeFilter === 'past') {
      const parsedDate = getDateFromItem(item);
      if (!parsedDate) {
        return false;
      }

      const isPast = isPastEvent(parsedDate);
      console.error(`Événement passé: ${isPast} (date: ${parsedDate.toDateString()})`);
      return isPast;
    }

    // Pour les autres filtres, on utilise la logique DOM existante
    let typeElement: Element | null = null;

    if (activeTypeFilter === 'webinar') {
      typeElement = item.querySelector(SELECTORS.FILTER_TYPE_WEBINAR);
    } else if (activeTypeFilter === 'physique') {
      typeElement = item.querySelector(SELECTORS.FILTER_TYPE_PHYSIQUE);
    } else if (activeTypeFilter === 'premium') {
      typeElement = item.querySelector(SELECTORS.FILTER_TYPE_PREMIUM);
    }

    // Debug : log pour voir ce qui se passe
    console.error(`Filtre actif: ${activeTypeFilter}, Élément trouvé:`, typeElement);

    // L'item passe le filtre si l'élément de type correspondant existe ET n'est pas invisible
    const passes = typeElement !== null && !typeElement.classList.contains('w-condition-invisible');
    console.error(
      `Item passe le filtre de type: ${passes} (élément trouvé: ${typeElement !== null}, visible: ${typeElement ? !typeElement.classList.contains('w-condition-invisible') : 'N/A'})`
    );
    return passes;
  }

  /**
   * Applique tous les filtres actifs sur tous les items
   * Met à jour l'affichage des éléments selon les filtres sélectionnés
   */
  function applyAllFilters() {
    const items = collectionList.querySelectorAll(SELECTORS.COLLECTION_ITEM);
    let visibleItemsCount = 0;

    console.error(`Nombre d'items trouvés: ${items.length}`);
    console.error(`Filtres actifs - Date: ${activeDateFilter}, Type: ${activeTypeFilter}`);

    items.forEach((item, index) => {
      const htmlItem = item as HTMLElement;

      // Un item est visible s'il passe TOUS les filtres
      const passesDate = passesDateFilter(htmlItem);
      const passesType = passesTypeFilter(htmlItem);
      const passesAllFilters = passesDate && passesType;

      console.error(
        `Item ${index}: passeDate=${passesDate}, passeType=${passesType}, passeTous=${passesAllFilters}`
      );

      if (passesAllFilters) {
        visibleItemsCount += 1;
        showItem(htmlItem);
      } else {
        hideItem(htmlItem);
      }
    });

    // Gérer l'affichage du message "aucun résultat"
    if (emptyFilterMessage) {
      if (visibleItemsCount === 0) {
        emptyFilterMessage.style.display = 'flex';
      } else {
        emptyFilterMessage.style.display = 'none';
      }
    }
  }

  /**
   * Affiche un item avec animation
   * @param item - L'élément HTML à afficher
   */
  function showItem(item: HTMLElement) {
    item.style.display = '';
    item.style.opacity = '0';
    item.style.transform = 'translateY(1rem)';
    item.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';

    requestAnimationFrame(() => {
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    });
  }

  /**
   * Cache un item avec animation
   * @param item - L'élément HTML à cacher
   */
  function hideItem(item: HTMLElement) {
    item.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    item.style.opacity = '0';
    item.style.transform = 'translateY(-0.5rem)';

    setTimeout(() => {
      item.style.display = 'none';
    }, 300);
  }

  /**
   * Gère l'état actif des boutons de filtre de date
   * @param activeButton - Le bouton de filtre de date à activer
   */
  function setActiveDateButton(activeButton: HTMLElement) {
    [triggerDateWeek, triggerDateMonth, triggerDateAll].forEach((btn) => {
      const parentField = btn.closest(SELECTORS.DATE_FIELD) as HTMLElement;
      if (parentField) {
        if (btn === activeButton) {
          parentField.classList.add('is-active-inputactive');
        } else {
          parentField.classList.remove('is-active-inputactive');
        }
      }
    });
  }

  /**
   * Gère l'état actif des boutons de filtre de type
   * @param activeButton - Le bouton de filtre de type à activer
   */
  function setActiveTypeButton(activeButton: HTMLElement) {
    [
      triggerTypeAll,
      triggerTypeWebinar,
      triggerTypePhysique,
      triggerTypePast,
      triggerTypePremium,
    ].forEach((btn) => {
      const parentField = btn.closest(SELECTORS.TYPE_FIELD) as HTMLElement;
      if (parentField) {
        if (btn === activeButton) {
          parentField.classList.add('is-active-inputactive');
        } else {
          parentField.classList.remove('is-active-inputactive');
        }
      }
    });
  }

  /**
   * Réinitialise tous les filtres (date et type)
   * Remet tous les filtres à leur état initial et affiche tous les éléments
   */
  function resetAllFilters() {
    // Réinitialiser les états
    activeDateFilter = 'all';
    activeTypeFilter = 'all';

    // Réactiver les boutons "tous"
    setActiveDateButton(triggerDateAll);
    setActiveTypeButton(triggerTypeAll);

    // Réappliquer les filtres (qui afficheront tout)
    applyAllFilters();
  }

  // ===== ÉVÉNEMENTS FILTRES DE DATE =====

  triggerDateWeek.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveDateButton(triggerDateWeek);
    activeDateFilter = 'week';
    applyAllFilters();
  });

  triggerDateMonth.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveDateButton(triggerDateMonth);
    activeDateFilter = 'month';
    applyAllFilters();
  });

  triggerDateAll.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveDateButton(triggerDateAll);
    activeDateFilter = 'all';
    applyAllFilters();
  });

  // ===== ÉVÉNEMENTS FILTRES DE TYPE =====

  triggerTypeAll.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveTypeButton(triggerTypeAll);
    activeTypeFilter = 'all';
    applyAllFilters();
  });

  triggerTypeWebinar.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveTypeButton(triggerTypeWebinar);
    activeTypeFilter = 'webinar';
    applyAllFilters();
  });

  triggerTypePhysique.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveTypeButton(triggerTypePhysique);
    activeTypeFilter = 'physique';
    applyAllFilters();
  });

  triggerTypePast.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveTypeButton(triggerTypePast);
    activeTypeFilter = 'past';

    // Pour "Event passé", on force le filtre de date sur "Tous" pour afficher tous les événements passés
    setActiveDateButton(triggerDateAll);
    activeDateFilter = 'all';

    applyAllFilters();
  });

  triggerTypePremium.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveTypeButton(triggerTypePremium);
    activeTypeFilter = 'premium';
    applyAllFilters();
  });

  // ===== ÉVÉNEMENT BOUTON RESET =====

  if (resetAllButton) {
    resetAllButton.addEventListener('click', (e) => {
      e.preventDefault();
      resetAllFilters();
    });
  }

  // Attendre que la collection soit chargée avant d'initialiser les filtres
  function waitForCollectionToLoad(attempts = 0) {
    const items = collectionList.querySelectorAll(SELECTORS.COLLECTION_ITEM);

    if (items.length > 0) {
      // La collection est chargée, on peut initialiser les filtres
      console.error('Collection chargée, initialisation des filtres');
      applyAllFilters();
    } else if (attempts < MAX_LOAD_ATTEMPTS) {
      // La collection n'est pas encore chargée, on attend
      console.error(
        `Attente du chargement de la collection... (tentative ${attempts + 1}/${MAX_LOAD_ATTEMPTS})`
      );
      setTimeout(() => waitForCollectionToLoad(attempts + 1), 100);
    } else {
      // Limite de tentatives atteinte
      console.error('Limite de tentatives atteinte pour le chargement de la collection');
    }
  }

  // Observer pour détecter les changements dans la collection
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;

    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (
              element.classList.contains('event_hub_collection-item') ||
              element.querySelector(SELECTORS.COLLECTION_ITEM)
            ) {
              shouldUpdate = true;
            }
          }
        });
      }
    });

    if (shouldUpdate) {
      console.error('Nouveaux items détectés, mise à jour des filtres');
      applyAllFilters();
    }
  });

  // Observer la collection pour détecter les changements
  observer.observe(collectionList, {
    childList: true,
    subtree: true,
  });

  // Initialisation
  waitForCollectionToLoad();
}
