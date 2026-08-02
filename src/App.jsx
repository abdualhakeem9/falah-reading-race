import { useState, useEffect } from 'react';
import * as FB from './firebase';

const LOGO = '/logo.png';
const MAX_PAGES = 50;
const BONUS_KM  = 30;

const C = {
  teal:'#6199AF',tealL:'#8CBACF',tealD:'#3D6F88',tealBg:'#EBF4F8',tealBg2:'#D4E9F2',
  gray:'#646569',grayL:'#B3B2B1',grayBg:'#F4F5F6',
  white:'#FFFFFF',bg:'#F7FAFB',text:'#2D3748',muted:'#9CA3AF',
  border:'#E5E7EB',gold:'#C9A227',goldBg:'#FEF9EC',goldL:'#F5E398',
  green:'#16A34A',greenBg:'#DCFCE7',red:'#DC2626',redBg:'#FEE2E2',
  orange:'#D97706',orangeBg:'#FFFBEB',
};
const MC=['#C9A227','#9CA3AF','#CD7F32'];
const HEATS=[
  {id:1,name:'التروّي',emoji:'🌿',start:new Date('2026-07-25T00:00:00'),end:new Date('2026-07-29T23:59:59'),target:500},
  {id:2,name:'الإسراع',emoji:'⚡',start:new Date('2026-07-30T00:00:00'),end:new Date('2026-08-05T23:59:59'),target:1000},
  {id:3,name:'الاندفاع',emoji:'🔥',start:new Date('2026-08-06T00:00:00'),end:new Date('2026-08-12T23:59:59'),target:1500},
];
const GROUPS=['حلقة أولى متوسط','حلقة القويز','حلقة الحمراء','حلقة أولى ثانوي','حلقة ثاني ثانوي','حلقة ثالث ثانوي'];
const QUOTES=[
  {t:'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',s:'سورة العلق'},
  {t:'الكتاب خيرُ جليسٍ في الزمان',s:'حكمة'},
  {t:'كن فارساً في ميدان المعرفة',s:''},
  {t:'من قرأ كتاباً نافعاً فكأنما أضاء شمعة في الظلام',s:''},
];

function getActiveHeat(){
  const n=Date.now();
  for(const h of HEATS){if(n>=h.start&&n<=h.end)return{heat:h,status:'active'};}
  for(const h of HEATS){if(n<h.start)return{heat:h,status:'upcoming'};}
  return{heat:HEATS[2],status:'done'};
}
function getHeatStatus(h){const n=Date.now();if(n<h.start)return'upcoming';if(n>h.end)return'done';return'active';}
function useCountdownTo(target){
  const[t,setT]=useState({d:0,h:0,m:0,s:0});
  useEffect(()=>{
    if(!target)return;
    const f=()=>{const diff=target-Date.now();if(diff<=0)return;setT({d:Math.floor(diff/864e5),h:Math.floor((diff%864e5)/36e5),m:Math.floor((diff%36e5)/6e4),s:Math.floor((diff%6e4)/1e3)});};
    f();const id=setInterval(f,1000);return()=>clearInterval(id);
  },[target]);
  return t;
}
function useTick(ms=1000){const[t,setT]=useState(0);useEffect(()=>{const id=setInterval(()=>setT(x=>x+1),ms);return()=>clearInterval(id);},[]);return t;}

function HeatsStrip(){
  return(
    <div style={{display:'flex',alignItems:'center',gap:0,direction:'rtl',marginBottom:20}}>
      {HEATS.map((h,i)=>{
        const st=getHeatStatus(h);
        return(
          <div key={h.id} style={{display:'flex',alignItems:'center',flex:1}}>
            <div style={{flex:1,padding:'10px 8px',borderRadius:12,textAlign:'center',
              background:st==='done'?C.tealBg:st==='active'?C.teal:C.white,
              border:`1.5px solid ${st==='done'?C.tealL:st==='active'?C.teal:C.border}`,
              boxShadow:st==='active'?`0 4px 14px ${C.teal}33`:'none',position:'relative'}}>
              {st==='active'&&<div style={{position:'absolute',top:0,left:0,right:0,height:3,background:C.gold,borderRadius:'3px 3px 0 0'}}/>}
              <div style={{fontSize:st==='active'?22:16}}>{st==='done'?'✅':h.emoji}</div>
              <div style={{color:st==='done'?C.tealD:st==='active'?C.white:C.text,fontWeight:800,fontSize:13,marginTop:2}}>{h.name}</div>
              <div style={{fontSize:9,color:st==='done'?C.tealD:st==='active'?'rgba(255,255,255,.8)':C.muted,marginTop:1}}>
                {st==='done'?'مكتمل':st==='active'?'جارٍ الآن':'قادم 🔒'}
              </div>
            </div>
            {i<HEATS.length-1&&<div style={{width:18,height:2,background:C.border,flexShrink:0}}/>}
          </div>
        );
      })}
    </div>
  );
}

