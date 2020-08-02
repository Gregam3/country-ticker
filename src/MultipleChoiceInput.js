import React from "react";
import countries from "./countries.json";

export class MultipleChoiceInput extends React.Component {
    constructor(props) {
        super(props);
        this.getDisplayValueForCountry = props.getDisplayValueForCountry;
        this.guess = props.guess;
        this.state = {
            choices: props.choices
        }
    }



    render() {
        let choiceIndex = 1;
        return <div className="answers">
            {this.state.choices.map(countryChoice => <button
                style={{fontSize: '50px', width: '50%', float: 'left', height: '100px'}}
                onClick={() => this.guess(countryChoice)}>
                {choiceIndex++ + ' - ' + this.getDisplayValueForCountry(countryChoice)}</button>)}
        </div>;
    }
}