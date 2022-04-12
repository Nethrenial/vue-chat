import dotenv from "dotenv";
import NethrenialApplicationFactory from "./core/application";
import { controllers } from "./modules";

dotenv.config();

// creating the application
const app = new NethrenialApplicationFactory(controllers);

//enable cors for Defined CORS origin
app.enableCors(true, {
  origin: process.env.CORS_ORIGIN,
});

//Setup body parsing for application
app.setupBodyParsers({
  json: true,
  urlencoded: {
    extended: true,
  },
});

export { app };
