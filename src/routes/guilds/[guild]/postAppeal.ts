import { ApplyOptions } from '@sapphire/decorators';
import { methods, Route, type ApiRequest, type ApiResponse, HttpCodes } from '@sapphire/plugin-api';
import { s } from '@sapphire/shapeshift';

@ApplyOptions<Route.Options>({
	name: 'postAppeal',
	route: 'guilds/:guild/appeals'
})
export class UserRoute extends Route {
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		const body = request.body;

		const result = this.parseIncomingData(body);
		if (result.error) {
			return response.error(HttpCodes.BadRequest);
		}

		const data = result.unwrap();

		const appeal = await this.container.db.appeal.create({
			data: {
				...data
			}
		});

		return response.status(200).json(appeal);
	}

	private parseIncomingData(data: any) {
		const validator = s.object({
			id: s.string,
			guildId: s.string,
			userId: s.string,
			muteOrBan: s.string,
			reason: s.string,
			appeal: s.string,
			extra: s.string
		});

		const result = validator.run(data);
		return result;
	}
}