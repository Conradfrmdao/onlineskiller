export function mapPesapalStatus(code: number | string | null | undefined) {
  const value = Number(code);

  if (value === 1) {
    return "completed" as const;
  }

  if (value === 2) {
    return "failed" as const;
  }

  if (value === 3) {
    return "canceled" as const;
  }

  return "pending" as const;
}
