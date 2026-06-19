type ProductPayload = {
  name?: string;
  price?: number;
};

export function validateProductPayload(payload: ProductPayload | null) {
  if (!payload?.name || typeof payload.price !== "number") {
    return {
      valid: false,
      error: "name and numeric price are required.",
    } as const;
  }

  if (payload.price < 0) {
    return { valid: false, error: "price must be 0 or greater." } as const;
  }

  return {
    valid: true,
    value: {
      name: payload.name,
      price: payload.price,
    },
  } as const;
}
