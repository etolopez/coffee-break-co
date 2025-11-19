/**
 * Coffee Digital Passport - Cloudflare Worker Resolver
 * Routes GS1 Digital Link requests to appropriate endpoints
 */

import { Router } from 'itty-router';
import { parseDigitalLink, DigitalLinkKeys } from '@coffee-passport/shared';

// Environment interface for Cloudflare Worker
interface Env {
  WORKER_PUBLIC_API: string;
  WORKER_WEB_ORIGIN: string;
  ENVIRONMENT?: string;
}

// Request interface with Cloudflare properties
interface RequestWithCF extends Request {
  cf?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    ip?: string;
    uag?: string;
  };
}

// Create router instance
const router = Router();

/**
 * Parses Digital Link path and extracts GS1 identifiers
 * @param pathname - URL pathname (e.g., "/01/09506000134352/10/L2305")
 * @returns Parsed Digital Link keys
 */
function parseDigitalLinkFromPath(pathname: string): DigitalLinkKeys {
  try {
    return parseDigitalLink(pathname);
  } catch (error) {
    console.error('Failed to parse Digital Link:', error);
    return { gtin: '', lot: undefined, serial: undefined };
  }
}

/**
 * Logs resolver request for monitoring
 * @param request - Incoming request
 * @param keys - Parsed Digital Link keys
 * @param linkType - Requested link type
 */
function logResolverRequest(request: RequestWithCF, keys: DigitalLinkKeys, linkType: string) {
  const logData = {
    at: 'resolver.request',
    linkType,
    keys,
    cf: request.cf,
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString(),
  };

  console.log(JSON.stringify(logData, null, 0));
}

/**
 * Sends telemetry data to ClickHouse (fire-and-forget)
 * @param env - Worker environment
 * @param keys - Digital Link keys
 * @param request - Original request
 * @param startTime - Request start time for latency calculation
 */
async function sendTelemetry(
  env: Env,
  keys: DigitalLinkKeys,
  request: RequestWithCF,
  startTime: number
) {
  try {
    const latency = Date.now() - startTime;
    const telemetryData = {
      id: `evt_scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ts: new Date().toISOString(),
      gtin: keys.gtin,
      lot: keys.lot,
      serial: keys.serial,
      country: request.cf?.country,
      city: request.cf?.city,
      ua: request.headers.get('user-agent'),
      resolverLatencyMs: latency,
      environment: env.ENVIRONMENT || 'development',
    };

    // Fire-and-forget telemetry (don't await)
    fetch(`${env.WORKER_PUBLIC_API}/api/telemetry/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Coffee-Passport-Resolver/1.0',
      },
      body: JSON.stringify(telemetryData),
    }).catch(error => {
      // Silently fail telemetry - don't break the main flow
      console.error('Telemetry failed:', error);
    });
  } catch (error) {
    // Silently fail telemetry - don't break the main flow
    console.error('Telemetry error:', error);
  }
}

/**
 * Main resolver handler for all Digital Link requests
 */
router.get('*', async (request: RequestWithCF, env: Env) => {
  const startTime = Date.now();
  const url = new URL(request.url);
  
  // Parse Digital Link keys from pathname
  const keys = parseDigitalLinkFromPath(url.pathname);
  const linkType = url.searchParams.get('linkType') || 
                   (request.headers.get('accept')?.includes('application/json') ? 'json' : 'product');

  // Log the request
  logResolverRequest(request, keys, linkType);

  try {
    // Route based on linkType
    let targetUrl: string;
    
    switch (linkType) {
      case 'json':
        // Return JSON data
        targetUrl = `${env.WORKER_PUBLIC_API}/api/public/passport?dl=${encodeURIComponent(url.pathname)}`;
        break;
        
      case 'epcis':
        // Return EPCIS data
        targetUrl = `${env.WORKER_PUBLIC_API}/api/public/epcis?dl=${encodeURIComponent(url.pathname)}`;
        break;
        
      case 'product':
      default:
        // Return HTML passport page
        targetUrl = `${env.WORKER_WEB_ORIGIN}/passport${url.pathname}${url.search}`;
        break;
    }

    // Send telemetry (non-blocking)
    sendTelemetry(env, keys, request, startTime);

    // Fetch from target and return response
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'Coffee-Passport-Resolver/1.0',
        'Accept': request.headers.get('accept') || '*/*',
        'Accept-Language': request.headers.get('accept-language') || 'en',
        'X-Forwarded-For': request.headers.get('cf-connecting-ip') || '',
        'X-Forwarded-Proto': url.protocol.replace(':', ''),
        'X-Forwarded-Host': request.headers.get('host') || '',
      },
    });

    // Create new response with appropriate headers
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'X-Resolved-By': 'Coffee-Passport-Resolver',
        'X-Digital-Link-Type': linkType,
        'X-GTIN': keys.gtin,
        'X-Lot': keys.lot || '',
        'X-Serial': keys.serial || '',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent',
      },
    });

    return newResponse;

  } catch (error) {
    console.error('Resolver error:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        error: 'RESOLVER_ERROR',
        message: 'Failed to resolve Digital Link',
        timestamp: new Date().toISOString(),
        path: url.pathname,
        linkType,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

/**
 * Handle OPTIONS requests for CORS
 */
router.options('*', () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent',
      'Access-Control-Max-Age': '86400',
    },
  });
});

/**
 * Handle 404 for unmatched routes
 */
router.all('*', () => {
  return new Response(
    JSON.stringify({
      error: 'NOT_FOUND',
      message: 'Digital Link not found',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
});

/**
 * Main fetch handler for Cloudflare Worker
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Add Cloudflare properties to request
      const requestWithCF = request as RequestWithCF;
      
      // Handle the request through the router
      return await router.handle(requestWithCF, env, ctx);
    } catch (error) {
      console.error('Worker error:', error);
      
      return new Response(
        JSON.stringify({
          error: 'WORKER_ERROR',
          message: 'Internal worker error',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
