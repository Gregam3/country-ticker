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

        return <div style={{padding: 50, fontSize: '35px', height: window.innerHeight, overflowY: 'scroll'}}>
            <h1><b>Previous Guesses</b></h1>
            <ul style={{overflowY: 'scroll', overflow: 'hidden'}}>
                {this.state.previousGuesses.reverse().map(guess => {
                    let country = countries[guess.country];

                    if (country) {
                        return <p>{country.name} {this.getIsCorrectEmoji(guess.isCorrect)}</p>
                    }

                    return "";
                })}
            </ul>
        </div>;
    }

    getIsCorrectEmoji(isCorrect) {
        return isCorrect ? '✔️' : '❌';
    }
}

