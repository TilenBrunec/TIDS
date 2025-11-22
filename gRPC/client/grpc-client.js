const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PROTO_PATH = path.join(__dirname, 'proto', 'songs.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const songProto = grpc.loadPackageDefinition(packageDefinition).songs;
const client = new songProto.SongService(
    'localhost:50051',grpc.credentials.createInsecure()
);

app.post('/api/songs', (req, res) => {
    const { title, artist, genre } = req.body;
    
    client.AddSong({ title, artist, genre }, (err, response) => {
        if (err) {
            console.error('Napaka pri dodajanju:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(response);
    });
});

app.get('/api/songs/:id', (req, res) => {
    const { id } = req.params;
    
    client.GetSong({ id }, (err, response) => {
        if (err) {
            console.error('Napaka pri pridobivanju:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (!response.found) {
            return res.status(404).json({ error: 'Pesem ni najdena' });
        }
        
        res.json(response.song);
    });
});

app.get('/api/songs', (req, res) => {
    client.GetAllSongs({}, (err, response) => {
        if (err) {
            console.error('Napaka pri pridobivanju vseh pesmi:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(response);
    });
});

app.get('/api/songs/stream/:genre', (req, res) => {
    const { genre } = req.params;
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const call = client.StreamSongsByGenre({ genre });

    call.on('data', (song) => {
        res.write(`data: ${JSON.stringify(song)}\n\n`);
    });
    
    call.on('end', () => {
        res.write('data: [DONE]\n\n');
        res.end();
    });
    
    call.on('error', (err) => {
        console.error('Napaka pri streaming-u:', err);
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🌐 Express API teče na http://localhost:${PORT}`);
    console.log(`🔗 Povezan z gRPC strežnikom na localhost:50051`);
});