
      (() => {
        const $ = (id) => document.getElementById(id);
        const name = () => ($('edName')?.value || 'Jordan').trim() || 'Jordan';
        const update = () => {
          const n = name();
          const u = n.toUpperCase();
          for (const [id, val] of Object.entries({
            mcBigName: u,
            mcHeroBigName: u + '’S',
            mcConfirmName: u + '’S NIGHT',
            mcStoryName: u,
            mcNavBrand: u + '’S NIGHT',
          })) {
            const el = $(id);
            if (el) el.textContent = val;
          }
          document.title = n + '’s Night | Private Birthday Invitation';
        };
        update();
        $('edName')?.addEventListener('input', update);
        const field = $('mcPortraitUrl');
        const setPhoto = (url) => {
          if (!url) return;
          const clean = url.replace(/["'\<>]/g, '');
          const el = document.querySelector('.mc-birthday-portrait');
          if (el)
            el.style.backgroundImage =
              'linear-gradient(90deg,#0008,#0000 38%),url("' + clean + '")';
          const story = document.querySelector('.intro-photo');
          if (story) story.style.backgroundImage = 'url("' + clean + '")';
        };
        field?.addEventListener('input', () => setPhoto(field.value));
      })();
    