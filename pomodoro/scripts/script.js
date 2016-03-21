(function () {
  'use strict';

  function Clock() {
    var
      totalSeconds = 0,
      hours = 0,
      minutes = 0,
      seconds = 0;

    /**
     * Add a preceding zero if the value for hours,
     * minutes, or seconds has a single digit
     */
    function formatNumber(num) {
      return ('0' + num).slice(-2);
    }
    
    /**
     * Calculate the hours, minutes and seconds based
     * on the total number of seconds.
     */
    function calculateTime() {
      hours = Math.floor(totalSeconds / 3600);
      minutes = Math.floor((totalSeconds % 3600) / 60);
      seconds = (totalSeconds % 3600) % 60;
    }
    
    /**
     * Set the countdown time in minutes
     */
    function setCountdownTime(mins) {
      totalSeconds = mins * 60;
      calculateTime();
    }

    /**
     * Tick down the timer by 1 second
     */
    function tickDown() {
      if (totalSeconds > 0) {
        totalSeconds -= 1;
        calculateTime();
      }
    }

    /**
     * Return current tick time as hhmmss
     */
    function currentTime() {
      // always show minutes and seconds
      var str = formatNumber(minutes) + formatNumber(seconds);

      if (hours > 0) {
        str = formatNumber(hours) + str;
      }

      return str;
    }

    function timeElapsed() {
      return totalSeconds === 0;
    }

    return {
      setCountdownTime: setCountdownTime,
      tickDown: tickDown,
      timeElapsed: timeElapsed,
      currentTime: currentTime
    };
  }

  function SessionTimer(name, defaultTime) {
    var
      time = defaultTime,
      clock = new Clock();

    function reset() {
      clock.setCountdownTime(time);
    }

    function setTime(newTime) {
      time = newTime;
      reset();
    }

    function getClockTime() {
      return clock.currentTime();
    }

    function getName() {
      return name;
    }
    
    function tick() {
      clock.tickDown();
    }

    function countdownReached() {
      return clock.timeElapsed();
    }

    reset();

    return {
      reset: reset,
      getName: getName,
      setTime: setTime,
      tick: tick,
      countdownReached: countdownReached,
      getClockTime: getClockTime
    };
  }

  function Pomodoro() {
    var
      DIGIT_NAMES = [
        "zero", "one", "two", "three", "four",
        "five", "six", "seven", "eight", "nine"
      ],
      digits_div = [],
      sessions = [],
      defaultSettings = {},
      currentSession = 0,
      audio,
      intervalHandle;

    function fillDigitElements() {
      var i, elems = document.querySelectorAll('.digits div');
      for (i = 0; i < elems.length; i += 1) {
        if (elems.item(i).className !== 'dots') {
          digits_div.push(elems.item(i));
        }
      }
    }

    function displayTime() {
      var i,
        digits = sessions[currentSession].getClockTime().split('');
  
      for (i = 0; i < digits.length; i += 1) {
        digits_div[i].className = DIGIT_NAMES[digits[i]];
      }
    }

    function fireAlarm() {
      var alarm = document.querySelector('#alarm');
  
      audio.play();
      alarm.className = "animated shake";
      setTimeout(function () {
        alarm.className = "";
      }, 2000);
    }
    
    function switchSession() {
      var session = sessions[currentSession];
      
      session.reset();
      document.querySelector('[title="' +
                             session.getName() +
                             '"]').className = "button";

      currentSession = (currentSession + 1) % 2;
      session = sessions[currentSession];
      document.querySelector('[title="' +
                             session.getName() +
                             '"]').className = "button active";
      document.querySelector('#session')
        .innerHTML = session.getName();
      displayTime();
    }

    function countDown() {
      if (sessions[currentSession].countdownReached()) {
        clearInterval(intervalHandle);
        fireAlarm();
        setTimeout(function () {
          switchSession();
          intervalHandle = setInterval(countDown, 1000);
        }, 2000);
      } else {
        sessions[currentSession].tick();
        displayTime();
      }
    }

    function startCountDown() {
      intervalHandle = setInterval(countDown, 1000);
    }

    function prepareEentHandlers() {
      var startButton, workButton, breakButton;

      document.querySelector('.buttons').onclick = function (evt) {
        var target = evt.target,
          title = target.getAttribute('title'),
          session = sessions[currentSession];
        
        switch (title) {
        case 'Start':
          if (target.className.split(' ').indexOf('active') === -1) {
            target.className = "button active";
            startCountDown();
          }
          break;
        case 'Stop':
          if (intervalHandle !== null) {
            clearInterval(intervalHandle);
            intervalHandle = null;
            document.querySelector('[title=Start]')
              .className = "button";
          }
          break;
        case 'Reset':
          session.reset();
          displayTime();
          break;
        case 'Work Session':
        case 'Break Session':
          if (title !== session.getName()) {
            switchSession();
          }
          break;
        default:
          break;
        }
      };
    }

    function init() {
      audio = document.querySelector('audio');
      defaultSettings["Work Session"] = 25;
      defaultSettings["Break Session"] = 5;
      sessions.push(new SessionTimer("Work Session", 25));
      sessions.push(new SessionTimer("Break Session", 5));
      fillDigitElements();
      prepareEentHandlers();
    }

    init();

    return {
      displayTime: displayTime
    };
  }

  var pomodoro = new Pomodoro();
  pomodoro.displayTime();

}());