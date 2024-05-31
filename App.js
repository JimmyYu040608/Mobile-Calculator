import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, SafeAreaView, ScrollView } from 'react-native';
import * as math from 'mathjs';

// Return the number of specific item in an array, workable on string as well
function countOf(target, array) {
  let count = 0;
  for (let i = 0 ; i < array.length ; i++) {
    if (array[i] == target) {
      count++;
    }
  }
  return count;
}

// Split the array into parts with specific separators
Array.prototype.arraySplit = function (separator) {
  let arr = [[]];
  let index = 0;
  for (let i = 0 ; i < this.length ; i++) {
    if (this[i] === separator) {
      arr.push([]);
      index++;
    }
    else {
      arr[index].push(this[i]);
    }
  }
  return arr;
}

export default function MobileCalculator() {
  // "global variables"
  // useState -> automatically rendered (changing display) object
  const [blocks, setBlocks] = useState([]); // Formula display components
  const [answer, setAnswer] = useState(0); // Answer value
  const [ansStr, setAnsStr] = useState("0"); // Answer display component
  const [position, setPosition] = useState(0); // Index of the currently pointing box for del, concat's positioning (TODO: allow edition in the middle)
  const [executed, setExecuted] = useState(false);
  let rational = true; // Whether the solution can be expressed in terms of a fraction
  const RoundToDigit = 16; // Max no. of digits of stored
  const MaxFractPart = 2147483647 // Max value of fract.n and fract.d or else it will overflow
  const MaxExp = 9999999; // largest number is up to exp(MaxExp+1)
  const MaxFactorialArg = 1723507; // 1723507! is the largest factorial that is smaller than MaxExp

  // LOGIC
  // Pop up error alert
  const showAlert = (error_title, error_msg) => {
    Alert.alert(error_title, error_msg, [{text: "OK", onPress: () => console.log("Error alert seen.")}]);
  }

  // Divide a by b, same as math.divide, but added showAlert component to warn division by zero
  function divideWrapper(a, b) {
    if (math.equal(b, 0)) {
      showAlert("Math Error", "Division by zero detected.");
      return false;
    }
    else {
      return math.divide(a, b);
    }
  }

  // Turn a number into its string representation
  function mathToString(num, digit_limit, rational) {
    // rational: display in fraction or decimal number
    // For num in fraction type, it is assumed that n and d do not overflow
    let str = "";
    // Check whether to display in fraction
    if (rational && (math.isFraction(num) && !math.equal(num.d, 1))) {
      // If it takes too many digits to fully display num in fraction, just display in decimal
      let digit_count = math.string(num.n).length + 1 + math.string(num.d).length;
      // Display in fraction
      if (digit_count <= digit_limit) {
        if (math.equal(num.s, -1)) {
          str += "-";
        }
        str += math.string(num.n);
        str += "/";
        str += math.string(num.d);
      }
      // Display in decimal
      else {
        let value = divideWrapper(math.multiply(num.n, num.s), num.d);
        str = math.format(value, {"notation": "auto", "precision": digit_limit-1, "lowerExp": -3, "upperExp": 10});
      }
    }
    // Display in decimal
    else {
      let value = math.bignumber(num);
      str = math.format(value, {"notation": "auto", "precision": digit_limit-1, "lowerExp": -3, "upperExp": 10});
    }
    return str;
  }

  // Global const lists
  const operators = ["+", "-", "×", "÷", "/", "(", ")", "^", "²", "!", "%", "√", "x√", "log", "ln", "sin", "cos", "tan", "sec", "csc", "cot", "arcsin", "arccos", "arctan", "arcsec", "arccsc", "arccot", ","]; // All blocks which are not numbers (. and E are seen together with numbers)
  const arith_operators = ["+", "-", "×", "÷"];
  const multiply_list = ["Ans", "(", "√", "log", "ln", "sin", "cos", "tan", "sec", "csc", "cot", "arcsin", "arccos", "arctan", "arcsec", "arccsc", "arccot"]; // Blocks which their previous neighbouring numbers multiply with them
  const func_list = ["^", "√", "x√", "log", "ln", "sin", "cos", "tan", "sec", "csc", "cot", "arcsin", "arccos", "arctan", "arcsec", "arccsc", "arccot"]; // Functions which takes trailing parentheses as input to generate values
  const comma_list = {"log": [0, 1]}; // Comma functions and their acceptable number of commas
  const backward_func_list = ["^", "x√", "E"]; // Backward functions takes the previous number as one of the parameter e.g. ^, x√
  const begin_ban_list = ["×", "÷", "/", ")", "^", "x√", "²", "!", "%", ","]; // Blocks which are not allowed to present in the beginning of the formula
  const end_ban_list = ["+", "-", "×", "÷", "/", "(", ",", "E"]; // Blocks which are not allowed to present in the ending of the formula
  const separators = ["+", "-", "×", "÷", "/", "(", ")", "^", "²", "!", "%", "Ans", "√", "x√", "log", "ln", "sin", "cos", "tan", "sec", "csc", "cot", "arcsin", "arccos", "arctan", "arcsec", "arccsc", "arccot", ","]; // used in parseFormula
  // Parse the formula string into formula array
  function parseFormula(formula_str) {
    console.log(formula_str);
    // Validate string by pattern (RegEx)
    // Target 1: most symbols cannot be beginning; all symbols cannot be ending
    if (begin_ban_list.includes(formula_str[0])) {
      showAlert("Syntax Error", `Incomplete operations at "${formula_str[0]}".`);
      return false;
    }
    if (end_ban_list.includes(formula_str[formula_str.length-1])) {
      showAlert("Syntax Error", `Incomplete operations at "${formula_str[formula_str.length-1]}".`);
      return false;
    }
    // Target 2: no consecutive ×, ÷, / are allowed
    const ban_pattern1 = /(\×|\÷|\/){2,}/;
    if (ban_pattern1.test(formula_str)) {
      showAlert("Syntax Error", "No consecutive ×, ÷, and / are allowed.");
      return false;
    }
    // Target 3: no + or - are allowed to be place right before ×, ÷, / or !
    const ban_pattern2 = /[\+\-](\×|\÷|\/|\!)/;
    if (ban_pattern2.test(formula_str)) {
      showAlert("Syntax Error", "No + or - signs are allowed to be placed right before × or ÷ signs.");
      return false;
    }
    // Target 4: no dot after closing parentheses
    const ban_pattern3 = /\)\./;
    if (ban_pattern3.test(formula_str)) {
      showAlert("Syntax Error", "No dots are allowed immediately after closing parentheses.");
      return false;
    }
    // Target 7: no symbols allowed before ² and x√
    const ban_pattern4 = /[\+\-\×\÷\(\/](\²|\x\√)/;
    if (ban_pattern4.test(formula_str)) {
      showAlert("Syntax Error", "No +, -, ×, ÷, /, or ( are allowed to be placed right before ² or x√ signs.");
      return false;
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
    console.log(formula_arr);

    /*
    // Create regex expression
    const escaped_separators = separators.map(separator => separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escaped_separators.join('|')})`);
    // Split formula at once
    let formula_arr = formula_str.split(regex);
    */

    // Clear empty string
    formula_arr = formula_arr.filter((str) => str !== "");
    return formula_arr;
  }

  // Validate and process the formula recursively, if valid, return the processed array, if invalid, return false
  // Mission: ensure all parts of the output array can be calculated by calculateFormula
  // recursed: bool, is this call to the function recursive, or is the first call?
  // comma_mode: bool, does this enclosed expression reads comma? e.g. log
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
      showAlert("Syntax Error", "Empty parentheses detected");
      return false;
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
          showAlert("Syntax Error", "Parentheses unpaired.");
          return false;
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
        showAlert("Syntax Error", "No more than one dot can be used in a number.");
        return false;
      }
      // For Target 5
      else if (countOf("E", formula_arr[i]) > 1) {
        showAlert("Syntax Error", "No more than one E can be used in a number.");
        return false;
      }
      // For Target 6
      else if (formula_arr[i].includes(".") && formula_arr[i].includes("E")) {
        if (formula_arr[i].indexOf(".") > formula_arr[i].indexOf("E")) {
          showAlert("Syntax Error", "A number cannot be raised to a non-integer exponent.");
          return false;
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
          showAlert("Syntax Error", "No more than two slashes can be used in a number.");
          return false;
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
          showAlert("Program Error", "paren_pairs is broken. Please contact the developer.");
          return false;
        }
        // If this parenthesis is for comma function e.g. log
        if (comma_list.hasOwnProperty(func)) {
          let parts = formula_arr.slice(i+1, close_index).arraySplit(",");
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
            showAlert("Syntax Error", `The number of enclosed comma does not match the function requirement. ${comma_mode} should take ${str} comma(s).`);
            return false;
          }
          // If there are more than one parts, enter recursion part by part
          if (parts.length != 1) {
            temp_arr.push("(");
            for (let j = 0 ; j < parts.length ; j++) {
              let result = processFormula(parts[j], true, false);
              if (!result) { // Manage error
                return false;
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
            if (!result) { // Manage error
              return false;
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
          if (!result) { // Manage error
            return false;
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
        showAlert("Syntax Error", "No commas are allowed outside parentheses used to enclose the arguments of a function.");
        return false;
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
          let ans_str = mathToString(answer, RoundToDigit);
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
      if (!value) { // Manage error
        return false;
      }
    }
    // Fraction a/b
    else if (fract_stack.length == 2) {
      value = divideWrapper(fract_stack[0], fract_stack[1]);
      if (!value) { // Manage error
        return false;
      }
    }
    // If not a fraction
    else if (fract_stack.length == 1) {
      value = fract_stack[0];
    }
    else {
      showAlert("Program Error", "evalFractStack is broken. Please contact the developer.");
      return false;
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
      showAlert("Program Error", "evalProductStack is broken. Please contact the developer.");
      return false;
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
    let parts = formula_arr.arraySplit(",");
    // Step 2: evaluate each part like a formula
    let inputs = [];
    for (let i = 0 ; i < parts.length ; i++) {
      let result = calculateFormula(parts[i]);
      if (!result) { // Manage error
        return false;
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
        showAlert("Math Error", "Base of log can only be positive numbers which are not equal to 1.");
        return false;
      }
      // Rule 2: argument of log can only be positive numbers
      if (math.smallerEq(argument, 0)) {
        showAlert("Math Error", "Argument of log can only be positive numbers.");
        return false;
      }
      // Calculator takes log(base, x) while mathjs takes math.log(x, [base])
      output = math.log(argument, base);
    }
    else {
      showAlert("Program Error", "func not found in handleCommaFunc. Please contact the developer.");
      return false;
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
    if (!next_num) { // Manage error
      return false;
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
          showAlert("Math Error", "Root of x√ can only be odd integers when argument is negative.");
          return false;
        }
        else if (!(prev_num % 2)) {
          showAlert("Math Error", "Root of x√ can only be odd integers when argument is negative.");
          return false;
        }
      }
      output = math.nthRoot(next_num, prev_num);
    }
    else {
      showAlert("Program Error", "func not found in handleBackwardFunc. Please contact the developer.");
      return false;
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
    if (!input) { // Manage error
      return false;
    }
    let output = null;
    // Convert input to bignumber, some functions only accept number or bignumber as input
    input = math.bignumber(input);
    // Options of functions
    if (func == "log") {
      // Rule: all positive real number
      if (math.smallerEq(input, 0)) {
        showAlert("Math Error", "Argument of log can only be positive numbers.");
        return false;
      }
      output = math.log10(input);
    }
    else if (func == "ln") {
      // Rule: all positive real number
      if (math.smallerEq(input, 0)) {
        showAlert("Math Error", "Argument of ln can only be positive numbers.");
        return false;
      }
      output = math.log(input);
    }
    else if (func == "√") {
      // Rule: all non-negative real number
      if (math.smaller(input, 0)) {
        showAlert("Math Error", "Argument of square roots can only be non-negative numbers");
        return false;
      }
      output = math.sqrt(input);
    }
    else if (func == "sin") {
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
        showAlert("Math Error", "Argument of tan cannot be a multiple of π/2.");
        return false;
      }
      output = math.tan(input);
    }
    else if (func == "arcsin") {
      // Rule: real number in [-1, 1]
      if (math.smaller(input, -1) || math.larger(input, 1)) {
        showAlert("Math Error", "Argument of arcsin can only be within [-1, 1].");
        return false;
      }
      output = math.asin(input);
    }
    else if (func == "arccos") {
      // Rule: real number in [-1, 1]
      if (math.smaller(input, -1) || math.larger(input, 1)) {
        showAlert("Math Error", "Argument of arccos can only be within [-1, 1].");
        return false;
      }
      output = math.acos(input);
    }
    else if (func == "arctan") {
      // Rule: all real number, must be valid
      output = math.atan(input);
    }
    else if (func == "sec") {
      // sec = 1/cos
      // Rule: cos cannot be 0
      if (math.equal(math.cos(input), 0)) {
        showAlert("Math Error", "Argument of sec cannot be the value which makes cos zero.");
        return false;
      }
      output = math.sec(input);
    }
    else if (func == "csc") {
      // csc = 1/sin
      // Rule: sin cannot be 0
      if (math.equal(math.sin(input), 0)) {
        showAlert("Math Error", "Argument of csc cannot be the value which makes sin zero.");
        return false;
      }
      output = math.csc(input);
    }
    else if (func == "cot") {
      // Rule: all real number, must be valid
      output = math.cot(input);
    }
    else if (func == "arcsec") {
      // Rule 1: real number in [-1, 1]
      if (math.smaller(input, -1) || math.larger(input, 1)) {
        showAlert("Math Error", "Argument of arcsec can only be within [-1, 1].");
        return false;
      }
      // Rule 2: arccos cannot be 0
      if (math.equal(math.acos(input), 0)) {
        showAlert("Math Error", "Argument of arcsec cannot be the value which makes arccos zero.");
        return false;
      }
      output = math.asec(input);
    }
    else if (func == "arccsc") {
      // Rule 1: real number in [-1, 1]
      if (math.smaller(input, -1) || math.larger(input, 1)) {
        showAlert("Math Error", "Argument of arccsc can only be within [-1, 1].");
        return false;
      }
      // Rule 2: arcsin cannot be 0
      if (math.equal(math.asin(input), 0)) {
        showAlert("Math Error", "Argument of arccos cannot be the value which makes arcsin zero.");
        return false;
      }
      output = math.acsc(input);
    }
    else if (func == "arccot") {
      // Rule: arctan cannot be 0
      if (math.equal(math.atan(input), 0)) {
        showAlert("Math Error", "Argument of arccot cannot be the value which makes arctan zero.");
        return false;
      }
      output = math.acot(input);
    }
    else {
      showAlert("Program Error", "func not found in handleFunc. Please contact the developer.");
      return false;
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
      if (!operators.includes(formula_arr[i])) {
        let num = 1;
        let exp = 0;
        // Step 1: handle exp -> does the number string uses E?
        // If the number uses exp
        if (formula_arr[i].includes("E")) {
          let parts = formula_arr[i].split("E");
          // If the users use the shortcut: omitting E e.g. E12 = 1e12, keep num as 1
          if (parts[0]) {
            num = math.bignumber(parts[0]);
          }
          // Record exp
          exp = math.bignumber(parts[1]);
          if (!isBignumInt(exp)) {
            showAlert("Syntax Error", "A number cannot be raised to a non-integer exponent.");
            return false;
          }
        }
        // If the number does not use exp
        else {
          num = math.bignumber(num);
        }
        // Step 2: handle fraction -> can the number be converted into fraction?
        if (rational) {
          // mathjs uses approximation to turn numbers into fractions. but calculator should not allow precision loss of fractions
          let result = canBeFraction(num);
          if (result) {
            last_num = result;
          }
          else {
            last_num = num;
            // One num can't be fraction -> solution must not be rational
            rational = false; 
          }
        }
        // If not rational at first, just use bignumber
        else {
          last_num = math.bignumber(formula_arr[i]);
        }
        // Switch the sign if necessary
        if (!positive_flag) {
          last_num = math.unaryMinus(last_num);
        }
        sticky_flag = false;
      }
      // If the current block is !, replace last_num with the result directly
      else if (formula_arr[i] == "!") {
        // Factorial only accept number or bignumber as input
        let value;
        // Check whether last_num is an integer with different methods depending on data type
        if (math.isFraction(last_num)) {
          if (!math.equal(last_num.d, 1) || math.equal(last_num.s, -1)) {
            showAlert("Syntax Error", "Factorial can only be applied to non-negative integers.");
            return false;
          }
          value = math.bignumber(last_num.n);
        }
        else {
          if (!isBignumInt(last_num)) {
            showAlert("Syntax Error", "Factorial can only be applied to non-negative integers.");
            return false;
          }
          value = math.bignumber(str);
        }
        // Check whether the factorial will be too large
        if (math.larger(value, MaxFactorialArg)) {
          showAlert("Math Error", `The solution is too large. (Maximum value allowed: exp(${MaxExp+1}))`);
          return false;
        }
        // Calculate
        value = math.factorial(value);
        // Check whether the factorial became too large
        if (overMaximum(value)) {
          showAlert("Math Error", `The solution is too large. (Maximum value allowed: exp(${MaxExp+1}))`);
          return false;
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
            showAlert("Math Error", `The solution is too large. (Maximum value allowed: exp(${MaxExp+1}))`);
            return false;
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
              if (!inverted_value) { // Manage error
                return false;
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
          if (!inverted_value) { // Manage error
            return false;
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
            if (!value) { // Manage error
              return false;
            }
          }
          else if (backward_func_list.includes(func)) {
            value = handleBackwardFunc(expression, func, last_num);
            if (!value) { // Manage error
              return false;
            }
          }
          // Handle normal function
          else {
            value = handleFunc(expression, func);
            if (!value) { // Manage error
              return false;
            }
          }
        }
        // If the enclosed expression should be evaluated into a number
        else {
          value = calculateFormula(formula_arr.slice(i+1, close_index));
          if (!value) { // Manage error
            return false;
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
        showAlert("Program Error", "calculateFormula is broken. Please contact the developer.");
        return false;
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
        if (!inverted_value) { // Manage error
          return false;
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

  // Evaluate the formula string
  function evaluateFormula() {
    // Step 1: split string depending on operators
    let formula_str = blocks.join("");
    let formula_arr = parseFormula(formula_str);
    if (!formula_arr) { // Manage error
      return false;
    }
    // Step 2: recursive formula validation and processing
    formula_arr = processFormula(formula_arr, false, false);
    if (!formula_arr) { // Manage error
      return false;
    }
    // Step 3: recursive calculation
    rational = true; // Reset
    let result = calculateFormula(formula_arr, true);
    if (!result) { // Manage error
      return false;
    }
    return result;
  }

  // EXECUTION
  // Edit the formula on press
  const concatPressed = (char) => {
    // Some char should display differently
    function mapChar(char) {
      const map = {"(-)": "-"};
      let result = char;
      for (let key in map) {
        if (key === char) {
          result = map[char];
          break;
        }
      }
      return result;
    }
    // Respond differently depending on the current state: during edition or after execution
    if (executed) {
      const sticky_ans_list = ["+", "-", "×", "÷", ")", "/"];
      if (sticky_ans_list.includes(char)) {
        setBlocks(["Ans", mapChar(char)]);
        setPosition(2);
      }
      else {
        setBlocks([mapChar(char)]);
        setPosition(1);
      }
      setExecuted(false);
    }
    else {
      setBlocks((prev_blocks) => [...prev_blocks, char]);
      setPosition(position+1);
    }
  }

  // Delete the last character in the formula on press of DEL
  const delPressed = () => {
    if (!executed) {
      if (position != 0) {
        setBlocks([...blocks.slice(0, position-1), ...blocks.slice(position)]);
        setPosition(position-1);
      }
    }
  }

  // Clear the whole formula on press of AC
  const acPressed = () => {
    setAnsStr("0");
    setExecuted(false);
    setBlocks([]);
    setPosition(0);
  }

  // Execute the formula, call functions to calculate and display the answer
  const exePressed = () => {
    let result = evaluateFormula();
    console.log(result);
    if (!result) {
      setAnsStr("0");
      setBlocks([]);
      setExecuted(false);
    }
    else {
      setAnswer(result);
      setAnsStr(mathToString(result, RoundToDigit));
      setExecuted(true);
    }
  }

  // Shift position to left by 1 block
  const leftPressed = () => {
    if (position > 0) {
      setPosition(position-1);
    }
  }

  // Shift position to right by 1 block
  const rightPressed = () => {
    if (position < blocks.length+1) {
      setPosition(position+1);
    }
  }

  // GUI STRUCTURE
  return (
    <SafeAreaView style={styles.environment}>
			{/* <View style={styles.sidebar}>

			</View> */}

			<View style={styles.main}>
        {/* Upper Container */}
				<View style={styles.upper_container}>
					<View style={styles.display_screen}>
						<View style={styles.input_row}>
              <ScrollView horizontal ref={ref => {this.scrollView = ref}} onContentSizeChange={() => this.scrollView.scrollToEnd({animated: true})}>
                {blocks.map((block, index) => (
                  <Block key={index} text={block}/>
                ))}
              </ScrollView>
						</View>
						<View style={styles.output_row}>
							<Text style={styles.output_ans}>{ansStr}</Text>
						</View>
					</View>
          <View>
          </View>
				</View>
        {/* Middle Container */}
        <View style={styles.mid_container}>
          <View style={styles.mid_subcontainer}>
            <Text>1</Text>
          </View>
          <View style={styles.mid_subcontainer}>
            <View style={styles.mid_row}>
              <View style={styles.mid_row_side}></View>
              <TouchableOpacity style={styles.mid_row_center}>
                <TriangleUp></TriangleUp>
              </TouchableOpacity>
              <View style={styles.mid_row_side}></View>
            </View>
            <View style={styles.mid_large_row}>
              <TouchableOpacity style={styles.mid_column} onPress={() => leftPressed()}>
                <TriangleLeft></TriangleLeft>
              </TouchableOpacity>
              <View style={styles.mid_large_column}></View>
              <TouchableOpacity style={styles.mid_column} onPress={() => rightPressed()}>
                <TriangleRight></TriangleRight>
              </TouchableOpacity>
            </View>
            <View style={styles.mid_row}>
              <View style={styles.mid_row_side}></View>
              <TouchableOpacity style={styles.mid_row_center}>
                <TriangleDown></TriangleDown>
              </TouchableOpacity>
              <View style={styles.mid_row_side}></View>
            </View>
          </View>
          <View style={styles.mid_subcontainer}>
            <Text>3</Text>
          </View>
        </View>
        {/* Lower Container */}
				<View style={styles.lower_container}>
					<View style={styles.btn_container}>
            <View style={styles.btn_row}>
              <FormulaBtn onPress={() => concatPressed("/")} text="/"/>
              <FormulaBtn onPress={() => concatPressed("√(")} text="√"/>
              <FormulaBtn onPress={() => concatPressed("²")} text="x²"/>
              <FormulaBtn onPress={() => concatPressed("^(")} text="^"/>
              <FormulaBtn onPress={() => concatPressed("x√(")} text="x√"/>
              <FormulaBtn onPress={() => concatPressed("!")} text="!"/>
						</View>
						<View style={styles.btn_row}>
              <FormulaBtn onPress={() => concatPressed("sin(")} text="sin"/>
              <FormulaBtn onPress={() => concatPressed("cos(")} text="cos"/>
              <FormulaBtn onPress={() => concatPressed("tan(")} text="tan"/>
              <FormulaBtn onPress={() => concatPressed("sec(")} text="sec"/>
              <FormulaBtn onPress={() => concatPressed("csc(")} text="csc"/>
              <FormulaBtn onPress={() => concatPressed("cot(")} text="cot"/>
						</View>
            <View style={styles.btn_row}>
              <FormulaBtn onPress={() => concatPressed("arcsin(")} text="arcsin"/>
              <FormulaBtn onPress={() => concatPressed("arccos(")} text="arccos"/>
              <FormulaBtn onPress={() => concatPressed("arctan(")} text="arctan"/>
              <FormulaBtn onPress={() => concatPressed("arcsec(")} text="arcsec"/>
              <FormulaBtn onPress={() => concatPressed("arccsc(")} text="arccsc"/>
              <FormulaBtn onPress={() => concatPressed("arccot(")} text="arccot"/>
						</View>
						<View style={styles.btn_row}>
            <FormulaBtn onPress={() => concatPressed("log(")} text="log"/>
            <FormulaBtn onPress={() => concatPressed("ln(")} text="ln"/>
            <FormulaBtn onPress={() => concatPressed("%")} text="%"/>
            <FormulaBtn onPress={() => concatPressed("(")} text="("/>
            <FormulaBtn onPress={() => concatPressed(")")} text=")"/>
            <FormulaBtn onPress={() => concatPressed(",")} text=","/>
						</View>
					</View>
					<View style={styles.btn_container}>
						<View style={styles.btn_row}>
              <ArbitBtn onPress={() => concatPressed("7")} text="7"/>
              <ArbitBtn onPress={() => concatPressed("8")} text="8"/>
              <ArbitBtn onPress={() => concatPressed("9")} text="9"/>
              <ArbitBtn onPress={() => delPressed()} text="DEL"/>
              <ArbitBtn onPress={() => acPressed()} text="AC"/>
						</View>
						<View style={styles.btn_row}>
              <ArbitBtn onPress={() => concatPressed("4")} text="4"/>
              <ArbitBtn onPress={() => concatPressed("5")} text="5"/>
              <ArbitBtn onPress={() => concatPressed("6")} text="6"/>
              <ArbitBtn onPress={() => concatPressed("×")} text="×"/>
              <ArbitBtn onPress={() => concatPressed("÷")} text="÷"/>
						</View>
						<View style={styles.btn_row}>
              <ArbitBtn onPress={() => concatPressed("1")} text="1"/>
              <ArbitBtn onPress={() => concatPressed("2")} text="2"/>
              <ArbitBtn onPress={() => concatPressed("3")} text="3"/>
              <ArbitBtn onPress={() => concatPressed("+")} text="+"/>
              <ArbitBtn onPress={() => concatPressed("-")} text="-"/>
						</View>
						<View style={styles.btn_row}>
              <ArbitBtn onPress={() => concatPressed("0")} text="0"/>
              <ArbitBtn onPress={() => concatPressed(".")} text="."/>
              <ArbitBtn onPress={() => concatPressed("E")} text="EXP"/>
              <ArbitBtn onPress={() => concatPressed("Ans")} text="Ans"/>
              <ArbitBtn onPress={() => exePressed()} text="EXE"/>
						</View>
					</View>
				</View>
			</View>
		</SafeAreaView>
  );
}

// Create blocks
const Block = (props) => {
  return (
    <View style={styles.char_block}>
      <Text style={styles.char_text}>{props.text}</Text>
    </View>
  );
}

// Create button elements
const FormulaBtn = (props) => {
  return (
    <TouchableOpacity style={styles.formula_btn} onPress={props.onPress}>
      <Text style={styles.formula_btn_text}>{props.text}</Text>
    </TouchableOpacity>
  );
}
const ArbitBtn = (props) => {
  return (
    <TouchableOpacity style={styles.arbit_btn} onPress={props.onPress}>
      <Text style={styles.arbit_btn_text}>{props.text}</Text>
    </TouchableOpacity>
  );
}

// Create Triangle elements
const TriangleUp = (props) => {
  return <View style={[styles.triangle, props.style]} onPress={props.onPress}/>;
};
const TriangleDown = (props) => {
  return <TriangleUp style={[{transform: [{rotate: "180deg"}]}, props.style]} onPress={props.onPress}/>;
}
const TriangleLeft = (props) => {
  return <TriangleUp style={[{transform: [{rotate: "-90deg"}]}, props.style]} onPress={props.onPress}/>;
}
const TriangleRight = (props) => {
  return <TriangleUp style={[{transform: [{rotate: "90deg"}]}, props.style]} onPress={props.onPress}/>;
}

const styles = StyleSheet.create({
	// Environment
	environment: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "center",
		backgroundColor: "grey",
	},
	sidebar: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "center",
	},
	main: {
		flex: 9,
		flexDirection: "column",
		justifyContent: "center",
	},

	// Upper container
	upper_container: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 100,
		// width: "100%",
		backgroundColor: "grey",
	},
	display_screen: {
		width: "90%",
		height: 100,
		padding: 10,
		borderWidth: 2,
		backgroundColor: "white",
		// alignItems: "center",
		// justifyContent: "center",
	},
	input_row: {
		flex: 1,
		backgroundColor: "white",
		alignItems: "flex-start",
		justifyContent: "center",
	},
  char_block: {
    justifyContent: "center",
    alignItems: "center",
  },
	char_text: {
		fontSize: 30,
		fontWeight: 'bold',
	},
	output_row: {
		flex: 1,
		backgroundColor: "white",
		alignItems: "flex-end",
		justifyContent: "center",
	},
	output_ans: {
		fontSize: 30,
		fontWeight: 'bold',
	},
  control_bar: {

  },

  // Middle container
  mid_container: {
    flex: 1,
    flexDirection: "row",
    // backgroundColor: "red"
  },
  mid_subcontainer: {
    flex: 1,
    borderWidth: 1,
  },
  mid_row: {
    flex: 1,
    flexDirection: "row",
  },
  mid_large_row: {
    flex: 2,
    flexDirection: "row",
  },
  mid_row_side: {
    flex: 1,
  },
  mid_row_center: {
    flex: 2,
    justifyContent: "center",
    alignContent: "center",
    borderWidth: 1,
    borderColor: "blue",
  },
  mid_column: {
    flex: 1,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "blue",
  },
  mid_large_column: {
    flex: 2,
  },

	// Lower container
	lower_container: {
		flex: 4,
		flexDirection: "column",
		padding: 5,
		// justifyContent: "flex-end",
		backgroundColor: "white",
	},
	btn_container: {
		// flex: 1,
		flexDirection: "column",
	},
	btn_row: {
		flexDirection: "row",
	},
	formula_btn: {
		backgroundColor: "grey",
		flex: 1,
		height: 40,
		margin: 2,
		borderWidth: 2,
		justifyContent: "center",
		alignItems: "center",
	},
	arbit_btn: {
		backgroundColor: "black",
		flex: 1,
		height: 50,
		margin: 2,
		borderWidth: 2,
		justifyContent: "center",
		alignItems: "center",
	},
	formula_btn_text: {
		color: "white",
		fontSize: 16,
	},
	arbit_btn_text: {
		color: "white",
		fontSize: 30,
	},

  // Shapes
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 30,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "black",
    alignSelf: "center",
  },
})