const Discord = require('discord.js');
const cheerio = require('cheerio');
const rp = require('request-promise');

function parseImage(td) {
	image = td.find('img').attr('src');
	return (image == '') ? 'http://placehold.jp/99ccff/003366/480x305.jpg' : image;
}

function makeColor(server) {
	if (server.minimum === 0) return 'DEFAULT';
	if (server.current === 0) return 'RED';
	else if (server.current <= server.minimum) return 'ORANGE';
	else if (server.current <= server.maximum) return 'GREEN';
}

function parse(body) {
	const $ = cheerio.load(body);
	let servers = [];
	$('tbody tr').each(function () {
		const td = $(this).children('td');
		let server = {};
		server.image = parseImage(td);
		server.name = td.find('a').text();
		server.players = td.eq(2).text().replace(/ /g, '');
		server.current = parseInt(server.players.split('/')[0].trim());
		server.maximum = parseInt(server.players.split('/')[1].split('[')[0].trim());
		server.region = td.eq(3).text();
		const tags = td.find('span').text().split('—');
		server.country = tags[0].trim();
		server.map = tags[1].trim();
		server.mode = tags[2].trim();
		switch (tags.length) {
			case 4:
				server.custom = false;
				server.tickrate = tags[3].trim();
				break;
			case 5:
				server.custom = true;
				server.tickrate = tags[4].trim();
				break;
			default:
				// what the fuck?
				break;
		}
		const minimum = {
			'AIR ASSAULT': 20,
			'CONQUEST': 20,
			'OPERATIONS': 20,
			'SHOCK OPERATIONS': 20,
			'FRONTLINES': 16,
			'DOMINATION': 10,
			'RUSH': 10,
			'SUPPLY DROP': 10,
			'TEAM DEATHMATCH': 10,
			'WAR PIGEONS': 10
		};
		server.minimum = minimum[server.mode];
		servers.push(server);
	});
	return servers;
}

module.exports = {
	name: 'bf1serverlist',
	description: '',
	args: false,
	execute(message, args) {
		// Search for the name gRndpjv because it is the Discord Invitation Code
		rp('https://battlefieldtracker.com/bf1/servers?platform=pc&name=gRndpjv')
			.then((body) => {
				return new Promise((resolve, reject) => {
					try {
						const parsed = parse(body);
						return resolve(parsed);
					} catch (e) {
						reject(e);
					}
				});
			})
			.then((servers) => {
				servers
					.sort((lhs, rhs) => lhs.name.localeCompare(rhs.name))
					.forEach((server) => {
						const embed = new Discord.RichEmbed()
							.setColor(makeColor(server))
							.setThumbnail(server.image)
							.setTitle(server.name)
							.addField('Map', server.map, true)
							.addField('Players', server.players, true)
							.addField('Mode', server.mode, true)
							.addField('Tickrate', server.tickrate, true);
						message.channel.send(embed);
					});
			})
			.catch((err) => {
				console.error(err);
			});
	},
};