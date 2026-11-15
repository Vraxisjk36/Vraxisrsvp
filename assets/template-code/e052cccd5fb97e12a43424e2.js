
      (function () {
        const el = document.querySelector('.grand-chapter-divider');
        if (!el) return;
        if (!('IntersectionObserver' in window)) {
          el.classList.add('in-view');
          return;
        }
        const ob = new IntersectionObserver(
          (es) => {
            for (const e of es)
              if (e.isIntersecting) {
                e.target.classList.add('in-view');
                ob.unobserve(e.target);
              }
          },
          { threshold: 0.12 },
        );
        ob.observe(el);
      })();
    