let vox = s9

vox.set({inst: 1, bank: 'vox.borges', 
  i: 7, dur:ms(40), lc:0.3, vol:0.5, re:0.5, lag:ms(1)
})
vox.p._rate.saw(1,0.5,1/16)
vox.e.once()
vox.m.set(1)