(function(){
  const gallery=document.querySelector('#tanks .gallery');
  const lb=document.getElementById('lightbox');
  if(!gallery||!lb) return;
  const imgEl=lb.querySelector('img');
  const closeBtn=lb.querySelector('.close');
  gallery.addEventListener('click',e=>{
    const img=e.target.closest('img');
    if(!img) return;
    imgEl.src=img.src;
    lb.hidden=false;
  });
  function close(){lb.hidden=true;imgEl.removeAttribute('src');}
  closeBtn.addEventListener('click',close);
  lb.addEventListener('click',e=>{if(e.target===lb) close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!lb.hidden) close();});
})();