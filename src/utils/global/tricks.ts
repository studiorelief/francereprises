/* replace p by svg code for Component icons */
export function svgComponent() {
  document.querySelectorAll('[svg="component"]').forEach((element) => {
    const svgCode = element.textContent;
    if (svgCode !== null) {
      element.innerHTML = svgCode;
    }
  });
}

export function fadeInMenu() {
  const menuWrapper = document.querySelector('.p-structure_menu-sticky') as HTMLElement;
  if (menuWrapper) {
    menuWrapper.style.opacity = '0';
    menuWrapper.style.transition = 'opacity 0.2s ease-out';
    menuWrapper.style.opacity = '1';
  }
}

export function handleNavBackground() {
  const menuButton = document.querySelector('.navbar_menu-button') as HTMLElement;
  const mobileBackground = document.querySelector('.navbar_mobile-background') as HTMLElement;

  if (menuButton && mobileBackground) {
    const observer = new MutationObserver(() => {
      if (menuButton.classList.contains('w--open')) {
        mobileBackground.style.display = 'flex';
        mobileBackground.style.opacity = '0.5';
      } else {
        mobileBackground.style.opacity = '0';
        setTimeout(() => {
          mobileBackground.style.display = 'none';
        }, 200);
      }
    });

    observer.observe(menuButton, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }
}
