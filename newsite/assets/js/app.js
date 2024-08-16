document.addEventListener('DOMContentLoaded', () => {
  // Functions to open and close a modal
  function openModal($el) {
    $el.classList.add('is-active');
  }

  function closeModal($el) {
    $el.classList.remove('is-active');
  }

  function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll('.button[data-target]') || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener('click', () => {
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (document.querySelectorAll('.modal-background, .modal .delete, .modal .modal-close') || []).forEach(($close) => {
    const $target = $close.closest('.modal');

    $close.addEventListener('click', () => {
      closeModal($target);
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
      closeAllModals();
    }
  });
});
    
// Hide navbar logo on workshops
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('header-logo');
  const hero = document.getElementById('hero');
  if(hero == null) return;
  let lastScrollTop = 0;
  navbar.style.opacity = 0;

  window.addEventListener('scroll', () => {
      let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      let heroHeight = hero.offsetHeight;

      if (scrollTop > heroHeight) {
          // User has scrolled past the hero
          let opacity = Math.min((scrollTop - heroHeight) / 50, 1);
          navbar.style.opacity = opacity;
          hero.style.opacity = 1 - opacity;
      } else {
          // User is still within the hero section
          navbar.style.opacity = 0;
          hero.style.opacity = 1;
      }

      lastScrollTop = scrollTop;
  });
});