# SPV Casino API

ℹ️This repository contains the code for an API with features such as user registration, login, logout, password management, user updates, and more. It is built using Node.js, Express, and MongoDB (via Mongoose) for the backend and implements JWT-based authentication for secure access to protected endpoints.

## For more information check out our wiki

📝[SPV Casino Wiki](https://github.com/SPV-Podskupina/backend)

### Prerequisites

⚠️Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version >= 12.0.0)
- [MongoDB](https://www.mongodb.com/) (or use MongoDB Atlas for cloud database)
- .env file that contains mongo URL as DB_URI and JWT token as JWT_TOKEN

### OPTIONAL: Running in a container

**BUILD**

```sh
docker build -t nodejs-app --build-arg DB_URI="<YOUR_MONGO_URI>" --build-arg JWT_KEY="<YOUR_JWT_KEY>" .
```

**RUN**

```sh
docker run -d --name nodejs-app -p <YOUR_PORT>:3000 nodejs-app
```
