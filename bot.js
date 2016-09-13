var Discord = require('discord.io');
var CleverBot = require('cleverbot-node');

class DiscordBot {
    constructor(token, inviteURL) {
        this.inviteURL = inviteURL;
        this.chatBot = new CleverBot;
        this.io = new Discord.Client({
            token: token
        });

        this.addHandlers();
        this.io.connect();
    }

    addHandlers() {
        var self = this;

        this.io.on('ready', (event) => {
            console.log('Logged in as %s - %s\n', self.io.username, self.io.id);

            if (self.io.servers === {}) {
                self.io.acceptInvite(self.inviteURL, (obj) => {
                    console.log(obj);
                });
            }
        });

        this.io.on('message', (user, userID, channelID, message, event) => {
            if (user === self.username) {
                return;
            }

            if (message === 'ping') {
                self.io.sendMessage({
                    to: channelID,
                    message: 'pong'
                });
            } else if (message.indexOf('$') === 0) {
                self.handleMessage(message, user, userID, channelID);
            }
        });
    }

    handleMessage(message, user, userID, channelID) {
        var self = this;
        var split = message.split(" ")
        var command = String(split.splice(0, 1));
        command = command.substring(1, command.length);
        var rest = split.join(" ");

        if (command === 'nerds') {
            this.sendMessage('nerds', channelID);
        } else if (command === 'talk') {
            CleverBot.prepare(() => {
            	self.chatBot.write(rest, (response) => {
            		self.sendMessage(response.message, channelID);
            	});
            });
        } else if (command === 'play') {
            this.playGame(rest);
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
