/* ============================================
   ZONAR - Zonal Ocean Noise Analysis & Response
   Dashboard Interactive Engine — Premium Edition
   ============================================ */

const API_BASE = window.location.origin;
let audioPlayer = null;

// ---- Scroll Reveal Observer ----
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ---- Animated Stat Counters ----
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';
                const target = parseInt(entry.target.dataset.count);
                const suffix = entry.target.dataset.suffix || '';
                const duration = 2000;
                const start = performance.now();

                function tick(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(eased * target);
                    entry.target.textContent = current + suffix;
                    if (progress < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
}

// ---- Enhanced Particle Generator ----
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 8 + 's';
        p.style.animationDuration = (5 + Math.random() * 6) + 's';

        // Vary particle sizes for depth
        const size = 1 + Math.random() * 4;
        p.style.width = size + 'px';
        p.style.height = size + 'px';

        // Vary opacity intensity
        p.style.setProperty('--max-opacity', (0.3 + Math.random() * 0.5).toFixed(2));

        container.appendChild(p);
    }
}

// ---- Navbar Scroll Effect ----
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 100) {
            navbar.style.background = 'rgba(10, 14, 39, 0.95)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(10, 14, 39, 0.85)';
            navbar.style.boxShadow = 'none';
        }
        lastScroll = scrollY;
    }, { passive: true });
}

// ---- Scroll Spy — Active Nav Highlighting ----
function initScrollSpy() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = [];

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            const section = document.querySelector(href);
            if (section) sections.push({ link, section });
        }
    });

    if (sections.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active from all
                navLinks.forEach(l => l.classList.remove('active'));
                // Find matching link and activate
                const match = sections.find(s => s.section === entry.target);
                if (match) match.link.classList.add('active');
            }
        });
    }, { threshold: 0.15, rootMargin: '-80px 0px -40% 0px' });

    sections.forEach(s => observer.observe(s.section));
}

// ---- Live Status Text Rotation ----
function initStatusRotation() {
    const statusText = document.getElementById('nav-status-text');
    if (!statusText) return;

    const messages = [
        'HYDROPHONES ACTIVE',
        'MONITORING 60,000+ VESSELS',
        'SDG 14 ENFORCEMENT LIVE',
        'ACOUSTIC SHIELD ONLINE',
        'WHALE COMMS PROTECTED'
    ];

    let idx = 0;
    setInterval(() => {
        statusText.style.opacity = '0';
        statusText.style.transform = 'translateY(-5px)';
        setTimeout(() => {
            idx = (idx + 1) % messages.length;
            statusText.textContent = messages[idx];
            statusText.style.opacity = '1';
            statusText.style.transform = 'translateY(0)';
        }, 300);
    }, 3500);
}

