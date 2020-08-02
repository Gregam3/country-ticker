import Autosuggest from "react-autosuggest";
import React from "react";

export class TypingInput extends React.Component {
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
}