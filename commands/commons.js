const cheerio = require('cheerio');
const constants = require('../constants');

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

function getOccupancyColor(server) {
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
    renderPlayerCount: renderPlayerCount,
    getOccupancyColor: getOccupancyColor,
    parse: parse
};