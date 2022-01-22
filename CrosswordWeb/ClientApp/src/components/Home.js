import React, { Component } from 'react';
import './Home.css';

function CrosswordControls() {
  return (
    <div className="info-panel">
      <h4>Controls</h4>
      <ul className="control-list">
        <li><b>Backspace</b> to delete a character and move to the previous cell</li>
        <li><b>Tab</b> to move to the next entry</li>
        <li><b>Space</b> to toggle orientation</li>
        <li><b>Arrow keys</b> to move to an adjacent cell</li>
      </ul>
    </div>
  );
}

class CrosswordMenuItem extends Component {
  static displayName = CrosswordMenuItem.name;

  constructor(props) {
    super(props);
    this.title = props.title;
    this.date = props.date;

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    window.location.href = `crossword/${this.date}`;
  }

  render() {
    return (
      <div>
        <button className="menu-button btn btn-light" onClick={this.handleClick}>
          <h5>{this.title}</h5>
          <span>{this.date}</span>
        </button>
      </div>
    );
  }
}

function CrosswordMenu(props) {
  return (
    <div className="crossword-menu">
      {props.crosswords.map(crossword => (
        <CrosswordMenuItem
          key={crossword.date}
          title={crossword.title}
          date={crossword.date}
        />
      ))}
    </div>
  );
}

export class Home extends Component {
  static displayName = Home.name;

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      crosswords: [],
    }
  }

  componentDidMount() {
    this.loadMenu();
  }

  async loadMenu() {
    const response = await fetch('/api/crossword');
    const data = await response.json();
    this.setState({
      loading: false,
      crosswords: data,
    });
  }

  render() {
    return (
      <div className="flex-col">
        <CrosswordControls />
        <h3>Latest Crosswords</h3>
        <CrosswordMenu
          crosswords={this.state.crosswords}
        />
      </div>
    );
  }
}
