photometric stereo script taken from [https://github.com/visiont3lab/photometric_stereo](https://github.com/visiont3lab/photometric_stereo)

### Start production
```bash
    docker compose up 
```

### Start development environment
```bash
    docker compose -f ./docker-compose.dev.yml up
```

### Run backend tests
```bash
    docker exec -it photostereo-back npm run test
```

* replace ```photostereo-back``` with ```photostereo-back-dev``` if running development environment.