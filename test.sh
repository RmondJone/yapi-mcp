#!/bin/bash
npm run build
claude mcp remove yapi-mcp
claude mcp add --scope user yapi-mcp -- node ~/Documents/WorkSpace/yapi-mcp/dist/index.js
sleep 2 && claude mcp list