function SmartCountdown(){
  const{heat,status}=getActiveHeat();
  const target=status==='active'?heat.end:status==='upcoming'?heat.start:null;
  const{d,h,m,s}=useCountdownTo(target);
  if(!target)return<div style={{textAlign:'center',color:C.muted,padding:16}}>🏁 انتهى سباق القرّاء الصيفي ١</div>;
  const label=status==='active'?`حتى نهاية ${heat.name}`:`حتى انطلاق ${heat.name}`;
  return(
    <div style={{textAlign:'center'}}>
      <div style={{color:C.muted,fontSize:12,marginBottom:10}}>{label}</div>
      <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
        {[['يوم',d],['ساعة',h],['دقيقة',m],['ثانية',s]].map(([l,v])=>(
          <div key={l} style={{background:C.white,border:`1.5px solid ${C.tealBg2}`,borderRadius:12,padding:'10px 14px',textAlign:'center',minWidth:64}}>
            <div style={{color:C.teal,fontSize:28,fontWeight:800,fontFamily:'monospace',lineHeight:1}}>{String(v??0).padStart(2,'0')}</div>
            <div style={{color:C.muted,fontSize:10,marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuoteCard(){
  const tick=useTick(5000);const q=QUOTES[tick%QUOTES.length];
  return(
    <div style={{background:`linear-gradient(135deg,${C.teal},${C.tealD})`,borderRadius:14,padding:'16px 20px',textAlign:'center',color:C.white,direction:'rtl',marginBottom:16}}>
      <div style={{fontSize:18,marginBottom:4,opacity:.7}}>❝</div>
      <div style={{fontSize:14,fontWeight:700,lineHeight:1.7}}>{q.t}</div>
      {q.s&&<div style={{fontSize:10,opacity:.8,marginTop:3}}>{q.s}</div>}
    </div>
  );
}

function CircleRing({rank,firstName,km,pct,color}){
  const R=34,SZ=82,circ=2*Math.PI*R,off=circ-(pct/100)*circ;
  return(
    <div style={{textAlign:'center',padding:'4px 2px'}}>
      <div style={{position:'relative',width:SZ,height:SZ,margin:'0 auto'}}>
        <svg width={SZ} height={SZ} style={{transform:'rotate(-90deg)',display:'block'}}>
          <circle cx={SZ/2} cy={SZ/2} r={R} fill="none" stroke={C.border} strokeWidth="7"/>
          <circle cx={SZ/2} cy={SZ/2} r={R} fill="none" stroke={color}
            strokeWidth="7" strokeDasharray={circ} strokeDashoffset={off}
            strokeLinecap="round" style={{transition:'stroke-dashoffset 1.2s ease'}}/>
        </svg>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:rank<=3?18:14,lineHeight:1}}>{rank<=3?['🥇','🥈','🥉'][rank-1]:rank}</span>
          <span style={{fontSize:9,color:C.muted}}>{Math.round(pct)}%</span>
        </div>
      </div>
      <div style={{color:C.text,fontSize:11,fontWeight:700,marginTop:5,lineHeight:1.3}}>{firstName}</div>
      <div style={{color,fontSize:11,fontWeight:800,marginTop:1}}>{km} كم</div>
    </div>
  );
}
function KnowledgeRings({students}){
  const{heat}=getActiveHeat();const maxKm=heat?.target||500;
  const rc=i=>i===0?C.gold:i<3?MC[i]:C.teal;
  if(!students.length)return(
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:'32px 24px',textAlign:'center',direction:'rtl'}}>
      <div style={{fontSize:44,marginBottom:8}}>📚</div>
      <div style={{color:C.muted,fontSize:14,fontWeight:600}}>حلقة الفرسان فارغة حتى الآن</div>
    </div>
  );
  return(
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:20,direction:'rtl'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h3 style={{margin:0,color:C.teal,fontSize:16,fontWeight:800}}>📚 حلقة الفرسان</h3>
        <span style={{background:C.redBg,color:C.red,fontSize:10,padding:'2px 10px',borderRadius:20,display:'flex',alignItems:'center',gap:4}}>
          <span style={{width:5,height:5,borderRadius:'50%',background:C.red,display:'inline-block',animation:'blink 1s infinite'}}/>مباشر
        </span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(92px,1fr))',gap:14}}>
        {students.map((st,i)=><CircleRing key={st.id} rank={i+1} firstName={st.name.split(' ')[0]} km={st.km||0} pct={Math.min(((st.km||0)/maxKm)*100,100)} color={rc(i)}/>)}
      </div>
      <div style={{textAlign:'center',marginTop:14,color:C.muted,fontSize:10,borderTop:`1px solid ${C.border}`,paddingTop:10}}>
        كلما اتسعت دائرة معرفتك، كلما اقتربت من الفلاح
      </div>
    </div>
  );
}

function IndividualBoard({students}){
  if(!students.length)return(
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:24,textAlign:'center',direction:'rtl'}}>
      <div style={{fontSize:32,marginBottom:6}}>🏅</div>
      <div style={{color:C.muted,fontSize:13}}>لا يوجد فرسان بعد</div>
    </div>
  );
  return(
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:18,direction:'rtl'}}>
      <h3 style={{margin:'0 0 14px',color:C.teal,fontSize:15,fontWeight:800}}>🥇 ترتيب الفرسان</h3>
      {students.map((st,i)=>(
        <div key={st.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 10px',marginBottom:6,background:i===0?C.tealBg:C.grayBg,borderRadius:9,border:`1px solid ${i===0?C.tealL+'44':C.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{color:i<3?MC[i]:C.muted,fontWeight:800,fontSize:13,minWidth:18}}>{i<3?['🥇','🥈','🥉'][i]:i+1}</span>
            <div>
              <div style={{color:C.text,fontSize:12,fontWeight:600}}>{st.name?.split(' ').slice(0,2).join(' ')}</div>
              <div style={{color:C.muted,fontSize:9}}>{st.group}</div>
            </div>
          </div>
          <span style={{color:C.teal,fontWeight:800,fontSize:13}}>{st.km||0} كم</span>
        </div>
      ))}
    </div>
  );
}

