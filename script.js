// Sumaiyah & Melissa - Weather functionality

let fullForecastData = [];
let chart;
async function getWeather() {
    let zip = document.getElementById("zip").value;
    let loading = document.getElementById("loading");

    if (zip === "") {
        alert("Enter a ZIP code");
        return;
    }

    loading.innerText = "Loading...";

    try {
        // ZIP -> coordinates
        let geoRes = await fetch(`https://api.zippopotam.us/us/${zip}`);
        let geoData = await geoRes.json();

        let lat = geoData.places[0].latitude;
        let lon = geoData.places[0].longitude;

        // coordinates -> forecast
        let pointRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
        let pointData = await pointRes.json();

        let forecastURL = pointData.properties.forecast;
        let hourlyURL = pointData.properties.forecastHourly;
        // normal forecast
        let weatherRes = await fetch(forecastURL);
        let weatherData = await weatherRes.json();
        let today = weatherData.properties.periods[0];

        // hourly forecast 
        let hourlyRes = await fetch(hourlyURL);
        let hourlyData = await hourlyRes.json();

        fullForecastData = hourlyData.properties.periods;

        // display
        document.getElementById("location").innerText =
            geoData.places[0]["place name"];

        document.getElementById("temp").innerText =
            "Temp: " + today.temperature + "°F";

        document.getElementById("forecast").innerText =
            today.shortForecast;

        suggestActivities(today.shortForecast);

        loading.innerText = "";

    } catch (error) {
        loading.innerText = "";
        alert("Invalid ZIP or error loading data");
        console.log(error);
    }
}

// activities 
function suggestActivities(weather) {
    let list = document.getElementById("activities");
    list.innerHTML = "";

    let activities;

    if (weather.includes("Rain")) {
        activities = ["Watch movies", "Go to a museum", "Bake something"];
    } else if (weather.includes("Sunny") || weather.includes("Clear")) {
        activities = ["Go to the park", "Take a walk", "Hang out outside"];
    } else if (weather.includes("Snow")) {
        activities = ["Build a snowman", "Drink hot chocolate", "Stay cozy"];
    } else {
        activities = ["Read a book", "Go to a cafe", "Relax at home"];
    }

    for (let i = 0; i < activities.length; i++) {
        let li = document.createElement("li");
        li.innerText = activities[i];
        list.appendChild(li);
    }
}
function updateChart() {
    let range = parseInt(document.getElementById("timeRange").value);
    let type = document.getElementById("chartType").value;
    let unit = document.getElementById("unitToggle").value;


    // slice data
    let dataSlice = fullForecastData.slice(0, range);

    let labels = dataSlice.map(p => {
        let date = new Date(p.startTime);

        let hours = date.getHours();
        let minutes = date.getMinutes();

        let ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; 

        minutes = minutes.toString().padStart(2, "0");

        return `${hours}:${minutes} ${ampm}`;
    });
    let temps = dataSlice.map(p => {
        let t = p.temperature;

        // convert 
        if (unit === "C") {
            return Math.round((t - 32) * (5 / 9));
        }
        return t;
    });

    renderChart(labels, temps, type, unit);
}

function renderChart(labels, temps, type) {
    let ctx = document.getElementById("weatherChart").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°${unit})',
                data: temps,
                fill: false,
                tension: 0.3
            }]
        }
    });
}