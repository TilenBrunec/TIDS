const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'proto', 'songs.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const songProto = grpc.loadPackageDefinition(packageDefinition).songs;

let songs = [
    { id: '1', title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'Rock' },
    { id: '2', title: 'Imagine', artist: 'John Lennon', genre: 'Pop' },
    { id: '3', title: 'Hotel California', artist: 'Eagles', genre: 'Rock' },
    { id: '4', title: 'Smells Like Teen Spirit', artist: 'Nirvana', genre: 'Grunge' }
];

let nextId = 5;


function addSong(call, callback) {
    const { title, artist, genre } = call.request;
    
    if (!title || !artist || !genre) {
        return callback({
            code: grpc.status.INVALID_ARGUMENT,
            message: 'Vsa polja so obvezna (title, artist, genre)'
        });
    }
    
    const newSong = {
        id: String(nextId++),
        title,
        artist,
        genre
    };
    
    songs.push(newSong);
    
    callback(null, {
        success: true,
        message: 'Pesem uspešno dodana',
        song: newSong
    });
    
    console.log(`✅ Dodana nova pesem: ${title} - ${artist}`);
}

function getSong(call, callback) {
    const { id } = call.request;
    const song = songs.find(s => s.id === id);
    
    if (song) {
        callback(null, {
            song: song,
            found: true
        });
        console.log(`🔍 Pridobljena pesem: ${song.title}`);
    } else {
        callback(null, {
            song: null,
            found: false
        });
        console.log(`❌ Pesem z ID ${id} ni najdena`);
    }
}

function getAllSongs(call, callback) {
    callback(null, {
        songs: songs,
        total: songs.length
    });
    console.log(`📋 Poslanih ${songs.length} pesmi`);
}

function streamSongsByGenre(call) {
    const { genre } = call.request;
    const filteredSongs = songs.filter(s => 
        s.genre.toLowerCase() === genre.toLowerCase()
    );
    
    console.log(`🎵 Streaming pesmi žanra: ${genre} (${filteredSongs.length} pesmi)`);
    
    filteredSongs.forEach((song, index) => {
        setTimeout(() => {
            call.write(song);
            console.log(`  → Poslana: ${song.title}`);
            
            if (index === filteredSongs.length - 1) {
                call.end();
                console.log(`✅ Streaming žanra ${genre} zaključen`);
            }
        }, index * 1000); 
    });
    
    if (filteredSongs.length === 0) {
        call.end();
        console.log(`⚠️  Ni pesmi za žanr: ${genre}`);
    }
}

function getServer() {
    const server = new grpc.Server();
    server.addService(songProto.SongService.service, {
        AddSong: addSong,
        GetSong: getSong,
        GetAllSongs: getAllSongs,
        StreamSongsByGenre: streamSongsByGenre
    });
    return server;
}

const server = getServer();
const PORT = '0.0.0.0:50051';

server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error('❌ Napaka pri zagonu strežnika:', err);
        return;
    }
    console.log(`🚀 gRPC strežnik teče na ${PORT}`);
    console.log(`📦 Začetnih pesmi v bazi: ${songs.length}`);
});