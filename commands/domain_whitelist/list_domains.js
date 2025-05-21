import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js"
import fs from 'fs'
import { dirname } from "../../helpers/utils.js";

const whitelistString = fs.readFileSync(dirname(import.meta.url) + '/../../whitelist.txt', 'utf8');

export const data = new SlashCommandBuilder()
	.setName('list_domains')
	.setDescription('list the whitelisted domains')
	.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction) {
    await interaction.reply(whitelistString)
}