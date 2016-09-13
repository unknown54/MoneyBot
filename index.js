var DiscordBot = require('./bot').DiscordBot

var bot = new DiscordBot('', '');

process.on('SIGINT', () => {
    bot.io.setPresence({
        idle_since: 0,
        game: {
            name: 'dead'
        }
    });
    process.exit(0);
})
