
      (() => {
        'use strict';
        const $ = (s) => document.querySelector(s);
        const photos = [
          ['assets/media/55c422b1677d813d481dfe16-640.webp', 'The way you make me laugh.'],
          ['assets/media/7a1ea68529c2f98bb3a0ed15-640.webp', 'Every road led to you.'],
          ['assets/media/8c3f8e676ba308a3172e3c77-640.webp', 'Our favourite kind of day.'],
          ['assets/media/04e214dd45433146752412ad-640.webp', 'The promise of forever.'],
          ['assets/media/24f97d3f54698e595e9004f1-960.webp', 'The little moments.'],
          ['assets/media/9cf3a88a6e887d01e1917a01-640.webp', 'Somewhere we belong.'],
          ['assets/media/17dc75e4ee73b1adb4c7ccd4-960.webp', 'A reason to celebrate.'],
          ['assets/media/80a06116714a82c0c585d1e8-640.webp', 'This is just the beginning.'],

          // ["assets/media/effff5b877b953d00c6cf5a0-640.webp", "The way you make me laugh."],
          // ["assets/media/000e6256b4e974274c380045-960.webp", "Every road led to you."],
          // ["assets/media/4f2568821cf246220409f999-960.webp", "Our favourite kind of day."],
          // ["assets/media/ac3cbb9c86b7579d486bf4e1-960.webp", "The promise of forever."],
          // ["assets/media/be2e2857d1a7d69b9926f3d3-640.webp", "The little moments."],
          // ["assets/media/271106d4df3dd2e905d250ee-960.webp", "Somewhere we belong."],
          // ["assets/media/930a8dda6bec5ccbee2be2a5-960.webp", "A reason to celebrate."],
          // ["assets/media/31b10505f549118f48587dd3-960.webp", "This is just the beginning."],
        ];
        let active = 0;
        const grid = $('#contactGrid');
        photos.forEach(([url, caption], i) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'photo-tile reveal';
          b.setAttribute('aria-label', `View photo ${i + 1}: ${caption}`);
          const im = document.createElement('img');
          im.src = url;
          im.loading = 'lazy';
          im.alt = caption;
          im.onerror = () => {
            im.style.opacity = '.15';
            b.style.background = '#928a80';
          };
          const label = document.createElement('span');
          label.textContent = String(i + 1).padStart(2, '0');
          b.append(im, label);
          b.addEventListener('click', () => show(i));
          grid.append(b);
        });
        function show(i) {
          active = (i + photos.length) % photos.length;
          $('#lightboxImg').src = photos[active][0];
          $('#lightboxImg').alt = photos[active][1];
          $('#lightboxCaption').textContent = photos[active][1];
          $('#lightboxCount').textContent = `${String(active + 1).padStart(2, '0')} / 08`;
          $('#lightbox').classList.add('open');
          document.body.style.overflow = 'hidden';
          $('#lightboxClose').focus();
        }
        function close() {
          $('#lightbox').classList.remove('open');
          document.body.style.overflow = '';
        }
        $('#lightboxClose').addEventListener('click', close);
        $('#prevPhoto').addEventListener('click', () => show(active - 1));
        $('#nextPhoto').addEventListener('click', () => show(active + 1));
        $('#lightbox').addEventListener('click', (e) => {
          if (e.target === $('#lightbox')) close();
        });
        document.addEventListener('keydown', (e) => {
          if (!$('#lightbox').classList.contains('open')) return;
          if (e.key === 'Escape') close();
          if (e.key === 'ArrowLeft') show(active - 1);
          if (e.key === 'ArrowRight') show(active + 1);
        });
        const reveal = () => {
          if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
            return;
          }
          const obs = new IntersectionObserver(
            (entries) =>
              entries.forEach((e) => {
                if (e.isIntersecting) {
                  e.target.classList.add('visible');
                  obs.unobserve(e.target);
                }
              }),
            { threshold: 0.08 },
          );
          document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
        };
        reveal();
        document.querySelectorAll('input[name="attendance"]').forEach((r) =>
          r.addEventListener('change', () => {
            $('#attendingFields').hidden =
              document.querySelector('input[name="attendance"]:checked')?.value !== 'yes';
          }),
        );
        $('#rsvpForm').addEventListener('submit', (e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const name = String(data.get('name') || 'Guest').trim();
          const attending = data.get('attendance');
          if (!attending) {
            $('#formStatus').textContent = 'Please select whether you will attend.';
            return;
          }
          $('#formStatus').textContent =
            `Thank you, ${name}! This is a preview: your ${attending === 'yes' ? 'acceptance' : 'decline'} has not been sent. Live RSVPs will be connected when the VraxisRSVP platform is integrated.`;
        });
        function editorOpen(open) {
          $('#editor').classList.toggle('open', open);
          $('#editorToggle').hidden = open;
        }
        $('#editorToggle').addEventListener('click', () => editorOpen(true));
        $('#editorClose').addEventListener('click', () => editorOpen(false));
        $('#applyEdits').addEventListener('click', () => {
          const a = $('#editName1').value.trim() || 'Alex',
            b = $('#editName2').value.trim() || 'Mira';
          $('#heroNames').replaceChildren();
          for (const t of [a, '& ' + b]) {
            const span = document.createElement('span');
            span.textContent = t;
            $('#heroNames').append(span);
          }
          $('#footerNames').textContent = `${a} & ${b}.`;
          const dt = $('#editDate').value;
          let display = '14 November 2026';
          if (dt) {
            const [y, m, d] = dt.split('-').map(Number);
            display = new Date(y, m - 1, d).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
          }
          $('#heroDate').textContent = display + " — You're invited";
          $('#footerDate').textContent = display;
          $('#ceremonyPlace').textContent = $('#editCeremony').value;
          $('#receptionPlace').textContent = $('#editReception').value;
          $('#ceremonyTime').textContent = $('#editCeremonyTime').value;
          $('#receptionTime').textContent = $('#editReceptionTime').value;
          $('#ceremonyMap').href =
            'https://www.google.com/maps/search/?api=1&query=' +
            encodeURIComponent($('#editCeremony').value);
          $('#receptionMap').href =
            'https://www.google.com/maps/search/?api=1&query=' +
            encodeURIComponent($('#editReception').value);
          const photo = $('#editHeroPhoto').value.trim();
          if (/^https:\/\//i.test(photo)) $('#heroImage').src = photo;
          editorOpen(false);
        });
      })();
    