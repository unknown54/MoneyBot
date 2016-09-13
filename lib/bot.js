var Discord = require('discord.io');
var CleverBot = require('cleverbot-node');
var RateLimiter = require("limiter").RateLimiter;

class DiscordBot {
    constructor(token, inviteURL, config) {
        this.commands = require('./chatcommands').commands;
        this.inviteURL = inviteURL;
        this.chatBot = new CleverBot;
        this.io = new Discord.Client({
            token: token
        });
        this.weatherLimiter = new RateLimiter(10, 'minute');

        // API keys
        this.weatherunderground = config['weatherunderground'];

        this.addHandlers();
        this.io.connect();
    }

    addHandlers() {
        this.io.on('ready', (event) => {
            console.log('Logged in as %s - %s\n', this.io.username, this.io.id);

                this.io.acceptInvite(this.inviteURL, (obj) => {
                    console.log(obj);
                });
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

    handleMessage(message, user, userID, channelID) {
        var split = message.split(" ")
        var command = String(split.splice(0, 1));
        command = command.substring(1, command.length);
        var rest = split.join(" ");

        if (command in this.commands) {
            this.commands[command](this, rest, user, channelID);
        }
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
