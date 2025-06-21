#!/bin/bash

echo "Setting up Firebase for Lemur Express 11..."

# Install Firebase CLI if not present
if ! command -v firebase &> /dev/null; then
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Login to Firebase (this will open browser)
echo "Logging into Firebase..."
firebase login --no-localhost

# Create new Firebase project
echo "Creating Firebase project..."
PROJECT_ID="lemur-express-11-$(date +%s)"
firebase projects:create $PROJECT_ID --display-name "Lemur Express 11"

# Initialize Firebase in current directory
echo "Initializing Firebase..."
firebase init firestore --project $PROJECT_ID

# Set up Firestore security rules
cat > firestore.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to orders
    match /orders/{document} {
      allow read, write: if true;
    }
    
    // Allow read/write access to users
    match /users/{document} {
      allow read, write: if true;
    }
    
    // Allow read/write access to pizzas
    match /pizzas/{document} {
      allow read, write: if true;
    }
    
    // Allow read/write access to notifications
    match /notifications/{document} {
      allow read, write: if true;
    }
    
    // Allow read/write access to profiles
    match /profiles/{document} {
      allow read, write: if true;
    }
  }
}
EOF

# Deploy Firestore rules
firebase deploy --only firestore:rules --project $PROJECT_ID

echo "Firebase project created: $PROJECT_ID"
echo "Go to https://console.firebase.google.com/project/$PROJECT_ID/settings/general to get your config"