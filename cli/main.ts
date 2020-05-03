#!/usr/bin/env node

import { ik } from "./ik";

var commander = require("commander")

commander
    .command('ik <inDir> <outDir>')
    .description('quick generate ik code')
    .usage("ik <inDir> <outDir>")
    .action(function (inDir: string, outDir: string) {
        ik(inDir, outDir)
    })


commander.parse(process.argv);