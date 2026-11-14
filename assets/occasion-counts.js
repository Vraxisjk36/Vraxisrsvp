(() => {
  const templates = window.VRAXIS_TEMPLATES || [];
  document.querySelectorAll('a[href*="catalogue.html"]').forEach(link => {
    const counter = link.querySelector('.count');
    if (!counter) return;
    const category = new URL(link.href).searchParams.get('category');
    const count = category ? templates.filter(t => t.category === category).length : templates.length;
    counter.textContent = count + (count === 1 ? ' design' : ' designs');
  });
})();
