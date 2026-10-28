/**
 * The modal slot renders nothing unless an intercepted route is active. No `[...catchAll]` page next to it: with
 * Cache Components that layout makes the router re-prefetch one link's segment without end (vercel/next.js#100055,
 * 150+ identical requests per page view); the Modal component hides itself when the path changes instead.
 */
export default function Default() {
  return null;
}
