
      (() => {
        const progress = document.getElementById("readProgress");
        const els = ["cdDays", "cdHours", "cdMins", "cdSecs"].map((id) =>
          document.getElementById(id),
        );
        function tick() {
          const date = document.getElementById("edDate")?.value || "2026-11-14",
            time = document.getElementById("edTime")?.value || "18:30";
          const target = new Date(date + "T" + time + ":00");
          const diff = Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));
          const vals = [
            Math.floor(diff / 86400),
            Math.floor(diff / 3600) % 24,
            Math.floor(diff / 60) % 60,
            diff % 60,
          ];
          els.forEach((el, i) => {
            if (el) el.textContent = String(vals[i]).padStart(2, "0");
          });
        }
        function scroll() {
          const max = document.documentElement.scrollHeight - innerHeight;
          progress.style.width =
            (max > 0 ? Math.max(0, Math.min(100, (scrollY / max) * 100)) : 0) + "%";
        }
        tick();
        scroll();
        setInterval(tick, 1000);
        addEventListener("scroll", scroll, { passive: true });
        addEventListener("resize", scroll, { passive: true });
        document
          .querySelectorAll("#edDate,#edTime")
          .forEach((el) => el.addEventListener("input", tick));
        const status = document.getElementById("rsvpStatus");
        new MutationObserver(() => {
          if (!status.classList.contains("hidden")) {
            const msg = status.textContent;
            status.innerHTML = "";
            const h = document.createElement("h4");
            h.textContent = "Your reply, beautifully noted.";
            const p = document.createElement("p");
            p.textContent = msg;
            status.append(h, p);
          }
        }).observe(status, { attributes: true, attributeFilter: ["class"] });
      })();
    