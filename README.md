Prerequisites:
- node intalled
- npm installed

In order for the app to run you have to install:

- Supervisor: npm install supervisor -g // For development only

After that run:

- npm install

- bower install
select option jquery 1.10.2 when ask.
select option angular 1.2.1 when ask

- Run tests
grunt mocha

Start app in development mode:

- node server.js -w

-w option from supervisor is to watch changes and restart app automatically.

in Production mode:
export NODE_ENV=production
node server.js