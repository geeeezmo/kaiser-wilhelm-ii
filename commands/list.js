const Discord = require('discord.js');
const cheerio = require('cheerio');
const rp = require('request-promise');

servers = [];

function parseImage(td) {
	return td.find('img').attr('src');
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
		current: parseCurrent(td),
		maximum: parseMaximum(td),
		region: parseRegion(td),
		tickrate: parseTickrate(td)
	};
}

function makePlayers(server) {
	return server.current + '/' + server.maximum;
}

function makeColor(server) {
	var minimum = 0;
	if (server.maximum == 32) minimum = 10;
	if (server.maximum == 64) minimum = 20;
	if (server.current == 0) {
		return 'RED';
	} else if (server.current <= minimum) {
		return 'ORANGE';
	} else if (server.current <= server.maximum) {
		return 'GREEN';
	}
}

function parse(body) {
	const $ = cheerio.load(body);
	$('tbody tr').each(function(index, element) {
		var td = $(this).children('td');
		var server = parseInformation(td);
		server.id = parseInt($(this).attr('data-url').split('/').pop());
		servers.push(server);
	});
}

module.exports = {
	name: 'list',
	description: 'List all BoB servers',
	args: false,
	execute(message, args) {
		// Search for the name gRndpjv because it is the Discord Invitation Code
		rp('https://battlefieldtracker.com/bf1/servers?platform=pc&name=gRndpjv')
		.then(function (body) {
			parse(body);
		})
		.finally(function () {
			servers.sort(function(lhs, rhs){
				return lhs.number - rhs.number;
			});
			console.log(servers);
			servers.forEach(function(server) {
				const embed = new Discord.RichEmbed()
					.setColor(makeColor(server))
					.setThumbnail(server.image)
					.addField('#', server.number, true)
					.addField('Players', makePlayers(server), true)
					.addField('Map', server.map, true)
					.addField('Mode', server.mode, true)
				message.channel.send(embed);
			});
			servers = [];
		});
	},
};