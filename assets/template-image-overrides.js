/* VraxisRSVP public template image replacements, including nested srcdoc previews. */
(() => {
  "use strict";
  if (window.__vraxisTemplateImagesLoaded) return;
  window.__vraxisTemplateImagesLoaded = true;
  // Load optional file-based defaults even when the owner-media API is unavailable.
  const local = document.createElement("script");
  local.src = "assets/local-template-media.js";
  local.defer = true;
  document.head.append(local);
  const id = (location.pathname.match(/preview-(\d{3})\.html$/) || [])[1];
  if (!id) return;
  const endpoint =
    "https://ogmlfnmdhmrbbmxnxwqw.supabase.co/rest/v1/template_image_overrides?template_id=eq." +
    encodeURIComponent(id) +
    "&select=slot,image_url,fit_mode,zoom,pos_x,pos_y";
  const headers = { apikey: "sb_publishable_K8hadrdvJiqCRB3eXs9tHg_0kUXl9Ry" };
  fetch(endpoint, { headers, cache: "no-store" })
    .then((r) => {
      if (!r.ok) throw Error("Image settings unavailable (" + r.status + ")");
      return r.json();
    })
    .then((rows) => {
      const curated = window.VRAXIS_CURATED_MEDIA?.[id];
      const curatedHeroIds = new Set([
        "003",
        "005",
        "006",
        "007",
        "009",
        "010",
        "011",
        "012",
        "013",
      ]);
      const map = new Map(rows.map((row) => [row.slot, row]));
      const watched = new WeakSet();
      function apply(doc) {
        if (!doc?.body) return;
        // The Grand Affair's animated palace is CSS artwork, not an <img>.
        // Keep both opening-door halves and the legacy entrance background editable.
        const entrance = map.get("palace-entrance");
        if (id === "002" && entrance?.image_url) {
          let style = doc.getElementById("vraxis-palace-image-override");
          if (!style) {
            style = doc.createElement("style");
            style.id = "vraxis-palace-image-override";
            (doc.head || doc.documentElement).append(style);
          }
          const safe = entrance.image_url.replace(/["\\\n\r]/g, "");
          style.textContent =
            '.gateway-door{background-image:url("' +
            safe +
            '")!important}.palace:before{background-image:url("' +
            safe +
            '")!important}';
        }
        const imgs = [...doc.querySelectorAll("img")];
        imgs.forEach((img, i) => {
          const slot = img.dataset.photo || img.dataset.img || "image-" + (i + 1);
          const setting = map.get(slot);
          const fallback =
            curatedHeroIds.has(id) && i === 0 && !location.search && curated?.photo
              ? curated.photo
              : null;
          const url = setting?.image_url || fallback;
          if (!url) return;
          const current = img.getAttribute("src") || "";
          // Source templates often embed default photographs as base64 data URLs; these must be replaceable. Blob URLs represent active local edits.
          if (/^blob:/i.test(current)) return;
          // Customer-specific photos use signed private storage URLs.
          if (current.includes("/storage/v1/object/sign/")) return;
          if (img.dataset.vraxisOverride !== url) {
            const previous = img.src;
            img.onerror = () => {
              img.onerror = null;
              img.src = previous;
            };
            img.src = url;
            img.dataset.vraxisOverride = url;
          }
          if (!setting) return;
          const mode = setting.fit_mode || "cover";
          img.style.objectFit = mode === "contain" ? "contain" : "cover";
          img.style.objectPosition = (setting.pos_x ?? 50) + "% " + (setting.pos_y ?? 50) + "%";
          if (mode === "manual" && Number(setting.zoom) > 1) {
            img.style.transform = "scale(" + Math.min(4, Number(setting.zoom)) + ")";
            img.style.transformOrigin = (setting.pos_x ?? 50) + "% " + (setting.pos_y ?? 50) + "%";
          }
        });
      }
      function watch(doc) {
        if (!doc?.body || watched.has(doc)) return;
        watched.add(doc);
        apply(doc);
        doc.querySelectorAll("iframe").forEach(attach);
        const observer = new MutationObserver(() => {
          apply(doc);
          doc.querySelectorAll("iframe").forEach(attach);
        });
        observer.observe(doc.documentElement, { childList: true, subtree: true });
      }
      function attach(frame) {
        if (frame.dataset.vraxisPhotoAttached) return;
        frame.dataset.vraxisPhotoAttached = "1";
        const scan = () => {
          try {
            watch(frame.contentDocument);
          } catch (e) {
            console.warn("Template frame unavailable:", e.message);
          }
        };
        frame.addEventListener("load", scan);
        scan();
      }
      watch(document);
    })
    .catch((e) => console.warn("Template image replacements:", e.message));
})();
