# SoccerMASS Server

## About SoccerMASS Server

SoccerMASS Server holds the code neccessary for the backend of [SoccerMASS](https://www.soccermass.com), which is an online Soccer Manager App with the main of building an engaging online soccer game with peoples satisfaction as our goal. What motivated me to build SoccerMASS was the inability for existing Online Manger games to give what we really want in a soccer manager app, after sending mails most platform on how to improve the game, without response, i can accross one post where a user asked 'Do the developers of this game even play it, or are they just there for money'.

## NPM Packages && Services

All packages installed are key to this app running smoothly and we graciously thank the group of developers maintaining those packages. Currently our server is running on a free tier hosted on Heroku and we working on raisng funds to upgrade our server. The following in no particular order executes a very important task on our server.

1. https://kaffeine.herokuapp.com: Since we run our app on a free tier, Kaffeine helps to keep our app awake 24hrs.

2. Having our app awake 24hrs, we use node-cron to keep our Tasks up and running which is crucial to the game. such as generating match scores, automatically accepting and sending bids from unmanaged clubs, injuries and fitness, etc.

3. We would be considered greedy and selfish if we fail to mention MongoDB, what is game without a database, and not just a database, a powerful NoSQL Database.

## Getting Started

## Authors

- Chukwuemeka Maduekwe [@Twitter](https://www.twitter.com/viewcrunch)
