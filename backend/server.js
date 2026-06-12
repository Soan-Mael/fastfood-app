const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const socketHandler = require('./src/socket/socketHandler');

const PORT = process.env.PORT || 3002;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible to routes
app.set('io', io);

// Socket handler
socketHandler(io);

server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📡 WebSocket prêt sur le port ${PORT}`);
});