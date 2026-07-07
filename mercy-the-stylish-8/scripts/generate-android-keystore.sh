#!/usr/bin/env bash
# Generates a release keystore for Mercy the Stylish and prints everything
# you need to paste into GitHub repo secrets.
#
# Run this ONCE, on your own machine (not in CI), FROM THE app/ DIRECTORY:
#   cd app
#   ../scripts/generate-android-keystore.sh
# This matters: it puts the keystore at app/release.keystore, which is where
# android-config/key.properties.example's "storeFile=../../release.keystore"
# expects to find it (that path is relative to app/android/app/, the Gradle
# module directory, not to wherever key.properties itself happens to sit).
#
# Keep the .keystore file and passwords somewhere safe (e.g. a password
# manager) - if you lose them you cannot update your app on the Play Store
# under the same listing again.

set -euo pipefail

KEYSTORE_FILE="release.keystore"
ALIAS="mercy-the-stylish"

if [ -f "$KEYSTORE_FILE" ]; then
  echo "A keystore already exists at ./$KEYSTORE_FILE - remove it first if you really want a new one."
  exit 1
fi

echo "This will ask for a keystore password, your name/org (for the certificate), and a key password."
echo "You can press Enter to reuse the keystore password as the key password."
echo

keytool -genkeypair \
  -v \
  -keystore "$KEYSTORE_FILE" \
  -alias "$ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

echo
echo "=================================================================="
echo "Keystore created: $KEYSTORE_FILE"
echo
echo "Now add these as GitHub repo secrets"
echo "(Settings > Secrets and variables > Actions > New repository secret):"
echo
echo "  ANDROID_KEY_ALIAS = $ALIAS"
echo "  ANDROID_KEYSTORE_PASSWORD = <the keystore password you just typed>"
echo "  ANDROID_KEY_PASSWORD = <the key password you just typed>"
echo "  ANDROID_KEYSTORE_BASE64 = <the long string printed below>"
echo "=================================================================="
echo
echo "ANDROID_KEYSTORE_BASE64 value:"
echo
base64 -i "$KEYSTORE_FILE" | tr -d '\n'
echo
echo
echo "Do NOT commit release.keystore to git. It's already in .gitignore."
