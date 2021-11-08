# Rally + WebScience Study Template
This repository provides a template for building browser-based research studies with the [Rally](https://rally.mozilla.org/) platform and the [WebScience](https://github.com/mozilla-rally/web-science/) library.

# Mozilla Websience API Functionality
<table>
  <thead>
    <tr>
        <th>Extension API capability</th>
        <th>Example uses</th>
        <th>On a regular website (davidxie.net)</th>
        <th>On YouTube</th>
        <th>Possible workaround</th>
      </tr>
  </thead>

  <tbody>
    <tr>
        <td>Get page visiting data when user <a href="https://mozilla-rally.github.io/web-science/jsdocs/module-pageManager.onPageVisitStart.html">begin visiting this page</a> and <a href="https://mozilla-rally.github.io/web-science/jsdocs/module-pageManager.onPageVisitStop.html">stop visiting this page</a></td>
        <td></td>
        <td>Working</td>
        <td>Referral URL is blank</td>
        <td>
            <ul>
              <li>Using <code>browser.tabs</code> API to listen to an updated URL (requires tabs permission declared in the extension manifest file)</li>
              <li>Use <code>chrome.webNavigation.onHistoryStateUpdated.addListener((event)=>{})</code> to capture when URL changes through API</li>
              <li>Use <code>chrome.webNavigation.onCompleted</code> event listener </li>
              <li>Use WebScience’s <code>pageTransition.onPageTransitionData</code> event listener (not working, see issue on that row)</li>
            </ul>
            <div><code>chrome.webNavigation</code> <a href="https://developer.chrome.com/docs/extensions/reference/webNavigation/#event-onCompleted">API documentation</a></div>
            <div>Per <a href="https://mozilla-rally.github.io/web-science/jsdocs/module-pageTransition.html">this API documentation </a>: “webpages and browsers are increasingly limiting when referrers are sent”</div>
        </td>
      </tr>
      <tr>
        <td><a href="https://mozilla-rally.github.io/web-science/jsdocs/module-idle.html">Check browser’s idling state</a> and <a href="https://mozilla-rally.github.io/web-science/jsdocs/module-idle.onStateChanged.html">notify when this state changes</a>, which can be used to gather whether user’s paying attention on a page.</td>
        <td>
          <div><code>function idleStateChangeListener(idleState) {return console.log("Browser's Idle State: " + idleState);}</code></div><div>&nbsp</div><div><code>webScience.idle.onStateChanged.addListener(idleStateChangeListener, {detectionInterval: 1})</code></div>
        </td>
        <td colspan="2">Working (web page independent, but took about 3 minutes to observe browser idle state change; this timer is believed to be hard-coded on the browser itself, and there are other factors that would make this time vary).</td>
        <td>Can also use <code>chrome.idle.onStateChanged</code> API</td>
      </tr>
      <tr>
        <td><a href="https://mozilla-rally.github.io/web-science/jsdocs/module-events.html">Listen to Web Extension Event</a></td>
        <td>
          <div><code>const pageVisitListener = function(details) {console.log("Page ID: " + details.pageId + ", Tab ID: " + details.tabId + ", windowID: " + details.windowId);}</code></div><div>&nbsp</div><div><code>webScience.pageManager.onPageVisitStart.addListener(pageVisitListener, {privateWindows: false});</code></div>
        </td>
        <td colspan="2">Not Tested (could not figure out creating web extension custom events (not DOM nor extension built-in event))</td>
        <td></td>
      </tr>
      <tr>
        <td><a href="https://mozilla-rally.github.io/web-science/jsdocs/module-storage.html">Store extension-generated data</a> to local computer, use Associative Array data type (key-value pairs)</td>
        <td colspan="3">
          <div>Yes (web page independent). Should use this way to store data as user can use extension’s data export function to read it OR parse it into data analyzing programs.</div>
          <div>&nbsp</div>
          <div><code>const exampleStorage = webScience.storage.createKeyValueStorage("exampleName");</code></div>
          <div>&nbsp</div>
          <div><code>exampleStorage.set("exampleName", {key: 1, value: 2}).then(()=>console.log("Done Saving exampleName local storage"));</code></div>
        </td>
        <td></td>
      </tr>
      <tr>
        <td>Detects whether user pauses/resumes data collection.</td>
        <td colspan="3">Yes (web page independent), this Mozilla extension will send a message when such state changes.</td>
        <td></td>
      </tr>
      <tr>
        <td>Within background script, <a href="https://mozilla-rally.github.io/web-science/jsdocs/module-messaging.onMessage.html">listen to messages from content script and respond accordingly.</a></td>
        <td colspan="3">Not tested, I recommend using Firefox extension’s native message-passing APIs, as it can easily send and receive JSON-formatted objects.</td>
        <td></td>
      </tr>
      <tr>
        <td><a href="https://mozilla-rally.github.io/web-science/jsdocs/module-linkExposure.onLinkExposureData.html">Gather Links</a> (that matches to a pattern) within this webpage</td>
        <td>
          <div><code>const linkExposureDataListener = function (details) {console.log(details);}</code></div><div>&nbsp</div><div><code>webScience.linkExposure.onLinkExposureData.addListener(linkExposureDataListener, {linkMatchPatterns: [ "*://*.youtube.com/*" ], privateWindows: true})</code></div>
        </td>
        <td colspan="2">
          <div>Unknown (attempted to use it but no result)</div>
          <div>&nbsp</div>
          <div>I do see this WebScience error: <strong>matchPatterns is undefined</strong> in the browser console. I have tried an approach by coping a code of a extension from Stanford but did not solve this issue)</div>
          <div>&nbsp</div>
          <div>I’ve also tried creating custom match pattern from following the tutorial <a href="https://mozilla-rally.github.io/web-science/jsdocs/module-matching.html"> here </a>, but still no progress.</div>
        </td>
        <td>Use JavaScript native DOM API to query links within this webpage, but it might not work on hrefs that only contain relative link or no link but rather front-end framework page routers.</td>
      </tr>
      <tr>
        <td><a href="https://mozilla-rally.github.io/web-science/jsdocs/module-pageText.onTextParsed.html">Parse article main text</a> from a web page</td>
        <td>
          <div><code>// Handle onTextParsed event callbacks
