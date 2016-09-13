var utils = {
    // Used by $forecast
    // Parses and returns the forecast string
    // bot - Reference to the bot
    // forecastData - Data from the api call to weatherunderground
    parseForecastData: (bot, forecastData) => {
        var parsedJSON = forecastData['json'];
        var tomorrow = forecastData['tomorrow'];
        var returnStrings = [];

        var forecast = {
            'todayDay': parsedJSON['forecast']['txt_forecast']['forecastday'][0],
            'todayNight': parsedJSON['forecast']['txt_forecast']['forecastday'][1],
            'tomorrowDay': parsedJSON['forecast']['txt_forecast']['forecastday'][2],
            'tomorrowNight': parsedJSON['forecast']['txt_forecast']['forecastday'][3]
        };

        var location = parsedJSON['current_observation']['display_location']['full'];

        if (tomorrow) {
            if ((location.split(', ')[1]).length != 2) {
                returnStrings.push('Location: ' +
                    location + ' Tomorrow: ' +
                    forecast['tomorrowDay']['fcttext_metric']);

                returnStrings.push('Tomorrow Night: ' +
                    forecast['tomorrowNight']['fcttext_metric']);
            } else {
                returnStrings.push('Location: ' +
                    location + ' Tomorrow: ' +
                    forecast['tomorrowDay']['fcttext']);

                returnStrings.push('Tomorrow Night: ' +
                    forecast['tomorrowNight']['fcttext']);
            }
        } else {
            if ((location.split(', ')[1]).length != 2) {
                returnStrings.push('Location: ' +
                    location + ' Today: ' +
                    forecast['todayDay']['fcttext_metric']);

                returnStrings.push('Tonight: ' +
                    forecast['todayNight']['fcttext_metric']);
            } else {
                returnStrings.push('Location: ' +
                    location + ' Today: ' +
                    forecast['todayDay']['fcttext']);

                returnStrings.push('Tonight: ' +
                    forecast['todayNight']['fcttext']);
            }
        }

        return returnStrings;
    }
}

exports.handle = (bot, command, data) => {
    if (command in utils) {
    	return utils[command](bot, data);
    }
}
