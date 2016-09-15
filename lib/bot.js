const Discord = require('discord.io');
const CleverBot = require('cleverbot-node');
const RateLimiter = require('limiter').RateLimiter;
const fs = require('fs');

class DiscordBot {
    constructor(token, config) {
        this.commands = require('./chatcommands').commands;
        this.chatBot = new CleverBot;
        this.io = new Discord.Client({
            token: token
        });

        // Servers
        this.servers = config['servers'];

        // Audio Channel
        this.joinedVoiceChannel = '';

        // Audio Stream
        this.audioStream = null;

        // Limiters
        this.weatherLimiter = new RateLimiter(10, 'minute');

        // API keys
        this.weatherunderground = config['weatherunderground'];

        this.addHandlers();
        this.io.connect();
    }

    acceptInvite(inviteURL) {
    	this.io.acceptInvite(inviteURL, (obj) => {
    		console.log(obj);
    	});
    }

    addHandlers() {
        this.io.on('ready', (event) => {
            console.log('Logged in as %s - %s\n', this.io.username, this.io.id);

            for (var server in this.servers) {
            	if (server in this.io.servers) {
            		continue;
            	} else if (server !== '') {
                    this.acceptInvite(this.servers[server].inviteURL);
                }
            }
        });

        this.io.on('message', (user, userID, channelID, message, event) => {
            if (user === this.username) {
                return;
            }

            if (message.indexOf('$') === 0) {
                this.handleMessage(message, user, userID, channelID);
            }
        });
    }

    cleanUp(cleanUpCallback) {
        this.io.setPresence({
            idle_since: 0,
            game: {
                name: 'dead'
            }
        });

        if (!this.joinedVoiceChannel) {
            cleanUpCallback();

            return;
        }

        this.leaveVoiceChannel(this.joinedVoiceChannel, cleanUpCallback);
    }

    handleMessage(message, user, userID, channelID) {
        var split = message.split(" ")
        var command = String(split.splice(0, 1));
        command = command.substring(1, command.length);
        var rest = split.join(" ");

        if (command in this.commands) {
            this.commands[command](this, rest, user, channelID);
        }
    }

    joinVoiceChannel(channelID, callback) {
        this.io.joinVoiceChannel(channelID, () => {
            this.joinedVoiceChannel = channelID;
            this.io.getAudioContext(channelID, (what, stream) => {
                this.audioStream = stream;
                this.audioStream.on('fileEnd', (obj) => {
                    console.log('fileEnd');
                    this.playGame('Nothing');
                });
            });

            callback();
        })
    }

    leaveVoiceChannel(channelID, callback) {
    	console.log('leaving ' + channelID);

        this.audioStream = null;

    	this.io.leaveVoiceChannel(channelID, () => {
            console.log('left ' + channelID);

            this.joinedVoiceChannel = '';

    		callback();
    	});
    }

    playGame(game) {
        this.io.setPresence({
            game: {
                idle_since: 0,
                name: game
            }
        });
    }

    sendMessage(message, channelID) {
        this.io.sendMessage({
            to: channelID,
            message: message
        });
    }
}

exports.DiscordBot = DiscordBot;
