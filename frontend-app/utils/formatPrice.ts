export type PriceLike = string | number | null | undefined;

/**
 * Normalizes price strings coming from DB/API.
 * - Removes euro symbols / EUR text / bad encoding artifacts
 * - Appends `MAD` for numeric values when currency is missing
 *
 * Examples:
 * - "3 000 €" => "3 000 MAD"
 * - "3000" => "3000 MAD"
 * - "3 000 MAD €" => "3 000 MAD"
 */
export function formatPrice(input: PriceLike, emptyValue: string = "-"): string {
  if (input === null || input === undefined) return emptyValue;

  let p = String(input)
    .replace(/€/g, "")
    .replace(/\bEUR\b/gi, "")
    .replace(/Ôé¼/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!p) return emptyValue;

  // If it already contains MAD, just ensure no stray euro remnants and normalize spacing
  if (/\bMAD\b/i.test(p)) {
    return p.replace(/\bMAD\b/i, "MAD").replace(/\s+/g, " ").trim();
  }

  // Numeric detection (allow spaces as thousands separators and comma decimals)
  const numStr = p.replace(/\s/g, "").replace(",", ".");
  const isNumeric = !isNaN(parseFloat(numStr)) && isFinite(Number(numStr));

  return isNumeric ? `${p} MAD` : p;
}
