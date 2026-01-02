const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Service za komunikacijo z Gemini AI
 * Generira music recommendations brez baze
 */
class GeminiService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = 'gemini-2.5-flash';
  }

  /**
   * Glavni metod za pridobivanje pesmi
   * Uporablja samo AI generation (brez baze)
   */
  async getSongRecommendations(message, count, genre) {
    try {
      console.log(`🎵 Gemini AI generacija: ${count} pesmi, žanr: ${genre}`);

      const prompt = this.createOriginalPrompt(message, count, genre);
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent(prompt);
      const response = result.response;

      let text = response.text().trim();

      // Clean JSON
      text = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      const jsonData = JSON.parse(text);

      if (Array.isArray(jsonData.songs)) {
        jsonData.songs = jsonData.songs.slice(0, count);
      }

      return jsonData;
    } catch (error) {
      console.error('❌ Gemini AI napaka:', error.message);
      throw new Error('Napaka pri generaciji pesmi: ' + error.message);
    }
  }

  /**
   * Originalni prompt (ko ni pesmi v bazi)
   */
  createOriginalPrompt(message, count, genre) {
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
}

module.exports = GeminiService;