function GroupsBoard({students}){
  const grouped=GROUPS.map((name,i)=>({id:i,name,km:students.filter(s=>s.group===name).reduce((a,s)=>a+(s.km||0),0),n:students.filter(s=>s.group===name).length})).sort((a,b)=>b.km-a.km);
  const max=Math.max(grouped[0]?.km||1,1);
  return(
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:18,direction:'rtl'}}>
      <h3 style={{margin:'0 0 14px',color:C.teal,fontSize:15,fontWeight:800}}>🏟️ سباق الحلقات</h3>
      {grouped.map((g,i)=>(
        <div key={g.id} style={{marginBottom:9,padding:11,background:i===0&&g.km>0?C.tealBg:C.grayBg,borderRadius:11,border:`1px solid ${i===0&&g.km>0?C.tealL+'55':C.border}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:g.km>0?7:0}}>
            <div style={{display:'flex',alignItems:'center',gap:7}}>
              <span style={{fontSize:15}}>{['🥇','🥈','🥉','٤','٥','٦'][i]}</span>
              <div>
                <div style={{color:C.text,fontWeight:700,fontSize:12}}>{g.name}</div>
                {g.n>0&&<div style={{color:C.muted,fontSize:9}}>{g.n} فارس</div>}
              </div>
            </div>
            <div style={{color:i===0&&g.km>0?C.teal:C.muted,fontWeight:800,fontSize:g.km>0?16:12}}>{g.km>0?`${g.km} كم`:'—'}</div>
          </div>
          {g.km>0&&<div style={{background:'rgba(0,0,0,.07)',borderRadius:4,height:5,overflow:'hidden'}}><div style={{height:'100%',width:`${(g.km/max)*100}%`,background:`linear-gradient(to left,${C.teal},${C.tealL})`,borderRadius:4}}/></div>}
        </div>
      ))}
    </div>
  );
}

function BenefitsSection({benefits,topBenefit}){
  const recent=[...benefits].slice(0,4);
  return(
    <div style={{direction:'rtl',marginBottom:20}}>
      <h3 style={{color:C.teal,fontSize:16,fontWeight:800,margin:'0 0 12px'}}>💡 فوائد الفرسان</h3>
      {topBenefit&&(
        <div style={{background:`linear-gradient(135deg,${C.goldBg},${C.goldL}33)`,border:`1.5px solid ${C.gold}55`,borderRadius:14,padding:16,marginBottom:12,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-8,left:-8,fontSize:60,opacity:.08}}>🌟</div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
            <span style={{fontSize:18}}>🌟</span>
            <span style={{color:C.gold,fontWeight:800,fontSize:13}}>أجمل فائدة اليوم</span>
            <span style={{background:`${C.gold}22`,color:C.orange,fontSize:10,padding:'2px 8px',borderRadius:20,fontWeight:700}}>+{BONUS_KM} كم مكافأة</span>
          </div>
          <div style={{color:C.text,fontSize:14,lineHeight:1.7,fontStyle:'italic',marginBottom:6}}>"{topBenefit.benefit}"</div>
          <div style={{color:C.muted,fontSize:11}}>📚 {topBenefit.book} — {topBenefit.student}</div>
        </div>
      )}
      {recent.length===0?(
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:'24px',textAlign:'center',color:C.muted,fontSize:13}}>
          <div style={{fontSize:32,marginBottom:6}}>💬</div>
          ستظهر هنا فوائد الفرسان بعد إقرار القراءات
        </div>
      ):(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {recent.map(b=>(
            <div key={b.id} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:12}}>
              <div style={{color:C.text,fontSize:12,lineHeight:1.6,marginBottom:6,fontStyle:'italic'}}>"{(b.benefit||'').slice(0,80)}{(b.benefit||'').length>80?'...':''}"</div>
              <div style={{color:C.muted,fontSize:10}}>📖 {b.book}</div>
              <div style={{color:C.teal,fontSize:10,fontWeight:700,marginTop:2}}>{b.student}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HomePage({students,pendingReadings,benefits,topBenefit}){
  return(
    <div style={{maxWidth:900,margin:'0 auto',padding:'20px 16px 90px',direction:'rtl'}}>
      <div style={{textAlign:'center',padding:'22px 0 18px'}}>
        <h1 style={{color:C.teal,fontSize:'clamp(20px,5vw,36px)',fontWeight:900,margin:'0 0 4px'}}>سباق القرّاء الصيفي ١ 🏁</h1>
        <p style={{color:C.gray,fontSize:12,margin:'0 0 18px'}}>مجمع الفلاح التعليمي</p>
        <SmartCountdown/>
      </div>
      <HeatsStrip/>
      {pendingReadings.length>0&&(
        <div style={{background:C.orangeBg,border:`1px solid #FCD34D`,borderRadius:12,padding:'11px 14px',marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
            <span style={{fontSize:15}}>⏳</span>
            <span style={{color:'#92400E',fontWeight:700,fontSize:12}}>قراءات بانتظار الموافقة ({pendingReadings.length})</span>
          </div>
          {pendingReadings.slice(0,3).map(p=><div key={p.id} style={{color:'#B45309',fontSize:10,marginBottom:1,paddingRight:22}}>• {p.student} — "{p.book}"</div>)}
        </div>
      )}
      <QuoteCard/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
        {[[students.length,'فارس','🏃'],[GROUPS.length,'حلقة','🏟️'],[students.reduce((a,s)=>a+(s.km||0),0).toLocaleString('ar-SA'),'كم إجمالي','📏']].map(([v,l,ic])=>(
          <div key={l} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:12,textAlign:'center'}}>
            <div style={{fontSize:20}}>{ic}</div>
            <div style={{color:C.teal,fontSize:20,fontWeight:800}}>{v}</div>
            <div style={{color:C.muted,fontSize:10,marginTop:1}}>{l}</div>
          </div>
        ))}
      </div>
      <BenefitsSection benefits={benefits} topBenefit={topBenefit}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <IndividualBoard students={students}/>
        <GroupsBoard students={students}/>
      </div>
    </div>
  );
}

function RacePage({students}){
  return(
    <div style={{maxWidth:900,margin:'0 auto',padding:'20px 16px 90px',direction:'rtl'}}>
      <h2 style={{color:C.teal,fontWeight:900,fontSize:22,margin:'0 0 14px'}}>🏁 ساحة السباق</h2>
      <HeatsStrip/>
      <div style={{marginBottom:14}}><KnowledgeRings students={students}/></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <IndividualBoard students={students}/>
        <GroupsBoard students={students}/>
      </div>
    </div>
  );
}

