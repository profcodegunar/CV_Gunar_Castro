const docs = window.DOCUMENTS || [];
const grid = document.getElementById('documentGrid');
const search = document.getElementById('docSearch');
const cat = document.getElementById('docCategory');
const inst = document.getElementById('docInstitution');
const count = document.getElementById('resultCount');
const modal = document.getElementById('docModal');
const modalTitle = document.getElementById('modalTitle');
const modalInstitution = document.getElementById('modalInstitution');
const modalMeta = document.getElementById('modalMeta');
const modalPages = document.getElementById('modalPages');
const modalDownload = document.getElementById('modalDownload');
const modalOpenOriginal = document.getElementById('modalOpenOriginal');

const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const uniq = arr => [...new Set(arr)].sort((a,b)=>a.localeCompare(b,'es'));

uniq(docs.map(d=>d.category)).forEach(v=>cat.insertAdjacentHTML('beforeend',`<option>${esc(v)}</option>`));
uniq(docs.map(d=>d.institution)).forEach(v=>inst.insertAdjacentHTML('beforeend',`<option>${esc(v)}</option>`));

function render(){
  const q=search.value.trim().toLowerCase();
  const filtered=docs.filter(d=>(!q || `${d.title} ${d.institution} ${d.category} ${d.originalName}`.toLowerCase().includes(q)) && (!cat.value || d.category===cat.value) && (!inst.value || d.institution===inst.value));
  count.textContent=filtered.length;
  grid.innerHTML=filtered.map(d=>`<article class="document-card">
    <div class="document-thumb doc-file-thumb"><span class="file-type">${esc(d.type)}</span><span class="doc-badge">${d.pageCount} ${d.pageCount===1?'pág.':'págs.'}</span></div>
    <div class="document-body"><small>${esc(d.institution)}</small><h3>${esc(d.title)}</h3><p>${esc(d.category)}</p>
      <div class="doc-actions"><button data-view="${d.id}">Visualizar</button><a href="${encodeURI(d.download)}" download>Descargar</a></div>
    </div></article>`).join('');
  grid.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>openDoc(b.dataset.view)));
}

function openDoc(id){
  const d=docs.find(x=>x.id===id); if(!d)return;
  modalTitle.textContent=d.title; modalInstitution.textContent=d.institution;
  modalMeta.textContent=`${d.category} · ${d.type} · ${d.pageCount} ${d.pageCount===1?'página':'páginas'}`;
  modalDownload.href=encodeURI(d.download); modalDownload.setAttribute('download','');
  modalOpenOriginal.href=encodeURI(d.download);
  const src=encodeURI(d.download);
  const isImage=/\.(png|jpe?g|webp)$/i.test(d.download);
  modalPages.innerHTML=isImage
    ? `<figure class="modal-page"><img src="${src}" alt="${esc(d.title)}"></figure>`
    : `<div class="pdf-shell"><iframe class="pdf-frame" src="${src}#view=FitH&toolbar=1" title="${esc(d.title)}"></iframe><p class="mobile-pdf-note">Si el visor de tu celular no carga el PDF, usa <strong>Abrir documento</strong>.</p></div>`;
  modal.showModal(); document.body.style.overflow='hidden';
}

search.addEventListener('input',render); cat.addEventListener('change',render); inst.addEventListener('change',render); render();
document.querySelectorAll('[data-open-doc]').forEach(b=>b.addEventListener('click',()=>openDoc(b.dataset.openDoc)));
document.getElementById('modalClose').addEventListener('click',()=>modal.close());
modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});
modal.addEventListener('close',()=>{document.body.style.overflow=''; modalPages.innerHTML='';});

document.getElementById('printBtn').addEventListener('click',()=>window.print());
document.getElementById('year').textContent=new Date().getFullYear();

const menuToggle=document.getElementById('menuToggle'), nav=document.getElementById('mainNav');
menuToggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',open)});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false')}));

if(matchMedia('(max-width:760px)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches){document.querySelectorAll('.reveal').forEach(e=>e.classList.add('visible'));}
else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.1});document.querySelectorAll('.reveal').forEach(e=>io.observe(e));}

const sections=[...document.querySelectorAll('main section[id]')], links=[...nav.querySelectorAll('a')];
const sio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${e.target.id}`))}),{rootMargin:'-35% 0px -55% 0px'});sections.forEach(s=>sio.observe(s));
