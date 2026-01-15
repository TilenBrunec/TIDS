### 1. Predpogoji

- Node.js (v16 ali novejša)
- Docker (za RabbitMQ)

### 2. Zagon RabbitMQ

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

Preveri, da RabbitMQ deluje:

- Management UI: http://localhost:15672
- Prijava: `guest` / `guest`

### 3. Namestitev odvisnosti

```bash
cd rabbitmq-naloga
npm install
```

### 4. Zagon aplikacije

**Možnost 1: Oba strežnika hkrati**

```bash
npm run dev
```

**Možnost 2: Ločeno v dveh terminalih**

Terminal 1 - Publisher:

```bash
npm run publisher
```

Terminal 2 - Consumer:

```bash
npm run consumer
```

### 5. Uporaba

1. **Publisher** - Odpri http://localhost:3000

   - Tukaj pošiljaš dogodke (dodajanje uporabnika, objava sporočila, brisanje)

2. **Consumer** - Odpri http://localhost:3001
   - Tukaj prejemaš dogodke v realnem času brez osveževanja strani

## 📁 Struktura projekta

```
rabbitmq-naloga/
├── rabbitmq/
│   └── connection.js          # RabbitMQ povezava in funkcije
├── publisher/
│   ├── server.js              # Express strežnik za pošiljanje
│   └── public/
│       └── index.html         # UI za pošiljanje dogodkov
├── consumer/
│   ├── server.js              # Express strežnik za prejemanje
│   └── public/
│       └── index.html         # UI za prikaz dogodkov
└── package.json
```

## 🔧 Kako deluje

### Arhitektura

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Publisher  │─────▶│  RabbitMQ    │─────▶│  Consumer   │
│  (port 3000)│      │  (port 5672) │      │  (port 3001)│
└─────────────┘      └──────────────┘      └─────────────┘
```

### Potek dogodka

1. **Uporabnik** pritisne gumb v Publisher aplikaciji
2. **Publisher** pošlje dogodek v RabbitMQ vrsto (`dogodki-vrsta`)
3. **RabbitMQ** shrani sporočilo
4. **Consumer** prejme dogodek iz vrste
5. **Consumer** pošlje dogodek v brskalnik preko SSE (Server-Sent Events)
6. **Brskalnik** prikaže dogodek v realnem času (brez osveževanja)

### Vrste dogodkov

1. **UPORABNIK_DODAN** - Dodajanje novega uporabnika
2. **SPOROCILO_OBJAVLJENO** - Objava sporočila
3. **ELEMENT_IZBRISAN** - Brisanje elementa

## 🎯 Zahteve naloge (✓ izpolnjeno)

- ✅ RabbitMQ nameščen (Docker)
- ✅ Povezava med komponentami preko RabbitMQ
- ✅ Uporaba sporočilnih vrst (queue)
- ✅ Asinhrono obveščanje brez osveževanja strani (SSE)
- ✅ Obdelava dogodkov ob akcijah (klik gumb, vnos podatkov)
- ✅ Direct exchange komunikacija

## 📊 RabbitMQ Management

Za spremljanje stanja RabbitMQ:

- URL: http://localhost:15672
- Uporabnik: `guest`
- Geslo: `guest`

Tukaj lahko vidiš:

- Aktivne vrste (queues)
- Število sporočil
- Hitrost procesiranja
- Povezane consumerje

## 🔍 Testiranje

1. Odpri Publisher (http://localhost:3000)
2. Odpri Consumer (http://localhost:3001) v drugem oknu/zavihku
3. V Publisherju pošlji dogodek (npr. dodaj uporabnika)
4. Takoj vidiš dogodek v Consumerju brez osveževanja!
