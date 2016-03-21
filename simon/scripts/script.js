(function ($) {
  'use strict';

  var $buttons = $('.button');

  function TimeoutHandleContext() {
    var handles = [];
    
    function add(handle) {
      handles.push(handle);
    }

    function clear() {
      while (handles.length > 0) {
        clearTimeout(handles.pop());
      }
    }
    
    return {
      add: add,
      clear: clear
    };
  }

  function UserContext(selectionFn, timedoutFn) {
    var
      timeoutHandleContext = new TimeoutHandleContext(),
      isUserInput = false;

    function init() {
      $buttons.on('click', function () {
        if (isUserInput) {
          timeoutHandleContext.clear();
          selectionFn(this);
        }
      });
    }

    function activate() {
      isUserInput = true;
      $buttons.addClass('active');
    }

    function deactivate() {
      isUserInput = false;
      $buttons.removeClass('active');
      timeoutHandleContext.clear();
    }

    function waitForUserSelection(timeout) {
      if (isUserInput) {
        timeoutHandleContext.add(setTimeout(function () {
          timedoutFn();
        }, timeout));
      }
    }

    function reset() {
      isUserInput = false;
      timeoutHandleContext.clear();
    }

    init();

    return {
      activate: activate,
      deactivate: deactivate,
      waitForUserSelection: waitForUserSelection,
      reset: reset
    };
  }

  function AudioContext(url) {
    var audio;
    
    function init() {
      audio = new window.Audio(url);
      audio.loop = true;
    }
    
    function stop() {
      audio.currentTime = 0;
      audio.pause();
    }

    function play(time) {
      audio.play();
      setTimeout(function () {
        stop();
      }, time);
    }

    init();

    return {
      play: play
    };
  }

  function ButtonContext() {
    var colorButtons = [],
      audioURL = [
        'http://soundbible.com/mp3/Metal_Gong-Dianakc-109711828.mp3',
        'http://soundbible.com/mp3/Electronic_Chime-KevanGC-495939803.mp3',
        'http://soundbible.com/mp3/A-Tone-His_Self-1266414414.mp3',
        'http://soundbible.com/mp3/TV Off Air-SoundBible.com-2131365426.mp3'/*
        'https://s3.amazonaws.com/freecodecamp/simonSound1.mp3',
        'https://s3.amazonaws.com/freecodecamp/simonSound2.mp3',
        'https://s3.amazonaws.com/freecodecamp/simonSound3.mp3',
        'https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'*/
      ];

    function init() {
      $.each($buttons, function (index, value) {
        var btn = {};
        btn.elem = value;
        btn.audio = new AudioContext(audioURL[index]);
        colorButtons.push(btn);
      });
    }
  
    function getButton(index) {
      if (index >= 0 && index < colorButtons.length) {
        return colorButtons[index];
      }
  
      return null;
    }
  
    function getButtonFor(element) {
      var i;
      for (i = 0; i < colorButtons.length; i += 1) {
        if (colorButtons[i].elem === element) {
          return colorButtons[i];
        }
      }
  
      return null;
    }

    function hightlightButton(btn, time, alternateAudio) {
      var $btn = $(btn.elem),
        audio = alternateAudio || btn.audio;

      $btn.addClass('selected');
      audio.play(time);
      setTimeout(function () {
        $btn.removeClass('selected');
      }, time);
    }

    init();

    return {
      getButton: getButton,
      getButtonFor: getButtonFor,
      hightlightButton: hightlightButton
    };
  }

  function StepContext(btnContext) {
    var currentStep = 0,
      steps = [0],
      timeoutHandleContext = new TimeoutHandleContext();

    function addStep() {
      steps[currentStep] = btnContext.getButton(Math.floor(Math.random() * 4));
      currentStep += 1;
    }

    function runStep(index, stepTime, resolveFn) {
      btnContext.hightlightButton(steps[index], stepTime);
      timeoutHandleContext.add(setTimeout(function () {
        index += 1;
        if (index < currentStep) {
          runStep(index, stepTime, resolveFn);
        } else {
          resolveFn(true);
        }
      }, stepTime + 500));
    }

    function runWithDeferred(stepTime) {
      var dfd = $.Deferred();

      setTimeout(function () {
        runStep(0, stepTime, dfd.resolve);
      }, 100);

      return dfd.promise();
    }

    function run(stepTime) {
      if (window.hasOwnProperty('Promise')) {
        return new window.Promise(function (resolve, reject) {
          runStep(0, stepTime, resolve);
        });
      }

      return runWithDeferred(stepTime);
    }

    function totalSteps() {
      return currentStep;
    }

    function reset() {
      timeoutHandleContext.clear();
      currentStep = 0;
    }

    function getStepButton(index) {
      return steps[index];
    }
  
    return {
      reset: reset,
      addStep: addStep,
      totalSteps: totalSteps,
      getStepButton: getStepButton,
      run: run
    };
  }
  
  function Game() {
    var
      WIN_STEP = 20,
      isStrictMode,
      isOn,
      stepIndex,
      userContext,
      buttonContext,
      stepContext,
      timeoutHandleContext,
      errorAudio,
      winAudio,
      $counter;

    function reset() {
      timeoutHandleContext.clear();
      stepContext.reset();
      userContext.reset();
      $counter.html('--');
    }
    
    function switchOff() {
      reset();
      isStrictMode = false;
      $('#mode').removeClass('active');
    }
  
    function toggleSwitch() {
      isOn = !isOn;
      if (!isOn) {
        switchOff();
      }
    }

    function toggleStrictMode() {
      if (isOn) {
        isStrictMode = !isStrictMode;
      }
    }

    function activateUserSelection() {
      if (isOn) {
        stepIndex = 0;
        userContext.activate();
      }
    }

    function getSeriesTime(seriesIndex) {
      if (seriesIndex < 5) {
        return 750;
      }
      
      if (seriesIndex < 10) {
        return 500;
      }
      
      if (seriesIndex < 13) {
        return 400;
      }
      
      return 250;
    }

    function animateCounter() {
      $counter.addClass('animate');
      setTimeout(function () {
        $counter.removeClass('animate');
      }, 1000);
    }

    function runStep() {
      var stepIndex = stepContext.totalSteps();
      $counter.html(("0" + stepIndex).slice(-2));
      stepContext.run(getSeriesTime(stepIndex))
        .then(function (response) {
          activateUserSelection();
          userContext.waitForUserSelection(3000);
        });
    }

    function nextStep() {
      stepContext.addStep();
      runStep();
    }

    function gameWon() {
      stepContext.reset();
      $counter.html('##');
      animateCounter();
      winAudio.play(2000);
    }

    function handleError() {
      if (isStrictMode) {
        stepContext.reset();
        nextStep();
      } else {
        runStep();
      }
    }

    function userTimedOut() {
      userContext.deactivate();
      $counter.html('!!');
      animateCounter();
      errorAudio.play(1000);
      timeoutHandleContext.add(setTimeout(function () {
        handleError();
      }, 1500));
    }

    function userSelectionError(btn) {
      userContext.deactivate();
      $counter.html('!!');
      buttonContext.hightlightButton(btn, 1000, errorAudio);
      animateCounter();
      timeoutHandleContext.add(setTimeout(function () {
        handleError();
      }, 2000));
    }

    function userSelectionSuccess(btn) {
      stepIndex += 1;
      buttonContext.hightlightButton(btn, 500);
      timeoutHandleContext.add(setTimeout(function () {
        if (stepIndex < stepContext.totalSteps()) {
          userContext.waitForUserSelection(3000);
        } else {
          userContext.deactivate();
          if (stepIndex === WIN_STEP) {
            gameWon();
          } else {
            timeoutHandleContext.add(setTimeout(function () {
              nextStep();
            }, 1000));
          }
        }
      }, 500));
    }

    function userSelection(btnElem) {
      var btn = stepContext.getStepButton(stepIndex),
        selectedBtn = buttonContext.getButtonFor(btnElem);

      if (btn === selectedBtn) {
        userSelectionSuccess(btn);
      } else {
        userSelectionError(selectedBtn);
      }
    }

    function start() {
      if (isOn) {
        reset();
        animateCounter();
        timeoutHandleContext.add(setTimeout(function () {
          nextStep();
        }, 1000));
      }
    }

    function prepareEvents() {
      $('input[type="checkbox"]').on('click', function (e) {
        var isON = $(this).prop('checked');
        $(this).parent().toggleClass('checked', isON);
        $counter.toggleClass('active');
        toggleSwitch();
      });

      $('#mode').click(function () {
        if (isOn) {
          isStrictMode = !isStrictMode;
          $(this).toggleClass('active');
        }
      });
    
      $('#start').click(function () {
        start();
      });
    }

    function init() {
      $counter = $('#counter');
      isStrictMode = false;
      isOn = false;
      buttonContext = new ButtonContext();
      timeoutHandleContext = new TimeoutHandleContext();
      stepContext = new StepContext(buttonContext);
      userContext = new UserContext(userSelection, userTimedOut);
      winAudio = new AudioContext('http://soundbible.com/mp3/Ta Da-SoundBible.com-1884170640.mp3');
      errorAudio = new AudioContext('http://www.oringz.com/oringz-uploads/sounds-917-communication-channel.mp3');
      prepareEvents();
    }

    return {
      ready: init
    };
  }

  $(function () {
    var game = new Game();
    game.ready();
  });

}(window.jQuery));