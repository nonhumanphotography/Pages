(()=>{
  'use strict';
  const PAGE=document.body.dataset.pageId;
  const SESSIONS=["t1","lab1","t2","t3","lab2","t4","t5","lab3","t6","lab4","t7","t8","lab5","t9","lab6"];
  const FILES={"requisitos":"requisitos.html","index":"index.html","programa":"programa.html","setup":"setup.html","t1":"teoria-t1.html","lab1":"laboratorio-1.html","t2":"teoria-t2.html","t3":"teoria-t3.html","lab2":"laboratorio-2.html","t4":"teoria-t4.html","t5":"teoria-t5.html","lab3":"laboratorio-3.html","t6":"teoria-t6.html","lab4":"laboratorio-4.html","t7":"teoria-t7.html","t8":"teoria-t8.html","lab5":"laboratorio-5.html","t9":"teoria-t9.html","lab6":"laboratorio-6.html","evaluacion":"evaluacion.html","proyecto":"proyecto-final.html","dots":"dots.html","ejercicios":"ejercicios.html","recursos":"recursos.html","glosario":"glosario.html","galeria":"galeria.html","profesor":"panel-profesor.html"};
  const STORAGE='dei-scorm-progress-v10';
  let api=null,initialized=false,visited=[],completed=[];
  function findAPI(w){let n=0;while(w&&n<8){try{if(w.API)return w.API}catch(e){}if(w.parent===w)break;w=w.parent;n++}try{if(window.opener)return findAPI(window.opener)}catch(e){}return null}
  function get(k){try{return api.LMSGetValue(k)||''}catch(e){return''}}
  function set(k,v){try{return api.LMSSetValue(k,String(v))}catch(e){return'false'}}
  function commit(){try{if(api)api.LMSCommit('')}catch(e){}}
  function state(){return {visited,completed,last:PAGE,version:2}}
  function save(){
    const payload=JSON.stringify(state());localStorage.setItem(STORAGE,payload);
    if(initialized){set('cmi.core.lesson_location',PAGE);set('cmi.suspend_data',payload);set('cmi.core.lesson_status',SESSIONS.every(x=>completed.includes(x))?'completed':'incomplete');set('cmi.core.exit','suspend');commit()}
  }
  function paint(){
    const pct=Math.round(SESSIONS.filter(x=>completed.includes(x)).length/SESSIONS.length*100);
    document.querySelectorAll('[data-progress]').forEach(x=>x.value=pct);
    document.querySelectorAll('[data-progress-label]').forEach(x=>x.textContent=pct+'%');
    document.querySelectorAll('[data-page-id]').forEach(x=>{if(visited.includes(x.dataset.pageId))x.classList.add('visited');if(completed.includes(x.dataset.pageId))x.classList.add('completed')});
    const button=document.querySelector('[data-complete-session]');if(button){const done=completed.includes(PAGE);button.textContent=done?'Sesión completada ✓':'Marcar sesión como completada';button.classList.toggle('done',done)}
  }
  function load(){
    api=findAPI(window);if(api){try{initialized=api.LMSInitialize('')==='true'}catch(e){}}
    let saved=initialized?get('cmi.suspend_data'):'';if(!saved)saved=localStorage.getItem(STORAGE)||'';let data={};try{data=JSON.parse(saved)||{}}catch(e){}
    visited=Array.isArray(data.visited)?data.visited:[];completed=Array.isArray(data.completed)?data.completed:[];
    const last=initialized?(get('cmi.core.lesson_location')||data.last):data.last;
    if(PAGE==='index'&&last&&last!=='index'&&FILES[last]&&!sessionStorage.getItem('dei-v10-resumed')){sessionStorage.setItem('dei-v10-resumed','1');location.replace(FILES[last]);return}
    if(!visited.includes(PAGE))visited.push(PAGE);save();paint();
  }
  function finish(){if(initialized){save();try{api.LMSFinish('')}catch(e){}initialized=false}}
  document.querySelector('[data-complete-session]')?.addEventListener('click',()=>{if(completed.includes(PAGE))completed=completed.filter(x=>x!==PAGE);else completed.push(PAGE);save();paint()});
  document.querySelector('.menu-toggle')?.addEventListener('click',e=>{const s=document.querySelector('.sidebar'),o=document.querySelector('.scrim'),open=!s.classList.contains('open');s.classList.toggle('open',open);o.classList.toggle('open',open);e.currentTarget.setAttribute('aria-expanded',String(open))});
  document.querySelector('.scrim')?.addEventListener('click',()=>{document.querySelector('.sidebar')?.classList.remove('open');document.querySelector('.scrim')?.classList.remove('open')});
  document.querySelectorAll('[data-storage-key]').forEach(el=>{el.value=localStorage.getItem(el.dataset.storageKey)||'';el.addEventListener('input',()=>localStorage.setItem(el.dataset.storageKey,el.value))});
  document.querySelectorAll('[data-storage-form]').forEach(form=>{const key=form.dataset.storageForm;let data={};try{data=JSON.parse(localStorage.getItem(key)||'{}')}catch(e){}form.querySelectorAll('[name]').forEach(el=>{el.value=data[el.name]||'';el.addEventListener('input',()=>{data[el.name]=el.value;localStorage.setItem(key,JSON.stringify(data))})})});
  const CHECK_STORAGE='dei-scorm-checklists-v10';
  let checked={};try{checked=JSON.parse(localStorage.getItem(CHECK_STORAGE)||'{}')}catch(e){}
  document.querySelectorAll('.checklist input[type=checkbox][data-check-id]').forEach(control=>{
    control.checked=Boolean(checked[control.dataset.checkId]);
    control.addEventListener('change',()=>{
      if(control.checked)checked[control.dataset.checkId]=true;else delete checked[control.dataset.checkId];
      localStorage.setItem(CHECK_STORAGE,JSON.stringify(checked));
    });
  });
  const search=document.querySelector('[data-glossary-search]');search?.addEventListener('input',()=>{const q=search.value.toLowerCase().trim();document.querySelectorAll('.searchable [data-search]').forEach(x=>x.hidden=Boolean(q&&!x.dataset.search.includes(q)))});
  window.addEventListener('pagehide',finish);load();
})();