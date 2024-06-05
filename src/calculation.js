/* All content and logic about calculating a given formula string */

import * as math from 'mathjs';
import { countOf, arraySplit } from './functions.js';

// Global const lists
const operators = ["+", "-", "×", "÷", "/", "(", ")", "^", "²", "!", "%", "√", "x√", "log", "ln", "sin", "cos", "tan", "sec", "csc", "cot", "arcsin", "arccos", "arctan", "arcsec", "arccsc", "arccot", ","]; // All blocks which are not numbers (. and E are seen together with numbers)
const constants = {"π": math.pi, "e": math.e};
const arith_operators = ["+", "-", "×", "÷"];
const multiply_list = ["Ans", "(", "√", "log", "ln", "sin", "cos", "tan", "sec", "csc", "cot", "arcsin", "arccos", "arctan", "arcsec", "arccsc", "arccot", "π", "e"]; // Blocks which their previous neighbouring numbers multiply with them
const func_list = ["^", "√", "x√", "log", "ln", "sin", "cos", "tan", "sec", "csc", "cot", "arcsin", "arccos", "arctan", "arcsec", "arccsc", "arccot"]; // Functions which takes trailing parentheses as input to generate values
const trigo_list = ["sin", "cos", "tan", "sec", "csc", "cot"]; // Turn degree or radian input into radian output
const arc_trigo_list = ["arcsin", "arccos", "arctan", "arcsec", "arccsc", "arccot"]; // Turn radian input into degree or radian output
const comma_list = {"log": [0, 1]}; // Comma functions and their acceptable number of commas
const backward_func_list = ["^", "x√", "E"]; // Backward functions takes the previous number as one of the parameter e.g. ^, x√
const begin_ban_list = ["×", "÷", "/", ")", "^", "x√", "²", "!", "%", ","]; // Blocks which are not allowed to present in the beginning of the formula
const end_ban_list = ["+", "-", "×", "÷", "/", "(", ",", "E"]; // Blocks which are not allowed to present in the ending of the formula
const separators = ["+", "-", "×", "÷", "/", "(", ")", "^", "²", "!", "%", "√", "x√", "log", "ln", "sin", "cos", "tan", "sec", "csc", "cot", "arcsin", "arccos", "arctan", "arcsec", "arccsc", "arccot", ",", "Ans", "π", "e"]; // Used in parseFormula
const RoundToDigit = 16; // Max no. of digits of stored
const MaxFractPart = 2147483647 // Max value of fract.n and fract.d or else it will overflow
const MaxExp = 9999999; // largest number is up to exp(MaxExp+1)
const MaxFactorialArg = 1723507; // 1723507! is the largest factorial that is smaller than MaxExp
let config = {rational: true, radianEnabled: false, mixedFract: false};

// Divide a by b, same as math.divide, but throw error when it is division by zero
function divideWrapper(a, b) {
  if (math.equal(b, 0)) {
    return {error_title: "Math Error", error_msg: "Division by zero."}; // Throw error
  }
  else {
    return math.divide(a, b);
  }
}

// Turn a number into its string representation
export function mathToString(num) {
  // For num in fraction type, it is assumed that n and d do not overflow
  let str = "";
  // Check whether to display in fraction
  if (rational && (math.isFraction(num) && !math.equal(num.d, 1))) {
    // If it takes too many digits to fully display num in fraction, just display in decimal
    let digit_count = math.string(num.n).length + math.string(num.d).length;
    // Display in fraction
    if (digit_count <= RoundToDigit) {
      if (math.equal(num.s, -1)) {
        str += "-";
      }
      // Display in mixed fraction
      if (config.mixedFract) {
        let q = math.floor(math.divide(num.n, num.d));
        let r = math.mod(num.n, num.d);
        if (!math.equal(q, 0)) {
          str += math.string(q);
          str += "/";
        }
        str += math.string(r);
        str += "/";
        str += math.string(num.d);
      }
      // Display in improper fraction
      else {
        str += math.string(num.n);
        str += "/";
        str += math.string(num.d);
      }
    }
    // Display in decimal
    else {
      let value = divideWrapper(math.multiply(num.n, num.s), num.d);
      str = math.format(value, {"notation": "auto", "precision": RoundToDigit-1, "lowerExp": -3, "upperExp": 10});
    }
  }
  // Display in decimal
  else {
    let value = math.bignumber(num);
    str = math.format(value, {"notation": "auto", "precision": RoundToDigit-1, "lowerExp": -3, "upperExp": 10});
  }
  return str;
}

