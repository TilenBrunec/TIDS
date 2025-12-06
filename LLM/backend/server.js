const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// model ime na enem mestu
const MODEL_NAME = "gemini-2.5-flash";

console.log("Uporabljam Gemini model:", MODEL_NAME);

app.post("/api/songs", async (req, res) => {
  try {
    const { message, count, genre } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: 'Manjka polje "message"' });
    }

    const requestedCount = Math.min(10, Math.max(1, Number(count) || 5));
    const normalizedGenre = genre && typeof genre === "string" ? genre : "any";

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
Uporabnikove želje (opis, izvajalci, vibe ipd.):
"${message}"

Uporabnik želi priporočila pesmi z naslednjimi parametri:
- Število pesmi: ${requestedCount}
- Žanr: ${normalizedGenre}

Tvoja naloga:
Vrni seznam pesmi, ki se čimbolj ujemajo z žanrom "${normalizedGenre}" in opisom uporabnika.
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
- V polju "songs" vrni čim bližje ${requestedCount} pesmim (največ ${requestedCount}).
- Vsaka pesem naj ima:
  - resničen naslov in izvajalca,
  - žanr, ki je čim bliže "${normalizedGenre}",
  - delujoč YouTube ali Spotify link v polju "link".
- Ne dodajaj nobenih komentarjev, razlag ali besedila izven JSON objekta.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;

    let text = response.text().trim();

    text = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    let jsonData;
    try {
      jsonData = JSON.parse(text);
    } catch (parseError) {
      console.error("Napaka pri JSON.parse, besedilo modela:", text);
      return res
        .status(500)
        .json({ error: "Napaka pri razčlenjevanju odgovora modela" });
    }

    if (Array.isArray(jsonData.songs)) {
      jsonData.songs = jsonData.songs.slice(0, requestedCount);
    }

    res.json(jsonData);
  } catch (error) {
    console.error("Napaka:", error);
    res.status(500).json({ error: "Napaka pri pridobivanju podatkov" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server teče na http://localhost:${PORT}`);
});
