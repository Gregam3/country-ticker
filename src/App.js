import React, {useState} from 'react';
import './App.css';
import countries from './countries.json';
import Autosuggest from 'react-autosuggest';
import GuessingMap from "./GuessingMap";
import MAP_COUNTRIES_TO_GUESS from "./map-countries.json";


//FIXME the code in this project is absolutely terrible, I am rushing. Please do not judge me

const correctSound = new Audio('correct.mp3');
// const wrongSound = new Audio('wrong.mp3');
const COUNTRY_COUNT = Object.keys(countries).length;
const CHOICE_COUNT = 8;

function generifyInput(countryName) {
    let formattedCountryName = countryName.split(".").join('');
    formattedCountryName = formattedCountryName.split(".").join("");
    formattedCountryName = formattedCountryName.split("ã").join("a");
    formattedCountryName = formattedCountryName.split("é").join("e");
    formattedCountryName = formattedCountryName.split("Å").join("A");
    formattedCountryName = formattedCountryName.toUpperCase();
    return formattedCountryName;
}

const COUNTRY_SUGGESTIONS = Object.keys(countries).map(abbreviation => {
    return {
        countryName: countries[abbreviation].name,
        abbreviation
    }
});

const CAPITAL_SUGGESTIONS = Object.keys(countries).map(abbreviation => {
    return {
        countryName: countries[abbreviation].capital,
        abbreviation
    }
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

const INPUT_MODES = {
    MultipleChoice: 0,
    Typing: 1,
    MapClick: 2
}

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
            choices: this.getChoices(firstCountryChoice),
            previousCountry: null,
            settings: {
                inputMode: INPUT_MODES.MultipleChoice,
                showFlag: true,
                showPreviousCountry: true,
                countryGuess: true
            },
            countryInput: '',
            suggestions: []
        };

        this.guess = this.guess.bind(this);

        document.addEventListener("keydown", this.keyboardListener);
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
                <header className="App-header">
                    {this.settingsBar()}
                    {this.state.settings.showPreviousCountry && <div>Previous country:
                        {this.getCountryPanel(this.state.previousCountry, true)}</div>}
                    <p>Score: {this.state.score.correct + '/' + this.state.score.guesses}

                        &nbsp; ({this.getScorePercentage()})% | Countries
                        remaining {COUNTRY_COUNT - this.countryIndex}</p>
                    {this.getCountryPanel(this.state.country, false)}
                </header>
                <div className="background-color">
                    {this.getAnswerInput()}
                </div>
            </div>
        } else {
            return <p>Loading...</p>
        }
    }

    settingsBar() {
        return <div>
            <button style={{float: 'right', fontSize: 20}}
                    onClick={() => {
                        let settings = this.state.settings;
                        settings.inputMode = (settings.inputMode + 1) % 3;

                        if(settings.inputMode === INPUT_MODES.MapClick) {
                            console.log("here")
                            const country = this.getNextMapCountry(this.state.country);
                            this.setState({country});
                        }

                        console.log(settings.inputMode)
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
                let choiceIndex = 1;
                return <div className="answers">
                    {this.state.choices.map(countryChoice => <button
                        style={{fontSize: '50px', width: '50%', float: 'left', height: '100px'}}
                        onClick={() => this.guess(countryChoice)}>
                        {choiceIndex++ + ' - ' + this.getDisplayForCountry(countryChoice)}</button>)}
                </div>;
            case INPUT_MODES.Typing:
                return <div>
                    <Autosuggest
                        theme={{fontSize: '50px'}}
                        suggestions={this.state.suggestions}
                        onSuggestionsFetchRequested={() => null}
                        onSuggestionsClearRequested={() => this.setState({suggestions: []})}
                        getSuggestionValue={suggestion => suggestion.countryName}
                        renderSuggestion={suggestion => <div className="suggestion">{suggestion.countryName}</div>}
                        inputProps={{
                            placeholder: 'Country Name',
                            value: this.state.countryInput,
                            onChange: (event, {newValue}) => {
                                this.setState({countryInput: newValue})
                                this.filterSuggestions(newValue);
                            }
                        }}
                    />
                    <br/>
                    <button style={{fontSize: 20}} onClick={() => this.guess(null)}>
                        I don't know
                    </button>
                </div>;
            case INPUT_MODES.MapClick:
                return <div style={{border: '20px solid #ffffff'}}>
                    <GuessingMap guess={this.guess} previousCountry={this.state.previousCountry}/>
                </div>
            default: return "";
        }
    }

    getDisplayForCountry(countryChoice) {
        if (this.state.settings.countryGuess) {
            return countries[countryChoice].name;
        } else {
            return countries[countryChoice].capital;
        }
    }

    filterSuggestions(userInput) {
        let suggestions;

        if (this.state.settings.countryGuess) {
            suggestions = COUNTRY_SUGGESTIONS.filter(possibleCountrySuggestion => this.canBeSuggestion(possibleCountrySuggestion, userInput))
        } else {
            suggestions = CAPITAL_SUGGESTIONS.filter(possibleCapitalSuggestion => this.canBeSuggestion(possibleCapitalSuggestion, userInput))
        }

        this.setState({suggestions});
    }

    canBeSuggestion(suggestion, userInput) {
        if (userInput === undefined || userInput === null) {
            return false;
        }

        const countryInputLoose = generifyInput(userInput);

        return generifyInput(suggestion.countryName).startsWith(countryInputLoose);
    }

    keyboardListener = event => {
        if (event.key === "Enter" && this.state.suggestions[0] !== undefined) {
            let countryInput = this.state.countryInput;
            this.setState({countryInput: ""});
            this.filterSuggestions(countryInput);
            this.guess(this.state.suggestions[0].abbreviation);
        } else {
            console.log(event)
            let key = event.key * 1;

            if (key > 0 && key <= CHOICE_COUNT) {
                console.log(key, this.state.choices)
                this.guess(this.state.choices[key - 1]);
            }

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
            return countryShortHands;
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

    hasLoaded() {
        return this.state.country != null && this.state.choices != null;
    }

    guess(countryShorthand) {
        console.log('guess:' + countryShorthand, 'actual:' + this.state.country)
        let score = this.state.score;
        score.guesses++;

        if (countryShorthand === this.state.country) {
            correctSound.play();
            score.correct++;
        }

        const previousCountry = this.state.country;
        const nextCountry = this.getNextCountry();

        this.setState({
            country: nextCountry,
            choices: this.getChoices(nextCountry),
            score,
            previousCountry,
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

        if(this.state === undefined) {
            return countryShortHand;
        }

        if(this.state.settings.inputMode === INPUT_MODES.MapClick) {
            return this.getNextMapCountry(countryShortHand);
        }

        if (this.state && !this.state.settings.showFlag) {
            let country = countries[countryShortHand];

            while (true) {
                this.countryIndex++;
                if(country.capital === 'No Capital') {
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
            if(MAP_COUNTRIES_TO_GUESS.includes(countryShortHand)) {
                return countryShortHand;
            }
        }
    }
}