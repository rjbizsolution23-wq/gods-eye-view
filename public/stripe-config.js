/**
 * RJ Business Solutions — Stripe Monetization & Payment Link Configuration
 * Author: NeuronEdge Labs™ (Rick Jefferson)
 * Brand: RJ Business Solutions
 */

export const RJ_STRIPE_CONFIG = {
  // Replace these with your live Stripe Payment Links from https://dashboard.stripe.com/payment-links
  paymentLinks: {
    tactical_monthly: 'https://buy.stripe.com/test_operator_monthly',
    tactical_annual: 'https://buy.stripe.com/test_operator_annual',
    command_monthly: 'https://buy.stripe.com/test_command_monthly',
    command_annual: 'https://buy.stripe.com/test_command_annual',
    sovereign_monthly: 'https://buy.stripe.com/test_sovereign_monthly',
    sovereign_annual: 'https://buy.stripe.com/test_sovereign_annual',
  },
  
  tierDetails: {
    tactical: {
      name: 'Tactical Operator Tier',
      monthlyPrice: '$97',
      annualPrice: '$79',
      annualBilled: '$948/year',
      seats: '1 Operator Seat',
      features: ['Live ADS-B Flight Radar', 'Global AIS Maritime Ships', 'USGS Seismic & FIRMS Wildfire', 'SGP4 Satellites', 'AI Recon Dossier Engine']
    },
    command: {
      name: 'Command Fleet Tier',
      monthlyPrice: '$297',
      annualPrice: '$237',
      annualBilled: '$2,844/year',
      seats: '5 Operator Seats',
      features: ['Everything in Tactical', '3D CCTV Video Mesh Projection', 'Voice Mission Pilot (WebRTC)', 'Synthetic Voice Tactical Audio Briefings', 'Custom Geofencing & Alerts']
    },
    sovereign: {
      name: 'Enterprise Sovereign Tier',
      monthlyPrice: '$1,497',
      annualPrice: '$1,197',
      annualBilled: '$14,364/year',
      seats: 'Unlimited Operator Seats',
      features: ['Custom Private RTSP / VMS Stream Ingestion', 'Dedicated Cloudflare Worker & Vectorize', 'Custom White-Label Branding', '24/7 Priority SLA', 'On-Premise / Air-Gapped Option']
    }
  }
};
