const $ = id => document.getElementById(id);
const counterInput = $('counterInput');
function updateCounter(){const t=counterInput.value.trim(),words=t?t.split(/\s+/u).length:0;$('wordCount').textContent=words.toLocaleString();$('charCount').textContent=counterInput.value.length.toLocaleString();$('readTime').textContent=(words?Math.max(1,Math.ceil(words/200)):0)+' min';}
counterInput.addEventListener('input',updateCounter);
$('clearCounter').addEventListener('click',()=>{counterInput.value='';updateCounter();counterInput.focus();});
document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>{const x=$('caseInput'),m=b.dataset.case;if(m==='upper')x.value=x.value.toLocaleUpperCase();else if(m==='lower')x.value=x.value.toLocaleLowerCase();else x.value=x.value.toLocaleLowerCase().replace(/(^|[\s\u2014-])(\p{L})/gu,(_,p,c)=>p+c.toLocaleUpperCase());$('caseStatus').textContent='Text converted.';}));
$('cleanSpaces').addEventListener('click',()=>{$('spaceInput').value=$('spaceInput').value.split('\n').map(l=>l.replace(/[ \t]+/g,' ').trim()).join('\n').replace(/\n{3,}/g,'\n\n');$('spaceStatus').textContent='Text cleaned.';});
$('copyClean').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('spaceInput').value);$('spaceStatus').textContent='Copied to clipboard.';}catch{$('spaceInput').focus();$('spaceInput').select();$('spaceStatus').textContent='Select the text and copy it manually.';}});
$('year').textContent=new Date().getFullYear();

// Image compression is performed locally using the browser canvas.
let compressedUrl=null;
$('imageQuality').addEventListener('input',()=>{$('qualityValue').textContent=$('imageQuality').value+'%';});
$('compressImage').addEventListener('click',()=>{
 const file=$('imageFile').files[0],status=$('imageStatus'),result=$('imageResult');result.replaceChildren();
 if(!file){status.textContent='Choose an image first.';return;}
 if(!file.type.startsWith('image/')){status.textContent='Please choose a valid image file.';return;}
 status.textContent='Compressing...';
 const reader=new FileReader();
 reader.onerror=()=>status.textContent='Could not read this file.';
 reader.onload=()=>{
  const img=new Image();
  img.onerror=()=>status.textContent='Could not load this image.';
  img.onload=()=>{
   const maxSide=2400,scale=Math.min(1,maxSide/Math.max(img.naturalWidth,img.naturalHeight));
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
   const ctx=canvas.getContext('2d');
   if($('imageFormat').value==='image/jpeg'){ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);}
   ctx.drawImage(img,0,0,canvas.width,canvas.height);
   canvas.toBlob(blob=>{
    if(!blob){status.textContent='Compression failed. Try another image or format.';return;}
    if(compressedUrl)URL.revokeObjectURL(compressedUrl);compressedUrl=URL.createObjectURL(blob);
    const saved=file.size?Math.round((1-blob.size/file.size)*100):0;
    const preview=document.createElement('img');preview.alt='Compressed image preview';preview.src=compressedUrl;
    const link=document.createElement('a');link.href=compressedUrl;link.download='simplekit-compressed.'+($('imageFormat').value==='image/jpeg'?'jpg':'webp');link.textContent='Download compressed image';
    const info=document.createElement('p');info.className='small-note';info.textContent=`Original: ${formatBytes(file.size)} · Output: ${formatBytes(blob.size)} · ${saved>=0?saved+'% smaller':Math.abs(saved)+'% larger'} · ${canvas.width} × ${canvas.height}px`;
    result.append(preview,info,link);status.textContent='Done. Check the output quality before using it.';
   },$('imageFormat').value,Number($('imageQuality').value)/100);
  };img.src=reader.result;
 };reader.readAsDataURL(file);
});
function formatBytes(n){if(n<1024)return n+' B';const k=n/1024;if(k<1024)return k.toFixed(1)+' KB';return (k/1024).toFixed(2)+' MB';}

// QR service receives the supplied text/URL; warn users not to submit sensitive data.
$('makeQr').addEventListener('click',()=>{
 const value=$('qrText').value.trim(),result=$('qrResult'),status=$('qrStatus');result.replaceChildren();
 if(!value){status.textContent='Enter text or a URL first.';return;}
 const img=document.createElement('img');img.alt='Generated QR code';img.width=240;img.height=240;
 const download=document.createElement('a');download.textContent='Open QR image to save';download.href='https://api.qrserver.com/v1/create-qr-code/?size=240x240&data='+encodeURIComponent(value);download.target='_blank';download.rel='noopener noreferrer';
 img.src=download.href;img.onerror=()=>status.textContent='QR service could not generate the code. Check your connection and try again.';
 result.append(img,download);status.textContent='QR request created. This uses an external service.';
});

// Unit converter
const unitSets={
 length:{m:1,km:1000,cm:.01,mm:.001,mi:1609.344,yd:.9144,ft:.3048,in:.0254},
 weight:{kg:1,g:.001,mg:.000001,lb:.45359237,oz:.028349523125},
 data:{B:1,KB:1000,MB:1000000,GB:1000000000,KiB:1024,MiB:1048576,GiB:1073741824}
};
const unitLabels={length:{m:'Meters',km:'Kilometers',cm:'Centimeters',mm:'Millimeters',mi:'Miles',yd:'Yards',ft:'Feet',in:'Inches'},weight:{kg:'Kilograms',g:'Grams',mg:'Milligrams',lb:'Pounds',oz:'Ounces'},data:{B:'Bytes',KB:'Kilobytes (decimal)',MB:'Megabytes (decimal)',GB:'Gigabytes (decimal)',KiB:'Kibibytes',MiB:'Mebibytes',GiB:'Gibibytes'},temperature:{C:'Celsius',F:'Fahrenheit',K:'Kelvin'}};
function populateUnits(){const cat=$('unitCategory').value,from=$('unitFrom'),to=$('unitTo');from.replaceChildren();to.replaceChildren();Object.entries(unitLabels[cat]).forEach(([key,label])=>{for(const sel of [from,to]){const o=document.createElement('option');o.value=key;o.textContent=label;sel.append(o);}});if(cat==='length'){from.value='m';to.value='ft';}else if(cat==='weight'){from.value='kg';to.value='lb';}else if(cat==='temperature'){from.value='C';to.value='F';}else{from.value='MB';to.value='MiB';}convertUnits();}
function convertUnits(){const cat=$('unitCategory').value,val=Number($('unitValue').value),from=$('unitFrom').value,to=$('unitTo').value;if($('unitValue').value===''||!Number.isFinite(val)){$('unitResult').textContent='Enter a valid number';return;}let out;
 if(cat==='temperature'){let c=from==='C'?val:from==='F'?(val-32)*5/9:val-273.15;out=to==='C'?c:to==='F'?c*9/5+32:c+273.15;}
 else out=val*unitSets[cat][from]/unitSets[cat][to];
 $('unitResult').textContent=Number(out.toPrecision(10)).toLocaleString(undefined,{maximumFractionDigits:8})+' '+to;
}
$('unitCategory').addEventListener('change',populateUnits);$('unitValue').addEventListener('input',convertUnits);$('unitFrom').addEventListener('change',convertUnits);$('unitTo').addEventListener('change',convertUnits);populateUnits();
