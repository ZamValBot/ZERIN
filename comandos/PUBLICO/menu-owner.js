const config = require('../../config')

module.exports = {
    run: async (sock, m, args, comandos) => {
        let txt = `╭─「 💎 ${config.botName} MENU OWNER 」─\n`
        txt += `│ _Todos pueden ver este menú_\n`
        txt += `│ _Pero solo owners de ZERIN pueden usar los comandos_\n│\n`

        if (Object.keys(comandos.OWNER).length === 0) {
            txt += `│ • Aún no hay comandos owner\n`
        } else {
            for (let cmd in comandos.OWNER) {
                txt += `│ • .${cmd}\n`
            }
        }

        txt += `│\n├─ ℹ️ Si no eres owner:\n`
        txt += `│ ❌ ZERIN dirá "Solo owners de ZERIN"\n`
        txt += `╰──────────────\n ${config.watermark} - Solo dueños`

        await sock.sendMessage(m.key.remoteJid, { text: txt }, { quoted: m })
    }
}
