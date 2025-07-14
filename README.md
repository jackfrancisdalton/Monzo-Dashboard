> **⚠ WARNING:** This application is still in active development. Use it at your own risk. Ensure you understand the implications of linking it to your Monzo account and handling sensitive financial data.


# Monzo-Dashboard
Love Monzo but find it frustrating not being able to check your finances on a browser? **This is the solution!**
It's a readonly Monzo dashboard that syncs all of your Monzo data to an SQL database, then provides you with a UI to assess
what you've been spending and earning!

https://github.com/user-attachments/assets/12062d06-c20e-49ee-a3f0-03caaba93c8a



## Project Aim?
Support the already stellar offering at Monzo with a web dashboard that the community can contribute to over time, 
allowing the Monzo team to continue focus on scaling their services and rapidly delivering on mobile. 
The architecture of this application was designed with the intention of making contribution easy, **so please feel free to open PRs!**

<details>
<summary style="font-size: 3em;">How does it handle your data?</summary>

### This is your personal finance data!
We should keep its security at front of mind.
In line with that, this app aims to keep everything in your hands and secure as much as possible. 
**It is STRONGLY recommended you only run this on localhost on your own personal machine and don't open it up to the internet by hosting it**

### How are secrets stored?
Secrets are stored in `.env` files that you keep on your local machine and are only ever injected into Docker environments.
> .env and .env.* entries are in the .gitignore too

### How are Oauth tokens created and stored?
You'll be creating your own OAuth client on the monzo dev portal, so will have complete control of its settings/secrets.
When the app aquires refresh and access tokens through the Monzo Oauth flow they are encrypted and stored in the SQL Docker volume.  

### How is Monzo data aquired/stored?
All data is aquired direcitly from the Monzo API using access tokens and stored in a PostgreSQL Docker volume in the format returned from the Monzo API.
The frontend application is then provided chart data from a Dashboard backend service that structures the data.

### Will this modify my Monzo account?
This application is designed as a read-only application. It only ever reads data from the official Monzo API.  
All other behavior and processing is handled internally in Docker services.

</details>

----------------------------------

<details>
<summary style="font-size: 3em;">Set up guide</summary>

### Required Configuration
1. Set up a Monzo Oauth Client **(NOTE: Can be skipped if you want to use mock data)**
    - Navigate to https://developers.monzo.com/ and sign in using your Monzo email.
    - *NOTE:* you'll recieve a notificaiton on your Monzo app to approve permissions
    - Create a new Oauth Client.
    - Mark it as secure credentials and set the redirect to `http://localhost:80/api/auth/monzo/callback`.
    - Note: If you are using real data in dev mode, you'll need this to be `http://localhost:3000/auth/monzo/callback`.
  
    You should end up with something like this:
    <img width="1446" height="699" alt="image" src="https://github.com/user-attachments/assets/7d2e065a-c95e-40ce-a657-5ab69a8ae6d7" />

    > NOTE: localhost:80 here reflects the prod builds which defaults to port 80. Dev build defaults to port 3000.


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

>By default this will use mock data. If you want to use dev mode with real data/Oauth flow do this:
>1. Update `USE_REAL_MONZO_API` to `true` in the `.env.development`.
>2. Run `docker compose --env-file .env.development -f docker-compose.dev.yaml up --build` to set up the Postgres container.
>3. Then run `pnpm run dev`.


### Prod Mode
1. Run `docker compose --env-file .env.production -f docker-compose.prod.yaml up --build`.
2. Access the app on `localhost:80`.

> **NOTE:** You can run the prod mode with mock data by flipping `USE_REAL_MONZO_API` to `false` in `.env.production`.

</details>

---------------------------------

<details>
<summary style="font-size: 1.5em;">Clearing your data</summary>

### How to wipe the SQL database?
As the PostgreSQL database is a container and stores in volumes, you can completely wipe your data by running:
`docker compose --env-file .env.production -f docker-compose.prod.yaml down -v` with the `-v` denoting that volumes should be deleted.


</details>


----------------------------------

<details>
<summary style="font-size: 1.5em;">Architecture</summary>

---

### Arch Overview
The Monzo Dashboard is structured as a monorepo using Turbo Repo to manage multiple apps and shared packages. 
This ensures modularity and reusability across the project. 


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


### Arch Diagram
<img width="5013" height="2459" alt="high-level-arch" src="https://github.com/user-attachments/assets/aab52c75-7361-4c2d-bed8-63eb02385385" />


</details>

--------------------------------

<details>
<summary style="font-size: 1.5em;">Data/Authentication Flows</summary>

