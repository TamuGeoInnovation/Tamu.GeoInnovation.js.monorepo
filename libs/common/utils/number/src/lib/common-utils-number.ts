/**
 * Determines whether the supplied number is even.
 *
 * @param number Non-float number
 * @returns True if is even, false if is odd
 */
export function isEven(number: number): boolean {
  return number % 2 === 0;
}

/**
 * Gets a random number between two numbers, including them.
 *
 * @export
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random number
 */
export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Returns the index of the smallest value from a collection of numbers.
 */
export function getSmallestIndex(numbers: number[]): number {
  // Get the smallest number in the provided collection.
  const smallest = Math.min(...numbers);

  // Find the index of the first ocurrence of the smallest number in the provided
  // collection.
  const index = numbers.findIndex((n) => n === smallest);

  return index;
}
