// d.fetch('https://zendata.cephasteom.co.uk/api/book/7', 'holywrit')

let kick = s0
let clap = s1
let hh = s2
let breaks = s3
let sub = s4
let lb = s5
let glitch1 = s6
let glitch2 = s7
let noise1 = s8
let noise2 = s9

z.bpm.toggle(kick.e).if(200,100)
// z.bpm.set(140)
z.set({dist:0.5})
z.q=16

let loop = Math.floor(z.q*2)

// circuit
let p = i => $set(d.holywrit)
  .at($t().mod(d.holywrit.length))
  .at('params')
  .at(i).or(0)
  .mtr(0,1,-Math.PI*2,Math.PI*2)

q0.fb(3).ry(p(0)).rz(p(4)).cx([1],2).ry(p(8)).rz(p(12))
q1.fb(0).ry(p(1)).rz(p(5)).cx([2],1).ry(p(9),1).rz(p(13))
q2.fb(1).ry(p(2)).rz(p(6)).cx([3],0).ry(p(10)).rz(p(14))
q3.fb(2).ry(p(3)).rz(p(7)).ry(p(11)).rz(p(15))

// all streams
streams.slice(0,16).map((s,i) => {
  s.x.qphase(i)
  s.y.qpb(i)
    .mul(1)
  s.e.qm(i%6)
    .degrade(0.5)
    .cache(loop,2)
  s.m.not(s.e)
});

// streams toggle between samp and grains
[glitch1,glitch2,noise1,noise2].map(st => {
  st.set({inst:'1?2*16|*4'})
  st.p.rate.set(st.p.inst).eq(1)
    .if(1,$set(st.y).mtr(1,2).step(0.25))
})

kick.set({
  inst:1,ba:'kick.808',i:9,vol: 1.75,n:57,
  cut:[glitch1.i,glitch2.i,noise2.i,sub.i,lb.i],
})
kick.e
  .set('3:8')
  .degrade('0 0.3*15 | 0.3 0*15')
  .and($not(clap.e))

clap.set({inst:1,bank:'clap808',cut:[noise1.i,noise2.i,sub.i,glitch2.i,lb.i,hh.i]})
clap.p.i.set(clap.x).saw(2,12).step(2)
clap.p.fx0.set(clap.y).mul(0.25)
clap.e.set('0 0 1 0 0 0 0 0 |*3 0')

hh.set({inst:1, bank:'breaks.tech', snap:z.q, lc:0.5, i: 2, dur:ms(4)})
hh.p.begin.saw(0,1,1/2).step(0.125)
hh.e.reset().set(kick.e)

breaks.set({inst:1,ba:'gm.glitch.2b',snap:z.q,vol:1.5,
  a:ms(2),acurve:0.75,
  s:0.5,fx0:0.25,dur:ms(4),lc:0.3
})
breaks.p.begin.set(breaks.y).mtr(0,0.5).step(0.125)
breaks.p.i.set(breaks.x).mul(16).step(1)
breaks.e.set(kick.e)
  
glitch1.set({
  bank:'tune.01', snap:z.q*4, oneshot:1, 
  i:'0?8?9*8|*4', vol: 1.5, d:ms(1), dist: 0,
  cut:[glitch1.i,glitch2.i,noise2.i], 
  a:ms(1),
  acurve:0.75
})
glitch1.p.begin.saw(0,1,1/8)
glitch1.p._pan.noise(0.25,0.5)
glitch1.p.fx0.set(glitch1.y).mul(0.1)
glitch1.e
  .and($not(kick.e))

glitch2.set({
  bank:'pack.jviews', snap:z.q, 
  cut:[glitch1.i,glitch2.i,clap.i,sub.i],
  d:ms(1),vol:1,s:0.25,lag:ms(4),
  delay:0.5,dtime:ms(1/6)
})
glitch2.p.dfb.toggle(clap.e).mul(0.8)
glitch2.p.i.noise(0,16).step(1)
glitch2.p.begin.set(glitch2.y).step(0.125)
glitch2.p._pan.set(glitch1.p._pan).subr(1)
glitch2.p.fx0.set(glitch2.x).mul(0.1)
glitch2.p._n.square(60,72,1/4)
glitch2.e.set(glitch1.e)
  .and('1*16|*4 0|*3')

noise1.set({bank:'gm.horror|*3 gm.radio',oneshot:1,a:ms(4),acurve:0.75,i:'0..32?*16', lc:0.5})
noise1.p.begin.saw(0,1).step(0.125)
noise1.p._pan.noise(0.2,0.5)
noise1.p.fx0.set(noise1.y).mul(0.5)
noise1.e.set(clap.e)

noise2.set({bank:'gm.radio gm.horror',oneshot:1,a:ms(2),acurve:0.75,i:5, lc:0.5, vol:1.5})
noise2.p.i.set('1 |*3 0').if(5, $random(0,32).step(1))
noise2.p.begin.noise(0,1,1/16).step(0.125)
noise2.p._pan.set(noise1.p._pan).subr(1)
noise2.p.fx0.set(noise2.y).mul(0.5)
noise2.e
  .set(glitch1.e)
  .and($not(lb.e))

lb.set({
  inst: 1, dist: 0,
  bank: 'tune.01', dur:ms(4), 
  snap: z.q * 4,
  cut: [0,1,2,3,4,5,6,7,8],
  i: '3?4?5?7?2*16|*4',
  vol: 1.5,
  acurve:0.75
})
lb.p.begin.saw(0,1,1/8)
lb.e.reset().set(kick.e)
lb.m.reset()

fx0.set({dfb:0.7,lc:0.25,_track:10,dist:0})
fx0.p.delay.toggle(kick.e).mul(0.25)
fx0.p.reverb.toggle(kick.e).subr(1).mul(0.5)
    .mul($saw(0.5,1,1/64))
fx0.p._dtime.set(kick.x).mtr(1/16,1/4).step(1/16).btms()
fx0.p.rtail.toggle(clap.e).mtr(0.1,0.5).mul($saw(0.75,1,1/64))
fx0.p.drive.saw(0,0.75,1/64)
fx0.e.every(1)
fx0.m.every(1)

// kick.e.set(0)
clap.e.set(0)
// hh.e.set(0)
breaks.e.set(0)
glitch1.e.set(0)
glitch2.e.set(0)
noise1.e.set(0)
noise2.e.set(0)
lb.e.set(0)

// kick.mute.set('1?0*16')
// clap.mute.set('1?0*16')
// breaks.mute.set('1?0*16')
// glitch1.mute.set('1?0*16')
// glitch2.mute.set('1?0*16')
// noise1.mute.set('1?0*16')
// noise2.mute.set('1?0*16')
// fx0.mute.set('1?0*16')