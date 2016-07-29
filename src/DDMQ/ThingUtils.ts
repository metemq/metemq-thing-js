/**
 * Generate a random Message-ID
 */
export function genMsgId(len?): string {
  let a = "";
  len = len || 8;

  for (let i=0; i<len; i++)
    a = a + genChar();

  return a;
}

/**
 * Generate a random Character (0-9, a-z, A-Z)
 */
function genChar(): string {
  let a = Math.floor(Math.random()*62);

  if (a<10) a+=48; // 0-9 => 48-57 ('0'-'9')
  else if (a<36) a+=55; // 10-35 => 65-90 ('A'-'Z')
  else a+=61; // 36-61 => 97-122 ('a'-'z')

  return String.fromCharCode(a);
}
