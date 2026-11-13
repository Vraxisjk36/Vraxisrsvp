/* Shared lightweight account navigation. Safe on all VraxisRSVP pages. */
(()=>{if(document.getElementById('vraxis-global-menu'))return;
const css=document.createElement('style');css.textContent=`
#vraxis-global-menu{position:relative;z-index:1001;display:inline-block;margin-left:10px;font:500 13px Arial,sans-serif;color:#203329}
#vraxis-global-menu summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;min-height:44px;padding:11px 13px;background:#f7f3ec;border:1px solid #d3d0c8;color:#203329;white-space:nowrap}
#vraxis-global-menu summary::-webkit-details-marker{display:none}
#vraxis-global-menu .vm-panel{position:absolute;right:0;top:calc(100% + 8px);width:226px;background:#f7f3ec;border:1px solid #d3d0c8;box-shadow:0 12px 32px #1118;padding:7px;z-index:1005;text-align:left}
#vraxis-global-menu a{display:block;padding:12px 11px;color:#203329!important;text-decoration:none!important;border-radius:2px;font:500 13px Arial,sans-serif}
#vraxis-global-menu a:hover,#vraxis-global-menu a:focus-visible{background:#e8e5de}
@media(max-width:590px){#vraxis-global-menu summary span{display:none}#vraxis-global-menu{margin-left:4px}#vraxis-global-menu summary{min-width:44px;padding:9px}}
`;document.head.append(css);
const menu=document.createElement('details');menu.id='vraxis-global-menu';
menu.innerHTML='<summary aria-label="Open navigation" title="Menu">☰ <span>Menu</span></summary><div class="vm-panel"><a href="dashboard.html">My dashboard</a><a href="choose.html">Create invitation</a><a href="catalogue.html">Explore collection</a><a href="about.html">About us</a><a href="journal.html">Journal</a><a href="account.html">Sign in / Account</a></div>';
const header=document.querySelector('body > header')||document.querySelector('header');
if(header){header.append(menu)}else{menu.style.position='fixed';menu.style.top='12px';menu.style.right='12px';document.body.append(menu)}
document.addEventListener('click',e=>{if(!menu.contains(e.target))menu.open=false});
document.addEventListener('keydown',e=>{if(e.key==='Escape')menu.open=false});
})();