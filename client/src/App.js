import React, { Component } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './components/Landing';
import EventList from './components/EventList';
import EventCreate from './components/EventCreate';
import EventShow from './components/EventShow';
import NotFound from './components/NotFound';

//import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Navbar />
          <Switch>
            <Route exact path="/" component={Landing} />
            <Route exact path="/eventlist" component={EventList} />
            <Route exact path="/eventcreate" component={EventCreate} />
            <Route exact path="/eventshow/:id" component={EventShow} />
            <Route exact component={NotFound} />
          </Switch>
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
