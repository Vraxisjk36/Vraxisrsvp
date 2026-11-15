
      const schedule = [
        [
          [
            "16:00",
            "Check-in & welcome",
            "Drop your bags, settle in and meet the girls.",
            "Arrival",
          ],
          ["18:30", "Sunset drinks", "A relaxed first toast to our bride-to-be.", "Drinks"],
          [
            "20:00",
            "Dinner together",
            "Good food, stories and the start of the weekend.",
            "Dinner",
          ],
        ],
        [
          ["10:00", "Slow breakfast", "Coffee, catch-ups and a little recovery time.", "Morning"],
          [
            "13:00",
            "The surprise activity",
            "A little adventure planned just for Nadia.",
            "Surprise",
          ],
          ["18:00", "Getting ready", "Music on. Outfits out. Photos first.", "Glam"],
          ["20:30", "The main event", "Our biggest celebration of the weekend.", "Party"],
        ],
        [
          ["09:30", "Coffee & stories", "One last morning together.", "Morning"],
          ["11:00", "Farewell brunch", "The perfect ending to an unforgettable weekend.", "Brunch"],
          ["13:00", "Check-out", "Hugs, photos and see you at the wedding.", "Departure"],
        ],
      ];
      function renderDay(n) {
        document.querySelectorAll("[data-day]").forEach((b) => {
          let a = +b.dataset.day === n;
          b.classList.toggle("active", a);
          b.setAttribute("aria-selected", String(a));
        });
        const t = document.getElementById("timeline");
        t.classList.remove("fade");
        t.replaceChildren();
        schedule[n].forEach(([time, title, desc, tag]) => {
          const row = document.createElement("article");
          row.className = "stop";
          const a = document.createElement("time");
          a.textContent = time;
          const b = document.createElement("div");
          const h = document.createElement("h3");
          h.textContent = title;
          const p = document.createElement("p");
          p.textContent = desc;
          b.append(h, p);
          const c = document.createElement("div");
          c.className = "tag";
          c.textContent = tag;
          row.append(a, b, c);
          t.append(row);
        });
        void t.offsetWidth;
        t.classList.add("fade");
      }
      document
        .querySelectorAll("[data-day]")
        .forEach((b) => b.addEventListener("click", () => renderDay(+b.dataset.day)));
      renderDay(0);
      const editor = document.getElementById("editor");
      document.getElementById("editOpen").onclick = () => editor.showModal();
      document.getElementById("editClose").onclick = () => editor.close();
      document.getElementById("editDone").onclick = () => editor.close();
      document.querySelectorAll("[data-edit]").forEach((el) =>
        el.addEventListener("input", () => {
          const k = el.dataset.edit;
          document
            .querySelectorAll('[data-bind="' + k + '"]')
            .forEach((node) => (node.textContent = el.value));
          if (k === "city" || k === "venue") {
            document.getElementById("map").href =
              "https://www.google.com/maps/search/?api=1&query=" +
              encodeURIComponent(document.querySelector('[data-edit="venue"]').value);
          }
        }),
      );
      const photoUrls = {};
      document.querySelectorAll("[data-upload]").forEach((el) =>
        el.addEventListener("change", () => {
          const file = el.files && el.files[0];
          if (!file || !file.type.startsWith("image/")) return;
          const k = el.dataset.upload;
          if (photoUrls[k]) URL.revokeObjectURL(photoUrls[k]);
          photoUrls[k] = URL.createObjectURL(file);
          document
            .querySelectorAll('[data-photo="' + k + '"]')
            .forEach((img) => (img.src = photoUrls[k]));
        }),
      );
      document
        .getElementById("passName")
        .addEventListener(
          "input",
          (e) =>
            (document.getElementById("passDisplay").textContent =
              e.target.value.trim() || "Your name here"),
        );
      document.getElementById("savePass").addEventListener("click", () => {
        const c = document.createElement("canvas");
        c.width = 1100;
        c.height = 650;
        const x = c.getContext("2d");
        x.fillStyle = "#FFF0EB";
        x.fillRect(0, 0, 1100, 650);
        x.fillStyle = "#252c2c";
        x.font = "bold 28px Arial";
        x.fillText("THE LAST FLING · GUEST EDITION", 70, 90);
        x.font = "54px Georgia";
        x.fillText("Weekend with " + document.querySelector('[data-edit="bride"]').value, 70, 210);
        x.fillStyle = "#D12C3D";
        x.fillRect(70, 250, 960, 4);
        x.fillStyle = "#252c2c";
        x.font = "66px Georgia";
        const name = document.getElementById("passName").value.trim() || "Your name here";
        x.fillText(name.slice(0, 25), 70, 375);
        x.font = "bold 27px Arial";
        x.fillText(
          (
            document.querySelector('[data-edit="city"]').value +
            " · " +
            document.querySelector('[data-edit="date"]').value
          ).slice(0, 65),
          70,
          465,
        );
        x.font = "22px Arial";
        x.fillText("A keepsake — not a booking confirmation", 70, 565);
        const a = document.createElement("a");
        a.download = "the-last-fling-guest-pass.png";
        a.href = c.toDataURL("image/png");
        a.click();
      });
      document.getElementById("attending").onchange = (e) =>
        (document.getElementById("attendExtra").hidden = e.target.value === "no");
      document.getElementById("rsvpForm").onsubmit = (e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        const yes = d.get("attending") === "yes";
        const c = document.getElementById("confirm");
        c.textContent =
          (yes ? "You’re on the list, " : "We’ll miss you, ") +
          d.get("name") +
          "! ♡ This is a preview confirmation only; your response has not been sent.";
        c.classList.add("show");
        c.scrollIntoView({ behavior: "smooth", block: "nearest" });
      };
      document.getElementById("calendar").onclick = () => {
        const text = document.querySelector('[data-edit="date"]').value;
        const match = text.match(/(\d{1,2})\s*[–-]\s*(\d{1,2})\s+(\w+)\s+(\d{4})/);
        let start = "20270320",
          end = "20270323";
        if (match) {
          const m = [
            "january",
            "february",
            "march",
            "april",
            "may",
            "june",
            "july",
            "august",
            "september",
            "october",
            "november",
            "december",
          ].indexOf(match[3].toLowerCase());
          if (m >= 0) {
            const y = +match[4];
            const f = (d) =>
              d.getUTCFullYear() +
              String(d.getUTCMonth() + 1).padStart(2, "0") +
              String(d.getUTCDate()).padStart(2, "0");
            start = f(new Date(Date.UTC(y, m, +match[1])));
            end = f(new Date(Date.UTC(y, m, +match[2] + 1)));
          }
        }
        const esc = (s) =>
          String(s)
            .replace(/\\/g, "\\\\")
            .replace(/,/g, "\\,")
            .replace(/;/g, "\\;")
            .replace(/\n/g, "\\n");
        const ics = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//VraxisRSVP//EN",
          "BEGIN:VEVENT",
          "UID:last-fling-preview@vraxisrsvp",
          "DTSTAMP:20261112T000000Z",
          "DTSTART;VALUE=DATE:" + start,
          "DTEND;VALUE=DATE:" + end,
          "SUMMARY:" +
            esc("The Last Fling — " + document.querySelector('[data-edit="bride"]').value),
          "LOCATION:" + esc(document.querySelector('[data-edit="venue"]').value),
          "END:VEVENT",
          "END:VCALENDAR",
        ].join("\r\n");
        const u = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
        const a = document.createElement("a");
        a.href = u;
        a.download = "the-last-fling.ics";
        a.click();
        setTimeout(() => URL.revokeObjectURL(u), 1000);
      };
    