/** Free-text search shared by the lists: every word of the query must appear in the row's haystack. */
export const searchWords = (q: string) => q.trim().toLowerCase().split(/\s+/).filter(Boolean);
export const matchesAll = (hay: string, words: string[]) => {
  if (!words.length) return true;
  const h = hay.toLowerCase();
  return words.every((w) => h.includes(w));
};
