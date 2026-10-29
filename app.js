'use strict';
// QUESTION_DATA is generated from the source Google Form; identifiers preserve traceability.
const QUESTIONS = {
  "bbis": [
    {
      "id": "198978153",
      "title": "ความเรียบง่ายในการใช้งานระบบ BBIS โดยรวม"
    },
    {
      "id": "1164472956",
      "title": "ความรวดเร็ว การตอบสนองของระบบ"
    },
    {
      "id": "1301751773",
      "title": "ความเป็นมิตรต่อผู้ใช้งานใหม่"
    },
    {
      "id": "1097571967",
      "title": "ภาษาที่ใช้ในระบบมีความชัดเจน เข้าใจง่าย"
    },
    {
      "id": "809173691",
      "title": "ระบบ BBIS ช่วยเพิ่มประสิทธิภาพในการทำงานของท่านได้ในระดับใด"
    },
    {
      "id": "1060474416",
      "title": "โดยรวมแล้วท่านพึงพอกับระบบ BBIS ในระดับใด"
    }
  ],
  "service": [
    {
      "id": "19575766",
      "title": "การรายงานผลกลับภายในเวลาที่เหมาะสม"
    },
    {
      "id": "1618074209",
      "title": "รายงานผลถูกต้อง แม่นยำ"
    },
    {
      "id": "1853458257",
      "title": "ท่านได้รับข้อมูลและคำแนะนำที่ชัดเจนจากเจ้าหน้าที่"
    },
    {
      "id": "1968445697",
      "title": "คู่มือการขอรับบริการมีความชัดเจนและมีข้อมูลเพียงพอ"
    },
    {
      "id": "740251478",
      "title": "อุปกรณ์ขนส่งเลือดและส่วนประกอบของเลือดมีความเหมาะสม"
    },
    {
      "id": "1756959312",
      "title": "เจ้าหน้าที่ให้บริการด้วยความสุภาพและเหมาะสม"
    },
    {
      "id": "1454740600",
      "title": "สถานที่และช่วงเวลาให้บริการสะดวกต่อการติดต่อ"
    },
    {
      "id": "1718990894",
      "title": "โดยรวมแล้วท่านพึงพอใจต่อการบริการของห้องปฏิบัติการเพียงใด"
    }
  ]
};
const labels = ['น้อยที่สุด', 'น้อย', 'ปานกลาง', 'มาก', 'มากที่สุด'];
const form = document.querySelector('#survey');
const steps = {consent:'ความยินยอม',profile:'ข้อมูลผู้ตอบ',bbis:'ระบบ BBIS',service:'การบริการ',feedback:'ข้อเสนอแนะ',review:'ตรวจสอบ'};
let current = 'consent';
let busy = false;
let pendingPayload = null;
const endpoint = (window.SURVEY_CONFIG || {}).endpoint || '';
const configured = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint);
document.querySelector('#setup').hidden = configured;
function value(name) { return new FormData(form).get(name) || ''; }
function activeSteps() { return Object.keys(steps).filter(s => s !== 'bbis' || value('usedBbis') === 'เคย'); }
function rating(question, name, number) {
  const field = document.createElement('fieldset');
  field.className = 'rating-question';
  const legend = document.createElement('legend');
  legend.textContent = `${number}. ${question.title} `;
  const star = document.createElement('span'); star.className = 'required'; star.textContent = '*'; legend.append(star);
  field.append(legend);
  const group = document.createElement('div'); group.className = 'rating';
  for (let score = 5; score >= 1; score--) {
    const label = document.createElement('label'); label.className = 'score';
    const input = document.createElement('input'); input.type = 'radio'; input.name = name; input.value = String(score); input.required = true;
    input.setAttribute('aria-label', `${score} ${labels[score - 1]}`);
    const text = document.createElement('span'); const b = document.createElement('b'); b.textContent = score;
    text.append(b, document.createTextNode(labels[score - 1])); label.append(input,text); group.append(label);
  }
  field.append(group); return field;
}
for (const role of ['แพทย์','พยาบาล','เจ้าหน้าที่ห้องปฏิบัติการ','เจ้าหน้าที่ส่งตรวจ','อื่น ๆ']) {
  const label = document.createElement('label'); label.className = 'choice';
  const input = document.createElement('input'); input.type = 'radio'; input.name = 'role'; input.value = role; input.required = true;
  label.append(input,document.createTextNode(role)); document.querySelector('#roles').append(label);
}
for (const category of ['bbis','service']) QUESTIONS[category].forEach((q,i) => document.querySelector(`#${category}Ratings`).append(rating(q,`q_${q.id}`,i+1)));
document.querySelector('#trustRating').append(rating({title:'โดยรวมแล้ว ท่านรู้สึกไว้วางใจและอยากใช้บริการห้องปฏิบัติการฯ ต่อไปในระยะยาวเพียงใด'},'trust',9));
function updateConditionals() {
  const other = value('role') === 'อื่น ๆ';
  document.querySelector('#otherRoleWrap').hidden = !other;
  document.querySelector('#otherRole').disabled = !other;
  document.querySelector('#otherRole').required = other;
  form.querySelectorAll('[data-step="bbis"] input,[data-step="bbis"] textarea').forEach(el => el.disabled = value('usedBbis') !== 'เคย');
}
function displayReview() {
  const host = document.querySelector('#review'); host.replaceChildren();
  const pairs = [['ตำแหน่ง',value('role') === 'อื่น ๆ' ? value('otherRole') : value('role')],['ประเภทหน่วยงาน',value('agencyType')],['ชื่อหน่วยงาน',value('agency')],['ระบบ BBIS',value('usedBbis') === 'เคย' ? 'ประเมินแล้ว' : 'ไม่เคยใช้งาน (ข้ามการประเมิน)']];
  for (const category of ['bbis','service']) {
    if (category === 'bbis' && value('usedBbis') !== 'เคย') continue;
    for (const q of QUESTIONS[category]) pairs.push([q.title,`${value(`q_${q.id}`)} / 5`]);
  }
  pairs.push(['ความไว้วางใจ',`${value('trust')} / 5`]);
  for (const [name,title] of [['bbisLike','จุดเด่น BBIS'],['bbisImprove','ปรับปรุง BBIS'],['suggestion','พัฒนาการบริการ'],['problem','ปัญหาการบริการ'],['transport','อุปกรณ์ขนส่ง'],['dissatisfied','สิ่งที่ไม่พึงพอใจ']]) if(value(name)) pairs.push([title,value(name)]);
  for (const [title,content] of pairs) { const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=title;dd.textContent=content;host.append(dt,dd); }
}
function showStep(step, focus = true) {
  current = step; updateConditionals();
  const active = activeSteps(); const index = active.indexOf(step);
  form.querySelectorAll('section[data-step]').forEach(s => s.hidden = s.dataset.step !== step);
  document.querySelector('#stepList').replaceChildren();
  active.forEach((key,i)=> { const li=document.createElement('li');li.className=i===index?'active':i<index?'done':'';if(i===index)li.setAttribute('aria-current','step');const n=document.createElement('span');n.className='stepnum';n.textContent=i<index?'✓':i+1;li.append(n,document.createTextNode(steps[key]));document.querySelector('#stepList').append(li); });
  const percent = Math.round(index/(active.length-1)*100);
  document.querySelector('#fill').style.width=`${percent}%`;
  document.querySelector('#progress').setAttribute('aria-valuenow',percent);
  document.querySelector('#percent').textContent=`${percent}%`;
  document.querySelector('#stepText').textContent=`ขั้นตอน ${index+1} จาก ${active.length} · ${steps[step]}`;
  document.querySelector('#back').hidden=index===0;
  document.querySelector('#next').textContent=step==='review'?'ส่งแบบสอบถาม ✓':step==='consent'?'เริ่มแบบสอบถาม →':'ถัดไป →';
  document.querySelector('#error').hidden=true;
  if(step==='review')displayReview();
  if(focus) { document.querySelector(`#survey [data-step="${step}"] h2`).focus({preventScroll:true}); document.querySelector('#card').scrollIntoView({behavior:'smooth',block:'start'}); }
}
function error(message) { const el=document.querySelector('#error');el.textContent=message;el.hidden=false; }
function validStep(step) {
  const section=form.querySelector(`[data-step="${step}"]`);
  for(const el of section.querySelectorAll('input,textarea')) {
    if(el.disabled)continue;
    if(el.required && (el.type==='text'||el.tagName==='TEXTAREA'))el.setCustomValidity(el.value.trim()?'':'กรุณากรอกข้อมูลในช่องนี้');
    if(!el.checkValidity()){el.reportValidity();return false;}
  }
  return true;
}
function payload() {
  const data=Object.fromEntries(new FormData(form));
  Object.keys(data).forEach(key=>data[key]=data[key].trim());
  return {version:'2569-v1',submissionId:crypto.randomUUID(),data};
}
function finish(declined=false, id='') {
  form.hidden=true;document.querySelector('#progressWrap').hidden=true;
  const result=document.querySelector('#result');result.replaceChildren();result.hidden=false;
  const icon=document.createElement('div');icon.className='success-icon';icon.textContent=declined?'♡':'✓';
  const h=document.createElement('h2');h.tabIndex=-1;h.textContent=declined?'ขอบคุณที่ให้ความสนใจ':'ขอบคุณสำหรับความคิดเห็น';
  const p=document.createElement('p');p.textContent=declined?'ระบบจบแบบสอบถามแล้ว โดยไม่ได้ส่งข้อมูลของท่าน':'บันทึกคำตอบของท่านลง Google Sheets เรียบร้อยแล้ว';
  result.append(icon,h,p);
  if(!declined){const note=document.createElement('p');note.className='quiet';note.textContent='ภาควิชาเวชศาสตร์การธนาคารเลือด ขอขอบคุณที่ร่วมตอบแบบสอบถามในครั้งนี้ โดยคำถามทั้งหมดจะรวบรวมและตอบผ่านหน้าเว็บไซต์ภาควิชาฯ ต่อไป';const receipt=document.createElement('p');receipt.className='hint';receipt.textContent=`เลขอ้างอิง: ${id}`;result.append(note,receipt);}
  form.reset();pendingPayload=null;h.focus();
}
async function submit() {
  if(!configured){error('ยังไม่ได้เชื่อมต่อ Google Sheets กรุณาตั้งค่า URL ใน config.js ก่อนเปิดรับคำตอบ');return;}
  // Retry the exact same payload and ID after an uncertain network result.
  // Editing answers after an uncertain result is disabled to prevent silent data loss.
  pendingPayload ||= payload();
  busy=true;form.setAttribute('aria-busy','true');
  document.querySelector('#next').disabled=true;document.querySelector('#back').disabled=true;
  document.querySelector('#next').textContent='กำลังบันทึก…';document.querySelector('#error').hidden=true;
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),35000);
  try {
    const response=await fetch(endpoint,{method:'POST',body:new URLSearchParams({payload:JSON.stringify(pendingPayload)}),redirect:'follow',signal:controller.signal});
    if(!response.ok)throw new Error('network');
    const receipt=await response.json();
    if(receipt.ok!==true || receipt.submissionId!==pendingPayload.submissionId) {
      if(receipt.ok===false && receipt.retryable===false){pendingPayload=null;throw new Error('rejected');}
      throw new Error('unconfirmed');
    }
    finish(false,receipt.submissionId);
  } catch(e) {
    error(e.message==='rejected'?'ระบบไม่รับคำตอบ กรุณาตรวจสอบข้อมูลหรือติดต่อผู้ดูแลแบบสอบถาม': 'ยังยืนยันการบันทึกไม่ได้ กรุณาคงหน้านี้ไว้ แล้วกด “ลองส่งอีกครั้ง” ระบบจะใช้เลขอ้างอิงเดิมเพื่อลดการบันทึกซ้ำ');
  } finally {
    clearTimeout(timeout);busy=false;form.removeAttribute('aria-busy');
    document.querySelector('#next').disabled=false;document.querySelector('#back').disabled=!!pendingPayload;
    document.querySelector('#next').textContent=pendingPayload?'ลองส่งอีกครั้ง':'ส่งแบบสอบถาม ✓';
  }
}
form.addEventListener('change',updateConditionals);
form.addEventListener('input',e=>{if(e.target.setCustomValidity)e.target.setCustomValidity('');});
document.querySelector('#back').addEventListener('click',()=>{if(busy||pendingPayload)return;const a=activeSteps();showStep(a[a.indexOf(current)-1]);});
form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy)return;
  if(!validStep(current))return;
  if(current==='consent' && value('consent')==='ไม่ยินยอม'){finish(true);return;}
  if(current==='review'){
    for(const step of activeSteps().filter(s=>s!=='review')) {if(!validStep(step)){showStep(step);validStep(step);return;}}
    await submit();return;
  }
  const a=activeSteps();showStep(a[a.indexOf(current)+1]);
});
showStep('consent',false);
