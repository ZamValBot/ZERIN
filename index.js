// Dentro del evento messages.upsert
let tipoComando = null, comandoFile = null
for(let t of ["PUBLICO","ADMIN","OWNER"]){
  if(comandos[t][cmd]){ tipoComando=t; comandoFile=comandos[t][cmd]; break }
}
if(!comandoFile) return

// PROTECCION
if(tipoComando==="OWNER" &&!config.owners.includes(m.sender)) return sock.sendMessage(jid,{text:`❌ Solo owners de ${config.botName} pueden usar.${cmd}`},{quoted:m})
if(tipoComando==="ADMIN"){
  let groupMeta = await sock.groupMetadata(jid)
  let isAdmin = groupMeta.participants.find(p=>p.id===m.sender)?.admin
  if(!isAdmin) return sock.sendMessage(jid,{text:`❌ Solo admins pueden usar.${cmd}`},{quoted:m})
}
await comandoFile.run(sock,m,args,comandos, () => global.comandos = cargarComandos())
