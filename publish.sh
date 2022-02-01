#!/usr/bin/env bash

set -uo pipefail

cd lib
npm run build
cp ../README.md ../LICENSE package.json dist
sed -i -E 's$(")(docs/)$\1https://github.com/costas-basdekis/shadows-js/blob/master/\2$g' dist/README.md
cd dist
npm publish
