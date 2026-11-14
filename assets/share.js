/* Guest sharing uses only the published invitation's existing unguessable token. */
(() => {
  const base='https://our-moment-invitations.fernyplatypus32.chatgpt.site';
  const slugName=value=>String(value||'your invitation').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64).replace(/-$/,'')||'your-invitation';
  const title=inv=>String(inv.event_data?.names||inv.title||'Your invitation').slice(0,150);
  function url(inv){if(inv.status!=='published'||!/^inv-[a-f0-9]{20}$/.test(inv.slug||''))throw Error('Publish your invitation before sharing it.');return base+'/'+slugName(title(inv))+'/'+inv.slug;}
  let dialog,input,heading,message,cover,current=null,returnFocus;
  function create(){
    dialog=document.createElement('dialog');dialog.className='invitation-share-dialog';dialog.setAttribute('aria-labelledby','shareHeading');
    dialog.innerHTML='<div class="share-panel"><button class="share-close" type="button" aria-label="Close sharing options">×</button><div class="share-preview"><img id="shareCover" alt=""><div><small>AN INVITATION TO CELEBRATE</small><h2 id="shareEventTitle"></h2><span id="shareEventDate"></span></div></div><div class="share-body"><div class="share-kicker">A LITTLE JOY, SENT THEIR WAY</div><h2 id="shareHeading">Your invitation is ready to share.</h2><p id="shareMessage" role="status" aria-live="polite"></p><label for="shareGuestLink">Your guest link</label><div class="share-copy-row"><input id="shareGuestLink" readonly type="url"><button type="button" id="shareCopyAgain">Copy link</button></div><div class="share-apps" aria-label="Share your invitation"><a id="shareWhatsApp" target="_blank" rel="noopener noreferrer"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 20l1.2-4A8 8 0 1 1 8 20z"/><path d="M9 7c-2 4 1 7 5 8l2-2-2-1-1 1-3-3 1-1z"/></svg></span>WhatsApp</a><a id="shareFacebook" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">f</span>Facebook</a><a id="shareTelegram" target="_blank" rel="noopener noreferrer"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m3 10 18-7-6 18-4-7zM11 14 21 3"/></svg></span>Telegram</a><a id="shareEmail"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 6 9 7 9-7"/></svg></span>Email</a><button type="button" id="shareNative"><span aria-hidden="true">↑</span>More apps</button></div><p class="share-footnote">Your guests can open this link without an account.</p></div></div>';
    document.body.append(dialog);input=dialog.querySelector('input');heading=dialog.querySelector('#shareHeading');message=dialog.querySelector('#shareMessage');cover=dialog.querySelector('#shareCover');
    dialog.querySelector('.share-close').onclick=()=>dialog.close();
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
    dialog.addEventListener('close',()=>{(document.querySelector('[data-share-id="'+(current?.id||'')+'"]')||returnFocus)?.focus?.();});
    dialog.querySelector('#shareCopyAgain').onclick=copy;
    dialog.querySelector('#shareNative').onclick=async()=>{try{await navigator.share({title:title(current),text:'You’re invited to celebrate with '+title(current)+'.',url:input.value});}catch(error){if(error.name!=='AbortError')message.textContent='Choose an app below, or copy your guest link.';}};
    input.addEventListener('click',()=>input.select());
  }
  async function copy(){
    let copied=false;
    try{await navigator.clipboard.writeText(input.value);copied=true;}catch{input.focus();input.select();try{copied=document.execCommand('copy');}catch{}}
    heading.textContent=copied?'Link copied. Let’s spread a little joy.':'Your invitation is ready to share.';
    message.textContent=copied?'Send it straight to your favourite people.':'Tap Copy link, or choose a sharing option below.';
    return copied;
  }
  async function open(inv){
    const link=url(inv);if(!dialog)create();current=inv;returnFocus=document.activeElement;input.value=link;
    const name=title(inv),date=inv.event_data?.date;
    dialog.querySelector('#shareEventTitle').textContent=name;
    dialog.querySelector('#shareEventDate').textContent=date&&/^\d{4}-\d{2}-\d{2}$/.test(date)?new Date(date+'T12:00:00').toLocaleDateString('en-ZA',{day:'numeric',month:'long',year:'numeric'}):'A special occasion';
    cover.src='assets/share-default.jpg';cover.alt='Invitation cover for '+name;
    const text='You’re invited to celebrate with '+name+'.\n'+link;
    dialog.querySelector('#shareWhatsApp').href='https://wa.me/?text='+encodeURIComponent(text);
    dialog.querySelector('#shareFacebook').href='https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(link);
    dialog.querySelector('#shareTelegram').href='https://t.me/share/url?url='+encodeURIComponent(link)+'&text='+encodeURIComponent('You’re invited to celebrate with '+name+'.');
    dialog.querySelector('#shareEmail').href='mailto:?subject='+encodeURIComponent(name+' — you’re invited')+'&body='+encodeURIComponent(text);
    dialog.querySelector('#shareNative').hidden=typeof navigator.share!=='function';
    if(!dialog.open)dialog.showModal();
    await copy();
    const path=inv.design_data?.photo_paths?.[0];
    if(path&&window.vraxisDB){const {data}=await vraxisDB.storage.from('invitation-photos').createSignedUrl(path,3600);if(data?.signedUrl&&current===inv)cover.src=data.signedUrl;}
  }
  window.VraxisShare={open,url,slugName};
})();
