# Monzo-Dashboard
all in one turbo repo for authenticating, syncing and inspecting your monzo account data
All data is stored on your machine, and this app is meant for personal use only.

## What's the aim?
- provide dashboard to community
- take the requirement to maintain it off Monzos hands
- create a dashboard with re-usable components, based of synced monzo data that invites easy additions/features

## How your data is handled
- Oauth tokens are stored in a local container postgresql in encrypted format
- Monzo Data is stored in local db in unencrypted format

----------------------------------


## Set up guide
### Set up Monzo Account 
### Install and run application
note to self:  docker compose --env-file .env.production -f docker-compose.prod.yaml up --build from root dir
### Oauth and syncing account 

----------------------------------


## Contributing to this project and future features
### Dashboard API and Card Layout
### Using the Monzo Service
### Secrets management
.env
docker compose pass in via env
explain prod vs other approach

### Future Features
- transaction search (by merchant/description/date range)
- merchant overview (how much total spent, how much refunded, latest transactions)


----------------------------------

## Limitations & Bugs
### 5 Minute pull
- monzo limits full pull to 5 minutes, if it takes longer than that you'll be cut off on oauth and sync

### SSE support required
- Setup depends on SSE, if your browser does not support it then it will fail

## Dev Information

### Service Overview
apps:
- frontend
- api
- mock-monzo-api

packages:
- monzo types
- dashboard types
- 


### Architecture View

### Database

### Syncing Methodolody




// TODO replace this with placeholder arguments
docker exec -it f68edb6cb990 psql -U dashboard -d monzo_db