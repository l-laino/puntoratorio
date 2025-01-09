const SPREADSHEET_ID = "1T5b4j3yPPgF233X4hJBA5Po9Dl6oeenCckRmlicda6I"; // Replace with your spreadsheet ID
const SHEET_NAME = "Punteggi"; // Replace with your sheet name

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

    scoresContainer.innerHTML = "";
    const sports = {};

    data.forEach((row) => {
        const timestamp = row.c[0] ? String(row.c[0].v) : null;
        const sport = row.c[2] ? row.c[2].v : "";
        const player1 = row.c[3] ? row.c[3].v : "";
        const score1 = row.c[4] ? row.c[4].v : "";
        const player2 = row.c[5] ? row.c[5].v : "";
        const score2 = row.c[6] ? row.c[6].v : "";
        const formattedDate = row.c[7] ? String(row.c[7].v) : null;

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

    scoresContainer.innerHTML = "";

    for (const sport in sports) {
        const sportDiv = document.createElement("div");
        sportDiv.innerHTML = `<h2 class="sport-title">${sport}</h2>`;

        const cardContainer = document.createElement("div");
        cardContainer.className = "card-container";

        sports[sport].forEach((match) => {
            const card = document.createElement("div");
            card.className = "card";

            let displayedDate = "N/A";

            if (match.formattedDate) {
                const parsedDate = parseFormattedDate(match.formattedDate);
                displayedDate = parsedDate ? parsedDate : "N/A";
            } else if (match.timestamp) {
                const parsedDate = parseTimestamp(match.timestamp);
                displayedDate = parsedDate ? parsedDate : "N/A";
            }

            card.innerHTML = `
                <div class="card-body text-center">
                    <h3 class="card-title">${match.player1} vs ${match.player2}</h3>
                    <p class="card-text"><strong>Score:</strong> ${match.score1} - ${match.score2}</p>
                    <p class="card-text"><strong>Data:</strong> ${displayedDate}</p>
                </div>
            `;
            cardContainer.appendChild(card);
        });

        sportDiv.appendChild(cardContainer);
        scoresContainer.appendChild(sportDiv);
    }
}

function parseTimestamp(timestamp) {
    try {
        if (!isNaN(timestamp)) {
            const date = new Date(parseInt(timestamp, 10));
            return date.toLocaleString("it-IT", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } else if (typeof timestamp === 'string' && timestamp.startsWith('Date(')) {
            const dateParts = timestamp.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
            if (dateParts) {
                const year = parseInt(dateParts[1], 10);
                const month = parseInt(dateParts[2], 10);
                const day = parseInt(dateParts[3], 10);
                const hours = parseInt(dateParts[4], 10);
                const minutes = parseInt(dateParts[5], 10);
                const seconds = parseInt(dateParts[6], 10);
                const date = new Date(year, month, day, hours, minutes, seconds);
                return date.toLocaleString("it-IT", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                });
            }
        } else {
            console.error("Invalid timestamp format:", timestamp);
            return null;
        }
    } catch (error) {
        console.error("Error parsing timestamp:", error, timestamp);
        return null;
    }
}

function parseFormattedDate(formattedDate) {
    try {
        const dateParts = formattedDate.match(/Date\((\d+),(\d+),(\d+)\)/);

        if (!dateParts) {
            console.error("Invalid date format:", formattedDate);
            return null;
        }

        const year = parseInt(dateParts[1], 10);
        const month = parseInt(dateParts[2], 10);
        const day = parseInt(dateParts[3], 10);

        const parsedDate = new Date(year, month, day);
        if (isNaN(parsedDate)) {
            console.error("Invalid date:", formattedDate);
            return null;
        }
        return parsedDate.toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch (error) {
        console.error("Error parsing formatted date:", error, formattedDate);
        return null;
    }
}