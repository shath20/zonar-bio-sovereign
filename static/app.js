/* ============================================
   ZONAR - Zonal Ocean Noise Analysis & Response
   Dashboard Interactive Engine
   ============================================ */

const API_BASE = window.location.origin;
let audioPlayer = null;

// ---- Particle Generator ----
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 6 + 's';
        p.style.animationDuration = (4 + Math.random() * 4) + 's';
        container.appendChild(p);
    }
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
            // Simulate spectral energy — stronger at low frequencies (bottom)
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

    // Mark active
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
    const tier = acs >= 80 ? 'standard' : acs >= 50 ? 'elevated' : acs >= 25 ? 'high' : 'critical';
    const tierLabel = tier.toUpperCase();

    container.innerHTML = `
        <div class="acs-score acs-${tier}">${acs}</div>
        <div class="acs-info">
            <h4>Acoustic Credit Score Updated</h4>
            <p>${vesselName} — penalty of 15 points applied</p>
        </div>
        <div class="acs-risk risk-${tier}">${riskPremium || tierLabel}</div>
    `;
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

    // Disable button
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ PROCESSING...</span>';

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
    const risk = result.acoustic_credit_score >= 80 ? 'STANDARD'
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

    // Update ledger table
    await updateLedger(result.vessel_id);

    // Re-enable button
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-pulse"></span><span>⚡ TRIGGER BREACH</span>';
}

// ---- Ledger Table Update ----
async function updateLedger(vesselId) {
    try {
        const resp = await fetch(`${API_BASE}/ledger/${vesselId}`);
        if (!resp.ok) return;
        const vessel = await resp.json();

        const tbody = document.getElementById('ledger-body');
        // Remove empty placeholder
        const emptyRow = tbody.querySelector('.ledger-empty');
        if (emptyRow) emptyRow.remove();

        // Check if row already exists
        let existingRow = tbody.querySelector(`[data-vessel="${vesselId}"]`);
        const riskClass = vessel.risk_premium === 'STANDARD' ? 'risk-standard'
            : vessel.risk_premium === 'ELEVATED' ? 'risk-elevated'
                : vessel.risk_premium === 'HIGH' ? 'risk-high' : 'risk-critical';

        const lastViolation = vessel.last_violation
            ? new Date(vessel.last_violation).toLocaleString()
            : '-';

        const rowHTML = `
            <td><strong>${vessel.name}</strong></td>
            <td><code>${vessel.vessel_id}</code></td>
            <td><strong>${vessel.acs}</strong>/100</td>
            <td>${vessel.violations}</td>
            <td><span class="acs-risk ${riskClass}">${vessel.risk_premium}</span></td>
            <td>${lastViolation}</td>
        `;

        if (existingRow) {
            existingRow.innerHTML = rowHTML;
            existingRow.style.animation = 'none';
            existingRow.offsetHeight; // trigger reflow
            existingRow.style.animation = 'rowFlash 1s ease-out';
        } else {
            const tr = document.createElement('tr');
            tr.setAttribute('data-vessel', vesselId);
            tr.innerHTML = rowHTML;
            tr.style.animation = 'rowFlash 1s ease-out';
            tbody.appendChild(tr);
        }
    } catch (e) {
        console.error('Ledger fetch error:', e);
    }
}

// ---- Row Flash Animation (injected via JS) ----
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes rowFlash {
        0% { background: rgba(0, 212, 170, 0.2); }
        100% { background: transparent; }
    }
`;
document.head.appendChild(styleSheet);

// ---- Smooth Scroll for Nav Links ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
});
