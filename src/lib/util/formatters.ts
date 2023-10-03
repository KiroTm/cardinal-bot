import type { PermissionsString } from 'discord.js';
import { UsernameRegex } from '#constants';

/**
 * Its takes a string and returns only alphanumeric characters and underscores
 * @param inputString The input string
 * @returns A string
 */
export function replaceNonAlphanumeric(inputString: string): string {
	// Use the replace() method to replace non-alphanumeric characters with an empty string
	const replacedString = inputString.replace(UsernameRegex, '');

	return replacedString;
}

/**
 * It takes a sentence and return a string of every words first letter capitalized
 * @param {string} sentence The initial sentence
 * @returns {string} The capitalized sentence
 * @example
 * capitalizeWords('hello world!') -> 'Hello World!'
 */
export function capitalizeWords(sentence: string): string {
	return sentence
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * It takes an array of strings, splits each string by underscores, capitalizes the first letter of
 * each word, and joins them back together
 * @param {string[]} perm - The array of strings to format.
 * @param {boolean} key - Should it filter and return only key permissions? (default: true)
 * @returns {string[]} An array of strings.
 * @example
 * format(['SEND_MESSAGES']) -> ['Send Messages']
 */
export function formatRoles(perm: PermissionsString[], key?: boolean): string[];
/**
 * It takes a string of screaming snake case and returns pascal case
 * @param {string} perm The permission string
 * @returns {string} Formatted string
 * @example
 * format('SEND_MESSAGES') -> 'Send Messages'
 */
export function formatRoles(perm: string): string;

export function formatRoles(perm: PermissionsString[] | string, key = true) {
	if (Array.isArray(perm)) {
		return perm
			.sort((a, b) => order[b] - order[a])
			.map((e) =>
				e
					.split(``)
					.map((i) => (i.match(/[A-Z]/) ? ` ${i}` : i))
					.join(``)
					.trim()
			)
			.map((s) => {
				s = s.replace(/T T S/g, 'TTS');
				s = s.replace(/V A D/g, 'VAD');
				return s;
			})
			.filter((f) => (key ? f.match(/mem|mana|min|men/gim) : true));
	}
	return perm
		.split(``)
		.map((i) => (i.match(/[A-Z]/) ? ` ${i}` : i))
		.join(``)
		.trim()
		.replace(/T T S/g, 'TTS')
		.replace(/V A D/g, 'VAD');
}

const order: Record<PermissionsString, number> = {
	ViewChannel: 0,
	SendMessages: 1,
	EmbedLinks: 2,
	ReadMessageHistory: 3,
	Connect: 4,
	Speak: 5,
	UseEmbeddedActivities: 5,
	Stream: 5,
	AttachFiles: 6,
	SendVoiceMessages: 6,
	AddReactions: 7,
	CreateInstantInvite: 8,
	UseExternalEmojis: 9,
	UseExternalStickers: 9,
	UseExternalSounds: 9,
	PrioritySpeaker: 10,
	UseSoundboard: 10,
	SendMessagesInThreads: 10,
	SendTTSMessages: 10,
	UseVAD: 11,
	ChangeNickname: 12,
	UseApplicationCommands: 13,
	RequestToSpeak: 14,
	CreatePublicThreads: 15,
	CreatePrivateThreads: 16,
	ViewGuildInsights: 19,
	DeafenMembers: 20,
	ManageThreads: 20,
	MoveMembers: 20,
	MuteMembers: 20,
	ManageEmojisAndStickers: 21,
	ManageGuildExpressions: 21,
	ManageEvents: 21,
	ManageMessages: 22,
	ManageWebhooks: 23,
	ManageNicknames: 24,
	ManageRoles: 25,
	ModerateMembers: 26,
	ViewAuditLog: 27,
	ViewCreatorMonetizationAnalytics: 27,
	KickMembers: 28,
	BanMembers: 29,
	ManageChannels: 30,
	ManageGuild: 31,
	MentionEveryone: 32,
	Administrator: 40
};

/**
 * Returns an array formated like "item1, iteme2 and item3"
 * @param items An array of strings
 * @returns a string formated like "item1, iteme2 and item3"
 */
export function andList(items: string[]): string {
	const length = items.length;

	if (length === 0) {
		return '';
	} else if (length === 1) {
		return items[0];
	} else if (length === 2) {
		return `${items[0]} and ${items[1]}`;
	} else {
		const lastItem = items[length - 1];
		const otherItems = items.slice(0, length - 1).join(', ');
		return `${otherItems} and ${lastItem}`;
	}
}
