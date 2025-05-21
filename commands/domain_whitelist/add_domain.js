import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from "discord.js"
import { isURL, dirname } from "../../helpers.js";
import tld from 'tldjs'
import fs from 'fs'

export const data = new SlashCommandBuilder()
	.setName('add_domain')
	.setDescription('add a whitelisted link domain')
	.addStringOption(option =>
		option.setName('url')
			.setRequired(true)
			.setDescription('the URL whose domain is to be whitelisted')
	)	
	.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction) {

	const whitelistPath = dirname(import.meta.url) + '/../../whitelist.txt';
	let whitelistString = fs.readFileSync(whitelistPath, "utf8");

	const url = interaction.options.getString('url');
	
	if(!isURL(url)) {
		await interaction.reply('Error: not a valid URL !', {flags: MessageFlags.Ephemeral });
		return;
	}
	const parsedURL = URL.parse(url);
	const tldParsedURL = tld.parse(url);

	if(!['https', 'http'].findIndex((protocol) => protocol === parsedURL.protocol)) {
		await interaction.reply('Error: wrong protocol, http and https allowed only !', {flags: MessageFlags.Ephemeral });
		return;
	}
	if(!tldParsedURL.tldExists) {
		await interaction.reply("Error: unknown Top Level Domain "+ tldParsedURL.publicSuffix +" !", {flags: MessageFlags.Ephemeral });
		return;
	}

	if(whitelistString.indexOf(tldParsedURL.domain) !== -1) {
		await interaction.reply("Error: domain already whitelisted", {flags: MessageFlags.Ephemeral });
		return;
	}

	try {
		whitelistString = whitelistString.trim("\n") + "\n" + tldParsedURL.domain
		fs.writeFileSync(whitelistPath, whitelistString);
		await interaction.reply('Domain whitelisted !', {flags: MessageFlags.Ephemeral });
	} catch (err) {
		console.error(err);
		await interaction.reply('Error: Internal Error !', {flags: MessageFlags.Ephemeral });
	}
}