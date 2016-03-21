/*jslint devel: true*/
var netlightened = netlightened || {};

(function () {
  'use strict';
  
  netlightened.Board = function () {
    var remaining = 9,
      board = [null, null, null, null, null, null, null, null, null];
  
    function reset() {
      if (board.fill) {
        board.fill(false);
      } else {
        board = [false, false, false, false, false, false, false, false, false];
      }
      remaining = 9;
    }
  
    function getAvailableSquares() {
      return board.reduce(function (prev, curr, index) {
        if (!curr) {
          prev.push(index);
        }
        return prev;
      }, []);
    }
    
    function getAvailableSquaresCount() {
      return remaining;
    }
  
    function occupySquare(pos) {
      if (pos < 0 || pos > 8) {
        throw "Invalid square position: " + pos;
      }
    
      board[pos] = true;
      remaining -= 1;
    }

    function isSquareOccupied(pos) {
      if (pos < 0 || pos > 8) {
        throw "Invalid square position: " + pos;
      }

      return !!board[pos];
    }

    function getNextAvailableSquare(excludeSeq) {
      var i;
      for (i = 0; i < board.length; i += 1) {
        if (!board[i] && (!excludeSeq || excludeSeq.indexOf(i) === -1)) {
          return i;
        }
      }
    
      return -1;
    }
    
    return {
      reset: reset,
      occupySquare: occupySquare,
      isSquareOccupied: isSquareOccupied,
      getNextAvailableSquare: getNextAvailableSquare,
      getAvailableSquares: getAvailableSquares,
      getAvailableSquaresCount: getAvailableSquaresCount
    };
  };
}());