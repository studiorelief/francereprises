export function navbarAnimation() {
  const navbar = document.querySelector('.navbar-opti_container') as HTMLElement;

  if (!navbar) {
    return;
  }

  function handleScroll() {
    if (window.scrollY > window.innerHeight * 0.1) {
      navbar.style.background = 'var(--_brand---background--secondary)';
    } else {
      navbar.style.background = '';
    }
  }

  // Initial check
  handleScroll();

  // Add scroll listener
  window.addEventListener('scroll', handleScroll);
}
