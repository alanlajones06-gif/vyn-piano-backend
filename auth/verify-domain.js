// ============================================
// VERIFICACIÓN DE DOMINIO Y TOKEN
// ============================================

const jwt = require('jsonwebtoken');

// Clave secreta para firmar tokens (cámbiala por algo seguro)
const SECRET_KEY = 'VYN_PIANO_SECRET_KEY_2024_CAMBIA_ESTA';

// Dominios autorizados (los que pueden usar tu piano)
const DOMINIOS_AUTORIZADOS = [
    'localhost:3000',
    'localhost:5500',
    '127.0.0.1:3000',
    'vyn-piano-studio.netlify.app',
    'vyn-piano.netlify.app',
    'vyn-piano-backend.onrender.com'
];

// Función para generar token
function generarToken(dominio) {
    return jwt.sign(
        { 
            dominio: dominio,
            activado: true,
            fecha: Date.now(),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30) // 30 días
        },
        SECRET_KEY
    );
}

// Función para verificar token
function verificarToken(token) {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return { valido: true, data: decoded };
    } catch (error) {
        return { valido: false, error: error.message };
    }
}

// Middleware para verificar dominio en las peticiones
function verificarDominioMiddleware(req, res, next) {
    const origin = req.headers.origin || req.headers.referer || '';
    const host = req.headers.host || '';
    
    let dominioValido = false;
    
    for (let dominio of DOMINIOS_AUTORIZADOS) {
        if (origin.includes(dominio) || host.includes(dominio)) {
            dominioValido = true;
            break;
        }
    }
    
    if (!dominioValido) {
        return res.status(403).json({ 
            error: 'Dominio no autorizado',
            message: 'Este dominio no tiene licencia para usar Vyn Piano Studio'
        });
    }
    
    next();
}

// Exportar funciones
module.exports = {
    generarToken,
    verificarToken,
    verificarDominioMiddleware,
    DOMINIOS_AUTORIZADOS,
    SECRET_KEY
};