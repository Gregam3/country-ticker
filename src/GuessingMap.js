import React from "react";
import {
    ZoomableGroup,
    ComposableMap,
    Geographies,
    Geography
} from "react-simple-maps";

const geoUrl =
    "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

const normalStyle = {
    default: {
        fill: "#D6D6DA",
        outline: "none"
    },
    hover: {
        fill: "#F53",
        outline: "none"
    }
};

const previousGuessStyle = {
    default: {
        fill: "#228B22",
        outline: "none",
    }
};

class GuessingMap extends React.Component {
    constructor(props) {
        super(props);
        this.guess = props.guess;
        this.state = {
            previousCountry: props.previousCountry
        };
    }

    componentWillReceiveProps(nextProps, x) {
        this.setState({previousCountry: nextProps.previousCountry});
    }

    render() {
        return (
            <ComposableMap data-tip="" projectionConfig={{scale: 200}}>
                <ZoomableGroup>
                    <Geographies geography={geoUrl}>
                        {({geographies}) =>
                            geographies.map(geo => this.getGeography(geo))
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>
        );
    }

    getGeography(geo) {
        if (geo.properties.ISO_A2 === this.state.previousCountry) {
            return this.getGeographyElement(geo, previousGuessStyle);
        }

        return this.getGeographyElement(geo, normalStyle);
    }

    getGeographyElement(geo, style) {
        return <Geography
            key={geo.rsmKey}
            geography={geo}
            onClick={() => {
                console.log(geo.properties.ISO_A2)
                this.guess(geo.properties.ISO_A2)
            }}
            style={style}
        />;
    }
}

export default GuessingMap;