// Parse the formula string into formula array
function parseFormula(formula_str) {
  // Validate string by pattern (RegEx)
  // Target 1: most symbols cannot be beginning; all symbols cannot be ending
  if (begin_ban_list.includes(formula_str[0])) {
    return {error_title: "Syntax Error", error_msg: `Incomplete operations at "${formula_str[0]}".`}; // Throw error
  }
  if (end_ban_list.includes(formula_str[formula_str.length-1])) {
    return {error_title: "Syntax Error", error_msg: `Incomplete operations at "${formula_str[formula_str.length-1]}".`}; // Throw error
  }
  // Target 2: no consecutive ×, ÷, / are allowed
  const ban_pattern1 = /(\×|\÷|\/){2,}/;
  if (ban_pattern1.test(formula_str)) {
    return {error_title: "Syntax Error", error_msg: "No consecutive ×, ÷, and / are allowed."}; // Throw error
  }
  // Target 3: no + or - are allowed to be place right before ×, ÷, / or !
  const ban_pattern2 = /[\+\-](\×|\÷|\/|\!)/;
  if (ban_pattern2.test(formula_str)) {
    return {error_title: "Syntax Error", error_msg: "No + or - signs are allowed to be placed right before × or ÷ signs."}; // Throw error
  }
  // Target 4: no dot after closing parentheses
  const ban_pattern3 = /\)\./;
  if (ban_pattern3.test(formula_str)) {
    return {error_title: "Syntax Error", error_msg:"No dots are allowed immediately after closing parentheses." }; // Throw error
  }
  // Target 7: no symbols allowed before ² and x√
  const ban_pattern4 = /[\+\-\×\÷\(\/](\²|\x\√)/;
  if (ban_pattern4.test(formula_str)) {
    return {error_title: "Syntax Error", error_msg: "No +, -, ×, ÷, /, or ( are allowed to be placed right before ² or x√ signs."}; // Throw error
  }

  // Split formula_str based on separators
  let str = formula_str;
  let formula_arr = [];
  let index = 0;
  let last_element = null;
  while (str.length != 0) {
    let separator = null;
    // Search for separators in the beginning of string
    for (let i = 0 ; i < separators.length ; i++) {
      // Is separators
      if (str.startsWith(separators[i])) {
        separator = separators[i];
        break;
      }
    }
    // If the current beginning is separator (exception: E- should stick together)
    if (separator && !(separator === "-" && last_element === "E")) {
      // Move on to next block
      formula_arr.push(separator);
      last_element = separator;
      index = formula_arr.length;
      str = str.slice(separator.length);
    }
    // If the current beginning is number, dot or E
    else {
      // Append to current block
      if (!formula_arr[index]) { // Create empty string if is undefined
        formula_arr[index] = "";
      }
      formula_arr[index] += str[0];
      last_element = str[0];
      str = str.slice(1);
    }
  }

  // Clear empty string
  formula_arr = formula_arr.filter((str) => str !== "");
  return formula_arr;
}

