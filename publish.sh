#! /bin/bash
version='1.0.'$(date +%Y%m%d%H%M)
npm version ${version} && npm run build && npm publish --access public && git commit -am publish:${version} && git push
