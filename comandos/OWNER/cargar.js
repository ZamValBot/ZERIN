const fs = require('fs')
const path = require('path')
const { moverComando } = require('../../lib/loader')
const config = require('../../config')

module.exports = {
    owner: true,
    run: async (sock, m, args) => {
        let [nombre,...codigoArr] = args
        if(!nombre) return sock.sendMessage(m.key.remoteJid,{text:"Uso:.cargar <nombre> [codigo] |.cargar <nombre> para mover"}, {quoted:m})
        let codigo = codigoArr.join(' ')
        let rutaPublico = path.join(__dirname, `../PUBLICO/${nombre}.js`)

        if(!codigo){ // MOVER
            let movido = moverComando(nombre, "PUBLICO")
            return sock.sendMessage(m.key.remoteJid,{text: movido? `✅ ${nombre} movido a PUBLICO\n${config.watermark}` : `❌ Comando ${nombre} no existe`},{quoted:m})
        }
        // CREAR/REESCRIBIR
        if(!codigo.includes(config.botName)) codigo += `\n// ${config.watermark}`
        fs.writeFileSync(rutaPublico, codigo)
        moverComando(nombre, "PUBLICO") // asegura borrado de otras carpetas
        await sock.sendMessage(m.key.remoteJid,{text:`✅ Comando PUBLICO.${nombre} cargado sin reiniciar\n${config.watermark}`},{quoted:m})
    }
}
