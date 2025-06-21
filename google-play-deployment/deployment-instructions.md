# Google Play Store Deployment Instructions

## Step-by-Step Guide to Publish Lemur Express 11

### Prerequisites
1. Google Play Console account ($25 one-time registration fee)
2. Android Studio installed on your computer
3. Java Development Kit (JDK) 8 or higher

### Phase 1: Build the App

1. **Run the build script:**
   ```bash
   chmod +x build-android-app.sh
   ./build-android-app.sh
   ```

2. **In Android Studio:**
   - Open the `android` folder when prompted
   - Wait for Gradle sync to complete
   - Go to `Build` → `Generate Signed Bundle / APK`
   - Select `Android App Bundle`
   - Create a new keystore or use existing one
   - Fill in keystore details and remember them (you'll need this for updates)
   - Choose `release` build variant
   - Click `Finish`

3. **Locate your AAB file:**
   - Find the generated `.aab` file in `android/app/release/`
   - This is your upload file for Google Play

### Phase 2: Google Play Console Setup

1. **Create App Listing:**
   - Go to [Google Play Console](https://play.google.com/console)
   - Click "Create app"
   - App name: "Lemur Express 11"
   - Default language: English
   - App or game: App
   - Free or paid: Free

2. **Upload App Bundle:**
   - Go to "Release" → "Production"
   - Click "Create new release"
   - Upload your `.aab` file
   - Add release notes: "Initial release of Lemur Express 11 pizza ordering app"

3. **Store Listing:**
   - Use content from `app-store-listing.md`
   - Upload required screenshots (create 5 screenshots of your app)
   - Upload app icon (512x512 PNG)
   - Upload feature graphic (1024x500 PNG)

4. **Content Rating:**
   - Complete content rating questionnaire
   - Select "Everyone" rating

5. **Privacy Policy:**
   - Upload `privacy-policy.html` to your website
   - Add the URL to your app listing

### Phase 3: Review and Publish

1. **App Content:**
   - Complete target audience selection
   - Add news apps declaration if applicable
   - Complete COVID-19 contact tracing and status declarations

2. **Review:**
   - Check all sections have green checkmarks
   - Submit for review
   - Review typically takes 1-3 business days

3. **Post-Approval:**
   - Your app will be live on Google Play Store
   - Users can download and install it
   - Monitor reviews and ratings

### Important Notes

- **Keep your keystore safe** - you need it for all future updates
- **Test thoroughly** before submitting
- **App reviews** can take 1-7 days
- **Updates** follow the same process but faster review

### Troubleshooting

**Build Issues:**
- Ensure all dependencies are installed
- Check Android SDK is up to date
- Verify Capacitor configuration

**Store Rejection:**
- Review Google Play policies
- Ensure privacy policy is accessible
- Check content rating accuracy
- Verify app functionality

### Support Resources

- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Android Studio Guide](https://developer.android.com/studio/publish/app-bundle)

### Files Included in This Package

- `build-android-app.sh` - Build script with employee features included
- `app-store-listing.md` - Complete store listing with employee portal features
- `privacy-policy.html` - Required privacy policy
- `deployment-instructions.md` - This instruction file
- `employee-features-documentation.md` - Complete employee dashboard feature list
- `mobile-app-configuration.json` - App configuration with all features enabled
- `capacitor-config-android.ts` - Android-specific mobile settings

### Quick Start Checklist

- [ ] Run build script
- [ ] Generate signed AAB in Android Studio
- [ ] Create Google Play Console account
- [ ] Upload app bundle
- [ ] Complete store listing
- [ ] Submit for review
- [ ] Monitor approval status

Your Lemur Express 11 pizza ordering app is ready for Google Play Store deployment!