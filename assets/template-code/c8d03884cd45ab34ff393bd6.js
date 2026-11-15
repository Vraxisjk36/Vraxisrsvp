
      (function () {
        const root = document.getElementById("lgArrival");
        if (!root) return;
        document.documentElement.classList.add("garden-intro-lock");
        const name = document.querySelector("[data-parent-names]");
        const label = document.getElementById("lgParents");
        if (name && label) label.textContent = name.textContent;
        let finished = false;
        let timeout;
        function end() {
          if (finished) return;
          finished = true;
          clearTimeout(timeout);
          root.classList.add("lg-done");
          document.documentElement.classList.remove("garden-intro-lock");
          setTimeout(() => root.remove(), 1000);
        }
        function open() {
          if (finished || root.classList.contains("lg-open")) return;
          root.classList.add("lg-open");
          for (let i = 0; i < 13; i++) {
            const petal = document.createElement("i");
            petal.className = "lg-petal";
            petal.style.left = 8 + Math.random() * 84 + "%";
            petal.style.setProperty("--x", (Math.random() - 0.5) * 150 + "px");
            petal.style.setProperty("--d", Math.random() * 0.6 + "s");
            root.appendChild(petal);
          }
          timeout = setTimeout(end, 1900);
        }
        document.getElementById("lgEnter").addEventListener("click", open);
        document.getElementById("lgSkip").addEventListener("click", end);
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") end();
        });
        timeout = setTimeout(() => {
          if (!root.classList.contains("lg-open")) end();
        }, 25000);
      })();
    