// The share price the paper prints, as it stood when the market last closed.
// The pipeline reads it once a day and saves it; this is what the page makes of it.

export interface Quote {
  symbol: string;
  /** The price at the close, in the market's own currency. */
  close: number;
  /** The change from the close before, in per cent. */
  change: number;
  /** The day of that close, YYYY-MM-DD, where the market is. */
  day: string;
  currency: string;
}

/** A price older than this many days is not printed: it would read as news and is not. */
export const STALE_DAYS = 6;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Whatever was saved, read as a quote, or nothing when it is not one or is too old to print. */
export function readQuote(raw: unknown, today: string): Quote | undefined {
  const quote = raw as Partial<Quote> | null;
  if (!quote || typeof quote !== 'object' || !quote.symbol || !Number.isFinite(quote.close) || !Number.isFinite(quote.change) || !/^\d{4}-\d\d-\d\d$/.test(quote.day ?? '')) return undefined;
  const age = (Date.parse(today) - Date.parse(quote.day!)) / (24 * 60 * 60 * 1000);
  return age > STALE_DAYS ? undefined : ({ currency: 'USD', ...quote } as Quote);
}

/** The price with its currency's sign, such as "$223.40"; a currency that is not known is printed without one. */
function priced(quote: Quote): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: quote.currency, currencyDisplay: 'narrowSymbol' }).format(quote.close);
  } catch {
    return quote.close.toFixed(2);
  }
}

/** The quote as it is printed and as it is read aloud: "CRM $223.40 ▼ 2.8%". */
export function quoteLine(quote: Quote, name: string): { price: string; mark: string; change: string; says: string } {
  const [, month, day] = quote.day.split('-').map(Number);
  const moved = Math.abs(quote.change).toFixed(1);
  const flat = moved === '0.0';
  const direction = flat ? 'unchanged' : `${quote.change > 0 ? 'up' : 'down'} ${moved} per cent`;
  return {
    price: priced(quote),
    mark: flat ? '' : quote.change > 0 ? '▲' : '▼',
    change: flat ? 'unch.' : `${moved}%`,
    says: `${name} shares (${quote.symbol}) closed at ${quote.close.toFixed(2)} ${quote.currency} on ${day} ${MONTHS[month - 1]}, ${direction}.`,
  };
}