webScience.pageText.onTextParsed.addListener(async (pageData) => {const surveyUserID = await webScience.userSurvey.getSurveyId() const output = {"type" : "WebScience.articleContents","visitId" : pageData.pageId,"userId" :  ""+surveyUserID,"url" : pageData.url,"title" : pageData.title,"textContent" : pageData.textContent} console.log(output);}, {matchPatterns: destinationDomains});</code></div>
        </td>
        <td colspan="2">Same as above</td>
        <td></td>
      </tr>
      <tr>
        <td>Get details regarding users’ <a href="https://mozilla-rally.github.io/web-science/jsdocs/module-pageNavigation.onPageData.html">basic page-browsing behaviors </a>(such as the amount of time page had user attention and page playing audio)</td>
        <td>
          <div><code>const pageDataListener = function(details) {console.log("PageDataListener Response");console.log(details);}</code></div>
          <div>&nbsp;</div>
          <div><code>webScience.pageNavigation.onPageData.addListener(pageDataListener, {matchPatterns: destinationDomains, privateWindows: false});</code></div>
        </td>
        <td colspan="2">Same as above</td>
        <td></td>
      </tr>
      <tr>
        <td><a href="https://mozilla-rally.github.io/web-science/jsdocs/module-pageTransition.onPageTransitionData.html">Listen to PageTransition actions</a> (such as URL change through History API)</td>
        <td>
          <div><code>const pageTransitionDataListener = function(details) {console.log("PageTransitionDataListener Response")console.log(details);}</code></div>
          <div>&nbsp;</div>
          <div><code>webScience.pageTransition.onPageTransitionData.addListener(pageTransitionDataListener, {matchPatterns: destinationDomains, privateWindows: false});</code></div>
        </td>
        <td colspan="2">Same as above</td>
        <td></td>
      </tr>
      <tr>
        <td>Observe whether a user left browser <a href="https://mozilla-rally.github.io/web-science/jsdocs/module-scheduling.onIdleDaily.html">idle for a day</a> or <a href="https://mozilla-rally.github.io/web-science/jsdocs/module-scheduling.onIdleWeekly.html">for a week</a></td>
        <td>
          <div><code>webScience.scheduling.onIdleDaily.addListener((event)=>{console.log("You've been idled for a day")});</code></div>
          <div>&nbsp;</div>
          <div><code>webScience.scheduling.onIdleWeekly.addListener((event)=>{console.log("You've been idled for a week")});</code></div>
        </td>
        <td colspan="2">Testing in-progress (the idle for a day listener is working; expect to receive result for idle for a week listener on November <strong>14</strong>)</td>
        <td></td>
      </tr>
      <tr>
        <td><a href="https://mozilla-rally.github.io/web-science/jsdocs/module-socialMediaLinkSharing.html">Observe users’ link-sharing on social media</a></td>
        <td>
          <div><code>// Social Media Sharing callback </code></div>
          <div>&nbsp</div>
          <div><code>const socialMediaShareCallback = function(details) {console.log("From Social Media Sharing callback");console.log(details);}</code></div>
          <div>&nbsp;</div>
          <div><code>webScience.socialMediaLinkSharing.onShare(socialMediaShareCallback);</code></div>
        </td>
        <td colspan="2">
          <div><strong>NOT Working:</strong></div>
          <div>Extension builder will translate</div>
          <div><code>webScience.socialMediaLinkSharing.onShare(socialMediaShareCallback);</code></div>
          <div>to</div>
          <div><code>onShare(socialMediaShareCallback);</code></div>
          <div>, which would be nowhere defined.</div>
        </td>
        <td>Note: API author is making ground-breaking change on this API (see <a href="https://github.com/mozilla-rally/web-science/#api-implementation-progress">here</a>)</td>
      </tr>
  </tbody>
