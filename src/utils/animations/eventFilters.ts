/* Système de filtre pour la collection CMS Webflow Événements */
export function eventFilters() {
  const collectionList = document.querySelector('.event_hub_collection-list') as HTMLElement;

  // Filtres de date
  const triggerDateWeek = document.querySelector('#trigger-date-week') as HTMLElement;
  const triggerDateMonth = document.querySelector('#trigger-date-month') as HTMLElement;
  const triggerDateAll = document.querySelector('#trigger-date-tous') as HTMLElement;

  // Filtres de type
  const triggerTypeAll = document.querySelector('#trigger-type-tous') as HTMLElement;
  const triggerTypeWebinar = document.querySelector('#trigger-type-webinar') as HTMLElement;
  const triggerTypePhysique = document.querySelector('#trigger-type-physique') as HTMLElement;
  const triggerTypePast = document.querySelector('#trigger-type-past') as HTMLElement;
  const triggerTypePremium = document.querySelector('#trigger-type-premium') as HTMLElement;

  // Bouton reset et message vide
  const resetAllButton = document.querySelector('#reset-all') as HTMLElement;
  const emptyFilterMessage = document.querySelector('.filter_empty.is-event') as HTMLElement;

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
   * Récupère le numéro de semaine ISO 8601 pour une date donnée
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
   */
  function isInCurrentWeek(dateString: string): boolean {
    try {
      const itemDate = new Date(dateString);
      const currentDate = new Date();

      // Vérifier que la date est valide
      if (isNaN(itemDate.getTime())) {
        console.error('Date invalide:', dateString);
        return false;
      }

      const itemWeek = getWeekNumber(itemDate);
      const currentWeek = getWeekNumber(currentDate);
      const itemYear = itemDate.getFullYear();
      const currentYear = currentDate.getFullYear();

      return itemWeek === currentWeek && itemYear === currentYear;
    } catch (error) {
      console.error('Erreur lors du parsing de la date:', error);
      return false;
    }
  }

  /**
   * Vérifie si une date est dans le mois en cours
   */
  function isInCurrentMonth(dateString: string): boolean {
    try {
      const itemDate = new Date(dateString);
      const currentDate = new Date();

      // Vérifier que la date est valide
      if (isNaN(itemDate.getTime())) {
        console.error('Date invalide:', dateString);
        return false;
      }

      const itemMonth = itemDate.getMonth();
      const currentMonth = currentDate.getMonth();
      const itemYear = itemDate.getFullYear();
      const currentYear = currentDate.getFullYear();

      return itemMonth === currentMonth && itemYear === currentYear;
    } catch (error) {
      console.error('Erreur lors du parsing de la date:', error);
      return false;
    }
  }

  /**
   * Vérifie si un item passe le filtre de date actif
   */
  function passesDateFilter(item: HTMLElement): boolean {
    if (activeDateFilter === 'all') {
      return true;
    }

    const dateElement = item.querySelector('#filter-date');
    if (!dateElement) {
      console.error("Élément de date non trouvé dans l'item");
      return false;
    }

    const dateString =
      dateElement.getAttribute('data-date') ||
      dateElement.getAttribute('datetime') ||
      dateElement.textContent?.trim() ||
      '';

    if (activeDateFilter === 'week') {
      return isInCurrentWeek(dateString);
    }

    if (activeDateFilter === 'month') {
      return isInCurrentMonth(dateString);
    }

    return true;
  }

  /**
   * Vérifie si un item passe le filtre de type actif
   */
  function passesTypeFilter(item: HTMLElement): boolean {
    if (activeTypeFilter === 'all') {
      return true;
    }

    let typeElement: Element | null = null;

    if (activeTypeFilter === 'webinar') {
      typeElement = item.querySelector('#filter-type-webinar');
    } else if (activeTypeFilter === 'physique') {
      typeElement = item.querySelector('#filter-type-physique');
    } else if (activeTypeFilter === 'past') {
      typeElement = item.querySelector('#filter-type-past');
    } else if (activeTypeFilter === 'premium') {
      typeElement = item.querySelector('#filter-type-premium');
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
   */
  function applyAllFilters() {
    const items = collectionList.querySelectorAll('.event_hub_collection-item');
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
        showItem(htmlItem);
        visibleItemsCount++;
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
   */
  function setActiveDateButton(activeButton: HTMLElement) {
    [triggerDateWeek, triggerDateMonth, triggerDateAll].forEach((btn) => {
      const parentField = btn.closest('.event_hub_filters-date-field') as HTMLElement;
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
   */
  function setActiveTypeButton(activeButton: HTMLElement) {
    [
      triggerTypeAll,
      triggerTypeWebinar,
      triggerTypePhysique,
      triggerTypePast,
      triggerTypePremium,
    ].forEach((btn) => {
      const parentField = btn.closest('.event_hub_filters-type-field') as HTMLElement;
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
  function waitForCollectionToLoad() {
    const items = collectionList.querySelectorAll('.event_hub_collection-item');

    if (items.length > 0) {
      // La collection est chargée, on peut initialiser les filtres
      console.error('Collection chargée, initialisation des filtres');
      applyAllFilters();
    } else {
      // La collection n'est pas encore chargée, on attend
      console.error('Attente du chargement de la collection...');
      setTimeout(waitForCollectionToLoad, 100);
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
              element.querySelector('.event_hub_collection-item')
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
