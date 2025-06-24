export interface LoadScriptOptions {
  src: string;
  type?: 'module' | 'text/javascript';
  async?: boolean;
  fsAttribute?: string; // Pour fs-list, fs-cmsfilter, etc.
  [key: string]: string | boolean | undefined; // Pour d'autres attributs personnalisés
}

export function loadScript(options: LoadScriptOptions | string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');

    // Si c'est juste une string, on utilise l'ancien comportement
    if (typeof options === 'string') {
      script.src = options;
      script.async = true;
    } else {
      // Configuration complète
      script.src = options.src;
      script.async = options.async ?? true;

      if (options.type) {
        script.type = options.type;
      }

      // Ajouter l'attribut Finsweet (fs-list, fs-cmsfilter, etc.)
      if (options.fsAttribute) {
        script.setAttribute(options.fsAttribute, '');
      }

      // Ajouter d'autres attributs personnalisés
      Object.keys(options).forEach((key) => {
        if (!['src', 'type', 'async', 'fsAttribute'].includes(key)) {
          script.setAttribute(key, String(options[key]));
        }
      });
    }

    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error(`Failed to load script: ${typeof options === 'string' ? options : options.src}`)
      );

    document.head.appendChild(script);
  });
}
