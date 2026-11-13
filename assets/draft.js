/* One independent browser workspace per invitation. UUIDs persist in page URLs. */
(function () {
  const q = new URLSearchParams(location.search);
  const project = /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(q.get("project") || "")
    ? q.get("project")
    : null;
  let draft = q.get("draft");
  if (!/^[0-9a-f-]{36}$/i.test(draft || "")) draft = project || crypto.randomUUID();
  if (q.get("draft") !== draft) {
    q.set("draft", draft);
    history.replaceState(null, "", location.pathname + "?" + q.toString());
  }
  const prefix = "vraxis_draft_" + draft + "_";
  const read = (name, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(prefix + name) || "null") ?? fallback;
    } catch {
      return fallback;
    }
  };
  const write = (name, value) => localStorage.setItem(prefix + name, JSON.stringify(value));
  window.vraxisDraft = {
    id: draft,
    project,
    read,
    write,
    url: (page, extra = {}) => {
      const params = new URLSearchParams({
        template: q.get("template") || "001",
        draft,
        ...(project ? { project } : {}),
        ...extra,
      });
      return page + "?" + params.toString();
    },
  };
})();
