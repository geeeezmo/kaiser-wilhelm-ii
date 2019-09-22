const Discord = require('discord.js');
const rp = require('request-promise');
const commons = require('./commons');

module.exports = {
	name: 'list',
	description: 'List all BoB servers',
	args: false,
	execute(message, args) {
		// Search for the name gRndpjv because it is the Discord Invitation Code
		rp('https://battlefieldtracker.com/bf1/servers?platform=pc&name=gRndpjv')
			.then((body) => {
				return new Promise((resolve, reject) => {
					try {
						const parsed = commons.parse(body);
						return resolve(parsed);
					} catch (e) {
						reject(e);
					}
				});
			})
			.then((servers) => {
				servers
					.sort((lhs, rhs) => lhs.number - rhs.number)
					.forEach((server) => {
						const embed = new Discord.RichEmbed()
							.setColor(commons.getOccupancyColor(server))
							.setThumbnail(server.image)
							.addField('#', server.number, true)
							.addField('Players', commons.renderPlayerCount(server), true)
							.addField('Map', server.map, true)
							.addField('Mode', server.mode, true);
						
						message.channel.send(embed);
					});
			})
			.catch((err) => {
				console.error(err);
			});
	},
};