</table>

[Chrome Extension API Reference](https://developer.chrome.com/docs/extensions/reference/) (can directly use most syntax as-is in Firefox)

Utility features in WebScience that may not be necessary for this project

<table>
  <thead>
    <tr>
        <th>Extension API capability</th>
      </tr>
  </thead>

  <tbody>
    <tr>
      <td><a href="https://mozilla-rally.github.io/web-science/jsdocs/module-timing.html">Unified high-resolution timing</a></td>
    </tr>
    <tr>
      <td><a href="https://mozilla-rally.github.io/web-science/jsdocs/module-workers.html">Dispatch worker processes</a></td>
    </tr>
    <tr>
      <td><a href="https://mozilla-rally.github.io/web-science/jsdocs/module-userSurvey.html">Prompt or remind participants to complete survey (located on an external URL)</a>. It highly unlikely supports local survey html files.</td>
    </tr>
    <tr>
      <td><a href="https://mozilla-rally.github.io/web-science/jsdocs/module-socialMediaActivity.html">Parse social media posts’ high-level content </a> (supported platforms: Facebook, Twitter, and Reddit). Note: API author is making ground-breaking change on this API (see <a href="https://github.com/mozilla-rally/web-science/#api-implementation-progress">here</a>)</td>
    </tr>
    <tr>
      <td> <a href="https://mozilla-rally.github.io/web-science/jsdocs/module-randomization.html">Assign different values to different study participants</a>, particularly useful for A/B testing and experiment/control groups. I assume this is not needed because this YouTube misinformation study is an observational study not an experiment.</td>
    </tr>
  </tbody>

</table>

## Background Material

Before working with this template, we recommend familiarizing yourself with the following concepts.

* Implementing Research Studies as Browser Extensions
  * [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Introduction) - The scripting language commonly used for web applications, including browser extensions. Studies on Rally are implemented in JavaScript. If you haven't worked with JavaScript in awhile, we especially recommend catching up on [modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), and [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers), since those features are used in Rally, WebScience, and this template.
  * [WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) - An API for building browser extensions. Each study on Rally is a separate extension. If you haven't worked with WebExtensions in awhile, we recommend reviewing the [structure of browser extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension), including [manifests](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json), [background scripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension#background_scripts) which run in a background page, and [content scripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts) which run on ordinary pages.
  * [WebScience](https://github.com/mozilla-rally/web-science/) - A library for building browser-based research studies. WebScience provides production-quality functionality that is commonly required, difficult to implement correctly, and difficult to maintain.
  * [Rally SDK](https://github.com/mozilla-rally/rally-sdk) - A library for integrating your study with the Rally platform. Rally SDK communicates with the [Rally Web Platform](https://github.com/mozilla-rally/rally-web-platform), which manages user enrollment.
* Building and Testing Research Study Browser Extensions
  * [ESLint](https://eslint.org/) - A linter for JavaScript. This template invokes ESLint with Node.js commands; you should not have to manually run ESLint or modify the ESLint configuration.
  * [Node.js](https://nodejs.org/) - A JavaScript runtime for web applications. This template uses Node.js in two primary ways. First, Node.js provides a convenient toolkit for managing JavaScript library dependencies (see [`npm`](https://docs.npmjs.com/cli/v7/commands/npm) and [`package.json`](https://docs.npmjs.com/cli/v7/configuring-npm/package-json)). You can easily integrate Node.js packages from the [npm public registry](https://www.npmjs.com/). Second, Node.js enables running build and test commands that are similar to makefile targets (see [package scripts](https://docs.npmjs.com/cli/v7/using-npm/scripts) and [`npm run`](https://docs.npmjs.com/cli/v7/commands/npm-run-script)). You should not have to modify these Node.js commands. Note that this template does _not_ use Node.js as a runtime for research studies.
  * [Rollup](https://rollupjs.org/) - A module bundler for JavaScript. This template uses Rollup to merge module dependencies (either your own modules or npm modules) into a study extension and to remove unused code from dependencies. The template also enables using module depencies in content and worker scripts. You should not have to modify the Rollup configuration of the template.
  * [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/) - A toolkit for building and testing browser extensions. This template invokes web-ext with Node.js commands; you should not have to modify the web-ext configuration.

## Template Contents

This template includes the following files.

* [`.eslintignore`](./eslintignore) and [`.eslintrc`](./eslintrc) - ESLint configuration. You should not have to modify these files.
* [`.gitignore`](./gitignore) - Git configuration. You should not not have to modify this file.
* [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) - The [code of conduct](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-a-code-of-conduct-to-your-project) for the study extension. You should update this file to reflect your code of conduct.
* [`LICENSE`](./LICENSE) - The [license](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/licensing-a-repository) for the study extension. You can use the provided license or your own license, so long as your license is compatible with Rally requirements and the licenses of dependencies.
* [`README.md`](./README.md) - A [README](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/about-readmes) for the study extension. You should update this file to describe your study and its implementation.
* [`manifest.json`](./manifest.json) - A WebExtensions [manifest](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json) for the study. You should update the [`description`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/description), [`author`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/author), [`name`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/name), [`version`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/version), and [`homepage_url`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/homepage_url) fields for your study. You can also update [`permissions`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions) as necessary for implementing your study. The Rally team will provide a value for the [`browser_specific_settings.gecko.id`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_specific_settings) field.
* [`package.json`](./package.json) - A Node.js [package configuration](https://docs.npmjs.com/cli/v7/configuring-npm/package-json) for the study. You should update the `name`, `version`, `description`, `repository`, `keywords`, `author`, `license`, `bugs`, and `homepage` fields. You should not have to update the `scripts` field, which specifies a set of commands that function like makefile targets. You can add `dependencies` for your study implementation, either manually or with `npm install`. Note that you must use [`npm install`](https://docs.npmjs.com/cli/v7/commands/npm-install) to install dependencies and [`npm update`](https://docs.npmjs.com/cli/v7/commands/npm-update) to update dependencies.
* [`package-lock.json`](./package-lock.json) - A file automatically generated by Node.js package management that [describes package dependencies](https://docs.npmjs.com/cli/v7/configuring-npm/package-lock-json). You should not have to manually edit this file.
* [`rollup.config.js`](./rollup.config.js) - A [Rollup](https://rollupjs.org/) configuration for the study. You should not have to modify this file.
* [`web-ext-config.js`](./web-ext-config.js) - A [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/) configuration for the study. This configuration will, on browser startup, automatically open both the [Browser Console](https://developer.mozilla.org/en-US/docs/Tools/Browser_Console) and [Firefox Developer Tools](https://developer.mozilla.org/en-US/docs/Tools) for the background page. You should not have to modify this file.
* `.circleci/` - CircleCI configuration.
  * `config.yml` - A basic CircleCI configuration for the study template. You can use this file as a starting point for your own tests, or you can safely remove the file.
* `.github/` - GitHub configuration.
  * `dependabot.yml` - A [GitHub dependency update](https://docs.github.com/en/code-security/supply-chain-security/keeping-your-dependencies-updated-automatically) configuration. You can use this file for managing dependency updates, or you can safely remove the file.
* `src/` - The source for the study implementation. You should include all your study JavaScript files in this directory, and you can optionally include non-JavaScript assets. The build system will bundle JavaScript files to the `/dist` directory, as described below. The build system will also copy non-JavaScript assets (i.e., any files that do not end in `.js`) to the `dist/` directory.
  * `background.js` - The main [background script](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension#background_scripts) for the study. The build system will bundle this script and output to `dist/background.js`. Note that the WebExtensions manifest already specifies `dist/background.js` as a background script for the extension.
  * `exampleContentScript.content.js` - An example [content script](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts) for the study. The build system automatically recognizes a `*.content.js` file as a content script, bundles it separately from the main background script, and outputs to the same relative path in `dist/` that the file has in `src/`. The build system will output this content script file, for example, to `dist/exampleContentScript.content.js`. We provide this functionality so that study content scripts can include module dependencies.
  * `exampleModule.js` - An example module for the study. The build system will bundle this module into the main background script; there is no separate output in `dist/`. If you want to split your background script implementation into multiple files, we recommend using modules imported into `background.js` to benefit from performance optimizations in bundling, rather than using multiple background scripts specified in `manifest.json`.
  * `exampleWorkerScript.worker.js` - An example web worker script for the study. The build system treats `*.worker.js` files the same way as `*.content.js` files.
* `tests/integration/` - A basic [Selenium](https://www.selenium.dev/) integration test for the study template. You can use these files as a starting point for your own tests, or you can safely remove the files.

## Getting Started

Prerequisites: current versions of [Firefox](https://www.mozilla.org/firefox/new/) and [Node.js](https://nodejs.org/). You might find it helpful to install Node.js with a [package manager](https://nodejs.org/en/download/package-manager/), such as [Scoop](https://scoop.sh/) on Windows, [Homebrew](https://brew.sh/) on macOS, or [`apt-get`](https://help.ubuntu.com/community/AptGet/Howto) on Ubuntu Linux.
1. Either [fork this repository](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) or [create a new repository from this template](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-on-github/creating-a-repository-from-a-template).
2. Update the [WebExtensions manifest](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json) ([`manifest.json`](./manifest.json)) for your study. You should update the [`description`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/description), [`author`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/author), [`name`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/name), [`version`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/version), and [`homepage_url`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/homepage_url) fields. The Rally team will provide a value for the [`browser_specific_settings.gecko.id`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_specific_settings) field.
3. Update the [Node.js package configuration](https://docs.npmjs.com/cli/v7/configuring-npm/package-json) ([`package.json`](./package.json)) for your study. You should update the `name`, `version`, `description`, `repository`, `keywords`, `author`, `license`, `bugs`, and `homepage` fields.
4. In the forked repository, run [`npm install`](https://docs.npmjs.com/cli/v7/commands/npm-install) to install Node.js package dependencies. A new `node_modules/` directory will be automatically populated with these dependencies.
5. Run `npm run dev`. The build system will build your study extension, launch Firefox with the study extension installed, and automatically open both the [Browser Console](https://developer.mozilla.org/en-US/docs/Tools/Browser_Console) and [Firefox Developer Tools](https://developer.mozilla.org/en-US/docs/Tools) for the background page.
6. Commit your study extension to a repository! You now have a clean and functional starting point for implementing your study. If this template is updated in future, you can also easily merge those updates into your study.

## Build System Commands
This template comes with a set of predefined Node.js commands, which function similar to makefile targets. These commands should help you with study implementation, debugging, testing, and deployment. You run each command with `npm run <command>`.

* `build` - Builds the study extension, by bundling JavaScript implementation in `src/` and copying non-JavaScript files. Output is in the `dist/` directory.
* `dev` - Bundles the study extension (like `build`), but in _developer mode_, launch Firefox with the study extension installed, automatically rebuild the study if a file changes, and automatically reload the study in Firefox if the study is rebuilt. In developer mode, Rally SDK does not contact the website or the Firebase backend. Developer mode also provides a [source map](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map) for bundled JavaScript, so you can use the [Debugger](https://developer.mozilla.org/en-US/docs/Tools/Debugger) as if the JavaScript were not bundled. You should typically use developer mode when implementing and testing your study.
* `dev:emulator` - Like `dev`, but run in _emulator mode_, which connects to a local Firebase emulator. See the [Rally Web Platform docs](https://github.com/mozilla-rally/rally-web-platform#quickstart) for information on running a local Firebase emulator.
* `lint`: Run linting on the study extension.
* `package`: Build the study extension (`build`), then package the built study into an archive for distribution. Output is in the `web-ext-artifacts/` directory.
* `test:integration`: Packages the study extension (`package`), then runs the provided integration test.

## Debugging the Study Extension in Firefox
* Debugging the Background Script - Navigate to the browser debugging page (`about:debugging`), click This Firefox, then click Inspect on the study extension. The page that opens is [Firefox Developer Tools](https://developer.mozilla.org/en-US/docs/Tools) for the background page, including a [Web Console](https://developer.mozilla.org/en-US/docs/Tools/Web_Console), [JavaScript Debugger](https://developer.mozilla.org/en-US/docs/Tools/Debugger), and [Network Monitor](https://developer.mozilla.org/en-US/docs/Tools/Network_Monitor). Background script console output will also appear on the [Browser Console](https://developer.mozilla.org/en-US/docs/Tools/Browser_Console). The template's web-ext configuration will automatically open both Firefox Developer Tools for the background page and the Browser Console on browser startup.
* Debugging a Content Script - On a page where the content script is running, open [Firefox Developer Tools](https://developer.mozilla.org/en-US/docs/Tools). The [Web Console](https://developer.mozilla.org/en-US/docs/Tools/Web_Console) will include output from the content script, and you can select the content script in the [JavaScript Debugger](https://developer.mozilla.org/en-US/docs/Tools/Debugger). Content script console output will also appear on the [Browser Console](https://developer.mozilla.org/en-US/docs/Tools/Browser_Console).
