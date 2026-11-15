
      (() => {
        'use strict';
        const $ = (s) => document.querySelector(s);
        const photos = [
          ['assets/media/4a5cd902788be16f220c82c5-960.webp', '01 / CROWD'],
          ['assets/media/cdefcce75bfe9ddb8d320b70-960.webp', '02 / LIGHTS'],
          ['assets/media/863bb47434086de568ee5543-960.webp', '03 / SOUND'],
          ['assets/media/662906c6d16ed168e540a4d5-960.webp', '04 / ENERGY'],
          ['assets/media/af48266cba71486b6dc4bc65-960.webp', '05 / AFTER DARK'],
          ['assets/media/c68b397e78e19c480b354893-960.webp', '06 / THE MOMENT'],
        ];
        const img = (id) => id;
        $('#archiveGrid').innerHTML = photos
          .map(
            ([id, label], i) =>
              `<button type="button" data-i="${i}" data-label="${label}" aria-label="View photo ${i + 1}"><img loading="lazy" src="${img(id)}" alt="Nightlife editorial photograph ${i + 1}"></button>`,
          )
          .join('');
        let active = 0,
          focusBefore = null;
        const box = $('#lightbox');
        function show(i) {
          active = (i + photos.length) % photos.length;
          $('#lightboxImg').src = img(photos[active][0]);
          $('#lightboxCaption').textContent = photos[active][1] + ' / ' + photos.length + ' FRAMES';
        }
        function open(i) {
          focusBefore = document.activeElement;
          show(i);
          box.classList.add('open');
          document.body.style.overflow = 'hidden';
          $('#closePhoto').focus();
        }
        function close() {
          box.classList.remove('open');
          document.body.style.overflow = '';
          focusBefore?.focus();
        }
        $('#archiveGrid').addEventListener('click', (e) => {
          const b = e.target.closest('button[data-i]');
          if (b) open(+b.dataset.i);
        });
        $('#closePhoto').onclick = close;
        $('#prevPhoto').onclick = () => show(active - 1);
        $('#nextPhoto').onclick = () => show(active + 1);
        box.addEventListener('click', (e) => {
          if (e.target === box) close();
        });
        document.addEventListener('keydown', (e) => {
          if (!box.classList.contains('open')) return;
          if (e.key === 'Escape') close();
          if (e.key === 'ArrowLeft') show(active - 1);
          if (e.key === 'ArrowRight') show(active + 1);
          if (e.key === 'Tab') {
            const buttons = [...box.querySelectorAll('button')];
            if (e.shiftKey && document.activeElement === buttons[0]) {
              e.preventDefault();
              buttons.at(-1).focus();
            } else if (!e.shiftKey && document.activeElement === buttons.at(-1)) {
              e.preventDefault();
              buttons[0].focus();
            }
          }
        });
        let touch = 0;
        box.addEventListener('touchstart', (e) => (touch = e.changedTouches[0].screenX), {
          passive: true,
        });
        box.addEventListener(
          'touchend',
          (e) => {
            const d = e.changedTouches[0].screenX - touch;
            if (Math.abs(d) > 45) show(active + (d < 0 ? 1 : -1));
          },
          { passive: true },
        );
        document
          .querySelectorAll('[name=attendance]')
          .forEach((r) =>
            r.addEventListener(
              'change',
              () =>
                ($('#attendingFields').hidden =
                  document.querySelector('[name=attendance]:checked')?.value !== 'yes'),
            ),
          );
        $('#rsvpForm').addEventListener('submit', (e) => {
          e.preventDefault();
          const n = $('#guestName').value.trim(),
            a = document.querySelector('[name=attendance]:checked')?.value;
          if (!n || !a) return;
          $('#formStatus').style.display = 'block';
          $('#formStatus').textContent =
            a === 'yes'
              ? `You're on the preview guest list, ${n}. No response has been sent.`
              : `Thanks for replying, ${n}. No response has been sent.`;
          $('#formStatus').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        const editor = $('#editor');
        const toggle = () => editor.classList.toggle('open');
        $('#editFab').onclick = toggle;
        $('#editTop').onclick = toggle;
        $('#closeEd').onclick = () => editor.classList.remove('open');
        const defaults = {
          name: 'Jordan',
          age: 30,
          date: '2026-11-14',
          time: '20:00',
          venue: 'The Velvet Room',
          address: 'Johannesburg, South Africa',
          hero: '',
        };
        let current = { ...defaults };
        const nice = (s) => {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return '14 NOV 2026';
          const [y, m, d] = s.split('-').map(Number);
          return new Date(y, m - 1, d)
            .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            .toUpperCase();
        };
        function apply(d) {
          current = { ...defaults, ...d };
          const name = (current.name || 'Jordan').trim(),
            age = Math.max(1, Math.min(120, Number(current.age) || 30)),
            date = nice(current.date),
            venue = current.venue || defaults.venue,
            address = current.address || defaults.address;
          if ($('#heroPerson')) $('#heroPerson').textContent = name.toUpperCase();
          if ($('#heroAge')) $('#heroAge').textContent = age;
          $('#ticketName').textContent = name.toUpperCase() + ' ' + age + '.';
          $('#ticketDate').textContent = date;
          $('#ticketTime').textContent = current.time + ' UNTIL LATE';
          $('#detailDate').textContent = date;
          $('#detailTime').textContent = 'DOORS ' + current.time;
          $('#detailVenue').textContent = venue.toUpperCase();
          $('#detailAddress').textContent = address.toUpperCase();
          $('#directions').href =
            'https://www.google.com/maps/search/?api=1&query=' +
            encodeURIComponent(address + ' ' + venue);
          $('#edName').value = name;
          $('#edAge').value = age;
          $('#edDate').value = current.date;
          $('#edTime').value = current.time;
          $('#edVenue').value = venue;
          $('#edAddress').value = address;
          $('#edHero').value = current.hero || '';
          if (/^https:\/\//i.test(current.hero || ''))
            $('#heroPhoto').style.backgroundImage = `url("${current.hero.replace(/["\\]/g, '')}")`;
          else $('#heroPhoto').style.backgroundImage = '';
        }
        $('#saveEd').onclick = () => {
          const d = {
            name: $('#edName').value,
            age: $('#edAge').value,
            date: $('#edDate').value,
            time: $('#edTime').value,
            venue: $('#edVenue').value,
            address: $('#edAddress').value,
            hero: $('#edHero').value,
          };
          apply(d);
          try {
            localStorage.setItem('vraxisMidnightV2', JSON.stringify(current));
          } catch (e) {}
          editor.classList.remove('open');
        };
        try {
          const saved = JSON.parse(localStorage.getItem('vraxisMidnightV2') || 'null');
          if (saved) apply(saved);
        } catch (e) {}
        $('#calendarBtn').onclick = () => {
          const d = current.date || defaults.date;
          const stamp = d.replace(/-/g, '');
          const time = (current.time || '20:00').replace(':', '') + '00';
          const dt = stamp + 'T' + time;
          const end = stamp + 'T235900';
          const title = encodeURIComponent(current.name + "'s Birthday — Midnight Club");
          const location = encodeURIComponent(current.venue + ', ' + current.address);
          const content = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//VraxisRSVP//Midnight Club//EN\r\nBEGIN:VEVENT\r\nUID:midnight-${stamp}@vraxisrsvp.example\r\nDTSTAMP:${new Date()
            .toISOString()
            .replace(/[-:]/g, '')
            .replace(
              /\.\d{3}/,
              '',
            )}\r\nDTSTART:${dt}\r\nDTEND:${end}\r\nSUMMARY:${current.name.replace(/[,;\\]/g, '')} Birthday - Midnight Club\r\nLOCATION:${(current.venue + ', ' + current.address).replace(/[,;\\]/g, ' ')}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
          const a = document.createElement('a');
          const u = URL.createObjectURL(new Blob([content], { type: 'text/calendar' }));
          a.href = u;
          a.download = 'midnight-club.ics';
          a.click();
          setTimeout(() => URL.revokeObjectURL(u), 1000);
        };
        if ('IntersectionObserver' in window) {
          const obs = new IntersectionObserver(
            (es) =>
              es.forEach((e) => {
                if (e.isIntersecting) {
                  e.target.classList.add('visible');
                  obs.unobserve(e.target);
                }
              }),
            { threshold: 0.05 },
          );
          document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
        } else document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
        let ticking = false;
        addEventListener(
          'scroll',
          () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
              $('#progress').style.width =
                (100 * scrollY) / Math.max(1, document.documentElement.scrollHeight - innerHeight) +
                '%';
              ticking = false;
            });
          },
          { passive: true },
        );
      })();
    