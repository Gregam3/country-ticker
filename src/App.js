import React from 'react';
import './App.css';
import countries from './countries.json';
import Autosuggest from 'react-autosuggest';

const correctSound = new Audio('correct.mp3');
const wrongSound = new Audio('wrong.mp3');
const COUNTRY_COUNT = Object.keys(countries).length;
const CHOICE_COUNT = 8;

function formatCountry(countryName) {
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
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
                multipleChoice: true,
                showFlag: true,
                showPreviousCountry: true
            },
            countryInput: '',
            suggestions: []
        };

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
                        settings.multipleChoice = !settings.multipleChoice;
                        this.setState({settings});
                    }}>Toggle input mode
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
        </div>;
    }

    getAnswerInput() {
        if (this.state.settings.multipleChoice) {
            let choiceIndex = 1;
            return <div className="answers">
                {this.state.choices.map(countryChoice => <button
                    style={{fontSize: '50px', width: '50%', float: 'left', height: '100px'}}
                    onClick={() => this.guess(countryChoice)}>
                    {choiceIndex++ + ' - ' + countries[countryChoice].name}</button>)}
            </div>;
        } else {
            return (
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
                />)
        }
    }

    filterSuggestions(countryInput) {
        console.log(countryInput)
        this.setState(
            {
                suggestions: COUNTRY_SUGGESTIONS
                    .filter(suggestion => this.compareSuggestionWithAnswer(suggestion, countryInput))
            }
        );
    }

    compareSuggestionWithAnswer(suggestion, countryInput) {
        if (countryInput === undefined || countryInput === null) {
            return false;
        }

        const countryInputLoose = formatCountry(countryInput);

        return formatCountry(suggestion.countryName).startsWith(countryInputLoose);
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
                <p>Capital: {country.capital} | Correct Answer: {country.name}</p>
            </div>;
        } else {
            return <div>
                {this.state.settings.showFlag && <img src={this.getFlag(countryKey)} className='flag' alt="flag"/>}
                <p>Capital: {country.capital}</p>
            </div>;
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
        } else {
            wrongSound.play();
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

        let country = this.countryIndexMap[this.countryIndex++];
        if (this.state && !this.state.settings.showFlag) {
            while (country.capital === '') {
                country = this.countryIndexMap[this.countryIndex++]
            }
        }

        return country;
    }
}