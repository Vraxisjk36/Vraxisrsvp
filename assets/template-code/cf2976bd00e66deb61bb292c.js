
      (function () {
        const intro = document.getElementById('mvIntro'),
          enter = document.getElementById('mvEnter'),
          skip = document.getElementById('mvSkip');
        if (!intro) return;
        document.body.classList.add('mv-locked');
        let done = false;
        function finish() {
          if (done) return;
          done = true;
          intro.classList.add('is-gone');
          document.body.classList.remove('mv-locked');
          setTimeout(() => intro.remove(), 900);
        }
        function open() {
          if (done || intro.classList.contains('is-opening')) return;
          intro.classList.add('is-opening');
          enter.disabled = true;
          setTimeout(() => {
            intro.classList.add('is-finishing');
            setTimeout(finish, 550);
          }, 1950);
        }
        enter.addEventListener('click', open);
        skip.addEventListener('click', finish);
        let startY = null;
        intro.addEventListener(
          'touchstart',
          (e) => {
            startY = e.touches[0]?.clientY ?? null;
          },
          { passive: true },
        );
        intro.addEventListener(
          'touchend',
          (e) => {
            if (startY !== null && startY - (e.changedTouches[0]?.clientY ?? startY) > 75) open();
            startY = null;
          },
          { passive: true },
        );
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') finish();
        });
        window.addEventListener('load', () => {
          const h = document.querySelector('#heroNames');
          if (h) {
            const parts = h.querySelectorAll('span');
            if (parts.length >= 2) {
              document.getElementById('mvIntroFirst').textContent = parts[0].textContent;
              document.getElementById('mvIntroSecond').textContent = parts[1].textContent.replace(
                /^&\s*/,
                '',
              );
            }
          }
        });
      })();
    