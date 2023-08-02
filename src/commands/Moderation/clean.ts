import { CardinalCommand, CardinalEmbedBuilder } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { BotClientID, CardinalEmojis } from '#utils/constants';
import { sendTemporaryMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message, TextChannel } from 'discord.js';

@ApplyOptions<CardinalCommand.Options>({
	description: '',
	name: 'clean',
	detailedDescription: {
		extendedHelp: '',
		usages: [],
		examples: []
	}
})
export class cleanCommand extends CardinalCommand {
	public override async messageRun(message: CardinalCommand.Message) {
		const channelMessages = await message.channel.messages.fetch({
			limit: 100
		});
		let messagesToDelete: GuildMessage[] = [];

		channelMessages.forEach((message: Message) => {
			if (message.author.id === BotClientID || message.content.startsWith('>')) {
				messagesToDelete.push(message as GuildMessage);
			}
		});
		const channel = message.channel as TextChannel;
		message.delete();
		channel.bulkDelete(messagesToDelete).catch(() => {
			return send(message, { embeds: [new CardinalEmbedBuilder().setStyle('fail').setDescription('Something went wrong')] });
		});

		return sendTemporaryMessage(message, `${CardinalEmojis.Success} Successfully cleaned \`${messagesToDelete.length} messages\``);
	}
}