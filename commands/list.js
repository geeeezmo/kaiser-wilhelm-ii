const Discord = require('discord.js');
const cheerio = require('cheerio');
const rp = require('request-promise');
const constants = require('../constants');

function parseImage(td) {
	image = td.find('img').attr('src');
	return (image == '') ? 'http://placehold.jp/99ccff/003366/480x305.jpg' : image;
}

function parseNumber(td) {
	return parseInt(td.find('a').text().charAt(6));
}

function parseCurrent(td) {
	return parseInt(td.eq(2).text().trim().split('/')[0].trim());
}

function parseMaximum(td) {
	return parseInt(td.eq(2).text().trim().split('/')[1].split('[')[0].trim());
}

function renderPlayerCount(server) {
	return `${server.current}/${server.maximum}`;
}

function renderMinimumPlayerCount(server) {
	const mode = constants.gameModes.find((mode) => mode.name === server.mode);
	return (mode && mode.minPlayerCount) || 0;
}

function makeColor(server) {
	if (server.minimum === 0) return 'DEFAULT';
	if (server.current === 0) {
		return 'RED';
	} else if (server.current <= server.minimum) {
		return 'ORANGE';
	} else if (server.current <= server.maximum) {
		return 'GREEN';
	}
}

function parse(body) {
	const $ = cheerio.load(body);
	let servers = [];
	$('tbody tr').each(function () {
		const td = $(this).children('td');
		const tags = td.find('span').text().split('—');
		let server = {};
		server.name = td.find('a').text();
		server.number = parseNumber(td);
		server.image = parseImage(td);
		server.current = parseCurrent(td);
		server.maximum = parseMaximum(td);
		server.region = td.eq(3).text();
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
		server.minimum = renderMinimumPlayerCount(server);
		servers.push(server);
	});
	return servers;
}

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
						const parsed = parse(body);
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
							.setColor(makeColor(server))
							.setThumbnail(server.image)
							.addField('#', server.number, true)
							.addField('Players', renderPlayerCount(server), true)
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