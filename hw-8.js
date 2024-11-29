// d.fetch('https://zendata.cephasteom.co.uk/api/book/7', 'holywrit')
z.q=16
z.bpm.set(140)
z.set({dist:0.4})

let loop = Math.floor(z.q)
let fill = $c().mod(8).eq(7)
let kpat = '3:8*2'
let kick = s0
let sn = s1
let hh = s2
let tom = s3

// circuit
let p = i => $set(d.holywrit)
  .at($t().mod(d.holywrit.length))
  .at('params')
  .at(i).or(0)
  .mtr(0,1,-Math.PI*2,Math.PI*2)

q0.ry(p(0)).rz(p(4)).cx([1],2).ry(p(8)).rz(p(12))
q1.ry(p(1)).rz(p(5)).cx([2],1).ry(p(9),1).rz(p(13))
q2.ry(p(2)).rz(p(6)).cx([3],0).ry(p(10)).rz(p(14))
q3.ry(p(3)).rz(p(7)).ry(p(11)).rz(p(15))

// all streams
streams.slice(0,16).map((s,i) => {
  s.x.qphase(i).mod(1)
  s.y.qpb(i).mod(1).mul(10)
  s.e.set(fill).if(
    $qm(i%4).degrade(0.25),
    $qm(i%4).degrade(0.5).cache(loop,4)
  )
});

let bassfile = 'http://localhost:6060/midi/tune03/tune03-bass.mid'
let bassp = $midifile(bassfile).cache(loop,8)

kick.set({inst: 1, bank: 'kick.808', cut:[kick.i,hh.i,tom.i], vol:1.5, hc:0.5})
kick.p.n.set(bassp).sub(31).mod(12).add(60).add($set(kpat).if(0,12))
kick.p.dur.set('1 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0').if(1, 1/4).btms()
kick.p.i.set(kpat).if(5, 0)
kick.e.or(kpat)

sn.set({inst: 1, bank: 'toms808', cut:[kick.i,hh.i],dur:ms(1/2)})
sn.p.n.set(bassp).sub(36).mod(12).add(48)
sn.e
  .or('0 0 1 0 0 0 0 0 | 0')
  .and($not(kick.e))

hh.set({inst: 1, bank: 'clap', dur:10, d:10, s:0.1, r:10, cut:[kick.i,sn.i], lc:0.3, i:5,track:0})
hh.p.r.set(hh.y).mtr(10,20).step(1)
hh.e.reset()
  .every(4)
  .and($not(sn.e))

tom.set({inst: 1, bank: 'rs808', s:0.5, track:0})
tom.p.i.set(tom.y).mul(16).step(1).cache(z.q,4)
tom.e.reset()
  .set(kick.e)
  .and($not(kpat))
  .and($not(hh.e))
  // .or('1*16')