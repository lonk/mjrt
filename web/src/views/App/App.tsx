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
            <div className={styles.motionTwin}>
                Ce jeu est librement inspiré du génial{' '}
                <a href="http://majority.muxxu.com">Majority</a> de la Motion
                Twin !
                <br />
                N'hésitez pas à contribuer sur{' '}
                <a href="https://github.com/lonk/mjrt">GitHub</a> !
            </div>
        </div>
    );
}
