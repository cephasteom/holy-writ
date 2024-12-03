z.set({dist:0.1})

;[s0,s1,s2,s3,s5,s6,s7,s8,s9,fx0].map(s => {
  s.set({inst:1,fx0:0.1})
  s.e.every(4)
  s.set({vol:0.1})
})

s0.set({hc: 0.1})
s2.set({lc: 0.1})
;[s3,s7,s8,s9].map(s => s.set({inst: '1 2', lc: 0.1}))
s3.set
s4.set({inst: 6})
s6.set({bank: 'gm.static'})
s8.set({inst: '0 1 2 1'})
s9.set({bank: 'vox.borges', i: '0 1 2 3 4 5 6 7', lc:0.1})
s9.e.reset().every(1)

fx0.set({re:1, de:0.5, _track:10, lc: 0.1})