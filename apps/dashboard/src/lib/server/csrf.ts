import { UserError } from "@teamgalena/shared/error";
import { randomBytes, scryptSync } from "crypto";
import type { User } from "./user";

const salt = randomBytes(16).toString("hex");

export const CSRF_KEY = "_csrf";

export async function generateCSRF(user: User) {
  return scryptSync(user.username, salt, 64).toString("hex");
}

type TokenData = undefined | null | string | FormData | Record<string, unknown>;

async function parseBody(request: Request) {
  const contentType = request.headers.get("Content-Type");

  if (request.method === "DELETE" || request.method === "GET") {
    const url = new URL(request.url);
    return Object.fromEntries(url.searchParams.entries());
  }

  // TODO remove support if not needed?
  if (contentType === "application/x-www-form-urlencoded") {
    const data = await request.formData();
    const json: Record<string, unknown> = {};
    data.forEach((value, key) => {
      if (key in json) {
        if (!Array.isArray(json[key])) json[key] = [json[key]];
        const values = json[key] as unknown[];
        values.push(value);
      } else {
        json[key] = value;
      }
    });

    return json;
  }

  return await request.json();
}

export async function getFormData<T>({
  request,
  locals,
  props,
}: {
  request: Request;
  locals: { user: User };
  props?: unknown;
}) {
  if (request.method === "GET" && props) {
    return props as T;
  }

  const data = await parseBody(request);

  await validateCSRF(locals.user, data);

  delete data[CSRF_KEY];

  return data as T;
}

function getToken(data: TokenData) {
  if (!data) return data;
  if (data instanceof FormData) return data.get(CSRF_KEY);
  if (typeof data === "object") return data[CSRF_KEY];
  return data;
}

export async function validateCSRF(user: User, data: TokenData) {
  const token = getToken(data);
  const expected = await generateCSRF(user);
  if (expected !== token) {
    throw new UserError("Invalid or Missing CSRF token");
  }
}
