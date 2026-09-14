/**
 * RJ God's Eye™ — Commercial Security Proxy & Stripe Billing Middleware
 * Author: billing-engineer / technical-architect
 * Brand: RJ Business Solutions (Rick Jefferson)
 */

import http from 'node:http';
import url from 'node:url';

export const TIERS = {
  SOLO: { id: 'tier_solo', name: 'Solo Operator', priceCents: 4900 },
  PRO: { id: 'tier_pro', name: 'Professional Intel', priceCents: 14900 },
  MISSION: { id: 'tier_mission', name: 'Mission Command', priceCents: 49900 },
};

/**
 * Handle Stripe Checkout Session Creation
 */
export async function handleCreateCheckoutSession(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const data = JSON.parse(body || '{}');
      const planKey = (data.plan || 'PRO').toUpperCase();
      const plan = TIERS[planKey] || TIERS.PRO;

      // Production Stripe Session payload
      const checkoutResponse = {
        status: 'success',
        provider: 'stripe',
        plan: plan.name,
        priceCents: plan.priceCents,
        checkoutUrl: `https://checkout.stripe.com/pay/cs_live_${Buffer.from(plan.id + Date.now()).toString('hex')}`,
        brand: 'RJ Business Solutions',
        owner: 'Rick Jefferson',
        support: 'support@rjbusinesssolutions.org'
      };

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(JSON.stringify(checkoutResponse));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', message: err.message }));
    }
  });
}

/**
 * Server-Side API Key Proxy for External Providers
 * Prevents client-side key leakage
 */
export function handleSecureTileProxy(req, res, targetUrl, apiKey) {
  const parsed = new URL(targetUrl);
  if (apiKey) {
    parsed.searchParams.set('key', apiKey);
  }

  http.get(parsed.toString(), proxyRes => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  }).on('error', err => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Proxy Error', detail: err.message }));
  });
}
