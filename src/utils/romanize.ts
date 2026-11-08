/**
 * Revised Romanization of Korean generator for elementary multilingual learners.
 * Converts Hangul syllable blocks into clean, hyphenated phonetic Romanization.
 * e.g., "나는 기술이 바뀌어야 한다고 생각해" -> "na-neun gi-sul-i ba-kkwi-eo-ya han-da-go saeng-gak-hae"
 */

const INITIAL_CONSONANTS = [
  'g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's',
  'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h',
];

const MEDIAL_VOWELS = [
  'a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa',
  'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i',
];

const FINAL_CONSONANTS = [
  '', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'p', 't', 't', 'p', 't',
  'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't',
];

export function romanizeKorean(text: string): string {
  if (!text) return '';
  let result = '';
  let prevWasHangul = false;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const offset = code - 0xac00;
      const initialIdx = Math.floor(offset / 588);
      const medialIdx = Math.floor((offset % 588) / 28);
      const finalIdx = offset % 28;

      let init = INITIAL_CONSONANTS[initialIdx];
      // At the start of a syllable after another syllable, 'r' sounds like 'r' or 'l'
      const med = MEDIAL_VOWELS[medialIdx];
      const fin = FINAL_CONSONANTS[finalIdx];

      const syllable = init + med + fin;

      if (prevWasHangul) {
        result += '-' + syllable;
      } else {
        result += syllable;
      }
      prevWasHangul = true;
    } else {
      result += text[i];
      prevWasHangul = false;
    }
  }

  // Capitalize the first letter if it begins with an alphabet
  const trimmed = result.trim();
  if (trimmed.length > 0 && /[a-z]/i.test(trimmed[0])) {
    return trimmed[0].toUpperCase() + trimmed.slice(1);
  }
  return trimmed;
}

export function isMostlyKorean(text: string): boolean {
  if (!text) return false;
  let hangulCount = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) {
      hangulCount++;
    }
  }
  return hangulCount > text.length * 0.3;
}
