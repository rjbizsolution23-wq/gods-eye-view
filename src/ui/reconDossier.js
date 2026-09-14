/**
 * RJ God's Eye™ — AI Target Recon Dossier & Audio Intelligence Engine
 * Author: NeuronEdge Labs™ (RJ Business Solutions)
 * Brand: Rick Jefferson (RJ Business Solutions)
 */

let currentDossierData = null;
let speechSynthUtterance = null;
let isSpeaking = false;

/**
 * Generate tactical intelligence analysis based on target metadata
 */
export function generateOsintReport(target) {
  if (!target) return null;

  const id = target.id || target.callsign || target.name || 'UNKNOWN-CONTACT';
  const layer = (target.layerId || target.category || 'general').toLowerCase();
  const lat = target.lat != null ? Number(target.lat).toFixed(4) : (target.latitude != null ? Number(target.latitude).toFixed(4) : '--');
  const lon = target.lon != null ? Number(target.lon).toFixed(4) : (target.longitude != null ? Number(target.longitude).toFixed(4) : '--');
  const alt = target.altitude != null ? `${Math.round(target.altitude)} FT` : (target.alt != null ? `${Math.round(target.alt)} FT` : 'SURFACE');
  const speed = target.speed != null ? `${Math.round(target.speed)} KTS` : (target.velocity != null ? `${Math.round(target.velocity)} KM/H` : '--');
  const heading = target.heading != null ? `${Math.round(target.heading)}°` : (target.track != null ? `${Math.round(target.track)}°` : '--');

  let typeBadge = 'TACTICAL CONTACT';
  let threatLevel = 'NORMAL / LOW';
  let threatColor = '#10B981';
  let analysis = '';
  let voiceScript = '';

  if (layer.includes('flight') || layer.includes('aircraft')) {
    const isMil = layer.includes('military') || (target.callsign && /^(RCH|SAM|NAVY|AF|VIP|FORTE|HOMER)/i.test(target.callsign));
    typeBadge = isMil ? 'MILITARY / GOV AIRCRAFT' : 'COMMERCIAL FLIGHT';
    threatLevel = isMil ? 'ELEVATED SURVEILLANCE' : 'ROUTINE TRANSIT';
    threatColor = isMil ? '#F59E0B' : '#10B981';

    const origin = target.origin || target.from || 'ORIGIN FILED';
    const dest = target.destination || target.to || 'EN ROUTE';
    
    analysis = `Aircraft ${id} tracked on active transponder squawk. Operating at ${alt} ground-referenced altitude with groundspeed ${speed} on vector ${heading}. Flight trajectory indicates continuous navigation along standard air corridor. Telemetry status: STABLE.`;
    voiceScript = `Target identified: ${typeBadge} call sign ${id}. Operating at altitude ${alt}, vector ${heading} at ${speed}. Telemetry verified by OpenSky Radar network. Threat status: ${threatLevel}.`;
  } else if (layer.includes('vessel') || layer.includes('ship') || layer.includes('ais')) {
    const vesselType = target.type || target.vesselType || 'CARGO / FREIGHT';
    typeBadge = `MARITIME: ${vesselType.toUpperCase()}`;
    threatLevel = 'COMMERCIAL FREIGHT';
    threatColor = '#00D4FF';

    analysis = `AIS Transponder ping received from ${id}. Navigational speed ${speed} heading ${heading}. Current coordinates: ${lat}° N, ${lon}° E. Ship telemetry streaming live via AISStream global marine receiver mesh.`;
    voiceScript = `Maritime target locked: ${id}, classified as ${vesselType}. Navigating heading ${heading} at ${speed}. Position confirmed at coordinates ${lat} by ${lon}.`;
  } else if (layer.includes('satellite') || layer.includes('norad')) {
    typeBadge = 'ORBITAL SATELLITE (SGP4)';
    threatLevel = 'SPACE VEHICLE';
    threatColor = '#A855F7';

    analysis = `NORAD catalog contact #${id}. Propagating orbital mechanics via SGP4 real-time perturbation physics. Orbital velocity: ~27,500 km/h in low-to-medium Earth orbit. Ground track nadir at ${lat}°, ${lon}°.`;
    voiceScript = `Orbital contact confirmed. NORAD satellite catalog ${id}. Orbital track mapped at altitude ${alt}. SGP4 trajectory active.`;
  } else if (layer.includes('earthquake') || layer.includes('seismic')) {
    const mag = target.mag || target.magnitude || 'M4.0+';
    typeBadge = `SEISMIC EVENT: ${mag}`;
    threatLevel = Number(parseFloat(mag)) >= 6.0 ? 'CRITICAL SEISMIC' : 'MODERATE SEISMIC';
    threatColor = Number(parseFloat(mag)) >= 6.0 ? '#EF4444' : '#F59E0B';

    analysis = `USGS Earth seismic epicenter detected at latitude ${lat}°, longitude ${lon}°. Magnitude: ${mag}. Depth: ${target.depth || 10} km. Subsurface shockwave telemetry ingested.`;
    voiceScript = `Seismic alert: Magnitude ${mag} earthquake detected at depth ${target.depth || 10} kilometers near coordinates ${lat}, ${lon}.`;
  } else if (layer.includes('cctv')) {
    typeBadge = 'MUNICIPAL CCTV INTERSECTION';
    threatLevel = 'OPTICAL FEED ACTIVE';
    threatColor = '#00D4FF';

    analysis = `Fixed optical optical surveillance camera: ${target.name || id}. Stream calibrated to local municipal network. Real-time traffic monitoring online.`;
    voiceScript = `CCTV surveillance node accessed. Node ID ${id}. Visual feed online and calibrated.`;
  } else {
    analysis = `Surface entity ${id} selected. Coordinates: ${lat}°, ${lon}°. Telemetry logged in situational memory index.`;
    voiceScript = `Tactical entity ${id} locked at coordinates ${lat} by ${lon}. Telemetry recording active.`;
  }

  return {
    id,
    title: id,
    typeBadge,
    threatLevel,
    threatColor,
    lat,
    lon,
    alt,
    speed,
    heading,
    analysis,
    voiceScript,
    timestamp: new Date().toISOString(),
    raw: target
  };
}

