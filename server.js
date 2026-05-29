const express = require('express');
const cors = require('cors');
const path = require('path');
const auth = require('./auth/verify-domain');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend (opcional)
app.use(express.static(path.join(__dirname, '../frontend')));

// Endpoint para activar el piano (con verificación de dominio)
app.post('/api/activate', auth.verificarDominioMiddleware, (req, res) => {
    const dominio = req.headers.origin || req.headers.host || 'desconocido';
    const token = auth.generarToken(dominio);
    
    res.json({
        success: true,
        token: token,
        message: 'Piano activado correctamente',
        expires: '30 days'
    });
});

// Endpoint para verificar token
app.post('/api/verify', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(401).json({ 
            valid: false, 
            error: 'Token no proporcionado' 
        });
    }
    
    const resultado = auth.verificarToken(token);
    
    if (resultado.valido) {
        res.json({ 
            valid: true, 
            data: resultado.data,
            message: 'Token válido' 
        });
    } else {
        res.status(401).json({ 
            valid: false, 
            error: resultado.error 
        });
    }
});

// Endpoint para verificar estado del servidor
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online', 
        service: 'Vyn Piano Backend',
        dominios_autorizados: auth.DOMINIOS_AUTORIZADOS
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🔒 Vyn Piano Backend corriendo en http://localhost:${PORT}`);
    console.log(`📋 Dominios autorizados: ${auth.DOMINIOS_AUTORIZADOS.join(', ')}`);
});