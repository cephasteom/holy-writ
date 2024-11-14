// d.fetch('https://zendata.cephasteom.co.uk/api/book/7', 'holywrit')
z.set({
  dist:0.35
})
z.q=16

let loop = Math.floor(z.q)
let fill = $c().mod(8).eq(7)

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
    // .add($noise())
    .mod(1)
  s.y.qpb(i)
    // .mul(5)
    .mod(1)
  s.e.set(fill).if(
    $qm(i%4).degrade(0.75).cache(loop,4),
    $qm(i%4).degrade(0.5)
  )
  s.m.not(s.e)
});

let bassfile = 'http://localhost:6060/midi/tune03/tune03-bass.mid'
let bassp = $midifile(bassfile).cache(loop,8)

let kick = s0
let sn = s1
let hh = s2
let breaks = s3
let bass = s5
let layer1 = s8
let layer2 = s7
let layer3 = s8

z.bpm.set(180)

kick.set({inst: 1, bank: 'kick.808', cut: [kick.i, noise.i, breaks.i, bass.i, hh.i, layer1.i],cutr:ms(0.5),vol:1.5, hc:0.5})
kick.p.n.set(bassp).sub(31).mod(12).add(60)
  .add($set('3:8').if(0,12))
kick.p.dur.set('1 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0').if(1, 1/16).btms()
kick.p.i.set('3:8').if(5, 0)
kick.e
  .and($even())
  .or('3:8')

sn.set({inst: 1, bank:'toms808', i: 0, vol:1.1,
  cut: [0,1,2,3,5,6,7,8],dist:0,
  // fx0:0.5
})
sn.p.n.set(bassp).sub(34).mod(12).add(60)
sn.p.dur.set(sn.y).mtr(0.25,1).btms()
sn.p.s.saw(0.25,1,1/16)
sn.p.pan.set(breaks.p._pan).subr(1)
sn.e.reset().set('0 0 1 0 0 0 0 0 | 0')

hh.set({inst: 1, bank: 'gm.glitch.2b', dur:20, vol:2, r:5, snap:z.q*2, 
  cut:[breaks.i],
  cutr:ms(0.5), s:0.5})
hh.p.lc.set(hh.p.inst).eq(1).if(0.5, 0)
hh.p.amp.random(0.5,1).cache(loop,4)
hh.p._pan.set(breaks.p._pan).subr(1)
hh.p.i.set(hh.y).mul(16).step(1).cache(loop,4)
hh.p.begin.saw(0,1,1/2)
hh.e.reset()
  .every('1|*16 2|*16')
  // .every(1)
  .and($not(breaks.e))
  .and($not(sn.e))

breaks.set({inst:1, lc:0.3, vol:0.8, cut:[breaks.i,noise.i,hh.i,layer1.i],s:0,a:0})
breaks.p.dur.set('1 0 0 1 0 0 0 0 0').if(1.5,1).btms()
breaks.p.d.set('1 0 0 1 0 0 0 0 0').if(1.5,1).btms()
breaks.e.reset()
  .set(kick.e)
  .and($square(0,1,1/32))
breaks.p._pan.set(breaks.x).mtr(0.25,0.75)
breaks.p.s.saw(0.25,1,1/16)
breaks.p.i.set(fill).if(
  8,
  $set(breaks.x).mul(16).step(1)
)
breaks.p.snap.set(z.q/2)
breaks.p.bank.set('breaks.145')

layer1.set({
  lag:ms(1/4),
  inst:7,
  d:50,
  s:0.1,
  r:1000,
  op2a:0,
  op2d:10,
  op2ratio:1.5,
  dist:0,
  // fx0:0.5,
  level:0.35
})
layer1.p.n.set('3:8')
  .if('Gmi%3','Gmi9%8')
  .sub(36).add($set('3:8').if(0,12))
layer1.p.strum.set('3:8').if(0,1/4).btms()
layer1.p.dur.set('3:8').if(1,1/8).btms()
layer1.p.amp.set('3:8').if(1,0.5)
layer1.p.cut.not('3:8').if(layer1.i)
layer1.e
  .add($even())
  .and($not(sn.e))
  .and($not(breaks.e))
  .or('3:8')
layer1.p._op2gain.set(layer1.x).mtr(10,100)
layer1.p._op2s.set(layer1.y).mtr(0.01,1)
layer1.p.op3gain.set(layer1.y).mtr(1,0)
layer1.p.op3ratio.set(layer1.x).mtr(1,11).step(1)
layer1.p.fx0.saw(0,0.5,1/32)
layer1.m.reset().not('3:8')

fx0.set({dfb:0.5,lc:0.3,_track:10,dtime:ms(0.25)})
fx0.p.delay.set(kick.p.n).mod(12).eq(0).mtr(0,0.75)
fx0.p.reverb.io(sn.e,kick.e).mtr(0.1,0.5)
fx0.p.rtail.io(sn.e,kick.e).mtr(0.1,0.35)
fx0.e.set(kick.e).or(sn.e)