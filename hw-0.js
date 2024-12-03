let lo = $noise(40,60,1/3); 
let hi = $noise(320,280,1/5);
// z.bpm.sine(lo,hi,'0.25|*3 0.125|*5 0.5|*3').step(1)
z.bpm.cosine(hi,lo,1/4).step(1)

let static1 = s6
let noise1 = s7
let tones = s8
let vox = s9

static1.set({
  inst: 1, 
  bank: 'gm.static', i: 2, begin:0, n:56, detune:0.1,
  // bank: 'tune.06', i: 6, begin:0.1, n:48,
  cut:static1.i,
  a:0, d:10, r:100,
  dfb:0.85,
  lag:ms(1/4),
  lc:0.2,
})
// static1.p.n.set(tones.p._n).sub(39)
static1.p.s.set(z.bpm).mtr(0.1,1,lo,hi)
static1.p._fx0.set(z.bpm).mtr(0,$saw(0.5,1,1/24),lo,hi)
static1.p._level.set(static1.p._fx0).subr(1)
static1.p._hc.set(z.bpm).mtr(1,0,lo,hi)
static1.p.dur.set(1/(z.q*2)).btms()
static1.p.pan.set(z.bpm)
  .mtr(0,1,lo,hi)
  .subr($c().mod(32).lt(16).if(1,0))
  .abs()
static1.p.dist.saw(0,0.5,1/64)
static1.e.every(1)
static1.m.every(1)

noise1.set({inst:1,bank:'tune.02',dur:ms(32),cut:noise1.i,i:7,fx0:0.25})
noise1.p._rate.set(z.bpm).mtr(1,8,lo,hi)
noise1.p._hc.set(z.bpm).mtr(0.75,0.25,lo,hi)
noise1.p._pan.set(static1.p.pan).subr(1).mtr(0.2,0.8)
noise1.e.every(32)
noise1.m.set(1)

tones.set({inst:0,
  delay:.5, _dtime:ms(2), dcolour:0.25,
  vol:.5,mods:0.1, dfb:0.25
})
tones.p._n
  .set(z.bpm).mtr(0,16,lo,hi).step(1).add(1)
  .set('83 Ador%16..*15')
tones.p._fx0.set(z.bpm).mtr(0,$saw(0.25,0.5,1/24),lo,hi)
tones.p._level.set(tones.p._fx0).subr(1)  
tones.p.s.set(z.bpm).mtr(0.05,0.5,lo,hi)
tones.p._modi.set(z.bpm).mtr(0.1,1,lo,hi)
tones.p.dur.set(z.bpm).mtr(1/32,1/8,lo,hi).btms()
tones.e.set(z.bpm).gt(100).if($every('1?2*16'), static1.e)
tones.p._hc.set(z.bpm).mtr(0.5,1,lo,hi)
tones.p.amp.set(z.bpm).mtr(0.25,1,lo,hi)
tones.p._pan.set(static1.p.pan).subr(1).mtr(0.4,0.6)
tones.m.not(tones.e)

vox.set({inst: 1, bank: 'vox.borges', 
  i: 3, dur:ms(34), lc:0.3, vol:0.5, re:0.5, lag:ms(1)
})
vox.p._rate.noise(0.75,1.25,1/4)
vox.e.every(z.q*8)
vox.m.set(1)

fx0.set({dfb:0.5,lc:0.3,_track:10,re:0.25,rtail:0.1,rsize:0.25,dtime:ms(1/100),dfb:0.85,de:0.25})
fx0.p._dcolour.set(z.bpm).mtr(0.01,0.5,lo,hi)
fx0.e.set(1)
fx0.m.set(1)

static1.mute.set(0)
noise1.mute.set(1)
tones.mute.set(1)
vox.mute.set(1)