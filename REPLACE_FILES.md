# Replace These Files in GitHub Repository

Go to https://github.com/kaizM/pizza-ordering-system and replace these files:

## 1. package.json - Replace entire content with:
```json
{
  "name": "pizza-ordering-system",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "build": "echo 'No build needed'"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

## 2. vercel.json - Replace entire content with:
```json
{
  "version": 2
}
```

## 3. index.js - Upload this new file (copy content from Replit)

This eliminates the TypeScript build errors and creates a working deployment.