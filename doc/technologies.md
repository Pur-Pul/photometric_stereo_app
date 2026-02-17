This application was built with Node.js using the following technologies:
### Frontend
- React
- Redux
- Mui
- Plotly.js
### Backend
- Express
- Mongoose
- Multer
- Nodemailer
### Photometric stereo server (This is responsible for generating the normal maps)
- Python
- Flask
- https://github.com/visiont3lab/photometric_stereo
### Database
- MongoDB

Everything runs within Docker containers, which are orchestrated with docker-compose files. The production build is exposed via a CloudFlare tunnel with the cloudflared Docker image.
