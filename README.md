# Blog website (server) - MERN

This project was made using MREN, you can view it [here](https://developer-social-website.herokuapp.com/).

> MERN is a fullstack implementation in MongoDB, Expressjs, React/Redux, Nodejs.

MERN stack is the idea of using Javascript/Node for fullstack web development.

## to clone or download (server)

```terminal
$ git clone https://github.com/halevyoren/https://github.com/halevyoren/full-stack-blog-server
$ npm i
```

# Usage (run server app on your machine)

## Prerequirements

- [MongoDB](https://gist.github.com/nrollr/9f523ae17ecdbb50311980503409aeb3)
- [Node](https://nodejs.org/en/download/)
- [npm](https://nodejs.org/en/download/package-manager/)

notice, you need client and server runs concurrently in different terminal session, in order to make them talk to each other

## Server-side usage(PORT: 5000)

### Prepare your secret and mongoDB parameters

(You need to add a JWT key and mongoDB data in nodemon.json to connect to MongoDB)

```terminal
$ touch nodemon.json
```

edit the nodemon.json file such that it looks like this:

```terminal
{
  "env": {
    "DB_USER": the mongoDB username
    "DB_PASSWORD": the mongoDB password
    "DB_NAME": the mongoDB database name
    "JWT_KEY": the jsonWebToken
  }
}
```

### Start

```terminal
$ cd server   // go to server folder
$ npm install       // npm install pacakges
$ npm run server// run it locally
```

(switch "your-heroku-app" with the name of your heroku app)
