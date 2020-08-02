import React from "react";
import {
    ZoomableGroup,
    ComposableMap,
    Geographies,
    Geography
} from "react-simple-maps";

const geoUrl =
    "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

class GuessingMap extends React.Component {
    constructor(props) {
        super(props);
        this.guess = props.guess;
    }

    render() {
        return (
            <ComposableMap data-tip="" projectionConfig={{scale: 150}}>
                <ZoomableGroup>
                    <Geographies geography={geoUrl}>
                        {({geographies}) =>
                            geographies.map(geo => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onClick={() => {
                                            console.log(geo.properties.ISO_A2)
                                            this.guess(geo.properties.ISO_A2)
                                        }}
                                        style={{
                                            default: {
                                                fill: "#D6D6DA",
                                                outline: "none"
                                            },
                                            hover: {
                                                fill: "#F53",
                                                outline: "none"
                                            }
                                        }}
                                    />
                                )
                            )
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>
        );
    }
}

export default GuessingMap;
