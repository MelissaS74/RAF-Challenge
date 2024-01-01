function calculateLocationScore(runwayLocation, acceptableLocations) {
    return acceptableLocations.includes(runwayLocation) ? 1 : 0;
}

function calculateSurfaceTypeScore(surfaceType, acceptableSurfaceTypes) {
    return acceptableSurfaceTypes.includes(surfaceType) ? 1 : 0;
}

function calculateLengthScore(runwayLength, requiredRunwayLength) {
    const normalizedLengthDifference = Math.min(1, (runwayLength - requiredRunwayLength) / requiredRunwayLength);

    return 1 - normalizedLengthDifference;
}

const runwayData = [
    { airport: 'Kidal Airport', surfaceType: 'Unpaved', length: 6234, country: 'Mali' },
    { airport: 'Gao Airport', surfaceType: 'Asphalt', length: 8202, country: 'Mali' },
    { airport: 'Timbuktu Airport', surfaceType: 'Asphalt', length: 6923, country: 'Mali' },
    { airport: 'Kayes Dag Airport', surfaceType: 'Asphalt', length: 5267, country: 'Mali' },
];

const aircraftSpecs = [
    {
        aircraftType: 'Eurofighter Typhoon',
        requiredRunwayLength: 2297,
        acceptableSurfaceTypes: ['Paved', 'Asphalt'],
        acceptableLocations: ['Gao Airport', 'Timbuktu Airport', 'Kayes Dag Airport']
    },
    {
        aircraftType: 'Lockheed Martin F-35 Lightning II',
        requiredRunwayLength: 550,
        acceptableSurfaceTypes: ['Asphalt'],
        acceptableLocations: ['Gao Airport', 'Timbuktu Airport', 'Kayes Dag Airport']
    },
    {
        aircraftType: 'Airbus A400M Atlas',
        requiredRunwayLength: 3215,
        acceptableSurfaceTypes: ['Concrete', 'Asphalt', 'Unpaved'],
        acceptableLocations: ['Kidal Airport', 'Gao Airport', 'Timbuktu Airport', 'Kayes Dag Airport']
    }
];

// Create a mapping of countries to airports
const countryToAirportsMap = runwayData.reduce((acc, runway) => {
    const country = runway.country.toLowerCase();
    if (!acc[country]) {
        acc[country] = [];
    }
    acc[country].push(runway.airport.toLowerCase());
    return acc;
}, {});

function calculateRunwayScore(runway, aircraftSpec) {
    const locationWeight = 1;
    const surfaceTypeWeight = 1;
    const lengthWeight = 1;

    const runwayLocation = runway.airport;
    const surfaceType = runway.surfaceType;
    const runwayLength = runway.length;

    const requiredRunwayLength = aircraftSpec.requiredRunwayLength;
    const acceptableSurfaceTypes = aircraftSpec.acceptableSurfaceTypes;
    const acceptableLocations = aircraftSpec.acceptableLocations;

    const locationScore = calculateLocationScore(runwayLocation, acceptableLocations);
    const surfaceTypeScore = calculateSurfaceTypeScore(surfaceType, acceptableSurfaceTypes);
    const lengthScore = calculateLengthScore(runwayLength, requiredRunwayLength);

    const overallScore =
        locationWeight * locationScore + surfaceTypeWeight * surfaceTypeScore + lengthWeight * lengthScore;

    return {
        ...runway,
        overallScore: parseFloat(overallScore.toFixed(3)), // Round to 3 decimal places
        locationScore,
        surfaceTypeScore,
        lengthScore,
        surfaceType: runway.surfaceType,
        length: runway.length
    };
}

function findTopRunways() {
    const aircraftTypeInput = document.getElementById('aircraftType').value.toLowerCase();
    const countryInput = document.getElementById('country').value.toLowerCase();

    console.log('aircraftTypeInput:', aircraftTypeInput);
    console.log('countryInput:', countryInput);

    const airportsInCountry = countryToAirportsMap[countryInput];

    if (!airportsInCountry) {
        // No airports found for the given country
        const runwayResultsDiv = document.getElementById('runwayResults');
        runwayResultsDiv.innerHTML = 'No airports found for the given country.';
        return;
    }

    const scoredRunways = [];

    runwayData.forEach(runway => {
        const matchingAircraftSpec = aircraftSpecs.find(spec =>
            spec.aircraftType.toLowerCase() === aircraftTypeInput &&
            spec.acceptableLocations.map(location => location.toLowerCase()).includes(runway.airport.toLowerCase())
        );

        if (matchingAircraftSpec) {
            const score = calculateRunwayScore(runway, matchingAircraftSpec);

            scoredRunways.push({
                ...runway,
                score: score.overallScore
            });
        }
    });

    console.log('scoredRunways:', scoredRunways);

    // Sort the scored runways by score in descending order
    scoredRunways.sort((a, b) => b.score - a.score);

    // Extract the top runways
    const topRunways = scoredRunways.slice(0, 3);

    // Display results in HTML
    displayResultsInHTML(topRunways.length > 0 ? topRunways : null);
}

function displayResultsInHTML(topRunways) {
    const runwayResultsDiv = document.getElementById('runwayResults');
    runwayResultsDiv.innerHTML = '';

    if (topRunways && topRunways.length > 0) {
        topRunways.forEach(result => {
            const locationDiv = document.createElement('div');
            locationDiv.classList.add('runway-item');

            const locationHeader = document.createElement('h2');
            locationHeader.textContent = `Location: ${result.airport}`;
            locationDiv.appendChild(locationHeader);

            const surfaceTypeDetails = document.createElement('p');
            surfaceTypeDetails.textContent = `Surface Type: ${result.surfaceType}`;
            locationDiv.appendChild(surfaceTypeDetails);

            const runwayLengthDetails = document.createElement('p');
            runwayLengthDetails.textContent = `Runway Length (ft): ${result.length}`;
            locationDiv.appendChild(runwayLengthDetails);

            const runwayScoreDetails = document.createElement('p');
            runwayScoreDetails.textContent = `Score: ${result.score}`;
            locationDiv.appendChild(runwayScoreDetails);

            runwayResultsDiv.appendChild(locationDiv);
        });
    } else {
        // No matching runways found
        const noRunwaysMessage = document.createElement('p');
        noRunwaysMessage.textContent = 'No matching runways found.';
        runwayResultsDiv.appendChild(noRunwaysMessage);
    }
}
