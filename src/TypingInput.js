import Autosuggest from "react-autosuggest";
import React from "react";
import countries from "./countries.json";

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

export class TypingInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            suggestions: [],
            countryInput: '',

        };

        document.addEventListener("keydown", this.multipleChoiceAnswerKeyListener);
    }

    render() {
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

    multipleChoiceAnswerKeyListener(event) {
        if (event.key === "Enter" && this.state.suggestions[0] !== undefined) {
            let countryInput = this.state.countryInput;
            this.setState({countryInput: ""});
            this.filterSuggestions(countryInput);
            this.guess(this.state.suggestions[0].abbreviation);
        }
    }
}