// d.fetch('https://zendata.cephasteom.co.uk/api/book/7', 'holywrit')
z.set({dist:0.35})
z.q=16

let loop = Math.floor(z.q)

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
  s.y.qpb(i)
    .mul(10)
  s.e.qm(i%4)
    .degrade(0.5)
    .cache(loop,8)
  s.m.not(s.e)
});

let bassfile = 'http://localhost:6060/midi/tune03/tune03-bass.mid'
let bassp = $midifile(bassfile).cache(loop,8)

let kick = s0
let sn = s1
let hh = s2
let breaks = s3
let bass = s5
let noise = s6;
let noise2 = s7;

z.bpm.set(180)

// streams toggle between samp and grains
;[kick,sn,breaks,noise,noise2,hh,bass].map(st => {
  st.p.inst.toggle(kick.e).if(2,1)
  st.p._grainrate.set(st.y).mtr(1,32).step(1)
  st.p.rate.set(st.p.inst).eq(1)
    .if(1,$set(st.y).mtr(0.5,1).step(0.25))
})

kick.set({inst: 1, bank: 'kick.808', cut: [kick.i, bass.i],cutr:ms(0.5),vol:1.5})
kick.p._n.set(bassp).sub(31).mod(12).add(60)
kick.p.i.set($qm(0).if($random(0,16).step(1), 0))
kick.p.amp.set($qm(0).if($random(0.25,0.5), 1))
kick.e
  .degrade(0.8)
  .or('3:8|2:8|1:8')

sn.set({inst: 1, bank:'clap808', i: '6', fx0:0.125, vol:1.5,
  cut: [0,1,2,3,4,5,6,7]
})
sn.p.s.set(sn.y).mtr(0.1,0.5)
sn.p.dur.set(sn.x).mtr(1,0.1).btms()
sn.e.reset().set('0 0 0 1?0 0 0 0 0 |*8')

bass.set({inst: 1, cut:bass.i, bank: 'lb02', dur:ms(4),dist:0,vol:1.5})
bass.p.i.set(4)
bass.p.n.set(bassp).sub(24).mod(12).add(60)
bass.e
  .and($not(kick.e))
  .or(sn.e)
  .and($odd())

hh.set({inst: 1, snap:z.q*2, lc:0.75, dur:ms(8), vol:1, bank:'breaks.tech'})
hh.e.reset().set(kick.e).or(sn.e)
  .and('1*16|*4 0*16|*2')
hh.p._pan.set(breaks.p._pan).subr(1)
hh.p.i.set(hh.x).mul(16).step(1)
hh.p.begin.set(kick.e).if(0, $saw(0,1,1))

breaks.set({cut: [breaks.i,hh.i], bank: 'breaks.90.4b', lc:0.3, dur:ms(4), acurve:0.75, vol:1})
breaks.p.a.set(kick.e).if(1,0).btms()
breaks.p._pan.noise(0.25,0.75,1/4)
breaks.p.snap.set(kick.e).if(2,3).mul(z.q)
breaks.p.i.set(breaks.y).mul(4).step(1)
breaks.p._grainrate.set(breaks.y).mtr(1,32).step(1)
breaks.p._hc.set(breaks.y).mtr(1,0.75)
breaks.p.fx0.set(breaks.y).mtr(0,0.125)
breaks.p.begin.saw(0,1,1/4)
breaks.e.or(kick.e)
  .and('1*16|*6 0*16|*2')
  .and($every(2).or($every(3)))

noise.set({inst: 1, bank: 'tune.02',snap:z.q*1.75, fx0:0.5, lc:0.5,vol:1.5})
noise.p.i.set(noise.y).mtr(6,10).step(1)
noise.p.begin.saw(0,1,1/7)
noise.p.dur.midifile(bassfile, 'dur').btms()
noise.e.set(kick.e)

noise2.set({inst: 1, bank: 'tune.02', lc:0.5, a:ms(2), acurve:0.75, dur:ms(4), vol:2,lag:ms(2)})
noise2.p.i.random(18,23).step(1)
noise2.p.begin.saw(0,1,1/4)
noise2.p._fx0.set(noise2.y).mtr(0,0.25)
noise2.p._level.set(noise2.y).subr(1).mul(0.25)
noise2.e.reset().set(sn.e)

fx0.set({dfb:0.8,lc:0.3,_track:10,dtime:17.75})
fx0.p.delay.set(kick.p.n).mod(12).eq(0).mtr(0,0.75)
fx0.p.reverb.toggle(kick.e).mul(0.5)
fx0.p.rtail.io(sn.e,kick.e).mtr(0.1,0.35)
fx0.e.set(kick.e).or(sn.e)