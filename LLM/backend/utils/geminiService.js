const { GoogleGenerativeAI } = require('@google/generative-ai');
const Song = require('../models/Song');

/**
 * Service za komunikacijo z Gemini AI
 * Uporablja Songs iz baze za priporočila
 */
class GeminiService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = 'gemini-2.5-flash';
  }

  /**
   * Glavni metod za pridobivanje pesmi
   * UPORABLJA BAZO - najprej pridobi pesmi, potem AI izbere
   */
  async getSongRecommendations(message, count, genre) {
    try {
      console.log(`🎵 Pridobivam priporočila: ${count} pesmi, žanr: ${genre}`);

      // Najprej poskusi iz baze
      const dbSongs = await this.getSongsFromDatabase(message, genre, 100);

      if (dbSongs.length > 0) {
        console.log(`✅ Najdenih ${dbSongs.length} pesmi v bazi`);
        // AI izbere najbolj primerne iz baze
        return await this.selectSongsWithAI(message, count, genre, dbSongs);
      }

      // Fallback: AI generira pesmi
      console.warn('⚠️  Ni pesmi v bazi, AI generira pesmi');
      return await this.generateSongsWithAI(message, count, genre);
    } catch (error) {
      console.error('❌ Gemini service napaka:', error.message);
      throw new Error('Napaka pri pridobivanju priporočil');
    }
  }

  /**
   * Pridobi pesmi iz baze
   */
  async getSongsFromDatabase(message, genre, limit) {
    try {
      let filter = {};

      // Filter po žanru
      if (genre && genre !== 'any') {
        filter.genre = new RegExp(genre, 'i');
      }

      // Text search če je message
      if (message && message.trim().length > 0) {
        const searchResults = await Song.find(
          {
            ...filter,
            $text: { $search: message },
          },
          { score: { $meta: 'textScore' } }
        )
          .sort({ score: { $meta: 'textScore' } })
          .limit(limit);

        if (searchResults.length > 0) return searchResults;
      }

      // Sicer random iz žanra
      if (genre && genre !== 'any') {
        return await Song.getRandomSongs(limit, filter);
      }

      // Default: random vse
      return await Song.getRandomSongs(limit);
    } catch (error) {
      console.error('❌ Database query napaka:', error.message);
      return [];
    }
  }

  /**
   * AI izbere pesmi iz seznama (baza)
   */
  async selectSongsWithAI(message, count, genre, availableSongs) {
    try {
      // Format pesmi za AI
      const songList = availableSongs
        .slice(0, 50) // Max 50 za prompt
        .map(
          (song, i) =>
            `${i + 1}. "${song.title}" - ${song.artist} (${song.genre}, ${song.region})`
        )
        .join('\n');

      const prompt = `
Uporabnikove želje:
"${message}"

DOSTOPNE PESMI V BAZI (izberi iz teh):
${songList}

Tvoja naloga:
Iz zgornjega seznama izberi ${count} pesmi, ki se ČIMBOLJ ujemajo z uporabnikovimi željami.
${genre && genre !== 'any' ? `Uporabi pesmi ki imajo žanr "${genre}" ali so podobne.` : ''}

POMEMBNE SMERNICE:
1. Izberi pesmi ki najbolj ustrezajo opisu: "${message}"
2. Če uporabnik omenja razpoloženje (npr. "za trening", "za chill"), izberi primerne pesmi
3. SAMO pesmi iz zgornjega seznama!
4. Upoštevaj žanr, region in mood uporabnika

NATANČEN FORMAT ODGOVORA (samo JSON, brez dodatnega teksta):
{
  "songs": [
    {
      "title": "naslov pesmi IZ SEZNAMA",
      "artist": "izvajalec IZ SEZNAMA",
      "genre": "žanr iz seznama",
      "region": "regija iz seznama",
      "link": "https://youtube.com/...",
      "reason": "Kratek razlog zakaj se ta pesem ujema z zahtevo (1 stavek)"
    }
  ]
}

Pravila:
- Vrni natanko ${count} pesmi
- Vsaka pesem mora biti iz zgornjega seznama
- Odgovori SAMO z JSON objektom, brez markdown formatiranja
- Dodaj kratek 'reason' za vsako pesem (1 stavek)
- Vključi region iz seznama
`;

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

      console.log(`✅ AI izbral ${jsonData.songs.length} pesmi iz baze`);
      return jsonData;
    } catch (error) {
      console.error('❌ AI selection napaka:', error.message);
      // Fallback: vrni random iz baze
      return this.formatDbSongsForResponse(availableSongs.slice(0, count));
    }
  }

  /**
   * AI generira pesmi (fallback)
   */
  async generateSongsWithAI(message, count, genre) {
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
  }

  /**
   * Format DB songs za response
   */
  formatDbSongsForResponse(songs) {
    return {
      songs: songs.map((song) => ({
        title: song.title,
        artist: song.artist,
        genre: song.genre,
        region: song.region || 'Unknown',
        link: `https://youtube.com/results?search_query=${encodeURIComponent(
          `${song.title} ${song.artist}`
        )}`,
        reason: 'Selected from your music database'
      })),
    };
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