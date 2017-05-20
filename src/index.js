import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const SQUARES_PER_SIDE = 8;

const SQUARE = 'square';
const GOO = 'square goo';
const GRASS = 'square grass';
const STREET = 'square street';
const DENIED = 'square denied';

const DEFAULT_BOARD_8 = [ 
	STREET,STREET,STREET,STREET,STREET,STREET,STREET,STREET,
	GRASS, STREET, DENIED, DENIED, STREET, DENIED, DENIED, STREET,
	GRASS, STREET, DENIED, DENIED, STREET, DENIED, DENIED, STREET,
	STREET,STREET,STREET,STREET,STREET,STREET,STREET,STREET,
	GRASS, STREET, DENIED, DENIED, STREET, DENIED, DENIED, STREET,
	GRASS, STREET, DENIED, DENIED, STREET, DENIED, DENIED, STREET,
	STREET,STREET,STREET,STREET,STREET,STREET,STREET,STREET,
	GRASS, STREET, DENIED, DENIED, STREET, GRASS, GRASS, STREET
];


class Person {
	constructor(props) {
		this.setSquares = props.setSquares;
		this.getSquare = props.getSquare;
		this.position = {row: null, col: null};
	}
	
	setPosition(row,col) {
		let square = this.getSquare(row,col);
		if(!square)
			return;
		if(square.type === DENIED)
			return;
		
		let squares = [];
		squares.push({row: this.position.row, col: this.position.col, prop: 'num', value: null});
		squares.push({row: row, col: col, prop: 'num', value: '@'});
		this.position = {row: row, col: col};
		this.setSquares(squares);
	}
	
	getPosition() {
		return this.position;
	}
	
	movePosition(rowOffset,colOffset) {
		let row = this.position.row + rowOffset;
		let col = this.position.col + colOffset;
		this.setPosition(row,col);
	}
	
	moveUp() {
		this.movePosition(-1,0);
	}
	
	moveDown() {	
		this.movePosition(1,0);
	}
	
	moveLeft() {
		this.movePosition(0,-1);
	}
	
	moveRight() {
		this.movePosition(0,1);
	}
	
}

class Square extends React.Component {

	constructor(props) {
		super(props);
		this.drop = this.drop.bind(this);	
	}
	
	allowDrop(ev) {
		ev.preventDefault();
	}
	
	drop(ev) {
		let data=ev.dataTransfer.getData('type');
		let square = {row: this.props.row, 
					col: this.props.col,
					prop: 'type',
					value: data
		};
		
		this.props.setSquares([square]);
	}
	
	
  render() {
	  
    return (
      <div className={this.props.type}
	  onDrop={this.drop}
	   onDragOver={this.allowDrop}>		   
		   {this.props.value.num}
      </div>
    );
  }
}

class Board extends React.Component {
  
	render() {
		
		return (
			<div tabIndex="0" onKeyDown={this.props.handleKeyDown}>
				{[...Array(SQUARES_PER_SIDE)].map((x, row) => 
				<div key={row} className="board-row">
					{[...Array(SQUARES_PER_SIDE)].map((y, col) =>			
						<Square value={this.props.squares[row*SQUARES_PER_SIDE+col]}
						key={row*SQUARES_PER_SIDE+col}
						row={row}
						col={col}
						type={this.props.squares[row*SQUARES_PER_SIDE+col].type}
						setSquares={this.props.setSquares}
						/>	
					)}
				</div>
				)}
			</div>
			
		);
	}
}

class Game extends React.Component {
	constructor() {
		super();
		this.state = {
			person: null,
			hasBegun: false,
			squares: Array(SQUARES_PER_SIDE*SQUARES_PER_SIDE).fill({type: SQUARE, num: null}),
			message: 'You can edit the board by dragging and dropping squares on it.'
		};
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.setSquares = this.setSquares.bind(this);
		this.getSquare = this.getSquare.bind(this);
		
		if(SQUARES_PER_SIDE === 8) {
			let squares = JSON.parse(JSON.stringify(this.state.squares));
			squares.map((item,i) => (item.type = DEFAULT_BOARD_8[i]));
			this.state.squares = squares;
		}
	}
	
	drag(ev) {
		let name = ev.target.className;
		ev.dataTransfer.setData('type', name);
	}

	begin() {
		if(!this.state.hasBegun) {			
			let getSquare = this.getSquare;
			let setSquares = this.setSquares;
			let props = {setSquares: setSquares,
						getSquare: getSquare};
			let person = new Person(props);
			person.setPosition(0,0);
			this.setState({hasBegun: true, person: person, message: ''});
		}
		
	}
	
	isValidSquare(row,col) {
		if(row >= SQUARES_PER_SIDE || col >= SQUARES_PER_SIDE || col < 0 || row < 0)
			return false;
		return true;
	}
	
	getSquare(row, col) {
		if(this.isValidSquare(row,col))
			return this.state.squares[row*SQUARES_PER_SIDE+col];
	}

	/**
	* Update squares' properties
	* @param array of objects, where object is a square of form {row,col,prop,value}
	*/
	setSquares(squares) {	
		let copy = JSON.parse(JSON.stringify(this.state.squares));
		for(let i = 0 ; i < squares.length ; i++) {
			let row = squares[i].row;
			let col = squares[i].col;
			if(!this.isValidSquare(row,col))
				return false;
			let prop = squares[i].prop;
			let value = squares[i].value;

			if(prop === 'num')
				copy[row*SQUARES_PER_SIDE+col]['num'] = value;
			else if(prop === 'type')
				copy[row*SQUARES_PER_SIDE+col]['type'] = value;
		}

		this.setState({squares: copy});	
		return true;
	}

	handleKeyDown(e) {
		if(this.state.person === null) {
			return;
		}
		switch (e.keyCode) {
        case 37:
            this.state.person.moveLeft();
            break;
        case 38:
            this.state.person.moveUp();
            break;
        case 39:
            this.state.person.moveRight();
            break;
        case 40:
            this.state.person.moveDown();
            break;
		default: return;
		}
	}

	  
	render() {
	  
    return (
      <div className="game">
        <div className="game-board">
			<Board handleKeyDown={this.handleKeyDown} 
			squares={this.state.squares}
			setSquares={this.setSquares}/>
        </div>
        <div className="selector">
			<div className={GOO}
			draggable="true"
			onDragStart={this.drag}></div>
			<div className={GRASS}
			draggable="true"
			onDragStart={this.drag}></div>
			<div className={DENIED}
			draggable="true"
			onDragStart={this.drag}></div>
			<div className={STREET}
			draggable="true"
			onDragStart={this.drag}></div> 			
		</div>
		<div>{this.state.message}</div>
		<button onClick={this.begin.bind(this)} 
			hidden={this.state.hasBegun}>BEGIN</button>
      </div>
    );
  }
}

// ========================================

	
	
ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
