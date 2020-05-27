import React from 'react';
import './App.css';
import countries from './countries.json';

const COUNTRY_COUNT = Object.keys(countries).length;
const CHOICE_COUNT = 8;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

class App extends React.Component {
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
            previousCountry: null
        };

        document.addEventListener("keydown", this.keypressToChoice);
    }

    populateCountryIndexMap() {
        let randomCountryIndexes = shuffleArray([...Array(COUNTRY_COUNT).keys()]);

        for (let countriesKey in countries) {
            console.log(randomCountryIndexes)
            this.countryIndexMap[randomCountryIndexes[0]] = countriesKey;
            randomCountryIndexes.shift();
        }
    }

    render() {
        let choiceCount = 1;

        if (this.hasLoaded()) {
            return <div className="App">
                <header className="App-header">
                    Previous country:
                    {this.getCountryPanel(this.state.previousCountry, true)}
                    <p>Score: {this.state.score.correct + '/' + this.state.score.guesses}
                        &nbsp; ({this.getScorePercentage()})% | Countries remaining {COUNTRY_COUNT - this.countryIndex}</p>
                    {this.getCountryPanel(this.state.country, false)}
                </header>
                <div className="answers">
                    {this.state.choices.map(countryChoice => <button
                        style={{fontSize: '50px', width: '50%', float: 'left', height: '100px'}}
                        onClick={() => this.guess(countryChoice)}>
                        {choiceCount++ + ' - ' + countries[countryChoice].name}</button>)}
                </div>
            </div>
        } else {
            return <p>Loading...</p>
        }
    }

    keypressToChoice = event => {
        let key = event.key * 1;

        console.log(key)

        if (key > 0 && key <= CHOICE_COUNT) {
            console.log(key, this.state.choices)
            this.guess(this.state.choices[key - 1]);
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
                <img src={this.getFlag(countryKey)} className='flag' alt="flag"/>
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

        return <>{(this.state.score.correct / this.state.score.guesses) * 100}</>;
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
            score.correct++;
        }

        const previousCountry = this.state.country;
        const nextCountry = this.getNextCountry();

        this.setState({
            country: nextCountry,
            choices: this.getChoices(nextCountry),
            score,
            previousCountry
        });
    }

    getNextCountry() {
        if(this.countryIndex === COUNTRY_COUNT) {
            this.countryIndex = 0;
            alert("You have completed 1 loop of all countries!")
            this.populateCountryIndexMap();
        }

        return this.countryIndexMap[this.countryIndex++];
    }
}

export default App;