var DiscordBot = require('./lib/bot').DiscordBot
var config = require('./lib/config');

var bot = null;

config.load(config => {
    bot = new DiscordBot('', config);
});


process.on('SIGINT', () => {
    bot.cleanUp(() => {
        console.log('Clean up before exit');
    });

    // Bot has 1 second to clean up before we exit
    setTimeout(process.exit, 1000);
})
