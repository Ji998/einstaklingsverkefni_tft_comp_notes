# TFT Comp Notes

## Introduction
It's a tiny web application for TFT players in LOL, As a player of LOL , I started the game about 10 years ago, and now because of school, work and too many things I barely have time to play the game.
But some times I do play TFT , however, I'm not playing the game that often , so I cant remeber every single changing in each season in TFT.That's the idea of this project, to help those players who barely have time to play the game .
But still want to have some fun. This project help them to make notes about the compositions they would like to play without confusion. 
Players can create a composition, add champions, mark a main carry, write item notes, and see the traits that appear in the current composition.


## What the project does

The application currently supports these features:

* create a new comp
* view saved comps
* select and open a comp
* delete a comp
* add champions to a comp
* remove champions from a comp
* mark a champion as the main carry
* write item notes for each champion
* display the traits currently present in the comp
* group the champion pool by cost


### Front-end implementation

The front end is built with React and TypeScript. It includes forms, interactive buttons, dynamic lists, conditional rendering, and state updates based on user actions.

### Back-end implementation

The back end is built with Hono and TypeScript. It provides the API endpoints used by the front end and handles creating, reading, and deleting data.

### Web service / REST API

The project uses REST-style API endpoints such as:

* `GET /champions`
* `GET /comps`
* `GET /comps/:id`
* `POST /comps`
* `POST /comps/:id/champions`
* `DELETE /comps/:id`
* `DELETE /comps/:compId/champions/:entryId`

### Database

The project uses SQLite as its database and Prisma as the ORM. Champion data, comps, and champion-comp relations are stored in the database.

## Technologies used

### React

React was used to build the user interface. It made it easier to manage state and update the page automatically when the selected comp or champion list changed.

### TypeScript

TypeScript was used on both the front end and back

### Hono

Hono was used as the back-end framework. It was lightweight and suitable for a small API-focused project.

### Prisma

Prisma was used to define the data model, run migrations, and access the database in a structured way.

### SQLite

SQLite was used because it is simple.

### CSS
For out-looking

## Future Improvements
 the project can be improved with following point:
  1. sign in and sign up features , so players can save their personal comps
  2. allowing editing comp titles and notes
  3. champion pictures
  4. more champions
## To run the project 
### In backend folder:
```bash
npm install
npm run dev
```
### In frontend folder:
```bash
npm install
npm run dev
```
### Seed data
backend folder:
```bash
npm run seed
```
