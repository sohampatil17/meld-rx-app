#!/bin/bash

# Move the my-meldrx-app directory temporarily
if [ -d "my-meldrx-app" ]; then
  echo "Moving my-meldrx-app directory temporarily..."
  mv my-meldrx-app my-meldrx-app-temp
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

# Move the my-meldrx-app directory back
if [ -d "my-meldrx-app-temp" ]; then
  echo "Moving my-meldrx-app directory back..."
  mv my-meldrx-app-temp my-meldrx-app
fi

echo "Deployment complete!" 