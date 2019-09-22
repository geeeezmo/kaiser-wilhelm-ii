const Discord = require('discord.js');
const cheerio = require('cheerio');
const rp = require('request-promise');
const constants = require('../constants');

function parseImage(td) {
	image = td.find('img').attr('src');
    if (image == '') {
        return 'http://placehold.jp/99ccff/003366/480x305.jpg';
    }
    return image;
}

function parseName(td) {
	return td.find('a').text();
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

function parseRegion(td) {
	return td.eq(3).text();
}

function parseCountry(td) {
	return td.find('span').text().split('—')[0].trim();
}

function parseMap(td) {
	return td.find('span').text().split('—')[1].trim();
}

function parseMode(td) {
	return td.find('span').text().split('—')[2].trim();
}

function parseTickrate(td) {
	return td.find('span').text().split('—')[3].trim();
}

function parseInformation(td) {
	return {
		number: parseNumber(td),
		name: parseName(td),
		image: parseImage(td),
		map: parseMap(td),
		mode: parseMode(td),
		tickrate: parseTickrate(td),
		region: parseRegion(td),
		country: parseCountry(td),
		current: parseCurrent(td),
		maximum: parseMaximum(td)
	};
}

function renderPlayerCount(server) {
	return `${server.current}/${server.maximum}`;
}

function renderMinimumPlayerCount(server) {
	const mode = constants.gameModes.find((mode) => mode.name === server.mode);
	return (mode && mode.minPlayerCount) || 0;
}

function makeColor(server) {
	if (server.minimum === 0) return constants.colors.default;
	if (server.current === 0) {
		return constants.colors.red;
	} else if (server.current <= server.minimum) {
		return constants.colors.orange;
	} else if (server.current <= server.maximum) {
		return constants.colors.green;
	}
}

function parse(body) {
	const $ = cheerio.load(body);
	let servers = [];
	$('tbody tr').each(function (index, element) {
		var td = $(this).children('td');
		var server = parseInformation(td);
		server.id = parseInt($(this).attr('data-url').split('/').pop());
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