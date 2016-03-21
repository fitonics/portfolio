/* A tic tac toe board has 9 squares, numbered 0-8 */
describe("Board", function () {
  var board;

  beforeEach(function () {
    board = new netlightened.Board();
  });
 
  function isBoardClean() {
	var i;
	if (board.getAvailableSquaresCount() !== 9 ||
	    board.getAvailableSquares().length !== 9) {
	  return false;
	}

    for (i = 0; i < 9; ++i) {
	  if (board.isSquareOccupied(i)) {
		return false;
	  }
	}
	return true;
  }
  
  describe("when new", function () {
    it('should have no squares occupied', function () {
      expect(isBoardClean()).toBeTruthy();
    });

    it('the first available square should be 0', function () {
      expect(board.getNextAvailableSquare()).toBe(0);
    });
  });
  
  describe("when occupying a square", function () {
    beforeEach(function () {
      board.occupySquare(0);
    });

    it('square 0 should be occupied', function () {
      expect(board.isSquareOccupied(0)).toBeTruthy();
    });

    it('should have 8 available squares', function () {
	  var i;
      expect(board.getAvailableSquaresCount()).toBe(8);
	  expect(board.getAvailableSquares()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
	  for (i = 1; i < 9; ++i) {
		expect(board.isSquareOccupied(i)).toBeFalsy();
	  }
    });

	it('the first available square should be 1', function () {
      expect(board.getNextAvailableSquare()).toBe(1);
    });
	
	it('the first available square should be 2 if 1 is excluded', function () {
      expect(board.getNextAvailableSquare([1])).toBe(2);
    });
    
    it('when reset it should have all 9 squares available', function () {
	  board.reset();
	  expect(isBoardClean()).toBeTruthy();
    });
  });

  describe("when choosing an invalid square", function () {
    it('occupy square -1 should throw an exception', function () {
      expect(function() { board.occupySquare(-1)}).toThrow("Invalid square position: -1");
    });

	it('occupy square 9 should throw an exception', function () {
      expect(function() { board.occupySquare(9)}).toThrow("Invalid square position: 9");
    });

    it('is square -1 occupied should throw an exception', function () {
      expect(function() { board.isSquareOccupied(-1)}).toThrow("Invalid square position: -1");
    });

	it('is square 9 occupied should throw an exception', function () {
      expect(function() { board.isSquareOccupied(9)}).toThrow("Invalid square position: 9");
    });
  });  
});