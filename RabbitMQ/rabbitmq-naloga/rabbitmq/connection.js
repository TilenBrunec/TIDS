const amqp = require('amqplib');

let povezava = null;
let kanal = null;

// Povezava na RabbitMQ
async function poveziRabbitMQ() {
    try {
        if (!povezava) {
            povezava = await amqp.connect('amqp://localhost:5672');
            console.log('✓ Povezava na RabbitMQ uspešna');
            
            povezava.on('error', (err) => {
                console.error('Napaka pri povezavi:', err);
                povezava = null;
            });
            
            povezava.on('close', () => {
                console.log('Povezava zaprta, ponovno vzpostavljam...');
                povezava = null;
                setTimeout(poveziRabbitMQ, 1000);
            });
        }
        return povezava;
    } catch (error) {
        console.error('Napaka pri povezovanju na RabbitMQ:', error.message);
        setTimeout(poveziRabbitMQ, 3000);
        throw error;
    }
}

// Ustvarjanje kanala
async function ustvariKanal() {
    try {
        if (!kanal) {
            const conn = await poveziRabbitMQ();
            kanal = await conn.createChannel();
            console.log('✓ Kanal ustvarjen');
        }
        return kanal;
    } catch (error) {
        console.error('Napaka pri ustvarjanju kanala:', error.message);
        throw error;
    }
}

// Potrdi vrsto (queue)
async function potrdiVrsto(imeVrste) {
    try {
        const channel = await ustvariKanal();
        await channel.assertQueue(imeVrste, {
            durable: true // Vrsta preživi restart RabbitMQ
        });
        console.log(`✓ Vrsta "${imeVrste}" potrjena`);
        return channel;
    } catch (error) {
        console.error('Napaka pri potrjevanju vrste:', error.message);
        throw error;
    }
}

// Zapri povezavo
async function zapriPovezavo() {
    try {
        if (kanal) await kanal.close();
        if (povezava) await povezava.close();
        console.log('Povezava zaprta');
    } catch (error) {
        console.error('Napaka pri zapiranju:', error.message);
    }
}

module.exports = {
    poveziRabbitMQ,
    ustvariKanal,
    potrdiVrsto,
    zapriPovezavo
};