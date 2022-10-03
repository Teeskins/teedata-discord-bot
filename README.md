# teedata-discord-bot

## How to build and run ?

1. Install the dependencies 
- Mongo (only if you want a local instance)
- NodeJS

```bash
npm i
```

1. Create the environments files:
    - `env` using `.env_example`

2. Run the project with the instructions below.

### Production

```bash
npm run build
npm run start
```

### Development

```bash
npm run dev
```

## Docker

**Download the submodules**
```bash
git submodule init
git submodule update
```

**Launch containers**

You need some environment variables:

- `MONGO_INITDB_ROOT_USERNAME`
- `MONGO_INITDB_ROOT_PASSWORD`
- `TW_UTILS_PORT`

```bash
TW_UTILS_PORT=3000 \
MONGO_INITDB_ROOT_USERNAME=user \
MONGO_INITDB_ROOT_PASSWORD=test \
docker-compose up
```

**Reset environment variables (cache) for MongoDB**

```bash
docker-compose rm -fv bot_mongo
```
