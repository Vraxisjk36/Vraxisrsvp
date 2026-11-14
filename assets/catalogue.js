(() => {
  const grid = document.getElementById('catalogue');
  const search = document.getElementById('templateSearch');
  const editionSelect = document.getElementById('editionFilter');
  let edition = new URLSearchParams(location.search).get('tier') || 'All';
  if(!['All','Signature','Prestige'].includes(edition))edition='All';
  editionSelect.value=edition;
  const chips = [...document.querySelectorAll('[data-filter]')];
  const cards = [...grid.children].filter(el => el.dataset.category);
  const metadata=new Map((window.VRAXIS_TEMPLATES||[]).map(t=>[t.id,t]));
  cards.forEach(card=>{card.dataset.tier=metadata.get(card.querySelector('[data-template]').dataset.template)?.tier||'Signature';});
  const categories = new Set(cards.map(card => card.dataset.category));
  let category = new URLSearchParams(location.search).get('category') || 'All';
  if (!categories.has(category)) category = 'All';
  function apply() {
    const term = search.value.trim().toLocaleLowerCase();
    let count = 0;
    const matches=card=>(edition==='All'||card.dataset.tier===edition)&&(!term||card.textContent.toLocaleLowerCase().includes(term));
    cards.forEach(card => {
      const visible = (category === 'All' || card.dataset.category === category) && matches(card);
      card.hidden = !visible;
      if (visible) count++;
    });
    for (const chip of chips) {
      const selected = chip.dataset.filter === category;
      chip.classList.toggle('active', selected);
      chip.setAttribute('aria-pressed', String(selected));
      const total = cards.filter(card=>(chip.dataset.filter==='All'||card.dataset.category===chip.dataset.filter)&&matches(card)).length;
      chip.querySelector('.filter-count').textContent = total;
    }
    document.getElementById('templateCount').textContent = count + (count === 1 ? ' design' : ' designs');
    document.getElementById('collectionEmpty').hidden = count !== 0;
  }
  chips.forEach(chip => chip.addEventListener('click', () => {
    category = chip.dataset.filter;
    const url = new URL(location.href);
    if (category === 'All') url.searchParams.delete('category'); else url.searchParams.set('category', category);
    history.replaceState(null, '', url);
    apply();
  }));
  editionSelect.addEventListener('change',()=>{edition=editionSelect.value;const url=new URL(location.href);if(edition==='All')url.searchParams.delete('tier');else url.searchParams.set('tier',edition);history.replaceState(null,'',url);apply();});
  search.addEventListener('input', apply);
  apply();
})();
