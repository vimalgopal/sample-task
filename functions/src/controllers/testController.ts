import * as express from "express";
import { constants } from "../utilities/constants";
import { getNewShopifyClientWithToken } from "../utilities/shopifyClient";
const router = express.Router();


export const scriptGetRoute = router.get(
  "/script/:id",
  async (req, res, next) => {
    const id = req.params.id !== "1" ? req.params.id : null
    const domain = ""
    const token = ""

    const shopify = getNewShopifyClientWithToken(domain, token)
    id ? await shopify.scriptTag.delete(parseInt(id)) : ""
    console.log(await shopify.scriptTag.list())
    
    return res.sendStatus(200)

  });

  export const addScriptGetRoute = router.get(
    "/add-script/",
    async (req, res, next) => {
      
      const domain = "aero-apps-sandbox.myshopify.com"
      const token = "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"
  
      const shopify = getNewShopifyClientWithToken(domain, token)
     
      
      //create
      const scriptUrl = `https://${constants.defaultRequestHost}${constants.basePath}/assets/script.js`
      await shopify.scriptTag.create({
        event: "onload",
        src: scriptUrl
      })
  
      return res.sendStatus(200)
  
    });




export const testController = router;