function AddPage({user}){
  const[book,setBook]=useState('');
  const[pages,setPages]=useState('');
  const[benefit,setBenefit]=useState('');
  const[sent,setSent]=useState(false);
  const[loading,setLoading]=useState(false);
  const[errors,setErrors]=useState({});
  const p=parseInt(pages)||0;
  const inp={padding:'11px 14px',background:C.grayBg,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:13,outline:'none',direction:'rtl',width:'100%',boxSizing:'border-box'};
  const validate=()=>{
    const e={};
    if(!book.trim())e.book='أدخل اسم الكتاب';
    if(!p||p<1)e.pages='أدخل عدد الصفحات';
    if(p>MAX_PAGES)e.pages=`الحد الأقصى ${MAX_PAGES} صفحة لكل إدخال`;
    if(!benefit.trim()||benefit.trim().length<20)e.benefit='اكتب فائدة مفيدة (٢٠ حرف على الأقل)';
    return e;
  };
  const submit=async()=>{
    const e=validate();
    if(Object.keys(e).length){setErrors(e);return;}
    setLoading(true);
    try{
      await FB.addReading({student:user.name,studentId:user.id,book:book.trim(),pages:p,km:p,benefit:benefit.trim(),group:user.group,date:new Date().toLocaleDateString('ar-SA-u-nu-latn')});
      setSent(true);setBook('');setPages('');setBenefit('');setErrors({});
      setTimeout(()=>setSent(false),4000);
    }catch(err){alert('حدث خطأ، حاول مجدداً');}
    setLoading(false);
  };
  return(
    <div style={{maxWidth:680,margin:'0 auto',padding:'20px 16px 90px',direction:'rtl'}}>
      <h2 style={{color:C.teal,fontWeight:900,fontSize:22,margin:'0 0 14px'}}>📚 سجّل قراءتك</h2>
      <div style={{background:C.tealBg,border:`1px solid ${C.tealL}55`,borderRadius:12,padding:'10px 14px',marginBottom:16,fontSize:12,color:C.tealD,lineHeight:1.8}}>
        ١ كم لكل صفحة • الحد الأقصى <b>{MAX_PAGES} صفحة</b> لكل إدخال
      </div>
      {sent?(
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:'40px 24px',textAlign:'center'}}>
          <div style={{fontSize:48}}>✅</div>
          <div style={{color:C.green,fontWeight:700,fontSize:17,marginTop:12}}>تم إرسال قراءتك للمراجعة!</div>
          <button onClick={()=>setSent(false)} style={{marginTop:14,padding:'9px 22px',background:C.teal,color:C.white,border:'none',borderRadius:10,cursor:'pointer',fontSize:13,fontWeight:700}}>إضافة قراءة أخرى</button>
        </div>
      ):(
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:22,display:'flex',flexDirection:'column',gap:14}}>
          <div>
            <label style={{display:'block',color:C.text,fontSize:13,fontWeight:600,marginBottom:6}}>📖 اسم الكتاب *</label>
            <input placeholder="مثال: قصص الأنبياء" value={book} onChange={e=>setBook(e.target.value)} style={{...inp,borderColor:errors.book?C.red:C.border}}/>
            {errors.book&&<div style={{color:C.red,fontSize:11,marginTop:4}}>{errors.book}</div>}
          </div>
          <div>
            <label style={{display:'block',color:C.text,fontSize:13,fontWeight:600,marginBottom:6}}>📄 عدد الصفحات * <span style={{color:C.muted,fontWeight:400}}>(حد أقصى {MAX_PAGES})</span></label>
            <input type="number" min="1" max={MAX_PAGES} value={pages} onChange={e=>setPages(e.target.value)} style={{...inp,borderColor:errors.pages?C.red:C.border}}/>
            {errors.pages&&<div style={{color:C.red,fontSize:11,marginTop:4}}>{errors.pages}</div>}
            {p>0&&p<=MAX_PAGES&&<div style={{color:C.teal,fontSize:11,marginTop:4,fontWeight:600}}>{p} صفحة = {p} كم ✓</div>}
          </div>
          <div>
            <label style={{display:'block',color:C.text,fontSize:13,fontWeight:600,marginBottom:6}}>💡 أجمل فائدة استفدتها *</label>
            <textarea placeholder="اكتب فائدة مستفادة... (٢٠ حرف كحد أدنى)" value={benefit} onChange={e=>setBenefit(e.target.value)} rows={4} style={{...inp,resize:'vertical',lineHeight:1.7,borderColor:errors.benefit?C.red:C.border}}/>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:3}}>
              {errors.benefit?<div style={{color:C.red,fontSize:11}}>{errors.benefit}</div>:<div/>}
              <div style={{color:benefit.length<20?C.muted:C.green,fontSize:10}}>{benefit.length} حرف</div>
            </div>
          </div>
          <button onClick={submit} disabled={loading} style={{padding:13,background:loading?C.grayL:C.teal,color:C.white,border:'none',borderRadius:12,fontSize:15,fontWeight:800,cursor:loading?'not-allowed':'pointer'}}>
            {loading?'جارٍ الإرسال...':`إرسال للمراجعة${p>0&&p<=MAX_PAGES?` (${p} كم)`:''}`}
          </button>
        </div>
      )}
    </div>
  );
}

