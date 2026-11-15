
      const $ = (s) => document.querySelector(s),
        $$ = (s) => [...document.querySelectorAll(s)];
      const intro = $('#intro');
      function closeIntro() {
        intro.classList.add('is-opening');
        setTimeout(() => {
          intro.classList.add('is-gone');
          intro.classList.remove('is-opening');
        }, 1000);
      }
      $('#openIntro').addEventListener('click', closeIntro);
      $('#skipIntro').addEventListener('click', () => intro.classList.add('is-gone'));
      $('#replay').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        intro.classList.remove('is-gone');
      });
      const observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
              observer.unobserve(e.target);
            }
          }),
        { threshold: 0.08 },
      );
      $$('.reveal').forEach((el) => observer.observe(el));
      window.addEventListener(
        'scroll',
        () => {
          $('#progress').style.width =
            (100 * scrollY) / Math.max(1, document.documentElement.scrollHeight - innerHeight) +
            '%';
        },
        { passive: true },
      );
      $('#seal').addEventListener('click', () => {
        const s = $('#secret');
        s.classList.toggle('show');
        $('#seal').setAttribute('aria-expanded', s.classList.contains('show'));
      });
      $$('[data-light]').forEach((b) =>
        b.addEventListener('click', () => {
          let img = $(`[data-photo="${b.dataset.light}"]`);
          if (img) {
            $('#lightImage').src = img.src;
            $('#lightbox').classList.add('open');
          }
        }),
      );
      $('#closeLight').addEventListener('click', () => $('#lightbox').classList.remove('open'));
      $('#lightbox').addEventListener('click', (e) => {
        if (e.target.id === 'lightbox') $('#lightbox').classList.remove('open');
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          $('#lightbox').classList.remove('open');
          $('#editPanel').classList.remove('open');
        }
      });
      $('#rsvpForm').addEventListener('submit', (e) => {
        e.preventDefault();
        $('#thanks').style.display = 'block';
      });
      const editor = $('#editPanel');
      $('#editOpen').addEventListener('click', () => editor.classList.add('open'));
      $('#editClose').addEventListener('click', () => editor.classList.remove('open'));
      $('#editDone').addEventListener('click', () => editor.classList.remove('open'));
      const editFields = [
        ['first', 'First name'],
        ['second', 'Second name'],
        ['date', 'Wedding date'],
        ['letter', 'Personal letter'],
        ['ceremonyTime', 'Ceremony time'],
        ['ceremonyVenue', 'Ceremony venue'],
        ['ceremonyLocation', 'Ceremony location'],
        ['receptionTime', 'Reception time'],
        ['receptionVenue', 'Reception venue'],
        ['dress', 'Dress code'],
      ];
      editFields.forEach(([key, label]) => {
        let value = $(`[data-text="${key}"]`)?.textContent || '';
        let wrap = document.createElement('div');
        wrap.className = 'field';
        let lab = document.createElement('label');
        lab.textContent = label;
        let inp = document.createElement(key === 'letter' ? 'textarea' : 'input');
        inp.value = value;
        inp.addEventListener('input', () => {
          $$(`[data-text="${key}"]`).forEach((el) => (el.textContent = inp.value));
          if (key === 'first' || key === 'second') {
            $('.signature').textContent =
              $('[data-text="first"]').textContent + ' & ' + $('[data-text="second"]').textContent;
            $('.footer h2').textContent = $('.signature').textContent;
          }
          if (key === 'ceremonyLocation')
            $('#ceremonyMap').href =
              'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(inp.value);
        });
        wrap.append(lab, inp);
        $('#fields').append(wrap);
      });
      ['couple', 'memory', 'memory2', 'ceremony', 'reception'].forEach((key) => {
        let wrap = document.createElement('div');
        wrap.className = 'field';
        let lab = document.createElement('label');
        lab.textContent = key + ' photo';
        let inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = 'image/*';
        inp.addEventListener('change', () => {
          let f = inp.files?.[0];
          if (!f) return;
          let reader = new FileReader();
          reader.onload = () => {
            $$(`[data-photo="${key}"]`).forEach((img) => (img.src = reader.result));
          };
          reader.readAsDataURL(f);
        });
        wrap.append(lab, inp);
        $('#photos').append(wrap);
      });
    