# Normal map app

Deployed at: [https://normalmap.pur-pul.net/](https://normalmap.pur-pul.net/)

[Instructions](doc/instructions.md)
- Instructions with some interactive elements can also be viewed on the frontpage of the app.

[Work hours](doc/hours.md)

The backend uses a photometric stereo script, which was taken from [https://github.com/visiont3lab/photometric_stereo](https://github.com/visiont3lab/photometric_stereo)

## Installation
The application is built to be run inside docker. Two docker compose files are included [docker-compose.yml](docker-compose.yml) for production and [docker-compose.dev.yml](docker-compose.yml) for development. 

### Environment
Envirnoment variables are explanined at [doc/environment.md](doc/environment.md)
.env should be placed in the root of the project. Example .env at [doc/example.env](doc/example.env) can be used as template.

The development environment does not need any futher setup and can be started with:

```bash
    docker compose -f ./docker-compose.dev.yml up
```
### Testing and linting
Tests and linting can be run in the development environment
#### Run backend tests
```bash
    docker exec -it photostereo-back-dev npm run test
```
#### Lint backend
```bash
    docker exec -it photostereo-back-dev npm run lint
```
#### Run frontend tests
```bash
    docker exec -it photostereo-front-dev npm run test
```
#### Lint frontend
```bash
    docker exec -it photostereo-front-dev npm run lint
```

## Production

### Cloudflare
By default the production is set to use a cloudflare tunnel. 
- A cloudflare tunnel needs to be created.
- cloudflare-config.yml can be created using the [cloudflared-config.yml.template](cloudflared-config.yml.template). 
    - The tunnel id needs to be set.
    - Host name needs to be set
    - The cloudflare-config.yml.template is set to use credentials from cloudflare-credentials.json, which needs to be created.

Instructions on how to create the tunnel, config and the credentials file can be found in [this guide](https://www.sambobb.com/posts/cloudflared-in-docker-compose/)

#### To start production with cloudflare:
```bash
    docker compose up 
```
