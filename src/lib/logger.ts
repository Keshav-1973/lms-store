type LogMeta = Record<string, unknown>;

function withContext(message: string, meta?: LogMeta) {
  return meta ? [message, meta] : [message];
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    console.info("[my-store]", ...withContext(message, meta));
  },
  warn(message: string, meta?: LogMeta) {
    console.warn("[my-store]", ...withContext(message, meta));
  },
  error(message: string, meta?: LogMeta) {
    console.error("[my-store]", ...withContext(message, meta));
  },
};