// ---- Spectrogram Visualization ----
function drawSpectrogram(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = 240;
    ctx.clearRect(0, 0, w, h);

    const cols = 120;
    const rows = 40;
    const cellW = w / cols;
    const cellH = h / rows;

    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const baseEnergy = (rows - y) / rows;
            const noise = Math.random() * 0.4;
            const engine = y < 8 ? 0.5 * Math.sin(x * 0.15) + 0.5 : 0;
            const energy = Math.min(1, baseEnergy * 0.3 + noise * 0.3 + engine * 0.4);

            const r = Math.floor(energy * 80);
            const g = Math.floor(energy * 220 + 30);
            const b = Math.floor(energy * 180 + 40);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${energy * 0.9 + 0.1})`;
            ctx.fillRect(x * cellW, y * cellH, cellW - 1, cellH - 1);
        }
    }
}

// ---- DNA Bar Visualization ----
function drawDNA(container, dnaValues) {
    container.innerHTML = '';
    const numBars = 40;
    for (let i = 0; i < numBars; i++) {
        const bar = document.createElement('div');
        bar.className = 'dna-bar';
        const val = dnaValues ? Math.abs(dnaValues[i % dnaValues.length]) : Math.random();
        const normalized = Math.min(1, val / 100);
        bar.style.height = (normalized * 100) + '%';
        bar.style.animationDelay = (i * 30) + 'ms';
        container.appendChild(bar);
    }
}

// ---- Typewriter Effect for Radio Text ----
function typeWriter(element, text, speed = 20) {
    return new Promise((resolve) => {
        element.textContent = '';
        let i = 0;
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

// ---- Pipeline Step Animation ----
async function animateStep(stepNum, statusText, delay = 500) {
    const step = document.getElementById(`step-${stepNum}`);
    const status = document.getElementById(`status-${stepNum}`);

    // Mark active with glow
    step.className = 'step active';
    status.textContent = 'PROCESSING';

    await sleep(delay);

    // Mark complete
    step.className = 'step complete';
    status.textContent = statusText || 'COMPLETE';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ---- ACS Score Display ----
function renderACS(container, acs, vesselName, riskPremium) {
    const tier = acs <= 15 ? 'frozen' : acs >= 80 ? 'standard' : acs >= 50 ? 'elevated' : acs >= 25 ? 'high' : 'critical';
    const tierLabel = tier.toUpperCase();
    const freezeMsg = acs <= 15 ? '<br><span style="color:#ff4757;font-weight:700;">⛔ LICENSE FROZEN</span>' : '';

    container.innerHTML = `
        <div class="acs-score acs-${tier}">${acs}</div>
        <div class="acs-info">
            <h4>Acoustic Credit Score Updated</h4>
            <p>${vesselName} — penalty of 15 points applied${freezeMsg}</p>
        </div>
        <div class="acs-risk risk-${tier}">${riskPremium || tierLabel}</div>
    `;

    // Animate the score with a pulse
    const scoreEl = container.querySelector('.acs-score');
    scoreEl.style.animation = 'acsReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
}

// ---- Vessel Name Map ----
const vesselNames = {
    'GHOST': 'Ghost Vessel (Unknown)',
    'V-1234': 'MV Bering Star',
    'V-5678': 'MV Oceanic Spirit'
};

// ---- MAIN: Trigger Breach ----
async function triggerBreach() {
    const btn = document.getElementById('trigger-btn');
    const select = document.getElementById('vessel-select');
    const vesselId = select.value;
    const vesselName = vesselNames[vesselId] || 'Unknown Vessel';

    // Disable button with loading animation
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span><span>PROCESSING...</span>';

    // Reset all steps
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`step-${i}`).className = 'step';
        document.getElementById(`status-${i}`).textContent = 'WAITING';
    }

    // Stop any playing audio
    if (audioPlayer) { audioPlayer.pause(); audioPlayer = null; }

    // Step 1: Neural Ear — play the audio
    await animateStep(1, 'COMPLETE', 300);
    const canvas = document.getElementById('spectro-canvas');
    drawSpectrogram(canvas);
    // Hide the real spectrogram initially (shown after API response)
    document.getElementById('spectro-image').style.display = 'none';

    // Play the hydrophone audio sample
    try {
        audioPlayer = new Audio(`${API_BASE}/audio/sample_ship.wav`);
        audioPlayer.volume = 0.6;
        audioPlayer.play().catch(e => console.log('Audio autoplay blocked:', e));
    } catch (e) { console.log('Audio not available'); }

    await sleep(400);

    // Step 2: Acoustic DNA
    const dnaViz = document.getElementById('dna-viz');
    document.getElementById('step-2').className = 'step active';
    document.getElementById('status-2').textContent = 'PROCESSING';
    drawDNA(dnaViz, null);
    await sleep(600);

    // Fire the actual API call
    let result = null;
    try {
        const resp = await fetch(`${API_BASE}/trigger-breach`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                vessel_id: vesselId,
                vessel_name: vesselName,
                audio_filename: 'sample_ship.wav'
            })
        });
        const data = await resp.json();
        result = data.result;
    } catch (err) {
        console.error('API error:', err);
        btn.disabled = false;
        btn.innerHTML = '<span class="btn-pulse"></span><span>⚡ TRIGGER BREACH</span>';
        return;
    }

    // Step 2 complete — show real DNA
    if (result.dna_sample) drawDNA(dnaViz, result.dna_sample);
    document.getElementById('step-2').className = 'step complete';
    document.getElementById('status-2').textContent = 'FINGERPRINTED';

    // Show real spectrogram from backend
    if (result.spectrogram_b64) {
        showSpectrogram(result.spectrogram_b64);
    }

    await sleep(400);

    // Step 3: AIS
    await animateStep(3, result.ais_status === 'DARK' ? '⚠ GHOST' : '✓ ACTIVE', 300);
    const aisDiv = document.getElementById('ais-result');
    if (result.ais_status === 'DARK') {
        aisDiv.className = 'ais-result ais-dark';
        aisDiv.innerHTML = `
            <strong>⚠ AIS TRANSPONDER NOT DETECTED</strong><br>
            Vessel classified as <strong>GHOST VESSEL</strong>. No AIS broadcast detected.
            Acoustic DNA logged for future identification.
        `;
    } else {
        aisDiv.className = 'ais-result ais-active';
        aisDiv.innerHTML = `
            <strong>✓ AIS TRANSPONDER ACTIVE</strong><br>
            Vessel identified: <strong>${result.vessel}</strong> (${result.vessel_id}).
            Broadcasting on AIS. Identity confirmed.
        `;
    }

    await sleep(500);

    // Step 4: Advisory
    document.getElementById('step-4').className = 'step active';
    document.getElementById('status-4').textContent = 'BROADCASTING';
    const radioText = document.getElementById('radio-text');
    await typeWriter(radioText, result.advisory, 15);
    document.getElementById('step-4').className = 'step complete';
    document.getElementById('status-4').textContent = 'BROADCAST';

    await sleep(400);

    // Step 5: Blue Ledger
    await animateStep(5, 'ENFORCED', 400);
    const acsDiv = document.getElementById('acs-display');
    const risk = result.acoustic_credit_score <= 15 ? 'FROZEN'
        : result.acoustic_credit_score >= 80 ? 'STANDARD'
            : result.acoustic_credit_score >= 50 ? 'ELEVATED'
                : result.acoustic_credit_score >= 25 ? 'HIGH' : 'CRITICAL';
    renderACS(acsDiv, result.acoustic_credit_score, result.vessel, risk);

    // Fade out audio
    if (audioPlayer) {
        let vol = audioPlayer.volume;
        const fadeOut = setInterval(() => {
            vol -= 0.1;
            if (vol <= 0) { clearInterval(fadeOut); audioPlayer.pause(); audioPlayer = null; }
            else { audioPlayer.volume = vol; }
        }, 100);
    }

    // Update ledger table (reload all entries)
    await loadFullLedger();

    // Add marker to the ocean map
    if (result.location && violationMap) {
        addViolationMarker(result);
    }

    // Re-enable button
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-pulse"></span><span>⚡ TRIGGER BREACH</span>';
}

// ---- Load Full Ledger Table ----
async function loadFullLedger() {
    try {
        const resp = await fetch(`${API_BASE}/ledger`);
        if (!resp.ok) return;
        const vessels = await resp.json();

        const tbody = document.getElementById('ledger-body');
        if (!vessels.length) {
            tbody.innerHTML = `<tr class="ledger-empty"><td colspan="7">No violations recorded yet — trigger a breach to begin</td></tr>`;
            return;
        }

        // Remove empty placeholder
        const emptyRow = tbody.querySelector('.ledger-empty');
        if (emptyRow) emptyRow.remove();

        // Build all rows
        vessels.forEach(vessel => {
            const riskClass = vessel.risk_premium === 'FROZEN' ? 'risk-frozen'
                : vessel.risk_premium === 'STANDARD' ? 'risk-standard'
                    : vessel.risk_premium === 'ELEVATED' ? 'risk-elevated'
                        : vessel.risk_premium === 'HIGH' ? 'risk-high' : 'risk-critical';

            const lastViolation = vessel.last_violation
                ? new Date(vessel.last_violation).toLocaleString()
                : '-';

            // License freeze status
            let freezeCell;
            if (vessel.license_frozen) {
                freezeCell = `<span class="freeze-badge frozen">⛔ FROZEN</span>`;
            } else {
                const ptf = vessel.points_to_freeze;
                // Bar fills as ACS drops: 100=0%, 15=100%
                const barPct = Math.min(100, Math.max(0, ((85 - ptf) / 85) * 100));
                freezeCell = `
                    <span class="freeze-badge active">✅ Active</span>
                    <div class="freeze-meter">
                        <div class="freeze-bar" style="width: ${barPct}%"></div>
                    </div>
                    <span class="freeze-pts">${ptf} pts to freeze</span>
                `;
            }

            const rowHTML = `
                <td><strong>${vessel.name}</strong></td>
                <td><code>${vessel.vessel_id}</code></td>
                <td><strong>${vessel.acs}</strong>/100</td>
                <td>${vessel.violations}</td>
                <td><span class="acs-risk ${riskClass}">${vessel.risk_premium}</span></td>
                <td class="freeze-cell">${freezeCell}</td>
                <td>${lastViolation}</td>
            `;

            let existingRow = tbody.querySelector(`[data-vessel="${vessel.vessel_id}"]`);
            if (existingRow) {
                existingRow.innerHTML = rowHTML;
                existingRow.style.animation = 'none';
                existingRow.offsetHeight;
                existingRow.style.animation = 'rowFlash 1s ease-out';
            } else {
                const tr = document.createElement('tr');
                tr.setAttribute('data-vessel', vessel.vessel_id);
                tr.innerHTML = rowHTML;
                tr.style.animation = 'rowFlash 1s ease-out';
                tbody.appendChild(tr);
            }
        });
    } catch (e) {
        console.error('Ledger fetch error:', e);
    }
}

// ---- Clear Ledger ----
async function clearLedger() {
    if (!confirm('Clear all ledger records? This cannot be undone.')) return;
    try {
        await fetch(`${API_BASE}/ledger`, { method: 'DELETE' });
        const tbody = document.getElementById('ledger-body');
        tbody.innerHTML = `<tr class="ledger-empty"><td colspan="7">No violations recorded yet — trigger a breach to begin</td></tr>`;
        // Also clear heatmap and markers from the map
        if (heatLayer) { heatData = []; heatLayer.setLatLngs([]); }
        if (violationMap) {
            violationMap.eachLayer(layer => {
                if (layer instanceof L.Marker) violationMap.removeLayer(layer);
            });
        }
    } catch (e) {
        console.error('Clear ledger error:', e);
    }
}

// ---- Injected Keyframe Animations ----
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes rowFlash {
        0% { background: rgba(0, 212, 170, 0.2); }
        100% { background: transparent; }
    }
    @keyframes acsReveal {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .btn-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
    }
    #nav-status-text {
        transition: opacity 0.3s, transform 0.3s;
    }
    @keyframes markerPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.4); opacity: 0.7; }
    }
`;
document.head.appendChild(styleSheet);

