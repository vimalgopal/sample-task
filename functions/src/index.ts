import * as functions from 'firebase-functions';
import * as express from "express";
import { shopifyController } from './controllers/shopifyController';
import { testController } from './controllers/testController';
import { shopifyLoginRequiredMiddleware } from './middlewares/shopifyLoginMiddleware';
import exphbs = require("express-handlebars");
import { constants } from './utilities/constants';
const STATIC_PATH = "assets";
import cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser(constants.jwtSecret));

app.engine("handlebars", exphbs.create({
  helpers:{
    static: function (options: any) {
      return `${constants.basePath}/${STATIC_PATH}/${options.fn()}`;
    },
  }
}).engine);


app.set("view engine", "handlebars");
app.use(express.json());

//serve static assets on dir assets
app.use(`/${STATIC_PATH}`, express.static("assets"));

export const indexGETRoute = app.get("/", shopifyLoginRequiredMiddleware, async (req, res) => {
  res.render("home")
});

app.use("/test", testController);
app.use("/shopify", shopifyController);

exports.appv2 = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 500,
}).https.onRequest(app);

