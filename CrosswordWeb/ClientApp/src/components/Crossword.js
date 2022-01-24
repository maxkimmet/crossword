import React from 'react';
import './Crossword.css';

function Header(props) {
  return (
    <div className="center">
      <h4>{props.title}</h4>
      <h6>by {props.author}</h6>
      <h6>{props.date}</h6>
    </div>
  );
}

function Timer(props) {
  return (
    <div className="center">
      <span>{props.time.toISOString().substring(12, 19)}</span>
    </div>
  );
}

function WinModal(props) {
  return (
    <div className="modalContainer">
      <div className="modal">
        <h3>Congration, you done it!</h3>
        <h5>Crossword completed in {props.time.toISOString().substring(12, 19)}</h5>
        <button className="btn-close" onClick={props.onClick}></button>
      </div>
    </div>
  );
}

function ErrorButton(props) {
  return (
    <div className="center">
      <button className="error-button" onMouseDown={props.onMouseDown}>Show Errors</button>
    </div>
  )
}

function Cell(props) {
  let classes = "cell";
  let value = props.value;
  if (props.value === "#") {
    classes += " blacked-out";
    value = "";
  }
  if (props.activeEntry) {
    classes += " active-entry";
  }
  if (props.activeCell) {
    classes += " active-cell";
  }
  if (props.errorCell) {
    classes += " error-cell"
  }

  return (
    <td onClick={props.onClick}>
      <span>{props.annotation}</span>
      <input
        className={classes}
        // readOnly={true}
        value={value}
        onKeyDown={props.onKeyDown}
        ref={props.annotation === "01" ? props.inputRef : null}
      />
    </td>
  );
}

