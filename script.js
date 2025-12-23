const API_KEY = '040c7d694009e3beba1ac79c7d003886';
let lastfmUser = localStorage.getItem('lastfm_user');

// --- Orologio ---
function updateClock() {
    const now = new Date();
    const parts = {
        hours: String(now.getHours()).padStart(2, '0'),
        minutes: String(now.getMinutes()).padStart(2, '0'),
        seconds: String(now.getSeconds()).padStart(2, '0')
    };

    for (const [unit, value] of Object.entries(parts)) {
        const el = document.getElementById(unit);
        if (el.textContent !== value) {
            el.style.transform = "scale(0.95)";
            el.style.opacity = "0.7";
            setTimeout(() => {
                el.textContent = value;
                el.style.transform = "scale(1)";
                el.style.opacity = "1";
            }, 100);
        }
    }
}

// --- Last.fm ---
async function fetchMusic() {
    if (!lastfmUser) return;

    try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastfmUser}&api_key=${API_KEY}&format=json&limit=1`;
        const response = await fetch(url);
        const data = await response.json();
        const track = data.recenttracks.track[0];
        
        const isNowPlaying = track['@attr'] && track['@attr'].nowplaying === 'true';
        const widget = document.getElementById('music-widget');
        const bg = document.getElementById('dynamic-bg');

        if (isNowPlaying) {
            const imgUrl = track.image[3]['#text'];
            document.getElementById('track-title').textContent = track.name;
            document.getElementById('track-artist').textContent = track.artist['#text'];
            document.getElementById('track-art').src = imgUrl || 'https://via.placeholder.com/100';
            
            widget.classList.remove('hidden');
            // Aggiorna lo sfondo con la copertina dell'album
            if (imgUrl) bg.style.backgroundImage = `radial-gradient(circle, rgba(2,6,23,0.7) 30%, #020617), url(${imgUrl})`;
        } else {
            widget.classList.add('hidden');
            bg.style.backgroundImage = 'none';
        }
    } catch (err) {
        console.warn("Errore API:", err);
    }
}

// --- Configurazione ---
document.getElementById('config-btn').addEventListener('click', () => {
    const user = prompt("Inserisci il tuo nome utente Last.fm:", lastfmUser || "");
    if (user !== null) {
        localStorage.setItem('lastfm_user', user);
        lastfmUser = user;
        fetchMusic();
    }
});

// Inizializzazione
setInterval(updateClock, 1000);
setInterval(fetchMusic, 15000); // Controlla ogni 15 sec
updateClock();
fetchMusic();