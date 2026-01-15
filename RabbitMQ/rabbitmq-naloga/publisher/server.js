const express = require('express');
const cors = require('cors');
const path = require('path');
const { potrdiVrsto } = require('../rabbitmq/connection');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ime vrste
const IME_VRSTE = 'dogodki-vrsta';

// Inicializacija RabbitMQ
let kanal;

async function zacni() {
    try {
        kanal = await potrdiVrsto(IME_VRSTE);
        console.log('✓ Publisher pripravljen');
    } catch (error) {
        console.error('Napaka pri inicializaciji:', error);
        process.exit(1);
    }
}

// API endpoint za pošiljanje dogodkov
app.post('/api/poslji-dogodek', async (req, res) => {
    try {
        const { tip, podatki } = req.body;
        
        const dogodek = {
            tip,
            podatki,
            cas: new Date().toISOString(),
            id: Math.random().toString(36).substr(2, 9)
        };

        // Pošljemo sporočilo v RabbitMQ vrsto
        kanal.sendToQueue(
            IME_VRSTE,
            Buffer.from(JSON.stringify(dogodek)),
            { persistent: true } // Sporočilo preživi restart
        );

        console.log(`📤 Poslan dogodek: ${tip}`, podatki);

        res.json({
            uspeh: true,
            sporocilo: 'Dogodek poslan',
            dogodek
        });
    } catch (error) {
        console.error('Napaka pri pošiljanju:', error);
        res.status(500).json({
            uspeh: false,
            napaka: error.message
        });
    }
});

// Začetek strežnika
zacni().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Publisher server teče na http://localhost:${PORT}`);
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nZapiranje publisher strežnika...');
    process.exit(0);
});