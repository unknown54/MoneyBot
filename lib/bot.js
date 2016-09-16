const Discord = require('discord.io');
const CleverBot = require('cleverbot-node');
const fs = require('fs');
const RateLimiter = require('limiter').RateLimiter;
const yt = require('youtube-dl');

class DiscordBot {
    constructor(token, config) {
        this.commands = require('./chatcommands').commands;
        this.chatBot = new CleverBot;
        this.io = new Discord.Client({
            token: token
        });

        this.playingAudio = false;
        this.audioQueue = [];

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

    handleAudioEnded() {
        this.playingAudio = false;

        console.log('done playing audio');

        this.playGame('Nothing');

        if (this.audioQueue.length === 0) {
            return;
        }

        const nextVideoObject = this.audioQueue.pop();

        this.playYoutube(nextVideoObject, (playbackMessage) => {
            this.sendMessage(playbackMessage, nextVideoObject.channelID);
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

    joinVoiceChannel(channelID, callback) {
        this.io.joinVoiceChannel(channelID, () => {
            this.joinedVoiceChannel = channelID;
            this.io.getAudioContext(channelID, (what, stream) => {
                this.audioStream = stream;
                this.audioStream.on('fileEnd', this.handleAudioEnded.bind(this));
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

    // youtubeObject: {link: "", channelID: ""}
    playYoutube(youtubeObject, callback) {
        if (!this.audioStream) {
            callback('Shit, No audio stream, can\'t play anything');

            return;
        }

        const matches = youtubeObject.link.match(/youtube\.com\/watch\?v=([^&#]+)/);

        if (!matches) {
            callback('Shit, that doesn\'t look like a youtube link');

            return;
        }

        const id = matches[1];
        const downloadAndPlay = (title) => {
            yt.exec(id, ['-x', '--audio-format',
                'mp3', '-o', 'videos/' + title + '.mp3'
            ], {}, (err, output) => {
                if (err) {
                    console.log(err);

                    callback('Shit, something went wrong trying to get the video');
                    this.playingAudio = false;

                    return;
                }

                console.log(output.join('\n'));

                this.playingAudio = true;
                this.playGame(title);
                this.audioStream.playAudioFile('videos/' + title + '.mp3');
            });
        }

        if (this.playingAudio) {
            callback('Adding video to queue. Currently ' + (this.audioQueue.length + 1) + ' videos before this one.');

            this.audioQueue.unshift(youtubeObject);

            return;
        }

        this.playingAudio = true;

        yt.getInfo(id, (err, info) => {
            if (err) {
                this.playingAudio = true;
                callback('Shit, something went wrong trying to get the video info.');

                return;
            }

            callback('Boutta play: ' + info.title + '. ' + (this.audioQueue.length) + ' videos in queue.');
            downloadAndPlay(info.title);
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
