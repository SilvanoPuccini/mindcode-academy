// Pure derivation helpers for the course detail page restyle.
//
// The API gives us free-text fields only (course name, description,
// teacher names). These helpers turn them into presentational data:
// the hero gradient keyword, the "Lo que aprenderás" bento lines and
// the instructor initials avatar. Kept framework-free so they are
// unit-testable without React.

export interface TopicTitle {
  before: string;
  topic: string;
  after: string;
}

const MAX_BENEFITS = 4;
const MIN_BENEFIT_LENGTH = 12;
const MAX_BENEFIT_LENGTH = 120;
/** A lone benefit line shorter than this reads too thin to stand alone. */
const MIN_STANDALONE_LENGTH = 40;

function isWordChar(char: string | undefined): boolean {
  if (char === undefined) return false;
  return /[\p{L}\p{N}]/u.test(char);
}

/** Word-like tokens (letters/digits, inner dots allowed) of a label. */
function labelKeywords(label: string): string[] {
  return label
    .split(/[^\p{L}\p{N}.]+/u)
    .filter((token) => token.length >= 3);
}

/**
 * Splits the course name around the word that gets the gradient
 * "topic" treatment in the hero title. A keyword derived from the
 * inferred category label wins when it appears in the name (word
 * boundaries respected); otherwise the last word is highlighted.
 */
export function splitTopicTitle(name: string, categoryLabel: string): TopicTitle {
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  for (const keyword of labelKeywords(categoryLabel)) {
    const at = lower.indexOf(keyword.toLowerCase());
    if (at < 0) continue;

    const end = at + keyword.length;
    const boundedFromLeft = at === 0 || !isWordChar(trimmed[at - 1]);
    const boundedFromRight = end >= trimmed.length || !isWordChar(trimmed[end]);
    if (boundedFromLeft && boundedFromRight) {
      return {
        before: trimmed.slice(0, at),
        topic: trimmed.slice(at, end),
        after: trimmed.slice(end),
      };
    }
  }

  // Fallback: highlight the last word (or the whole title when it is
  // a single word).
  const lastWordStart = trimmed.lastIndexOf(" ");
  if (lastWordStart === -1) {
    return { before: "", topic: trimmed, after: "" };
  }
  return {
    before: trimmed.slice(0, lastWordStart + 1),
    topic: trimmed.slice(lastWordStart + 1),
    after: "",
  };
}

/**
 * Sentence-ish splitter for plain text. Splits on . ! ? while keeping
 * inner dots of tokens like "Node.js" intact (a dot flanked by word
 * characters on both sides never ends a sentence).
 */
function splitSentences(text: string): string[] {
  const chars = [...text];
  const sentences: string[] = [];
  let current = "";

  chars.forEach((char, index) => {
    current += char;
    if (!/[.!?]/.test(char)) return;

    const isInnerDot =
      char === "." && isWordChar(chars[index - 1]) && isWordChar(chars[index + 1]);
    if (!isInnerDot) {
      sentences.push(current);
      current = "";
    }
  });

  if (current.trim()) sentences.push(current);
  return sentences;
}

/** Collapses whitespace, caps length and title-cases the first letter. */
function toBenefitLine(sentence: string): string {
  const clean = sentence.replace(/\s+/g, " ").trim();
  const capped =
    clean.length > MAX_BENEFIT_LENGTH
      ? `${clean.slice(0, MAX_BENEFIT_LENGTH - 1).trimEnd()}…`
      : clean;
  return capped.charAt(0).toUpperCase() + capped.slice(1);
}

/**
 * "Lo que aprenderás" bento lines, derived client-side from the course
 * description: up to 4 sentence fragments, title-cased. When the
 * description yields fewer than 2 usable sentences, falls back to 4
 * generic lines anchored on the category label.
 */
export function deriveBenefits(description: string, categoryLabel: string): string[] {
  const lines = splitSentences(description)
    .map(toBenefitLine)
    .filter((line) => line.length >= MIN_BENEFIT_LENGTH)
    .slice(0, MAX_BENEFITS);

  // Fallback when nothing usable came out, or when the only usable line is
  // too thin to stand alone as a bento card (a single LONG sentence still
  // renders truncated).
  const onlyLineTooThin =
    lines.length === 1 && lines[0].length < MIN_STANDALONE_LENGTH;
  if (lines.length === 0 || onlyLineTooThin) {
    return [
      `Fundamentos sólidos de ${categoryLabel}`,
      "Proyectos prácticos y reales",
      "Buenas prácticas de la industria",
      "Herramientas actuales del ecosistema",
    ];
  }

  return lines;
}

/** Initials for the instructor avatar: first letter of the first two words. */
export function teacherInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : "";
  return `${first}${last}`.toUpperCase();
}
