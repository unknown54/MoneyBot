var utils = {
    findServersFromChannelIDs: (bot, channelServerData) => {
        const firstChannelID = channelServerData.firstChannelID;
        const secondChannelID = channelServerData.secondChannelID;
        const servers = {
            firstServer: null,
            secondServer: null
        };

        var foundFirstChannelID = false;
        var foundSecondChannelID = false;
        for (var server in bot.io.servers) {
            for (var channel in bot.io.servers[server].channels) {
                if (channel === firstChannelID) {
                    foundFirstChannelID = true;
                    servers.firstServer = bot.io.servers[server];
                }

                if (channel === secondChannelID) {
                    foundSecondChannelID = true;
                    servers.secondServer = bot.io.servers[server];
                }

                if (foundFirstChannelID && foundSecondChannelID) {
                    return servers;
                }
            }
        }

        return servers;
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
    serverSearch: (bot, channelServerData) => {
        const channelID = channelServerData.channelID;
        const channelName = channelServerData.channelName;
        const channelServerInfo = {
            serverForID: null,
            serverForName: null,
            channel: null
        };

        var foundServerForID = false;
        var foundServerForName = false;
        for (var server in bot.io.servers) {
            for (var channel in bot.io.servers[server].channels) {
                if (channelName
                    && bot.io.servers[server].channels[channel].name.toLowerCase() === channelName.toLowerCase()) {
                        foundServerForName = true;
                        channelServerInfo.serverForName = bot.io.servers[server];
                        channelServerInfo.channel = bot.io.servers[server].channels[channel];
                }

                if (channel === channelID) {
                    foundServerForID = true;
                    channelServerInfo.serverForID = bot.io.servers[server];
                    channelServerInfo.channel = bot.io.servers[server].channels[channel];
                }

                if (foundServerForID && foundServerForName) {
                    return channelServerInfo;
                }
            }
        }

        return channelServerInfo;
    },
}

exports.handle = (bot, command, data) => {
    if (command in utils) {
    	return utils[command](bot, data);
    }
}
