import { createServer } from "http";
import { app } from "@/bootstrap";
import { connectToImageKit, createMongoConnection } from "@/config";

//creating the server
const expressServer = createServer(app.instance);

//connect to mongoDB
createMongoConnection();

//connect to ImageKit
connectToImageKit({
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY as string,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY as string,
  urlEndpoint: process.env.IMAGE_KIT_URL_ENDPOINT as string,
});

//start the server
const PORT = process.env.PORT || 5000;

expressServer.listen(PORT, () => {
  console.log(`[server] : Server is running on port ${PORT}`);
});
