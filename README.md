> **⚠ WARNING:** This application is still in active development. Use it at your own risk. Ensure you understand the implications of linking it to your Monzo account and handling sensitive financial data.


# Monzo-Dashboard
Love Monzo, but find it frustrating not being able to check your finances on a browser? This is your solution!
It's a readonly Monzo dashboard that syncs all of your Monzo data to a database and provides you with UI to assess
what you've been spending and earning!

## Project Aim?
Expand the already stellar offering at Monzo with a web dashboard that the community can contribute to over time, 
allowing the Monzo team to focus on scaling their services and delivery rapidly on mobile. The architecture of this application was designed with the intention of making contribution easy, so please feel free to open PRs!

<details>
<summary style="font-size: 1.5em;">How your data is handled</summary>

This is your personal finance data. We should keep security at front of mind.
In line with that, this app aims to keep it as private as possible. 
It is intended only to run on localhost on your personal machine.

### How are secrets stored?
Secrets are stored in `.env` files that you keep on your local machine and are only ever injected into Docker environments.

### How are tokens stored?
Refresh and access tokens from Monzo Oauth are encrypted and stored in the SQL Docker volume.  
Additionally, you'll be using your own Monzo Oauth client, so you will have complete control of the flow.

### How is data aquired/stored?
All data is aquired recitly from the Monzo API and stored in a Postgres Docker volume in the format returned from the Monzo API.

### Does this write to my account?
This application is designed as a read-only application. It only ever reads data from the official Monzo API.  
All other behavior and processing is handled internally in Docker containers.

</details>

----------------------------------

<details>
<summary style="font-size: 1.5em;">Set up guide</summary>

### Required Configuration
1. Set up Monzo Oauth Account **(NOTE: not required if you are only using mock data to try out the app)**
    - Navigate to https://developers.monzo.com/ and sign in using your Monzo email.
    - Create a new Oauth Client.
    - Mark it as secure credentials and set the redirect to `http://localhost:80/api/auth/monzo/callback`.
    - Note: If you are using real data in dev mode, you'll need this to be `http://localhost:3000/auth/monzo/callback`.

2. Git clone this repository to your machine.

3. Set up your `.env`s:
    Both the development and production versions of this app depend on `.env` files to be configured.

    You can set your .env files by removing `.template` from the start of:
    - `.template.env.development`
    - `.template.env.production`
    and assigning your secret values (like Monzo Oauth secrets) in there, keeping your secrets, well, secret.

4. Run `pnpm install` at the root directory (install pnpm if not already).

### Dev Mode
Simply run `pnpm run dev`. That's it.  
You can then access the app on `localhost:5173`.

By default this will us mock data. If you do want to use dev mode with real data/Oauth flow though, you'll need to:
1. Update `USE_REAL_MONZO_API` to `true` in the `.env.development`.
2. Run `docker compose --env-file .env.development -f docker-compose.dev.yaml up --build` to set up the Postgres container.
3. Then run `pnpm run dev`.

### Prod Mode
1. Run `docker compose --env-file .env.production -f docker-compose.prod.yaml up --build`.
2. Access the app on `localhost:80`.

> **NOTE:** You can run the prod mode with mock data by flipping `USE_REAL_MONZO_API` to `false` in `.env.production`.

</details>

----------------------------------

## Architecture and Data Flows 

### Turbo Repo Structure
| App Name           | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| **frontend**       | The user interface of the Monzo Dashboard, built to display financial data and insights. (React + Vite) |
| **api**            | The backend service that handles data processing, API requests to Monzo, and serves data to the frontend. (NestJS) |
| **mock-monzo-api** | A mock implementation of the Monzo API, used for development and testing without connecting to real accounts. (NestJS) |

| Package Name       | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| **monzo types**    | A shared package containing TypeScript types for Monzo API responses, ensuring type safety across services. |
| **docker**         | Contains Docker configuration files and scripts for setting up and managing the application's containerized environment. |
| **nginx**          | Contains Nginx configuration files used for reverse proxying in production. Ensures smooth routing between the frontend and backend services across docker network. |


### Arch Overview

### Build Structure Dev Mode vs Prod Mode

### Mock Data Flow

### Oauth and Real Data Sync Flow



## Contributing to this project and future features

### Adding New Cards/Data Analysis
This app is designed to make this flow as easy as possible. How?

1. Setting up Data

2. Updating the UI


### Desired Features (if you fancy doing them)
- improve error handling (perhaps a re-usable error toast component)
- profile page
- settings page
- transaction search (by merchant/description/date range)
- merchant overview (how much total spent, how much refunded, latest transactions)


----------------------------------

## Limitations & Bugs
### 5 Minute pull
As per the monzo documentation, you can only pull all account transactions in the first 5 minutes of oauth login.
To achieve this we burst a number of paginated queries right after oauth success to fetch them all and store them in SQL ASAP.
If for some reason this is not compelted within 5 minutes you may not be able to pull all of your data.


### SSE support required
The current implementation of the oauth & account sync flow depends on SSE support. 
If your browser does not have support SSE then this will fail. Adding a fallback is on the roadmap but a low priority given how common SSE support is. 