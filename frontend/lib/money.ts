const RUPEES_PER_CRORE = 10_000_000;

export function rupeesToCrores(rupees: number): number {
  return rupees / RUPEES_PER_CRORE;
}

export function croresToRupees(crores: number): number {
  return Math.round(crores * RUPEES_PER_CRORE);
}

export function formatCroresFromRupees(rupees: number | null | undefined): string {
  if (rupees == null) return "-";
  const cr = rupeesToCrores(rupees);
  return `${cr.toFixed(cr >= 20 ? 0 : 2)} Cr`;
}

