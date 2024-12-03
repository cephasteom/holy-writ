let vox = s9

vox.set({inst: 1, bank: 'vox.borges', 
  i: 5, dur:ms(34), lc:0.3, vol:0.5, re:0.5, lag:ms(1)
})
vox.p._rate.noise(0.75,1,1/4)
vox.e.once()
vox.m.set(1)