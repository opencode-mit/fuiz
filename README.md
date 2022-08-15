# Fuiz

Interactive live-quiz self-hosted platform that is simple, extensible, easy-to-use, and has elegant design.

## Get started

To install the necassary dependancies run the following command in the root directory of the project:

```sh
npm install
```

Then to compile and start the server:

```sh
npm run start-server
```

This will start the server and listen to requests on the default port **8888**, which can be changed in `src/config.ts`.

## JSON Configuration

Defined in `src/types.ts`, you can also check out `examples/basicConfig.json` for a fleshed out sample.

## Features 

- [x] Images via URL

- [x] Individual question scores and durations

- [x] Graph of answer results

- [ ] Podium

- [ ] Music