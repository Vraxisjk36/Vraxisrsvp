
      (() => {
        "use strict";
        const root = document.getElementById("secretIntro");
        if (!root) return;
        const $ = (id) => document.getElementById(id);
        let timer;
        const finish = () => {
          clearTimeout(timer);
          root.hidden = true;
          document.body.style.overflow = "";
        };
        const start = () => {
          $("siStage").classList.add("is-gone");
          $("siPull").classList.add("active");
        };
        let wishes = 0;
        let revealing = false;
        const reveal = () => {
          if (revealing) return;
          revealing = true;
          $("siGift").classList.add("open");
          $("siInviteNote").classList.add("show");
          timer = setTimeout(() => {
            $("siFinal").classList.add("active");
          }, 1700);
        };
        const balloons = [...root.querySelectorAll("[data-wish]")];
        balloons.forEach((b) =>
          b.addEventListener("click", () => {
            if (b.classList.contains("popped") || revealing) return;
            b.classList.add("popped");
            wishes++;
            $("siProgress").textContent = wishes + " of 3 wishes sent";
            const field = $("siBalloons").getBoundingClientRect(),
              r = b.getBoundingClientRect();
            for (let i = 0; i < 10; i++) {
              const spark = document.createElement("span");
              spark.className = "si-wish-particle";
              spark.textContent = i % 2 ? "✦" : "♡";
              spark.style.setProperty("--px", r.left - field.left + r.width / 2 + "px");
              spark.style.setProperty("--py", r.top - field.top + r.height / 2 + "px");
              const angle = (Math.PI * 2 * i) / 10;
              spark.style.setProperty("--dx", Math.cos(angle) * 95 + "px");
              spark.style.setProperty("--dy", Math.sin(angle) * 95 + "px");
              $("siBalloons").append(spark);
              setTimeout(() => spark.remove(), 1000);
            }
            if (wishes === 3) setTimeout(reveal, 600);
          }),
        );
        $("siBegin").addEventListener("click", start);
        $("siWishSkip").addEventListener("click", reveal);
        $("siEnter").addEventListener("click", finish);
        $("siSkip").addEventListener("click", finish);
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && !root.hidden) finish();
        });
        const parentInput = document.getElementById("edit-parents");
        const sync = () => {
          const n = (parentInput?.value || "Mia & Jordan").trim();
          $("siParents").textContent = n.toUpperCase();
          $("siFinalParents").textContent = n;
        };
        if (parentInput) {
          parentInput.addEventListener("input", sync);
          sync();
        }
        const original = document.getElementById("heroImg");
        if (original) {
          const image = $("siFamilyPhoto");
          image.src = original.currentSrc || original.src;
          new MutationObserver(() => {
            image.src = original.src;
          }).observe(original, { attributes: true, attributeFilter: ["src"] });
        }
        document.body.style.overflow = "hidden";
      })();
    