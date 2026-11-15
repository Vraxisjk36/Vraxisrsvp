
      (() => {
        "use strict";
        const $ = (id) => document.getElementById(id);
        const defaults = {
          parents: "Mia & Jordan",
          date: "Sunday, 21 March 2027",
          dateShort: "21 MARCH 2027",
          time: "2:00 PM — 5:00 PM",
          venue: "The Glasshouse",
          location: "Potchefstroom, South Africa",
          dress:
            "Wear whatever makes you feel wonderful. Bring your best guess and your biggest smile.",
          story:
            "We have been keeping the sweetest little secret, and our hearts are bursting to share it with the people we love. Before we meet our little one, we want one afternoon full of laughter, guesses, happy tears and you.",
          caption1: "The beginning ♡",
          caption2: "Our favourite days",
          caption3: "And now, this chapter",
          babyLetter:
            "You are already loved beyond words. One day we’ll tell you about the people who gathered to celebrate you before we even knew your name.",
        };
        const fields = [
          ["parents", "Parents’ names"],
          ["date", "Event date (full)"],
          ["dateShort", "Event date (short)"],
          ["time", "Event time"],
          ["venue", "Venue"],
          ["location", "Location / address"],
          ["dress", "Dress note"],
          ["story", "A note from the parents", "textarea"],
          ["caption1", "Photo one caption"],
          ["caption2", "Photo two caption"],
          ["caption3", "Photo three caption"],
          ["babyLetter", "A letter to your baby", "textarea"],
        ];
        const state = { ...defaults };
        const mappings = {
          parents: ["parentNamesHero", "parentNamesStory", "revealParents", "footerParents"],
          date: ["eventDate"],
          dateShort: ["heroDate"],
          time: ["eventTime"],
          venue: ["eventVenue"],
          location: ["eventLocation"],
          dress: ["dressCode"],
          story: ["storyText"],
          caption1: ["caption1"],
          caption2: ["caption2"],
          caption3: ["caption3"],
          babyLetter: ["babyLetter"],
        };
        function render() {
          for (const [key, ids] of Object.entries(mappings))
            ids.forEach((id) => ($(id).textContent = state[key]));
          $("letterParents").textContent = state.parents;
          $("mapLink").href =
            "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(state.venue + " " + state.location);
        }
        const container = $("textFields");
        fields.forEach(([key, label, type]) => {
          const wrap = document.createElement("div");
          wrap.className = "field";
          const l = document.createElement("label");
          l.textContent = label;
          l.htmlFor = "edit-" + key;
          const inp = document.createElement(type === "textarea" ? "textarea" : "input");
          inp.id = "edit-" + key;
          inp.value = state[key];
          inp.addEventListener("input", () => {
            state[key] = inp.value;
            render();
          });
          wrap.append(l, inp);
          container.append(wrap);
        });
        render();
        const originalPhotos = {};
        const photoSpecs = [
          ["heroImg", "Cover / hero portrait"],
          ["storyImg", "Parents’ story photograph"],
          ["gallery1", "Photo album — first"],
          ["gallery2", "Photo album — second"],
          ["gallery3", "Photo album — third"],
        ];
        photoSpecs.forEach(([id, label]) => {
          originalPhotos[id] = $(id).src;
          const wrap = document.createElement("div");
          wrap.className = "photo-edit";
          const l = document.createElement("label");
          l.textContent = label;
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.setAttribute("aria-label", label);
          input.addEventListener("change", async () => {
            const file = input.files?.[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) {
              notify("Please choose an image file.");
              return;
            }
            if (file.size > 20 * 1024 * 1024) {
              notify("Please choose an image under 20 MB.");
              return;
            }
            try {
              const bitmap = await createImageBitmap(file);
              const max = 1400;
              const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
              const c = document.createElement("canvas");
              c.width = Math.max(1, Math.round(bitmap.width * scale));
              c.height = Math.max(1, Math.round(bitmap.height * scale));
              c.getContext("2d").drawImage(bitmap, 0, 0, c.width, c.height);
              $(id).src = c.toDataURL("image/jpeg", 0.85);
              bitmap.close();
              notify("Photo added to your preview ✓");
            } catch (e) {
              const reader = new FileReader();
              reader.onload = () => {
                $(id).src = reader.result;
                notify("Photo added to your preview ✓");
              };
              reader.readAsDataURL(file);
            }
          });
          wrap.append(l, input);
          $("photoFields").append(wrap);
        });
        $("resetPhotos").onclick = () => {
          Object.entries(originalPhotos).forEach(([id, src]) => ($(id).src = src));
          document.querySelectorAll(".photo-edit input").forEach((i) => (i.value = ""));
          notify("Sample photos restored");
        };
        const open = () => {
          $("drawer").classList.add("open");
          $("drawerBack").classList.add("open");
          $("drawer").setAttribute("aria-hidden", "false");
        };
        const close = () => {
          $("drawer").classList.remove("open");
          $("drawerBack").classList.remove("open");
          $("drawer").setAttribute("aria-hidden", "true");
        };
        $("openEdit").onclick = open;
        $("closeEdit").onclick = close;
        $("drawerBack").onclick = close;
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") close();
        });
        let noticeTimer;
        function notify(msg) {
          const t = $("toast");
          t.textContent = msg;
          t.classList.add("show");
          clearTimeout(noticeTimer);
          noticeTimer = setTimeout(() => t.classList.remove("show"), 3500);
        }
        let guess = "";
        document.querySelectorAll("[data-guess]").forEach((b) =>
          b.addEventListener("click", () => {
            guess = b.dataset.guess;
            document
              .querySelectorAll("[data-guess]")
              .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
            $("predictionTitle").textContent = "Team " + guess + (guess === "Girl" ? " ✿" : " ✦");
            $("predictionDesc").textContent =
              "Your prediction is in! " +
              state.parents +
              " will love seeing everyone’s guesses. The actual surprise stays secret until the celebration.";
            $("predictionResult").classList.add("show");
            $("predictionResult").scrollIntoView({ behavior: "smooth", block: "nearest" });
          }),
        );
        $("savePrediction").onclick = () => {
          if (!guess) return;
          const c = document.createElement("canvas");
          c.width = 1080;
          c.height = 1350;
          const ctx = c.getContext("2d");
          ctx.fillStyle = guess === "Girl" ? "#eea6a0" : "#a3c9d5";
          ctx.fillRect(0, 0, 1080, 1350);
          ctx.strokeStyle = "#292b27";
          ctx.lineWidth = 14;
          ctx.strokeRect(45, 45, 990, 1260);
          ctx.fillStyle = "#292b27";
          ctx.textAlign = "center";
          ctx.font = "bold 34px sans-serif";
          ctx.fillText("THE BIG LITTLE SECRET", 540, 195);
          ctx.font = "bold 105px Georgia,serif";
          ctx.fillText("Team " + guess, 540, 640);
          ctx.font = "35px sans-serif";
          ctx.fillText("My little hunch ✳", 540, 750);
          ctx.font = "32px sans-serif";
          ctx.fillText("The big reveal is still a secret!", 540, 1030);
          const a = document.createElement("a");
          a.href = c.toDataURL("image/png");
          a.download = "my-little-prediction.png";
          a.click();
          notify("Prediction card saved!");
        };
        $("attendance").onchange = () => {
          $("guestCountField").hidden = $("attendance").value !== "yes";
        };
        $("rsvpForm").onsubmit = (e) => {
          e.preventDefault();
          $("rsvpConfirmTitle").textContent = "Thank you, " + $("guestName").value.trim() + " ♡";
          $("rsvpConfirmText").textContent =
            $("attendance").value === "yes"
              ? "We can’t wait to celebrate together! This is a preview, so your RSVP has not been sent."
              : "Sending love means so much. This is a preview, so your RSVP has not been sent.";
          $("rsvpConfirm").classList.add("show");
          $("rsvpConfirm").scrollIntoView({ behavior: "smooth", block: "nearest" });
        };
        $("calendarBtn").onclick = () => {
          const d = new Date(state.date.replace(/^[A-Za-z]+,\s*/, ""));
          if (Number.isNaN(d.getTime())) {
            notify("Enter a valid date in Personalise to create the calendar event.");
            return;
          }
          const y = d.getFullYear(),
            m = String(d.getMonth() + 1).padStart(2, "0"),
            day = String(d.getDate()).padStart(2, "0");
          const stamp = `${y}${m}${day}`;
          const safe = (s) => s.replace(/[\\;,\n]/g, " ");
          const ics = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//VraxisRSVP//The Big Little Secret//EN",
            "BEGIN:VEVENT",
            "UID:" + Date.now() + "@vraxisrsvp",
            "DTSTART;VALUE=DATE:" + stamp,
            "DTEND;VALUE=DATE:" +
              (() => {
                const x = new Date(y, d.getMonth(), d.getDate() + 1);
                return (
                  x.getFullYear() +
                  String(x.getMonth() + 1).padStart(2, "0") +
                  String(x.getDate()).padStart(2, "0")
                );
              })(),
            "SUMMARY:" + safe("Baby reveal celebration for " + state.parents),
            "LOCATION:" + safe(state.venue + " " + state.location),
            "DESCRIPTION:" + safe("Time: " + state.time),
            "END:VEVENT",
            "END:VCALENDAR",
          ].join("\r\n");
          const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
          const a = document.createElement("a");
          a.href = url;
          a.download = "little-secret-celebration.ics";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        };
        $("copyLetter").onclick = () => {
          const note = state.babyLetter + " — " + state.parents;
          if (navigator.clipboard?.writeText) {
            navigator.clipboard
              .writeText(note)
              .then(() => notify("Little letter copied ♡"))
              .catch(() => notify("Copy is unavailable in this browser"));
          } else notify("Copy is unavailable in this browser");
        };
        const lb = $("photoLightbox");
        document.querySelectorAll(".photo-grid figure").forEach((fig) => {
          fig.tabIndex = 0;
          fig.setAttribute("role", "button");
          fig.setAttribute("aria-label", "Open " + fig.querySelector("figcaption").textContent);
          const show = () => {
            $("lightboxImage").src = fig.querySelector("img").src;
            $("lightboxCaption").textContent = fig.querySelector("figcaption").textContent;
            lb.classList.add("open");
            $("closeLightbox").focus();
          };
          fig.addEventListener("click", show);
          fig.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              show();
            }
          });
        });
        $("closeLightbox").onclick = () => lb.classList.remove("open");
        lb.addEventListener("click", (e) => {
          if (e.target === lb) lb.classList.remove("open");
        });
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") lb.classList.remove("open");
        });
        if ("IntersectionObserver" in window) {
          const obs = new IntersectionObserver(
            (entries) =>
              entries.forEach((e) => {
                if (e.isIntersecting) {
                  e.target.classList.add("visible");
                  obs.unobserve(e.target);
                }
              }),
            { threshold: 0.1 },
          );
          document.querySelectorAll(".reveal-on-scroll").forEach((e) => obs.observe(e));
        } else
          document.querySelectorAll(".reveal-on-scroll").forEach((e) => e.classList.add("visible"));
      })();
    