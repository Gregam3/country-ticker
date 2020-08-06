import React from 'react';
import './App.css';
import countries from './countries.json';
import GuessingMap from "./GuessingMap";
import MAP_COUNTRIES_TO_GUESS from "./map-countries.json";
import {shuffleArray} from "./Util";
import {HINT_MODES, INPUT_MODES} from "./Enums"
import {TypingInput} from "./TypingInput";
import {MultipleChoiceInput} from "./MultipleChoiceInput";
import {PreviousGuessesList} from "./PreviousGuessesList";

//Constants
const CORRECT_SOUND = new Audio('correct.mp3');
export const COUNTRY_COUNT = Object.keys(countries).length;

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.countryIndex = 0;
        this.countryIndexMap = {};
        this.populateCountryIndexMap();

        const firstCountryChoice = this.getNextCountry();

        this.state = {
            score: {
                guesses: 0, correct: 0
            },
            country: firstCountryChoice,
            previousCountry: null,
            settings: {
                inputMode: INPUT_MODES.MultipleChoice,
                showFlag: true,
                showPreviousCountry: true,
                countryGuess: true
            },
            previousGuesses: []
        };

        this.guess = this.guess.bind(this);
        this.getDisplayValueForCountry = this.getDisplayValueForCountry.bind(this);
    }

    populateCountryIndexMap() {
        let randomCountryIndexes = shuffleArray([...Array(COUNTRY_COUNT).keys()]);

        for (let countriesKey in countries) {
            this.countryIndexMap[randomCountryIndexes[0]] = countriesKey;
            randomCountryIndexes.shift();
        }
    }

    render() {
        if (this.hasLoaded()) {
            return <div className="App">
                {this.settingsBar()}
                {this.getScoreBar()}
                <div className="country-info-panel">
                    <PreviousGuessesList previousGuesses={this.state.previousGuesses}/>
                    {this.getCountryPanel(this.state.country, false)}
                </div>
                <div className="background-color">
                    {this.getAnswerInput()}
                </div>
            </div>
        } else {
            return <p>Loading...</p>
        }
    }

    getScoreBar() {
        return <h1>Score: {this.state.score.correct + '/' + this.state.score.guesses}
            &nbsp; ({this.getScorePercentage()})% | Countries
            remaining {COUNTRY_COUNT - this.countryIndex}</h1>;
    }

    settingsBar() {
        return <div>
            <button style={{float: 'right', fontSize: 20}}
                    onClick={() => {
                        let settings = this.state.settings;
                        settings.inputMode = (settings.inputMode + 1) % 3;

                        if (settings.inputMode === INPUT_MODES.MapClick) {
                            console.log("here")
                            const country = this.getNextMapCountry(this.state.country);
                            this.setState({country});
                        }

                        this.setState({settings});
                    }}>Cycle through input modes
            </button>
            <button style={{float: 'right', fontSize: 20}}
                    onClick={() => {
                        let settings = this.state.settings;
                        settings.showFlag = !settings.showFlag;
                        this.setState({settings});
                    }}>Toggle show flag
            </button>
            <button style={{float: 'right', fontSize: 20}}
                    onClick={() => {
                        let settings = this.state.settings;
                        settings.showPreviousCountry = !settings.showPreviousCountry;
                        this.setState({settings});
                    }}>Toggle previous country view
            </button>
            <button style={{float: 'right', fontSize: 20}}
                    onClick={() => {
                        let settings = this.state.settings;
                        settings.countryGuess = !settings.countryGuess;
                        this.setState({settings});
                    }}>Toggle Country/Capital Input
            </button>
        </div>;
    }

    getAnswerInput() {
        switch (this.state.settings.inputMode) {
            case INPUT_MODES.MultipleChoice:
                return <MultipleChoiceInput
                    getDisplayValueForCountry={this.getDisplayValueForCountry}
                    answer={this.state.country}
                    guess={this.guess}
                />
            case INPUT_MODES.Typing:
                return <TypingInput
                    hintMode={this.state.countryGuess ? HINT_MODES.Capital : HINT_MODES.Country}
                    guess={this.guess}
                />
            case INPUT_MODES.MapClick:
                return <div style={{border: '20px solid #ffffff'}}>
                    <GuessingMap guess={this.guess} previousCountry={this.state.previousCountry}/>
                </div>
            default:
                return "";
        }
    }

    getDisplayValueForCountry(countryChoice) {
        if (this.state.settings.countryGuess) {
            return countries[countryChoice].name;
        } else {
            return countries[countryChoice].capital;
        }
    }

    getCountryPanel(countryKey, isPrevious) {
        if (countryKey == null) {
            return <p>No previous guesses!</p>
        }

        const country = countries[countryKey];

        if (isPrevious) {
            return <div>
                <img src={this.getFlag(countryKey)} className='previous-flag' alt="flag"/>
                <p>Capital: {country.capital} | Country: {country.name}</p>
            </div>;
        } else {
            return <div>
                {this.state.settings.showFlag && <img src={this.getFlag(countryKey)} className='flag' alt="flag"/>}
                {this.getHint(country)}
            </div>;
        }
    }

    getHint(country) {
        if (this.state.settings.countryGuess) {
            return <p>Capital: {country.capital}</p>;
        } else {
            return <p>Country: {country.name}</p>
        }
    }

    getFlag(countryName) {
        return require('./flags/' + countryName.toLowerCase() + '.svg');
    }

    getScorePercentage() {
        if (this.state.score.guesses === 0 || this.state.score.correct === 0) {
            return 0;
        }

        return (this.state.score.correct / this.state.score.guesses) * 100;
    }

    hasLoaded() {
        return this.state.country != null;
    }

    guess(countryShorthand) {
        console.log('guess:' + countryShorthand, 'actual:' + this.state.country)
        let score = this.state.score;
        score.guesses++;

        let isCorrect = countryShorthand === this.state.country;

        if (isCorrect) {
            CORRECT_SOUND.play();
            score.correct++;
        }

        let previousGuesses = this.state.previousGuesses;
        previousGuesses.push({country: this.state.country, isCorrect});

        console.log(previousGuesses)
        const previousCountry = this.state.country;
        const nextCountry = this.getNextCountry();

        this.setState({
            country: nextCountry,
            score,
            previousCountry,
            previousGuesses,
            countryInput: ""
        });
    }

    getNextCountry() {
        if (this.countryIndex === COUNTRY_COUNT) {
            this.countryIndex = 0;
            alert("You have completed 1 loop of all countries!")
            this.populateCountryIndexMap();
        }

        let countryShortHand = this.countryIndexMap[this.countryIndex++];

        if (this.state === undefined) {
            return countryShortHand;
        }

        if (this.state.settings.inputMode === INPUT_MODES.MapClick) {
            return this.getNextMapCountry(countryShortHand);
        }

        if (this.state && !this.state.settings.showFlag) {
            let country = countries[countryShortHand];

            while (true) {
                this.countryIndex++;
                if (country.capital === 'No Capital') {
                    return this.countryIndexMap[this.countryIndex];
                }
            }
        }

        return countryShortHand;
    }

    getNextMapCountry(countryShortHand) {
        while (true) {
            this.countryIndex++;
            countryShortHand = this.countryIndexMap[this.countryIndex];
            if (MAP_COUNTRIES_TO_GUESS.includes(countryShortHand)) {
                return countryShortHand;
            }
        }
    }
}