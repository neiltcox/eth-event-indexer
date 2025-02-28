# Ethereum Event Indexer and API

This project indexes ERC-20 `Transfer` events from an Ethereum smart contract on the Sepolia testnet and exposes a REST API to query the events and aggregate statistics.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup & Running the Project](#setup--running-the-project)
  - [Clone the Repository](#clone-the-repository)
  - [Configure Environment Variables](#configure-environment-variables)
  - [Run with Docker Compose](#run-with-docker-compose)
  - [Running Locally](#running-locally)
  - [Running Tests](#running-tests)

## Features

- **Blockchain Interaction:** Listens for ERC-20 `Transfer` events using [ethers.js](https://docs.ethers.org/).
- **Data Persistence:** Stores events in a SQLite database via [Drizzle ORM](https://orm.drizzle.team/).
- **REST API:** Provides endpoints to retrieve paginated events and aggregate statistics using [Fastify](https://www.fastify.io/).
- **Containerized:** Runs in Docker, orchestrated by Docker Compose.
- **API Documentation:** Includes a Postman collection for easy API testing.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- (Optional) Node.js and npm if you want to run locally without Docker

## Setup & Running the Project

### Clone the Repository

```bash
git clone <repository-url>
cd eth-event-indexer
```

### Configure Environment Variables

Create a .env file in the project root with the following content:

```
PORT=3000
RPC_URL=https://YOUR_RPC_URL
START_BLOCK=A_RECENT_BLOCK
```

### Run with Docker Compose

Build and start the application with:

```bash
docker-compose up --build
```

The API will be available at http://localhost:3000.

### Running Locally

Install dependencies and run the project directly:

```bash
npm install
npm run dev
```

### Running Tests

Install dependencies and run the tests:

```bash
npm install
npx jest
```
