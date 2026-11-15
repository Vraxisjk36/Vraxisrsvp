
      (() => {
        "use strict";
        const $ = (id) => document.getElementById(id);
        const all = (s) => Array.from(document.querySelectorAll(s));
        const defaultHero = $("heroPhoto").src;
        const defaults = {
          edName: "Sofia",
          edAge: "25",
          edDate: "2026-11-14",
          edTime: "18:30",
          edVenue: "The Glasshouse",
          edCity: "Johannesburg",
          edDress: "Cocktail chic. A touch of cherry red.",
          edIntro: $("edIntro").value,
          edHero: "",
        };
        let dateObj = new Date("2026-11-14T18:30:00");
        function formatDate(s) {
          const d = new Date(s + "T12:00:00");
          return isNaN(d)
            ? "Date to be announced"
            : new Intl.DateTimeFormat("en-ZA", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(d);
        }
        function update() {
          const name = $("edName").value.trim() || "Your Name",
            age = $("edAge").value || "25",
            date = $("edDate").value,
            time = $("edTime").value,
            venue = $("edVenue").value.trim() || "Venue to be announced",
            city = $("edCity").value.trim() || "Location to be announced";
          $("heroName").innerHTML = "";
          $("heroName").append(document.createTextNode(name));
          const span = document.createElement("span");
          span.textContent = "turns " + (Number(age) === 25 ? "twenty five." : age + ".");
          $("heroName").append(span);
          $("ageBig").textContent = age;
          $("cardAge").textContent = age;
          $("cardName").textContent = name + "'s birthday dinner";
          $("eventDateLabel").textContent = formatDate(date);
          $("eventTimeLabel").textContent = (time || "18:30") + " until late";
          $("eventVenueLabel").textContent = venue + " · " + city;
          $("footerName").textContent = name;
          $("dressText").textContent = $("edDress").value;
          $("introText").textContent = $("edIntro").value;
          $("directions").href =
            "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(venue + " " + city);
          const hero = $("edHero").value.trim();
          $("heroPhoto").src = /^https:\/\//i.test(hero) ? hero : defaultHero;
          if (date) {
            const deadline = new Date(date + "T12:00:00");
            deadline.setDate(deadline.getDate() - 7);
            $("deadline").textContent = new Intl.DateTimeFormat("en-ZA", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(deadline);
          }
          dateObj = new Date((date || "2026-11-14") + "T" + (time || "18:30") + ":00");
        }
        Object.keys(defaults).forEach((id) => $(id).addEventListener("input", update));
        $("resetEditor").onclick = () => {
          Object.entries(defaults).forEach(([id, value]) => ($(id).value = value));
          update();
        };
        function toggleEditor(show) {
          $("editor").classList.toggle("hidden", !show);
          $("editToggle").setAttribute("aria-expanded", String(show));
        }
        $("editToggle").onclick = () => toggleEditor($("editor").classList.contains("hidden"));
        $("editClose").onclick = () => toggleEditor(false);
        $("calendar").onclick = () => {
          const start = dateObj;
          const end = new Date(start.getTime() + 4 * 3600000);
          const fmt = (d) =>
            d
              .toISOString()
              .replace(/[-:]/g, "")
              .replace(/\.\d{3}/, "");
          const data = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//VraxisRSVP//SocialEdit//EN",
            "BEGIN:VEVENT",
            "UID:" + Date.now() + "@vraxisrsvp.local",
            "DTSTAMP:" + fmt(new Date()),
            "DTSTART:" + fmt(start),
            "DTEND:" + fmt(end),
            "SUMMARY:" + ($("edName").value || "Birthday") + " Birthday Celebration",
            "LOCATION:" +
              [$("edVenue").value, $("edCity").value].join(", ").replace(/[,;\\]/g, " "),
            "DESCRIPTION:You are invited!",
            "END:VEVENT",
            "END:VCALENDAR",
          ].join("\r\n");
          const url = URL.createObjectURL(new Blob([data], { type: "text/calendar" }));
          const a = document.createElement("a");
          a.href = url;
          a.download = "birthday-invitation.ics";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        };
        all('input[name="attendance"]').forEach((r) =>
          r.addEventListener("change", () => {
            $("attendingFields").classList.toggle(
              "hidden",
              document.querySelector('input[name="attendance"]:checked')?.value !== "yes",
            );
          }),
        );
        $("rsvpForm").addEventListener("submit", (e) => {
          e.preventDefault();
          const selected = document.querySelector('input[name="attendance"]:checked');
          if (!selected) return;
          const who = $("guestName").value.trim();
          $("rsvpStatus").textContent =
            selected.value === "yes"
              ? `Preview: ${who}, you're on the guest list (${$("guestCount").value} guest${$("guestCount").value === "1" ? "" : "s"}). This has not been submitted to the host.`
              : `Preview: Thank you, ${who}. Your decline has not been submitted to the host.`;
          $("rsvpStatus").classList.remove("hidden");
        });
        const photos = all(".gallery button img").map((img) => ({ src: img.src, alt: img.alt }));
        let current = 0;
        function showPhoto(n) {
          current = (n + photos.length) % photos.length;
          $("lbImg").src = photos[current].src;
          $("lbImg").alt = photos[current].alt;
          $("lbCount").textContent =
            String(current + 1).padStart(2, "0") + " / " + String(photos.length).padStart(2, "0");
          $("lightbox").classList.remove("hidden");
          document.body.style.overflow = "hidden";
        }
        function closePhoto() {
          $("lightbox").classList.add("hidden");
          document.body.style.overflow = "";
        }
        all(".gallery button").forEach((b, i) => (b.onclick = () => showPhoto(i)));
        $("lbClose").onclick = closePhoto;
        $("lbPrev").onclick = () => showPhoto(current - 1);
        $("lbNext").onclick = () => showPhoto(current + 1);
        $("lightbox").addEventListener("click", (e) => {
          if (e.target === $("lightbox")) closePhoto();
        });
        let x = 0;
        $("lightbox").addEventListener(
          "touchstart",
          (e) => {
            x = e.touches[0].clientX;
          },
          { passive: true },
        );
        $("lightbox").addEventListener(
          "touchend",
          (e) => {
            const delta = e.changedTouches[0].clientX - x;
            if (Math.abs(delta) > 50) showPhoto(current + (delta < 0 ? 1 : -1));
          },
          { passive: true },
        );
        document.addEventListener("keydown", (e) => {
          if (!$("lightbox").classList.contains("hidden")) {
            if (e.key === "Escape") closePhoto();
            if (e.key === "ArrowRight") showPhoto(current + 1);
            if (e.key === "ArrowLeft") showPhoto(current - 1);
          } else if (e.key === "Escape") toggleEditor(false);
        });
        if ("IntersectionObserver" in window) {
          const observer = new IntersectionObserver(
            (entries) =>
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add("in");
                  observer.unobserve(entry.target);
                }
              }),
            { threshold: 0.1 },
          );
          all(".reveal").forEach((el) => observer.observe(el));
        } else all(".reveal").forEach((el) => el.classList.add("in"));
        update();
      })();
    