var Discord = require('discord.io');
var CleverBot = require('cleverbot-node');

class DiscordBot {
    constructor(token, inviteURL) {
        this.commands = {};
        this.inviteURL = inviteURL;
        this.chatBot = new CleverBot;
        this.io = new Discord.Client({
            token: token
        });

        this.addHandlers();
        this.addCommands();
        this.io.connect();
    }

    addCommands() {
        var self = this;

        this.commands = {
            ask: (message, user, channelID) => {
                var answers = ["Yes", "No"];
                var answer = answers[Math.floor(Math.random() * 2)];
                self.sendMessage('[Ask: ' + message + '] ' + answer, channelID);
            },
            nerds: (message, user, channelID) => {
                self.sendMessage('nerds', channelID);
            },
            play: (message, user, channelID) => {
                self.playGame(message);
            },
            talk: (message, user, channelID) => {
                CleverBot.prepare(() => {
                    self.chatBot.write(message, (response) => {
                        self.sendMessage(response.message, channelID);
                    });
                });
            }
        }
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

            if (message.indexOf('$') === 0) {
                self.handleMessage(message, user, userID, channelID);
            }
        });
    }

    handleMessage(message, user, userID, channelID) {
        var split = message.split(" ")
        var command = String(split.splice(0, 1));
        command = command.substring(1, command.length);
        var rest = split.join(" ");

        if (command in this.commands) {
            this.commands[command](rest, user, channelID);
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
