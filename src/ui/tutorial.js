/**
 * RJ God's Eye™ — In-App Interactive Spotlight Tour Controller
 * Author: ui-ux-engineer
 * Brand: RJ Business Solutions (Rick Jefferson)
 */

export const TOUR_STEPS = [
  {
    badge: 'MISSION BRIEFING 1/4',
    title: 'Welcome to RJ God\'s Eye™',
    body: 'You are now commanding a live, photorealistic 3D planetary digital twin. Use your mouse or trackpad to pan across global coordinates, orbit targets, and zoom smoothly from deep orbit down to street-level terrain.'
  },
  {
    badge: 'TELEMETRY 2/4',
    title: 'Multi-Domain Spatial Feeds',
    body: 'The bottom control dock allows you to stream live ADS-B commercial/military flights, AIS maritime cargo vessels, SGP4 orbital satellite paths, and municipal traffic CCTV cameras simultaneously.'
  },
  {
    badge: 'AI PILOT 3/4',
    title: 'Hands-Free Voice Mission Control',
    body: 'Engage voice telemetry by speaking into your microphone. Say commands like "Fly to London Heathrow", "Track incoming vessels in Singapore", or "Level the camera horizon" for autonomous camera routing.'
  },
  {
    badge: 'OPERATIONS 4/4',
    title: 'Mission Command & Dedicated Support',
    body: 'Need custom asset tracking, geofence webhook alerts, or dedicated team seats? Click "⚡ UPGRADE PLAN" or visit the comprehensive Interactive Manual at any time.'
  }
];

let currentStep = 0;

export function initInteractiveTour() {
  const overlay = document.getElementById('rj-tour-overlay');
  if (!overlay) return;

  const titleEl = document.getElementById('rj-tour-title');
  const bodyEl = document.getElementById('rj-tour-body');
  const badgeEl = document.getElementById('rj-tour-badge');
  const progressEl = document.getElementById('rj-tour-progress');
  const nextBtn = document.getElementById('rj-tour-next-btn');
  const prevBtn = document.getElementById('rj-tour-prev-btn');

  function renderStep(index) {
    currentStep = index;
    const step = TOUR_STEPS[index];
    if (titleEl) titleEl.textContent = step.title;
    if (bodyEl) bodyEl.textContent = step.body;
    if (badgeEl) badgeEl.textContent = step.badge;
    if (progressEl) progressEl.textContent = `STEP ${index + 1} OF ${TOUR_STEPS.length}`;

    if (prevBtn) prevBtn.style.display = index === 0 ? 'none' : 'block';
    if (nextBtn) nextBtn.textContent = index === TOUR_STEPS.length - 1 ? 'Complete Briefing' : 'Next Step →';
  }

  window.startRjTour = function() {
    renderStep(0);
    overlay.classList.add('active');
  };

  window.closeRjTour = function() {
    overlay.classList.remove('active');
  };

  window.nextRjTourStep = function() {
    if (currentStep < TOUR_STEPS.length - 1) {
      renderStep(currentStep + 1);
    } else {
      window.closeRjTour();
    }
  };

  window.prevRjTourStep = function() {
    if (currentStep > 0) {
      renderStep(currentStep - 1);
    }
  };
}
