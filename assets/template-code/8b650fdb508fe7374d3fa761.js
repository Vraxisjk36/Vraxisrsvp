
      (() => {
        const gate = document.getElementById('mcGate'),
          enter = document.getElementById('mcEnter'),
          skip = document.getElementById('mcSkip');
        if (!gate || !enter) return;
        let finished = false,
          timeout;
        const reduced =
          window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const finish = () => {
          if (finished) return;
          finished = true;
          clearTimeout(timeout);
          gate.classList.add('mc-gone');
          document.body.style.overflow = '';
          setTimeout(() => gate.remove(), 650);
        };
        const begin = () => {
          if (finished || gate.classList.contains('mc-checking')) return;
          if (reduced) {
            finish();
            return;
          }
          gate.classList.add('mc-checking');
          enter.disabled = true;
          setTimeout(() => {
            if (finished) return;
            gate.classList.add('mc-admitted');
          }, 700);
          timeout = setTimeout(finish, 2250);
        };
        enter.addEventListener('click', begin);
        skip.addEventListener('click', finish);
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && !finished) finish();
        });
        document.body.style.overflow = 'hidden';
        const updateName = () => {
          const n = document.getElementById('edName')?.value || 'Jordan';
          const el = document.getElementById('mcIntroName');
          if (el) el.textContent = n.trim().toUpperCase().slice(0, 28) + "'S";
        };
        updateName();
        try {
          const saved = JSON.parse(localStorage.getItem('vraxisMidnightV2') || 'null');
          if (saved && saved.name)
            document.getElementById('mcIntroName').textContent =
              saved.name.trim().toUpperCase().slice(0, 28) + "'S";
        } catch (e) {}
        window.addEventListener('pagehide', () => {
          document.body.style.overflow = '';
        });
      })();
    