// ---- Smooth Scroll for Nav Links ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            // Force-reveal all hidden elements in the target section
            target.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
            if (target.classList.contains('reveal')) target.classList.add('visible');
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ---- Init Everything ----
let violationMap = null;
let heatLayer = null;
let heatData = [];

function initMap() {
    const mapEl = document.getElementById('violation-map');
    if (!mapEl || typeof L === 'undefined') return;

    violationMap = L.map('violation-map', {
        center: [10, 76],
        zoom: 4,
        zoomControl: true,
        scrollWheelZoom: true
    });

    // Dark ocean tiles from CartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(violationMap);

    // Initialize the heatmap layer
    if (typeof L.heatLayer !== 'undefined') {
        heatLayer = L.heatLayer([], {
            radius: 35,
            blur: 25,
            maxZoom: 10,
            max: 1.0,
            minOpacity: 0.4,
            gradient: {
                0.0: '#0a0e27',
                0.2: '#1a237e',
                0.4: '#0d47a1',
                0.5: '#00bcd4',
                0.6: '#ff9800',
                0.8: '#ff5722',
                1.0: '#f44336'
            }
        }).addTo(violationMap);
    }

    // Fix tiles not loading when map is in hidden section
    setTimeout(() => violationMap.invalidateSize(), 500);

    // Also fix when section becomes visible via scroll
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting && violationMap) violationMap.invalidateSize();
        });
    });
    obs.observe(mapEl);
}

