import * as express from "express";
import * as functions from "firebase-functions";

export const constants = {
  basePath: process.env.NODEMON_DEBUG ? '' : '/appv2',
  port: null,
  shopifyApiVersion: '2019-07',
  schema: process.env.FUNCTIONS_EMULATOR ? (process.env.MDEBUG_COMMAND ? "https" : "https") : "https",
  project: process.env.GCLOUD_PROJECT || "",
  allowedHosts: [
    "localhost",
    "suggestr-shopify.ngrok.io",
    "us-central1-pohoda-sandbox-dev.cloudfunctions.net"
  ],
  defaultRequestHost: process.env.RUNNING_SCRIPT ? "" : functions.config().default.req_host,
  functionLocation: 'us-central1',
  jwtSecret: process.env.JWT_SECRET || "different JWT asdl kjalkjklasd kjla123 123123 ",
 
};

export const requestHost = function (request: express.Request): string {
  if (constants.allowedHosts.indexOf(request.hostname) == -1) {
    throw new Error(`Host: ${request.hostname} not in allowedHosts`);
  }
  return request.hostname;
};

export const getRandomArbitrary = function (min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
};
