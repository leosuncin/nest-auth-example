# 🛂 Nest.js Authentication Example

[![MegaLinter](https://github.com/leosuncin/nest-auth-example/workflows/MegaLinter/badge.svg?branch=master)](https://github.com/leosuncin/nest-auth-example/actions/workflows/mega-linter.yml)
[![Unit test](https://github.com/leosuncin/nest-auth-example/actions/workflows/unit-test.yml/badge.svg?branch=master)](https://github.com/leosuncin/nest-auth-example/actions/workflows/unit-test.yml)
[![E2E test](https://github.com/leosuncin/nest-auth-example/actions/workflows/e2e-test.yml/badge.svg?branch=master)](https://github.com/leosuncin/nest-auth-example/actions/workflows/e2e-test.yml)
![Prettier](https://img.shields.io/badge/Code%20style-prettier-informational?logo=prettier&logoColor=white)
[![GPL v3 License](https://img.shields.io/badge/License-GPLv3-green.svg)](./LICENSE)
[![HitCount](https://hits.dwyl.com/leosuncin/nest-auth-example.svg)](https://hits.dwyl.com/leosuncin/nest-auth-example)

> Nest.js authentication with Passport. RealWorld example

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Features

- Authentication using [Passport](https://www.passportjs.org/)
- [Local](https://www.passportjs.org/packages/passport-local/) and [JWT](https://www.passportjs.org/packages/passport-local/) strategies are implemented
- [TypeORM](https://typeorm.io/) to connect with PostgreSQL
- Unit tests, integration tests and E2E tests
- [ts-auto-mock](https://typescript-tdd.github.io/ts-auto-mock/) with [ttypescript](https://github.com/cevek/ttypescript) to generate mocks with jest
- Check code quality with [MegaLinter](https://oxsecurity.github.io/megalinter/latest/)
- Check continuous integration with [github actions](.github/workflows/unit-test.yml)
- Run the necessary services with [docker compose](https://docs.docker.com/compose/)

## Run Locally

Clone the project

```bash
  git clone https://github.com/leosuncin/nest-auth-example.git
```

Go to the project directory

```bash
  cd nest-auth-example
```

Install dependencies

```bash
  npm install
```

Create a `.env` from the example one and customize it with your [environment variables](#environment-variables)

```bash
  cp .env.example .env
```

Start the services using Docker Compose

```bash
  docker-compose up -d
```

Run migrations to create the DB schema

```bash
  npm run typeorm migration:run
```

Start the server

```bash
  npm run start:dev
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`POSTGRES_DB` the name of the database to connect in the PostgreSQL instance **(required)**

`POSTGRES_USER` The name of the user to connect to the PostgreSQL instance **(required)**

`POSTGRES_PASSWORD` The password of the user to connect to the PostgreSQL instance **(required)**

`DATABASE_URL` a connection string to the PostgreSQL instance, example _postgres://postgres|@localhost/example-db_ **(required)**

`PORT` the port that Nest.js will listen at **(required)**

`APP_SECRET` the secret used to encrypt the session **(required)**

`ALLOWED_ORIGINS` a comma separated list of [origins](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin) from which accept request **(required)**

You can copy the example `.env` and edit the values

```bash
  cp .env.example .env
```

## Running Tests

To run unit tests, run the following command:

```bash
  npm test
```

To run e2e tests (the PostgreSQL instance must be available), run the following command:

```bash
  npm run test:e2e
```

To see the code coverage

```bash
  npm run test:cov
```

## Try it online

[![Gitpod Try-it](https://img.shields.io/badge/Gitpod-Try--it-blue?logo=gitpod)](https://gitpod.io/#https://github.com/leosuncin/nest-auth-example)

## Tech Stack

**Server:** Typescript, PostgreSQL, Nest.js, TypeORM, Passport

**Test:** Jest, SuperTest, TS auto mock

**DevOps:** Docker Compose

## Author

👤 **Jaime Leonardo Suncin Cruz**

- Twitter: [@jl_suncin](https://twitter.com/jl_suncin)
- Github: [@leosuncin](https://github.com/leosuncin)
<!-- markdown-link-check-disable -->
- LinkedIn: [@jaimesuncin](https://linkedin.com/in/jaimesuncin)
<!-- markdown-link-check-enable -->

## Show your support

Give a ⭐️ if this project helped you!

### :star2: Stargazers

[![Stargazers repo roster for @leosuncin/nest-auth-example](https://reporoster.com/stars/leosuncin/nest-auth-example)](https://github.com/leosuncin/nest-auth-example/stargazers)

### :fork_and_knife: Forkers

[![Forkers repo roster for @leosuncin/nest-auth-example](https://reporoster.com/forks/leosuncin/nest-auth-example)](https://github.com/leosuncin/nest-auth-example/network/members)

## Related

Here are some more example projects with Nest.js

[![GraphQL example](https://github-readme-stats.vercel.app/api/pin/?username=leosuncin&repo=nest-graphql-example)](https://github.com/leosuncin/nest-graphql-example)

[![API example](https://github-readme-stats.vercel.app/api/pin/?username=leosuncin&repo=nest-api-example)](https://github.com/leosuncin/nest-api-example)

[![TypeORM custom repository](https://github-readme-stats.vercel.app/api/pin/?username=leosuncin&repo=nest-typeorm-custom-repository)](https://github.com/leosuncin/nest-typeorm-custom-repository)

## License

Release under the terms of [MIT](./LICENSE)