function CardPage({user,students,benefits}){
  const st=students.find(s=>s.id===user.id);
  const rank=st?students.findIndex(s=>s.id===st.id)+1:null;
  const{heat}=getActiveHeat();const maxKm=heat?.target||500;
  const km=st?.km||0;const pct=Math.min((km/maxKm)*100,100);
  const myBenefits=benefits.filter(b=>b.studentId===user.id);
  return(
    <div style={{maxWidth:700,margin:'0 auto',padding:'20px 16px 90px',direction:'rtl'}}>
      <h2 style={{color:C.teal,fontWeight:900,fontSize:22,margin:'0 0 16px'}}>📋 بطاقتي</h2>
      <div style={{background:C.white,border:`1.5px solid ${C.tealL}`,borderRadius:18,padding:20,marginBottom:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
              {rank&&rank<=3&&<span style={{fontSize:20}}>{['🥇','🥈','🥉'][rank-1]}</span>}
              <h3 style={{color:C.text,margin:0,fontSize:18,fontWeight:800}}>{user.name}</h3>
            </div>
            <div style={{color:C.muted,fontSize:12}}>{user.group}{rank?` • المركز ${rank}`:''}</div>
          </div>
          <div style={{fontSize:40}}>🏃</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          {[[km,'كم','مسافتك'],[rank||'—','','ترتيبك']].map(([v,u,l])=>(
            <div key={l} style={{background:C.tealBg,borderRadius:10,padding:12,textAlign:'center'}}>
              <div style={{color:C.teal,fontSize:22,fontWeight:800}}>{v}</div>
              {u&&<div style={{color:C.tealD,fontSize:10}}>{u}</div>}
              <div style={{color:C.muted,fontSize:9,marginTop:1}}>{l}</div>
            </div>
          ))}
        </div>
        {heat&&<>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={{color:C.gray,fontSize:11}}>{heat.emoji} في {heat.name}</span>
            <span style={{color:C.teal,fontWeight:700,fontSize:11}}>{Math.round(pct)}%</span>
          </div>
          <div style={{background:C.grayBg,borderRadius:6,height:10,overflow:'hidden',border:`1px solid ${C.border}`}}>
            <div style={{height:'100%',width:`${pct}%`,background:`linear-gradient(to left,${C.teal},${C.tealL})`,borderRadius:6}}/>
          </div>
          <div style={{color:C.muted,fontSize:10,marginTop:3}}>{km} كم من {maxKm.toLocaleString()} كم</div>
        </>}
      </div>
      {myBenefits.length>0&&(
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}>
          <div style={{color:C.teal,fontWeight:800,fontSize:13,marginBottom:10}}>💡 فوائدي ({myBenefits.length})</div>
          {myBenefits.slice(0,3).map(b=>(
            <div key={b.id} style={{background:C.grayBg,borderRadius:9,padding:10,marginBottom:8}}>
              <div style={{color:C.text,fontSize:12,lineHeight:1.6,fontStyle:'italic'}}>"{b.benefit}"</div>
              <div style={{color:C.muted,fontSize:10,marginTop:3}}>📖 {b.book} • {b.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function AdminPage({students,pendingReadings,pendingRegs,benefits,topBenefit,setTopBenefit}){
  const[tab,setTab]=useState('pending');
  const[saving,setSaving]=useState(null);
  const thS={padding:'9px 12px',color:C.muted,fontSize:11,fontWeight:600,textAlign:'right',background:C.grayBg};
  const tdS=(c=C.text)=>({padding:'9px 12px',color:c,fontSize:12,borderTop:`1px solid ${C.border}`});
  const approve=async(r)=>{setSaving(r.id);await FB.approveReading(r.id,r.studentId,r.km);setSaving(null);};
  const reject=async(id)=>{setSaving(id);await FB.rejectReading(id);setSaving(null);};
  const approveReg=async(r)=>{setSaving(r.id);await FB.approveRegistration(r.id,r.uid);setSaving(null);};
  const rejectReg=async(r)=>{setSaving(r.id);await FB.rejectRegistration(r.id,r.uid);setSaving(null);};
  const pickTop=async(b)=>{setSaving('top');await FB.setTopBenefit({...b,pickedAt:new Date().toISOString()});if(b.studentId)await FB.awardKm(b.studentId,BONUS_KM);setSaving(null);};
  const clearTop=async()=>{setSaving('top');await FB.clearTopBenefit();setSaving(null);};
  return(
    <div style={{maxWidth:960,margin:'0 auto',padding:'16px 16px 90px',direction:'rtl'}}>
      <div style={{background:C.teal,borderRadius:14,padding:'13px 18px',marginBottom:18,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{color:C.white,fontWeight:800,fontSize:15}}>⚙️ لوحة الإشراف</div>
        <div style={{color:'rgba(255,255,255,.7)',fontSize:11}}>سباق القرّاء الصيفي ١</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
        {[[students.length,'فارس','🏃'],[students.reduce((a,s)=>a+(s.km||0),0),'كم','📏'],[pendingReadings.length,'قراءة معلقة','⏳'],[pendingRegs.length,'تسجيل معلق','👤']].map(([v,l,ic])=>(
          <div key={l} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:'13px 10px',textAlign:'center'}}>
            <div style={{fontSize:22}}>{ic}</div>
            <div style={{color:C.teal,fontSize:22,fontWeight:800,margin:'3px 0 2px'}}>{v}</div>
            <div style={{color:C.muted,fontSize:10}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
        {[['pending',`⏳ قراءات (${pendingReadings.length})`],['regs',`👤 تسجيلات (${pendingRegs.length})`],['top','🌟 أجمل فائدة'],['students','🏃 الطلاب'],['groups','🏟️ الحلقات']].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'6px 12px',background:tab===t?C.teal:C.white,color:tab===t?C.white:C.gray,border:`1.5px solid ${tab===t?C.teal:C.border}`,borderRadius:8,cursor:'pointer',fontSize:11,fontWeight:600}}>{l}</button>
        ))}
      </div>
      {tab==='pending'&&(
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {pendingReadings.length===0?<div style={{textAlign:'center',padding:'40px',color:C.muted}}><div style={{fontSize:40}}>✅</div><p>لا توجد قراءات معلقة</p></div>:
          pendingReadings.map(r=>(
            <div key={r.id} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:14}}>
              <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
                <div style={{flex:1}}>
                  <div style={{color:C.text,fontWeight:700,fontSize:13}}>{r.book}</div>
                  <div style={{color:C.muted,fontSize:11,marginTop:2}}>{r.student} • {r.pages} صفحة • {r.km} كم • {r.date}</div>
                  <div style={{background:C.tealBg,borderRadius:8,padding:'8px 10px',marginTop:8,color:C.tealD,fontSize:12,lineHeight:1.6}}>
                    💡 "{r.benefit}"
                  </div>
                </div>
                <div style={{display:'flex',gap:6,alignItems:'flex-start'}}>
                  <button onClick={()=>approve(r)} disabled={saving===r.id} style={{padding:'5px 12px',background:C.greenBg,color:C.green,border:`1px solid #86EFAC`,borderRadius:7,cursor:'pointer',fontSize:11,fontWeight:700}}>
                    {saving===r.id?'...':'✓ قبول'}
                  </button>
                  <button onClick={()=>reject(r.id)} disabled={saving===r.id} style={{padding:'5px 12px',background:C.redBg,color:C.red,border:`1px solid #FCA5A5`,borderRadius:7,cursor:'pointer',fontSize:11,fontWeight:700}}>
                    {saving===r.id?'...':'✗ رفض'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==='regs'&&(
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {pendingRegs.length===0?<div style={{textAlign:'center',padding:'40px',color:C.muted}}><div style={{fontSize:40}}>👤</div><p>لا توجد طلبات تسجيل</p></div>:
          pendingRegs.map(r=>(
            <div key={r.id} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:14,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
              <div>
                <div style={{color:C.text,fontWeight:700,fontSize:13}}>{r.name}</div>
                <div style={{color:C.muted,fontSize:11,marginTop:2}}>{r.email} • {r.group}</div>
              </div>
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>approveReg(r)} disabled={saving===r.id} style={{padding:'5px 12px',background:C.greenBg,color:C.green,border:`1px solid #86EFAC`,borderRadius:7,cursor:'pointer',fontSize:11,fontWeight:700}}>
                  {saving===r.id?'...':'✓ قبول'}
                </button>
                <button onClick={()=>rejectReg(r)} disabled={saving===r.id} style={{padding:'5px 12px',background:C.redBg,color:C.red,border:`1px solid #FCA5A5`,borderRadius:7,cursor:'pointer',fontSize:11,fontWeight:700}}>
                  {saving===r.id?'...':'✗ رفض'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==='top'&&(
        <div>
          {topBenefit&&<div style={{background:C.goldBg,border:`1.5px solid ${C.gold}55`,borderRadius:14,padding:14,marginBottom:14}}>
            <div style={{color:C.orange,fontWeight:700,fontSize:12,marginBottom:6}}>🌟 أجمل فائدة اليوم الحالية</div>
            <div style={{color:C.text,fontSize:13,fontStyle:'italic',marginBottom:4}}>"{topBenefit.benefit}"</div>
            <div style={{color:C.muted,fontSize:11}}>{topBenefit.student} — {topBenefit.book}</div>
            <button onClick={clearTop} disabled={saving==='top'} style={{marginTop:8,padding:'4px 12px',background:C.redBg,color:C.red,border:`1px solid #FCA5A5`,borderRadius:6,cursor:'pointer',fontSize:11}}>
              {saving==='top'?'...':'إلغاء التحديد'}
            </button>
          </div>}
          {benefits.length===0?<div style={{textAlign:'center',padding:'40px',color:C.muted}}><div style={{fontSize:40}}>💡</div><p>لا توجد فوائد معتمدة بعد</p></div>:
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {benefits.map(b=>(
              <div key={b.id} style={{background:topBenefit?.id===b.id?C.goldBg:C.white,border:`1.5px solid ${topBenefit?.id===b.id?C.gold+'55':C.border}`,borderRadius:12,padding:14}}>
                <div style={{color:C.text,fontSize:13,lineHeight:1.6,fontStyle:'italic',marginBottom:6}}>"{b.benefit}"</div>
                <div style={{color:C.muted,fontSize:11}}>{b.student} — {b.book} — {b.date}</div>
                {topBenefit?.id!==b.id&&<button onClick={()=>pickTop(b)} disabled={saving==='top'} style={{marginTop:8,padding:'4px 12px',background:C.goldBg,color:C.orange,border:`1px solid ${C.gold}55`,borderRadius:6,cursor:'pointer',fontSize:11,fontWeight:700}}>
                  {saving==='top'?'...':'⭐ اختر أجمل فائدة (+'+BONUS_KM+' كم)'}
                </button>}
              </div>
            ))}
          </div>}
        </div>
      )}
      {tab==='students'&&(students.length===0?<div style={{textAlign:'center',padding:'40px',color:C.muted}}><div style={{fontSize:40}}>🏃</div><p>لا يوجد طلاب بعد</p></div>:
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['#','الاسم','الحلقة','الكيلومترات'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead><tbody>{students.map((st,i)=><tr key={st.id}><td style={{...tdS(),color:i<3?MC[i]:C.muted,fontWeight:700}}>{i+1}</td><td style={tdS()}>{st.name}</td><td style={{...tdS(C.muted),fontSize:11}}>{st.group}</td><td style={{...tdS(C.teal),fontWeight:700}}>{st.km||0}</td></tr>)}</tbody></table></div>
      )}
      {tab==='groups'&&(
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['#','الحلقة','الفرسان','المسافة'].map(h=><th key={h} style={thS}>{h}</th>)}</tr></thead><tbody>{GROUPS.map((name,i)=>{const g={km:students.filter(s=>s.group===name).reduce((a,s)=>a+(s.km||0),0),n:students.filter(s=>s.group===name).length};return(<tr key={i} style={{borderTop:`1px solid ${C.border}`}}><td style={{...tdS(),color:i<3?MC[i]:C.muted,fontWeight:700}}>{i+1}</td><td style={tdS()}>{name}</td><td style={{...tdS(C.muted)}}>{g.n}</td><td style={{...tdS(C.teal),fontWeight:700}}>{g.km>0?`${g.km} كم`:'—'}</td></tr>);})}</tbody></table></div>
      )}
    </div>
  );
}
function AuthScreen({onAdminLogin}){
  const[mode,setMode]=useState('login');
  const[form,setForm]=useState({name:'',email:'',password:'',group:''});
  const[err,setErr]=useState('');
  const[loading,setLoading]=useState(false);
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const inp={padding:'11px 14px',background:C.grayBg,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:13,outline:'none',direction:'rtl',width:'100%',boxSizing:'border-box'};
  const submit=async()=>{
    if(!form.email.trim()||!form.password){setErr('أدخل البريد وكلمة المرور');return;}
    setLoading(true);setErr('');
    try{
      if(mode==='login'){
        await FB.fbLogin(form.email.trim().toLowerCase(), form.password);
        setLoading(false);
        return;
      }

      // ===== إنشاء حساب =====
      const email=form.email.trim().toLowerCase();
      const isAdmin=email===FB.ADMIN_EMAIL;
      if(!form.name.trim()||(!isAdmin&&!form.group)){
        setErr('أكمل جميع الحقول');setLoading(false);return;
      }
      const cred=await FB.fbRegister(email,form.password);
      const uid=cred.user.uid;
      await FB.saveUser(uid,{
        name:form.name.trim(),
        email,
        group:isAdmin?'المشرف':form.group,
        km:0,
        role:isAdmin?'admin':'student',
        approved:isAdmin,
        createdAt:new Date().toISOString(),
      });
      if(!isAdmin){
        await FB.addPendingReg(uid,{name:form.name.trim(),email,group:form.group});
        await FB.fbLogout();
        setLoading(false);
        setForm({name:'',email:'',password:'',group:''});
        setErr('');setMode('login');
        alert('✅ تم التسجيل! انتظر موافقة المشرف ثم سجّل دخولك.');
        return;
      }
      window.location.reload();
      return;
    }catch(e){
      const msgs={'auth/user-not-found':'البريد غير مسجل','auth/wrong-password':'كلمة المرور خاطئة','auth/email-already-in-use':'البريد مستخدم مسبقاً','auth/weak-password':'كلمة المرور ضعيفة (٦ أحرف على الأقل)','auth/invalid-email':'صيغة البريد غير صحيحة'};
      setErr(msgs[e.code]||'حدث خطأ، حاول مجدداً');
    }

    setLoading(false);
  };
  return(
    <div style={{maxWidth:400,margin:'30px auto',padding:'0 16px',direction:'rtl'}}>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:20,padding:'26px 20px',boxShadow:'0 4px 20px rgba(0,0,0,.07)'}}>
        <div style={{textAlign:'center',marginBottom:20}}>
          <img src={LOGO} alt="logo" style={{height:48,marginBottom:7}}/>
          <div style={{color:C.teal,fontWeight:800,fontSize:15}}>سباق القرّاء الصيفي ١</div>
        </div>
        <div style={{display:'flex',borderRadius:10,overflow:'hidden',border:`1px solid ${C.border}`,marginBottom:16}}>
          {[['login','تسجيل الدخول'],['register','إنشاء حساب']].map(([m,l])=>(
            <button key={m} onClick={()=>{setMode(m);setErr('');}} style={{flex:1,padding:'10px',background:mode===m?C.teal:C.white,color:mode===m?C.white:C.gray,border:'none',cursor:'pointer',fontSize:12,fontWeight:700}}>{l}</button>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {mode==='register'&&<input placeholder="الاسم الكامل *" value={form.name} onChange={set('name')} style={inp}/>}
          <input type="email" placeholder="البريد الإلكتروني *" value={form.email} onChange={set('email')} style={inp}/>
          <input type="password" placeholder="كلمة المرور *" value={form.password} onChange={set('password')} onKeyDown={e=>e.key==='Enter'&&submit()} style={inp}/>
          {mode==='register'&&<select value={form.group} onChange={set('group')} style={{...inp,color:form.group?C.text:C.muted}}>
            <option value="">اختر حلقتك *</option>
            {GROUPS.map(g=><option key={g} value={g}>{g}</option>)}
          </select>}
          {err&&<div style={{background:C.redBg,color:C.red,fontSize:12,padding:'8px 12px',borderRadius:8,textAlign:'center'}}>{err}</div>}
          <button onClick={submit} disabled={loading} style={{padding:12,background:loading?C.grayL:C.teal,color:C.white,border:'none',borderRadius:10,fontSize:14,fontWeight:800,cursor:loading?'not-allowed':'pointer',marginTop:2}}>
            {loading?'جارٍ...':(mode==='login'?'دخول':'إنشاء الحساب')}
          </button>
        </div>
        {mode==='register'&&<div style={{color:C.muted,fontSize:10,textAlign:'center',marginTop:10,lineHeight:1.6}}>سيُرسل طلبك للمشرف وتُفعّل حسابك بعد الموافقة</div>}
      </div>
    </div>
  );
}
function BottomNav({page,setPage}){
  const items=[['home','🏠','الرئيسية'],['race','🏆','السباق'],['add','📚','أضف قراءة'],['card','📋','بطاقتي']];
  return(
    <nav style={{position:'fixed',bottom:0,left:0,right:0,background:C.white,borderTop:`1px solid ${C.border}`,display:'flex',flexDirection:'row-reverse',zIndex:100,boxShadow:'0 -4px 14px rgba(0,0,0,.07)'}}>
      {items.map(([p,ic,l])=>(
        <button key={p} onClick={()=>setPage(p)} style={{flex:1,border:'none',background:'transparent',cursor:'pointer',padding:'10px 4px 8px',display:'flex',flexDirection:'column',alignItems:'center',gap:1,position:'relative',outline:'none'}}>
          {p==='add'?(
            <div style={{position:'absolute',top:-18,width:48,height:48,background:C.teal,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 14px ${C.teal}55`,border:`3px solid ${C.white}`}}>
              <span style={{fontSize:20}}>📚</span>
            </div>
          ):<span style={{fontSize:21,filter:page===p?'none':'grayscale(30%)'}}>{ic}</span>}
          {p==='add'?<span style={{marginTop:20}}/>:null}
          <span style={{fontSize:10,color:page===p?C.teal:C.muted,fontWeight:page===p?700:400}}>{l}</span>
          {page===p&&p!=='add'&&<div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:18,height:3,borderRadius:2,background:C.teal}}/>}
        </button>
      ))}
    </nav>
  );
}
function Header({user,onLogout}){
  return(
    <header style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:'10px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',direction:'rtl',position:'sticky',top:0,zIndex:200,boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <img src={LOGO} alt="" style={{height:44,width:'auto'}}/>
        <div>
          <div style={{color:C.teal,fontWeight:800,fontSize:14,lineHeight:1.2}}>سباق القرّاء الصيفي ١</div>
          <div style={{color:C.muted,fontSize:10}}>مجمع الفلاح التعليمي</div>
        </div>
      </div>
      {user&&(
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{textAlign:'left',direction:'ltr'}}>
            <div style={{color:C.text,fontWeight:700,fontSize:11}}>{user.name?.split(' ')[0]}</div>
            <div style={{color:C.muted,fontSize:9}}>{user.group}</div>
          </div>
          <button onClick={onLogout} style={{background:C.grayBg,border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:'4px 9px',cursor:'pointer',fontSize:10}}>خروج</button>
        </div>
      )}
    </header>
  );
}
export default function App(){
  const[page,setPage]=useState('home');
  const[user,setUser]=useState(null);
  const[adminMode,setAdminMode]=useState(false);
  const[loading,setLoading]=useState(true);
  const[students,setStudents]=useState([]);
  const[pendingReadings,setPendingReadings]=useState([]);
  const[pendingRegs,setPendingRegs]=useState([]);
  const[benefits,setBenefits]=useState([]);
  const[topBenefit,setTopBenefit]=useState(null);
  useEffect(()=>{
    const unsub=FB.onAuthChange(async firebaseUser=>{
      if(firebaseUser){
        try{
          const snap=await FB.getUser(firebaseUser.uid);
          if(snap.exists()){
            const data={id:firebaseUser.uid,...snap.data()};
            if(data.rejected){
              await FB.fbLogout();
              setUser(null);setAdminMode(false);
              setLoading(false);
              alert('❌ تم رفض طلب تسجيلك. تواصل مع المشرف.');
              return;
            }
            if(data.role==='admin'){
              setAdminMode(true);setUser(null);
            } else if(data.approved){
              setUser(data);setAdminMode(false);
            } else {
              await FB.fbLogout();
              setUser(null);setAdminMode(false);
              setLoading(false);
              alert('⏳ حسابك في انتظار موافقة المشرف. حاول تسجيل الدخول لاحقاً.');
              return;
            }
          } else {
            if(firebaseUser.email===FB.ADMIN_EMAIL){
              await FB.saveUser(firebaseUser.uid,{
                name:'المشرف',
                email:firebaseUser.email,
                group:'المشرف',
                km:0,
                role:'admin',
                approved:true,
                createdAt:new Date().toISOString(),
              });
              setAdminMode(true);setUser(null);
            } else {
              await FB.fbLogout();
              setUser(null);setAdminMode(false);
              alert('⚠️ لا يوجد ملف لحسابك في قاعدة البيانات. تواصل مع المشرف.');
            }
            setLoading(false);
            return;
          }
        }catch(e){
          console.error('Auth error:',e);
          await FB.fbLogout();
        }
      } else {
        setUser(null);setAdminMode(false);
      }
      setLoading(false);
    });
    return()=>unsub();
  },[]);
  useEffect(()=>{
    const subs=[
      FB.listenStudents(setStudents),
      FB.listenApprovedReadings(setBenefits),
      FB.listenTopBenefit(setTopBenefit),
    ];
    if(adminMode){
      subs.push(FB.listenPendingReadings(setPendingReadings));
      subs.push(FB.listenPendingRegs(setPendingRegs));
    }
    return()=>subs.forEach(u=>u());
  },[adminMode]);
  const handleLogout=async()=>{await FB.fbLogout();setPage('home');};
  const needsAuth=(page==='card'||page==='add')&&!user&&!adminMode;
  const fbConfigMissing=!import.meta.env.VITE_FIREBASE_API_KEY||import.meta.env.VITE_FIREBASE_API_KEY==='your_api_key_here';
  if(fbConfigMissing)return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#FEF2F2',padding:24}}>
      <div style={{textAlign:'center',maxWidth:480}}>
        <div style={{fontSize:52,marginBottom:12}}>⚙️</div>
        <h2 style={{color:'#DC2626',fontWeight:800}}>Firebase غير مضبوط</h2>
      </div>
    </div>
  );
  if(loading)return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:C.bg}}>
      <div style={{textAlign:'center'}}>
        <img src={LOGO} alt="" style={{height:60,marginBottom:16,animation:'pulse 1.5s ease-in-out infinite'}}/>
        <div style={{color:C.teal,fontWeight:700,fontSize:14}}>جارٍ التحميل...</div>
        <div style={{color:C.muted,fontSize:11,marginTop:4}}>مجمع الفلاح التعليمي</div>
      </div>
    </div>
  );
  return(
    <div style={{minHeight:'100vh',background:C.bg,color:C.text,fontFamily:"'Cairo','Tajawal','Segoe UI',Arial,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;}body{margin:0;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:${C.grayL};border-radius:2px;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.1}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(.95)}}
        input::placeholder,textarea::placeholder{color:${C.muted};}
        button:active{transform:scale(.97);}
        select option{color:${C.text};}
      `}</style>
      {adminMode?(
        <>
          <div style={{background:C.teal,padding:'10px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',direction:'rtl',position:'sticky',top:0,zIndex:200}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <img src={LOGO} alt="" style={{height:34,filter:'brightness(0) invert(1)'}}/>
              <span style={{color:C.white,fontWeight:800,fontSize:14}}>⚙️ وضع الإشراف</span>
            </div>
            <button onClick={handleLogout} style={{background:'rgba(255,255,255,.2)',color:C.white,border:'none',borderRadius:8,padding:'5px 12px',cursor:'pointer',fontSize:12}}>خروج</button>
          </div>
          <AdminPage
            students={students}
            pendingReadings={pendingReadings}
            pendingRegs={pendingRegs}
            benefits={benefits}
            topBenefit={topBenefit}
            setTopBenefit={setTopBenefit}/>
        </>
      ):(
        <>
          <Header user={user} onLogout={handleLogout}/>
          <main>
            {needsAuth
              ?<AuthScreen onAdminLogin={()=>setAdminMode(true)}/>
              :(
                <>
                  {page==='home'&&<HomePage students={students} pendingReadings={pendingReadings} benefits={benefits} topBenefit={topBenefit}/>}
                  {page==='race'&&<RacePage students={students}/>}
                  {page==='add'&&<AddPage user={user}/>}
                  {page==='card'&&<CardPage user={user} students={students} benefits={benefits}/>}
                </>
              )
            }
          </main>
          <BottomNav page={page} setPage={setPage}/>
          <div style={{height:70}}/>
        </>
      )}
    </div>
  );
}
