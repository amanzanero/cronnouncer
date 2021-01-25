# cronnouncer

[![amanzanero](https://circleci.com/gh/amanzanero/cronnouncer.svg?style=shield&circle-token=6a151431cce03f815aab981b640852910bc58991)](https://circleci.com/gh/amanzanero/cronnouncer)
[![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

The Discord bot to schedule announcements on your server!

## Usage:

| Command | Description | Usage | Example |
| ------- | ----------- | ----- | ------- |
| .timezone | Sets the timezone for the discord server (you only have to do this once). Available timezones (case sensitive): `US/Alaska`, `US/Aleutian`, `US/Arizona`, `US/Central`, `US/East-Indiana`, `US/Eastern`, `US/Hawaii`, `US/Indiana-Starke`, `US/Michigan`, `US/Mountain`, `US/Pacific`, `US/Samoa` | .timezone {timezone} | .timezone US/Pacific |
| .create | Creates a new announcement | .create | .create |
| .set-channel | Sets the channel for the in-progress announcement | .set-channel {announcementID} {discord channel name} | .set-channel 33 #general |
| .set-message | Sets the message for the in-progress announcement | .set-message {announcementID} {announcement content} | .set-message 33 One super awesome announcement |
| .set-time | Sets the time for the in progress announcement | .set-time {announcementID} {MM/DD/YYYY hh:mm am/pm} | .set-time 33 4/20/2021 4:20 pm |
| .schedule | Schedules the announcement to be sent. | .schedule {announcementID} | .schedule 33 |
| .unschedule | Un-schedules an announcement that is scheduled to be sent | .unschedule {announcementID} | .unschedule 33 |
| .list | Lists all unscheduled, scheduled, and sent announcements | .list | .list |
| .view | Shows details for the announcement | .view {announcementID} | .view 33 |
| .delete | Deletes and un-schedules an announcement | .delete {announcementID} | .delete 33 |
| .ping | Returns latency stats | .ping | .ping |
| .help | Get list of available commands | .help | .help |


## To get this running on your machine:

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

#### NOTE:

This bot is incomplete and not yet usable
