const SPREADSHEET_ID = '1T5b4j3yPPgF233X4hJBA5Po9Dl6oeenCckRmlicda6I';
const SHEET_NAME = 'Punteggi';

const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&tq&sheet=${SHEET_NAME}`;

fetch(url)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const data = json.table.rows;

    const scoresContainer = document.getElementById('scores-container');
    const sports = {};

    data.forEach(row => {
      const timestamp = row.c[0] ? row.c[0].v : null;   // Timestamp from column A (index 0)
      const sport = row.c[2] ? row.c[2].v : '';         // Sport is on column C (index 2)
      const player1 = row.c[3] ? row.c[3].v : '';       // Team 1 name on D (index 3)
      const score1 = row.c[4] ? row.c[4].v : '';        // Team 1 score on E (index 4)
      const player2 = row.c[5] ? row.c[5].v : '';       // Team 2 name on F (index 5)
      const score2 = row.c[6] ? row.c[6].v : '';        // Team 2 score on G (index 6)

      if (!sports[sport]) {
        sports[sport] = [];
      }

      sports[sport].push({ player1, score1, player2, score2, timestamp }); // Store timestamp
    });

    for (const sport in sports) {
      const sportDiv = document.createElement('div');
      sportDiv.innerHTML = `<h2 class="sport-title">${sport}</h2>`;

      // Sort matches by timestamp (most recent first)
      sports[sport].sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB - dateA; // Descending order (newest first)
      });

      sports[sport].forEach(match => {
        const card = document.createElement('div');
        card.className = 'card';

        // Format the timestamp to a readable date
        const formattedDate = match.timestamp ? new Date(match.timestamp).toLocaleString('it-IT') : 'N/A';

        card.innerHTML = `
          <h3>${match.player1} vs ${match.player2}</h3>
          <p><strong>Score:</strong> ${match.score1} - ${match.score2}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
        `;
        sportDiv.appendChild(card);
      });
      scoresContainer.appendChild(sportDiv);
    }
  });