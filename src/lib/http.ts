type JsonObject = Record<string, unknown>;

export function jsonError(message: string, status: number, extra?: JsonObject) {
  return Response.json({ error: message, ...(extra ?? {}) }, { status });
}

export function jsonSuccess(body: JsonObject, status = 200) {
  return Response.json(body, { status });
}

export async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
