import React from "react";
import countries from "./countries.json";
import {COUNTRY_COUNT} from "./App";

const CHOICE_COUNT = 8;


export class MultipleChoiceInput extends React.Component {
    constructor(props) {
        super(props);
        this.getDisplayValueForCountry = props.getDisplayValueForCountry;
        this.guess = props.guess;
        this.state = {
            choices: this.getChoices(props.answer)
        }

        console.log("here")
    }

    componentWillMount() {
        // document.addEventListener("keydown", this.multipleChoiceAnswerKeyListener.bind(this));
    }

    componentWillReceiveProps(nextProps, oldProps) {
        this.setState({choices: this.getChoices(nextProps.answer)});
    }

    render() {
        if (this.state.choices !== undefined) {
            let choiceIndex = 1;
            return <div className="answers">
                {this.state.choices.map(countryChoice => <button
                    style={{fontSize: '35px', width: '50%', float: 'left', height: '100px'}}
                    onClick={() => {
                        this.guess(countryChoice);
                    }
                    }>
                    {this.getDisplayValueForCountry(countryChoice)}</button>)}
            </div>;
        }

        return <p>Loading...</p>;
    }


    multipleChoiceAnswerKeyListener(event) {
        let key = event.key * 1;

        if (key > 0 && key <= CHOICE_COUNT) {
            this.guess(this.state.choices[key - 1]);
        }
    }

    getChoices(correctAnswer) {
        const choices = [...this.getRandomCountryShortHands(CHOICE_COUNT - 1, correctAnswer), correctAnswer].sort();
        let i = 1;

        let choiceKeymap = {};

        for (let choicesKey in choices) {
            choiceKeymap[i++] = choicesKey;
        }

        this.setState({choiceKeymap});

        return choices;
    }

    getRandomCountryShortHands(count, answerCountry) {
        const countryShortHands = [];

        while (countryShortHands.length < count) {
            const nextCountryIndex = Math.floor(Math.random() * COUNTRY_COUNT - 1);
            const country = Object.keys(countries)[nextCountryIndex];

            if (!countryShortHands.includes(country) && country !== answerCountry && country !== undefined) {
                countryShortHands.push(country);
            }
        }

        if (count === 1) {
            return countryShortHands[0];
        } else {
            return countryShortHands
        }
    }
}