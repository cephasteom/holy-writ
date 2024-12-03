// d.fetch('https://zendata.cephasteom.co.uk/api/book/7', 'holywrit')
z.set({dist:0.35})
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
  s.y.qpb(i).mul(10)
  s.e.qm(i%6)
    .degrade(0.75)
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
let drone = s8;

z.bpm.set(160)

// streams toggle between samp and grains
;[breaks,noise2].map(st => {
  st.p.inst.io(kick.e,sn.e).if(2,1)
  st.p.rate.set(st.p.inst).eq(1)
    .if(1,$set(st.y).mtr(0.5,1).step(0.25))
})

kick.set({inst: 1, bank: 'kick.808', cut: [kick.i, bass.i, noise.i, breaks.i],cutr:ms(0.5),vol:1.5})
kick.p.n.set(bassp).sub(31).mod(12).add(60)
kick.p.i.set(kick.x).mul(16).step(1)
kick.e.or('1|0|*3')

sn.set({inst: 1, bank:'claps.rare', i: 3, fx0:0.125, vol:1.1,
  cut: [0,1,2,3,4,5,6]
})
sn.p.pan.set(breaks.p._pan).subr(1)
sn.e.reset().set('0 0 0 1 0 0 0 0 | 0')

bass.set({inst: 1, cut:bass.i, bank: 'lb02', dur:ms(4),dist:0,vol:1.5})
bass.p.i.set('4')
bass.p.n.set(bassp).sub(24).mod(12).add(60)
bass.e.reset().set(kick.e)

hh.set({inst: 1, snap:z.q, lc:0.75, dur:ms(8), vol:1.5, cut:breaks.i})
hh.e.reset().set(kick.e).or(sn.e)
  .and('1*16|*4 0*16|*2')
hh.p._pan.set(hh.x).mtr(0.1,0.7)
hh.p.i.set(hh.x).mul(16).step(1)
hh.p.begin.set(kick.e).if(0, $saw(0,1,1))
hh.p.bank.set(kick.e).if('breaks.tech', 'gm.glitch.2b')

breaks.set({cut: [breaks.i,bass.i,hh.i], bank: 'breaks.hp', lc:0.3, dur:ms(4), acurve:0.75, vol:0.7, hc:0.3})
breaks.p.a.set(kick.e).if(1,0).btms()
breaks.p._pan.set(breaks.y).mtr(0.75,0.3)
breaks.p.snap.set(kick.e).if(1,2).mul(z.q)
breaks.p.i.set(breaks.y).mul(4).step(1)
breaks.p.fx0.set(breaks.y).mtr(0,0.125)
breaks.p.begin.saw(0,1,1/4)
breaks.e.or(kick.e)
  .and('1*16|*6 0*16|*2')
  .and($every(2).or($every(3)))

noise.set({inst: 1, bank: 'tune.02',snap:z.q*1.75, fx0:0.25, lc:0.5, vol: 1.5})
noise.p.i.set(noise.y).mul(5).step(1).seq([6,7,8,9,10,11])
noise.p.begin.saw(0,1,1/7)
noise.p.dur.midifile(bassfile, 'dur').btms()
noise.p._pan.noise(0.3,0.7)
noise.e.set(kick.e)

noise2.set({inst: 1, bank: 'gm.horror', lc:0.5, a:ms(2), acurve:0.75, dur:ms(4), vol:1.5,lag:ms(2)})
noise2.p.i.random(0,32).step(1)
noise2.p.begin.saw(0,1,1/4)
noise2.p._fx0.set(noise2.y).mtr(0,0.25)
noise2.p._level.set(noise2.y).subr(1).mul(0.25)
noise2.p._pan.set(1).sub(noise.p._pan)
noise2.e.reset().set(sn.e)

fx0.set({dfb:0.8,lc:0.3,_track:10,dtime:17.75})
fx0.p.delay.set(kick.p.n).mod(12).eq(0).mtr(0,0.75)
fx0.p.reverb.toggle(kick.e).mul(0.5)
fx0.p.rtail.io(sn.e,kick.e).mtr(0.1,0.35)
fx0.e.set(kick.e).or(sn.e)

// kick.e.set(0)
sn.e.set(0)
hh.e.set(0)
breaks.e.set(0)
bass.e.set(0)
// noise.e.set(0)
// noise2.e.set(0)
// drone.e.set(0)

// N.B. This is where the piece stops...