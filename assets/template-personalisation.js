// Shared semantic bindings for previews without native editor controls.
window.vraxisApplyTemplateProfile = function (doc, id, profile) {
  const filled = value => typeof value === 'string' && value.trim();
  const set = (selector, value) => {
    if (filled(value)) doc.querySelectorAll(selector).forEach(el => { el.textContent = value; });
  };
  if (id === '014') {
    for (const [field, key] of Object.entries({bride:'names',date:'date',city:'address',venue:'venue',tribute:'message',message:'message'})) set('[data-bind="'+field+'"]', profile[key]);
  }
  if (id === '011') set('h1', profile.names);
  if (id === '020' && !doc.getElementById('vraxis-narrow-layout')) {
    const style = doc.createElement('style');
    style.id = 'vraxis-narrow-layout';
    style.textContent = '@media(max-width:400px){.skyline{overflow:hidden;max-width:100%}.cover-copy,.hero-art,.mission-card,.mission-card .copy,.rsvp-wrap>*{min-width:0;max-width:100%}.cover-inner,.story-grid,.rsvp-wrap,.mission-grid{grid-template-columns:minmax(0,1fr)}.mission-card{grid-template-columns:80px minmax(0,1fr)}.schedule-row{grid-template-columns:80px minmax(0,1fr)}.cover-copy h2{font-size:clamp(40px,16vw,64px);overflow-wrap:anywhere}.hero-art{overflow:hidden}body{overflow-x:clip}}';
    doc.head.append(style);
  }
  const defaults = {
    '011': {'The Garden House':'venue','Stellenbosch, South Africa':'address','Sunday, 22 November 2026':'date','12:00 in the afternoon':'time'},
    '016': {'Amelia':'first','Ethan':'second','The Glasshouse':'venue','Garden Estate':'address','SATURDAY · 18 SEPTEMBER 2027':'date'},
    '017': {'Amelia':'first','Julian':'second','The Glasshouse Gardens':'venue','The Glasshouse':'venue','Saturday · 21 November · 2027':'date'},
    '018': {'Amara':'first','Elijah':'second','The Garden Terrace':'venue','Saturday · 18 September 2027':'date','18 September 2027':'date'},
    '019': {'Leo':'names','Fairground Pavilion':'venue','17 JULY 2027':'date','Saturday, 17 July 2027':'date','Saturday · 17 July · 2027':'date'},
    '020': {'Ethan':'names','Hero Headquarters':'venue','Saturday, 17 July 2027':'date'}
  }[id];
  if (!defaults) return;
  const escape = value => Array.from(value, char => '^$.*+?()[]{}|'.includes(char) || char.charCodeAt(0) === 92 ? String.fromCharCode(92) + char : char).join('');
  const entries = Object.entries(defaults).filter(([,key]) => filled(profile[key]));
  if (!entries.length) return;
  const keys = Object.fromEntries(entries.map(([text,key]) => [text.toLowerCase(), key]));
  const pattern = new RegExp(entries.map(([text]) => escape(text)).join('|'), 'gi');
  const walker = doc.createTreeWalker(doc.body, 4);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    if (node.parentElement.closest('script,style,textarea,input,[contenteditable]')) continue;
    node.textContent = node.textContent.replace(pattern, match => profile[keys[match.toLowerCase()]]);
  }
};
