
      const $ = (s) => document.querySelector(s),
        $$ = (s) => document.querySelectorAll(s);
      const state = {
        bride: "Mia",
        date: "2027-03-21",
        time: "12:00",
        venue: "The Sunday Table",
        address: "Potchefstroom, South Africa",
        dress: "Something sunny",
      };
      let active = 0;
      const cards = [
        () => ({
          k: "01 / THE BRIDE",
          title: `The ${state.bride} Recipe`,
          body: `Ingredients:\n1 generous heart\nA ridiculous amount of laughter\nA pinch of mischief\nA lifetime of unforgettable memories\n\nMethod: Bring together everyone who loves ${state.bride}. Stir in good food and celebrate generously.`,
        }),
        () => ({
          k: "02 / THE MAIN EVENT",
          title: "A Kitchen Tea, Made with Love",
          body: `For: ${state.bride}\nDate: ${formatDate()} at ${formatTime()}\nWhere: ${state.venue}\n\nMethod: Arrive with an appetite, your favourite stories and a little something sweet to share.`,
        }),
        () => ({
          k: "03 / THE SECRET INGREDIENT",
          title: "A Beautiful Marriage",
          body: "Ingredients:\nTwo people who choose each other\nA generous helping of patience\nPlenty of laughter\nA lifetime of tiny adventures\n\nMethod: Mix with love. Keep making memories.",
        }),
        () => ({
          k: "04 / FROM THE GIRLS",
          title: "A Note Just for You",
          body: $("#editLetter").value,
        }),
      ];
      function formatDate() {
        const [y, m, d] = state.date.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("en-ZA", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
      function formatTime() {
        const [h, m] = state.time.split(":").map(Number);
        return new Date(2027, 0, 1, h, m).toLocaleTimeString("en-ZA", {
          hour: "numeric",
          minute: "2-digit",
        });
      }
      function renderCard() {
        const c = cards[active]();
        const area = $("#cardArea");
        area.replaceChildren();
        const el = document.createElement("article");
        el.className = "recipe-card";
        const k = document.createElement("div");
        k.className = "tiny";
        k.textContent = c.k;
        const h = document.createElement("h3");
        h.textContent = c.title;
        const rule = document.createElement("div");
        rule.className = "rule";
        const p = document.createElement("p");
        p.textContent = c.body;
        el.append(k, h, rule, p);
        area.append(el);
        $$("[data-card]").forEach((b) => {
          const selected = Number(b.dataset.card) === active;
          b.classList.toggle("active", selected);
          b.setAttribute("aria-pressed", String(selected));
        });
      }
      function chooseCard(n) {
        active = n;
        $("#tinBox").classList.add("open");
        renderCard();
      }
      $$("[data-card]").forEach((b) =>
        b.addEventListener("click", () => chooseCard(Number(b.dataset.card))),
      );
      $("#nextCard").addEventListener("click", () => chooseCard((active + 1) % cards.length));
      renderCard();
      function toast(message) {
        const el = $("#toast");
        el.textContent = message;
        el.classList.add("show");
        clearTimeout(window.toastTimer);
        window.toastTimer = setTimeout(() => el.classList.remove("show"), 3300);
      }
      function openDrawer(open) {
        $("#drawer").classList.toggle("show", open);
        $("#drawerBack").classList.toggle("show", open);
      }
      $("#editOpen").onclick = () => openDrawer(true);
      $("#editClose").onclick =
        $("#doneEdit").onclick =
        $("#drawerBack").onclick =
          () => openDrawer(false);
      function sync() {
        state.bride = $("#editBride").value.trim() || "the bride";
        state.date = $("#editDate").value || "2027-03-21";
        state.time = $("#editTime").value || "12:00";
        state.venue = $("#editVenue").value.trim() || "Venue to be announced";
        state.address = $("#editAddress").value.trim();
        state.dress = $("#editDress").value.trim();
        $$('[data-text="bride"]').forEach((e) => (e.textContent = state.bride));
        $("#letterText").textContent = $("#editLetter").value;
        $("#dateView").textContent = formatDate();
        $("#timeView").textContent = formatTime();
        $("#venueView").textContent = state.venue;
        $("#addressView").textContent = state.address;
        $("#dressView").textContent = state.dress;
        $("#directions").href =
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent(state.address || state.venue);
        renderCard();
      }
      [
        "editBride",
        "editLetter",
        "editDate",
        "editTime",
        "editVenue",
        "editAddress",
        "editDress",
      ].forEach((id) => $("#" + id).addEventListener("input", sync));
      ["hero", "friends"].forEach((name) =>
        $("#edit" + name[0].toUpperCase() + name.slice(1)).addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (!file) return;
          if (!file.type.startsWith("image/")) return toast("Please choose an image file.");
          const img = $(`[data-photo="${name}"]`);
          if (img.dataset.objectUrl) URL.revokeObjectURL(img.dataset.objectUrl);
          const url = URL.createObjectURL(file);
          img.src = url;
          img.dataset.objectUrl = url;
          toast("Photo updated in this preview.");
        }),
      );
      $("#recipeForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const note = document.createElement("div");
        note.className = "guest-note";
        note.textContent = "“" + $("#contribution").value.trim() + "”";
        const author = document.createElement("small");
        author.textContent = "— " + $("#contributor").value.trim() + " · " + $("#kind").value;
        note.append(author);
        $("#contributions").prepend(note);
        e.target.reset();
        toast("Added to this preview recipe box ♡");
      });
      $("#attendance").addEventListener(
        "change",
        () => ($("#attendingFields").hidden = $("#attendance").value === "no"),
      );
      $("#rsvpForm").addEventListener("submit", (e) => {
        e.preventDefault();
        toast(
          $("#attendance").value === "yes"
            ? "Your seat is reserved in this demo ♡"
            : "Your love has been noted in this demo ♡",
        );
        e.target.reset();
        $("#attendingFields").hidden = false;
      });
      $("#calendar").addEventListener("click", () => {
        const dt = state.date.replaceAll("-", "");
        const tm = state.time.replace(":", "");
        const start = dt + "T" + tm + "00";
        const endH = (Number(state.time.slice(0, 2)) + 3) % 24;
        const end = dt + "T" + String(endH).padStart(2, "0") + state.time.slice(3) + "00";
        const esc = (s) =>
          String(s)
            .replaceAll("\\", "\\\\")
            .replaceAll(",", "\\,")
            .replaceAll(";", "\\;")
            .replaceAll("\n", "\\n");
        const ics = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//VraxisRSVP//Something Sweet//EN",
          "BEGIN:VEVENT",
          "UID:something-sweet-" + Date.now() + "@vraxisrsvp",
          "DTSTAMP:" +
            new Date()
              .toISOString()
              .replace(/[-:]/g, "")
              .replace(/\.\d{3}/, ""),
          "DTSTART:" + start,
          "DTEND:" + end,
          "SUMMARY:" + esc(state.bride + "'s Kitchen Tea"),
          "LOCATION:" + esc(state.venue + ", " + state.address),
          "DESCRIPTION:Come for the tea. Stay for the memories.",
          "END:VEVENT",
          "END:VCALENDAR",
        ].join("\r\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
        a.download = "something-sweet-kitchen-tea.ics";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 3000);
      });
      sync();
    