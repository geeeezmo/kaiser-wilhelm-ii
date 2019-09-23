[![CodeFactor](https://www.codefactor.io/repository/github/xorz57/kaiser-wilhelm-ii/badge)](https://www.codefactor.io/repository/github/xorz57/kaiser-wilhelm-ii)
![GitHub package.json version](https://img.shields.io/github/package-json/v/xorz57/kaiser-wilhelm-ii)
[![Discord](https://discordapp.com/api/guilds/616199514113572885/widget.png?style=shield)](https://discordapp.com/invite/PMqbH2Y)

![image](https://user-images.githubusercontent.com/1548352/65426816-ac6ec500-de19-11e9-9900-5a3e54bf27a8.png)

## Commands
- `+bf1serverlist` Shows the Battlefield 1 BoB server list.

## Setup
- Create a new application on https://discordapp.com/developers/
- Add a bot user
- Give the bot user the following permissions
  - View Channels
  - Send Messages
- Create the following 2 environment variables
  - `BOT_PREFIX`
  - `BOT_TOKEN`
- Run `npm install`
- Run `node index.js`

## Setting Environment Variables

On Windows
```powershell
$env:BOT_PREFIX = 'YOUR BOT PREFIX HERE'
$env:BOT_TOKEN = 'YOUR BOT TOKEN HERE'
```
On Linux
```bash
export BOT_PREFIX = 'YOUR BOT PREFIX HERE'
export BOT_TOKEN = 'YOUR BOT TOKEN HERE'
```