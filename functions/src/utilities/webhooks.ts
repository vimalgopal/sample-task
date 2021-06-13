import { Store } from "../models/Store";
import { logger } from "./logger";
import { getNewShopifyClient } from "./shopifyClient";



export const subscribeToWebhooks = async function (store: Store) {
  const LOG = logger('subscribeToWebhooks')
  try {
    LOG.info('Products subscribed')
    const shopify = getNewShopifyClient(store)
    await shopify.webhook.create({
      address: "https://example.com",
      topic: "products/update"
    })
  }
  catch (e) {
    LOG.error("Subsciption to webhooks unsucessfull")
    LOG.error(JSON.stringify(e))
  }
}