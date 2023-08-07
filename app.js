import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoute from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import { requireAuth, checkUser } from "./middleware/authMiddleware.js";

const app = express();

// midleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());


// database connection
const dbURI = 'mongodb+srv://<userName>:<password>@<database>.dnqim9u.mongodb.net/node-tuts?retryWrites=true&w=majority'; 
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

// routes
app.get('*', checkUser); // her get isteğinde checkUser middleware'i çalışacak.
app.get('/', (req, res) => res.send('home'));
app.get('/premium', requireAuth, (req, res) => res.send('Bu sayfayı yanlızca üyeler görüntüleyebilir.'))

app.use(authRoutes);
app.use(userRoutes);
app.use(postRoute);
app.use(commentRoutes);
