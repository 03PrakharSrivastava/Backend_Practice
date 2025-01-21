import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(express.static('public'));

app.use(express.json({limit:"16kB"})); //Enables the server to parse incoming JSON payloads in Content-Type:
//  application/json requests.

app.use(urlencoded({extended:true,limit:'16kB'}));//Enables the server to parse incoming URL-encoded payloads in requests with Content-Type: application/x-www-form-urlencoded (commonly used in form submissions).
// extended: true:
// Allows nested objects in the payload.
// Example: key[subkey]=value will be parsed as { key: { subkey: "value" } }.

app.use(cookieParser);

// router
import router from "./routes/users.routes";

app.use('/api/users',router);

export default app;