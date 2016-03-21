(function ($) {
  'use strict';

  var
    isValid = true,
    audio = new window.Audio('http://www.oringz.com/oringz-uploads/sounds-917-communication-channel.mp3'),
    operands,
    showUnaryResult = true,
    lastTokenType = null,
    currentOperationName,
    finalResult,
    calculator;

  /**
   * Stack
   */
  function Stack() { }
  Stack.prototype.length = 0;
  
  Stack.prototype.push = function (val) {
    Array.prototype.push.apply(this, arguments);
  };

  Stack.prototype.pop = function (val) {
    return Array.prototype.pop.apply(this, arguments);
  };
  
  Stack.prototype.peek = function (val) {
    if (this.length > 0) {
      return this[this.length - 1];
    }
  };

  Stack.prototype.isEmpty = function () {
    return this.length === 0;
  };

  Stack.prototype.clear = function () {
    this.length = 0;
  };

  Stack.prototype.size = function () {
    return this.length;
  };
  
  /**
   * Calculator
   */
  function Calculator() { }
  
  Calculator.prototype.add = function (a, b) {
    return a + b;
  };
  
  Calculator.prototype.subtract = function (a, b) {
    return a - b;
  };
  
  Calculator.prototype.multiply = function (a, b) {
    return a * b;
  };
  
  Calculator.prototype.divide = function (a, b) {
    return a / b;
  };
  
  Calculator.prototype.negate = function (a) {
    return -a;
  };
  
  Calculator.prototype.sqrt = function (a) {
    return Math.sqrt(a);
  };

  /**
   * Convert a string to a number. Eliminate
   * the fraction if it's all zeros.
   */
  function parseNumber(value) {
    var fraction, index = value.indexOf(".");

    if (index === -1) {
      return parseInt(value, 10);
    }
    
    fraction = value.substring(index + 1, value.length);
    if (parseInt(fraction, 10) === 0) {
      return parseInt(value.substring(0, index), 10);
    }

    return parseFloat(value);
  }

  function isResultValid(result) {
    return !isNaN(result) &&
      result !== Infinity &&
      result !== -Infinity;
  }

  function handleOperand(value) {
    var operand, finalValue = value;

    if (lastTokenType === 'unaryOperator' ||
        lastTokenType === 'operand') {
      operand = operands.pop() || '0';
      if (lastTokenType === 'operand') {
        if (operand !== '0') {
          finalValue = operand + value;
        }
      }
    }

    if (finalValue === '.') {
      finalValue = '0.';
    }

    operands.push(finalValue);
    showUnaryResult = true;
    return finalValue;
  }

  function handleUnaryOperator(operationName) {
    var operand, result;
    if (lastTokenType === 'binaryOperator') {
      operand = operands.peek();
    } else {
      operand = operands.pop() || finalResult || '0';
    }

    result = calculator[operationName](parseNumber(operand));
    isValid = isResultValid(result);
    if (isValid) {
      operands.push(result.toString());
    }

    if (showUnaryResult) {
      return result.toString();
    }
  }

  function performBinaryOperation(operationName) {
    var result,
      right = operands.pop(),
      left = operands.pop() || right;

    result = calculator[operationName](parseNumber(left), parseNumber(right));
    isValid = isResultValid(result);
    return result.toString();
  }

  function handleBinaryOperator(operationName) {
    var leftOperand, rightOperand, result;

    if (lastTokenType !== 'binaryOperator') {
      if (operands.isEmpty()) {
        operands.push(finalResult || '0');
      } else if (operands.size() > 1) {
        result = performBinaryOperation(currentOperationName);
        operands.push(result);
      }
    }

    showUnaryResult = false;
    currentOperationName = operationName;
    return result;
  }

  function handleClearOperator() {
    currentOperationName = null;
    showUnaryResult = isValid = true;
    finalResult = undefined;
    operands.clear();

    return "0";
  }

  function handleResultOperator() {
    if (currentOperationName !== null) {
      finalResult = performBinaryOperation(currentOperationName);
      currentOperationName = null;
    } else {
      finalResult = operands.pop() || finalResult || '0';
    }

    showUnaryResult = true;
    return finalResult;
  }

  function performAction($elem, $display) {
    var result,
      tokenType = $elem.attr('data-token-type');

    if (!isValid && tokenType !== 'clearOperator') {
      audio.play();
      return;
    }

    switch (tokenType) {
    case 'operand':
      result = handleOperand($elem.text());
      break;
    case 'unaryOperator':
      result = handleUnaryOperator($elem.attr('data-operation-name'));
      break;
    case 'binaryOperator':
      result = handleBinaryOperator($elem.attr('data-operation-name'));
      break;
    case 'clearOperator':
      result = handleClearOperator();
      break;
    case 'resultOperator':
      result = handleResultOperator();
      break;
    default:
      break;
    }

    lastTokenType = tokenType;
    if (isValid) {
      if (!!result) {
        $display.html(result);
      }
    } else {
      $display.html('Result is undefined');
      audio.play();
    }
  }

  $(function () {
    calculator = new Calculator();
    operands = new Stack();
    $('.calculator').on('click', 'a.button', function () {
      performAction($(this), $('.display'));
    });
  });

}(window.jQuery));