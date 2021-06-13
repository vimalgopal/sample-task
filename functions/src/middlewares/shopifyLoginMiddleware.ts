
import * as express from "express";
import { Store } from "../models/Store";
import { logger } from "../utilities/logger";
import * as functions from "firebase-functions";
import { verifyHmac } from './verifyHmac';
import * as uaParser from "useragent";
import { constants } from "../utilities/constants";

export const shopifyLoginRequiredMiddleware = async function (
  req: express.Request,
  resp: express.Response,
  next: Function
) {
  const LOG = logger('shopifyLoginRequiredMiddleware');
  const { shop, hmac } = req.query as any
  const shopDomain = req.signedCookies ? req.signedCookies.shopifyStore : null

  if (shopDomain != null && shop != shopDomain && hmac != null) {
    const hashEquals = verifyHmac(hmac, req.query);
    if (hashEquals) {
      const mp = await Store.getRepository().findById(shop);
      if (mp != null) {
        innerLogin(mp, req, resp);
        return next();
      } else {
        LOG.warn(`shop and valid hmac found - but shop wasn't found locally - redirecting to connect`)
        return redirectToConnect(shop, resp);
      }
    }
  }

  if (shopDomain == null) {
    return redirectToConnect(shop, resp);
  }
  try {
    innerLogin(await getStorePartner(shopDomain), req, resp);

  } catch (e) {
    LOG.error(`Couldn't log in to ${shopDomain} redirecting to connect`, e);
    return redirectToConnect(shop, resp);
  }

  return next();
};


const innerLogin = function (mp: Store, req: express.Request, resp: express.Response) {
  //TODO - take care of the sameSite flag based on
  // the UA on the request
  applyLoginCookie(mp.id, req, resp);
  resp.locals.SHOPIFY_API_KEY = functions.config().shopify.api_key;
  resp.locals.SHOP_DOMAIN = mp.id;

  resp.locals.mp = mp;

}

const redirectToConnect = function (shop: string | null, resp: express.Response): void {
  const redirectUri =
    shop != null
      ? `${constants.basePath}/shopify/connect?shop=${encodeURIComponent(
        shop
      )}`
      : `${constants.basePath}/shopify/connect`;
  return resp.redirect(redirectUri);

}

export async function getStorePartner(
  shopDomain: string
): Promise<Store> {
  // const LOG = logger('shopifyController#getMerchantPartner');
  const repo = Store.getRepository();
  let mp = await repo.findById(shopDomain);
  if (mp == null) {
    throw new Error(`Couldn't find MP for shopDomain: ${shopDomain}`);
  }
  return mp;
}

export const applyLoginCookie = function (mpId: String, req: express.Request, resp: express.Response) {

  resp.cookie("shopifyStore", mpId, secureCookieOptions(req, resp));
}

export const secureCookieOptions = function (req: express.Request, resp: express.Response): express.CookieOptions {
  let options: express.CookieOptions = {
    signed: true,
    secure: true,
  };

  if (_shouldApplySameSiteNone(req.headers["user-agent"] || "")) {
    options = {
      signed: true,
      secure: true,
      sameSite: 'none'
    };
  }

  return options;

}
const _shouldApplySameSiteNone = function (uaString: string) {
  const LOG = logger("_shouldApplySameSiteNone");
  try {

    const userAgent = uaParser.parse(uaString);

    if (userAgent.family.toLowerCase().indexOf('chrom') != -1 && parseFloat(userAgent.major) < 67) {
      return false;
    }
    const os = userAgent.os;
    if (os.family.toLowerCase().indexOf("max os x") != -1 && os.major == "10" && os.minor == "14") {
      return false;
    }

    if (os.family.toLowerCase().indexOf("ios") != -1 && os.major == "12") {
      return false;
    }
    return true;
  } catch (ex) {
    LOG.error("caught error - returning should apply", ex)
    return true;
  }

}