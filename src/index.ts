import "reflect-metadata";
import { createServer } from "http";
import app from "@utils/Application";
import { createMongoConnection } from "@/config/database.config";

//connect to mongoDB
createMongoConnection();

// http server
const expressServer = createServer(app.instance);

//start the server
const PORT = process.env.PORT || 8080;
expressServer.listen(PORT, () => {
  console.log(`[server] : Server is running on port ${PORT}`);
});
