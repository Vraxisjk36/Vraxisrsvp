
      (() => {
        "use strict";
        const $ = (s) => document.querySelector(s),
          $$ = (s) => [...document.querySelectorAll(s)];
        const defaults = {
          parents: "Olivia & James",
          date: "2027-04-18",
          time: "14:00",
          end: "17:00",
          venue: "The Glasshouse Garden",
          address: "Johannesburg, South Africa",
          dress: "Garden party attire",
          deadline: "2027-04-04",
          message:
            "There are so many things we haven't met yet — tiny fingers, sleepy smiles, and a whole new kind of love. Before our little one arrives, we'd love to gather with the people who already make our world feel like home.",
          image: "assets/media/031ad5a7714f23835b7d15ea-960.webp",
          gift: "Your presence is the sweetest gift. If you would like to bring something, a favourite children’s book with a handwritten note would mean the world to us.",
        };
        let data = { ...defaults };
        try {
          data = { ...defaults, ...JSON.parse(localStorage.getItem("garden007") || "{}") };
        } catch {}
        const dateFmt = (
          v,
          opt = { weekday: "long", day: "numeric", month: "long", year: "numeric" },
        ) => {
          const d = new Date(v + "T12:00:00");
          return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", opt);
        };
        function render() {
          $$("[data-parent-names]").forEach((el) => (el.textContent = data.parents));
          $("[data-date-text]").textContent = dateFmt(data.date);
          $("[data-date-long]").textContent = dateFmt(data.date);
          $("[data-time]").textContent = data.time + " – " + data.end;
          $("[data-venue]").textContent = data.venue;
          $("[data-address]").textContent = data.address;
          $("[data-dress]").textContent = data.dress;
          $("[data-deadline]").textContent = dateFmt(data.deadline, {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          $("[data-parent-message]").textContent = data.message;
          $("#storyImage").src = data.image;
          $("#mapLink").href =
            "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(data.venue + ", " + data.address);
        }
        render();
        const fields = [
          ["parents", "Parents’ names"],
          ["date", "Event date", "date"],
          ["time", "Start time", "time"],
          ["end", "End time", "time"],
          ["venue", "Venue"],
          ["address", "Address"],
          ["dress", "Dress code"],
          ["deadline", "RSVP deadline", "date"],
          ["message", "Personal message", "textarea"],
          ["image", "Story photograph URL"],
          ["gift", "Gift note", "textarea"],
        ];
        fields.forEach(([key, label, type]) => {
          const div = document.createElement("div");
          div.className = "field";
          const l = document.createElement("label");
          l.htmlFor = "edit-" + key;
          l.textContent = label;
          const el = document.createElement(type === "textarea" ? "textarea" : "input");
          el.id = "edit-" + key;
          if (type !== "textarea") el.type = type || "text";
          el.value = data[key];
          el.addEventListener("input", () => {
            data[key] = el.value;
            render();
            try {
              localStorage.setItem("garden007", JSON.stringify(data));
            } catch {}
          });
          div.append(l, el);
          $("#editorFields").append(div);
        });
        const editor = $("#editor");
        function toggleEditor(on) {
          editor.classList.toggle("open", on);
          editor.setAttribute("aria-hidden", String(!on));
          if (on) $("#closeEditor").focus();
          else $("#editToggle").focus();
        }
        $("#editToggle").onclick = () => toggleEditor(true);
        $("#closeEditor").onclick = () => toggleEditor(false);
        $("#resetEditor").onclick = () => {
          data = { ...defaults };
          fields.forEach(([k]) => ($("#edit-" + k).value = data[k]));
          render();
          try {
            localStorage.removeItem("garden007");
          } catch {}
        };
        const modal = $("#detailModal");
        let lastTrigger = null;
        function openModal(key, trigger) {
          lastTrigger = trigger;
          const info = {
            date: [
              "The flower",
              "The day we bloom",
              `<p>${dateFmt(data.date)}</p><p>${data.time} – ${data.end}</p><p>Come ready for an afternoon of sweetness and celebration.</p>`,
            ],
            place: [
              "The greenhouse",
              "Find your way",
              `<p><strong>${escapeHtml(data.venue)}</strong></p><p>${escapeHtml(data.address)}</p><p><a class="btn outline" href="${$("#mapLink").href}" target="_blank" rel="noopener">Open directions ↗</a></p>`,
            ],
            dress: [
              "The ribbon",
              "What to wear",
              `<p>${escapeHtml(data.dress)}</p><p>Think gentle colours, easy elegance and shoes made for wandering through a garden.</p>`,
            ],
            gifts: [
              "The letter",
              "A little note",
              `<p>${escapeHtml(data.gift)}</p><p>Most of all, we hope to see you there.</p>`,
            ],
          };
          const [eyebrow, title, body] = info[key];
          $("#modalEyebrow").textContent = eyebrow;
          $("#modalTitle").textContent = title;
          $("#modalBody").innerHTML = body;
          modal.classList.add("open");
          $("#closeModal").focus();
        }
        function closeModal() {
          modal.classList.remove("open");
          lastTrigger?.focus();
        }
        $$("[data-modal]").forEach((b) => (b.onclick = () => openModal(b.dataset.modal, b)));
        $("#closeModal").onclick = closeModal;
        modal.addEventListener("click", (e) => {
          if (e.target === modal) closeModal();
        });
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            if (modal.classList.contains("open")) closeModal();
            else if (editor.classList.contains("open")) toggleEditor(false);
          }
          if (e.key === "Tab" && modal.classList.contains("open")) {
            const focusable = $$("#detailModal button,#detailModal a");
            if (!focusable.length) return;
            const first = focusable[0],
              last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        });
        function escapeHtml(s) {
          return String(s).replace(
            /[&<>"']/g,
            (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
          );
        }
        const wishList = $("#wishList");
        $("#addWish").onclick = () => {
          const text = $("#wishText").value.trim();
          if (!text) return $("#wishText").focus();
          const div = document.createElement("div");
          div.className = "wish-item";
          div.textContent = "✿ " + text;
          wishList.prepend(div);
          $("#wishText").value = "";
        };
        function toggleAttending() {
          const v = $('input[name="attendance"]:checked')?.value;
          $("#attendingFields").classList.toggle("hidden", v === "no");
        }
        $$('input[name="attendance"]').forEach((i) => (i.onchange = toggleAttending));
        $("#rsvpForm").addEventListener("submit", (e) => {
          e.preventDefault();
          const name = $("#guestName").value.trim(),
            attendance = $('input[name="attendance"]:checked')?.value;
          if (!name || !attendance) return;
          $("#rsvpConfirm").classList.remove("hidden");
          $("#rsvpConfirm").textContent =
            attendance === "yes"
              ? `Thank you, ${name}! Your preview reply says you'll be joining us. We can't wait to celebrate together. ✿`
              : `Thank you, ${name}. Your love and good wishes mean so much. ✿`;
          $("#rsvpConfirm").scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
        $("#calendarButton").onclick = () => {
          const clean = (s) => String(s).replace(/[\\;,\n]/g, " ");
          const dt = (d, t) => d.replaceAll("-", "") + "T" + t.replace(":", "") + "00";
          const ics = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//VraxisRSVP//Little Garden//EN",
            "BEGIN:VEVENT",
            "UID:little-garden-007@vraxisrsvp",
            "DTSTAMP:20261112T000000Z",
            "DTSTART:" + dt(data.date, data.time),
            "DTEND:" + dt(data.date, data.end),
            "SUMMARY:" + clean("Baby shower for " + data.parents),
            "LOCATION:" + clean(data.venue + ", " + data.address),
            "DESCRIPTION:Please join us for a baby shower.",
            "END:VEVENT",
            "END:VCALENDAR",
          ].join("\r\n");
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
          a.download = "little-garden-baby-shower.ics";
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        };
        if ("IntersectionObserver" in window) {
          const io = new IntersectionObserver(
            (entries) =>
              entries.forEach((e) => {                if (e.isIntersecting) {
                  e.target.classList.add("visible");
                  io.unobserve(e.target);
                }
              }),
            { threshold: 0.12 },
          );
          $$(".reveal").forEach((el) => io.observe(el));
        } else $$(".reveal").forEach((el) => el.classList.add("visible"));
        const discoveries = new Set();
        $$(".garden-object").forEach((button) =>
          button.addEventListener("click", () => {
            discoveries.add(button.dataset.modal);
            button.classList.add("discovered");
            $("#gardenProgress").textContent =
              discoveries.size + " of 4 garden treasures discovered";
            $("#discoveryFill").style.width = (discoveries.size / 4) * 100 + "%";
            if (discoveries.size === 4)
              $("#gardenProgress").textContent =
                "All four treasures discovered — the garden is yours! ✿";
          }),
        );
        $("#plantSeed").addEventListener("click", () => {
          const flower = $("#seedPlant");
          flower.classList.remove("grown");
          void flower.offsetWidth;
          flower.classList.add("grown");
          $("#seedStatus").textContent =
            "A little wish is growing. May this baby be surrounded by love, always.";
          $("#plantSeed").textContent = "Plant another wish ↻";
        });
      })();
    