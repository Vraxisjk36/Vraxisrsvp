/* Tap-to-edit with persistent drafts, background photography and session undo/redo. */
(() => {
  'use strict';
  const id=new URLSearchParams(location.search).get('template'),frames=[document.getElementById('studioFrame'),document.getElementById('frame')].filter(Boolean);
  if(!id||!frames.length)return;
  const utils=window.VraxisEditor,key='vraxis_draft_'+vraxisDraft.id+'_tap';
  let state={text:{},images:{},backgrounds:{}};
  try{const saved=JSON.parse(localStorage.getItem(key)||'{}');for(const group of Object.keys(state))if(saved[group]&&typeof saved[group]==='object')state[group]=saved[group];}catch{}
  let enabled=false,selection=null,uploading=false,returnFocus=null;
  const documents=new Set(),owners=new WeakMap(),undoStack=[],redoStack=[];
  const undo=document.createElement('button'),redo=document.createElement('button'),history=document.createElement('div');history.className='editor-history';undo.textContent='Undo';redo.textContent='Redo';
  for(const button of [undo,redo]){button.type='button';button.disabled=true;}
  undo.setAttribute('aria-label','Undo last invitation edit');redo.setAttribute('aria-label','Redo invitation edit');history.append(undo,redo);document.querySelector('.studio-bottom')?.append(history);
  function updateHistory(){undo.disabled=!undoStack.length||uploading;redo.disabled=!redoStack.length||uploading;}
  function status(message){const el=document.getElementById('renderStatus');if(el)el.textContent=message;const live=document.getElementById('editorStatus');if(live)live.textContent=message;}
  function path(el){
    if(el.id&&/^[A-Za-z][A-Za-z0-9_-]*$/.test(el.id)&&el.ownerDocument.querySelectorAll('#'+el.id).length===1)return '#'+el.id;
    const bits=[];while(el&&el.nodeType===1&&el.tagName!=='HTML'){let index=1,sibling=el;while((sibling=sibling.previousElementSibling))if(sibling.tagName===el.tagName)index++;bits.unshift(el.tagName.toLowerCase()+':nth-of-type('+index+')');el=el.parentElement;}return bits.join(' > ');
  }
  function persist(next){try{localStorage.setItem(key,JSON.stringify(next));state=next;return true;}catch{status('Your device storage is full. Try a smaller photograph before saving this edit.');return false;}}
  function applyEverywhere(){for(const doc of documents){if(!doc.defaultView||!doc.defaultView.frameElement?.isConnected){documents.delete(doc);continue;}utils.apply(doc,state);}}
  function commit(operation,remember=true){
    const next=structuredClone(state);next[operation.group][operation.path]=operation.after;
    if(!persist(next))return false;
    if(remember){undoStack.push({group:operation.group,path:operation.path,before:operation.before,after:operation.after});if(undoStack.length>12)undoStack.shift();redoStack.length=0;}
    applyEverywhere();updateHistory();status('✓ Your change is saved on this device.');return true;
  }
  undo.onclick=()=>{const op=undoStack.pop();if(!op)return;if(commit({...op,after:op.before},false))redoStack.push(op);else undoStack.push(op);updateHistory();};
  redo.onclick=()=>{const op=redoStack.pop();if(!op)return;if(commit(op,false))undoStack.push(op);else redoStack.push(op);updateHistory();};
  function keyboard(event){if(!enabled||event.target.closest?.('input,textarea,select,[contenteditable]'))return;if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();(event.shiftKey?redo:undo).click();}}
  document.addEventListener('keydown',keyboard);
  function cursor(doc){
    doc.body.classList.toggle('vraxis-editing',enabled);doc.getElementById('vraxis-tap-css')?.remove();
    if(enabled){const css=doc.createElement('style');css.id='vraxis-tap-css';css.textContent='body.vraxis-editing :is(h1,h2,h3,h4,p,li,blockquote,[data-text],img){cursor:pointer!important;outline:1px dashed #b58d64!important;outline-offset:4px}body.vraxis-editing :is(button,input,textarea,select){outline-offset:2px}';doc.head.append(css);}
  }
  function activate(doc,owner){
    if(!doc?.body)return;
    const old=owners.get(owner);if(old&&old!==doc)documents.delete(old);owners.set(owner,doc);documents.add(doc);utils.apply(doc,state);cursor(doc);
    if(doc.__vraxisTapBound)return;doc.__vraxisTapBound=true;doc.addEventListener('keydown',keyboard);
    doc.addEventListener('click',event=>{
      if(!enabled||uploading)return;
      const raw=event.target;if(!(raw instanceof doc.defaultView.Element))return;
      if(raw.closest('input,textarea,select,[contenteditable],nav,.editor,.edit-panel,.editor-panel,.edit-drawer,#editor,#studioPanel,#drawer,#editPanel,#editDrawer'))return;
      const img=raw.closest('img');
      const text=raw.closest('[data-text],h1,h2,h3,h4,p,blockquote,li,[data-editable-text]');
      if(img&&!img.closest('[role="dialog"],form')){
        event.preventDefault();event.stopImmediatePropagation();selection={doc,element:img,path:path(img),group:'images',before:img.src};picker.click();return;
      }
      if(raw.closest('button,a,form'))return;
      if(text&&!text.querySelector('input,textarea,select,button,a')&&text.textContent.trim().length<=3000){
        event.preventDefault();event.stopImmediatePropagation();selection={doc,element:text,path:path(text),group:'text',before:text.textContent.trim()};showDialog(selection.before);return;
      }
      let node=raw;
      for(let depth=0;node&&node!==doc.body&&depth<5;depth++,node=node.parentElement){
        for(const pseudo of [null,'::before','::after']){
          const selector=path(node)+(pseudo||'');const source=utils.backgroundURL(doc,selector);
          if(utils.imageURL(source)){
            event.preventDefault();event.stopImmediatePropagation();selection={doc,element:node,path:selector,group:'backgrounds',before:source};picker.click();return;
          }
        }
      }
    },true);
  }
  function bind(outer){
    let parent;try{parent=outer.contentDocument;}catch{return;}if(!parent?.body)return;
    const inner=parent.getElementById('invitation')||parent.querySelector('iframe');
    if(inner){
      if(!parent.getElementById('vraxis-outer-clean')){const style=parent.createElement('style');style.id='vraxis-outer-clean';style.textContent='html,body{height:100%;overflow:hidden!important;margin:0!important}body>header,body>footer,body>div:not(#invitation),body>section,body>main,body>nav{display:none!important}#invitation{position:fixed!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;border:0!important;display:block!important}';parent.head.append(style);}
      if(!inner.__vraxisTapLoad){inner.__vraxisTapLoad=true;inner.addEventListener('load',()=>{try{activate(inner.contentDocument,inner);}catch{}});}
      if(inner.contentDocument?.readyState==='complete')activate(inner.contentDocument,inner);
    }else activate(parent,outer);
  }
  for(const outer of frames){outer.addEventListener('load',()=>bind(outer));if(outer.contentDocument?.readyState==='complete')bind(outer);}
  window.addEventListener('vraxis-edit-mode',event=>{enabled=!!event.detail.enabled;frames.forEach(bind);documents.forEach(cursor);history.hidden=!enabled;if(!enabled)closeDialog();});
  const dialog=document.createElement('div');dialog.id='vraxisTextDialog';dialog.className='vraxis-text-dialog';dialog.hidden=true;dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','vraxisEditLabel');
  dialog.innerHTML='<div class="vraxis-text-panel"><div class="eyebrow">MAKE IT SOUND LIKE YOU</div><label id="vraxisEditLabel" for="vraxisEditText">A few words, beautifully yours.</label><textarea id="vraxisEditText" rows="5" maxlength="3000"></textarea><p id="vraxisEditError" role="alert"></p><div><button type="button" data-cancel>Cancel</button><button type="button" data-apply>Save wording →</button></div></div>';
  document.body.append(dialog);const edit=dialog.querySelector('textarea'),cancel=dialog.querySelector('[data-cancel]'),save=dialog.querySelector('[data-apply]');
  const picker=document.createElement('input');picker.type='file';picker.accept='image/*';picker.hidden=true;document.body.append(picker);
  function closeDialog(){dialog.hidden=true;returnFocus?.focus?.({preventScroll:true});}
  function showDialog(value){returnFocus=document.activeElement;edit.value=value;dialog.querySelector('[role=alert]').textContent='';dialog.hidden=false;edit.focus();edit.select();}
  cancel.onclick=closeDialog;dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog();});
  dialog.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeDialog();}
    if(event.key==='Tab'){const controls=[edit,cancel,save],index=controls.indexOf(document.activeElement);if(event.shiftKey&&index===0){event.preventDefault();save.focus();}else if(!event.shiftKey&&index===2){event.preventDefault();edit.focus();}}
  });
  save.onclick=()=>{const value=edit.value.trim();if(!value){dialog.querySelector('[role=alert]').textContent='Add the wording you’d like your guests to see.';edit.focus();return;}if(selection&&commit({...selection,after:value}))closeDialog();};
  picker.onchange=async()=>{
    const file=picker.files?.[0],chosen=selection;if(!file||!chosen)return;
    uploading=true;updateHistory();status('Preparing your photograph…');const objectURL=URL.createObjectURL(file);
    try{
      const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('We couldn’t read that image. Please choose a JPG, PNG or WebP photograph.'));img.src=objectURL;});
      const canvas=document.createElement('canvas'),scale=Math.min(1,1400/Math.max(img.width,img.height));canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
      commit({...chosen,after:canvas.toDataURL('image/jpeg',.78)});
    }catch(error){status(error.message);}finally{URL.revokeObjectURL(objectURL);picker.value='';uploading=false;updateHistory();}
  };
  history.hidden=true;updateHistory();
})();
