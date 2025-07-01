/* replace p by svg code for Component icons */
export function svgComponent() {
  document.querySelectorAll('[svg="component"]').forEach((element) => {
    const svgCode = element.textContent;
    if (svgCode !== null) {
      element.innerHTML = svgCode;
    }
  });
}

/* handle target="_blank" links to open in new tab */
export function componentNewTabs() {
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href) {
        window.open(href, '_blank');
      }
    });
  });
}

/* apply text-color-brand class to text between asterisks in elements with text="brand-style" */
export function textBrand() {
  document.querySelectorAll('[text="brand-style"]').forEach((element) => {
    const content = element.innerHTML;
    // Replace text between asterisks with span having text-color-brand class
    const updatedContent = content.replace(
      /\*([^*]+)\*/g,
      '<span class="text-color-brand">$1</span>'
    );
    element.innerHTML = updatedContent;
  });
}
