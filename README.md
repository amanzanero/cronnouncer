# cronnouncer

[![amanzanero](https://circleci.com/gh/amanzanero/cronnouncer.svg?style=shield&circle-token=6a151431cce03f815aab981b640852910bc58991)](https://circleci.com/gh/amanzanero/cronnouncer)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

The Discord bot to schedule announcements on your server!

To use the bot you need to add a role called "Announcer" to your server, and only those with that role will be able to schedule announcements. You also need to make sure that the bot has permissions to send messages to the channels where you want to send announcements to.

[Click here to add this bot to your server for free!](https://discord.com/api/oauth2/authorize?client_id=785700078287192096&permissions=248832&scope=bot)

[Click here to join the cronnouncer discord server](https://discord.gg/Y2WkzNS3p4), where you can demo the bot, ask for help, report bugs, suggest features, and give feedback.

Here is an example of what the announcement message looks like:

![Example announcement](https://raw.githubusercontent.com/amanzanero/cronnouncer/main/docs/img/example_announcement.png)

Note: Right now the announcement message does not support file/image attachments or link previews.

## Usage:

To use this bot, you must create a role called `Announcer`. Only those with this role will be able to run any of the following commands.

| Command | Description | Usage | Example |
| ------- | ----------- | ----- | ------- |
| .timezone | Sets the timezone for the discord server (you only have to do this once). Available timezones (case sensitive): `US/Alaska`, `US/Aleutian`, `US/Arizona`, `US/Central`, `US/East-Indiana`, `US/Eastern`, `US/Hawaii`, `US/Indiana-Starke`, `US/Michigan`, `US/Mountain`, `US/Pacific`, `US/Samoa` | .timezone {timezone} | .timezone US/Pacific |
| .create | Creates a new announcement | .create | .create |
| .set-channel | Sets the channel for the in-progress announcement | .set-channel {announcementID} {discord channel name} | .set-channel 33 #general |
| .set-message | Sets the message for the in-progress announcement | .set-message {announcementID} {announcement content} | .set-message 33 One super awesome announcement |
| .set-time | Sets the time for the in progress announcement | .set-time {announcementID} {MM/DD/YYYY hh:mm am/pm} | .set-time 33 4/20/2021 4:20 pm |
| .schedule | Schedules the announcement to be sent | .schedule {announcementID} | .schedule 33 |
| .unschedule | Un-schedules an announcement that is scheduled to be sent | .unschedule {announcementID} | .unschedule 33 |
| .list | Lists all unscheduled, scheduled, and sent announcements | .list | .list |
| .view | Shows details for the announcement | .view {announcementID} | .view 33 |
| .delete | Deletes and un-schedules an announcement | .delete {announcementID} | .delete 33 |
| .ping | Returns latency stats | .ping | .ping |
| .help | Get list of available commands | .help | .help |


## To host this bot yourself, or run locally for development:

#### Prereqs:

* [Node.js 14](https://nodejs.org/en/download/releases/)
* [Docker Desktop](https://www.docker.com/products/docker-desktop) (for development or hosting locally)

#### Installation and setup

1. `git clone https://github.com/amanzanero/cronnouncer.git`
2. `cd cronnouncer`
3. `npm i`
4. create a [discord app](https://discord.com/developers/applications)
5. create a bot and get secret token
6. add .env to root folder and paste `DISCORD_TOKEN=<put your token here>`. Look at .env.dev or .env.prod for other required variables

#### Production / hosting

If you'd like to use the database built into this project:

1. Copy environment variables from .env.prod into a .env file
2. Run `docker-compose up -d` to start bot and database using docker

To shut down: `docker-compose down`

#### Development

1. Copy environment variables from .env.dev into a .env file
2. `docker-compose up -d db` to spin up postgresql container
3. `npm run dev` to start bot locally using ts-node

## Contributing:

Run `npm run pushcheck`. If all looks good, go ahead and PR to main.
