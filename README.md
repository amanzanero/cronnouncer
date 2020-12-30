# cronnouncer

[![amanzanero](https://circleci.com/gh/amanzanero/cronnouncer.svg?style=shield&circle-token=6a151431cce03f815aab981b640852910bc58991)](https://circleci.com/gh/amanzanero/cronnouncer)
[![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip)

The Discord bot to schedule announcements on your server!

## Usage:

## To get this running on your machine:

#### Prereqs:

* [Node.js 14](https://nodejs.org/en/download/releases/)
* [Docker Desktop](https://www.docker.com/products/docker-desktop) (for development)

#### Steps

1. `git clone https://github.com/amanzanero/cronnouncer.git`
2. `cd cronnouncer`
3. `npm i`
4. create a [discord app](https://discord.com/developers/applications)
5. create a bot and get secret token
6. add .env to root folder and paste `DISCORD_TOKEN=<put your token here>`, then copy over other values from
   .env.example

#### Development

1. `docker-compose up` to spin up postgresql container
2. `npm run dev` to start bot locally using ts-node

#### Production / hosting

1. `npm run build`
2. `npm start`

## Contributing:

Run `npm run pushcheck`. If all looks good, go ahead and PR to main.

#### NOTE:

This bot is incomplete and not yet usable
