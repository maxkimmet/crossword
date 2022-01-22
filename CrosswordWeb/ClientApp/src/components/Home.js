import React, { Component } from 'react';
import './Home.css';

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
      <div className="crossword-menu-item">
        <button className="btn btn-light" onClick={this.handleClick}>
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
      <div className="center">
        <h1>Latest Crosswords</h1>
        <CrosswordMenu
          crosswords={this.state.crosswords}
        />
      </div>
    );
  }
}
