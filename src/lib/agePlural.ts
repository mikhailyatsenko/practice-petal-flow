export function pluralAge(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  let word: string;
  if (mod100 >= 11 && mod100 <= 14) word = "лет";
  else if (mod10 === 1) word = "год";
  else if (mod10 >= 2 && mod10 <= 4) word = "года";
  else word = "лет";
  return `${n} ${word}`;
}
