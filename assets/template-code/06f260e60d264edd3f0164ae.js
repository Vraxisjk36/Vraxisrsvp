
      (() => {
        "use strict";
        const stage = document.getElementById("seStage");
        if (!stage) return;
        document.body.classList.add("se-opening");
        let finished = false,
          opening = false,
          transitioning = false;
        let timers = [];
        const timer = (f, t) => timers.push(setTimeout(f, t));
        const by = (id) => document.getElementById(id);
        function sync() {
          const n = (by("edName")?.value || "Sofia").trim() || "Sofia";
          by("seName").textContent = n;
          by("seCardName").textContent = n;
          by("seResHost").textContent = n;
          by("seWelcomeName").textContent = n + "'s evening.";
          by("seCard").setAttribute("aria-label", "Open " + n + "'s invitation");
          const a = by("edAge")?.value || "25";
          by("seSubtitle").textContent = "is celebrating " + (a === "25" ? "twenty five" : a) + ".";
        }
        function finish() {
          if (finished) return;
          finished = true;
          timers.forEach(clearTimeout);
          stage.classList.add("se-gone");
          document.body.classList.remove("se-opening");
          timer(() => {
            stage.hidden = true;
            stage.setAttribute("aria-hidden", "true");
          }, 800);
        }
        function open() {
          if (finished || opening) return;
          opening = true;
          stage.classList.add("se-reveal");
          timer(() => {
            stage.classList.add("se-reserving");
            by("seReservation").setAttribute("aria-hidden", "false");
          }, 750);
        }
        function confirm() {
          if (finished || transitioning) return;
          transitioning = true;
          const guest = by("seGuest").value.trim();
          by("seGreeting").textContent = guest ? "Especially for " + guest : "You are invited";
          stage.classList.add("se-transition");
          timer(() => {
            stage.classList.add("se-welcoming");
            stage.classList.remove("se-transition");
          }, 750);
          timer(finish, 2450);
        }
        by("seEnter").addEventListener("click", open);
        by("seCard").addEventListener("click", open);
        by("seConfirm").addEventListener("click", confirm);
        by("seGuest").addEventListener("keydown", (e) => {
          if (e.key === "Enter") confirm();
        });
        by("seSkip").addEventListener("click", finish);
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && !finished) finish();
        });
        ["edName", "edAge"].forEach((id) => by(id)?.addEventListener("input", sync));
        sync();
      })();
    