// Validate and process the formula recursively, if valid, return the processed array, if invalid, return false
// Mission: ensure all parts of the output array can be calculated by calculateFormula
function processFormula(formula_arr, recursed, comma_mode) {
  // Target 1: no empty parentheses
  // Target 2: unpaired parentheses
  // Target 3: justify multiplication e.g. 8(6) -> 8×(6), 8sin(6) -> 8×sin(6), (8)(6) -> (8)×(6), 8Ans -> 8×Ans
  // Target 4: one number cannot have more than one dot
  // Target 5: one number cannot have more than one E
  // Target 6: if both dot and E exist in the number, E must be after dot
  // Target 7: turn % into ÷100
  // Target 8: at most two slashes on same "island"
  // Target 9: commas should only exist within parentheses corresponding to comma functions
  // Target 10: there should be suitable number of commas and nonempty parts in any function requires comma (e.g. log can have 1 or 2 parts i.e. 0 or 1 commas)
  // Target 11: combine all consecutive + and - to conclude the sign attached to the next number
  // Target 12: Ans should be converted into its value

  // Step 1: detect empty content
  // For Target 1
  if (formula_arr.length == 0 && recursed) {
    return {error_title: "Syntax Error", error_msg: "Empty parentheses detected"}; // Throw error
  }

  // Step 2: fill up insufficent closing parenthesis
  // Optimization: pair up parentheses during the loop for later use
  // Unpaired parentheses within recursive calls can be assumed to be detected on first run
  let paren_stack = [];
  let paren_pairs = [];
  for (let i = 0 ; i < formula_arr.length ; i++) {
    if (formula_arr[i] == "(") {
      paren_stack.push(i);
    }
    else if (formula_arr[i] == ")") {
      // For Target 2
      if (paren_stack.length == 0) {
        return {error_title: "Syntax Error", error_msg: "Parentheses unpaired."}; // Throw error
      }
      let open_index = paren_stack.pop();
      paren_pairs.push([open_index, i]);
    }
  }
  while (paren_stack.length > 0) {
    formula_arr.push(")");
    let open_index = paren_stack.pop();
    paren_pairs.push([open_index, formula_arr.length-1]);
  }

  // Step 3: main processing loop
  let temp_arr = [];
  let sign_stack = [];
  let slash_count = 0;
  let last_block = null;
  let func = null;
  // If is comma_mode, break down the expression depending on commas and enter recursion part by part
  // If is not in comma_mode, enter main loop
  for (let i = 0 ; i < formula_arr.length ; i++) {
    // For Target 3
    // If last_block is a number or is a closing, and the current block needs to be multiplied
    if ((!operators.includes(last_block) || last_block == ")") && last_block != null && multiply_list.includes(formula_arr[i])) {
      temp_arr.push("×");
      // Since multiplication is the true operation here, slash combo breaks
      slash_count = 0;
    }

    // For Target 4
    if (countOf(".", formula_arr[i]) > 1) {
      return {error_title: "Syntax Error", error_msg: "No more than one dot can be used in a number."}; // Throw error
    }
    // For Target 5
    else if (countOf("E", formula_arr[i]) > 1) {
      return {error_title: "Syntax Error", error_msg: "No more than one E can be used in a number."}; // Throw error
    }
    // For Target 6
    else if (formula_arr[i].includes(".") && formula_arr[i].includes("E")) {
      if (formula_arr[i].indexOf(".") > formula_arr[i].indexOf("E")) {
        return {error_title: "Syntax Error", error_msg: "A number cannot be raised to a non-integer exponent."}; // Throw error
      }
    }
    // For Target 7
    else if (formula_arr[i] === "%") {
      temp_arr.push("÷");
      temp_arr.push("100");
    }
    // For Target 8
    // Since parentheses are handled recursively, slash_count only will concern about slash combo on the same layer
    else if (formula_arr[i] === "/") {
      slash_count++;
      if (slash_count > 2) {
        return {error_title: "Syntax Error", error_msg: "No more than two slashes can be used in a number."}; // Throw error
      }
    }
    // For Target 9 and Target 10
    else if (func_list.includes(formula_arr[i])) {
      func = formula_arr[i];
    }
    // Open parenthesis -> enter recursion
    else if (formula_arr[i] === "(") {
      // Locate paired closing parenthesis
      let close_index = -1;
      for (let j = 0 ; j < paren_pairs.length ; j++) {
        if (paren_pairs[j][0] == i) {
          close_index = paren_pairs[j][1];
          break;
        }
      }
      if (close_index == -1) {
        return {error_title: "Program Error", error_msg: "paren_pairs is broken. Please contact the developer."}; // Throw error
      }
      // If this parenthesis is for comma function e.g. log
      if (comma_list.hasOwnProperty(func)) {
        let parts = arraySplit(formula_arr.slice(i+1, close_index), ",");
        // If the count of comma doesn't match -> show error
        if (!comma_list[func].includes(parts.length-1)) {
          // Create a part of string for error
          let str = "";
          if (comma_list[func].length == 1) {
            str = `${comma_list[func][0]}`;
          }
          else {
            for (let j = 0 ; j < comma_list[func].length ; j++) {
              if (j == comma_list[func].length-2) {
                str += `${comma_list[func][j]} or `;
              }
              else if (j == comma_list[func].length-1) {
                str += `${comma_list[func][j]}`;
              }
              else {
                str += `${comma_list[func][j]}, `;
              }
            }
          }
          // Show error
          return {error_title: "Syntax Error", error_msg: `The number of enclosed comma does not match the function requirement. ${comma_mode} should take ${str} comma(s).`}; // Throw error
        }
        // If there are more than one parts, enter recursion part by part
        if (parts.length != 1) {
          temp_arr.push("(");
          for (let j = 0 ; j < parts.length ; j++) {
            let result = processFormula(parts[j], true, false);
            if (result.hasOwnProperty("error_title")) { // Manage error
              return result;
            }
            temp_arr.push(...result);
            if (j != parts.length - 1) {
              temp_arr.push(",");
            }
          }
        }
        // If there is only one part, enter recursion itself
        else {
          let result = processFormula(formula_arr.slice(i+1, close_index), true, func);
          if (result.hasOwnProperty("error_title")) { // Manage error
            return result;
          }
          // Push the processed array
          temp_arr.push("(");
          temp_arr.push(...result);
        }
        // When turn ends, closing parenthesis will be autmatically pushed
      }
      // If this parenthesis is not for comma functions i.e. is backward or normal function
      else {
        let result = processFormula(formula_arr.slice(i+1, close_index), true, func);
        if (result.hasOwnProperty("error_title")) { // Manage error
          return result;
        }
        // Push the processed array
        temp_arr.push("(");
        temp_arr.push(...result);
        // When turn ends, closing parenthesis will be automatically pushed
      }
      // After processing recursively, skip to the end of closing
      i = close_index;
      func = null;
    }
    // No comma should be met in main loop, commas are only allowed within parentheses used to enclose functions, which this case is dealt with in other cases
    else if (formula_arr[i] === ",") {
      return {error_title: "Syntax Error", error_msg: "No commas are allowed outside parentheses used to enclose the arguments of a function."}; // Throw error
    }
    
    // If is arithmetic operators, break slash combo
    else if (arith_operators.includes(formula_arr[i])) {
      slash_count = 0;
    }

    // Turn end push
    // If is + or -, hold the push until the combo ends
    if (formula_arr[i] === "+" || formula_arr[i] === "-") {
      // For Target 11
      sign_stack.push(formula_arr[i]);
    }
    else {
      // For Target 11
      // The +/- combo ends, resulting sign can be pushed before current element
      if (sign_stack.length != 0) {
        let sign = countOf("-", sign_stack) % 2;
        if (sign) {
          temp_arr.push("-");
        }
        else {
          temp_arr.push("+");
        }
      }
      // For Target 12
      // If is Ans, convert it into its value
      if (formula_arr[i] == "Ans") {
        temp_arr.push("(");
        let ans_str = mathToString(answer);
        temp_arr.push(ans_str);
        temp_arr.push(")");
      }
      // Push the block normally
      else {
        temp_arr.push(formula_arr[i]);
      }
      sign_stack = [];
    }
    last_block = formula_arr[i];
  }
  return temp_arr;
}

