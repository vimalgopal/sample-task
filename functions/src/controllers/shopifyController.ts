import * as express from "express";
import { constants, getRandomArbitrary } from "../utilities/constants";
import * as functions from 'firebase-functions';
import {secureCookieOptions,applyLoginCookie} from "../middlewares/shopifyLoginMiddleware";
import {verifyHmac} from "../middlewares/verifyHmac";
import * as request from "request-promise-native";
import { Store } from "../models/Store";
import { addScriptTag } from "../utilities/scriptTag";
import { subscribeToWebhooks } from "../utilities/webhooks";

const router = express.Router();

export const shopifyController = router;

const SHOPIFY_SCOPES = "read_products,read_script_tags,write_script_tags";

//connect and install route
export const connectGETRoute = router.get("/connect", (req, res) => {
  const shopDomain: string = req.query.shop as any

  if (shopDomain) {
    const state = getRandomArbitrary(8, 13);
    const redirectUri = `${constants.schema}://${constants.defaultRequestHost}${constants.basePath}/shopify/callback`;
    const shopUrl = shopDomain.endsWith("myshopify.com")
        ? shopDomain
        : `${shopDomain}.myshopify.com`;
    const installUri =
        `${constants.schema}://${shopUrl}/admin/oauth/authorize?client_id=${
            functions.config().shopify.api_key
            }` +
        `&scope=${SHOPIFY_SCOPES}` +
        `&state=${state}` +
        `&redirect_uri=${redirectUri}`;
    res.cookie("state", state, secureCookieOptions(req, res));
   
    return res.render('redirect', {
      redirectUrl: installUri,
      forceParentRedirect: true
    });
  }
  return res.render("shopify/connect");

});

//verify connect and save details to db or update db
export const callbackGETRoute = router.get("/callback", (req, res) => {
  const {shop, hmac, code, state} = req.query as any
  const stateCookie = req.signedCookies.state;

  const conf = functions.config().shopify;
  if (state !== stateCookie) {
    console.warn(`State: ${state} stateCookie: ${stateCookie}`);
    return res.status(403).send("Request origin cannot be verified");
  }
  if (shop && hmac && code) {
    const hashEquals = verifyHmac(hmac, req.query);

    if (!hashEquals) {
      return res.status(400).send("HMAC validation failed");
    }
    // DONE: Exchange temporary code for a permanent access token
    const accessTokenRequestUrl =
        "https://" + shop + "/admin/oauth/access_token";
    const accessTokenPayload = {
      client_id: conf.api_key,
      client_secret: conf.api_secret,
      code
    };

    return request
        .post(accessTokenRequestUrl, {json: accessTokenPayload})
        .then(accessTokenResponse => {
          const mp = new Store({
            id: shop,
            accessToken: accessTokenResponse.access_token
          });

          const mpRepo = Store.getRepository();

          return mpRepo.findById(shop).then(async existingMp => {
            if (existingMp != null) {
              existingMp.accessToken = accessTokenResponse.access_token;
              await mpRepo.update(existingMp);
            } else {
              await mpRepo.create(mp);
              await addScriptTag(mp)
              await subscribeToWebhooks(mp)
            }
            applyLoginCookie(shop, req, res);

            return res.redirect(`${constants.basePath}/`);
          });
        })
        .catch(error => {
          console.error(JSON.stringify(error));
          return res.status(error.statusCode).send(error?.error?.error_description);
        });

  } else {
    return res.status(400).send("Required parameters missing");
  }

});
