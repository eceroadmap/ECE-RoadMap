/**
 * Cloudflare Worker for ECE RoadMap
 * Serves SPA Static Assets
 */

interface Env {
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Serve Static SPA Assets
    if (env.ASSETS) {
      return await env.ASSETS.fetch(request);
    }

    return new Response('ECE RoadMap SPA', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
};
