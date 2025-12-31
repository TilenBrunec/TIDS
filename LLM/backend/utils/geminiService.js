const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = 'gemini-2.5-flash';
  }

  createSongPrompt(message, count, genre) {
    return `
Uporabnikove želje (opis, izvajalci, vibe ipd.):
"${message}"

Uporabnik želi priporočila pesmi z naslednjimi parametri:
- Število pesmi: ${count}
- Žanr: ${genre}

Tvoja naloga:
Vrni seznam pesmi, ki se čimbolj ujemajo z žanrom "${genre}" in opisom uporabnika.
Če ne najdeš dovolj natančnih ujemanj, predlagaj najbolj podobne pesmi.

POMEMBNO:
Odgovori SAMO z veljavnim JSON objektom, brez kakršnegakoli dodatnega besedila, brez markdown formatiranja in brez dodatnih znakov pred ali za JSON-om.

NATANČEN FORMAT ODGOVORA:
{
  "songs": [
    {
      "title": "naslov pesmi",
      "artist": "izvajalec",
      "genre": "žanr",
      "link": "YouTube ali Spotify link"
    }
  ]
}

Pravila:
- V polju "songs" vrni čim bližje ${count} pesmim (največ ${count}).
- Vsaka pesem naj ima:
  - resničen naslov in izvajalca,
  - žanr, ki je čim bližje "${genre}",
  - delujoč YouTube ali Spotify link v polju "link".
- Ne dodajaj nobenih komentarjev, razlag ali besedila izven JSON objekta.
`;
  }


  async getSongRecommendations(message, count, genre) {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const prompt = this.createSongPrompt(message, count, genre);

      const result = await model.generateContent(prompt);
      const response = result.response;

    
      let text = response
        .text()
        .trim()
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      const jsonData = JSON.parse(text);

      // Validacija
      if (!Array.isArray(jsonData.songs)) {
        throw new Error('Nepravilna struktura odgovora - manjka polje songs');
      }

   
      jsonData.songs = jsonData.songs.slice(0, count);

      return jsonData;
    } catch (error) {
      console.error('❌ Gemini service napaka:', error.message);
      throw new Error('Napaka pri pridobivanju priporočil od AI');
    }
  }
}

module.exports = GeminiService;