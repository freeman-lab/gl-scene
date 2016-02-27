var budo = require('budo')
var demo = process.argv[2]

budo.cli(['demos/' + demo +'.js'])