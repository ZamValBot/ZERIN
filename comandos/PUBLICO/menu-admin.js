const config = require('../../config')

module.exports = {
    run: async (sock, m, args, comandos) => {
        let txt = `╭─「 👑 ${config.botName} MENU ADMIN 」─\n`
        txt += `│ _Todos pueden ver este menú_\n`
        txt += `│ _Pero solo admins pueden usar los comandos_\n│\n`

        if (Object.keys(comandos.ADMIN).length === 0) {
            txt += `│ • Aún no hay comandos admin\n`
        } else {
            for (let cmd in comandos.ADMIN) {
                txt += `│ • .${cmd}\n`
            }
        }

        txt += `│\n├─ ℹ️ Si no eres admin:\n`
        txt += `│ ❌ ZERIN dirá "Solo admins"\n`
        txt += `╰──────────────\n ${config.watermark}`

        await sock.sendMessage(m.key.remoteJid, { text: txt }, { quoted: m })
    }
}
