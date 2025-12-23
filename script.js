const API_KEY = '040c7d694009e3beba1ac79c7d003886';
let config = {
    user: localStorage.getItem('lastfm_user') || '',
    theme: localStorage.getItem('app_theme') || 'theme-dark-default',
    potato: localStorage.getItem('potato_mode') === 'true'
};
let currentTrack = null;

const overlay = document.getElementById('modal-container');
const panelSettings = document.getElementById('panel-settings');
const panelMusic = document.getElementById('panel-music');

function init() {
    document.body.className = config.theme;
    if(config.potato) document.body.classList.add('potato-mode');
    document.getElementById('username-input').value = config.user;
    document.getElementById('potato-mode').checked = config.potato;
    
    updateClock();
    fetchMusic();
    setInterval(updateClock, 1000);
    setInterval(fetchMusic, 15000);
}

// GESTIONE MODALI
document.getElementById('menu-toggle').onclick = () => {
    openModal(panelSettings);
};

document.getElementById('music-widget').onclick = () => {
    showMusicDetails();
};

function openModal(panel) {
    panelSettings.classList.add('hidden');
    panelMusic.classList.add('hidden');
    panel.classList.remove('hidden');
    overlay.classList.add('active');
}

document.querySelectorAll('.close-modal, .overlay').forEach(el => {
    el.onclick = (e) => { if(e.target === overlay || el.classList.contains('close-modal')) overlay.classList.remove('active'); };
});

// SALVATAGGIO
document.getElementById('save-btn').onclick = () => {
    config.user = document.getElementById('username-input').value;
    config.potato = document.getElementById('potato-mode').checked;
    localStorage.setItem('lastfm_user', config.user);
    localStorage.setItem('potato_mode', config.potato);
    location.reload(); // Per applicare potato mode e reset in modo pulito
};

// TEMI
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.onclick = () => {
        config.theme = 'theme-' + btn.dataset.theme;
        document.body.className = config.theme;
        localStorage.setItem('app_theme', config.theme);
    };
});

// OROLOGIO
function updateClock() {
    const now = new Date();
    document.getElementById('hours').innerText = String(now.getHours()).padStart(2, '0');
    document.getElementById('minutes').innerText = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('seconds').innerText = String(now.getSeconds()).padStart(2, '0');
}

// MUSICA
async function fetchMusic() {
    if(!config.user) return;
    try {
        const r = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${config.user}&api_key=${API_KEY}&format=json&limit=1`);
        const d = await r.json();
        const track = d.recenttracks.track[0];
        const isPlaying = track['@attr'] && track['@attr'].nowplaying === 'true';

        if(isPlaying) {
            currentTrack = track;
            document.getElementById('music-widget').classList.remove('hidden');
            document.getElementById('track-name').innerText = track.name;
            document.getElementById('track-artist-small').innerText = track.artist['#text'];
            document.getElementById('track-art').src = track.image[2]['#text'];
        } else {
            document.getElementById('music-widget').classList.add('hidden');
        }
    } catch(e) {}
}

async function showMusicDetails() {
    if(!currentTrack) return;
    openModal(panelMusic);
    document.getElementById('detail-title').innerText = currentTrack.name;
    document.getElementById('detail-artist').innerText = currentTrack.artist['#text'];
    document.getElementById('detail-art').src = currentTrack.image[3]['#text'];

    try {
        const r = await fetch(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${API_KEY}&artist=${encodeURIComponent(currentTrack.artist['#text'])}&track=${encodeURIComponent(currentTrack.name)}&username=${config.user}&format=json`);
        const d = await r.json();
        document.getElementById('info-album').innerText = d.track.album?.title || "N/A";
        document.getElementById('info-plays').innerText = d.track.userplaycount || "0";
        document.getElementById('lastfm-link').href = d.track.url;
    } catch(e) {}
}

init();
