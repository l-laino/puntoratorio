const SPREADSHEET_ID = "1T5b4j3yPPgF233X4hJBA5Po9Dl6oeenCckRmlicda6I";
const SHEET_NAME = "Punteggi";

const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&tq&sheet=${SHEET_NAME}`;

fetch(url)
  .then((res) => res.text())
  .then((text) => {
    try {
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const data = json.table.rows;
      processScores(data);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  })
  .catch((error) => {
    console.error("Fetch failed:", error);
  });

function processScores(data) {
  const scoresContainer = document.getElementById("scores-container");
  if (!scoresContainer) {
    console.error("Scores container not found in DOM");
    return;
  }

  scoresContainer.innerHTML = ""; // Clear previous content
  const sports = {};

  data.forEach((row) => {
    const timestamp = row.c[0] ? row.c[0].v : null;
    const sport = row.c[2] ? row.c[2].v : "";
    const player1 = row.c[3] ? row.c[3].v : "";
    const score1 = row.c[4] ? row.c[4].v : "";
    const player2 = row.c[5] ? row.c[5].v : "";
    const score2 = row.c[6] ? row.c[6].v : "";
    const formattedDate = row.c[7] ? row.c[7].v : "";

    if (!sports[sport]) {
      sports[sport] = [];
    }
    sports[sport].push({
      player1,
      score1,
      player2,
      score2,
      timestamp,
      formattedDate,
    });
  });

  renderScores(sports);
}

function renderScores(sports) {
  const scoresContainer = document.getElementById("scores-container");
  if (!scoresContainer) {
    console.error("Scores container not found in DOM");
    return;
  }

  scoresContainer.innerHTML = ""; // Svuota il contenitore

  for (const sport in sports) {
    const sportDiv = document.createElement("div");
    sportDiv.innerHTML = `<h2 class="sport-title">${sport}</h2>`;

    // Ordina i dati per data
    sports[sport].forEach((match) => {
      const card = document.createElement("div");
      card.className = "card col-md-4"; // Utilizza Bootstrap per il layout delle card

      // Determina la data da visualizzare
      let displayedDate = "N/A";
      if (match.formattedDate) {
        displayedDate = match.formattedDate; // Usa la data formattata se disponibile
      } else if (match.timestamp) {
        const parsedDate = parseTimestamp(match.timestamp);
        displayedDate = parsedDate
          ? parsedDate.toLocaleDateString("it-IT")
          : "N/A";
      }

      card.innerHTML = `
        <div class="card-body">
          <h3 class="card-title">${match.player1} vs ${match.player2}</h3>
          <p class="card-text"><strong>Score:</strong> ${match.score1} - ${match.score2}</p>
          <p class="card-text"><strong>Date:</strong> ${displayedDate}</p>
        </div>
      `;
      sportDiv.appendChild(card);
    });

    // Funzione per parsare i timestamp
    function parseTimestamp(timestamp) {
      try {
        const date = new Date(timestamp);
        return isNaN(date) ? null : date;
      } catch (error) {
        console.error("Error parsing timestamp:", error, timestamp);
        return null;
      }
    }
  }

  // Funzione per parsare i timestamp
  function parseTimestamp(timestamp) {
    try {
      const date = new Date(timestamp);
      return isNaN(date) ? null : date;
    } catch (error) {
      console.error("Error parsing timestamp:", error, timestamp);
      return null;
    }
  }

  // Funzione per parsare le date formattate (giorno/mese/anno)
  function parseFormattedDate(formattedDate) {
    try {
      const [day, month, year] = formattedDate
        .split("/")
        .map((num) => parseInt(num, 10));
      return new Date(day, month - 1, year); // JavaScript usa mesi da 0 a 11
    } catch (error) {
      console.error("Error parsing formatted date:", error, formattedDate);
      return null;
    }
  }
}