// Find the index of the corresponding closing parenthesis given the index of open parenthesis, assuming all parentheses are well paired
function findClosing(formula_arr, open_index) {
  let layer = 0;
  for (let i = open_index+1 ; i < formula_arr.length ; i++) {
    if (formula_arr[i] == "(") {
      layer++;
    }
    else if (formula_arr[i] == ")") {
      if (layer == 0) {
        return i;
      }
      layer--;
    }
  }
  return false;
}

function overMaximum(num) {
  // If num is fraction, it must not be large enough to exceed max bound
  if (!math.isFraction(num)) {
    let str = math.format(num, {"notation": "auto", "precision": RoundToDigit});
    // If str does not have e, it must not be large enough to exceed max bound
    if (/e\+/.test(str)) {
      let exponent = str.slice(str.indexOf("+")+1);
      // If num is larger than maximum exp
      if (math.larger(math.number(exponent), MaxExp)) {
        return true;
      }
    }
  }
  return false;
}

// Evaluate the fract_stack into a number
function evalFractStack(fract_stack) {
  let value;
  // Convert the array from fraction to bignumber if necessary
  if (!rational) {
    for (let i = 0 ; i < fract_stack.length ; i++) {
      fract_stack[i] = math.bignumber(fract_stack[i]);
    }
  }
  // Mixed fraction a/b/c i.e. a + b/c
  if (fract_stack.length == 3) {
    value = math.add(fract_stack[0], divideWrapper(fract_stack[1], fract_stack[2]));
    if (value.hasOwnProperty("error_title")) { // Manage error
      return value;
    }
  }
  // Fraction a/b
  else if (fract_stack.length == 2) {
    value = divideWrapper(fract_stack[0], fract_stack[1]);
    if (value.hasOwnProperty("error_title")) { // Manage error
      return value;
    }
  }
  // If not a fraction
  else if (fract_stack.length == 1) {
    value = fract_stack[0];
  }
  else {
    return {error_title: "Program Error", error_msg: "evalFractStack is broken. Please contact the developer."}; // Throw error
  }
  // Clear the stack at last
  while (fract_stack.length != 0) {
    fract_stack.pop();
  };
  return value;
}

// Evaluate the product_stack into a number
function evalProductStack(product_stack) {
  if (product_stack.length == 0) {
    return {error_title: "Program Error", error_msg: "evalProductStack is broken. Please contact the developer."}; // Throw error
  }
  let value = 1;
  // Convert the array from fraction to bignumber if necessary
  if (!rational) {
    for (let i = 0 ; i < product_stack.length ; i++) {
      product_stack[i] = math.bignumber(product_stack[i]);
    }
  }
  while (product_stack.length != 0) {
    value = math.multiply(value, product_stack.pop());
  }
  return value;
}

// Check whether the given number or bignumber can be precisely expressed as a fraction
function canBeFraction(num) {
  num = math.bignumber(num);
  let frac = math.fraction(num);
  let frac_to_num = math.bignumber(math.divide(math.multiply(frac.n, frac.s), frac.d));
  // If the value is too large -> false
  if (math.larger(math.abs(num), MaxFractPart) || math.larger(frac.n, MaxFractPart) || math.larger(frac.d, MaxFractPart)) {
    return false;
  }
  // If the value is not precise -> false
  else if (!math.equal(num, frac_to_num)) {
    return false;
  }
  // If it is small and precise -> true
  else {
    return frac;
  }
}

// Check whether the given bignumber is an integer
function isBignumInt(num) {
  let str = math.format(num, {"notation": "auto", "precision": RoundToDigit});
  if (math.isInteger(str)) {
    return true;
  }
  else {
    return false;
  }
}

// Test whether the output of functions are rational, and determine whether to turn rational = false
function rationalTest(value) {
  let str = math.format(value, {"notation": "auto", "precision": RoundToDigit});
  let validity;
  // Test 1: if there is no dot i.e. the output is integer that is not too large -> keep rational
  if (!str.includes(".")) {
    validity = true;
  }
  else {
    let decimal_str = str.slice(str.indexOf(".")+1);
    // Test 2: if there is e i.e. the output is too large or it has long decimal places -> irrational
    if (decimal_str.includes("e")) {
      validity = false;
    }
    else {
      // Test 3: if the decimal part is more than 8 -> too long to be rationalized (Note: 8 out of 16 digits are zero means that it is likely for it to be rational)
      if (decimal_str.length > 8) {
        validity = false;
      }
      else {
        // Test 4: if the value can be converted into fraction with good precision -> rational
        if (canBeFraction(value)) {
          validity = true;
        }
        else {
          validity = false;
        }
      }
    }
  }
  return validity;
}

