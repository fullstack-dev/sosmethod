# SOS Method - Mobile Application

This app is coded with Ionic 3 which uses Angular.

## Setup

Install the Ionic cli:

```
sudo npm install -g ionic-cli
```

## Development

Run the development server and launch a browser window/tab:

```
ionic serve
```

## Building

note: for Android you will need to enter the key for the keystore. That can be found in LastPass.

To generate the Android `.apk` file, run:

```
bash build-android.sh
```

To generate the iOS `.ipa` file, run:

```
bash build-ios.sh
```
note: the ios build process is currently untested. Waiting on dev account to be setup.

## Deployment

Currently, we manually upload the apk to HockeyApp. Eventually, we will want to automate that, possibly using fastlane.tools.
