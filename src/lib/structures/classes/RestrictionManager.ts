import { RestrictionAction } from '#lib/types';
import { container } from '@sapphire/pieces';
import { hasAtLeastOneKeyInMap } from '@sapphire/utilities';
import { GuildMember, type Collection, type Guild, Role, User, GuildChannel, TextChannel } from 'discord.js';

export class RestrictionManager {
	public constructor(public readonly guild: Guild) {
		this.guild = guild;
	}

	public async findRestriction(commandName: string) {
		const restriction = await container.db.commandRestriction.findFirst({
			where: {
				id: `${this.guild.id}-${commandName}`
			}
		});

		if (!restriction) {
			return null;
		}

		return restriction;
	}

	public async checkMemberAllowed(commandName: string, memberId: string) {
		const restriction = await this.findRestriction(commandName);
		// const command = container.stores.get('commands').get(commandName) as CardinalCommand | ModerationCommand;

		if (!restriction) return null;

		const blackListedMembersSet = new Set(restriction.blackListedMembers);
		const whiteListedMembersSet = new Set(restriction.whiteListedMembers);

		if (whiteListedMembersSet.size !== 0 && whiteListedMembersSet.has(memberId)) {
			return true; // No whitelist restriction, allow by default
		}

		if (blackListedMembersSet.has(memberId)) {
			return false; // Member is in the blacklist, deny
		}

		return null;
	}

	public async checkRoleAllowed(commandName: string, roleMap: Collection<string, Role>) {
		const restriction = await this.findRestriction(commandName);
		// const command = container.stores.get('commands').get(commandName) as CardinalCommand | ModerationCommand;

		if (!restriction) return null;

		const hasWhitelistedRole = hasAtLeastOneKeyInMap(roleMap, restriction.whiteListedRoles);

		const hasBlacklistedRole = hasAtLeastOneKeyInMap(roleMap, restriction.blackListedRoles);

		if (hasWhitelistedRole) {
			return true; // No whitelist restriction, allow by default
		}

		if (hasBlacklistedRole) {
			return false; // Member is in the blacklist, deny
		}

		return null;
	}

	public async checkChannelAllowed(commandName: string, channelId: string) {
		const restriction = await this.findRestriction(commandName);
		// const command = container.stores.get('commands').get(commandName) as CardinalCommand | ModerationCommand;

		if (!restriction) return null;

		const blackListedChannelsSet = new Set(restriction.blackListedChannels);
		const whiteListedChannelsSet = new Set(restriction.whiteListedChannels);

		if (whiteListedChannelsSet.size !== 0 && whiteListedChannelsSet.has(channelId)) {
			return true; // No whitelist restriction, allow by default
		}

		if (blackListedChannelsSet.has(channelId)) {
			return false; // channel is in the blacklist, deny
		}

		return null;
	}

	public async add(target: GuildMember | User | Role | TextChannel, commandName: string, action: RestrictionAction) {
		const data: CommandRestrictionCreateInput = { id: `${this.guild.id}-${commandName}` };
		const previous = (await this.findRestriction(commandName)) ?? data;

		const whitelistedMembersSet = new Set(previous.whiteListedMembers);
		const whitelistedRolesSet = new Set(previous.whiteListedRoles);
		const blacklistedMembersSet = new Set(previous.blackListedMembers);
		const blacklistedRolesSet = new Set(previous.blackListedRoles);

		if (target instanceof TextChannel) return this.addChannel(target, commandName, action);

		if (action === RestrictionAction.Allow) {
			// Add whitelist and remove blacklist

			target instanceof (GuildMember || User) ? whitelistedMembersSet.add(target.id) : whitelistedRolesSet.add(target.id);
			target instanceof (GuildMember || User) ? blacklistedMembersSet.delete(target.id) : blacklistedRolesSet.delete(target.id);
		}

		if (action === RestrictionAction.Deny) {
			// Add blacklist and remove whitelist

			target instanceof (GuildMember || User) ? blacklistedMembersSet.add(target.id) : blacklistedRolesSet.add(target.id);
			target instanceof (GuildMember || User) ? whitelistedMembersSet.delete(target.id) : whitelistedRolesSet.delete(target.id);
		}

		data.blackListedMembers = Array.from(blacklistedMembersSet);
		data.blackListedRoles = Array.from(blacklistedRolesSet);
		data.whiteListedMembers = Array.from(whitelistedMembersSet);
		data.whiteListedRoles = Array.from(whitelistedRolesSet);

		try {
			await container.db.commandRestriction.upsert({
				where: {
					id: `${this.guild.id}-${commandName}`
				},
				create: data,
				update: data
			});

			return true;
		} catch (error) {
			return false;
		}
	}

