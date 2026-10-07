// Dentro del evento messages.upsert
let tipoComando = null, comandoFile = null
for(let t of ["PUBLICO","ADMIN","OWNER"]){
  if(comandos[t][cmd]){ tipoComando=t; comandoFile=comandos[t][cmd]; break }
}
if(!comandoFile) return

// PROTECCION ZERIN CORREGIDA
try {
    // en baileys el sender real es este:
    const sender = m.key.participant || m.key.remoteJid
    const isOwnerBot = config.owners.includes(sender)

    if(tipoComando === "OWNER" &&!isOwnerBot) {
        return await sock.sendMessage(jid, {text:`❌ Solo owners de ${config.botName} pueden usar.${cmd}\n\n${config.watermark}`}, {quoted:m})
    }

    if(tipoComando === "ADMIN" && jid.endsWith('@g.us')) {
        let groupMeta = await sock.groupMetadata(jid)
        let participant = groupMeta.participants.find(p=>p.id === sender)
        let isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin'

        if(!isAdmin &&!isOwnerBot) {
            return await sock.sendMessage(jid, {text:`❌ Solo admins pueden usar.${cmd}\n\n${config.watermark}`}, {quoted:m})
        }
    }

    // Recargar comandos sin reiniciar
    comandos = cargarComandos()

    await comandoFile.run(sock, m, args, comandos)

} catch(e) {
    console.log(e)
}
