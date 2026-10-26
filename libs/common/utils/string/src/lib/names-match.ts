/**
 * Words a plaque or a person typing it adds around a name, which say nothing about whose name it is.
 */
const NAME_FILLER_WORDS = new Set([
  'in',
  'loving',
  'memory',
  'of',
  'the',
  'and',
  'to',
  'dedicated',
  'honor',
  'honour',
  'memorial',
  'class',
  'dr',
  'mr',
  'mrs',
  'ms'
]);

/**
 * A name as words to compare: lower case, without accents, with every run of punctuation and spaces
 * as one space. An empty string for no name.
 */
export function normalizeName(name: string | null | undefined): string {
  return (name ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Whether two typed names are the same name: the same words once case, accents, punctuation and a
 * plaque's own wording ("In loving memory of") are set aside, allowing a small typing mistake in a
 * word but not in its first letter. The shorter name needs at least two words, so a surname alone
 * matches nobody: many plaques share one. False when either is missing.
 */
export function namesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const first = nameWords(a);
  const second = nameWords(b);

  if (first.length === 0 || second.length === 0) {
    return false;
  }

  if (first.join(' ') === second.join(' ')) {
    return true;
  }

  const [shorter, longer] = first.length <= second.length ? [first, second] : [second, first];

  return shorter.length >= 2 && shorter.every((word) => longer.some((other) => wordsMatch(word, other)));
}

function nameWords(name: string | null | undefined): Array<string> {
  return normalizeName(name)
    .split(' ')
    .filter((word) => word !== '' && !NAME_FILLER_WORDS.has(word));
}

/**
 * The same word, or one typing mistake per five letters in a word of four or more that starts with the
 * same letter. A swap of two neighbouring letters counts as one mistake.
 */
function wordsMatch(a: string, b: string): boolean {
  if (a === b) {
    return true;
  }

  if (a[0] !== b[0] || Math.min(a.length, b.length) < 4) {
    return false;
  }

  return editDistance(a, b) <= Math.floor(Math.max(a.length, b.length) / 5);
}

/**
 * Insertions, deletions, substitutions and swaps of neighbouring letters needed to turn one word into
 * the other (optimal string alignment).
 */
function editDistance(a: string, b: string): number {
  const d: Array<Array<number>> = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[a.length][b.length];
}
