const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = '1518042580741390437';
const GUILD_ID = '1472932103539785863';

const commands = [
  new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Enviar painel de incorporação')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );

  console.log('✅ Comando registrado');
})();
