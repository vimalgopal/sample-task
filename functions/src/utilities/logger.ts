import * as winston from "winston";
import {LoggingWinston} from "@google-cloud/logging-winston";

const format = winston.format;

const loggingWinston = new LoggingWinston({
  level: 'debug'
});

export const logger = function (label: string): winston.Logger {
  return winston.createLogger({
    level: 'debug',
    transports: [
      new winston.transports.Console({
        format: format.combine(
            format.label({label: label, message:true}),
            format.colorize(),
            format.simple()
        )
      }),
        loggingWinston
    ]
  });
}





