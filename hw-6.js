// d.fetch('https://zendata.cephasteom.co.uk/api/book/7', 'holywrit')
z.set({dist:0.35,cutr:ms(1/2)})
z.q=16

let loop = Math.floor(z.q*0.75)

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
    .add($noise())
  s.y.qpb(i)
    .mul(10)
  s.e.qm(i%4)
    .degrade(0.75)
    .cache(loop,16)
  s.m.not(s.e)
});

let bassfile = 'http://localhost:6060/midi/tune03/tune03-bass.mid'
let bassp = $midifile(bassfile).cache(loop,8)

let kick = s0
let sn = s1
let hh = s2
let breaks = s3
let bass = s5
let noise = s6

z.bpm.set(160)

kick.set({inst: 1, bank: 'kick.808', cut: [kick.i, noise.i, breaks.i],cutr:ms(0.5),vol:1.5})
kick.p.n.set(bassp).sub(31).mod(12).add(60)
kick.p.i.set(kick.x).mul(16).step(1)
// kick.e.or('1|0|*3')
kick.e.or('3:8')

sn.set({inst: 1, bank:'clap', i: 0, vol:1.1, s:0.1,
  cut: [0,1,2,3,4,5,6]
})
sn.p.dur.set(sn.y).mtr(0,0.5).btms()
sn.p.pan.set(breaks.p._pan).subr(1)
sn.e.reset().set('0 0 0 1 0 0 0 0 | 0')

breaks.set({inst:1, snap:z.q/2, lc:0.3, dur:ms(1), vol:1, cut:[breaks.i,noise.i]})
breaks.e.reset()
  .set(kick.e).or(sn.e)
  .and('1*16|*8 0*16|*8')
breaks.p._pan.set(breaks.x).mtr(0.25,0.75)
breaks.p.i.set(breaks.x).mul(16).step(1)
breaks.p.begin.set(kick.e).if(0, $saw(0,1,1))
breaks.p.bank.set(kick.e).if('breaks.145')

hh.set({inst: 1, bank: 'hh2', dur:ms(1/16), vol:0.5, n:72})
hh.p.lc.set(hh.p.inst).eq(1).if(0.5, 0)
hh.p.amp.random(0.25,1).cache(loop,8)
hh.p._pan.set(breaks.p._pan).subr(1)
hh.p.i.set(hh.y).mul(16).step(1)
hh.p.fx0.set(hh.y).mtr(0,0.05)
hh.e.reset()
  // .every(2).or($every(3))
  .every(1)
  .and($not(breaks.e))
  .and($not(sn.e))
  .and($not(kick.e))

bass.set({inst: 1, cut:[bass.i,noise.i], dur:ms(4), bank:'gm.drones',
  dist:0,
  vol:1.5,
  a:ms(1),
  i:7,
  acurve:0.75,
  n:48,
  // fx0:0.25
})
bass.p.begin.set(bass.y).mtr(0,0.5)
bass.e.reset().set(kick.e)

// noise.set({inst: 1, cut:bass.i, dur:ms(4), bank:'lb03.145',
//   dist:0,
//   vol:1.5,
//   // a:ms(1),
//   i:1,
//   // acurve:0.75,
// })
// noise.e.reset().set(sn.e)

fx0.set({dfb:0.8,lc:0.3,_track:10,dtime:17.75})
fx0.p.delay.set(kick.p.n).mod(12).eq(0).mtr(0,0.75)
fx0.p.reverb.toggle(kick.e).mul(0.5)
fx0.p.rtail.io(sn.e,kick.e).mtr(0.1,0.35)
fx0.e.set(kick.e).or(sn.e)


bass.e.set(0)