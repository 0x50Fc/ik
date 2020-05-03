#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ik_1 = require("./ik");
var commander = require("commander");
commander
    .command('ik <inDir> <outDir>')
    .description('quick generate ik code')
    .usage("ik <inDir> <outDir>")
    .action(function (inDir, outDir) {
    ik_1.ik(inDir, outDir);
});
commander.parse(process.argv);
