/*jslint browser: true, devel: true, bitwise: true, nomen: true, plusplus: true*/
var netlightened = netlightened || {};

// Game UI
(function ($) {
  'use strict';

  var $square = $('.square'),
    POSITION_WEIGHT = [1, 2, 4, 8, 16, 32, 64, 128, 256],
    WINNING_SEQUENCE = [ 7, 73, 273, 146, 84, 292, 56, 448 ];
  
  function UIPlayer($icon,
                    $score,
                    characterIcon) {
    var
      wins = 0,
      successFn,
      selectionPromise;

    function init() {
      selectionPromise = {
        done: function (fn) {
          successFn = fn;
        }
      };
      $icon.addClass(characterIcon);
    }

    function reset() {
      $square.removeClass(characterIcon);
    }

    function animate(flag) {
      if (flag) {
        $icon.addClass('animate');
      } else {
        $icon.removeClass('animate');
      }
    }

    function winner(message) {
      ++wins;
      $score.html(wins);
      alert(message);
    }

    function selection(pos) {
      animate(false);
      $('.square[data-id="' + pos + '"]').addClass('icon ' + characterIcon);
      successFn(pos);
    }

    function getPromise() {
      return selectionPromise;
    }

    init();

    return {
      reset: reset,
      animate: animate,
      winner: winner,
      selection: selection,
      getPromise: getPromise
    };
  }

  function UserUIPlayer(board) {
    var _super, isActive;

    function playErrorSound() {
      var audio = new window.Audio('http://www.oringz.com/oringz-uploads/sounds-917-communication-channel.mp3');

      audio.play();
    }

    function init() {
      var characterIcon = 'icon' + Math.floor(Math.random() * 9);
  
      _super = new UIPlayer($('#user-icon'),
                            $('#user-score'),
                            characterIcon);
      isActive = false;

      $('.board').on('click', '.square', function () {
        var pos = parseInt($(this).attr("data-id"), 10);

        if (isActive && !board.isSquareOccupied(pos)) {
          isActive = false;
          _super.selection(pos);
        } else {
          playErrorSound();
        }
      });
    }
    
    function winner() {
      _super.winner("Player Wins!!!!");
    }

    function makeSelection(board, prevPos) {
      setTimeout(function () {
        isActive = true;
        _super.animate(true);
      }, 100);
  
      return _super.getPromise();
    }

    init();

    return {
      reset: _super.reset,
      animate: _super.animate,
      winner: winner,
      getPromise: _super.getPromise,
      makeSelection: makeSelection
    };
  }

  function CPUUIPlayer() {
    var _super, cpuEngine;

    function init() {
      _super = new UIPlayer($('#cpu-icon'),
                            $('#cpu-score'),
                            'icon9');
      cpuEngine = new netlightened.CPUEngine();

      $('#level').on('change', function () {
        cpuEngine.setDifficultyLevel($(this).val());
      });
    }

    function winner() {
      _super.winner("CPU Wins!!!!");
    }

    function makeSelection(board, prevPos) {
      _super.animate(true);
      setTimeout(function () {
        _super.selection(cpuEngine.nextMove(board, prevPos));
      }, 500);
  
      return _super.getPromise();
    }

    function reset() {
      _super.reset();
      cpuEngine.reset();
    }

    init();

    return {
      reset: reset,
      animate: _super.animate,
      winner: winner,
      getPromise: _super.getPromise,
      makeSelection: makeSelection
    };
  }

  function Game() {
    var board = new netlightened.Board(),
      currentPlayer = 0,
      startingPlayer = -1,
      players = [],
      positions = [0, 0];

    function init() {
      players.push(new UserUIPlayer(board));
      players.push(new CPUUIPlayer());
      $('#level').val('beginner');
    }

    function switchStartingPlayer() {
      currentPlayer = startingPlayer = (startingPlayer + 1) % 2;
    }
    
    function switchPlayer() {
      currentPlayer = (currentPlayer + 1) % 2;
    }

    function hasPlayerWon() {
      var i, pos = positions[currentPlayer];
      
      for (i = 0; i < WINNING_SEQUENCE.length; ++i) {
        if ((pos & WINNING_SEQUENCE[i]) === WINNING_SEQUENCE[i]) {
          return true;
        }
      }

      return false;
    }

    function reset() {
      $square.removeClass('icon');
      board.reset();
      players[0].reset();
      players[1].reset();
      positions[0] = 0;
      positions[1] = 0;
    }

    function isGameOver() {
      if (hasPlayerWon()) {
        players[currentPlayer].winner();
        return true;
      } else if (!board.getAvailableSquaresCount()) {
        alert('A DRAW!!!');
        return true;
      }

      return false;
    }

    function startGame() {
      
      function run(prevPos) {
        players[currentPlayer].makeSelection(board, prevPos).done(function (pos) {
          board.occupySquare(pos);
          positions[currentPlayer] = POSITION_WEIGHT[pos] | positions[currentPlayer];
          if (isGameOver()) {
            setTimeout(function () {
              startGame();
            }, 100);
          } else {
            setTimeout(function () {
              switchPlayer();
              run(pos);
            }, 100);
          }
        });
      }

      reset();
      switchStartingPlayer();
      run(-1);
    }

    init();
    
    return {
      startGame: startGame
    };
  }

  $(function () {
    var game = new Game();
    game.startGame();
  });

}(window.jQuery));