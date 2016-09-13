var Discord = require('discord.io');

class DiscordBot {
    constructor(token, inviteURL) {
        this.inviteURL = inviteURL;
        this.io = new Discord.Client({
            token: token
        });

        this.addHandlers();
        this.io.connect();
    }

    addHandlers() {
        var self = this;

        this.io.on('ready', function(event) {
            console.log('Logged in as %s - %s\n', self.io.username, self.io.id);

            if (self.io.servers === {}) {
                self.io.acceptInvite(self.inviteURL, (obj) => {
                    console.log(obj);
                });
            }
        });

        this.io.on('message', function(user, userID, channelID, message, event) {
            console.log('message');

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

    }
}

exports.DiscordBot = DiscordBot;
