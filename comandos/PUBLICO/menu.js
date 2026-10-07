const config = require('../../config')
module.exports = {
    run: async (sock, m, args, comandos) => {
        let txt = `╭─「 ${config.botName} MENU 」─\n│\n├─👤 PUBLICO\n`
        for (let cmd in comandos.PUBLICO) { if(!cmd.startsWith('menu')) txt+=`│ •.${cmd}\n` }
        txt+=`│\n├─👑 ADMIN\n`
        for (let cmd in comandos.ADMIN) txt+=`│ •.${cmd}\n`
        txt+=`│\n╰──────────────\n ${config.watermark}`
        await sock.sendMessage(m.key.remoteJid, {text: txt}, {quoted:m})
    }
}
