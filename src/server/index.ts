import express from 'express';
import { remultExpress } from 'remult/remult-express';
import glob from 'glob';
import path from 'path';
import { seed } from './seed';

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

const app = express();
const api = remultExpress({
    initApi: seed
});
app.use(api);

app.listen(3002, () => console.log("Server started"));