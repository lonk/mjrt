import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import Login from '../Login/Login';
import Play from '../Play/Play';
import './App.css';

export default function App() {
    return (
        <Router>
            <div className="app">
                <Route exact path="/">
                    <Redirect to="/login" />
                </Route>
                <Route exact path="/login/:id?">
                    <Login />
                </Route>
                <Route exact path="/play/:id?">
                    <Play />
                </Route>
            </div>
        </Router>
    );
}
