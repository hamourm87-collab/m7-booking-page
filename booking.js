/* M7 Booking Logic — Clean */
(function(){
const FA=new Date(2026,4,3),SL=['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00'],
BL=[0,6],BT='8767231953:AAFN6w56pZ4d4h4o5-SZWcttnAGrRnZb1Xo',CH='8296598401',
MO=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
let st={c:null,r:null,ct:null,d:null,t:null,m:new Date(FA)};
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
function act(id){document.getElementById(id).classList.add('active')}

$('#cs').addEventListener('change',function(){
    const o=this.options[this.selectedIndex];
    st.c=this.value;st.r=o.dataset.r;
    st.ct=st.r==='a'?'video':'voice';
    $('#cti').textContent=st.ct==='video'?'📹':'📞';
    $('#ctt').textContent=st.ct==='video'?'Video Call + Voice Call Available':'Voice Call';
    $('#ct').style.display='flex';
    act('st2');renderCal();
});

function renderCal(){
    const y=st.m.getFullYear(),m=st.m.getMonth();
    $('#cm').textContent=MO[m]+' '+y;
    const f=new Date(y,m,1),l=new Date(y,m+1,0),sd=(f.getDay()+6)%7;
    const today=new Date();today.setHours(0,0,0,0);
    const g=$('#cg');g.innerHTML='';
    for(let i=0;i<sd;i++){const d=document.createElement('div');d.className='cd e';g.appendChild(d)}
    for(let d=1;d<=l.getDate();d++){
        const dt=new Date(y,m,d),el=document.createElement('div');
        el.className='cd';el.textContent=d;
        if(dt<today||dt<FA||BL.includes(dt.getDay()))el.classList.add('f');
        else{el.classList.add('a');el.addEventListener('click',()=>pickD(dt,el))}
        if(st.d&&dt.toDateString()===st.d.toDateString())el.classList.add('sel');
        g.appendChild(el);
    }
    const min=new Date(today.getFullYear(),today.getMonth(),1);
    $('#cp').style.visibility=st.m<=min?'hidden':'visible';
}

function pickD(d,el){st.d=d;$$('.cd.sel').forEach(e=>e.classList.remove('sel'));el.classList.add('sel');act('st3');renderT()}
$('#cp').addEventListener('click',()=>{st.m.setMonth(st.m.getMonth()-1);renderCal()});
$('#cn').addEventListener('click',()=>{st.m.setMonth(st.m.getMonth()+1);renderCal()});

function renderT(){
    const g=$('#tg');g.innerHTML='';
    SL.forEach(s=>{const el=document.createElement('button');el.className='ts';el.textContent=s;el.addEventListener('click',()=>pickT(s,el));g.appendChild(el)});
}
function pickT(t,el){st.t=t;$$('.ts.sel').forEach(e=>e.classList.remove('sel'));el.classList.add('sel');act('st4');val()}
function val(){
    const n=$('#fn').value.trim(),e=$('#fe').value.trim();
    $('#gb').disabled=!(st.c&&st.d&&st.t&&n&&e.includes('@'));
}
document.addEventListener('input',val);

$('#gb').addEventListener('click',async function(){
    if(this.disabled)return;
    $('.gbt').style.display='none';$('.gbl').style.display='inline-flex';this.disabled=true;
    const b={name:$('#fn').value.trim(),email:$('#fe').value.trim(),phone:$('#fp').value.trim()||'—',
        company:$('#fc').value.trim()||'—',country:$('#cs').options[$('#cs').selectedIndex].text,
        ct:st.ct==='video'?'📹 Video':'📞 Voice',date:fmt(st.d),time:st.t+' CET'};
    try{await fetch(`https://api.telegram.org/bot${BT}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({chat_id:CH,text:`🔔 *NEW BOOKING*\n\n👤 *${b.name}*\n📧 ${b.email}\n📞 ${b.phone}\n🏢 ${b.company}\n🌍 ${b.country}\n\n📅 *${b.date}* at *${b.time}*\n${b.ct}`,parse_mode:'Markdown'})})}catch(e){}
    $$('.step').forEach(s=>s.style.display='none');
    $('#done').style.display='block';
    $('#di').innerHTML=`<div><strong style="color:var(--cyan-ui)">Name:</strong> ${b.name}</div><div><strong style="color:var(--cyan-ui)">Date:</strong> ${b.date}</div><div><strong style="color:var(--cyan-ui)">Time:</strong> ${b.time}</div><div><strong style="color:var(--cyan-ui)">Type:</strong> ${b.ct}</div><div><strong style="color:var(--cyan-ui)">Country:</strong> ${b.country}</div>`;
    $('#done').scrollIntoView({behavior:'smooth',block:'center'});
});

function fmt(d){return d.getDate().toString().padStart(2,'0')+'.'+(d.getMonth()+1).toString().padStart(2,'0')+'.'+d.getFullYear()}
renderCal();
})();
