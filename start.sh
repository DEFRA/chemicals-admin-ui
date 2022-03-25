#!/bin/bash
echo ENV_NAME is
echo $ENV_NAME
echo ---------
if [ "$ENV_NAME" = "local" ]; then
  npm install gulp
  npm run local
else
  npm start
fi
