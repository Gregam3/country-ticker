import React from 'react';
import './App.css';
import countries from './countries.json';

const COUNTRY_COUNT = Object.keys(countries).length;
const CHOICE_COUNT = 4;

class App extends React.Component {

    constructor(props) {
        super(props);

        const firstCountryChoice = this.getRandomCountryShortHand();
        this.state = {
            score: {
                guesses: 0, correct: 0
            },
            country: firstCountryChoice,
            choices: this.getChoices(firstCountryChoice),
            previousCountry: null
        };
    }

    render() {
        if (this.hasLoaded()) {
            return <div className="App">
                <header className="App-header">
                    Previous country:
                    {this.getCountryPanel(this.state.previousCountry, true)}
                    <p>Score: {this.state.score.correct + '/' + this.state.score.guesses}
                        &nbsp; ({this.getScorePercentage()})%</p>
                    {this.getCountryPanel(this.state.country, false)}
                </header>
                <div className="answers">
                    {this.state.choices.map(countryChoice => <button
                        style={{fontSize: '50px', width: '50%', float: 'right', height: '100px'}}
                        onClick={() => this.guess(countryChoice)}>
                        {countries[countryChoice].name}</button>)}
                </div>
            </div>
        } else {
            return <p>Loading...</p>
        }
    }

    getCountryPanel(countryKey, isPrevious) {
        if(countryKey == null) {
            return <p>No previous guesses!</p>
        }

        const country = countries[countryKey];

        if(isPrevious) {
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

    getRandomCountryShortHand() {
        const nextCountryIndex = Math.floor(Math.random() * COUNTRY_COUNT);
        return Object.keys(countries)[nextCountryIndex];
    }

    getChoices(correctAnswer) {
        let incorrectAnswers = [...Array(CHOICE_COUNT - 1).keys()].map(_ => this.getRandomCountryShortHand());

        return [...incorrectAnswers, correctAnswer];
    }

    hasLoaded() {
        console.log("loading check", this.state.country, this.state.choices)
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
        const nextCountry = this.getRandomCountryShortHand();

        this.setState({
            country: nextCountry,
            choices: this.getChoices(nextCountry),
            score,
            previousCountry
        });
    }
}

export default App;