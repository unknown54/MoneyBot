var DiscordBot = require('./lib/bot').DiscordBot
var config = require('./lib/config');

config.load(config => {
    var bot = new DiscordBot('', '', config);
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