// Handle functions that use comma e.g. log
// Received formula_arr is expected to be the enclosed expression, so it does not contain the func word
function handleCommaFunc(formula_arr, func) {
  // Step 1: split the formula into parts separated by comma
  let parts = arraySplit(formula_arr, ",");
  // Step 2: evaluate each part like a formula
  let inputs = [];
  for (let i = 0 ; i < parts.length ; i++) {
    let result = calculateFormula(parts[i]);
    if (result.hasOwnProperty("error_title")) { // Manage error
      return result;
    }
    inputs.push(result);
  }
  // Step 3: convert the inputs to bignumber, some functions only accept number or bignumber as input
  for (let i = 0 ; i < inputs.length ; i++) {
    inputs[i] = math.bignumber(inputs[i]);
  }
  // Step 4: use the parts as input of the function
  let output = null;
  if (func == "log") {
    let base = inputs[0];
    let argument = inputs[1];
    // Input validation
    // Rule 1: base of log can only be positive numbers != 1
    if (math.smallerEq(base, 0) || math.equal(base, 1)) {
      return {error_title: "Math Error", error_msg: "Base of log can only be positive numbers which are not equal to 1."}; // Throw error
    }
    // Rule 2: argument of log can only be positive numbers
    if (math.smallerEq(argument, 0)) {
      return {error_title: "Math Error", error_msg: "Argument of log can only be positive numbers."}; // Throw error
    }
    // Calculator takes log(base, x) while mathjs takes math.log(x, [base])
    output = math.log(argument, base);
  }
  else {
    return {error_title: "Program Error", error_msg: "func not found in handleCommaFunc. Please contact the developer."}; // Throw error
  }
  // If it is now still rational, check whether the functions fail to maintain rationality i.e. giving irrational output
  if (rational) {
    let result = rationalTest(output);
    if (!result) {
      rational = false;
    }
    else {
      output = math.fraction(output);
    }
  }
  return output;
}

// Handle functions that takes the previous number as one of the argument e.g. ^, x√
function handleBackwardFunc(formula_arr, func, last_num) {
  let prev_num = last_num;
  let next_num = calculateFormula(formula_arr);
  if (next_num.hasOwnProperty("error_title")) { // Manage error
    return next_num;
  }
  let output = null;
  // Convert inputs to bignumber, some functions only accept number or bignumber as input
  prev_num = math.bignumber(prev_num);
  next_num = math.bignumber(next_num);
  // Options of functions
  if (func == "^") {
    // Rule: all kinds of input are valid
    output = math.pow(prev_num, next_num);
  }
  else if (func == "x√") {
    // Rule: root must be odd integer if argument is negative
    if (math.smaller(next_num, 0)) {
      if (isBignumInt(prev_num)) {
        return {error_title: "Math Error", error_msg: "Root of x√ can only be odd integers when argument is negative."}; // Throw error
      }
      else if (!(prev_num % 2)) {
        return {error_title: "Math Error", error_msg: "Root of x√ can only be odd integers when argument is negative."}; // Throw error
      }
    }
    output = math.nthRoot(next_num, prev_num);
  }
  else {
    return {error_title: "Program Error", error_msg: "func not found in handleBackwardFunc. Please contact the developer."}; // Throw error
  }
  // If it is now still rational, check whether the functions fail to maintain rationality i.e. giving irrational output
  if (rational) {
    let result = rationalTest(output);
    if (!result) {
      rational = false;
    }
    else {
      output = math.fraction(output);
    }
  }
  return output;
}

