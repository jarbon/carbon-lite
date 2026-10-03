// Menu page: category filtering + text search over all items.
(async function () {
  const grid = document.getElementById('menu-grid');
  const searchInput = document.getElementById('menu-search');
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
  const noResults = document.getElementById('no-results');

  let items = [];
  let activeCategory = 'all';
  let query = '';

  function applyFilters() {
    const q = query.trim().toLowerCase();
    const visible = items.filter((item) => {
      const inCategory = activeCategory === 'all' || item.category === activeCategory;
      const matches =
        q === '' ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return inCategory && matches;
    });

    grid.innerHTML = '';
    visible.forEach((item) => grid.appendChild(window.Brewtown.renderCard(item)));
    noResults.classList.toggle('hidden', visible.length > 0);
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      applyFilters();
    });
  });

  searchInput.addEventListener('input', () => {
    query = searchInput.value;
    applyFilters();
  });

  try {
    items = await window.Brewtown.loadMenu();
    applyFilters();
  } catch (err) {
    grid.innerHTML = '';
    const msg = document.createElement('p');
    msg.className = 'error';
    msg.textContent = 'Could not load the menu. Is the site being served over HTTP?';
    grid.appendChild(msg);
    console.error(err);
  }
})();
