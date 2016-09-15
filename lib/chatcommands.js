const api = require('./api');
const CleverBot = require('cleverbot-node');
const fs = require('fs');
const utils = require('./utils');
const yt = require('youtube-dl');

exports.commands = {
	ask: (bot, message, user, channelID) => {
		var answers = ['Yes', 'No'];
		var answer = answers[Math.floor(Math.random() * 2)];

		bot.sendMessage('[Ask: ' + message + '] ' + answer, channelID);
	},
	forecast: (bot, message, user, channelID) => {
		if (!bot.weatherunderground || !message) {
			return;
		}

		var now = Date.now()
		var waitTime =
			((bot.weatherLimiter.curIntervalStart + bot.weatherLimiter.tokenBucket.interval) - now) / 1000;

		if (bot.weatherLimiter.getTokensRemaining() < 1) {
			bot.sendMessage('Too many requests sent. Available in: ' + waitTime + ' seconds', channelID);
			return;
		}

		var tomorrow = message.match('tomorrow');

		if (tomorrow) {
			message = message.replace(/tomorrow/ig, '');
		}

		var postAPI = resp => {
			var parsedJSON = JSON.parse(resp);
			if (parsedJSON['response']['error'] || parsedJSON['response']['results']) {
				return bot.sendMessage('Error', channelID);
			}

			var forecastData = {
				json: parsedJSON,
				tomorrow: tomorrow
			};

			var forecastStrings = utils.handle(bot, 'parseForecastData', forecastData);

			// Send the forecast
			for (var i = 0; i < forecastStrings.length; i++) {
				bot.sendMessage(forecastStrings[i], channelID);
			}
		}

		bot.weatherLimiter.removeTokens(1, () => {
			api.APICall(message, 'forecast', bot.weatherunderground, postAPI);
		});
	},
	join: (bot, message, user, channelID) => {
		main: for (var server in bot.io.servers) {
			for (var channel in bot.io.servers[server].channels) {
				if (!(bot.io.servers[server].channels[channel].name === message)) {
					continue;
				}

				if (!(bot.io.servers[server].channels[channel].type === 'voice')) {
					bot.sendMessage('This channel is a text channel, I can only join voice channels.', channelID);
					break main;
				} else {
					bot.joinVoiceChannel(channel, () => {
						bot.sendMessage('I am here', channelID);
					});
					break main;
				}
			}
		}
	},
	nerds: (bot, message, user, channelID) => {
		bot.sendMessage('nerds', channelID);
	},
	play: (bot, message, user, channelID) => {
		bot.playGame(message);
	},
	// playAudio: (bot, message, user, channelID) => {
	// 	if (bot.joinedVoiceChannel === '') {
	// 		return;
	// 	}
	//
	//     if (!bot.audioStream) {
	//         bot.sendMessage('No audio stream, can\'t play anything', channelID);
	//
	//         return;
	//     }
	//
	// 	bot.audioStream.playAudioFile('/Users/eriklittle/Desktop/Sore wa Chīsana Hikari no yō na.mp3', (obj) => {
	//         console.log(obj);
	//     });
	// },
	talk: (bot, message, user, channelID) => {
		CleverBot.prepare(() => {
			bot.chatBot.write(message, response => {
				bot.sendMessage(response.message, channelID);
			});
		});
	},
	stopAudio: (bot, message, user, channelID) => {
		if (!bot.audioStream) {
			bot.sendMessage('Shit, no audio stream to stop playing from.', channelID);

			return;
		}

		bot.audioStream.stopAudioFile();
	},
	weather: (bot, message, user, channelID) => {
		if (!bot.weatherunderground) {
			return bot.sendMessage('No weatherunderground API key!', channelID);
		} else if (!message) {
			return;
		}

		var now = Date.now();
		var waitTime =
			((bot.weatherLimiter.curIntervalStart + bot.weatherLimiter.tokenBucket.interval) - now) / 1000;

		if (bot.weatherLimiter.getTokensRemaining() < 1) {
			bot.sendMessage('Too many requests sent. Available in: ' + waitTime + ' seconds', channelID);
			return;
		}

		var postAPI = resp => {
			var parsedJSON = JSON.parse(resp);
			if (parsedJSON['response']['error'] || parsedJSON['response']['results']) {
				return bot.sendMessage('Error', channelID);
			}

			var location = parsedJSON['current_observation']['display_location']['full'];
			var temp_f = parsedJSON['current_observation']['temp_f'];
			var temp_c = parsedJSON['current_observation']['temp_c'];
			var date = parsedJSON['current_observation']['observation_time'];
			var weather = parsedJSON['current_observation']['weather'];

			bot.sendMessage('Currently ' +
				weather + ' and ' +
				temp_f + 'F ' + '(' +
				temp_c + 'C) in ' +
				location + '. ' + date, channelID)
		}

		bot.weatherLimiter.removeTokens(1, () => {
			api.APICall(message, 'weather', bot.weatherunderground, postAPI);
		})
	},
	youtube: (bot, message, user, channelID) => {
		if (!bot.audioStream) {
			bot.sendMessage('No audio stream, can\'t play anything', channelID);

			return;
		}

		const matches = message.match(/youtube\.com\/watch\?v=([^&#]+)/);

		if (!matches) {
			bot.sendMessage('Shit, that doesn\'t look like a youtube link', channelID);

			return;
		}

		const id = matches[1];
		const downloadAndPlay = (title) => {
			yt.exec(id, ['-x', '--audio-format',
				'mp3', '-o', 'videos/' + title + '.mp3'
			], {}, (err, output) => {
				if (err) {
					console.log(err);

					bot.sendMessage('Shit, something went wrong trying to get the video', channelID);

					return;
				}

				console.log(output.join('\n'));

				bot.playGame(title);
				bot.audioStream.playAudioFile('videos/' + title + '.mp3');
			});
		}

		yt.getInfo(id, (err, info) => {
			if (err) {
				bot.sendMessage('Shit, something went wrong trying to get the video info.', channelID);

				return;
			}

			bot.sendMessage('Boutta play: ' + info.title, channelID);
			downloadAndPlay(info.title);
		});
	},
}
