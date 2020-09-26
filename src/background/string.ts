export function getHashCode(str: string): number {
  let code = 0;
  for (let i = 0; i < str.length; i++) {
    code = ((code << 5) - code) + str.charCodeAt(i);
    code = code & code;
  }
  return code;
}
