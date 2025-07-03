import { UserError } from "@teamgalena/shared/error";
import { defineMiddleware, sequence } from "astro/middleware";
import { generateLoginRedirect } from "./lib/server/discord";
import { extractToken, logout } from "./lib/server/session";

const authenticate = defineMiddleware((context, next) => {
  const token = extractToken(context);

  if (token !== null) {
    context.locals.user = token.user;
  } else {
    logout(context);
    // @ts-ignore
    // will be handled by `authorize` middleware
    context.locals.user = undefined;
  }

  return next();
});

const authorize = defineMiddleware((context, next) => {
  if (context.locals.user || context.routePattern.startsWith("/api/"))
    return next();

  return generateLoginRedirect(context);
});

const catcher = defineMiddleware(async (_, next) => {
  try {
    return await next();
  } catch (ex) {
    if (ex instanceof UserError) {
      return new Response(ex.message, {
        status: 400,
      });
    }

    throw ex;
  }
});

export const onRequest = sequence(catcher, authenticate, authorize);