### How does Oauth flow work?
1. User initaties Oauth flow fromt the UI
2. They are directed to the API OauthController
3. This uses the provider (monzo) to attach oauth parameters and specify the redirect URL
4. The Oauth controller forwards to the Monzo Login page for Oauth login
5. Once loged in the OauthController callback is called to encrypt and store the refresh and access tokenss
6. The user is then redirected to the Sync step of set up


### How does real data sync?
1. User clicks Sync button on set up page
2. This calls the API MonzoController to trigger syncing
3. The monzo sync service first fetches balances and acocunts from the Monzo API and stores in PostgreSQL
4. It then generates month-long paginated requests for every month since account creation (For each account)
5. It fires these in paralllel storing the transaction and merchant data in PostgrSQL as it goes
6. Throughout this process it callbacks to send SSE events to the frontend to provide progress updates
7. Once all data is aquired the SQL database is considered ready and from there all dashboard data is generated from there. 


### How Does Mock Data Work?
1. Mock data is generated in the mock-monzo service using the generate command.
2. It is stored in JSON format in that app
3. When the API app requests Monzo data and `USE_REAL_MONZO_API` is `false` it will inject its MockMonzoService
4. This will send a request to the mock-monzo service 
5. The mock monzo service will read the generated .json files and return the mocked data to the API

>Note: the mock data generator can be ammended with different arguments to generate desired data sets




</details>

--------------------

<details>
<summary style="font-size: 1.5em;">Contributing to this project</summary>

---

### Adding New Cards/Data Analysis
This app is designed to make this flow as easy as possible. How?
1. All Monzo data is available via the PostgreSQL database after the user has sync'd.
2. You can then use the Dashboard Service as a one-stop-shop to access, process and forrmat all the data you want for the frontend.
3. Then in the UI the AppLayout and CardLayout allow you to easily integrate a new custom card into the existing UI using that data.

As an example if you wanted to add a card for "Number of transfers from Jane" you would:
1. Add a function to count transactions from jane in the DashboardService
2. Update the DashboardSummary type to include it
3. Add a CardLayout to the Dashboard.page.ts and bind your data.


### Testing
As a homebrew project done by a single developer, I'm yet to unit, integration, and E2E test this.
If you fancy expanding the existing app with unit tests it'd be much appreciated!


</details>

----------------------------------

<details>
<summary style="font-size: 1.5em;">Limitations & Bugs</summary>

---

### 5 Minute Pull
As per the Monzo documentation, you can only transactions older than 90 days in the first 5 minutes of OAuth login.  
To achieve this, the app bursts a number of paginated queries right after OAuth success to fetch them all and store them in SQL as quickly as possible.  
If for some reason this is not completed within 5 minutes, you may not be able to pull all of your data.

---

### SSE Support Required
The current implementation of the OAuth and account sync flow depends on SSE (Server-Sent Events) support.  
If your browser does not support SSE, this process will fail. Adding a fallback is on the roadmap but is a low priority given how common SSE support is.

</details>


----------------------------------

<details>
<summary style="font-size: 1.5em;">Upcoming Work</summary>

---

### Cleaning up SQL Container requirements
If the app is running with mock data there is actually no need for the PostgreSQL container or the RealMonzoService.
At the moment these are still required due to the boot up and configuration of the app with TypeORM. 
This should be updated to not run the container when in mockmode, and not load the module simplifying the boot up and decreasing requirements.

### Memoisation in UI
At present there is no use of memoisation leading and excessive re-rendering. 
To make the app as efficient as possible this should be reviewed and corrected

### Clean up package size/loading
As packages have been added throughout development I suspect many of them are no longer needed. In addition I've not reviewed the dev vs prod dependancies so 
un-needed packages may have crept into the prod. I also suspect we can also make use of lazy loading moduels to cut back on initial load times too.

---
### Logging and Error handling
This applicaiton was developed focusing on feature development and the core success flows. 
Refactoring, focus and expansion of how errors and logging are handled is a must for this repository. 

---

### Incremental Sync
The initial full account sync is integrated, but the incremental sync still needs to be implemented.  
A potential solution could involve triggering the sync with a hook such as "on module init," but the exact approach is yet to be decided.

---

### UI Scalability
The current UI struggles to handle large data sets, making it difficult to read and analyze.  
A solution to improve scalability and readability for larger data sets is required.

---

### Additional Pages
Currently only the dashboard page is supported. I intend on adding support for a 

- *Accounts Page*: showing useful information like account numbers, IBAN, etc... with easy copy buttons
- *Settings PAge*: for setting themes, default accounts, default time ranges on dashboad


</details>
