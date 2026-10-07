const fs = require('fs')
const path = require('path')

function cargarComandos() {
    const comandos = { PUBLICO: {}, ADMIN: {}, OWNER: {} }
    for (let tipo of ["PUBLICO","ADMIN","OWNER"]) {
        let ruta = path.join(__dirname, `../comandos/${tipo}`)
        if (!fs.existsSync(ruta)) fs.mkdirSync(ruta, {recursive:true})
        for (let file of fs.readdirSync(ruta)) {
            if (!file.endsWith('.js')) continue
            let nombre = file.replace('.js','')
            delete require.cache[require.resolve(`${ruta}/${file}`)]
            comandos[tipo][nombre] = require(`${ruta}/${file}`)
        }
    }
    return comandos
}
function moverComando(nombre, destino) {
    let origen = null
    for (let tipo of ["PUBLICO","ADMIN","OWNER"]) {
        let p = path.join(__dirname, `../comandos/${tipo}/${nombre}.js`)
        if (fs.existsSync(p)) { origen = p; break; }
    }
    if (!origen) return false
    let destPath = path.join(__dirname, `../comandos/${destino}/${nombre}.js`)
    fs.copyFileSync(origen, destPath)
    if (origen!== destPath) fs.unlinkSync(origen)
    return true
}
module.exports = { cargarComandos, moverComando }
