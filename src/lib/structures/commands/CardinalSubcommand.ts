import { PermissionLevels, type GuildMessage } from '#lib/types';
import { CommandOptionsRunTypeEnum, PreconditionContainerArray, UserError, Command } from '@sapphire/framework';
import { Subcommand, type SubcommandOptions } from '@sapphire/plugin-subcommands';
import {
	PermissionFlagsBits,
	PermissionsBitField,
	ContextMenuCommandInteraction as CTXMenuCommandInteraction,
	ChatInputCommandInteraction as ChatInputInteraction,
	MessageContextMenuCommandInteraction as MessageCTXCommandInteraction,
	UserContextMenuCommandInteraction as UserCTXMenuCommandInteraction
} from 'discord.js';
import type { CardinalCommand } from '#lib/structures';
export abstract class CardinalSubcommand extends Subcommand {
	/**
	 * Whether the command can be disabled.
	 */
	public readonly guarded?: boolean;
	/**
	 * Whether the command is hidden from everyone.
	 */
	public readonly hidden?: boolean;
	/**
	 * The permission level required to run the command.
	 */
	public readonly permissionLevel?: PermissionLevels;
	/**
	 * Whether the command is only for community servers.
	 */
	public readonly community?: boolean;

	public constructor(context: CardinalSubcommand.Context, options: CardinalSubcommand.Options) {
		const perms = new PermissionsBitField(options.requiredClientPermissions).add(
			PermissionFlagsBits.SendMessages,
			PermissionFlagsBits.EmbedLinks,
			PermissionFlagsBits.ViewChannel
		);
		super(context, {
			generateDashLessAliases: true,
			requiredClientPermissions: perms,
			runIn: [CommandOptionsRunTypeEnum.GuildAny],
			...options
		});
		(this.guarded = options.guarded ?? false),
			(this.hidden = options.hidden ?? false),
			(this.permissionLevel = options.permissionLevel ?? PermissionLevels.Everyone),
			(this.community = options.community ?? false);
	}

	protected error(message: string | UserError.Options, context?: unknown): never {
		throw typeof message === 'string' ? new UserError({ identifier: 'Error', message, context }) : new UserError(message);
	}

	protected parseConstructorPreConditions(options: CardinalSubcommand.Options): void {
		super.parseConstructorPreConditions(options);
		this.parseConstructorPreConditionsPermissionLevel(options);
		if (options.community) {
			this.preconditions.append('Community');
		}
	}

	protected parseConstructorPreConditionsPermissionLevel(options: CardinalSubcommand.Options): void {
		if (options.permissionLevel === PermissionLevels.BotOwner) {
			this.preconditions.append('BotOwner');
			return;
		}

		const container = new PreconditionContainerArray(['BotOwner'], this.preconditions);
		switch (options.permissionLevel ?? PermissionLevels.Everyone) {
			case PermissionLevels.Everyone:
				container.append('Everyone');
				break;
			case PermissionLevels.Trainee:
				container.append('Trainee');
				break;
			case PermissionLevels.Staff:
				container.append('Staff');
				break;
			case PermissionLevels.Moderator:
				container.append('Moderator');
				break;
			case PermissionLevels.Administrator:
				container.append('Administrator');
				break;
			case PermissionLevels.ServerOwner:
				container.append('ServerOwner');
				break;
			default:
				throw new Error(
					`CardinalSubcommand[${this.name}]: "permissionLevel" was specified as an invalid permission level (${options.permissionLevel}).`
				);
		}

		this.preconditions.append(container);
	}
}
export namespace CardinalSubcommand {
	/**
	 * The CardinalSubcommand Options
	 */
	export type Options = SubcommandOptions & {
		/**
		 * Whether the command can be disabled.
		 */
		guarded?: boolean;
		/**
		 * Whether the command is hidden from everyone.
		 */
		hidden?: boolean;
		/**
		 * The permission level required to run the command.
		 */
		permissionLevel?: number;
		/**
		 * Whether the command is only for community servers.
		 */
		community?: boolean;
	};
	export type Args = CardinalCommand.Args;
	export type Message = GuildMessage;
	export type JSON = Command.JSON;
	export type Context = Command.Context;
	export type RunInTypes = Command.RunInTypes;
	export type ChatInputCommandInteraction = ChatInputInteraction<'cached'>;
	export type ContextMenuCommandInteraction = CTXMenuCommandInteraction<'cached'>;
	export type UserContextMenuCommandInteraction = UserCTXMenuCommandInteraction<'cached'>;
	export type MessageContextMenuCommandInteraction = MessageCTXCommandInteraction<'cached'>;
	export type Registry = Command.Registry;
}
