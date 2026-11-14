(() => {
  const featured = document.getElementById('featured');
  document.querySelectorAll('[data-featured-direction]').forEach(button => button.addEventListener('click', () => {
    featured.scrollBy({left:Number(button.dataset.featuredDirection) * (featured.firstElementChild.getBoundingClientRect().width + 24),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }));
})();
