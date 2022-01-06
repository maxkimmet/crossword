import React, { Component } from 'react';

export class Home extends Component {
  static displayName = Home.name;

  render () {
    return (
      <div>
        <h1>This homepage doesn't do much at the moment.</h1>
        <br></br>
        <p>
          But you can click <a href='/crossword'>here</a> or <b>Crossword</b> in the upper right corner to navigate to the one crossword on this site right now.
        </p>
      </div>
    );
  }
}
