/* One browser-side encoder shared by uploads, tap edits and cloud saves. */
window.VraxisPhoto={maxPhotos:12,maxBytes:300*1024,async encode(source){
 const image=new Image(),objectURL=typeof source==='string'?source:URL.createObjectURL(source);
 try{
  await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('We couldn’t read that photograph. Choose a JPG, PNG or WebP image.'));image.src=objectURL;});
  if(!image.naturalWidth||!image.naturalHeight)throw Error('That photograph has no readable dimensions.');
  let scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
  for(let attempt=0;attempt<5;attempt++){
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
   for(const quality of [.88,.84,.80,.76]){let data=canvas.toDataURL('image/webp',quality);if(!data.startsWith('data:image/webp'))data=canvas.toDataURL('image/jpeg',quality);const bytes=Math.ceil((data.length-data.indexOf(',')-1)*3/4);if(bytes<=this.maxBytes)return data;}
   scale*=.85;
  }
  throw Error('We couldn’t prepare this photo within 300 KB. Try a less detailed photograph.');
 }finally{if(typeof source!=='string')URL.revokeObjectURL(objectURL);}
}};