function showSpectrogram(b64) {
    const imgEl = document.getElementById('spectro-image');
    const canvasEl = document.getElementById('spectro-canvas');
    if (imgEl && b64) {
        imgEl.src = 'data:image/png;base64,' + b64;
        imgEl.style.display = 'block';
        if (canvasEl) canvasEl.style.display = 'none';
    }
}

function addViolationMarker(result) {
    const loc = result.location;
    const isGhost = result.ais_status === 'DARK';
    const color = isGhost ? '#ff4757' : '#00d4aa';

    // Calculate heat intensity from ACS (lower score = hotter)
    const intensity = Math.max(0.3, 1.0 - (result.acoustic_credit_score / 100));

    // Add to heatmap - multiple points for a wider glow
    if (heatLayer) {
        heatData.push([loc.lat, loc.lng, intensity]);
        // Add surrounding points for a richer effect
        for (let i = 0; i < 5; i++) {
            const jitterLat = loc.lat + (Math.random() - 0.5) * 0.8;
            const jitterLng = loc.lng + (Math.random() - 0.5) * 0.8;
            heatData.push([jitterLat, jitterLng, intensity * 0.6]);
        }
        heatLayer.setLatLngs(heatData);
    }

    // Still add a clickable marker for info
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            width: 14px; height: 14px;
            background: ${color};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 12px ${color}, 0 0 24px ${color}40;
            animation: markerPulse 2s ease-in-out infinite;
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(violationMap);

    const riskLabel = result.acoustic_credit_score <= 15 ? 'FROZEN'
        : result.acoustic_credit_score >= 80 ? 'STANDARD'
            : result.acoustic_credit_score >= 50 ? 'ELEVATED'
                : result.acoustic_credit_score >= 25 ? 'HIGH' : 'CRITICAL';

    marker.bindPopup(`
        <div style="font-family: 'Outfit', sans-serif; min-width: 200px;">
            <strong style="font-size: 1.1em;">${isGhost ? '👻' : '🚢'} ${result.vessel}</strong><br>
            <span style="color: #888;">ID: ${result.vessel_id}</span><br>
            <hr style="border: 0; border-top: 1px solid #333; margin: 6px 0;">
            <strong>Zone:</strong> ${loc.zone}<br>
            <strong>AIS:</strong> <span style="color: ${isGhost ? '#ff4757' : '#00d4aa'};">${result.ais_status}</span><br>
            <strong>ACS:</strong> ${result.acoustic_credit_score}/100 (${riskLabel})<br>
            <strong>Noise Intensity:</strong> <span style="color: #ff5722;">${Math.round(intensity * 100)}%</span><br>
            <strong>Coords:</strong> ${loc.lat}°, ${loc.lng}°
        </div>
    `);

    // Pan map to new marker
    violationMap.flyTo([loc.lat, loc.lng], 6, { duration: 1.5 });
}