	private async addChannel(target: TextChannel, commandName: string, action: RestrictionAction) {
		const data: CommandRestrictionCreateInput = { id: `${this.guild.id}-${commandName}` };
		const previous = (await this.findRestriction(commandName)) ?? data;

		const whitelistedChannelsSet = new Set(previous.whiteListedChannels);
		const blacklistedChannelsSet = new Set(previous.blackListedChannels);

		if (action === RestrictionAction.Allow) {
			// Add whitelist and remove blacklist

			whitelistedChannelsSet.add(target.id);
			blacklistedChannelsSet.delete(target.id);
		}

		if (action === RestrictionAction.Deny) {
			// Add blacklist and remove whitelist
			whitelistedChannelsSet.delete(target.id);
			blacklistedChannelsSet.add(target.id);
		}

		data.blackListedChannels = Array.from(blacklistedChannelsSet);
		data.whiteListedChannels = Array.from(whitelistedChannelsSet);

		try {
			await container.db.commandRestriction.upsert({
				where: {
					id: `${this.guild.id}-${commandName}`
				},
				create: data,
				update: data
			});

			return true;
		} catch (error) {
			return false;
		}
	}

	public async remove(target: GuildMember | User | Role | TextChannel, commandName: string, action: RestrictionAction) {
		const data: CommandRestrictionCreateInput = { id: `${this.guild.id}-${commandName}` };
		const previous = (await this.findRestriction(commandName)) ?? data;

		const whitelistedMembersSet = new Set(previous.whiteListedMembers);
		const whitelistedRolesSet = new Set(previous.whiteListedRoles);
		const blacklistedMembersSet = new Set(previous.blackListedMembers);
		const blacklistedRolesSet = new Set(previous.blackListedRoles);

		if (target instanceof TextChannel) return this.removeChannel(target, commandName, action);

		if (action === RestrictionAction.Allow) {
			// Add whitelist and remove blacklist

			target instanceof (GuildMember || User) ? whitelistedMembersSet.delete(target.id) : whitelistedRolesSet.delete(target.id);
		}

		if (action === RestrictionAction.Deny) {
			// Add blacklist and remove whitelist

			target instanceof (GuildMember || User) ? blacklistedMembersSet.delete(target.id) : blacklistedRolesSet.delete(target.id);
		}

		data.blackListedMembers = Array.from(blacklistedMembersSet);
		data.blackListedRoles = Array.from(blacklistedRolesSet);
		data.whiteListedMembers = Array.from(whitelistedMembersSet);
		data.whiteListedRoles = Array.from(whitelistedRolesSet);

		try {
			await container.db.commandRestriction.upsert({
				where: {
					id: `${this.guild.id}-${commandName}`
				},
				create: data,
				update: data
			});

			return true;
		} catch (error) {
			return false;
		}
	}

	private async removeChannel(target: GuildChannel, commandName: string, action: RestrictionAction) {
		const data: CommandRestrictionCreateInput = { id: `${this.guild.id}-${commandName}` };
		const previous = (await this.findRestriction(commandName)) ?? data;

		const whitelistedChannelsSet = new Set(previous.whiteListedChannels);
		const blacklistedChannelsSet = new Set(previous.blackListedChannels);

		if (action === RestrictionAction.Allow) {
			// Add whitelist and remove blacklist
			whitelistedChannelsSet.delete(target.id);
		}

		if (action === RestrictionAction.Deny) {
			// Add blacklist and remove whitelist
			blacklistedChannelsSet.delete(target.id);
		}

		data.blackListedChannels = Array.from(blacklistedChannelsSet);
		data.whiteListedChannels = Array.from(whitelistedChannelsSet);

		try {
			await container.db.commandRestriction.upsert({
				where: {
					id: `${this.guild.id}-${commandName}`
				},
				create: data,
				update: data
			});

			return true;
		} catch (error) {
			return false;
		}
	}

	public async reset(commandName: string) {
		try {
			await container.db.commandRestriction.delete({
				where: {
					id: `${this.guild.id}-${commandName}`
				}
			});
			return true;
		} catch (ignored) {
			return false;
		}
	}
}

type CommandRestrictionCreateInput = {
	id: string;
	disabled?: boolean | undefined;
	whiteListedMembers?: string[] | undefined;
	whiteListedRoles?: string[] | undefined;
	whiteListedChannels?: string[] | undefined;
	blackListedMembers?: string[] | undefined;
	blackListedRoles?: string[] | undefined;
	blackListedChannels?: string[] | undefined;
};
