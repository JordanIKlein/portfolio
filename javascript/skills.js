(function(){
  const items=[...document.querySelectorAll('#skills .skill-item')];
  if(items.length){
    // Always visible baseline — never hide items if IO fails
    items.forEach(el=>{
      el.style.opacity='1';
      el.style.transform='none';
      el.style.transition='opacity .35s ease, transform .35s ease';
    });

    // Progressive enhancement: subtle slide-in when scrolling into view
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(es=>{
        es.forEach(e=>{
          if(e.isIntersecting){
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        })
      },{threshold:.05, rootMargin:'0px 0px -5% 0px'});

      // Start slightly offset but fully opaque to avoid disappearing
      items.forEach(el=>{el.style.transform='translateY(6px)';io.observe(el)});

      const style=document.createElement('style');
      style.textContent='#skills .skill-item.in{opacity:1;transform:translateY(0)}';
      document.head.appendChild(style);
    }
  }

  // No local seafloor decorations here; handled globally.
})();