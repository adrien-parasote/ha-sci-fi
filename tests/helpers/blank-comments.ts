/**
 * String-aware comment blanker (behavioural-test-gaps FR-15).
 *
 * Replaces `//` and block comments by spaces (newlines kept), only OUTSIDE
 * string literals: '...', "...", and template literals with nested `${...}`.
 * The output has the same length as the input, so callers can count
 * occurrences (for example a css tagged template) with a regex afterwards.
 * Regex literals are out of scope.
 */
export function blankComments(src: string): string {
  const out = src.split('');
  // Stack of contexts: 'code' (top level or inside ${...}) and 'tpl'.
  // For `code` frames opened by `${`, braceDepth counts nested braces.
  const stack: Array<{ kind: 'code' | 'tpl'; depth: number }> = [{ kind: 'code', depth: 0 }];
  let i = 0;
  const blank = (from: number, to: number) => {
    for (let k = from; k < to; k++) if (out[k] !== '\n') out[k] = ' ';
  };
  while (i < src.length) {
    const top = stack[stack.length - 1]!;
    const c = src[i];
    const n = src[i + 1];
    if (top.kind === 'tpl') {
      if (c === '\\') {
        i += 2;
      } else if (c === '`') {
        stack.pop();
        i++;
      } else if (c === '$' && n === '{') {
        stack.push({ kind: 'code', depth: 0 });
        i += 2;
      } else {
        i++;
      }
      continue;
    }
    if (c === '/' && n === '/') {
      let j = i;
      while (j < src.length && src[j] !== '\n') j++;
      blank(i, j);
      i = j;
    } else if (c === '/' && n === '*') {
      const end = src.indexOf('*/', i + 2);
      const j = end === -1 ? src.length : end + 2;
      blank(i, j);
      i = j;
    } else if (c === "'" || c === '"') {
      let j = i + 1;
      while (j < src.length && src[j] !== c && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1;
      i = j + 1;
    } else if (c === '`') {
      stack.push({ kind: 'tpl', depth: 0 });
      i++;
    } else if (c === '{') {
      top.depth++;
      i++;
    } else if (c === '}') {
      if (top.depth === 0 && stack.length > 1) stack.pop();
      else top.depth--;
      i++;
    } else {
      i++;
    }
  }
  return out.join('');
}
