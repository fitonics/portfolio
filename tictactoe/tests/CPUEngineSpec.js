describe("CPU Engine", function () {
  var board, engine;

  beforeEach(function () {
	board = new netlightened.Board();
    engine = new netlightened.CPUEngine();
  });

  /** Apply to all levels */
  describe("when user selects a square", function () {
    it('cpu should select a different square', function () {
	  board.occupySquare(4);
      expect(engine.nextMove(board, 4)).not.toBe(4);
    });
  });

  /* difficulty level beginner - cpu selects squares randomly */
  describe("when playing with level beginner", function () {
	beforeEach(function() {
	  engine.reset();
	  board.reset();
      engine.setDifficultyLevel('beginner');  
	});

    it('first move should pick a random square', function () {
      expect(engine.nextMove(board, -1)).toMatch(/[0-8]/);
    });

	it('subsequent moves should be random', function () {
	  var userMove = 0, cupMove = -1;
	  /* user selects square 0 */
	  board.occupySquare(userMove);
	  
	  /* cpu makes a selection */
      cpuMove = engine.nextMove(board, userMove);
	  board.occupySquare(cpuMove);
	  expect(cpuMove).toMatch(/[1-8]/);

	  /* user makes the next selection */
	  if (cpuMove !== 8) {
		userMove = 4;
	  } else {
		userMove = 1;
	  }
	  board.occupySquare(userMove);

	  /* cpu makes next selection */
	  cpuMove = engine.nextMove(board, userMove);
	  board.occupySquare(cpuMove);
	  expect(cpuMove).not.toBe(0);
	  expect(cpuMove).not.toBe(userMove);
	});
  });

  /* difficulty level intermediate - cpu does not check for trap moves */
  describe("when playing with level intermediate", function () {
	beforeEach(function() {
	  engine.reset();
	  board.reset();
      engine.setDifficultyLevel('intermediate');
	});

	function selectSquare1(userSelection1, userSelection2, expectedCPUSelection) {
      board.occupySquare(userSelection1);
	  expect(engine.nextMove(board, userSelection1)).toBe(4);
	  board.occupySquare(userSelection2);
	  expect(engine.nextMove(board, userSelection2)).toBe(expectedCPUSelection);
	}

	function selectSquare2(userSelection1, userSelection2, expectedCPUSelection) {
      board.occupySquare(userSelection1);
	  expect(engine.nextMove(board, userSelection1)).toMatch(/[0268]/);
	  board.occupySquare(userSelection2);
	  expect(engine.nextMove(board, userSelection2)).toBe(expectedCPUSelection);
	}

    it('first move should be from [0, 2, 4, 6, 8] if board is empty', function () {
      expect(engine.nextMove(board, -1)).toMatch(/[0, 2, 4, 6, 8]/);
    });

	it('first move should be 4 if user selects a different square position', function () {
	  [0, 1, 2, 3, 5, 6, 7, 8].forEach(function(value) {
		 expect(engine.nextMove(board, value)).toBe(4);
	  });
    });
	
	it('first move should be from [0, 2, 6, 8] if user selects square 4', function () {
	  board.occupySquare(4);
	  expect(engine.nextMove(board, 4)).toMatch(/[0, 2, 6, 8]/);
    });	

	it('cpu should select square 2 if user selects squares 0 and 1', function () {
	  selectSquare1(0, 1, 2);
	});

	it('cpu should select square 0 if user selects squares 1 and 2', function () {
	  selectSquare1(1, 2, 0);
	});

	it('cpu should select square 1 if user selects squares 0 and 2', function () {
      selectSquare1(0, 2, 1);
	});

	it('cpu should select square 6 if user selects squares 0 and 3', function () {
      selectSquare1(0, 3, 6);
	});
	
	it('cpu should select square 0 if user selects squares 3 and 6', function () {
      selectSquare1(3, 6, 0);
	});
	
	it('cpu should select square 3 if user selects squares 0 and 6', function () {
	  selectSquare1(0, 6, 3);
	});

	it('cpu should select square 8 if user selects squares 2 and 5', function () {
	  selectSquare1(2, 5, 8);
	});
	
	it('cpu should select square 2 if user selects squares 5 and 8', function () {
	  selectSquare1(5, 8, 2);
	});
	
	it('cpu should select square 5 if user selects squares 2 and 8', function () {
	  selectSquare1(8, 2, 5);
	});
	
	it('cpu should select square 8 if user selects squares 6 and 7', function () {
	  selectSquare1(6, 7, 8);
	});
	
	it('cpu should select square 6 if user selects squares 7 and 8', function () {
	  selectSquare1(7, 8, 6);
	});
	
	it('cpu should select square 7 if user selects squares 6 and 8', function () {
	  selectSquare1(8, 6, 7);
	});

	it('cpu should select square 7 if user selects squares 4 and 1', function () {
	  selectSquare2(4, 1, 7);
	});

	it('cpu should select square 1 if user selects squares 4 and 7', function () {
	  selectSquare2(4, 7, 1);
	});

	it('cpu should select square 5 if user selects squares 4 and 3', function () {
	  selectSquare2(4, 3, 5);
	});

	it('cpu should select square 3 if user selects squares 4 and 5', function () {
	  selectSquare2(4, 5, 3);
	});

	it('cpu should select the winning square', function () {
	  var userMove, cpuFirstMove, cpuSecondMove, cpuThirdMove;
	  
	  function getFinalWinningMove(arr, move) {
	    var index = arr.indexOf(move);
		return ((index % 2) === 0) ? arr[index + 1] : arr[index - 1];
	  }

      /* CPU makes first selection */	  
	  cpuFirstMove = engine.nextMove(board, -1);
	  board.occupySquare(cpuFirstMove);

	  /* User makes first selection */
	  board.occupySquare(1);

	  /* CPU makes second selection */
	  cpuSecondMove = engine.nextMove(board, 1);
	  switch (cpuFirstMove) {
	  case 0:
	    expect(cpuSecondMove).toMatch(/[3, 4, 6, 8]/);
		userMove = 5;
		cpuThirdMove = getFinalWinningMove([3, 6, 4, 8], cpuSecondMove);
        break;
	  case 2:
	    expect(cpuSecondMove).toMatch(/[4, 5, 6, 8]/);
		cpuThirdMove = getFinalWinningMove([4, 6, 5, 8], cpuSecondMove);
		userMove = 3;
		break;
	  case 4:
	    expect(cpuSecondMove).toMatch(/[0, 2, 3, 5, 6, 8]/);
		cpuThirdMove = getFinalWinningMove([0, 8, 2, 6, 3, 5], cpuSecondMove);
		userMove = 7;
		break;
	  case 6:
	    expect(cpuSecondMove).toMatch(/[0, 2, 3, 4, 7, 8]/);
		cpuThirdMove = getFinalWinningMove([0, 3, 2, 4, 7, 8], cpuSecondMove);
		if (/[0, 3, 7, 8]/.test(cpuSecondMove)) {
		  userMove = 4;
		} else {
		  userMove = 3;
		}
		break;
	  case 8:
	    expect(cpuSecondMove).toMatch(/[0, 2, 4, 5, 6, 7]/);
		cpuThirdMove = getFinalWinningMove([0, 4, 2, 5, 6, 7], cpuSecondMove);
		if (/[2, 5, 6, 7]/.test(cpuSecondMove)) {
		  userMove = 4;
		} else {
		  userMove = 3;
		}
		break;
	  }

	  /* User makes second selection */
	  board.occupySquare(userMove);
	  
	  /* CPU makes the third(winning) selection */
	  expect(engine.nextMove(board, userMove)).toBe(cpuThirdMove);
	});
  });
  
  /* difficulty level expert - cpu checks for trap moves */
  describe("when playing with level expert", function () {
	beforeEach(function() {
	  engine.reset();
	  board.reset();
      engine.setDifficultyLevel('expert');
	});

	function cpuStartWith(value) {
	  var move = engine.nextMove(board, -1);
		while (move !== value) {
		  engine.reset();
		  move = engine.nextMove(board, -1);
		}
		board.occupySquare(value);
	}

	describe("when user starts", function () {
      it('cpu should not select 2 or 6 if user first 2 selections are 0 and 8 and cpu first selection is 4', function () {
	    board.occupySquare(0);
	    expect(engine.nextMove(board, 0)).toBe(4);
	    board.occupySquare(4);
	    board.occupySquare(8);
        expect(engine.nextMove(board, 8)).not.toMatch(/[2, 6]/);
      });

	  it('cpu should not select 0 or 8 if user first 2 selections are 2 and 6 and cpu first selection is 4', function () {
	    board.occupySquare(2);
	    expect(engine.nextMove(board, 2)).toBe(4);
	    board.occupySquare(4);
	    board.occupySquare(6);
        expect(engine.nextMove(board, 8)).not.toMatch(/[0, 8]/);
      });

      it('cpu should not select 8 if user first 2 selections are 1 and 3 and cpu first selection is 4', function () {
	    board.occupySquare(1);
	    expect(engine.nextMove(board, 1)).toBe(4);
	    board.occupySquare(4);
	    board.occupySquare(3);
        expect(engine.nextMove(board, 3)).not.toBe(8);
      });

	  it('cpu should not select 6 if user first 2 selections are 1 and 5 and cpu first selection is 4', function () {
	    board.occupySquare(1);
	    expect(engine.nextMove(board, 1)).toBe(4);
	    board.occupySquare(4);
	    board.occupySquare(5);
        expect(engine.nextMove(board, 5)).not.toBe(6);
      });

      it('cpu should not select 2 if user first 2 selections are 3 and 7 and cpu first selection is 4', function () {
	    board.occupySquare(3);
	    expect(engine.nextMove(board, 3)).toBe(4);
	    board.occupySquare(4);
	    board.occupySquare(7);
        expect(engine.nextMove(board, 7)).not.toBe(2);
      });

      it('cpu should not select 0 if user first 2 selections are 5 and 7 and cpu first selection is 4', function () {
	    board.occupySquare(5);
	    expect(engine.nextMove(board, 5)).toBe(4);
	    board.occupySquare(4);
	    board.occupySquare(7);
        expect(engine.nextMove(board, 7)).not.toBe(0);
      });
	
	  // If user starts with 4, the cpu will pick an edge square, and the user
	  // second selection makes it a diagonal (e.g. 0 and 4 and cpu is 8). The
	  // cpu next move should be the opposite edge diagonal to prevent a trap
	  // (e.g. 2 or 6).
	  it('cpu selects opposite diagonal if user starts with 4 and the first 3 selections form a diagonal', function () {
        var cpuMove, userMove;

        board.occupySquare(4);
	    cpuMove = engine.nextMove(board, 4); 
	    expect(cpuMove).toMatch(/[0268]/);
	    board.occupySquare(cpuMove);
	  
	    if (cpuMove === 0) {
		  userMove = 8;
	    } else if (cpuMove === 2) {
		  userMove = 6;
	    } else if (cpuMove === 6) {
		  userMove = 2;
	    } else {
		  userMove = 0;
	    }
	    board.occupySquare(userMove);
	    cpuMove = engine.nextMove(board, userMove);
	    if (userMove === 0 || userMove === 8) {
	      expect(cpuMove).toMatch(/[26]/);
	    } else {
		  expect(cpuMove).toMatch(/[08]/);
	    }
	  });
	});
	
	describe('when cpu starts with 0', function () {
	  beforeEach(function () {
	    cpuStartWith(0);
	  });
 
      it('cpu should trap user if they select 1', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(1);
		cpuMove = engine.nextMove(board, 1); 
		expect(cpuMove).toMatch(/[36]/);
		board.occupySquare(cpuMove);

        // user selection
		if (cpuMove === 3) {
		  userMove = 6;
		} else {
		  userMove = 3;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
		if (userMove == 3) {
		  expect(cpuMove).toBe(4);
		} else {
		  expect(cpuMove).toMatch(/[48]/);
		}
	  });

	  it('cpu should trap user if they select 2', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(2);

		cpuMove = engine.nextMove(board, 2);
		expect(cpuMove).toMatch(/[368]/);
		board.occupySquare(cpuMove);

        // user selection
	    if (cpuMove === 6) {
		  userMove = 3;
		} else if (cpuMove === 3) {
		  userMove = 6;
		} else {
		  userMove = 4;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
		if (userMove === 3) {
		  expect(cpuMove).toBe(8);
		} else if (userMove == 6) {
          expect(cpuMove).toBe(4);
        } else {
		  expect(cpuMove).toBe(6);
		}
	  });

      it('cpu should trap user if they select 3', function () {
        var userMove, cpuMove;

		// user selection
		board.occupySquare(3);

		cpuMove = engine.nextMove(board, 3);
		expect(cpuMove).toMatch(/[12]/);
		board.occupySquare(cpuMove);

        // user selection
        if (cpuMove === 1) {
          userMove = 2;
		} else {
          userMove = 1;
		}
		board.occupySquare(userMove);

		// user is trapped
        cpuMove = engine.nextMove(board, userMove);
		if (userMove === 1) {
		  expect(cpuMove).toMatch(/[48]/);
        } else {
          expect(cpuMove).toBe(4);
		}
	  });

	  it('cpu should trap user if they select 5', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(5);

		cpuMove = engine.nextMove(board, 5);
		expect(cpuMove).toMatch(/[26]/);
		board.occupySquare(cpuMove);

        // user selection
	    if (cpuMove === 6) {
		  userMove = 3;
		} else {
		  userMove = 1;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
		if (userMove === 1) {
		  expect(cpuMove).toMatch(/[46]/);
		} else {
		  expect(cpuMove).toBe(4);
		}
	  });

	  it('cpu should trap user if they select 6', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(6);

		cpuMove = engine.nextMove(board, 6);
		expect(cpuMove).toMatch(/[128]/);
		board.occupySquare(cpuMove);

        // user selection
        if (cpuMove === 1) {
          userMove = 2;
		} else if (cpuMove === 2) {
		  userMove = 1;
		} else {
		  userMove = 4;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
		if (userMove === 1) {
		  expect(cpuMove).toBe(8);
		} else if (userMove === 2) {
          expect(cpuMove).toBe(4);
		} else {
		  expect(cpuMove).toBe(2);
		}
	  });

	  it('cpu should trap user if they select 7', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(7);

		cpuMove = engine.nextMove(board, 7);
		expect(cpuMove).toMatch(/[26]/);
		board.occupySquare(cpuMove);

        // user selection
	    if (cpuMove === 6) {
		  userMove = 3;
		} else {
		  userMove = 1;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
		if (userMove === 1) {
		  expect(cpuMove).toBe(4);
		} else {
		  expect(cpuMove).toMatch(/[24]/);
		}
	  });
	  
	  it('cpu should trap user if they select 8', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(8);

		cpuMove = engine.nextMove(board, 8);
		expect(cpuMove).toMatch(/[26]/);
		board.occupySquare(cpuMove);

        // user selection
	    if (cpuMove === 2) {
		  userMove = 1;
		} else {
		  userMove = 3;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
		if (userMove === 1) {
		  expect(cpuMove).toBe(6);
		} else {
		  expect(cpuMove).toBe(2);
		}
	  });
	});

	describe('when cpu starts with 2', function () {
	  beforeEach(function () {
	    cpuStartWith(2);
	  });
 
      it('cpu should trap user if they select 0', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(0);
		
		cpuMove = engine.nextMove(board, 0) 
		expect(cpuMove).toMatch(/[568]/);
		board.occupySquare(cpuMove);

        // user selection
        if (cpuMove === 5) {
          userMove = 8;
		} else if (cpuMove === 6) {
		  userMove = 4;
		} else {
		  userMove = 5;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
        if (userMove === 4) {
		  expect(cpuMove).toBe(8);
		} else if (userMove == 5) {	
		  expect(cpuMove).toBe(6);
		} else {
          expect(cpuMove).toBe(4);
        }
	  });

	  it('cpu should trap user if they select 1', function () {
        var userMove, cpuMove;

		// user selection
		board.occupySquare(1);

        cpuMove = engine.nextMove(board, 1); 
		expect(cpuMove).toMatch(/[58]/);
		board.occupySquare(cpuMove);

        // user selection
        if (cpuMove === 5) {
          userMove = 8;
		} else {
          userMove = 5;
        }
	    board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
        if (userMove === 5) {
		  expect(cpuMove).toMatch(/[46]/);
        } else {
          expect(cpuMove).toBe(4);
        }
	  });

      it('cpu should trap user if they select 3', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(3);

		cpuMove = engine.nextMove(board, 3); 
		expect(cpuMove).toMatch(/[08]/);
		board.occupySquare(cpuMove);

        // user selection
		if (cpuMove === 0) {
		  userMove = 1;
		} else {
		  userMove = 5;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
        if (userMove === 1) {
		  expect(cpuMove).toMatch(/[48]/);
		} else {
		  expect(cpuMove).toBe(4);
		}
	  });

	  it('cpu should trap user if they select 5', function () {
        var userMove, cpuMove;

		// user selection
		board.occupySquare(5);

		cpuMove = engine.nextMove(board, 5);
		expect(cpuMove).toMatch(/[01]/);
		board.occupySquare(cpuMove);

        // user selection
        if (cpuMove === 0) {
          userMove = 1;
		} else {
          userMove = 0;
		}
	    board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
        if (userMove === 0) {
          expect(cpuMove).toBe(4);
        } else {
		  expect(cpuMove).toMatch(/[46]/);
        }
	  });

	  it('cpu should trap user if they select 6', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(6);

		cpuMove = engine.nextMove(board, 6);
		expect(cpuMove).toMatch(/[08]/);
		board.occupySquare(cpuMove);

        // user selection
	    if (cpuMove === 0) {
		  userMove = 1;
		} else {
		  userMove = 5;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
		if (userMove === 1) {
		  expect(cpuMove).toBe(8);
		} else {
		  expect(cpuMove).toBe(0);
		}
	  });

	  it('cpu should trap user if they select 7', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(7);

		cpuMove = engine.nextMove(board, 7);
		expect(cpuMove).toMatch(/[08]/);
		board.occupySquare(cpuMove);

        // user selection
	    if (cpuMove === 0) {
		  userMove = 1;
		} else {
		  userMove = 5;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
		if (userMove === 1) {
		  expect(cpuMove).toBe(4);
		} else {
		  expect(cpuMove).toMatch(/[04]/);
		}
	  });

	  it('cpu should trap user if they select 8', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(8);

		cpuMove = engine.nextMove(board, 8);
		expect(cpuMove).toMatch(/[016]/);
		board.occupySquare(cpuMove);

        // user selection
	    if (cpuMove === 0) {
		  userMove = 1;
		} else if (cpuMove === 1) {
          userMove = 0;
        } else {
		  userMove = 4;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
		if (userMove === 0) {
          expect(cpuMove).toBe(4);
        } else if (userMove === 1) {
		  expect(cpuMove).toBe(6);
		} else {
		  expect(cpuMove).toBe(0);
		}
	  });
	});

    describe('when cpu starts with 4', function () {
	  beforeEach(function () {
	    cpuStartWith(4);
	  });

	  function userSelect(pos) {
        var userMove, cpuMove;

		expect(board.isSquareOccupied(4)).toBeTruthy();

		// user selection
		board.occupySquare(pos);

		// cpu selection
		cpuMove = engine.nextMove(board, pos);
		expect(cpuMove).toMatch(/[0268]/);
        board.occupySquare(cpuMove);

		// user selection
		if (cpuMove === 0) {
		  userMove = 8;
		} else if (cpuMove === 2) {
		  userMove = 6;
		} else if (cpuMove === 6) {
		  userMove = 2;
		} else {
		  userMove = 0;
		}
		board.occupySquare(userMove);

		// cpu selection
		cpuMove = engine.nextMove(board, userMove);
		
		if (userMove === 8) {
		  if (pos === 1 || pos === 7) {
		    expect(cpuMove).toBe(6);
		  } else { // 3 or 5
		    expect(cpuMove).toBe(2);
		  }
		} else if (userMove === 6) {
		  if (pos === 1 || pos === 7) {
		    expect(cpuMove).toBe(8);
		  } else { // 3 or 5
		    expect(cpuMove).toBe(0);
		  }
		} else if (userMove === 2) {
		  if (pos === 1 || pos === 7) {
		    expect(cpuMove).toBe(0);
		  } else { // 3 or 5
		    expect(cpuMove).toBe(8);
		  }
		} else {
		  if (pos === 1 || pos === 7) {
		    expect(cpuMove).toBe(2);
		  } else { // 3 or 5
		    expect(cpuMove).toBe(6);
		  }
		}
	  }

	  function userSelectCorner(pos) {
	    // user selection
		board.occupySquare(pos);

		if (pos === 0) {
		  expect(engine.nextMove(board, pos)).toBe(8);
		} else if (pos === 2) {
		  expect(engine.nextMove(board, pos)).toBe(6);
		} else if (pos === 6) {
		  expect(engine.nextMove(board, pos)).toBe(2);
		} else {
		  expect(engine.nextMove(board, pos)).toBe(0);
		}
	  }
 
      it('cpu should trap user if they select 1', function () {
		userSelect(1);
	  });

	  it('cpu should trap user if they select 3', function () {
		userSelect(3);
	  });

      it('cpu should trap user if they select 5', function () {
		userSelect(5);
	  });

	  it('cpu should trap user if they select 7', function () {
		userSelect(7);
	  });
	  
	  it('cpu should cpu should select 8 if user selects 0', function () {
		userSelectCorner(0);
	  });

	  it('cpu should cpu should select 6 if user selects 2', function () {
		userSelectCorner(2);
	  });

      it('cpu should cpu should select 2 if user selects 6', function () {
		userSelectCorner(6);
	  });

	  it('cpu should cpu should select 0 if user selects 8', function () {
		userSelectCorner(8);
	  });
	});

	describe('when cpu starts with 6', function () {
	  beforeEach(function () {
	    cpuStartWith(6);
	  });
 
      it('cpu should trap user if they select 0', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(0);
		
		cpuMove = engine.nextMove(board, 0) 
		expect(cpuMove).toMatch(/[278]/);
		board.occupySquare(cpuMove);

        // user selection
		if (cpuMove === 2) {
		  userMove = 4;
		} else if (cpuMove === 7) {
          userMove = 8;
        } else {
		  userMove = 7;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
        if (userMove === 4) {
		  expect(cpuMove).toBe(8);
		} else if (userMove === 7) {	
		  expect(cpuMove).toBe(2);
		} else {
          expect(cpuMove).toBe(4);
		}
	  });

	  it('cpu should trap user if they select 1', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(1);

		// cpu selection
		cpuMove = engine.nextMove(board, 1); 
		expect(cpuMove).toMatch(/[08]/);
		board.occupySquare(cpuMove);

        // user selection
		if (cpuMove === 0) {
		  userMove = 3;
		} else {
		  userMove = 7;
		}
	    board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove); 
		if (userMove === 3) {
		  expect(cpuMove).toMatch(/[48]/);
		} else {
		  expect(cpuMove).toBe(4);
		}
	  });

      it('cpu should trap user if they select 2', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(2);

		cpuMove = engine.nextMove(board, 2); 
		expect(cpuMove).toMatch(/[08]/);
		board.occupySquare(cpuMove);

        // user selection
		if (cpuMove === 0) {
		  userMove = 3;
		} else {
		  userMove = 7;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
        if (userMove === 3) {
		  expect(cpuMove).toBe(8);
		} else {
		  expect(cpuMove).toBe(0);
		}
	  });

	  it('cpu should trap user if they select 3', function () {
        var userMove, cpuMove;

		// user selection
		board.occupySquare(3);

		// cpu selection
        cpuMove = engine.nextMove(board, 3);
		expect(cpuMove).toMatch(/[78]/);
		board.occupySquare(cpuMove);

        // user selection
        if (cpuMove === 7) {
          userMove = 8;
		} else {
          userMove = 7;
		}
	    board.occupySquare(userMove);

		// user is trapped
        cpuMove = engine.nextMove(board, userMove);
        if (userMove === 7) {
		  expect(cpuMove).toMatch(/[24]/);
        } else {
          expect(cpuMove).toBe(4);
        }
	  });

	  it('cpu should trap user if they select 5', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(5);

		cpuMove = engine.nextMove(board, 5);
		expect(cpuMove).toMatch(/[08]/);
		board.occupySquare(cpuMove);

        // user selection
	    if (cpuMove === 0) {
		  userMove = 3;
		} else {
		  userMove = 7;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
		if (userMove === 3) {
		  expect(cpuMove).toBe(4);
		} else {
		  expect(cpuMove).toMatch(/[04]/);
		}
	  });

	  it('cpu should trap user if they select 7', function () {
        var userMove, cpuMove;

		// user selection
		board.occupySquare(7);

		// cpu selection
		cpuMove = engine.nextMove(board, 7);
		expect(cpuMove).toMatch(/[03]/);
		board.occupySquare(cpuMove);

        // user selection
        if (cpuMove === 0) {
          userMove = 3;
		} else {
          userMove = 0;
		}
	    board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
        if (userMove === 0) {
          expect(cpuMove).toBe(4);
		} else {
          expect(cpuMove).toMatch(/[24]/);
        }
	  });

	  it('cpu should trap user if they select 8', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(8);

		cpuMove = engine.nextMove(board, 8);
		expect(cpuMove).toMatch(/[023]/);
		board.occupySquare(cpuMove);

        // user selection
	    if (cpuMove === 0) {
		  userMove = 3;
		} else if (cpuMove === 2) {
		  userMove = 4;
		} else {
          userMove = 0;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
        if (userMove === 0) {
          expect(cpuMove).toBe(4);
		} else if (userMove === 3) {
		  expect(cpuMove).toBe(2);
		} else {
		  expect(cpuMove).toBe(0);
		}
	  });
	});

    describe('when cpu starts with 8', function () {
	  beforeEach(function () {
	    cpuStartWith(8);
	  });
 
      it('cpu should trap user if they select 0', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(0);
		
		cpuMove = engine.nextMove(board, 0) 
		expect(cpuMove).toMatch(/[26]/);
		board.occupySquare(cpuMove);

        // user selection
		if (cpuMove === 2) {
		  userMove = 5;
		} else {
		  userMove = 7;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
        if (userMove === 5) {
		  expect(cpuMove).toBe(6);
		} else {	
		  expect(cpuMove).toBe(2);
		}
	  });

	  it('cpu should trap user if they select 1', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(1);

		// cpu selection
		cpuMove = engine.nextMove(board, 1); 
		expect(cpuMove).toMatch(/[26]/);
		board.occupySquare(cpuMove);

        // user selection
		if (cpuMove === 2) {
		  userMove = 5;
		} else {
		  userMove = 7;
		}
	    board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove); 
		if (userMove === 5) {
		  expect(cpuMove).toMatch(/[46]/);
		} else {
		  expect(cpuMove).toBe(4);
		}
	  });

      it('cpu should trap user if they select 2', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(2);

		cpuMove = engine.nextMove(board, 2); 
		expect(cpuMove).toMatch(/[067]/);
		board.occupySquare(cpuMove);

        // user selection
		if (cpuMove === 0) {
		  userMove = 4;
		} else if (cpuMove === 6) {
		  userMove = 7;
		} else {
          userMove = 6;
        }
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
        if (userMove === 4) {
		  expect(cpuMove).toBe(6);
		} else if (userMove === 6) {
          expect(cpuMove).toBe(4);
        } else {
		  expect(cpuMove).toBe(0);
		}
	  });

	  it('cpu should trap user if they select 3', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(3);

		cpuMove = engine.nextMove(board, 3); 
		expect(cpuMove).toMatch(/[26]/);
		board.occupySquare(cpuMove);

        // user selection
		if (cpuMove === 2) {
		  userMove = 5;
		} else {
		  userMove = 7;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
        if (userMove === 5) {
		  expect(cpuMove).toBe(4);
		} else {
		  expect(cpuMove).toMatch(/[24]/);
		}
	  });

	  it('cpu should trap user if they select 5', function () {
        var userMove, cpuMove;

		// user selection
		board.occupySquare(5);

		// cpu selection
		cpuMove = engine.nextMove(board, 5)
		expect(cpuMove).toMatch(/[67]/);
		board.occupySquare(cpuMove);

        // user selection
        if (cpuMove === 6) {
          userMove = 7;
        } else {
          userMove = 6;
		}
        board.occupySquare(userMove);

		// user is trapped
        cpuMove = engine.nextMove(board, userMove);
        if (userMove === 6) {
          expect(cpuMove).toBe(4);
		} else {
		  expect(cpuMove).toMatch(/[04]/);
        }
	  });

	  it('cpu should trap user if they select 6', function () {
		var userMove, cpuMove;

		// user selection
		board.occupySquare(6);

		// cpu selection
		cpuMove = engine.nextMove(board, 6); 
		expect(cpuMove).toMatch(/[025]/);
		board.occupySquare(cpuMove);

        // user selection
		if (cpuMove === 0) {
		  userMove = 4;
		} else if (cpuMove === 2) {
		  userMove = 5;
		} else {
          userMove = 2;
		}
		board.occupySquare(userMove);

		// user is trapped
		cpuMove = engine.nextMove(board, userMove);
        if (userMove === 2) {
          expect(cpuMove).toBe(4);
        } else if (userMove === 4) {
		  expect(cpuMove).toBe(2);
		} else {
		  expect(cpuMove).toBe(0);
		}
	  });

	  it('cpu should trap user if they select 7', function () {
        var userMove, cpuMove;

		// user selection
		board.occupySquare(7);

		// cpu selection
        cpuMove = engine.nextMove(board, 7); 
		expect(cpuMove).toMatch(/[25]/);
		board.occupySquare(cpuMove);

        // user selection
        if (cpuMove === 2) {
          userMove = 5;
        } else {
          userMove = 2;
		}
	    board.occupySquare(userMove);

		// user is trapped
        cpuMove = engine.nextMove(board, userMove);
        if (userMove === 2) {
          expect(cpuMove).toBe(4);
		} else {
		  expect(cpuMove).toMatch(/[04]/);
        }
	  });
	});
  });
});