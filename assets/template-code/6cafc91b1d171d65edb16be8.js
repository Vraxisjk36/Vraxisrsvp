
      (() => {
        const intro = document.getElementById("sweetIntro");
        const action = document.getElementById("sweetAction");
        const hint = document.getElementById("sweetHint");
        const skip = document.getElementById("sweetSkip");
        let step = 0,
          closing = false;
        document.documentElement.classList.add("sweet-locked");
        function finish() {
          if (closing) return;
          closing = true;
          intro.classList.add("sweet-finish");
          document.documentElement.classList.remove("sweet-locked");
          setTimeout(() => {
            intro.remove();
          }, 1350);
        }
        function advance() {
          if (step === 0) {
            step = 1;
            intro.dataset.step = "1";
            action.textContent = "Take your invitation ♡";
            hint.textContent = "A recipe made especially for you";
            return;
          }
          if (step === 1) {
            step = 2;
            intro.dataset.step = "2";
            action.textContent = "Step into the celebration →";
            hint.textContent = "Every beautiful memory begins somewhere";
            return;
          }
          finish();
        }
        action.addEventListener("click", advance);
        skip.addEventListener("click", finish);
        document.addEventListener("keydown", (e) => {
          if (!intro.isConnected) return;
          if (e.key === "Escape") finish();
        });
        const bride = document.getElementById("editBride");
        if (bride) {
          const sync = () => {
            document.getElementById("sweetBride").textContent = bride.value.trim() || "the bride";
          };
          bride.addEventListener("input", sync);
          sync();
        }
      })();
    