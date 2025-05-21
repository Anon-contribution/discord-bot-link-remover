import 'dotenv/config'
import fs from "node:fs";
import path from "node:path";
import { 
	Client, 
	Collection, 
	Events, 
	GatewayIntentBits, 
	PermissionFlagsBits,
} from 'discord.js';

import { fileURLToPath } from 'url';

const whitelistString = fs.readFileSync('whitelist.txt', 'utf8');
const whitelist = whitelistString.split("\n");

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

// retrieve auth token from ENV
const token = process.env.DISCORD_TOKEN;
// Create a new client instance
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent
] });

/** Initialize commands */
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = await import(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}


client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate,async (msg) => {
	/**
	 * Moderate links
	 */
    const isURL = msg.content.startsWith('http://') || msg.content.startsWith('https://');
    if(!isURL) {
        // console.debug('message is not an url, allowed')
        return true;
    }
    const url = new URL(msg.content);
    const isWhitelisted = whitelist.find((host) => host == url.hostname) !== undefined
	const userIsAllowed = msg.member.roles.cache.has(PermissionFlagsBits.ManageMessages)

    if(isURL && !isWhitelisted && !userIsAllowed) {
        msg.delete()
    }

	/**
	 * Moderate Impersonators
	 */
	// retrieve message author handle & displayName
	const memberHandle = msg.member.displayName
	const memberUsername = msg.member.user.username
	// retrieve all guild members and filter out the ones with priviledged permissions 
	const guildMembers = (await msg.guild.members.fetch({ withPresences: true }));
	const elevatedMembers = guildMembers.filter(member => {
		member.roles.cache.has(PermissionFlagsBits.ManageMessages)
	});
	// if(levenshteinDistance(memberHandle, eMember.) < 2 || levenshteinDistance(memberUsername) < 2) {
	// 	// username similar to guild priviledged user
	// }
})

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isAutocomplete() && !interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

    try {
		if(interaction.isAutocomplete()) {
			await command.autocomplete(interaction);
		} else {
			await command.execute(interaction);
		}
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}

});


// Log in to Discord with your client's token
client.login(token);