var DiscordBot = require('./lib/bot').DiscordBot
var config = require('./lib/config');

var bot = null;

config.load(config => {
    bot = new DiscordBot('', '', config);
});


process.on('SIGINT', () => {
    bot.io.setPresence({
        idle_since: 0,
        game: {
            name: 'dead'
        }
    });
    process.exit(0);
})
