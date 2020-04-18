import React from 'react';
import { FaTwitter, FaDiscord } from 'react-icons/fa';
import './Top.css';
import Countdown from 'react-countdown';

export default function Top(props: any) {
    return (
        <div className="top">
            <div className="top-logo">
                <img src="/logo.png" alt="MJRT" width="150" />
                <div className="top-icons">
                    <a href="https://twitter.com/MjrtNet">
                        <FaTwitter className="top-twitter" />
                    </a>
                    <a href="https://discord.gg/zpCkC7">
                        <FaDiscord className="top-discord" />
                    </a>
                </div>
            </div>
            <div className="top-content">
                {props.children}

                {props.countdown !== null && (
                    <div className="countdown">
                        <strong>Temps restant :</strong>{' '}
                        <Countdown
                            date={props.countdown}
                            key={props.countdown}
                            renderer={({ seconds }) =>
                                seconds > 1
                                    ? `${seconds} secondes`
                                    : `${seconds} seconde `
                            }
                        />
                    </div>
                )}
            </div>
            <div className="top-logo"></div>
        </div>
    );
}