function Grid(props) {
  return (
    <div>
      <span className="clue-text"><b>{`${props.activeEntry.name}. ${props.activeEntry.clue}`}</b></span>
      <table className="grid">
        <tbody>
          {props.grid.map((cells, row) => (
            <tr key={row}>
              {cells.map((cell, col) => (
                <Cell
                  key={row * props.height + col}
                  value={cell}
                  errorCell={props.errors[row][col]}
                  activeEntry={includesArray(props.activeEntry.cells, [row, col])}
                  activeCell={row === props.activeRow && col === props.activeCol}
                  annotation={props.startCells[[row, col]]}
                  onKeyDown={props.onKeyDown}
                  onClick={() => props.onClick(row, col)}
                  inputRef={props.inputRef}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Clue(props) {
  // Scroll to clue if active
  const element = document.getElementById(props.name);
  const parent = document.getElementById(props.parent);
  if (element && parent && props.isActiveEntry) {
    const offset = element.offsetTop - 0.5 * parent.offsetHeight + 32;
    parent.scroll({ top: offset, behavior: "smooth" });
  }

  return (
    <li
      id={props.name}
      className={"clue" + (props.isActiveEntry ? " active-entry" : "")}
      onClick={props.onClick}
    >
      <span>{`${props.name}. ${props.clue}`}</span>
    </li>
  );
}

function ClueList(props) {
  const clueListId = `${props.orientation}-clue-list`;

  return (
    <div>
      <nav className="clue-list-nav" id={clueListId}>
        <ul className="clue-list">
          {props.entries
            .filter(entry => (entry.name[0] === props.orientation))
            .map(entry => (
              <Clue
                key={entry.name}
                name={entry.name}
                clue={entry.clue}
                parent={clueListId}
                isActiveEntry={props.activeEntry.name === entry.name}
                onClick={() => props.onClick(entry.name)}
              />
            ))}
        </ul>
      </nav>
    </div>
  );
}

export class Crossword extends React.Component {
  static displayName = Crossword.name;

  constructor(props) {
    super(props);
    this.inputElement = React.createRef();
    let startCells = {};
    const cell = [0, 0];
    startCells[cell] = 1;

    this.state = {
      loading: true,
      inProgress: false,
      complete: false,
      showWinModal: false,
      time: new Date(0),
      title: "Loading...",
      author: "Loading...",
      date: "Loading...",
      height: 1,
      width: 7,
      solution: [["L", "O", "A", "D", "I", "N", "G"]],
      grid: [["L", "O", "A", "D", "I", "N", "G"]],
      startCells: startCells,
      entries: [{
        "name": "A01",
        "word": "LOADING",
        "clue": "Loading...",
        "cells": [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]]
      }],
      activeEntryIndex: 0,
      activeCellIndex: 0,
      errors: [[false, false, false, false, false, false, false]],
    }

    this.toggleWinModal = this.toggleWinModal.bind(this);
    this.runErrorCheck = this.runErrorCheck.bind(this);
    this.goToEntry = this.goToEntry.bind(this);
    this.goToCell = this.goToCell.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    this.loadCrossword();
  }

  componentWillUnmount() {
    // Stop timer
    clearInterval(this.timerID);
  }

  async loadCrossword() {
    // Fetch crossword based on date in URL
    let { date } = this.props.match.params;
    const response = await fetch(`/api/crossword/${date}`);
    const data = await response.json();

    let startCells = {};
    data.entries.map(entry => (
      startCells[entry.cells[0]] = entry.name.substring(1)
    ));

    this.setState({
      loading: false,
      title: data.title,
      author: data.author,
      date: data.date,
      height: data.height,
      width: data.width,
      solution: data.grid,
      grid: data.grid.map(cells => (
        cells.map(cell => (
          cell.match(/[A-Z]/g) ? "" : "#"
        ))
      )),
      startCells: startCells,
      entries: data.entries,
      errors: Array.from({ length: data.height }, () =>
        Array.from({ length: data.width }, () => false)
      ),
    });
    this.inputElement.current.focus();
  }

  tick() {
    this.setState(prevState => ({
      time: new Date(prevState.time.getTime() + 1000),
    }));
  }

  toggleWinModal() {
    this.setState(prevState => ({
      showWinModal: !prevState.showWinModal,
    }));
  }

  runErrorCheck() {
    let errors = this.state.errors;
    for (let i = 0; i < this.state.height; i++) {
      for (let j = 0; j < this.state.width; j++) {
        errors[i][j] = (this.state.grid[i][j] !== this.state.solution[i][j]);
      }
    }
    this.setState({
      errors: errors,
    });
  }

  goToEntry(name) {
    let activeEntryIndex = -1;
    for (let i = 0; i < this.state.entries.length; i++) {
      if (this.state.entries[i].name === name) {
        activeEntryIndex = i;
        break;
      }
    }

    // Return false if entry isn't valid
    if (activeEntryIndex === -1) {
      return false;
    }

    this.setState({
      activeEntryIndex: activeEntryIndex,
      activeCellIndex: 0,
    });
    this.inputElement.current.focus();

    return true;
  }

  goToCell(row, col) {
    // Focus on cell to force keyboard to pop up on mobile
    this.inputElement.current.focus();

    const possibleEntries = this.state.entries.filter(entry => includesArray(entry.cells, [row, col]));

    // Return false if invalid cell
    if (possibleEntries.length === 0) return false;

    let activeEntry = this.state.entries[this.state.activeEntryIndex];
    const activeRow = activeEntry.cells[this.state.activeCellIndex][0];
    const activeCol = activeEntry.cells[this.state.activeCellIndex][1];
    const orientation = activeEntry.name[0];

    if (possibleEntries.length === 1) {
      // Go to non-intersecting cell
      activeEntry = possibleEntries[0];
    } else if (row === activeRow && col === activeCol) {
      // Toggle orientation if destination is same as active cell
      activeEntry = possibleEntries.filter(entry => entry.name[0] !== orientation)[0];
    } else {
      // Go to cell keeping same orientation
      activeEntry = possibleEntries.filter(entry => entry.name[0] === orientation)[0];
    }

    const activeEntryIndex = this.state.entries.findIndex(entry => entry.name === activeEntry.name);
    const activeCellIndex = activeEntry.cells.findIndex(cell => cell[0] === row && cell[1] === col);
    this.setState({
      activeEntryIndex: activeEntryIndex,
      activeCellIndex: activeCellIndex,
    });

    return true;
  }

  handleKeyDown(event) {
    let grid = this.state.grid;
    let errors = this.state.errors;
    let activeEntryIndex = this.state.activeEntryIndex;
    let activeCellIndex = this.state.activeCellIndex;
    let activeEntry = this.state.entries[this.state.activeEntryIndex];
    let activeRow = activeEntry.cells[activeCellIndex][0];
    let activeCol = activeEntry.cells[activeCellIndex][1];

    let preventDefault = true;
    const value = event.key.toUpperCase();

    // Handle keypresses
    if (value.match(/^[A-Z]$/)) {
      // Enter alphabetic character and move to next cell (return if puzzle complete)
      if (!this.state.inProgress) {  // Start timer when first character entered
        this.setState({ inProgress: true });
        this.timerID = setInterval(
          () => this.tick(),
          1000
        );
      }
      if (!this.state.complete) {
        grid[activeRow][activeCol] = value;
        errors[activeRow][activeCol] = false;
      }
      let nextCellIndex = activeCellIndex + 1;
      if (nextCellIndex < activeEntry.cells.length) {
        activeCellIndex = nextCellIndex;
      } else {
        activeEntryIndex = (activeEntryIndex + 1) % this.state.entries.length;
        activeEntry = this.state.entries[activeEntryIndex];
        activeCellIndex = 0;
      }
      this.setState({
        grid: grid,
        errors: errors,
        activeEntryIndex: activeEntryIndex,
        activeCellIndex: activeCellIndex,
      });
    } else if (value === "BACKSPACE") {
      // Remove character and move to previous cell
      if (!this.state.complete) { grid[activeRow][activeCol] = ''; }
      let nextCellIndex = activeCellIndex - 1;
      if (nextCellIndex >= 0) {
        activeCellIndex = nextCellIndex;
      } else {
        const entryCount = this.state.entries.length;
        activeEntryIndex = ((activeEntryIndex - 1) % entryCount + entryCount) % entryCount;
        activeEntry = this.state.entries[activeEntryIndex];
        activeCellIndex = activeEntry.cells.length - 1;
      }
      this.setState({
        grid: grid,
        activeEntryIndex: activeEntryIndex,
        activeCellIndex: activeCellIndex,
      });
    } else if (value === "TAB") {
      // Move to beginning of next entry
      activeEntryIndex = (activeEntryIndex + 1) % this.state.entries.length;
      activeEntry = this.state.entries[activeEntryIndex];
      this.goToEntry(activeEntry.name);
    } else if (value === " ") {
      // Change orientation
      this.goToCell(activeRow, activeCol);
    } else if (value === "ARROWUP") {
      // Move to next valid cell above (or wrap around)
      do {
        activeRow = ((activeRow - 1) % this.state.height + this.state.height) % this.state.height;
      } while (!this.goToCell(activeRow, activeCol));
    } else if (value === "ARROWDOWN") {
      // Move to next valid cell below (or wrap around)
      do {
        activeRow = (activeRow + 1) % this.state.height % this.state.height;
      } while (!this.goToCell(activeRow, activeCol));
    } else if (value === "ARROWLEFT") {
      // Move to next valid cell to the left (or wrap around)
      do {
        activeCol = ((activeCol - 1) % this.state.width + this.state.width) % this.state.width;
      } while (!this.goToCell(activeRow, activeCol));
    } else if (value === "ARROWRIGHT") {
      // Move to next valid cell to the right (or wrap around)
      do {
        activeCol = (activeCol + 1) % this.state.width % this.state.width;
      } while (!this.goToCell(activeRow, activeCol));
    } else {
      // Don't prevent default event of unhandled keypresses
      preventDefault = false;
    }
    if (preventDefault) { event.preventDefault(); }

    // Check if crossword is complete for first time
    if (!this.state.complete && JSON.stringify(this.state.grid) === JSON.stringify(this.state.solution)) {
      clearInterval(this.timerID);  // Stop timer
      this.setState({
        complete: true,
        showWinModal: true,
      });
    }
  }

  render() {
    const activeEntry = this.state.entries[this.state.activeEntryIndex];

    return (
      <div className="game-wrapper" onClick={() => this.inputElement.current.focus()}>
        {this.state.showWinModal &&
          <WinModal
            time={this.state.time}
            onClick={this.toggleWinModal}
          />
        }
        <div className="flex-col">
          <Header
            title={this.state.title}
            author={this.state.author}
            date={this.state.date}
          />
          <Timer time={this.state.time} />
          <div className="flex-row">
            <Grid
              grid={this.state.grid}
              errors={this.state.errors}
              startCells={this.state.startCells}
              height={this.state.height}
              width={this.state.width}
              activeEntry={activeEntry}
              onKeyDown={this.handleKeyDown}
              onClick={this.goToCell}
              activeRow={activeEntry.cells[this.state.activeCellIndex][0]}
              activeCol={activeEntry.cells[this.state.activeCellIndex][1]}
              inputRef={this.inputElement}
            />
            <table className="clue-table">
              <thead>
                <tr>
                  <th>Across</th>
                  <th>Down</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <ClueList
                      entries={this.state.entries}
                      orientation="A"
                      activeEntry={this.state.entries[this.state.activeEntryIndex]}
                      activeCell={this.state.activeCell}
                      onClick={this.goToEntry}
                    />
                  </td>
                  <td>
                    <ClueList
                      entries={this.state.entries}
                      orientation="D"
                      activeEntry={this.state.entries[this.state.activeEntryIndex]}
                      activeCell={this.state.activeCell}
                      onClick={this.goToEntry}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ErrorButton onMouseDown={this.runErrorCheck} />
        </div>
      </div>
    );
  }
}

// Source: https://stackoverflow.com/questions/64303074/check-if-an-array-includes-an-array-in-javascript
const includesArray = (data, arr) => {
  return data.some(e => Array.isArray(e) && e.every((o, i) => Object.is(arr[i], o)));
}