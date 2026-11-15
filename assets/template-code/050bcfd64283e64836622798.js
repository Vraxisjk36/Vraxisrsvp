
      (() => {
        const root = document.getElementById("reel-intro");
        if (!root) return;
        document.documentElement.classList.add("reel-locked");
        const $ = (id) => document.getElementById(id);
        const frames = [
          {
            img: "assets/media/6e619f01882e6c12f484d632-960.webp",
            label: "FRAME 01 — THE BEGINNING",
            fallback: "Every unforgettable story starts somewhere.",
            field: "editMemory1",
          },
          {
            img: "assets/media/1853599e6a21760c652bd5d6-960.webp",
            label: "FRAME 02 — THE BECOMING",
            fallback: "The little moments became the best memories.",
            field: "editMemory2",
          },
          {
            img: "assets/media/a947cb572fbe4c83d653c2b1-640.webp",
            label: "FRAME 03 — THE WOMAN SHE IS",
            fallback: "And the best chapter is still ahead.",
            field: "editMemory3",
          },
        ];
        let index = 0,
          busy = false,
          finished = false;
        const name = () => ($("editName")?.value || "Amara").trim() || "Amara";
        function sync() {
          $("reel-name").textContent = name();
          $("reel-final-name").textContent = name();
        }
        function show(i) {
          index = i;
          const f = frames[i];
          $("reel-image").src = f.img;
          $("reel-chapter").textContent = f.label;
          $("reel-memory").textContent = $(f.field)?.value || f.fallback;
          $("reel-number").textContent = String(i + 1).padStart(2, "0");
          $("reel-back").disabled = i === 0;
          $("reel-next").textContent = i === 2 ? "REVEAL INVITATION →" : "NEXT FRAME →";
          Array.from($("reel-dots").children).forEach((d, j) => d.classList.toggle("on", j === i));
        }
        function advance(i) {
          if (busy || finished) return;
          if (i > 2) {
            reveal();
            return;
          }
          if (i < 0 || i === index) return;
          busy = true;
          const machine = root.querySelector(".reel-machine");
          machine.classList.add("advancing");
          setTimeout(() => {
            show(i);
            machine.classList.remove("advancing");
            busy = false;
          }, 420);
        }
        function reveal() {
          if (busy || finished) return;
          sync();
          root.querySelector(".reel-stage").style.opacity = "0";
          root.querySelector(".reel-stage").style.transform = "scale(1.08)";
          $("reel-final").classList.add("open");
          $("reel-final").setAttribute("aria-hidden", "false");
        }
        function finish() {
          if (finished) return;
          finished = true;
          root.classList.add("reel-gone");
          document.documentElement.classList.remove("reel-locked");
          setTimeout(() => root.remove(), 750);
        }
        $("reel-next").addEventListener("click", () => advance(index + 1));
        $("reel-back").addEventListener("click", () => advance(index - 1));
        $("reel-skip").addEventListener("click", finish);
        $("reel-enter").addEventListener("click", finish);
        $("editName")?.addEventListener("input", sync);
        for (const f of frames)
          $(f.field)?.addEventListener("input", () => {
            if (frames[index] === f) show(index);
          });
        let x = 0;
        const stage = root.querySelector(".reel-stage");
        stage.addEventListener(
          "touchstart",
          (e) => {
            x = e.touches[0].clientX;
          },
          { passive: true },
        );
        stage.addEventListener(
          "touchend",
          (e) => {
            const d = e.changedTouches[0].clientX - x;
            if (Math.abs(d) > 55) advance(index + (d < 0 ? 1 : -1));
          },
          { passive: true },
        );
        document.addEventListener("keydown", (e) => {
          if (!root.isConnected) return;
          if (e.key === "Escape") finish();
          if (e.key === "ArrowRight") advance(index + 1);
          if (e.key === "ArrowLeft") advance(index - 1);
        });
        sync();
        show(0);
      })();
    