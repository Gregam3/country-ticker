import * as React from "react";
import countries from "./countries.json";

export class PreviousGuessesList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            previousGuesses: props.previousGuesses
        };
    }


    render() {
        if (this.state.previousGuesses === undefined) {
            return <p>Loading...</p>;
        }

        return <div style={{padding: 50}}>
            <h2>Previous Guesses</h2>
            <ul style={{overflowY: 'scroll', overflow: 'hidden', height: 500}}>
                {this.state.previousGuesses.reverse().map(guess =>
                    <p>{countries[guess.country].name} {this.getIsCorrectEmoji(guess.isCorrect)}</p>)}
            </ul>
        </div>;
    }

    getIsCorrectEmoji(isCorrect) {
        return isCorrect ? '✔️' : '❌';
    }
}

