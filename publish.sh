#!/usr/bin/env bash

set -uo pipefail

cd lib
npm run build
cp ../README.md ../LICENSE package.json dist
cd dist
npm publish
