import { CardinalEmbedBuilder } from '#lib/structures';
import { CardinalEvents } from '#lib/types';
import { formatRoles } from '#utils/formatters';
import { sendTemporaryMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, type MessageCommandErrorPayload, UserError } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	event: CardinalEvents.MessageCommandError
})
export class UserListener extends Listener {
	public override async run(error: UserError, { message, command }: MessageCommandErrorPayload) {
		let content = '';

		this.container.client.analytics.addCommandUsage(command.name, false);

		if (error instanceof UserError) {
			if (Reflect.get(Object(error.context), 'silent')) return;

			if (error.identifier === 'NotRegistered') {
				content = `Please register your account using \`${await this.container.client.fetchPrefix(message)}register\``;
			} else if (error.identifier === 'argsMissing') {
				content = `You are missing some arguments`;
			} else if (error.identifier === 'argsUnavailable') {
				content = `Some arguments arent available`;
			} else if (error.identifier === 'preconditionGuildOnly') {
				content = `This command can only run in guilds`;
			} else if (error.identifier === 'preconditionNsfw') {
				content = `This command can only be used in NSFW channels`;
			} else if (error.identifier === 'preconditionUserPermissions') {
				const { missing } = error.context as { missing: [] };
				content = `You need \`${formatRoles(missing).join('` `')}\` permission${missing.length - 1 === 0 ? '' : '(s)'} to run this command`;
			} else {
				return await sendTemporaryMessage(message, {
					embeds: [
						new CardinalEmbedBuilder()
							.setStyle('fail')
							.setDescription(content === '' ? error.message : content)
							.setTitle(error.identifier ?? 'Error')
					]
				});
			}

			return await sendTemporaryMessage(message, {
				embeds: [new CardinalEmbedBuilder().setDescription(content === '' ? error.message : content).setTitle(error.identifier ?? 'Error')]
			});
		}
		return undefined;
	}
}
