
      (() => {
        "use strict";
        const $ = (s) => document.querySelector(s),
          $$ = (s) => Array.from(document.querySelectorAll(s));
        const progress = () => {
          let d = document.documentElement;
          $("#progress").style.width =
            (100 * scrollY) / Math.max(1, d.scrollHeight - innerHeight) + "%";
        };
        addEventListener("scroll", progress, { passive: true });
        progress();
        const observer = new IntersectionObserver(
          (entries) =>
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add("visible");
                observer.unobserve(e.target);
              }
            }),
          { threshold: 0.08 },
        );
        $$(".reveal").forEach((e) => observer.observe(e));
        const scenePhotos = ["assets/media/dfe38ffb72c4cd7e23664e71-960.webp","assets/media/badebcee3739faec03902154-960.webp","assets/media/2c271c5f52631165e7a42720-960.webp","assets/media/5f2eec319fc8c8259ca7805e-960.webp","assets/media/4d0d03d46d4b9db0898fad8d-960.webp"];
        const sceneNames = [
          "The Arrival",
          "The First Toast",
          "At the Table",
          "In Her Honour",
          "After Hours",
        ];
        function setScene(n) {
          $$(".scene-row").forEach((r, i) => r.classList.toggle("active", i === n));
          const img = $("#sceneImage");
          img.style.opacity = ".35";
          setTimeout(() => {
            img.src = scenePhotos[n];
            img.onload = () => (img.style.opacity = "1");
            img.style.opacity = "1";
          }, 160);
          $("#sceneCaption").textContent =
            `Act ${["I", "II", "III", "IV", "V"][n]} · ${sceneNames[n]}`;
        }
        $$(".scene-row").forEach((r) => {
          r.addEventListener("click", () => setScene(+r.dataset.scene));
          r.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setScene(+r.dataset.scene);
            }
          });
        });
        const photos = $$(".gallery-item img").map((e) => ({
          src: e.src,
          caption: e.parentElement.querySelector("span").textContent,
        }));
        let current = 0;
        function showPhoto(n) {
          current = (n + photos.length) % photos.length;
          $("#lbimage").src = photos[current].src;
          $("#lbcap").textContent = photos[current].caption;
          $("#lightbox").classList.add("open");
          document.body.style.overflow = "hidden";
        }
        function closePhoto() {
          $("#lightbox").classList.remove("open");
          document.body.style.overflow = "";
        }
        $$(".gallery-item").forEach((b, i) => b.addEventListener("click", () => showPhoto(i)));
        $("#lbclose").onclick = closePhoto;
        $("#lbprev").onclick = () => showPhoto(current - 1);
        $("#lbnext").onclick = () => showPhoto(current + 1);
        $("#lightbox").addEventListener("click", (e) => {
          if (e.target.id === "lightbox") closePhoto();
        });
        addEventListener("keydown", (e) => {
          if (!$("#lightbox").classList.contains("open")) return;
          if (e.key === "Escape") closePhoto();
          if (e.key === "ArrowLeft") showPhoto(current - 1);
          if (e.key === "ArrowRight") showPhoto(current + 1);
        });
        let touchX = 0;
        $("#lightbox").addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), {
          passive: true,
        });
        $("#lightbox").addEventListener(
          "touchend",
          (e) => {
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 55) showPhoto(current + (dx < 0 ? 1 : -1));
          },
          { passive: true },
        );
        let answer = "";
        $$(".choice").forEach((b) =>
          b.addEventListener("click", () => {
            answer = b.dataset.answer;
            $$(".choice").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
            $("#attendingFields").hidden = answer !== "yes";
          }),
        );
        $("#rsvpForm").addEventListener("submit", (e) => {
          e.preventDefault();
          if (!answer) {
            alert("Please select whether you will attend.");
            return;
          }
          const name = $("#guestName").value.trim();
          if (!name) return;
          $("#responseText").textContent =
            answer === "yes"
              ? `Thank you, ${name}. Your preview confirms ${$("#guestCount").value} guest(s). We look forward to celebrating with you.`
              : `Thank you, ${name}. Your preview records your regrets. You will be missed.`;
          $("#formFields").hidden = true;
          $("#success").style.display = "block";
        });
        $("#editResponse").onclick = () => {
          $("#formFields").hidden = false;
          $("#success").style.display = "none";
        };
        const updateCalendar = () => {
          const d = $("#editDate").value || "2026-11-14";
          const start = d.replace(/-/g, "") + "T183000",
            end = d.replace(/-/g, "") + "T233000";
          $("#calendar").href =
            "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" +
            encodeURIComponent("After Hours — " + $("#editName").value + " Birthday") +
            "&dates=" +
            start +
            "/" +
            end +
            "&details=" +
            encodeURIComponent("An evening of celebration") +
            "&location=" +
            encodeURIComponent($("#editVenue").value + ", " + $("#editAddress").value);
        };
        function update() {
          const values = {
            name: $("#editName").value || "Simone",
            age: $("#editAge").value || "40",
            venue: $("#editVenue").value || "The Glasshouse",
            address: $("#editAddress").value || "Johannesburg, South Africa",
            time: $("#editTime").value || "18:30 — Late",
          };
          Object.entries(values).forEach(([k, v]) =>
            $$(`[data-bind="${k}"]`).forEach((e) => (e.textContent = v)),
          );
          if ($("#tribute")) $("#tribute").textContent = $("#editTribute").value;
          const date = new Date($("#editDate").value + "T12:00:00");
          if (!isNaN(date)) {
            $("#day").textContent = date.getDate();
            $("#monthYear").textContent = date
              .toLocaleDateString("en-GB", { month: "long", year: "numeric" })
              .toUpperCase()
              .replace(" ", " · ");
          }
          const hero = $("#editHero").value.trim(),
            portrait = $("#editPortrait").value.trim();
          if (/^https:\/\//.test(hero))
            document.documentElement.style.setProperty(
              "--hero-image",
              `url("${hero.replace(/["\\]/g, "")}")`,
            );
          if (/^https:\/\//.test(portrait))
            $(".photo-statement .photo").style.backgroundImage =
              `url("${portrait.replace(/["\\]/g, "")}")`;
          $("#directions").href =
            "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(values.venue + ", " + values.address);
          updateCalendar();
        }
        $$("#studioPanel input,#studioPanel textarea").forEach((el) =>
          el.addEventListener("input", update),
        );
        $("#studioToggle").onclick = () => {
          const open = $("#studioPanel").classList.toggle("open");
          $("#studioToggle").setAttribute("aria-expanded", String(open));
        };
        $("#exportSettings").onclick = () => {
          const data = {
            template: "after-hours-006",
            name: $("#editName").value,
            age: $("#editAge").value,
            date: $("#editDate").value,
            time: $("#editTime").value,
            venue: $("#editVenue").value,
            address: $("#editAddress").value,
            tribute: $("#editTribute").value,
            heroImage: $("#editHero").value,
            portraitImage: $("#editPortrait").value,
          };
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "after-hours-personalisation.json";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        };
        update();
      })();

      (() => {
        const pairs = [
          ["editMemory1", "memoryText1"],
          ["editMemory2", "memoryText2"],
          ["editMemory3", "memoryText3"],
        ];
        pairs.forEach(([a, b]) => {
          const input = document.getElementById(a),
            out = document.getElementById(b);
          if (input && out) {
            input.addEventListener("input", () => (out.textContent = input.value));
          }
        });
        const quote = document.getElementById("editQuote"),
          target = document.getElementById("hostQuote");
        if (quote && target)
          quote.addEventListener("input", () => (target.textContent = "“" + quote.value + "”"));
        const name = document.getElementById("editName"),
          age = document.getElementById("editAge");
        function updateHonour() {
          const n = (name.value || "Amara").trim();
          document.querySelectorAll('[data-bind="name"]').forEach((e) => (e.textContent = n));
          document
            .querySelectorAll('[data-bind="age"]')
            .forEach((e) => (e.textContent = age.value || "30"));
          document.title = n + "'s Birthday — A Night in Their Honour";
        }
        name.addEventListener("input", updateHonour);
        age.addEventListener("input", updateHonour);
        updateHonour();
      })();
    