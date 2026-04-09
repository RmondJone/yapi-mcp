#!/bin/bash
claude mcp remove yapi-mcp
claude mcp add yapi-mcp -- node ./dist/index.js
sleep 2 && claude mcp list