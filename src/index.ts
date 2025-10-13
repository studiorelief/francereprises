import './index.css';

import { eventFilters } from '$utils/animations/eventFilters';
import { navbarAnimation } from '$utils/animations/navbarAnimation';
import { popupPremium } from '$utils/animations/popupPremium';
import { loadScript } from '$utils/global/loadScript';
import { initMarker } from '$utils/global/marker';
import { popupNewsletter } from '$utils/global/popupNewsletter';
import { componentNewTabs, svgComponent, textBrand } from '$utils/global/tricks';
import { showPassword } from '$utils/memberstack/password/showPassword';

window.Webflow ||= [];
window.Webflow.push(() => {
  // recettage
  if (window.location.href.includes('.webflow.io')) {
    initMarker();
  }

  // Global
  navbarAnimation();
  popupNewsletter();

  // Événements Filters
  setTimeout(() => {
    eventFilters();
  }, 500);

  // Tricks
  svgComponent();
  componentNewTabs();
  textBrand();

  // Attributes V2
  loadScript({
    src: 'https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js',
    type: 'module',
    fsAttribute: 'fs-list',
  });

  loadScript({
    src: 'https://cdn.jsdelivr.net/npm/@finsweet/attributes-accordion@1/accordion.js',
    type: 'module',
  });

  loadScript({
    src: 'https://cdn.jsdelivr.net/npm/@finsweet/attributes-inputactive@1/inputactive.js',
    type: 'module',
  });

  // Memberstack
  showPassword();

  // Dashboard
  popupPremium();
});
