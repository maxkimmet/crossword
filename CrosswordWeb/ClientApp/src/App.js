import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Crossword } from './components/Crossword'
import { TicTacToe } from './components/TicTacToe'

import './custom.css'

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <Layout>
        <Route exact path='/' component={Home} />
        <Route path='/crossword/:date' component={Crossword} />
        <Route path='/tic-tac-toe' component={TicTacToe} />
      </Layout>
    );
  }
}
