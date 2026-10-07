const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const pino = require('pino')
const express = require('express')
const qrcode = require('qrcode-terminal')
const config = require('./config')
const { cargarComandos } = require('./lib/loader')

const app = express()
let qrActual = null
let estado = "Iniciando ZERIN..."

app.get('/', (req, res) => {
    if (!qrActual) {
        return res.send(`<body style="background:#111;color:#fff;font-family:sans-serif;text-align:center;padding:30px"><h1>ZERIN BOT - ${estado}</h1><p>Si ya está conectado, ignora esto.</p><script>setTimeout(()=>location.reload(),5000)</script></body>`)
    }
    const qrLink = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrActual)}`
    res.send(`
    <body style="background:#111;color:white;font-family:sans-serif;text-align:center;padding:20px">
      <h1>⚡ ZERIN BOT - ESCANEA EL QR ⚡</h1>
      <p>${estado}</p>
      <img src="${qrLink}" style="width:300px;background:white;padding:10px;border-radius:10px"/>
      <p>Expira en 20s</p>
      <script>setTimeout(()=>location.reload(),20000)</script>
    </body>
    `)
})

const PORT = 8080
app.listen(PORT, () => console.log(`Web QR en puerto ${PORT} - Usa Web Preview en Cloud Shell`))

let comandos = cargarComandos()

async function startZerin() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["ZERIN BOT", "Chrome", "1.0"],
        printQRInTerminal: false
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update
        if (qr) {
            qrActual = qr
            estado = "Escanea el QR"
            console.log("=== NUEVO QR - ESCANEA EN TERMINAL ===")
            qrcode.generate(qr, { small: true })
            console.log("O abre Web Preview en Cloud Shell puerto 8080")
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut
            console.log("Desconectado, reconectando:", shouldReconnect)
            if (shouldReconnect) startZerin()
            else { qrActual = null; estado = "Desconectado" }
        } else if (connection === 'open') {
            qrActual = null
            estado = `✅ CONECTADO COMO ${config.botName}`
            console.log(estado)
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const m = messages[0]
            if (!m.message || m.key.fromMe) return
            const jid = m.key.remoteJid
            const texto = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || ""
            console.log(`MSG de ${jid}: ${texto}`)
            if (!texto.startsWith(config.prefix)) return
            const args = texto.slice(config.prefix.length).trim().split(/ +/)
            const cmd = args.shift().toLowerCase()

            let tipoComando = null, comandoFile = null
            for(let t of ["PUBLICO","ADMIN","OWNER"]){
              if(comandos[t] && comandos[t][cmd]){ tipoComando=t; comandoFile=comandos[t][cmd]; break }
            }
            if(!comandoFile) { console.log(`Comando no encontrado: ${cmd}`); return }

            const sender = m.key.participant || m.key.remoteJid
            if(tipoComando === "OWNER" &&!config.owners.includes(sender)) {
                await sock.sendMessage(jid, { text: `❌ Solo owners` }, { quoted: m }); return
            }
            if(tipoComando === "ADMIN" && jid.endsWith('@g.us')) {
                const groupMeta = await sock.groupMetadata(jid)
                const isAdmin = groupMeta.participants.find(p=>p.id === sender)?.admin
                const isOwnerBot = config.owners.includes(sender)
                if(!isAdmin &&!isOwnerBot) {
                    await sock.sendMessage(jid, { text: `❌ Solo admins` }, { quoted: m }); return
                }
            }
            comandos = cargarComandos()
            await comandoFile.run(sock, m, args, comandos)
        } catch(e) { console.log("Error:", e) }
    })
}

startZerin()
