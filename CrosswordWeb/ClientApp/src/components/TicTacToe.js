import React from 'react';
import './TicTacToe.css';

function Square(props) {
  return (
    <button className={props.classes} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    let classes = "square";
    classes += this.props.winCells && this.props.winCells.includes(i) ? " highlighted" : "";
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        classes={classes}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const rows = [0, 1, 2];
    const cols = [0, 1, 2];
    return (
      <div>
        {rows.map((row) => (
          <div key={row} className="board-row">
            {cols.map((col) => (
              this.renderSquare(row * 3 + col)
            ))}
          </div>
        ))}
      </div>
    );
  }
}

export class TicTacToe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        col: null,
        row: null,
      }],
      reverseHistory: false,
      stepNumber: 0,
      xIsNext: true,
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1]
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState(prevState => ({
      history: history.concat([{
        squares: squares,
        col: i % 3,
        row: Math.floor(i / 3),
      }]),
      stepNumber: history.length,
      xIsNext: !prevState.xIsNext,
    }));
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  reverseHistory() {
    this.setState(prevState => ({
      reverseHistory: !prevState.reverseHistory
    }));
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winCells = calculateWinner(current.squares);
    const winner = winCells ? current.squares[winCells[0]] : null;

    let moves = history.map((snapshot, move) => {
      const desc = move ?
        `Go to move #${move} (${snapshot.col}, ${snapshot.row})` :
        `Go to game start`;
      return (
        <li key={move}>
          <button
            className={move === this.state.stepNumber ? "bold" : ""}
            onClick={() => this.jumpTo(move)}
          >
            {desc}
          </button>
        </li>
      );
    });
    moves = this.state.reverseHistory ? moves.reverse() : moves;

    let status;
    if (winner) {
      status = `Winner: ${winner}`;
    } else if (this.state.stepNumber === 9) {
      status = `Draw`;
    } else {
      status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
    }

    return (
      <div className="game">
        <div>
          <p>This game is based on the React tutorial found <a href="https://reactjs.org/tutorial/tutorial.html">here</a>.</p>
        </div>
        <div className="game-board">
          <Board
            squares={current.squares}
            winCells={winCells}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.reverseHistory()}>
            Reverse history
          </button>
          <ul>{moves}</ul>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [a, b, c];
    }
  }
  return null;
}
