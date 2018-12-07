let grid;
let score = 0;

let colorsSizes = {
  "2": {
    size: 64,
    color: "#ffb3ba"
  },
  "4": {
    size: 64,
    color: "#ffdfba"
  },
  "8": {
    size: 64,
    color: "#ffffba"
  },
  "16": {
    size: 64,
    color: "#d1ffb7"
  },
  "32": {
    size: 64,
    color: "#b7ffcf"
  },
  "64": {
    size: 64,
    color: "#bae1ff"
  },
  "128": {
    size: 50,
    color: "#bac9ff"
  },
  "256": {
    size: 50,
    color: "#d9c4ff"
  },
  "512": {
    size: 50,
    color: "#f0c4ff"
  },
  "1024": {
    size: 40,
    color: "#ffc4f3"
  },
  "2048": {
    size: 40,
    color: "#d8bc97"
  }
}

	function isGameWon() {
  	for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				if (grid[i][j] === 2048) {
          return true;
        }
      }
    }
    return false;
  }

	function isGameOver() {
  	for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				if (grid[i][j] === 0) {
          return false;
        }
        if (i !== 3 && grid[i][j] === grid[i + 1][j]) {
        	return false;
        }
        if (j !== 3 && grid[i][j] === grid[i][j + 1]) {
          return false;
        }
      }
    }
    return true;
  }

	function blankGrid() {
    return [
			[0,0,0,0],
			[0,0,0,0],
			[0,0,0,0],
			[0,0,0,0]
		];
  }

function setup() {
  createCanvas(400, 400);
  noLoop();
	grid = blankGrid();
	//console.table(grid);
	addNumber();
	addNumber();
  updateCanvas();
}

function addNumber() {
	let options = [];
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			if (grid[i][j] === 0) {
				options.push({
					x: i,
					y: j
				});
			}
		}
	}
		if (options.length > 0) {
		let spot = random(options);
		let r = random(1);
		grid[spot.x][spot.y] = r > 0.2 ? 2 : 4;
    }
	}

	function compare(a,b) {
  	for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
       if (a[i][j] != b[i][j]) {
         return true;
      }
    }
  }
  return false;
  }

function copyGrid(grid) {
  	let extra = blankGrid();
    for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
        extra[i][j] = grid[i][j];
      }
    }
    return extra;
  }

	function flipGrid(grid) {
    for (let i = 0; i < 4; i++) {
      grid[i].reverse();
    }
    return grid;
  }

	function rotateGrid(grid) {
    let newGrid = blankGrid();
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        newGrid[i][j] = grid[j][i];
    }
  }
  return newGrid;
}

	// One "move"
	function keyPressed() {
    console.log(keyCode);
    let flipped = false;
    let rotated = false;
    let played = true;
    if (keyCode === DOWN_ARROW) {
    	// DO NOTHING
    } else if (keyCode === UP_ARROW) {
    	grid = flipGrid(grid);
      flipped = true;
    } else if (keyCode === RIGHT_ARROW) {
    	grid = rotateGrid(grid);
      rotated = true;
    } else if (keyCode === LEFT_ARROW) {
      grid = rotateGrid(grid);
      grid = flipGrid(grid);
      rotated = true;
      flipped = true;
  	} else {
      played = false;
    }
    
    	if (played) {
      let past = copyGrid(grid);
      for (let i = 0; i < 4; i++) {
        grid[i] = operate(grid[i]);
      }
      let changed = compare(past, grid);
      
      if (flipped) {
      	grid = flipGrid(grid);
      }
    	if (rotated) {
      	grid = rotateGrid(grid);
        grid = rotateGrid(grid);
        grid = rotateGrid(grid);
      }
      
      if (changed) {
        addNumber();
  	}
    updateCanvas();
        
    let gameover = isGameOver();
    if (gameover) {
    	console.log("GAME OVER");
    }
        
    let gamewon = isGameWon();
    if (gamewon) {
      console.log("GAME WON");
    }
  }
}
	function operate(row) {
    row = slide(row);
    row = combine(row);
    row = slide(row);
  	return row;
  }


	function updateCanvas() {
  background(255);
	drawGrid();
  select('#score').html(score);

	}

// making new array
	function slide(row) {
    let arr = row.filter(val => val);
    let missing = 4 - arr.length;
    let zeros = Array(missing).fill(0);
    arr = zeros.concat(arr);
    return arr;
}

// operating on array itself
	function combine(row) {
		for (let i = 3; i >= 1; i--) {
      let a = row[i];
      let b = row[i - 1];
      if (a == b) {
        row[i] = a + b;
        score += row[i];
        row[i - 1] = 0;
        
      }
    }
    return row;
}

	function drawGrid() {
	let w = 100;
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				noFill();
				strokeWeight(2);
        let val = grid[i][j];
        let s = "" + val;
				stroke(0);
        strokeWeight(4);
        if (val != 0) {
          fill(colorsSizes[s].color);
        } else {
          noFill();
        }
				rect(i*w, j*w, w, w, 20);
				if (grid[i][j] !== 0) {
					textAlign(CENTER,CENTER);
					noStroke();
          fill(0);
          textSize(colorsSizes[s].size);
					text(val, i * w + w / 2, j * w + w / 2);
				}
			}
		}
	}
