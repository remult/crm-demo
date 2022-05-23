import { remultExpress } from 'remult/remult-express';
import glob from 'glob';
import path from 'path';
import { createPostgresConnection } from 'remult/postgres';
import { seed } from './seed';
import { config } from 'dotenv';


config();
let ext = "ts";
let dir = "src";
if (__filename.endsWith("js")) {
    ext = "js";
    dir = "dist";
}

for (const type of ["entity", "controller"]) {
    for (const file of glob.sync(dir + `/**/*.${type}.${ext}`)) {
        require(path.resolve(file))
    }
}

export const api = remultExpress({
    dataProvider: async () => {
        if (process.env.NODE_ENV === "production")
            return createPostgresConnection({ configuration: "heroku", sslInDev: true })
        return undefined;
    },
    initApi: seed
});