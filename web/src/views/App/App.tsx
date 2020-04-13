import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Login from '../Login/Login';
import Play from '../Play/Play';
import './App.css';

export default function App() {
    return (
        <Router>
            <div>
                <Route exact path="/">
                    <Login />
                </Route>
                <Route path="/play">
                    <Play />
                </Route>
            </div>
        </Router>
    );
}