// ---- Marine Mammal Species Data (per-species, unique colors) ----
let mammalLayerGroup = null;
const MAMMAL_SPECIES = {
    'Blue Whale': {
        emoji: '🐋', color: '#00bcd4', radius: 18000,
        info: 'Largest animal on Earth. Produces infrasonic calls (14-30 Hz) audible over 1,000 km.',
        points: [
            { lat: 6.0, lng: 80.0, zone: 'Sri Lanka Southern Coast' },
            { lat: 5.5, lng: 79.5, zone: 'Dondra Head Corridor' },
            { lat: 4.0, lng: 73.5, zone: 'Maldives Central Atolls' },
            { lat: 3.5, lng: 73.0, zone: 'Maldives Southern Passage' },
            { lat: 5.0, lng: 76.0, zone: 'Laccadive Sea Deep' },
        ]
    },
    'Sperm Whale': {
        emoji: '🐳', color: '#9c27b0', radius: 16000,
        info: 'Loudest animal — clicks reach 230 dB for echolocation. Dives to 2,000m.',
        points: [
            { lat: 8.5, lng: 76.5, zone: 'Lakshadweep Deep Trench' },
            { lat: 9.0, lng: 75.5, zone: 'Kerala Continental Shelf' },
            { lat: 10.0, lng: 74.0, zone: 'Arabian Sea Canyon' },
            { lat: 7.5, lng: 77.0, zone: 'Kanyakumari Deep' },
        ]
    },
    'Humpback Whale': {
        emoji: '🎵', color: '#ffc107', radius: 16000,
        info: 'Famous for complex songs lasting hours. Frequencies: 80-4000 Hz.',
        points: [
            { lat: 16.5, lng: 54.0, zone: 'Oman Breeding Ground' },
            { lat: 17.0, lng: 56.0, zone: 'Arabian Sea Migration' },
            { lat: 15.0, lng: 52.0, zone: 'Gulf of Aden Entry' },
            { lat: 15.5, lng: 73.5, zone: 'Goa Offshore Bank' },
        ]
    },
    'Dolphin': {
        emoji: '🐬', color: '#76ff03', radius: 12000,
        info: 'Uses broadband clicks (20-130 kHz) and whistles for echolocation & social communication.',
        points: [
            { lat: 12.0, lng: 92.5, zone: 'Andaman Sea Channel' },
            { lat: 11.5, lng: 92.0, zone: 'Nicobar Islands Shallows' },
            { lat: 19.7, lng: 85.3, zone: 'Chilika Lake (Irrawaddy)' },
            { lat: 5.0, lng: 73.0, zone: 'Maldives (Spinner)' },
            { lat: 1.3, lng: 104.0, zone: 'Singapore Strait (Indo-Pacific)' },
            { lat: 21.5, lng: 88.5, zone: 'Sundarbans Estuary' },
        ]
    },
    'Sea Turtle': {
        emoji: '🐢', color: '#4caf50', radius: 10000,
        info: 'Acoustic-sensitive: low-frequency noise disrupts nesting & hatchling navigation.',
        points: [
            { lat: 13.0, lng: 80.3, zone: 'Chennai Coast (Olive Ridley)' },
            { lat: 14.5, lng: 80.5, zone: 'Andhra Nesting Beach' },
            { lat: 20.0, lng: 87.0, zone: 'Gahirmatha Mass Nesting' },
            { lat: 19.5, lng: 85.5, zone: 'Rushikulya Rookery' },
        ]
    },
    'Dugong': {
        emoji: '🦭', color: '#e91e63', radius: 11000,
        info: 'Endangered marine mammal. Communicates via chirps & barks (1-8 kHz). Seagrass dependent.',
        points: [
            { lat: 9.8, lng: 79.2, zone: 'Palk Bay Seagrass Beds' },
            { lat: 22.5, lng: 69.5, zone: 'Gulf of Kutch Sanctuary' },
            { lat: 22.0, lng: 70.0, zone: 'Jamnagar Marine NP' },
        ]
    },
    'Fin Whale': {
        emoji: '🐋', color: '#3f51b5', radius: 17000,
        info: 'Second-largest whale. 20 Hz pulses — among the loudest biological sounds.',
        points: [
            { lat: -5.0, lng: 70.0, zone: 'Central Indian Ridge' },
            { lat: -3.0, lng: 72.0, zone: 'Chagos Deep Basin' },
            { lat: -7.0, lng: 68.0, zone: 'Southern Indian Abyss' },
        ]
    },
    'Shrimp & Krill': {
        emoji: '🦐', color: '#ff7043', radius: 9000,
        info: 'Snapping shrimp colonies create "biophonic reef noise" up to 200 dB — vital ecosystem indicator.',
        points: [
            { lat: 9.0, lng: 79.0, zone: 'Gulf of Mannar Reef' },
            { lat: 8.5, lng: 78.5, zone: 'Tuticorin Coral Banks' },
            { lat: 11.8, lng: 93.0, zone: 'Andaman Coral Reef' },
            { lat: 10.5, lng: 72.5, zone: 'Lakshadweep Lagoons' },
            { lat: 4.5, lng: 73.5, zone: 'Maldives Ari Atoll Reef' },
        ]
    }
};

