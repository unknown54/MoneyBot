var utils = {
    findServerAssociatedWithChannel: (bot, channelServerData) => {
        const channelID = channelServerData.channelID;
        const channelName = channelServerData.channelName;

        for (var server in bot.io.servers) {
            for (var channel in bot.io.servers[server].channels) {
                if (channelName
                    && bot.io.servers[server].channels[channel].name.toLowerCase() === channelName.toLowerCase()) {
                        return { server: bot.io.servers[server], channel: bot.io.servers[server].channels[channel] };
                } else if (channel === channelID) {
                    return { server: bot.io.servers[server], channel: bot.io.servers[server].channels[channel] };
                }
            }
        }

        return null;
    },
    findServerMessageComesFrom: (bot, channelServerData) => {
        const channelID= channelServerData.channelID;

        for (var server in bot.io.servers) {
            for (var channel in bot.io.servers[server].channels) {
                if (channel === channelID) {
                    return bot.io.servers[server];
                }
            }
        }

        return null;
    },
    // Used by $forecast
    // Parses and returns the forecast string
    // bot - Reference to the bot
    // forecastData - Data from the api call to weatherunderground
    parseForecastData: (bot, forecastData) => {
        const parsedJSON = forecastData['json'];
        const tomorrow = forecastData['tomorrow'];
        const returnStrings = [];
        const forecast = {
            'todayDay': parsedJSON['forecast']['txt_forecast']['forecastday'][0],
            'todayNight': parsedJSON['forecast']['txt_forecast']['forecastday'][1],
            'tomorrowDay': parsedJSON['forecast']['txt_forecast']['forecastday'][2],
            'tomorrowNight': parsedJSON['forecast']['txt_forecast']['forecastday'][3]
        };

        var location = parsedJSON['current_observation']['display_location']['full'];

        if (tomorrow) {
            if ((location.split(', ')[1]).length !== 2) {
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
            if ((location.split(', ')[1]).length !== 2) {
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
    },
}

exports.handle = (bot, command, data) => {
    if (command in utils) {
    	return utils[command](bot, data);
    }
}
