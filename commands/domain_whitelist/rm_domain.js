import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from "discord.js"
import { dirname } from "../../helpers.js";
import fs from 'fs'

const whitelistPath = dirname(import.meta.url) + '/../../whitelist.txt';

export const data = new SlashCommandBuilder()
	.setName('rm_domain')
	.setDescription('remove a whitelisted domain')
	.addStringOption(option =>
		option.setName('domain')
			.setRequired(true)
			.setDescription('the domain to be removed from whitelist')
            .setAutocomplete(true)
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function autocomplete(interaction) {
    const whitelistString = fs.readFileSync(whitelistPath, "utf8");
    const focusedValue = interaction.options.getFocused();
    const whitelist = whitelistString.split("\n");
    const filtered = whitelist.filter(domain => domain.startsWith(focusedValue));

    await interaction.respond(
        filtered.map(domain => ({ name: domain, value: domain })),
    );
}

export async function execute(interaction) {
    let whitelistString = fs.readFileSync(whitelistPath, "utf8");
    const domain = interaction.options.getString('domain');
	const whitelist = whitelistString.split("\n");
    const foundIndex = whitelist.findIndex((d) => d === domain);

    if(foundIndex !== -1) {
        whitelist.splice(foundIndex, 1)
        whitelistString = whitelist.join("\n")
        try {
            fs.writeFileSync(whitelistPath, whitelistString);
    		await interaction.reply('Domain removed !', {flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error(err);
            await interaction.reply('Error: Internal Error !', {flags: MessageFlags.Ephemeral });            
        }
    } else {
        await interaction.reply('Error: domain not found !', {flags: MessageFlags.Ephemeral });
    }
}