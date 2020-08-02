export function generifyInput(countryName) {
    let formattedCountryName = countryName.split(".").join('');
    formattedCountryName = formattedCountryName.split(".").join("");
    formattedCountryName = formattedCountryName.split("ã").join("a");
    formattedCountryName = formattedCountryName.split("é").join("e");
    formattedCountryName = formattedCountryName.split("Å").join("A");
    formattedCountryName = formattedCountryName.toUpperCase();
    return formattedCountryName;
}

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}
