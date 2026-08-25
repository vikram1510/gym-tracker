const quotes = [
  'Keep your momentum. Your next session is ready when you are.',
  'The only workout you regret is the one you skipped.',
  'Small lifts, stacked daily, move mountains.',
  'Show up tired. Leave stronger.',
  'Consistency beats intensity every single week.',
  'You do not have to be extreme, just regular.',
  'The bar does not care how you feel. Pick it up anyway.',
  'Progress hides in the sets nobody claps for.',
  'Train for the body you want in a year, not on Friday.',
  'Rest is part of the work. So is starting again.',
]

export function randomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)]
}
