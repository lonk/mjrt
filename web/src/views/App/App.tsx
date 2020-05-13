import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Redirect,
    Switch
} from 'react-router-dom';
import Login from '../Login/Login';
import Play from '../Play/Play';
import styles from './App.module.css';

export default function App() {
    return (
        <div className={styles.app}>
            <Router>
                <Switch>
                    <Route exact path="/login/:id?">
                        <Login />
                    </Route>
                    <Route exact path="/play/:id?">
                        <Play />
                    </Route>
                    <Redirect to="/login" />
                </Switch>
            </Router>
        </div>
    );
}
