#!/bin/bash

tsc

cat ./head.js > ../dest/ik.wx.js

browserify ./export.js >> ../dest/ik.wx.js

uglifyjs ../dest/ik.wx.js -o ../dest/ik.wx.min.js
