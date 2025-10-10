The following environment variables need to be set:
- `MONGO_ROOT_USER`: the root user name for the database
- `MONGO_ROOT_PASS`: the root password for the database
- `MONGO_USER`: the nonroot username for the database
- `MONGO_PASS`: the nonroot password for the database

- `MONGODB_URI`: The URI to the database with the following format mongodb://`MONGO_USER`:`MONGO_PASS`@mongo:27017/

- `ADMIN_PASS`: The default password of the admin account that is created on startup.

- `EMAIL`: The email address from which the verification emails are sent. Currently only setup to support gmail.
- `EMAIL_PASS`: The app password for the verification email.

- `PHOTOSTEREO_PORT`: The port to run the photometric stereo server on.

- `PORT`: The port nginx is exposed on. This is required for the development environment and is the port that the app can be access from.

- `BACK_PORT`: The port to run the backend on. Must be 3001 in the development environment.
- `BACKEND_URL`: The url that the backend can be accessed at via nginx. Required for development environment. Example: http://localhost:`PORT`/api

- `FRONT_PORT`: The port to run the frontend on. Must be 80 in the development environment.
- `FRONTEND_URL`: The port that the frontend is accessed at via nginx. Example: http://localhost:`PORT`/


- `SECRET`: Randomly generated secret
- `EXPIRE_DELAY`: The delay in minutes before sessions expire.