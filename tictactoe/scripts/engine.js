/*jslint browser: true, devel: true, plusplus: true*/
var netlightened = netlightened || {};

(function () {
  'use strict';

  var
    TRAP_POSITIONS = [0, 2, 4, 6, 8],
    WIN_SEQUENCE = [
      [0, 1, 2], [0, 3, 6], [0, 4, 8],
      [1, 4, 7], [2, 4, 6], [2, 5, 8],
      [3, 4, 5], [6, 7, 8]
    ];

  netlightened.CPUEngine = function () {
    var
      ownWinMoves = [],
      userWinMoves = [],
      level = 1;

    function cloneWinSequence() {
      return WIN_SEQUENCE.map(function (seq) {
        return seq.slice();
      });
    }

    function flattenSequence(arr) {
      return arr.reduce(function (prev, curr) {
        return prev.concat(curr);
      }, []);
    }

    function pickMoveFrom(arr) {
      if (arr.length === 0) {
        return -1;
      }

      return arr[Math.floor(Math.random() * arr.length)];
    }

    function winSquare(moves, pos) {
      var index;
      moves.forEach(function (seq) {
        index = seq.indexOf(pos);
        if (index !== -1) {
          seq.splice(index, 1);
        }
      });
    }

    function loseSquare(moves, pos) {
      var i = 0;
      while (i < moves.length) {
        if (moves[i].indexOf(pos) !== -1) {
          if (i === 0) {
            moves.shift();
          } else {
            moves.splice(i, 1);
          }
        } else {
          ++i;
        }
      }
    }

    /**
     * Find a sequence that has only one square position remaining
     */
    function findOneWinPosition(moves) {
      var i;
      for (i = 0; i < moves.length; ++i) {
        if (moves[i].length === 1) {
          return moves[i][0];
        }
      }

      return -1;
    }

    // A digonal sequence is one of the following:
    // 1. 0->4->8
    // 2. 2->4->6
    // 3. 0->4
    // 4. 4->8
    // 5. 0->8
    // 6. 2->4
    // 7. 4->6
    // 8. 2->6
    function isDiagonalSeq(seq) {
      if (seq.length < 2) {
        return false;
      }

      if (seq.length === 3) {
        return ((seq[0] + seq[1] === seq[2])
                || (seq[2] - seq[0] - seq[1] === 4));
      }

      return ((seq[0] === 0 && (seq[1] === 4 || seq[1] === 8))
              || (seq[0] === 2 && (seq[1] === 4 || seq[1] === 6))
              || (seq[0] === 4 && (seq[1] === 6 || seq[1] === 8)));
    }

    function hasDiagonalWinSequence(moves) {
      var i, j, seq;

      for (i = 0; i < ownWinMoves.length; ++i) {
        seq = ownWinMoves[i];
        if (seq.length >= moves.length && isDiagonalSeq(seq)) {
          for (j = 0; j < moves.length; ++j) {
            if (seq.indexOf(moves[j]) === -1) {
              break;
            }
          }

          // found a match
          if (j === moves.length) {
            return true;
          }
        }
      }

      return false;
    }

    function evaluateUserTrapMoves(board, moves) {
      switch (moves.length) {
      case 0:
        return -1;
      case 1:
        return moves[0];
      case 2:
        // If it't a diagonal sequene, make sure that the
        // the cpu does not have the same win sequence in
        // its list of moves.
        if (isDiagonalSeq(moves) && hasDiagonalWinSequence(moves)) {
          return board.getNextAvailableSquare(moves);
        } else {
          return pickMoveFrom(moves);
        }
      default:
        return pickMoveFrom(moves);
      }
    }

    function hasWinningSequences(moves, seqList) {
      var i, j, seq, matchList = seqList.slice();

      if (matchList.fill) {
        matchList.fill(0);
      } else {
        for (i = 0; i < matchList.length; ++i) {
          matchList[i] = 0;
        }
      }

      for (i = 0; i < moves.length && matchList.indexOf(0) !== -1; ++i) {
        seq = moves[i].join('');
        for (j = 0; j < seqList.length; j++) {
          if (!!!matchList[j] && seq === seqList[j]) {
            // Each element in the seqList is unique
            matchList[j] = 1;
            break;
          }
        }
      }

      return matchList.indexOf(0) === -1;
    }

    function hasFullWinningSequence(winSeqCollection, position) {
      var i;
      
      for (i = 0; i < winSeqCollection.length; ++i) {
        if (winSeqCollection[i].length === 3 &&
            winSeqCollection[i].indexOf(position) >= 0) {
          return true;
        }
      }
  
      return false;
    }

    function findInDirectTrapMoves(moves, traps) {
      var condition = {},
        counter = {},
        trapPositions = [],
        edgeTrapPositions = [];

      // To use when we are dealing with a diagonal winning sequence
      condition.hasXYSeqFor4 = hasWinningSequences(moves, ["147", "345"]);
      condition.hasDoubleDiagonal = hasWinningSequences(moves, ["08", "26"]);

      traps.forEach(function (trapPos) {
        condition.hasDiagonalSeq = false;
        counter.oneWinCount = counter.twoWinCount = counter.twoWinXYAxisCount = 0;
        condition.potentialPos = null;
        moves.forEach(function (seq) {
          if (seq.indexOf(trapPos) === -1) {
            return;
          }

          if (seq.length === 2) {
            if (!isDiagonalSeq(seq)) {
              ++counter.oneWinCount;
              // We could also trap with the first position, e.g. if we
              // have a seq of 1 and 2, 1 could also trap the user, if
              // we have winning sequences of 2,5,8 and 1,4,7.
              condition.potentialPos = (seq[0] === trapPos) ? seq[1] : seq[0];
            } else {
              // If the sequence is a digonal, make sure that we have a
              // double diagonal sequence, or if the sequence contains 4,
              // that we have winning sequences accros the x and y axis
              // of 4.
              condition.hasDiagonalSeq = true;
              if ((seq.indexOf(4) !== -1 && condition.hasXYSeqFor4) || condition.hasDoubleDiagonal) {
                ++counter.oneWinCount;
              }
            }
          } else if (seq.length === 3) {
            ++counter.twoWinCount;
            // Keep track of number of winning sequences along the x/y
            // axis. We will use it as a fallback if we have at least 2.
            if (seq.indexOf(4) === -1) {
              ++counter.twoWinXYAxisCount;
            } else {
              condition.hasDiagonalSeq = true;
            }
          }
        });

        // we found a trap move
        if (counter.oneWinCount > 0 && counter.twoWinCount > 0 && (condition.hasDiagonalSeq || condition.hasXYSeqFor4)) {
          trapPositions.push(trapPos);
          if (condition.potentialPos &&
              counter.twoWinXYAxisCount > 0 &&
              hasFullWinningSequence(moves, condition.potentialPos)) {
            trapPositions.push(condition.potentialPos);
          }
        } else if (counter.twoWinXYAxisCount > 1) {
          edgeTrapPositions.push(trapPos);
        }
      });

      // If we do not find trap positions, use the fall back positions. It
      // might lead to a trap if the user makes the wrong selection.
      if (trapPositions.length > 0) {
        return trapPositions;
      }

      return edgeTrapPositions;
    }

    function findPotentialTrapMoves(moves, includeIndirect) {
      var potentialTraps = [],
        highestCount = 0,
        countArr = TRAP_POSITIONS.slice(),
        trapMoves = {
          direct: [],
          indirect: []
        };

      TRAP_POSITIONS.forEach(function (pos, index) {
        var oneWinCount = 0;
        countArr[index] = 0;
        moves.forEach(function (seq) {
          if (seq.indexOf(pos) > -1/* &&
              (pos !== 4 || isDiagonalSeq(seq))*/) {
            countArr[index] += 1;
            highestCount = Math.max(highestCount, countArr[index]);
            if (seq.length === 2) {
              ++oneWinCount;
            }
          }
        });

        if (oneWinCount > 1) {
          trapMoves.direct.push(pos);
        }
      });

      // We did not find direct traps, look for indirect traps
      if (includeIndirect
          && trapMoves.direct.length === 0
          && highestCount > 0) {
        potentialTraps = TRAP_POSITIONS.filter(function (pos, index) {
          return pos !== 4 && countArr[index] > 1;
        });
        trapMoves.indirect = findInDirectTrapMoves(moves, potentialTraps);
      }

      return trapMoves;
    }

    function findPotentialTrapMovesOld(moves, includeIndirect) {
      var potentialTraps = [],
        highestCount = 0,
        countArr = TRAP_POSITIONS.slice(),
        trapMoves = {
          direct: [],
          indirect: []
        };

      TRAP_POSITIONS.forEach(function (pos, index) {
        var oneWinCount = 0;
        countArr[index] = 0;
        moves.forEach(function (seq) {
          if (seq.indexOf(pos) > -1 &&
              (pos !== 4 || isDiagonalSeq(seq))) {
            if (potentialTraps.indexOf(pos) === -1) {
              countArr[index] += 1;
              highestCount = Math.max(highestCount, countArr[index]);
            }
            if (seq.length - 1 === 1) {
              ++oneWinCount;
            }
          }
        });

        if (oneWinCount > 1) {
          trapMoves.direct.push(pos);
        }
      });

      // We did not find direct traps, look for indirect traps
      if (includeIndirect
          && trapMoves.direct.length === 0
          && highestCount > 0) {
        potentialTraps = TRAP_POSITIONS.filter(function (pos, index) {
          return countArr[index] === highestCount;
        });
        trapMoves.indirect = findInDirectTrapMoves(moves, potentialTraps);
      }

      //console.log("Direct: " + trapMoves.direct);
      //console.log("Indirect: " + trapMoves.indirect);
      return trapMoves;
    }

    function pickFromAWinningSequence() {
      var moves = ownWinMoves.filter(function (seq) {
        return seq.length === 2;
      });

      return pickMoveFrom(flattenSequence((moves.length > 0) ? moves : ownWinMoves));
    }

    function evaluateBestMove(board) {
      var bestMove,
        userTrapMoves,
        ownTrapMoves;

      // Check to see if cpu have one move to win the game
      bestMove = findOneWinPosition(ownWinMoves);
      if (bestMove !== -1) {
        return bestMove;
      }

      // Check to see if user has one move to win the game
      bestMove = findOneWinPosition(userWinMoves);
      if (bestMove !== -1) {
        return bestMove;
      }

      // Check for position that can lead to a double trap. If we have less
      // than 5 squares available a trap is not feasible.
      if (level === 3 && board.getAvailableSquaresCount() > 4) {
        // Check for user trap moves
        userTrapMoves = findPotentialTrapMoves(userWinMoves, false);
        if (userTrapMoves.direct.length > 0) {
          return evaluateUserTrapMoves(board, userTrapMoves.direct);
        }

        // Check for cpu trap moves
        ownTrapMoves = findPotentialTrapMoves(ownWinMoves, true);
        if (ownTrapMoves.direct.length > 0) {
          return pickMoveFrom(ownTrapMoves.direct);
        }

        if (ownTrapMoves.indirect.length > 0) {
          return pickMoveFrom(ownTrapMoves.indirect);
        }
      }

      // pick a position from a winning sequence
      if (ownWinMoves.length > 0) {
        return pickFromAWinningSequence();//pickMoveFrom(flattenSequence(ownWinMoves));
      }

      // no winning moves, probably a draw
      return board.getNextAvailableSquare();
    }

    function firstMove(board, prevPos) {
      if (prevPos === -1) {
        return pickMoveFrom([0, 2, 4, 6, 8]);
      }

      if (!board.isSquareOccupied(4)) {
        return 4;
      }

      return pickMoveFrom([0, 2, 6, 8]);
    }

    function nextMove(board, prevPos) {
      var move;

      if (prevPos !== -1) {
        loseSquare(ownWinMoves, prevPos);
        winSquare(userWinMoves, prevPos);
      }

      if (level === 1) {
        move = pickMoveFrom(board.getAvailableSquares());
      } else {
        if (board.getAvailableSquaresCount() >= 8) {
          move = firstMove(board, prevPos);
        } else {
          move = evaluateBestMove(board);
        }
      }

      winSquare(ownWinMoves, move);
      loseSquare(userWinMoves, move);

      return move;
    }

    function setDifficultyLevel(value) {
      switch (value.toLowerCase()) {
      case 'beginner':
        level = 1;
        break;
      case 'intermediate':
        level = 2;
        break;
      case 'expert':
        level = 3;
        break;
      default:
        console.log("Invalid difficulty level value: " + value);
        break;
      }
    }

    function reset() {
      ownWinMoves = cloneWinSequence();
      userWinMoves = cloneWinSequence();
    }

    return {
      reset: reset,
      nextMove: nextMove,
      setDifficultyLevel: setDifficultyLevel
    };
  };
}());