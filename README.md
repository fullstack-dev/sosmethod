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

## Deeplink Test Links
sosmethodapp://program?essentials
sosmethodapp://program?meditation
sosmethodapp://empwoser


## Please find deeplink All information from branch.io

branch.io : hello@sosmethod.co / s0sM3th0d* 

## Test Deeplink branch-config

<branch-config>
    <branch-key value="key_test_ehDYRW8JsKse8MgRws7lOenkCCm8nFxD" />
    <uri-scheme value="sos2alliedcode" />
    <link-domain value="sos2alliedcode.test-app.link" />
    <ios-team-release value="R38BH6KHNX" />
</branch-config>

## Release version

<branch-config>
    <branch-key value="key_live_kny9S18MEVso2OdUrq4mUjadFFa0mxsO" />
    <uri-scheme value="sos2alliedcode" />
    <link-domain value="sos2alliedcode.app.link" />
    <ios-team-release value="R38BH6KHNX" />
</branch-config>