// Handle functions without using commas e.g. log, ln, sin, cos, √
function handleFunc(formula_arr, func) {
  let input = calculateFormula(formula_arr);
  if (input.hasOwnProperty("error_title")) { // Manage error
    return input;
  }
  let output = null;
  // Convert input to bignumber, some functions only accept number or bignumber as input
  input = math.bignumber(input);
  // Options of functions
  if (func == "log") {
    // Rule: all positive real number
    if (math.smallerEq(input, 0)) {
      return {error_title: "Math Error", error_msg: "Argument of log can only be positive numbers."}; // Throw error
    }
    output = math.log10(input);
  }
  else if (func == "ln") {
    // Rule: all positive real number
    if (math.smallerEq(input, 0)) {
      return {error_title: "Math Error", error_msg: "Argument of ln can only be positive numbers."}; // Throw error
    }
    output = math.log(input);
  }
  else if (func == "√") {
    // Rule: all non-negative real number
    if (math.smaller(input, 0)) {
      return {error_title: "Math Error", error_msg: "Argument of square roots can only be non-negative numbers"}; // Throw error
    }
    output = math.sqrt(input);
  }
  // If is trgio function, handle units of the input (degree or radian)
  else if (trigo_list.includes(func)) {
    // If it is now degree mode, turn the input (in degree) to its radian numerically
    if (!config.radianEnabled) {
      input = math.multiply(input, math.divide(math.bignumber(math.pi), math.bignumber(180))); // radian = degree * (pi / 180)
    }
    // Calculate
    if (func == "sin") {
      // Rule: all real number, must be valid
      output = math.sin(input);
    }
    else if (func == "cos") {
      // Rule: all real number, must be valid
      output = math.cos(input);
    }
    else if (func == "tan") {
      // Rule: all real number except where cos(x) == 0
      if (math.equal(math.cos(input), 0)) {
        return {error_title: "Math Error", error_msg: "Argument of tan cannot be a multiple of π/2."}; // Throw error
      }
      output = math.tan(input);
    }
    else if (func == "sec") {
      // sec = 1/cos
      // Rule: cos cannot be 0
      if (math.equal(math.cos(input), 0)) {
        return {error_title: "Math Error", error_msg: "Argument of sec cannot be the value which makes cos zero."}; // Throw error
      }
      output = math.sec(input);
    }
    else if (func == "csc") {
      // csc = 1/sin
      // Rule: sin cannot be 0
      if (math.equal(math.sin(input), 0)) {
        return {error_title: "Math Error", error_msg: "Argument of csc cannot be the value which makes sin zero."}; // Throw error
      }
      output = math.csc(input);
    }
    else if (func == "cot") {
      // Rule: all real number, must be valid
      output = math.cot(input);
    }
  }
  // If is arc trigo function, handle units of the output (degree or radian)
  else if (arc_trigo_list.includes(func)) {
    if (func == "arcsin") {
      // Rule: real number in [-1, 1]
      if (math.smaller(input, -1) || math.larger(input, 1)) {
        return {error_title: "Math Error", error_msg: "Argument of arcsin must be within the range of -1 and 1."}; // Throw error
      }
      output = math.asin(input);
    }
    else if (func == "arccos") {
      // Rule: real number in [-1, 1]
      if (math.smaller(input, -1) || math.larger(input, 1)) {
        return {error_title: "Math Error", error_msg: "Argument of arccos must be within the range of -1 and 1."}; // Throw error
      }
      output = math.acos(input);
    }
    else if (func == "arctan") {
      // Rule: all real number, must be valid
      output = math.atan(input);
    }
    else if (func == "arcsec") {
      // Rule 1: real number in [-1, 1]
      if (math.smaller(input, -1) || math.larger(input, 1)) {
        return {error_title: "Math Error", error_msg: "Argument of arcsec must be within the range of -1 and 1."}; // Throw error
      }
      // Rule 2: arccos cannot be 0
      if (math.equal(math.acos(input), 0)) {
        return {error_title: "Math Error", error_msg: "Argument of arcsec cannot be the value which makes arccos zero."}; // Throw error
      }
      output = math.asec(input);
    }
    else if (func == "arccsc") {
      // Rule 1: real number in [-1, 1]
      if (math.smaller(input, -1) || math.larger(input, 1)) {
        return {error_title: "Math Error", error_msg: "Argument of arccsc must be within the range of -1 and 1."}; // Throw error
      }
      // Rule 2: arcsin cannot be 0
      if (math.equal(math.asin(input), 0)) {
        return {error_title: "Math Error", error_msg: "Argument of arccos cannot be the value which makes arcsin zero."}; // Throw error
      }
      output = math.acsc(input);
    }
    else if (func == "arccot") {
      // Rule: arctan cannot be 0
      if (math.equal(math.atan(input), 0)) {
        return {error_title: "Math Error", error_msg: "Argument of arccot cannot be the value which makes arctan zero."}; // Throw error
      }
      output = math.acot(input);
    }
    // If it is now degree mode, turn the output (in radian) to its degree numerically
    if (!config.radianEnabled) {
      output = math.multiply(output, math.divide(math.bignumber(180), math.bignumber(math.pi))); // degree = radian * (180 / pi)
    }
  }
  else {
    return {error_title: "Program Error", error_msg: "func not found in handleFunc. Please contact the developer."}; // Throw error
  }
  // If it is now still rational, check whether the functions fail to maintain rationality i.e. giving irrational answer
  if (rational) {
    let test_result = rationalTest(output);
    if (!test_result) {
      rational = false;
    }
    else {
      output = math.fraction(output);
    }
  }
  return output;
}

// Turn a block of number (str type) in formula_arr into math object
function readNumBlock(str) {
  // If is number
  let base = 1;
  let exp = 0;
  let return_value = null;
  // Step 1: read exp -> does the number string uses exp?
  // If the number has E
  if (str.includes("E")) {
    let parts = str.split("E");
    // If the input omits base e.g. E12 = 1e12, keep base as 1
    // Else, take anything before E as base
    if (parts[0]) {
      base = math.bignumber(parts[0]);
    }
    // Record exp
    exp = math.bignumber(parts[1]); // Can be assumed to be integer thanks to processFormula
  }
  // If the number does not has E
  else {
    base = math.bignumber(str);
  }
  // Step 2: edit value with exp
  let num = math.multiply(base, math.pow(10, exp));
  // Step 3: handle fraction -> can the number be converted into fraction?
  // Only try to convert if the calculation is still rational
  if (rational) {
    // mathjs uses approximation to turn numbers into fractions, but calculator should now allow precision loss of fractions
    let result = canBeFraction(num);
    if (result) {
      return_value = result;
    }
    else {
      return_value = num;
      // One num cannot be fraction -> solution must not be rational
      rational = false;
    }
  }
  // If not rational at first, just use bignumber
  else {
    return_value = num;
  }
  return return_value;
}

