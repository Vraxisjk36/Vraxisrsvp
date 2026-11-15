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
  let saved=new Set();try{saved=new Set(JSON.parse(localStorage.getItem('vraxis_shortlist')||'[]'));}catch{}
  let savedOnly=false;
  const savedFilter=document.getElementById('savedFilter'),savedCount=document.getElementById('savedCount');
  function updateSaved(){savedCount.textContent=saved.size;cards.forEach(card=>{const id=card.querySelector('[data-template]').dataset.template,button=card.querySelector('.saved-design'),active=saved.has(id);button.setAttribute('aria-pressed',String(active));button.textContent=active?'♥':'♡';button.setAttribute('aria-label',(active?'Remove ':'Save ')+metadata.get(id).name+(active?' from':' to')+' your shortlist');});}
  cards.forEach(card=>{const article=card.querySelector('article'),button=document.createElement('button');button.type='button';button.className='saved-design';article.style.position='relative';button.onclick=()=>{const id=article.dataset.template;if(saved.has(id))saved.delete(id);else saved.add(id);try{localStorage.setItem('vraxis_shortlist',JSON.stringify([...saved]));}catch{}updateSaved();apply();};article.append(button);});
  updateSaved();savedFilter.onclick=()=>{savedOnly=!savedOnly;savedFilter.setAttribute('aria-pressed',String(savedOnly));apply();};
  document.getElementById('collectionSort').onchange=event=>{const value=event.target.value;[...cards].sort((a,b)=>{const x=a.querySelector('[data-template]').dataset.template,y=b.querySelector('[data-template]').dataset.template;return value==='az'?metadata.get(x).name.localeCompare(metadata.get(y).name):value==='newest'?Number(y)-Number(x):Number(x)-Number(y);}).forEach(card=>grid.append(card));};
  document.getElementById('clearFilters').onclick=()=>{category='All';edition='All';editionSelect.value='All';search.value='';savedOnly=false;savedFilter.setAttribute('aria-pressed','false');const url=new URL(location.href);url.searchParams.delete('category');url.searchParams.delete('tier');history.replaceState(null,'',url);apply();};
  const categories = new Set(cards.map(card => card.dataset.category));
  let category = new URLSearchParams(location.search).get('category') || 'All';
  if (!categories.has(category)) category = 'All';
  function apply() {
    const term = search.value.trim().toLocaleLowerCase();
    let count = 0;
    const matches=card=>(!savedOnly||saved.has(card.querySelector('[data-template]').dataset.template))&&(edition==='All'||card.dataset.tier===edition)&&(!term||card.textContent.toLocaleLowerCase().includes(term));
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
