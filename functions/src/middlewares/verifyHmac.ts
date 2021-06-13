import { logger } from "../utilities/logger";
import * as querystring from "querystring";
import * as functions from "firebase-functions";
import * as crypto from "crypto";


export const verifyHmac = function (providedHmacString: string, queryObj: any): boolean {
  const LOG = logger('shopify-verifyHmac');
  const conf = functions.config().shopify;
  const map = Object.assign({}, queryObj);
  delete map["signature"];
  delete map["hmac"];
  const message = querystring.stringify(map);
  const providedHmac = Buffer.from(providedHmacString, "utf-8");
  const generatedHash = Buffer.from(
      crypto
          .createHmac("sha256", conf.api_secret)
          .update(message)
          .digest("hex"),
      "utf-8"
  );
  let hashEquals = false;
  // timingSafeEqual will prevent any timing attacks. Arguments must be buffers
  try {
    hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac);
    // timingSafeEqual will return an error if the input buffers are not the same length.
  } catch (e) {
    LOG.error(e);
    hashEquals = false;
  }
  if (!hashEquals) {
    LOG.warn(`HMAC validation failed - provided hmac: ${providedHmacString} - calculated: ${generatedHash}\n
      API secret: ${conf.shopify.api_secret}\n
      Message: ${message}`);
  }
  return hashEquals;

}