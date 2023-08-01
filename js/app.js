'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'
const GLUE_IMG = '<img src="img/sticky.png">'
const PURPLE_GAMER_IMG = '<img src="img/gamer-purple.png">'
const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const EL_H1_SPAN = document.querySelector('h1 span')
const EL_H2_SPAN = document.querySelector('h2 span')

// Model:
var gIsStuck = false
var gGlueInterval
var neighborsCount = countNeighbors()
var gBoard
var gGamerPos
var gBallCount
var gRandBallInterval
var gTarget

function onInitGame() {
	gTarget = getRandomInt(10, 51)
	EL_H1_SPAN.innerText = gTarget
	gBallCount = 0
	gGamerPos = { i: 2, j: 9 }
	gBoard = buildBoard()
	renderBoard(gBoard)
	randomBallPos()
	gRandBallInterval = setInterval(randomBallPos, 500)
	gGlueInterval = setInterval(randomGluePos, 5000)
}

function buildBoard() {
	const board = []
	// DONE: Create the Matrix 10 * 12 

	for (var i = 0; i < 10; i++) {
		board[i] = []
		for (var j = 0; j < 12; j++) {
			// DONE: Put FLOOR everywhere and WALL at edges
			board[i][j] = { type: FLOOR, gameElement: null }
			if (i === 0 || i === 9 ||
				j === 0 || j === 11) {
				board[i][j].type = WALL
			}
		}
	}

	// DONE: Place the gamer and two balls
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
	board[5][0].type = FLOOR;
	board[5][11].type = FLOOR;
	board[0][5].type = FLOOR;
	board[9][5].type = FLOOR;
	// console.log(board)
	return board
}

// Render the board to an HTML table
function renderBoard(board) {
	var strHTML = ''
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>'
		for (var j = 0; j < board[0].length; j++) {
			const currCell = board[i][j]

			var cellClass = getClassName({ i: i, j: j })

			if (currCell.type === FLOOR) cellClass += ' floor'
			else if (currCell.type === WALL) cellClass += ' wall'
			strHTML += `<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`

			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG
			}

			strHTML += '</td>'
		}
		strHTML += '</tr>'
	}
	// console.log('strHTML:\n\n', strHTML)

	const elBoard = document.querySelector('.board')
	elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
	if (gIsStuck) return
	if (i === 5 && j === -1) j = 11;
	if (i === 5 && j === 12) j = 0;
	if (i === -1 && j === 5) i = 9;
	if (i === 10 && j === 5) i = 0;

	const targetCell = gBoard[i][j]
	if (targetCell.type === WALL) return


	// Calculate distance to make sure we are moving to a neighbor cell
	const iAbsDiff = Math.abs(i - gGamerPos.i)
	const jAbsDiff = Math.abs(j - gGamerPos.j)

	// If the clicked Cell is one of the four allowed
	// if (iAbsDiff + jAbsDiff === 1)
	if (i === 0 ||
		i === 9 ||
		j === 11 ||
		j === 0 || (iAbsDiff === 1 && jAbsDiff === 0) ||
		(jAbsDiff === 1 && iAbsDiff === 0)) {

		if (targetCell.gameElement === BALL) {
			gBallCount++
			playCollectSound()
			// console.log('Collecting!')
			EL_H2_SPAN.innerText = gBallCount
		}

		if (targetCell.gameElement === GLUE) {
			gIsStuck = true;
			console.log('glued', i, j)
			setTimeout(() => {
				gIsStuck = false;

			}, 3000);
		}

		// TODO: Move the gamer
		//REMOVE FROM
		// MODEL
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
		// DOM
		renderCell(gGamerPos, '')

		// ADD TO
		// MODEL
		gGamerPos.i = i
		gGamerPos.j = j
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
		// DOM
		var cellToRender = gIsStuck ? PURPLE_GAMER_IMG : GAMER_IMG
		renderCell(gGamerPos,cellToRender)

	} else {
		// console.log('TOO FAR', iAbsDiff, jAbsDiff)
	}

	if (gBallCount === gTarget) {
		endGame()
	}
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	const cellSelector = '.' + getClassName(location)
	const elCell = document.querySelector(cellSelector)
	elCell.innerHTML = value
}

