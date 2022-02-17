"use strict";

const path = require("path");
const AutoLoad = require("fastify-autoload");

module.exports = async function (fastify, opts) {
  // Place here your custom code!
  fastify.register(require("fastify-websocket"));

  const connections = {};

  let i = 0;
  fastify.get(
    "/",
    { websocket: true },
    (connection /* SocketStream */, req /* FastifyRequest */) => {
      connections[i] = connection;
      i++;

      connection.socket.on("message", (message) => {
        for (let j = 0; j < i; j++) {
          connections[j]?.socket?.send(message.toString());
        }
      });
    }
  );

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });
};
