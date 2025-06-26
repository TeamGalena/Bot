import { defineMiddleware, sequence } from "astro/middleware";
import { generateLoginRedirect } from "./lib/server/discord";
import { extractToken, logout } from "./lib/server/session";

const authenticate = defineMiddleware((context, next) => {
  const token = extractToken(context);

  if (token !== null) {
    context.locals.user = token.user;
  } else {
    logout(context);
    context.locals.user = undefined;
  }

  return next();
});

const authorize = defineMiddleware((context, next) => {
  if (context.locals.user || context.routePattern.startsWith("/api/"))
    return next();

  return generateLoginRedirect(context);
});

export const onRequest = sequence(authenticate, authorize);
