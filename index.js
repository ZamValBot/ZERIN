const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const pino = require('pino')
const qrcode = require('qrcode-terminal')
const config = require('./config')
const { cargarComandos } = require('./lib/loader')

let comandos = cargarComandos()

async function startZerin() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["ZERIN BOT", "Chrome", "1.0"]
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update
        if (qr) {
            console.log("QR ZERIN:")
            qrcode.generate(qr, { small: true })
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) startZerin()
        } else if (connection === 'open') {
            console.log(`✅ ${config.botName} CONECTADO`)
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const m = messages[0]
            if (!m.message || m.key.fromMe) return
            
            const jid = m.key.remoteJid
            const texto = m.message.conversation || m.message.extendedTextMessage?.text || ""
            if (!texto.startsWith(config.prefix)) return

            const args = texto.slice(config.prefix.length).trim().split(/ +/)
            const cmd = args.shift().toLowerCase()

            let tipoComando = null, comandoFile = null
            for(let t of ["PUBLICO","ADMIN","OWNER"]){
              if(comandos[t] && comandos[t][cmd]){ tipoComando=t; comandoFile=comandos[t][cmd]; break }
            }
            if(!comandoFile) return

            const sender = m.key.participant || m.key.remoteJid

            // PROTECCION - YA SIN ERROR DE AWAIT
            if(tipoComando === "OWNER" && !config.owners.includes(sender)) {
                await sock.sendMessage(jid, { text: `❌ Solo owners de ${config.botName} pueden usar .${cmd}\n\n${config.watermark}` }, { quoted: m })
                return
            }

            if(tipoComando === "ADMIN" && jid.endsWith('@g.us')) {
                const groupMeta = await sock.groupMetadata(jid)
                const participant = groupMeta.participants.find(p=>p.id === sender)
                const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin'
                const isOwnerBot = config.owners.includes(sender)
                if(!isAdmin && !isOwnerBot) {
                    await sock.sendMessage(jid, { text: `❌ Solo admins pueden usar .${cmd}\n\n${config.watermark}` }, { quoted: m })
                    return
                }
            }

            comandos = cargarComandos()
            await comandoFile.run(sock, m, args, comandos)

        } catch(e) {
            console.log("Error ZERIN:", e)
        }
    })
}

startZerin()