// Calculate the formula recursively
function calculateFormula(formula_arr) {
  // Note 1: priority to evaluate stack: fract > product > sum, i.e. meet +-×÷ then evaluate fract_stack, meet +- then evaluate product_stack, at the end of the process evaluate sum_stack
  // Note 2: each number must experience this process: formula_arr[i] -> last_num -> stack -> calculated into a value
  // Note 3: flags are used to determine the operations done to next last_num
  let sum_stack = [];
  let product_stack = [];
  let fract_stack = [];
  let func = null; // temp storage of a function operation
  let last_num = null; // temp storage of a number
  let plus_flag = true; // Is the value being pushed to sum_stack being added or subtracted?
  let multiply_flag = true; // Is the value being pushed to product_stack multiplied or divided?
  let positive_flag = true // Is the value stored to last_num positive or negative?
  let sticky_flag = true; // Is the last block an arithmetic operator? -> to handle A × -B
  // sticky_flag should be disabled when blocks which are not arithmetic operators are met
  // If the formula is empty, set answer to default 0
  if (formula_arr.length == 0) {
    return 0;
  }
  // Main calculation loop
  for (let i = 0 ; i < formula_arr.length ; i++) {
    // If the current block is a number
    if (!operators.includes(formula_arr[i]) && !constants.hasOwnProperty(formula_arr[i])) {
      last_num = readNumBlock(formula_arr[i]);
      // Switch the sign if necessary
      if (!positive_flag) {
        last_num = math.unaryMinus(last_num);
      }
      sticky_flag = false;
    }
    // If the current block is a number
    else if (constants.hasOwnProperty(formula_arr[i])) {
      last_num = math.bignumber(constants[formula_arr[i]]);
      // Constants must not be rational
      rational = false;
    }
    // If the current block is !, replace last_num with the result directly
    else if (formula_arr[i] == "!") {
      // Factorial only accept number or bignumber as input
      let value;
      // Check whether last_num is an integer with different methods depending on data type
      if (math.isFraction(last_num)) {
        if (!math.equal(last_num.d, 1) || math.equal(last_num.s, -1)) {
          return {error_title: "Syntax Error", error_msg: "Factorial can only be applied to non-negative integers."}; // Throw error
        }
        value = math.bignumber(last_num.n);
      }
      else {
        if (!isBignumInt(last_num)) {
          return {error_title: "Syntax Error", error_msg: "Factorial can only be applied to non-negative integers."}; // Throw error
        }
        value = math.bignumber(str);
      }
      // Check whether the factorial will be too large
      if (math.larger(value, MaxFactorialArg)) {
        return {error_title: "Math Error", error_msg: `The solution is too large. (Maximum value allowed: exp(${MaxExp+1}))`}; // Throw error
      }
      // Calculate
      value = math.factorial(value);
      // Check whether the factorial became too large
      if (overMaximum(value)) {
        return {error_title: "Math Error", error_msg: `The solution is too large. (Maximum value allowed: exp(${MaxExp+1}))`}; // Throw error
      }
      // Replace last_num and decide whether is still rational
      if (rational) {
        if (rationalTest(value)) {
          value = math.fraction(value);
        }
        else {
          rational = false;
        }
      }
      last_num = value;
    }
    // If the current block is ², replace last_num with the result directly
    else if (formula_arr[i] == "²") {
      if (rational) {
        let value = math.square(last_num);
        // If the n and d becomes too large (whole value must be far from too large)
        if (math.larger(value.n, MaxFractPart) || math.larger(value.d, MaxFractPart)) {
          value = math.bignumber(value);
          rational = false;
        }
        last_num = value;
      }
      else {
        let value = math.square(last_num);
        // If the solution becomes too large
        if (overMaximum(value)) {
          return {error_title: "Math Error", error_msg: `The solution is too large. (Maximum value allowed: exp(${MaxExp+1}))`}; // Throw error
        }
        last_num = value;
      }
    }
    // If the current block is + or -, finish evaluating fract_stack, then product_stack, and then push the solution into sum_stack
    else if (formula_arr[i] == "+" || formula_arr[i] == "-") {
      // If the operator is sticky, or it is the first block
      if (sticky_flag || last_num == null) {
        // Edit the positiveness of the next last_Num
        if (formula_arr[i] === "+") {
          positive_flag = true;
        }
        else {
          positive_flag = false;
        }
      }
      // If the operator is not sticky, move on
      else {
        // Edit last_num depending on postive_flag
        let value = last_num;
        // If fract_stack is not empty, finish the fract
        if (fract_stack.length != 0) {
          fract_stack.push(value);
          value = evalFractStack(fract_stack);
        }
        // If product_stack is not empty, finish the multiplication
        if (product_stack.length != 0) {
          if (multiply_flag) {
            product_stack.push(value);
          }
          else {
            let inverted_value = divideWrapper(1, value);
            if (inverted_value.hasOwnProperty("error_title")) { // Manage error
              return inverted_value;
            }
            product_stack.push(inverted_value);
          }
          value = evalProductStack(product_stack);
        }
        // Push the value into sum_stack, negate if needed
        if (plus_flag) {
          sum_stack.push(value);
        }
        else {
          sum_stack.push(math.unaryMinus(value));
        }
        // Regardless of the state of last_num, change the plus_flag to determine whether the next block is added or subtracted
        if (formula_arr[i] == "+") {
          plus_flag = true;
        }
        else {
          plus_flag = false;
        }
      }
      // Theoratically, processFormula has eliminated all continous + and -, so after one + or -, there must not be neighbouring + and - afterwards immediately
      sticky_flag = false;
    }
    // If the current block is × or ÷, finish evaluating fract_stack, and then push the solution into product_stack
    else if (formula_arr[i] == "×" || formula_arr[i] == "÷") {
      let value = last_num;
      // If fract_stack is not empty, finish the fract
      if (fract_stack.length != 0) {
        fract_stack.push(value);
        value = evalFractStack(fract_stack);
      }
      // Push the value into product_stack, invert if needed
      if (multiply_flag) {
        product_stack.push(value);
      }
      else {
        let inverted_value = divideWrapper(1, value);
        if (inverted_value.hasOwnProperty("error_title")) { // Manage error
          return inverted_value;
        }
        product_stack.push(inverted_value);
      }
      // Change the multiply_flag to determine whether the next block is added or subtracted
      if (formula_arr[i] == "×") {
        multiply_flag = true;
      }
      else {
        multiply_flag = false;
      }
      // Set positiveness to default
      positive_flag = true;
      // Turn on sticky flag
      sticky_flag = true;
    }
    // If the current block is slash, push last_num into fract_stack
    else if (formula_arr[i] == "/") {
      fract_stack.push(last_num);
      sticky_flag = false;
    }
    // If the current block is a function (e.g. sin, cos, log, sqrt), save as func and wait for the evalution of its parentheses
    else if (func_list.includes(formula_arr[i])) {
      func = formula_arr[i];
      sticky_flag = false;
    }
    else if (formula_arr[i] == "(") {
      // Locate the corresponding closing parenthesis
      let close_index = findClosing(formula_arr, i);
      let expression = formula_arr.slice(i+1, close_index);
      let value;
      // If the enclosed expression is used for functions
      if (func != null) {
        // Handle comma function (after processFormula, it can be assumed that comma count must match)
        // Note: if no. of comma is 0, this means that the function can be handled without comma  -> fall to next condition
        if (comma_list.hasOwnProperty(func) && countOf(",", expression) != 0) {
          value = handleCommaFunc(expression, func);
          if (value.hasOwnProperty("error_title")) { // Manage error
            return value;
          }
        }
        else if (backward_func_list.includes(func)) {
          value = handleBackwardFunc(expression, func, last_num);
          if (value.hasOwnProperty("error_title")) { // Manage error
            return value;
          }
        }
        // Handle normal function
        else {
          value = handleFunc(expression, func);
          if (value.hasOwnProperty("error_title")) { // Manage error
            return value;
          }
        }
      }
      // If the enclosed expression should be evaluated into a number
      else {
        value = calculateFormula(formula_arr.slice(i+1, close_index));
        if (value.hasOwnProperty("error_title")) { // Manage error
          return value;
        }
      }
      // Put value to last_num
      last_num = value;
      // Prepare for next iteration
      func = null;
      i = close_index;
      sticky_flag = false;
    }
    // No comma should be handled by calculateFormula (they should be handled in handleCommaFunc), throw error if there is
    else if (formula_arr[i] == ",") {
      return {error_title: "Program Error", error_msg: "calculateFormula is broken. Please contact the developer."}; // Throw error
    }
  }
  // After iterating through the whole formula, do the last push of last_num
  let value = last_num;
  // Finish the fract
  if (fract_stack.length != 0) {
    fract_stack.push(value);
    value = evalFractStack(fract_stack);
  }
  // Finish the multiplication
  if (product_stack.length != 0) {
    if (multiply_flag) {
      product_stack.push(value);
    }
    else {
      let inverted_value = divideWrapper(1, value);
      if (inverted_value.hasOwnProperty("error_title")) { // Manage error
        return inverted_value;
      }
      product_stack.push(inverted_value);
    }
    value = evalProductStack(product_stack);
  }
  // Finish the addition
  if (sum_stack.length != 0) {
    if (plus_flag) {
      sum_stack.push(value);
    }
    else {
      sum_stack.push(math.unaryMinus(value));
    }
    // Convert the array from fraction to bignumber if necessary
    if (!rational) {
      for (let i = 0 ; i < sum_stack.length ; i++) {
        sum_stack[i] = math.bignumber(sum_stack[i]);
      }
    }
    value = math.sum(...sum_stack);
  }
  return value;
}

// Evaluate the given formula string into a value
export function evaluateFormula(formula_str, radianEnabled, mixedFract) {
  // Step 1: settings
  config.radianEnabled = radianEnabled; // Turn global variable in this script as desired
  config.mixedFract = mixedFract; // Turn global variable in this script as desired
  // Step 2: split string depending on operators
  let formula_arr = parseFormula(formula_str);
  if (formula_arr.hasOwnProperty("error_title")) { // Manage error
    return formula_arr;
  }
  // Step 3: recursive formula validation and processing
  formula_arr = processFormula(formula_arr, false, false);
  if (formula_arr.hasOwnProperty("error_title")) { // Manage error
    return formula_arr;
  }
  // Step 4: recursive calculation
  rational = true; // Reset
  let result = calculateFormula(formula_arr);
  if (result.hasOwnProperty("error_title")) { // Manage error
    return result;
  }
  return result;
}