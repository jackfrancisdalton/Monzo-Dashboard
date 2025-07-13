> **⚠ WARNING:** This application is still in active development. Use it at your own risk. Ensure you understand the implications of linking it to your Monzo account and handling sensitive financial data.


# Monzo-Dashboard
Love Monzo but find it frustrating not being able to check your finances on a browser? **This is your solution!**
It's a readonly Monzo dashboard that syncs all of your Monzo data to a database and provides you with UI to assess
what you've been spending and earning!

https://github.com/user-attachments/assets/12062d06-c20e-49ee-a3f0-03caaba93c8a



## Project Aim?
Support the already stellar offering at Monzo with a web dashboard that the community can contribute to over time, 
allowing the Monzo team to focus on scaling their services and delivery rapidly on mobile. 
The architecture of this application was designed with the intention of making contribution easy, so please feel free to open PRs!

<details>
<summary style="font-size: 3em;">How does it handle your data?</summary>

This is your personal finance data. We should keep security at front of mind.
In line with that, this app aims to keep it as private as possible. 
**It is intended only to run on localhost on your personal machine.**

### How are secrets stored?
Secrets are stored in `.env` files that you keep on your local machine and are only ever injected into Docker environments.
> .env and .env.* entries are in the .gitignore too

### How are Oauth tokens created and stored?
You'll be creating your own OAuth client on the monzo dev portal, so will have complete control of its settings/secrets.
When the app aquires refresh and access tokens through the Monzo Oauth flow they are encrypted and stored in the SQL Docker volume.  

### How is Monzo data aquired/stored?
All data is aquired direcitly from the Monzo API using access tokens and stored in a PostgreSQL Docker volume in the format returned from the Monzo API.
THe frontend application then generates the dashboard from that SQL data.

### Will this modify my Monzo account?
This application is designed as a read-only application. It only ever reads data from the official Monzo API.  
All other behavior and processing is handled internally in Docker services.

</details>

----------------------------------

<details>
<summary style="font-size: 3em;">Set up guide</summary>

### Required Configuration
1. Set up Monzo Oauth Account **(NOTE: Can be skipped if you want to use mock data)**
    - Navigate to https://developers.monzo.com/ and sign in using your Monzo email.
    - Create a new Oauth Client.
    - Mark it as secure credentials and set the redirect to `http://localhost:80/api/auth/monzo/callback`.
    - Note: If you are using real data in dev mode, you'll need this to be `http://localhost:3000/auth/monzo/callback`.

2. Git clone this repository to your machine.

3. Set up your `.env`s:
    
    Both the development and production versions of this app depend on their respective `.env` files being configured before they can run.

    You can set your .env files by removing `.template` from the start of:
    - `.template.env.development`
    - `.template.env.production`
    
    ...and assigning your secret values (like Monzo Oauth secrets) in there, so your secrets are well... your secrets.

4. Navigate to the `/monzo-dashboard` sub-folder and run `pnpm install` at the root directory (install pnpm if not already).

### Dev Mode
1. Spin up the dev PosgreSQL container with `docker compose --env-file .env.development -f docker-compose.dev.yaml up --build`
2. Navigate to the mock-monzo app directory and run `pnpm run generate:large` to generate mock data.
3. Run `pnpm run dev` and access the app at `localhost:5173`.

>By default this will usw mock data. If you want to use dev mode with real data/Oauth flow do this:
>1. Update `USE_REAL_MONZO_API` to `true` in the `.env.development`.
>2. Run `docker compose --env-file .env.development -f docker-compose.dev.yaml up --build` to set up the Postgres container.
>3. Then run `pnpm run dev`.


### Prod Mode
1. Run `docker compose --env-file .env.production -f docker-compose.prod.yaml up --build`.
2. Access the app on `localhost:80`.

> **NOTE:** You can run the prod mode with mock data by flipping `USE_REAL_MONZO_API` to `false` in `.env.production`.

</details>

----------------------------------

<details>
<summary style="font-size: 1.5em;">Architecture</summary>

---

### Arch Overview
The Monzo Dashboard is structured as a monorepo using Turbo Repo to manage multiple apps and shared packages. 
This ensures modularity and reusability across the project. 
The architecture is designed to separate concerns between the frontend, backend, and supporting services like mock APIs and shared configurations.


| App Name           | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| **frontend**       | The UI of the Monzo Dashboard, built to display financial data and insights. (React + Vite) |
| **api**            | The backend service that handles data processing, API requests to Monzo, and serves data to the frontend. (NestJS) |
| **mock-monzo**     | A mock implementation of the Monzo API, used for development and testing without connecting to real accounts. (NestJS) |

| Package Name       | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| **monzo-types**    | A shared package containing TypeScript types for Monzo API responses, ensuring type safety across services. |
| **dashboard-types**| A shared package containing TypeScript types and utilities for the Monzo Dashboard, ensuring consistency across the frontend and backend. |

| Folder Name        | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| **docker**         | Contains Docker configuration files and scripts for setting up and managing the application's containerized environment. |
| **nginx**          | Contains Nginx configuration files used for reverse proxying in production. Ensures smooth routing between the frontend and backend services across the Docker network. |


</details>

--------------------------------

<details>
<summary style="font-size: 1.5em;">Data/Authentication Flows</summary>


### Mock Data Flow
1. Frontend app is opened in your browser
2. As `USE_REAL_MONZO_API` is false the `MockMonzoService` is used instead of `RealMonzoService`
3. This informs the dashboard service in `api` that you are configured
4. When data is requested from the dashboard service it forwards to the mock service that requests from the mock monzo app
5. the Mock monzo app returns mock data generated from json files.

>Note: the mock data generator can be ammended with different arguments to generate desired data sets

---

### Oauth Flow
1. User initiates Oauth flow specifying redirect 
2. User is redirected to OauthController in API app
3. OAuthcontroller attaches relevant data and forwards to Monzo API
4. Monzo returns to Oauth controller with tokens
5. Oauth Controller encrypts and stores data on 


### Data Sync Flow
1. User initiates sync from the UI
2. Fowrads to API
3. API initiates sync service
4. Sync process captures blaances and accounts first
5. Generates paginated requests with 1 month time range for every month since account creation
6. Fires in parallel and batch stores to DB on retreval
7. API provides SSE updates to UI as sync continues
8. On sync complete user is redirected to dashboard


</details>



## Contributing to this project and future features

### Adding New Cards/Data Analysis
This app is designed to make this flow as easy as possible. How?
1. All monzo data is available via the PostgreSQL database after sync
2. So you can aquire all of it and format it as you see fit in the Dashboard service that functions as a presentation layer
3. Then in the UI the CardLayout and AppLayout allow you to easily fit in new cards with the data you generate


### Desired Features/Improvements (if you fancy doing them)
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

----------------------------------

<details>
<summary style="font-size: 1.5em;">Upcoming Work</summary>

---
### Logging and Error handling
This applicaiton was developed focusing on feature development and common flows. 
Refactoring, focus and expansion of how errors and loggin are handled is a must for this repository. 

---

### Incremental Sync
The initial account sync is integrated, but the incremental sync still needs to be implemented.  
A potential solution could involve triggering the sync with a hook such as "on module init," but the exact approach is yet to be decided.

---

### UI Scalability
The current UI struggles to handle large data sets, making it difficult to read and analyze.  
A solution to improve scalability and readability for larger data sets is required.

### Additional Pages
Currently only the dashboard page is supported. I intend on adding support for a 

Account Page: showing useful information like account numbers, IBAN, etc... with easy copy buttons
Settings PAge: for setting themes, default accounts, default time ranges on dashboad


</details>
