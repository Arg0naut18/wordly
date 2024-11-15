import 'dotenv/config';
import { Client, GatewayIntentBits, Routes } from 'discord.js';
import { REST } from '@discordjs/rest';
import { handleInteraction } from './interactions.js';
import { createServer } from 'http';
import { readFileSync } from 'fs';
const TOKEN = process.env.WORDLY_TOKEN ? process.env.WORDLY_TOKEN.toString() : '';
const CLIENT_ID = process.env.DISCORD_CLIENT_ID ? process.env.DISCORD_CLIENT_ID.toString() : '';
const PORT = 5069;
const init_files = new Map();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
});
const rest = new REST({ version: '10' }).setToken(TOKEN);
client.on('ready', (c) => {
    console.log(`${c.user.username} is online now!`);
    load_init_files();
});
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    await handleInteraction(interaction.commandName, interaction, init_files);
});
function load_init_files() {
    init_files.set("wordle_words", readFileSync("wordle_words.txt").toString().split(","));
}
async function main() {
    const commands = [
        {
            name: 'wordle',
            description: 'Play wordle with wordly'
        },
        {
            name: 'ping',
            description: 'Send a message'
        },
    ];
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), {
            body: commands,
        });
        client.login(TOKEN);
    }
    catch (error) {
        console.error(error);
    }
}
main();
const server = createServer((request, response) => {
    response.end('Hello world!');
});
server.listen(PORT);
