const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());


function parsePCAxis(pxContent) {
  const lines = pxContent.split('\n');
  const data = {
    metadata: {},
    values: [],
    dimensions: {},
    keys: []
  };

  let inDataSection = false;
  let dataBuffer = '';

  for (let line of lines) {
    line = line.trim();

    if (!line) continue;

    // Metapodatki
    if (line.includes('=') && !inDataSection && !line.startsWith('DATA=')) {
      const equalIndex = line.indexOf('=');
      const key = line.substring(0, equalIndex).trim();
      let value = line.substring(equalIndex + 1).trim();
      
      // Odstrani končni ;
      value = value.replace(/;$/, '').trim();
      
      // Odstrani narekovaje na začetku in koncu
      value = value.replace(/^"(.*)"$/, '$1');
      
      // Shrani v metadata
      if (key.includes('(')) {
        // Posebna obravnava za KEYS, VALUES, itd.
        const baseKey = key.substring(0, key.indexOf('(')).trim();
        if (!data.dimensions[baseKey]) {
          data.dimensions[baseKey] = [];
        }
        data.dimensions[baseKey].push(value);
      } else {
        data.metadata[key] = value;
      }
    }

    if (line.startsWith('DATA=')) {
      inDataSection = true;
      dataBuffer = line.replace('DATA=', '').trim();
      continue;
    }

    if (inDataSection) {
      dataBuffer += ' ' + line;
      
      if (line.includes(';')) {
        inDataSection = false;
        
        const values = dataBuffer
          .replace(/;/g, '')
          .trim()
          .split(/\s+/)
          .map(v => {
            v = v.replace(/"/g, '');
            if (v === '..' || v === '...' || v === '-' || v === '""') {
              return null;
            }
            const num = parseFloat(v);
            return isNaN(num) ? null : num;
          })
          .filter(v => v !== null);
        
        data.values = values;
      }
    }
  }

  return data;
}

app.get('/api/fetch-pcaxis', async (req, res) => {
  try {
    const pxUrl = 'https://pxweb.stat.si/SiStatData/Resources/PX/Databases/Data/0888501S.PX';
    
    console.log('📥 Pridobivam PC-AXIS datoteko iz:', pxUrl);
    
    const response = await axios.get(pxUrl, {
      responseType: 'text',
      headers: {
        'Accept': 'text/plain, */*',
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 10000
    });

    console.log('✅ Datoteka pridobljena, velikost:', response.data.length, 'znakov');
    console.log('🔄 Parsiram PC-AXIS format...');
    
    const parsedData = parsePCAxis(response.data);
    
    console.log('✅ Parsanje uspešno!');
    console.log('   - Metapodatki:', Object.keys(parsedData.metadata).length);
    console.log('   - Vrednosti:', parsedData.values.length);
    
    const result = {
      success: true,
      metadata: {
        title: parsedData.metadata.TITLE || parsedData.metadata.CONTENTS || "PC-AXIS podatki",
        source: parsedData.metadata.SOURCE || "SURS",
        updated: parsedData.metadata['LAST-UPDATED'] || new Date().toISOString(),
        units: parsedData.metadata.UNITS || "%",
        contact: parsedData.metadata.CONTACT || "SURS"
      },
      rawMetadata: parsedData.metadata,
      dimensions: parsedData.dimensions,
      values: parsedData.values,
      fileUrl: pxUrl,
      parsedAt: new Date().toISOString()
    };

    res.json(result);

  } catch (error) {
    console.error('❌ Napaka:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Napaka pri pridobivanju PC-AXIS podatkov',
      details: error.message 
    });
  }
});


app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server deluje',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`
 🚀 Backend Server AKTIVEN   
 📍 http://localhost:${PORT} 
 📊 PC-AXIS endpoint: /api/fetch-pcaxis 
  `);
});