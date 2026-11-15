
      (() => {
        'use strict';
        const $ = (s) => document.querySelector(s),
          $$ = (s) => document.querySelectorAll(s);
        let entering = false;
        const intro = $('#intro');
        let finishTimer = null;
        function finish() {
          if (finishTimer) clearTimeout(finishTimer);
          intro.classList.add('done');
          document.body.classList.remove('lock');
          setTimeout(() => {
            intro.hidden = true;
          }, 700);
        }
        $('#enter').addEventListener('click', () => {
          if (entering) return;
          entering = true;
          intro.classList.add('opening');
          finishTimer = setTimeout(
            finish,
            matchMedia('(prefers-reduced-motion: reduce)').matches ? 400 : 3150,
          );
        });
        $('#skip').addEventListener('click', finish);
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && !intro.hidden) finish();
        });
        const strip = $('#galleryStrip');
        const move = (d) =>
          strip.scrollBy({
            left: d * strip.querySelector('.portrait').getBoundingClientRect().width + d * 20,
            behavior: 'smooth',
          });
        $('#prevPhoto').onclick = () => move(-1);
        $('#nextPhoto').onclick = () => move(1);
        $$('input[name="attendance"]').forEach((r) =>
          r.addEventListener('change', () =>
            $('#attendingFields').classList.toggle('hidden', r.value !== 'yes'),
          ),
        );
        $('#rsvpForm').addEventListener('submit', (e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          if (!data.get('attendance')) return;
          $('#formMessage').textContent =
            'Thank you, ' +
            data.get('guestName') +
            '. Your ' +
            (data.get('attendance') === 'yes' ? 'attendance' : 'regret') +
            ' has been recorded in this demo preview only. No RSVP has been sent to the organiser.';
          e.currentTarget.querySelector('button[type="submit"]').textContent =
            'Preview confirmed ✓';
        });
        const editor = $('#editor');
        function toggle(v) {
          editor.classList.toggle('active', v);
          $('#editorToggle').setAttribute('aria-expanded', String(v));
        }
        $('#editorToggle').onclick = () => toggle(!editor.classList.contains('active'));
        $('#closeEditor').onclick = () => toggle(false);
        function bind(input, selector) {
          $(input).addEventListener('input', (e) =>
            $$(selector).forEach((el) => (el.textContent = e.target.value)),
          );
        }
        bind('#firstName', '[data-name="first"]');
        bind('#secondName', '[data-name="second"]');
        bind('#ceremonyVenue', '[data-ceremony]');
        bind('#ceremonyPlace', '[data-ceremony-place]');
        bind('#receptionVenue', '[data-reception]');
        bind('#receptionPlace', '[data-reception-place]');
        $('#weddingDate').addEventListener('change', (e) => {
          const v = e.target.value;
          if (!v) return;
          const d = new Date(v + 'T12:00:00');
          const text = d.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
          $$('[data-date]').forEach((el) => (el.textContent = text));
        });
        $('#ceremonyPlace').addEventListener(
          'input',
          (e) =>
            ($('#directions').href =
              'https://www.google.com/maps/search/?api=1&query=' +
              encodeURIComponent(e.target.value)),
        );
        $('#receptionPlace').addEventListener(
          'input',
          (e) =>
            ($('#receptionDirections').href =
              'https://www.google.com/maps/search/?api=1&query=' +
              encodeURIComponent(e.target.value)),
        );
        const observed = $$('.reveal');
        if ('IntersectionObserver' in window) {
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add('is-visible');
                  observer.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.1, rootMargin: '0px 0px -30px 0px' },
          );
          observed.forEach((el) => observer.observe(el));
        } else observed.forEach((el) => el.classList.add('is-visible'));
      })();

      // V1.2 portrait exhibition and accessible navigation
      document.addEventListener('DOMContentLoaded', () => {
        const portraits = [...document.querySelectorAll('.portrait')],
          box = document.getElementById('portraitLightbox'),
          pic = document.getElementById('lightboxImage'),
          caption = document.getElementById('lightboxCaption');
        let active = 0,
          returnFocus = null;
        function show(i) {
          active = (i + portraits.length) % portraits.length;
          pic.src = portraits[active].querySelector('img').src;
          pic.alt = portraits[active].querySelector('img').alt;
          caption.textContent = portraits[active].dataset.caption;
        }
        function open(i) {
          returnFocus = document.activeElement;
          show(i);
          box.hidden = false;
          document.body.style.overflow = 'hidden';
          document.getElementById('lightboxClose').focus();
        }
        function close() {
          box.hidden = true;
          document.body.style.overflow = '';
          returnFocus?.focus();
        }
        portraits.forEach((p, i) => {
          p.addEventListener('click', () => open(i));
          p.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              open(i);
            }
          });
        });
        document.getElementById('lightboxClose').onclick = close;
        document.getElementById('lightboxPrev').onclick = () => show(active - 1);
        document.getElementById('lightboxNext').onclick = () => show(active + 1);
        box.addEventListener('click', (e) => {
          if (e.target === box) close();
        });
        document.addEventListener('keydown', (e) => {
          if (box.hidden) return;
          if (e.key === 'Escape') close();
          if (e.key === 'ArrowRight') show(active + 1);
          if (e.key === 'ArrowLeft') show(active - 1);
        });
      }, { once: true });
    