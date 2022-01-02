#!/bin/bash

cd ./test/snippets
# Disabled cases: logo(long execution time), integer(no 64bit support)
AHEUI=../../examples/node/node-aheui.js bash test.sh --disable logo integer
