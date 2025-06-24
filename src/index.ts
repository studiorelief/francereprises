import './index.css';

import { loadScript } from '$utils/global/loadScript';
import { initMarker } from '$utils/global/marker';
import { svgComponent } from '$utils/global/tricks';
import { showPassword } from '$utils/memberstack/password/showPassword';

window.Webflow ||= [];
window.Webflow.push(() => {
  // recettage
  if (window.location.href.includes('.webflow.io')) {
    initMarker();
  }

  // Tricks
  svgComponent();

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

  showPassword();
});
