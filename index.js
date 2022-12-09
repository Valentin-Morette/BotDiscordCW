const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function compare(a, b) {
  if (a[1].score < b[1].score) return 1;
  if (a[1].score > b[1].score) return -1;
  return 0;
}

dotenv.config();

const clientCw = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

clientCw.on('ready', () => {
  console.log('Bot Codewars Ready!');
});

// Le bot écoute les messages sur le serveur
clientCw.on('messageCreate', (message) => {
  if (message.content === '!ping' && message.author.bot === false) {
    console.log(message.author);
    message.channel.send('Pong.');
  }
  if (message.content.startsWith('!cw ')) {
    let arrMessage = message.content.split(' ');
    let username = arrMessage[1];
    let url = `https://www.codewars.com/api/v1/users/${username}`;
    function fetchUser() {
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          let response = JSON.parse(xhr.responseText);
          let strScore = '';
          let arr = [];
          for (const [key, value] of Object.entries(response.ranks.languages)) {
            arr.push([key, value]);
          }
          arr.sort(compare);
          let finalArr = arr.map((item) => {
            return `\t- ${capitalize(item[0])} : ${item[1].score}` + '\n';
          });
          finalArr.forEach((item) => {
            strScore += item;
          });
          message.channel.send(
            `Les stats de ${username} sont :` +
              '\n' +
              `Rang : ${response.ranks.overall.name}` +
              '\n' +
              `Kata résolus : ${response.codeChallenges.totalCompleted}` +
              '\n' +
              `Honor : ${response.honor}` +
              '\n' +
              `Score total : ${response.ranks.overall.score}` +
              '\n' +
              `Score par langage :` +
              '\n' +
              strScore +
              `Classement mondial : ${
                response.leaderboardPosition
                  ? response.leaderboardPosition + 'ème'
                  : 'Pas de classement'
              }`
          );
        } else if (xhr.readyState == 4 && xhr.status != 200) {
          message.channel.send(`L'utilisateur ${username} n'existe pas`);
        }
      };
      xhr.open('GET', url, true);
      xhr.send();
    }
    fetchUser();
  }
});

clientCw.login(process.env.TOKEN);
