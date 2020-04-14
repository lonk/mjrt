import React from 'react';
import './Top.css';
import Countdown from 'react-countdown';

export default function Top(props: any) {
    return (
        <div className="top">
            <img src="./logo.png" width="150" className="top-logo" />
            <div className="top-content">
                {props.children}
            </div>
            { props.countdown !== undefined && <div className="countdown">
                <Countdown
                    date={props.countdown}
                    key={props.countdown}
                    renderer={({ seconds }) => seconds}
                />
            </div> }
        </div>
    );
}
