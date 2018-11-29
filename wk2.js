const cellSize = 150;
const gridSize = 4;
const scoreHeight = 100;
let grid;
let gameOver;
let score;
let completed;

function newGame() {
	grid = new Array(gridSize * gridSize).fill(0);
	gameOver = false;
	completed = false;
	score = 0;
	addNumber();
	addNumber();
}

function setup() {
	createCanvas(cellSize * gridSize + 10, cellSize * gridSize + 10 + scoreHeight);
	newGame();
	noLoop();
	// for testing
	/*
	for (let i = 1; i < 12 && i < gridSize * gridSize; i++) {
		grid[i] = pow(2, i);
	}
	*/
	updateCanvas();
}

function updateCanvas() {
	background(265);
	drawScore();
	drawGrid();
	if (gameOver) {
		drawGameOver();
	}
	if (completed) {
		drawCompleted();
	}
}

function keyPressed() {
	if (!gameOver && !completed) {
		switch (keyCode) {
			case UP_ARROW:
			case DOWN_ARROW:
				verticalSlide(keyCode);
				updateCanvas();
				break;
			case RIGHT_ARROW:
			case LEFT_ARROW:
				horizontalSlide(keyCode);
				updateCanvas();
				break;
		}
	} else if (keyCode === ENTER) {
		if (completed) {
			completed = false;
			updateCanvas();
		} else {
			newGame();
			updateCanvas();
		}
	}
}

function verticalSlide(direction) {
	let past = [];
	arrayCopy(grid, past);
	for (let c = 0; c < gridSize; c++) {
		let column = getVerticalRow(c);
		column = combine(column, direction);
		column = column.filter(x => x > 0);
		const z = new Array(gridSize - column.length).fill(0);
		column = direction === UP_ARROW ? column.concat(z) : z.concat(column);
		setVerticalRow(column, c);
	}
	checkSlide(past);
}

function horizontalSlide(direction) {
	let past = [];
	arrayCopy(grid, past);
	for (let i = 0; i < gridSize; i++) {
		let row = grid.slice(i * gridSize, i * gridSize + gridSize);
		row = combine(row, direction);
		row = row.filter(x => x > 0);
		const z = new Array(gridSize - row.length).fill(0);
		row = direction === LEFT_ARROW ? row.concat(z) : z.concat(row);
		grid.splice(i * gridSize, gridSize);
		grid.splice(i * gridSize, 0, ...row);
	}
	checkSlide(past);
}

function checkSlide(past) {
	if (somethingMoved(past)) {
		addNumber();
	}
	if (!movesLeft()) {
		gameOver = true;
	}
}

function movesLeft() {
	// check neighbors
	for (let row = 0; row < gridSize; row++) {
		for (let col = 0; col < gridSize; col++) {
			const current = grid[row * gridSize + col];
			if (current === 0) {
				// grid still has empty spots
				return true;
			}
			// last column doesnt have a right neighbor
			const right = (col < gridSize - 1) ? grid[row * gridSize + col + 1] : 0;
			// last row doesnt have a bottom neighbor
			const bottom = (row < gridSize - 1) ? grid[(row + 1) * gridSize + col] : 0;
			if (current === right || current === bottom) {
				return true;
			}
		}
	}
	return false;
}

function somethingMoved(past) {
	return !(grid.every((x, i) => x === past[i]));
}

function setVerticalRow(column, c) {
	for (let i = 0; i < column.length; i++) {
		const val = column[i];
		const idx = i * gridSize + c;
		grid[idx] = val;
	}
}

function getVerticalRow(c) {
	const result = [];
	for (let i = 0; i < gridSize; i++) {
		const val = grid[i * gridSize + c];
		result.push(val);
	}
	return result;
}

function combine(row, direction) {
	switch (direction) {
		case DOWN_ARROW:
		case RIGHT_ARROW:
			return combineDownRight(row);
		case UP_ARROW:
		case LEFT_ARROW:
			return combineUpLeft(row);
	}
}

function combineUpLeft(row) {
	const forStart = 0;
	return combineRow(row, forStart, (i, x) => i < x - 1, i => i + 1);
}

function combineDownRight(row) {
	const forStart = row.length - 1;
	return combineRow(row, forStart, (i, x) => i > 0, i => i - 1);
}

function combineRow(row, forStart, forCond, forIncr) {
	for (let i = forStart; forCond(i, row.length); i = forIncr(i)) {
		const a = row[i];
		let idx = forIncr(i);
		let b = row[idx];
		while (b === 0 && forCond(idx, row.length)) {
			idx = forIncr(idx);
			b = row[idx];
		}
		if (a === b && a !== 0) {
			row[i] = a + b;
			score += row[i];
			row[idx] = 0;
			if (row[i] === 2048) {
				completed = true;
			}
		}
	}
	return row;
}

function addNumber() {
	const opts = [];
	grid.forEach((x, i) => {
		if (x === 0) {
			opts.push(i);
		}
	});
	if (opts.length > 0) {
		const idx = opts[floor(random(opts.length))];
		const seed = random(1);
		grid[idx] = seed > 0.5 ? 4 : 2;
	}
}

function drawGrid() {
	for (let row = 0; row < gridSize; row++) {
		for (let col = 0; col < gridSize; col++) {
			let coloring = {};
			const idx = row * gridSize + col;
			const seed = min(map(pow(grid[idx], 1 / 11), 1, 2, 1, 200), 200);
			if (grid[idx] === 0) {
				noFill();
			} else {
				const r = map(seed, 66, 167, 66, 50);
				const g = map(seed, 104, 66, 244, 100);
				const b = map(seed, 244, 244, 100, 0);
				fill(r, g, b);
			}
			strokeWeight(10);
			stroke(64);
			rect(col * cellSize + 1, row * cellSize + 1 + scoreHeight, cellSize, cellSize, 10);
			if (grid[idx] !== 0) {
				const msg = `${grid[idx]}`;
				const size = floor(map(sqrt(msg.length), 1, 3, 64, 14));
				const r =  map(seed, 1, 200, 0, 30);
				const g = map(seed, 1, 200, 60, 200);
				const b = map(seed, 1, 200, 100, 255);
				drawText(msg,
					color(r, g, b, gameOver || completed ? 64 : 255),
					size,
					col * cellSize + cellSize / 2,
					row * cellSize + cellSize / 2 + scoreHeight);
			}
		}
	}
}

function drawScore() {
	drawText(`Score: ${score}`,
		color(0, 220, 0, gameOver ? 128 : 255),
		32,
		width / 2,
		scoreHeight / 2);
}

function drawGameOver() {
	drawText('Game Over\r\nPress [Enter] to restart.',
		color(220, 0, 0),
		32,
		width / 2,
		height / 2 + scoreHeight / 2);
}

function drawCompleted() {
	drawText('Congrats on 2048\r\nPress [Enter] to continue.',
		color(0, 220, 0),
		32,
		width / 2,
		height / 2 + scoreHeight / 2);
}

function drawText(msg, inkColor, size, x, y) {
	textAlign(CENTER, CENTER);
	textSize(size);
	fill(inkColor);
	noStroke();
	text(msg, x, y);
}