// ---- Proposed Hydrophone Array Locations ----
let hydrophoneMarkers = [];
const HYDROPHONE_SITES = [
    { lat: 6.2, lng: 80.1, name: "Sri Lanka Deep Array", depth: "1,200m", covers: "Blue Whale Migration Corridor", priority: "Critical" },
    { lat: 8.8, lng: 76.2, name: "Lakshadweep Gateway", depth: "800m", covers: "Sperm Whale Dive Zones", priority: "High" },
    { lat: 13.0, lng: 80.3, name: "Chennai Coastal Node", depth: "200m", covers: "Turtle Nesting & Dolphin Pods", priority: "High" },
    { lat: 3.8, lng: 73.2, name: "Maldives Southern Atoll", depth: "2,500m", covers: "Blue Whale Feeding Grounds", priority: "Critical" },
    { lat: 12.5, lng: 92.8, name: "Andaman Deep Trench", depth: "3,000m", covers: "Indo-Pacific Dolphin Corridor", priority: "Medium" },
    { lat: 20.5, lng: 86.5, name: "Orissa Coastal Monitor", depth: "150m", covers: "Olive Ridley Migration Path", priority: "High" },
    { lat: 15.5, lng: 73.5, name: "Goa Offshore Sentinel", depth: "600m", covers: "Humpback & Bryde's Whale Zone", priority: "Medium" },
    { lat: 1.3, lng: 103.9, name: "Singapore Strait Gateway", depth: "50m", covers: "High-Traffic Dolphin Conflict Zone", priority: "Critical" },
];

