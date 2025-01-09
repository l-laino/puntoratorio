const SPREADSHEET_ID = '1T5b4j3yPPgF233X4hJBA5Po9Dl6oeenCckRmlicda6I';
const SHEET_NAME = 'Punteggi';

const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&tq&sheet=${SHEET_NAME}`;

fetch(url)
  .then(res => res.text())
  .then(text => {
    try {
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const data = json.table.rows;
      processScores(data);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  })
  .catch(error => {
    console.error("Fetch failed:", error);
  });

function processScores(data) {
  const scoresContainer = document.getElementById('scores-container');
  if (!scoresContainer) {
    console.error("Scores container not found in DOM");
    return;
  }

  scoresContainer.innerHTML = ''; // Clear previous content
  const sports = {};

  data.forEach(row => {
    const timestamp = row.c[0] ? row.c[0].v : null;
    const sport = row.c[2] ? row.c[2].v : '';
    const player1 = row.c[3] ? row.c[3].v : '';
    const score1 = row.c[4] ? row.c[4].v : '';
    const player2 = row.c[5] ? row.c[5].v : '';
    const score2 = row.c[6] ? row.c[6].v : '';
    const formattedDate = row.c[7] ? row.c[7].v : '';

    if (!sports[sport]) {
      sports[sport] = [];
    }
    sports[sport].push({ player1, score1, player2, score2, timestamp, formattedDate });
  });

  renderScores(sports);
}

function renderScores(sports) {
  const scoresContainer = document.getElementById('scores-container');

  for (const sport in sports) {
    const sportDiv = document.createElement('div');
    sportDiv.innerHTML = `<h2 class="sport-title">${sport}</h2>`;

    sports[sport].sort((a, b) => {
      const dateA = a.formattedDate ? new Date(a.formattedDate) : (a.timestamp ? new Date(a.timestamp) : null);
      const dateB = b.formattedDate ? new Date(b.formattedDate) : (b.timestamp ? new Date(b.timestamp) : null);
      if (dateA && dateB) return dateB - dateA;
      else if (dateA) return -1;
      else if (dateB) return 1;
      else return 0;
    });

    sports[sport].forEach(match => {
      const card = document.createElement('div');
      card.className = 'card';

      let displayedDate = match.formattedDate || 'N/A';
      if (!displayedDate && match.timestamp) {
        const date = new Date(match.timestamp);
        displayedDate = isNaN(date) ? 'Invalid Date' : date.toLocaleDateString('it-IT');
      }

      card.innerHTML = `
        <h3>${match.player1} vs ${match.player2}</h3>
        <p><strong>Score:</strong> ${match.score1} - ${match.score2}</p>
        <p><strong>Date:</strong> ${displayedDate}</p>
      `;
      sportDiv.appendChild(card);
    });
    scoresContainer.appendChild(sportDiv);
  }
}