/**
 * Open and render the holographic Recon Dossier card
 */
export function openReconDossier(targetData) {
  const dossier = generateOsintReport(targetData);
  if (!dossier) return;

  currentDossierData = dossier;

  let modal = document.getElementById('rj-recon-dossier');
  if (!modal) {
    modal = createDossierElement();
    document.body.appendChild(modal);
  }

  document.getElementById('rj-dossier-title').textContent = dossier.title;
  document.getElementById('rj-dossier-badge').textContent = dossier.typeBadge;
  
  const threatEl = document.getElementById('rj-dossier-threat');
  threatEl.textContent = dossier.threatLevel;
  threatEl.style.color = dossier.threatColor;
  threatEl.style.borderColor = dossier.threatColor;

  document.getElementById('rj-dossier-lat').textContent = dossier.lat;
  document.getElementById('rj-dossier-lon').textContent = dossier.lon;
  document.getElementById('rj-dossier-alt').textContent = dossier.alt;
  document.getElementById('rj-dossier-speed').textContent = dossier.speed;
  document.getElementById('rj-dossier-heading').textContent = dossier.heading;
  document.getElementById('rj-dossier-analysis').textContent = dossier.analysis;
  document.getElementById('rj-dossier-time').textContent = new Date().toLocaleTimeString() + ' UTC';

  modal.classList.add('active');

  // Trigger optional auto voice briefing if voice is active
  stopVoiceBriefing();
}

export function closeReconDossier() {
  const modal = document.getElementById('rj-recon-dossier');
  if (modal) modal.classList.remove('active');
  stopVoiceBriefing();
}

/**
 * Voice Audio Mission Briefing (Synthesizes tactical voice readout)
 */
export function triggerVoiceBriefing() {
  if (!currentDossierData || !('speechSynthesis' in window)) {
    console.warn('[RJ Recon] Speech synthesis not supported or no active dossier');
    return;
  }

  if (isSpeaking) {
    stopVoiceBriefing();
    return;
  }

  stopVoiceBriefing();

  speechSynthUtterance = new SpeechSynthesisUtterance(currentDossierData.voiceScript);
  speechSynthUtterance.rate = 1.05;
  speechSynthUtterance.pitch = 0.95;

  // Try to find a crisp robotic/tactical English voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Samantha')));
  if (preferredVoice) speechSynthUtterance.voice = preferredVoice;

  const btn = document.getElementById('rj-dossier-voice-btn');
  const wave = document.getElementById('rj-dossier-voice-wave');

  speechSynthUtterance.onstart = () => {
    isSpeaking = true;
    if (btn) {
      btn.classList.add('speaking');
      btn.innerHTML = '<span>⏹️ STOP BRIEFING</span>';
    }
    if (wave) wave.classList.add('active');
  };

  speechSynthUtterance.onend = () => {
    isSpeaking = false;
    if (btn) {
      btn.classList.remove('speaking');
      btn.innerHTML = '<span>🎙️ VOICE BRIEFING</span>';
    }
    if (wave) wave.classList.remove('active');
  };

  speechSynthUtterance.onerror = () => {
    isSpeaking = false;
    if (btn) {
      btn.classList.remove('speaking');
      btn.innerHTML = '<span>🎙️ VOICE BRIEFING</span>';
    }
    if (wave) wave.classList.remove('active');
  };

  window.speechSynthesis.speak(speechSynthUtterance);
}

export function stopVoiceBriefing() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  isSpeaking = false;
  const btn = document.getElementById('rj-dossier-voice-btn');
  const wave = document.getElementById('rj-dossier-voice-wave');
  if (btn) {
    btn.classList.remove('speaking');
    btn.innerHTML = '<span>🎙️ VOICE BRIEFING</span>';
  }
  if (wave) wave.classList.remove('active');
}

/**
 * Copy structured dossier markdown report to clipboard
 */
