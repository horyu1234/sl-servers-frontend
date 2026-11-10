// Cloudflare Pages runs this for every address that is not a static file (see public/_routes.json).
// Pages treats each file in this folder as a route, so the work lives in src/edge.
import { handleRequest } from '../src/edge/handler';
import type { EdgeContext } from '../src/edge/types';

export const onRequest = (context: EdgeContext) => handleRequest(context);
