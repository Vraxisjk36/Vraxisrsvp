
      (() => {
        'use strict';
        const progress = document.getElementById('readingLine');
        const nav = document.querySelector('.nav');
        let ticking = false;
        function update() {
          const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
          progress.style.width = Math.min(100, (scrollY / max) * 100) + '%';
          nav.classList.toggle('scrolled', scrollY > 35);
          ticking = false;
        }
        addEventListener(
          'scroll',
          () => {
            if (!ticking) {
              requestAnimationFrame(update);
              ticking = true;
            }
          },
          { passive: true },
        );
        addEventListener('resize', update);
        update();
        const rows = [...document.querySelectorAll('.schedule-row')];
        if ('IntersectionObserver' in window) {
          const ob = new IntersectionObserver(
            (es) => {
              es.forEach((e) => {
                if (e.isIntersecting) {
                  rows.forEach((x) => x.classList.remove('active'));
                  e.target.classList.add('active');
                }
              });
            },
            { rootMargin: '-35% 0px -45% 0px', threshold: 0 },
          );
          rows.forEach((r) => ob.observe(r));
        }
        const f = document.getElementById('rsvpForm'),
          confirm = document.getElementById('rsvpConfirmation');
        f.addEventListener('submit', (e) => {
          if (!f.checkValidity()) return;
          const d = new FormData(f);
          const name = String(d.get('name') || 'Guest').trim();
          const answer = d.get('attendance');
          if (!answer) return;
          document.getElementById('confirmationText').textContent =
            `${name}, your ${answer === 'yes' ? 'acceptance' : 'decline'} is shown here as a preview only. No RSVP has been sent or saved.`;
          f.hidden = true;
          confirm.hidden = false;
          confirm.scrollIntoView({
            behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
            block: 'center',
          });
        });
        document.getElementById('editReply').addEventListener('click', () => {
          confirm.hidden = true;
          f.hidden = false;
          f.scrollIntoView({ block: 'center' });
        });
        // Accessible modal return focus and mobile swipe gestures
        const lb = document.getElementById('lightbox');
        let previousFocus = null,
          startX = null;
        document.querySelectorAll('#contactGrid').forEach((g) =>
          g.addEventListener(
            'click',
            (e) => {
              const b = e.target.closest('button');
              if (b) previousFocus = b;
            },
            true,
          ),
        );
        document.getElementById('lightboxClose').addEventListener('click', () => {
          if (previousFocus) previousFocus.focus();
        });
        lb.addEventListener(
          'touchstart',
          (e) => {
            startX = e.touches[0]?.clientX ?? null;
          },
          { passive: true },
        );
        lb.addEventListener(
          'touchend',
          (e) => {
            if (startX === null) return;
            const delta = (e.changedTouches[0]?.clientX ?? startX) - startX;
            if (Math.abs(delta) > 60)
              document.getElementById(delta < 0 ? 'nextPhoto' : 'prevPhoto').click();
            startX = null;
          },
          { passive: true },
        );
      })();
    