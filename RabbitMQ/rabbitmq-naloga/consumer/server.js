const express = require('express');
const cors = require('cors');
const path = require('path');
const { potrdiVrsto } = require('../rabbitmq/connection');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ime vrste
const IME_VRSTE = 'dogodki-vrsta';

// Shranjevanje dogodkov (v produkciji bi uporabili bazo)
let zgodovina = [];

// WebSocket-like SSE (Server-Sent Events) za real-time posodobitve
const klienti = [];

// Inicializacija RabbitMQ
let kanal;

async function zacni() {
    try {
        kanal = await potrdiVrsto(IME_VRSTE);
        
        // Nastavimo prefetch, da lahko hitrejši consumer prevzame več sporočil
        await kanal.prefetch(1);
        
        // Začnemo poslušati sporočila
        kanal.consume(IME_VRSTE, (sporocilo) => {
            if (sporocilo !== null) {
                const vsebina = sporocilo.content.toString();
                const dogodek = JSON.parse(vsebina);
                
                console.log(`📥 Prejet dogodek: ${dogodek.tip}`, dogodek.podatki);
                
                // Dodamo v zgodovino
                zgodovina.unshift(dogodek);
                if (zgodovina.length > 50) {
                    zgodovina = zgodovina.slice(0, 50);
                }
                
                // Pošljemo vsem povezanim klientom
                posljiVsemKlientom(dogodek);
                
                // Potrdimo sprejem sporočila
                kanal.ack(sporocilo);
            }
        });
        
        console.log('✓ Consumer pripravljen in posluša dogodke');
    } catch (error) {
        console.error('Napaka pri inicializaciji:', error);
        process.exit(1);
    }
}

// Funkcija za pošiljanje dogodkov vsem povezanim klientom
function posljiVsemKlientom(dogodek) {
    klienti.forEach(klient => {
        klient.res.write(`data: ${JSON.stringify(dogodek)}\n\n`);
    });
}

// SSE endpoint za real-time posodobitve
app.get('/api/dogodki/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const klientId = Date.now();
    const noviKlient = { id: klientId, res };
    
    klienti.push(noviKlient);
    console.log(`✓ Nov klient povezan (ID: ${klientId}), skupaj: ${klienti.length}`);
    
    // Pošljemo začetno sporočilo
    res.write(`data: ${JSON.stringify({ tip: 'POVEZAVA', sporocilo: 'Povezan' })}\n\n`);
    
    // Ko se klient odklopi
    req.on('close', () => {
        const index = klienti.findIndex(k => k.id === klientId);
        if (index !== -1) {
            klienti.splice(index, 1);
        }
        console.log(`✗ Klient odklopljen (ID: ${klientId}), ostalo: ${klienti.length}`);
    });
});

// API endpoint za pridobitev zgodovine dogodkov
app.get('/api/dogodki/zgodovina', (req, res) => {
    res.json({
        uspeh: true,
        dogodki: zgodovina,
        stevilo: zgodovina.length
    });
});

// Začetek strežnika
zacni().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Consumer server teče na http://localhost:${PORT}`);
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nZapiranje consumer strežnika...');
    
    // Zapri vse SSE povezave
    klienti.forEach(klient => {
        klient.res.end();
    });
    
    process.exit(0);
});