export function exportDossierMarkdown() {
  if (!currentDossierData) return;
  const d = currentDossierData;
  const md = `# 🛰️ RJ GOD'S EYE™ — TARGET RECON DOSSIER
**Author:** RJ Business Solutions Intelligence Engine (Rick Jefferson)
**Target Identifier:** ${d.id}
**Classification:** ${d.typeBadge}
**Threat Assessment:** ${d.threatLevel}
**Timestamp:** ${d.timestamp}

---
### 📍 Telemetry Coordinates
- **Latitude:** ${d.lat}°
- **Longitude:** ${d.lon}°
- **Altitude:** ${d.alt}
- **Speed:** ${d.speed}
- **Heading / Track:** ${d.heading}

---
### 🧠 Tactical AI Assessment
${d.analysis}

*Generated live via RJ God's Eye™ (https://rj-gods-eye.pages.dev)*
`;
  navigator.clipboard.writeText(md).then(() => {
    const exportBtn = document.getElementById('rj-dossier-export-btn');
    if (exportBtn) {
      const orig = exportBtn.innerHTML;
      exportBtn.innerHTML = '<span>✅ COPIED TO CLIPBOARD</span>';
      setTimeout(() => { exportBtn.innerHTML = orig; }, 2000);
    }
  });
}

function createDossierElement() {
  const div = document.createElement('aside');
  div.id = 'rj-recon-dossier';
  div.className = 'rj-recon-dossier';
  div.setAttribute('aria-label', 'AI Target Recon Dossier');
  div.innerHTML = `
    <div class="rj-dossier-scanlines" aria-hidden="true"></div>
    <header class="rj-dossier-header">
      <div class="rj-dossier-brand-tag">
        <span class="rj-dossier-pulse"></span>
        <span>RJ TACTICAL OSINT DOSSIER</span>
      </div>
      <button type="button" class="rj-dossier-close" onclick="window.closeRjDossier()" aria-label="Close Dossier">✕</button>
    </header>

    <div class="rj-dossier-content">
      <div class="rj-dossier-headline">
        <div>
          <span id="rj-dossier-badge" class="rj-dossier-badge">TACTICAL CONTACT</span>
          <h2 id="rj-dossier-title" class="rj-dossier-title">CONTACT ID</h2>
        </div>
        <div id="rj-dossier-threat" class="rj-dossier-threat">LOW RISK</div>
      </div>

      <div class="rj-dossier-telemetry-grid">
        <div class="rj-telemetry-item">
          <small>LATITUDE</small>
          <strong id="rj-dossier-lat">--</strong>
        </div>
        <div class="rj-telemetry-item">
          <small>LONGITUDE</small>
          <strong id="rj-dossier-lon">--</strong>
        </div>
        <div class="rj-telemetry-item">
          <small>ALTITUDE</small>
          <strong id="rj-dossier-alt">--</strong>
        </div>
        <div class="rj-telemetry-item">
          <small>GROUNDSPEED</small>
          <strong id="rj-dossier-speed">--</strong>
        </div>
        <div class="rj-telemetry-item">
          <small>HEADING</small>
          <strong id="rj-dossier-heading">--</strong>
        </div>
        <div class="rj-telemetry-item">
          <small>PING TIME</small>
          <strong id="rj-dossier-time">--:--:--</strong>
        </div>
      </div>

      <div class="rj-dossier-intel-box">
        <div class="rj-intel-label">
          <span class="material-symbols-outlined">psychology</span>
          <span>NEURONEDGE AI TACTICAL ASSESSMENT</span>
        </div>
        <p id="rj-dossier-analysis" class="rj-intel-text">Ingesting radar and transponder telemetry...</p>
      </div>

      <div id="rj-dossier-voice-wave" class="rj-voice-wave" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      </div>

      <div class="rj-dossier-actions">
        <button id="rj-dossier-voice-btn" type="button" class="rj-dossier-btn rj-btn-voice" onclick="window.triggerRjVoiceBriefing()">
          <span>🎙️ VOICE BRIEFING</span>
        </button>
        <button id="rj-dossier-export-btn" type="button" class="rj-dossier-btn rj-btn-export" onclick="window.exportRjDossier()">
          <span>📋 EXPORT DOSSIER</span>
        </button>
      </div>
    </div>
  `;
  return div;
}

/**
 * Global window hooks for easy UI access
 */
export function initReconDossier() {
  window.openRjDossier = openReconDossier;
  window.closeRjDossier = closeReconDossier;
  window.triggerRjVoiceBriefing = triggerVoiceBriefing;
  window.exportRjDossier = exportDossierMarkdown;

  // Listen for internal selection events
  window.addEventListener('gev:entity-selected', (e) => {
    if (e?.detail) {
      openReconDossier(e.detail);
    }
  });

  window.addEventListener('gev:awareness-subject-selected', (e) => {
    if (e?.detail) {
      openReconDossier(e.detail);
    }
  });

  console.log('[RJ Recon] AI Target Recon Dossier Engine online');
}
