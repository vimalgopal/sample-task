import Shopify = require("shopify-api-node");
import { Store } from "../models/Store";
import { constants } from "./constants";


//this way we uniformize the Shopify version
export const getNewShopifyClient = function (mp: Store): Shopify {
  if(mp.accessToken == null) {
    throw new Error(`AccessToken for MP: ${mp.id} is null - aborting`);
  }
  return new Shopify({
    shopName: mp.id,
    accessToken: mp.accessToken,
    apiVersion: constants.shopifyApiVersion
  })
};

export const getNewShopifyClientWithToken = function (mp:string,token:string): Shopify {
  return new Shopify({
    shopName: mp,
    accessToken: token,
    apiVersion: constants.shopifyApiVersion
  })
};



