import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";

// Next.js 16 Proxy (formerly middleware). Runs on the Node.js runtime by
// default, so `node:crypto` and `Buffer` are available here.

const REALM = 'Basic realm="Coeus Asset Workspace"';

function unauthorized(): NextResponse {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": REALM,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

// Constant-time string comparison. Both inputs are hashed to a fixed-length
// SHA-256 digest first, so `timingSafeEqual` never sees mismatched lengths
// (which would throw) and no information leaks about how long the secret is.
function safeEqual(a: string, b: string): boolean {
  const da = createHash("sha256").update(a, "utf8").digest();
  const db = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(da, db);
}

export function proxy(request: NextRequest): NextResponse {
  const expectedUser = process.env.AUTH_USER;
  const expectedPassword = process.env.AUTH_PASSWORD;

  // Fail CLOSED: if either credential is unset, deny every request rather
  // than leaving the app wide open.
  if (!expectedUser || !expectedPassword) {
    return unauthorized();
  }

  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Basic ")) {
    return unauthorized();
  }

  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  } catch {
    return unauthorized();
  }

  // Split on the FIRST colon only — passwords may legally contain colons.
  const separator = decoded.indexOf(":");
  if (separator === -1) {
    return unauthorized();
  }
  const user = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  // Evaluate both comparisons before branching so the response time does not
  // reveal whether it was the username or the password that was wrong.
  const userOk = safeEqual(user, expectedUser);
  const passwordOk = safeEqual(password, expectedPassword);
  if (!userOk || !passwordOk) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  // Protect every route — including `/api/*` — except Next.js build assets,
  // the favicon, and any request for a file with an extension (static assets
  // in `public/`). API routes have no extension, so they stay covered.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
