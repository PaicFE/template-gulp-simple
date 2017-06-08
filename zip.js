const shell = require('shelljs')
const config = require('./gulpfile.config')
const fs = require('fs')

shell.cd(config.dev)

const filename = config.file

if (!fs.existsSync(filename)) return

const time =new Date()
const fillZero = number => number < 10 ? '0' + number : '' + number
const month = fillZero(time.getMonth()+1)
const day = fillZero(time.getDate())
const hour = fillZero(time.getHours())
const minute = fillZero(time.getMinutes()) 

const newname = config.file + month + day+ hour + minute

shell.cp('-r', filename, newname)
shell.exec('zip -r ' + newname + '.zip ' + newname + ' -x "*/.svn;*/CVS;*/.git;*/.gitignore;*/.DS_Store;"')
shell.rm('-r', newname)
