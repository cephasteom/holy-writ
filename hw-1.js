let kick = s0
let clap = s1
let breaks = s3
let sub = s4
let lb = s5
let glitch1 = s6
let glitch2 = s7
let noise1 = s8
let noise2 = s9

let pbs = $qpbs().fn(a => a.filter(p=>p>0.02))

z.bpm.toggle(kick.e).if(140,105)
z.set({dist:0.25,cutr:ms(1/8)})
z.q=12

qubits.slice(0,6).map((qubit,i,arr) => {
  const isLast = i === arr.length - 1
  const position = i%2 ? 2 : 0
  const entangle = isLast ? 0 : i+1
  qubit
    .fb(i)
    .rx($noise())
    .ry($saw(0.2,0.4,1/4), position)
    .cx(entangle, isLast ? 1 : 0)
});

// all streams
streams.slice(0,10).map(st => {
  st.x.set(1/16 * st.i);
  st.y.set(pbs).at(st.i).mul(10);
  st.m.every(1)
});

// streams triggered by circuit
[kick,glitch1,glitch2].map((st,i) => {
  st.e.qm(i)
    .degrade('0.5|*7 0.25')
    .cache(z.q,3/(i+1))
});

// streams toggle between samp and grains
[breaks,glitch1,glitch2,noise1,noise2].map(st => {
  st.set({inst:'1?2*16|*4'})
  st.p.rate.set(st.p.inst).eq(1)
    .if(1,$set(st.y).mtr(0.5,2).step(0.25))
    .mul($set(st.y).gt(0.5).if(-1,1))
})

kick.set({
  inst:1,ba:'bd808',i:9,hc:0.75, vol: 2,
  cut:[breaks.i,glitch1.i,glitch2.i,noise2.i,sub.i,lb.i]
})
kick.e.set('3:8')
  .degrade('0 0.3*15 | 0.3 0*15')
  .and($not(clap.e))
  .and($not(lb.e))

clap.set({inst:1,bank:'clap',cut:[noise1.i,noise2.i,sub.i,lb.i,breaks.i]})
clap.p.i.set([0,5]).at($set(clap.y).mul(2).step(1))
clap.e.set('0 0 0 0 0 0 1 0 | 0')

breaks.set({ba:'breaks.archn',snap:z.q,vol:1,a:ms(4),acurve:0.75,dur:ms(2),s:0.25})
breaks.p.begin.set(breaks.y).step(0.125).subr(1)
breaks.p.i.set(breaks.y).mul(16).step(1)
breaks.e.set(kick.e)
  .and($every(2))
  .and($not(lb.e))

sub.set({inst: 6, n:36, dur:ms(1.5)})
sub.p.acurve.saw(0.75,0.5,1/8)
sub.p.lfodepth.set(sub.y).saw(1,0.5)
sub.p.a.set(sub.y).saw(1.5,3).step(0.5).btms()
sub.p.lforate.set(kick.y).saw(1.75,7).step(1.75)
sub.e.set(kick.e)
  .and($not(lb.e))

lb.set({
  inst: 1, dist: 0,
  bank: 'lb02', dur:ms(4), 
  cut: [0,1,2,3,4,5,6,7,8]
})
lb.p.i.random(0,8).step(1)
lb.e.set(clap.e)  

glitch1.set({
  bank:'gm.glitch.4b', snap:z.q*2, oneshot:1, 
  i:12, vol: 1.75, d:ms(1), s:0.5,
  cut:[breaks.i,glitch1.i,glitch2.i,noise2.i], 
})
glitch1.p.begin.saw(0,1).step(0.125)
glitch1.p._pan.noise(0.25,0.5)
glitch1.p.fx0.set(glitch1.y)
glitch1.e
  .and($not(kick.e))
  .and($not(lb.e))
  .and($odd())

glitch2.set({
  bank:'gm.glitch.2b', snap:z.q, oneshot:1, 
  cut:[glitch1.i,glitch2.i,clap.i,sub.i],
  i: 2, d:ms(1),vol: 1.75,s:0.5
})
glitch2.p.begin.saw(0,1).step(0.125)
glitch2.p._pan.set(glitch1.p._pan).subr(1)
glitch2.p.fx0.set(glitch2.y)
glitch2.e
  .and($not(glitch1.e))
  .and($not(lb.e))
  .and($even())

noise1.set({bank:'gm.radio',oneshot:1,a:ms(4),acurve:0.75,i:'8..11?*16', lc:0.5})
noise1.p.begin.saw(0,1).step(0.125)
noise1.p._pan.noise(0.2,0.5)
noise1.p.fx0.set(noise1.y).mul(0.5)
noise1.e.set(glitch2.e)
  .and($not(lb.e))

noise2.set({bank:'gm.radio',oneshot:1,a:ms(2),acurve:0.75,i:5, lc:0.5, vol:1.5})
noise2.p.begin.noise(0,1,1/16).step(0.125)
noise2.p._pan.set(noise1.p._pan).subr(1)
noise2.p.fx0.set(noise2.y).mul(0.5)
noise2.e
  .set(glitch1.e)
  .and($not(lb.e))

fx0.set({dfb:0.8,lc:0.25,_track:10})
fx0.p.delay.toggle(kick.e).mul(0.75)
fx0.p.reverb.toggle(kick.e).subr(1).mul(0.5)
fx0.p.dtime.set(kick.y).mtr(1/16,12/16).step(1/16)
fx0.p.rtail.toggle(clap.e).mtr(0.1,0.5)
fx0.e.every(1)

// kick.e.set(0)
// sub.e.set(0)
clap.e.set(0)
breaks.e.set(0)
glitch1.e.set(0)
glitch2.e.set(0)
noise1.e.set(0)
noise2.e.set(0)
lb.e.set(0)

// kick.mute.set('1?0*16')
// clap.solo.set(0)
// breaks.mute.set('1?0*16')
// glitch1.mute.set('1?0*16')
// glitch2.mute.set('1?0*16')
// fx0.mute.set(1)