function initMammalLayer() {
    if (!violationMap) return;

    mammalLayerGroup = L.layerGroup();

    Object.entries(MAMMAL_SPECIES).forEach(([species, data]) => {
        data.points.forEach(pt => {
            const circle = L.circle([pt.lat, pt.lng], {
                radius: data.radius,
                color: data.color,
                fillColor: data.color,
                fillOpacity: 0.22,
                weight: 1.5,
                opacity: 0.6,
            });

            circle.bindPopup(`
                <div style="font-family: 'Outfit', sans-serif; min-width: 220px;">
                    <strong style="font-size: 1.15em;">${data.emoji} ${species}</strong><br>
                    <hr style="border: 0; border-top: 1px solid #333; margin: 6px 0;">
                    <strong>Zone:</strong> ${pt.zone}<br>
                    <strong>Acoustic Profile:</strong><br>
                    <span style="font-size: 0.85em; color: #aaa;">${data.info}</span><br>
                    <strong>Coords:</strong> ${pt.lat}°, ${pt.lng}°
                </div>
            `);

            mammalLayerGroup.addLayer(circle);
        });
    });
    // Don't add to map yet — user toggles it on
}

function initHydrophoneLayer() {
    if (!violationMap) return;

    HYDROPHONE_SITES.forEach(site => {
        const priorityColor = site.priority === 'Critical' ? '#ff9800'
            : site.priority === 'High' ? '#00bcd4' : '#78909c';

        const icon = L.divIcon({
            className: 'hydrophone-marker',
            html: `<div style="
                width: 22px; height: 22px;
                background: ${priorityColor};
                border-radius: 4px;
                border: 2px solid white;
                display: flex; align-items: center; justify-content: center;
                font-size: 12px;
                box-shadow: 0 0 10px ${priorityColor}, 0 0 20px ${priorityColor}30;
            ">📡</div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        });

        const marker = L.marker([site.lat, site.lng], { icon });

        marker.bindPopup(`
            <div style="font-family: 'Outfit', sans-serif; min-width: 220px;">
                <strong style="font-size: 1.1em;">📡 ${site.name}</strong><br>
                <hr style="border: 0; border-top: 1px solid #333; margin: 6px 0;">
                <strong>Depth:</strong> ${site.depth}<br>
                <strong>Coverage:</strong> ${site.covers}<br>
                <strong>Priority:</strong> <span style="color: ${priorityColor}; font-weight: 700;">${site.priority}</span><br>
                <strong>Coords:</strong> ${site.lat}°N, ${site.lng}°E
            </div>
        `);

        hydrophoneMarkers.push(marker);
    });
    // Don't add to map yet — user toggles them on
}

// ---- In-Map Legend (Leaflet Control) ----
let mapLegendControl = null;

function initMapLegend() {
    if (!violationMap) return;

    mapLegendControl = L.control({ position: 'bottomright' });
    mapLegendControl.onAdd = function () {
        const div = L.DomUtil.create('div', 'leaflet-legend');
        updateLegendContent(div);
        return div;
    };
    mapLegendControl.addTo(violationMap);
}

function updateLegendContent(container) {
    if (!container) {
        container = document.querySelector('.leaflet-legend');
        if (!container) return;
    }

    let html = '<div class="legend-title">🗺️ Map Legend</div>';

    // Always show violation layer items
    if (layerState.violations) {
        html += `
            <div class="legend-row"><span class="ldot" style="background:#ff4757;box-shadow:0 0 4px #ff4757;"></span> Ghost Vessel</div>
            <div class="legend-row"><span class="ldot" style="background:#00d4aa;box-shadow:0 0 4px #00d4aa;"></span> Identified Vessel</div>
            <div class="legend-row"><span class="ldot" style="background:linear-gradient(90deg,#ff9800,#f44336);"></span> Noise Intensity</div>
        `;
    }

    // Show per-species legend when mammals are active
    if (layerState.mammals) {
        html += '<div class="legend-divider"></div>';
        html += '<div class="legend-subtitle">Marine Species</div>';
        Object.entries(MAMMAL_SPECIES).forEach(([species, data]) => {
            html += `<div class="legend-row"><span class="ldot" style="background:${data.color};box-shadow:0 0 4px ${data.color};"></span> ${data.emoji} ${species}</div>`;
        });
    }

    // Hydrophone legend
    if (layerState.hydrophones) {
        html += '<div class="legend-divider"></div>';
        html += '<div class="legend-subtitle">Hydrophone Priority</div>';
        html += `
            <div class="legend-row"><span class="ldot ldot-sq" style="background:#ff9800;"></span> Critical</div>
            <div class="legend-row"><span class="ldot ldot-sq" style="background:#00bcd4;"></span> High</div>
            <div class="legend-row"><span class="ldot ldot-sq" style="background:#78909c;"></span> Medium</div>
        `;
    }

    container.innerHTML = html;
}

// ---- Map Layer Toggle ----
const layerState = { violations: true, mammals: false, hydrophones: false };

function toggleMapLayer(layer) {
    layerState[layer] = !layerState[layer];
    const btn = document.getElementById(`toggle-${layer}`);

    if (layerState[layer]) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }

    // Apply layer visibility
    if (layer === 'violations') {
        if (heatLayer) {
            if (layerState.violations) { heatLayer.addTo(violationMap); }
            else { violationMap.removeLayer(heatLayer); }
        }
    }

    if (layer === 'mammals') {
        if (mammalLayerGroup) {
            if (layerState.mammals) { mammalLayerGroup.addTo(violationMap); }
            else { violationMap.removeLayer(mammalLayerGroup); }
        }
    }

    if (layer === 'hydrophones') {
        hydrophoneMarkers.forEach(m => {
            if (layerState.hydrophones) { m.addTo(violationMap); }
            else { violationMap.removeLayer(m); }
        });
    }

    // Update the in-map legend
    updateLegendContent();
}

document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    initScrollReveal();
    animateCounters();
    initNavbarScroll();
    initStatusRotation();
    loadFullLedger();
    initMap();
    initMammalLayer();
    initHydrophoneLayer();
    initMapLegend();
});
