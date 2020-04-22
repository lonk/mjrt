import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import Login from '../Login/Login';
import Play from '../Play/Play';
import styles from  './App.module.css';

export default function App() {
    return (
        <Router>
            <div className={styles.app}>
                <Route exact path="/">
                    <Redirect to="/login" />
                </Route>
                <Route exact path="/login/:id?">
                    <Login />
                </Route>
                <Route exact path="/play/:id?">
                    <Play />
                </Route>
                <div className={styles.motionTwin}>
                    Ce jeu est librement inspiré du génial{' '}
                    <a href="http://majority.muxxu.com">Majority</a> de la
                    Motion Twin !
                    <br />
                    N'hésitez pas à contribuer sur{' '}
                    <a href="https://github.com/lonk/mjrt">GitHub</a> !
                </div>
            </div>
        </Router>
    );
}
