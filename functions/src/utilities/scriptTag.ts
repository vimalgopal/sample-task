import { Store } from "../models/Store";
import { constants } from "./constants";
import { logger } from "./logger";
import { getNewShopifyClient } from "./shopifyClient";

export const addScriptTag = async function (store: Store) {
  const LOG = logger('addScriptTag');
  try {
    const scriptUrl = `https://${constants.defaultRequestHost}${constants.basePath}/assets/script.js`
    LOG.info(`ScriptUrl :${scriptUrl}`)

    const shopify = getNewShopifyClient(store)
    await shopify.scriptTag.create({
      event: "onload",
      src: scriptUrl
    })
  }
  catch (e) {
    LOG.error('Script tag not loaded')
    LOG.error(JSON.stringify(e))
  }
}