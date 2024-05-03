import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js"

export const data = new SlashCommandBuilder()
	.setName('add_domain')
	.setDescription('add a whitelisted link domain')
	.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction) {
    await interaction.reply('domain whitelisted !')
}