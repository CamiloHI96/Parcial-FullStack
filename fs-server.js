const http = require('http');
const url = require('url');
const fs = require('fs');
const eventos = require('events');
const path = require('path');

// Crear EventEmitter
const EventEmitter = new eventos.EventEmitter();

// Ruta del archivo de productos
const filePath = path.join(__dirname, 'productos.txt');

// Función para registrar cada petición
async function logRequest(req) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
}

// Evento personalizado
EventEmitter.on('fileRead', (filename) => {
    console.log(`Archivo leído: ${filename}`);
});

const server = http.createServer(async (req, res) => {
    // Registrar la petición
    await logRequest(req);

    //URL parseada como Objeto
    const parsedUrl = url.parse(req.url, true);

    //Pathname de la URL
    const pathname = parsedUrl.pathname;

    //Array de parametros
    const query = parsedUrl.query;

    // Rutas Principal
    if (pathname === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Bienvenido al Servidor de Productos');
    }

    // Rutas de Items
    else if (pathname === '/items' && req.method === 'GET') {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Error al leer el archivo de productos');
            }

            // Emitir evento de archivo leído
            EventEmitter.emit('fileRead', 'productos.txt');

            let productos;
            try {
                console.log('Leyendo archivo de productos...');
                productos = JSON.parse(data);
                console.log('Archivo de productos leído y parseado correctamente.');

            } catch (e) {
                console.error('Error al parsear los datos del archivo:', e);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Error al parsear los datos del archivo');
            }
            
            // Si se proporciona un ID en los query params, buscar el producto específico
            if (query.id) {
                // Buscar producto por ID
                const producto = productos.find(p => p.id === parseInt(query.id));
                if (producto) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(producto));
                // Si no se encuentra el producto
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Producto no encontrado');
                }

            // Si no se proporciona ID, devolver todos los productos
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(productos));
            }
        });
    }

    // Ruta no encontrada
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Ruta no encontrada');
    }
});

// Iniciar el servidor
server.listen(3000, () => {
    // Mensaje de inicio del servidor en consola
    console.log('Servidor corriendo en http://localhost:3000');
});