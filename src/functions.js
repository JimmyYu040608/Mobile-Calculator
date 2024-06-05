/* General-purpose functions that are not intended for this program */

// Return the number of specific item in an array, workable on string as well
export function countOf(target, array) {
  let count = 0;
  for (let i = 0 ; i < array.length ; i++) {
    if (array[i] == target) {
      count++;
    }
  }
  return count;
}

// Split the array into parts with specific separators
export function arraySplit (array, separator) {
  let result = [[]];
  let index = 0;
  for (let i = 0 ; i < array.length ; i++) {
    if (array[i] === separator) {
      result.push([]);
      index++;
    }
    else {
      result[index].push(array[i]);
    }
  }
  return result;
}