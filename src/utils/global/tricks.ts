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
