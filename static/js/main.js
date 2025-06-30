// Main JavaScript file for CLOKKA 

const menuBtn = document.getElementById('menu-btn');
const menuDropdown = document.getElementById('menu-dropdown');

if (menuBtn && menuDropdown) {
  menuBtn.addEventListener('click', () => {
    menuDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
      menuDropdown.classList.add('hidden');
    }
  });
} 