// Move the player by keyboard arrows
function onHandleKey(event) {
	if (gBallCount !== gTarget) {
		const i = gGamerPos.i
		const j = gGamerPos.j
		switch (event.key) {
			case 'ArrowLeft':
			case 'a':
				moveTo(i, j - 1)
				break
			case 'ArrowRight':
			case 'd':
				moveTo(i, j + 1)
				break
			case 'ArrowUp':
			case 'w':
				moveTo(i - 1, j)
				break
			case 'ArrowDown':
			case 's':
				moveTo(i + 1, j)
				break
		}
	}
}

// Returns the class name for a specific cell
function getClassName(location) {
	const cellClass = 'cell-' + location.i + '-' + location.j
	return cellClass
}

function getEmptyCells() {
	const emptyCells = []
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[i].length; j++) {
			const cellValue = gBoard[i][j].gameElement
			if (cellValue === null || cellValue === '') {
				emptyCells.push([i, j])
			}
		}
	}
	// console.log(emptyCells);
	return emptyCells
}

function randomBallPos() {
	const emptyCells = getEmptyCells()
	if (emptyCells.length === 0) return
	const randomIndex = getRandomInt(0, emptyCells.length)
	const randomCellPos = emptyCells[randomIndex]
	const i = randomCellPos[0]
	const j = randomCellPos[1]

	if (gBoard[i][j].type === WALL) return
	gBoard[i][j].gameElement = BALL
	renderCell({ i, j }, BALL_IMG)
	countNeighbors(gGamerPos.i, gGamerPos.j, gBoard)

}

function endGame() {
	playVictorySound()
	const elHeader = document.querySelector('.main-h1')
	const elBtn = document.querySelector('.btn')
	const elTempHeader = document.querySelector('.temp-h1')
	elTempHeader.classList.remove('hidden')
	elHeader.classList.add('hidden')
	clearInterval(gRandBallInterval)
	clearInterval(gGlueInterval)
	elBtn.classList.toggle('hidden')
}

function onResetGame(btn) {
	const elHeader = document.querySelector('.main-h1')
	const elTempHeader = document.querySelector('.temp-h1')
	gBallCount = 0
	EL_H2_SPAN.innerText = gBallCount
	btn.classList.toggle('hidden')
	elHeader.classList.toggle('hidden')
	elTempHeader.classList.toggle('hidden')
	onInitGame()
}


function playCollectSound() {
	const sound = new Audio('sound/beep.mp3')
	sound.play()
}

function playVictorySound() {
	const sound = new Audio('sound/victory.mp3')
	sound.play()
}

function countNeighbors(rowIdx, colIdx, gBoard) {
	neighborsCount = 0

	for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
		if (i < 0 || i >= gBoard.length) continue

		for (var j = colIdx - 1; j <= colIdx + 1; j++) {
			if (j < 0 || j >= gBoard[i].length) continue
			if (i === rowIdx && j === colIdx) continue
			if (gBoard[i][j].gameElement === BALL) neighborsCount++
		}
	}
	var neighborsballs = document.querySelector('.neighbors')
	neighborsballs.innerText = (neighborsCount)
	console.log(neighborsballs)
	return neighborsballs
}

function randomGluePos() {
	const emptyCells = getEmptyCells()
	if (emptyCells.length === 0) return
	const randomIndex = Math.floor(Math.random() * emptyCells.length)
	const randomCell = emptyCells[randomIndex]
	const i = randomCell[0]
	const j = randomCell[1]

	gBoard[i][j].gameElement = GLUE
	if (gBoard[i][j].type === WALL) return
	renderCell({ i, j }, GLUE_IMG)

	setTimeout(() => {
		if (gBoard[i][j].gameElement === GLUE) {
			gBoard[i][j].gameElement = null
			renderCell({ i, j }, '')
		}
	}, 3000);
}

/////////////////////////////////////

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
