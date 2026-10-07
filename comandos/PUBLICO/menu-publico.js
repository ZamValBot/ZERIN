const config = require('../../config')
module.exports = { run: async (sock,m,args,comandos)=>{
    let txt = `╭─「 ${config.botName} PUBLICO 」─\n`
    for(let c in comandos.PUBLICO) if(!c.startsWith('menu')) txt+=`│ •.${c}\n`
    txt+=`╰──────────────\n ${config.watermark}`
    await sock.sendMessage(m.key.remoteJid,{text:txt},{quoted:m})
}}
