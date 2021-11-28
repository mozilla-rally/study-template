/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// This is the main background script for the study template.
// The build system will bundle dependencies into this script
// and output the bundled scripr to dist/background.js.

// Import the WebExtensions polyfill, for cross-browser compatibility.
// Note that Rally and WebScience currently only support Firefox.
// import { browser } from "webextension-polyfill";

// Import the Rally API.
import {Rally, runStates} from "@mozilla/rally";

// Import the WebScience API.
import * as webScience from "@mozilla/web-science";

// Example: import a module.
import {
    initialize as exampleModuleInitialize,
    uninitialize as exampleModuleUninitialize
} from './exampleModule';

// Developer mode runs locally and does not use the Firebase server.
// Data is collected locally, and an options page is provided to export it.
// eslint-disable-next-line no-undef
const enableDevMode = Boolean(__ENABLE_DEVELOPER_MODE__);
// Emulator mode connects to the Firebase emulators. Note that the Firebase
// config below must match.
// eslint-disable-next-line no-undef
const enableEmulatorMode = Boolean(__ENABLE_EMULATOR_MODE__);

// The Rally-assigned Study ID.
let studyId = "rally-study-template";

// The website hosting the Rally UI.
let rallySite = "https://rally-web-spike.web.app/";

// The current Firebase configuration.
let firebaseConfig = {
    "apiKey": "AIzaSyAJv0aTJMCbG_e6FJZzc6hSzri9qDCmvoo",
    "authDomain": "rally-web-spike.firebaseapp.com",
    "projectId": "rally-web-spike",
    "storageBucket": "rally-web-spike.appspot.com",
    "messagingSenderId": "85993993890",
    "appId": "1:85993993890:web:b975ff99733d2d8b50c9fb",
    "functionsHost": "https://us-central1-rally-web-spike.cloudfunctions.net"
};

// Overrides for dev mode - use local emulators with "exampleStudy1" as study ID.
if (enableEmulatorMode) {
    studyId = "exampleStudy1";
    rallySite = "http://localhost:3000";
    firebaseConfig = {
        "apiKey": "abc123",
        "authDomain": "demo-rally.firebaseapp.com",
        "projectId": "demo-rally",
        "storageBucket": "demo-rally.appspot.com",
        "messagingSenderId": "abc123",
        "appId": "1:123:web:abc123",
        "functionsHost": "http://localhost:5001"
    }
}

// This function will be called when the study state changes. By default,
// a study starts "paused". If a user opts-in to a particular study, then the
// state will change to "started".
//
// The study state may change at any time (for example, the server may choose to pause a particular study).
// Studies should stop data collection and try to unload as much as possible when in "paused" state.
async function stateChangeCallback(newState) {
    switch (newState) {
        case (runStates.RUNNING):
            console.log(`Study running with Rally ID: ${rally.rallyId}`);
            // The Rally API has been initialized.
            // Initialize the study and start it.

            // Example: initialize the example module.
            exampleModuleInitialize();
            await browser.storage.local.set({"state": runStates.RUNNING});


            // Example: set a listener for WebScience page navigation events on
            // http://localhost/* pages. Note that the manifest origin
            // permissions currently only include http://localhost/*. You should
            // update the manifest permissions as needed for your study.

            this.pageDataListener = async (pageData) => {
                console.log(`WebScience page navigation event fired with page data:`, pageData);
                if (enableDevMode) {
                    const data = {};
                    data[pageData.pageId] = pageData;
                    await browser.storage.local.set(data);
                }
            };

            webScience.pageNavigation.onPageData.addListener(this.pageDataListener, {matchPatterns: ["http://localhost/*"]});

            // Register YouTube-related Content Script (decide to place all YouTube related data gathering in 1 content script since background script will send message to re-run functions in the content script when URL changes without page reload)
            this.contentScript = await browser.contentScripts.register({
                js: [{file: "dist/parseYouTubeSearch.content.js"}], // Please save the .js file to src/ folder, and Node will automatically transpile .js scripts to dist/
                // matches: ["*//www.youtube.com/watch*"]
                // matches: ["*://*.youtube.com/*"]
                matches: ["<all_urls>"] // NOTE: if old URL does not match to this case, and there's URL change (without page reload) to the new URL matching this case, extension won't execute content script
            });


            break;
        case (runStates.PAUSED):
            console.log(`Study paused with Rally ID: ${rally.rallyId}`);

            // Take down all resources from run state.
            exampleModuleUninitialize();
            webScience.pageNavigation.onPageData.removeListener(this.pageDataListener);
            this.contentScript.unregister();
            this.parseYouTubeSearchContentScript.unregister();

            await browser.storage.local.set({"state": runStates.PAUSED});

            break;
        case (runStates.ENDED):
            console.log(`Study ended with Rally ID: ${rally.rallyId}`);

            await browser.storage.local.set({"ended": true});

            break;
        default:
            throw new Error(`Unknown study state: ${newState}`);
    }
}

// Initialize the Rally SDK.
const rally = new Rally({enableDevMode, stateChangeCallback, rallySite, studyId, firebaseConfig, enableEmulatorMode});

// When in developer mode, open the options page with the playtest controls.
if (enableDevMode) {
    browser.storage.local.set({"initialized": true}).then(browser.runtime.openOptionsPage());
}

chrome.browserAction.onClicked.addListener(async () =>
    await browser.runtime.openOptionsPage()
);

// Take no further action until the rallyStateChange callback is called.
const browsingHistory = [];
// We need to record one meaningful URL before user's YouTube visit and one meaningful URL after user's YouTube visit
let lastURLs = [];

// Can not use webScience.pageManager.onPageVisitStart.addListener to document URL before and after YouTube since it only document the domain name before YouTube instead of actual page
// Such as it only shows https://www.google.com/ as the referrer when I click on YouTube video (within search result) instead of https://www.google.com/search?q=mc-21+flight+testing&client=firefox-b-1-d&ei=SfuaYZ6EE5nP0PEP0JOIyAU&ved=0ahUKEwjezM2m8ar0AhWZJzQIHdAJAlkQ4dUDCA0&uact=5&oq=mc-21+flight+testing&gs_lcp=Cgdnd3Mtd2l6EAMyBQghEKABOgsIABCxAxCwAxCRAjoJCAAQsAMQBxAeOgsIABCABBCxAxCwAzoOCAAQsQMQgwEQsAMQkQI6CwgAEIAEELEDEIMBOggIABCABBCxAzoRCC4QgAQQsQMQgwEQxwEQowI6DgguEIAEELEDEMcBEKMCOg4ILhCxAxCDARDHARCjAjoICC4QsQMQgwE6CwguEIAEEMcBEKMCOgUIABCABDoNCC4QsQMQxwEQowIQQzoHCAAQsQMQQzoECC4QQzoECAAQQzoLCC4QgAQQsQMQgwE6CwguEIAEEMcBEK8BOgsILhCABBDHARDRAzoGCAAQFhAeSgQIQRgBUIoHWKImYIQnaARwAHgAgAFziAHWDZIBBDIxLjKYAQCgAQHIAQrAAQE&sclient=gws-wiz

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        // Response is a JSON object
        if (request.YTVideoInformation) {
            browsingHistory.push(request);
            console.log(browsingHistory);
            sendResponse({farewell: "goodbye"});
        }
    }
);

// A function that will return true/false depends on whether we should include meaningful URLs,
// example URLs that we should exclude is Google's search result link analysis URL and FaceBook external link URL redirect

// Use case: for a lot of times, when we click on a YouTube link (or external site on YouTube), you're actually visiting
// a tracker URL which will automatically redirect you to actual site. We need to record actual site not tracker URL.
function execludedURLType(urlInput) {
    // Exclude non http:// and https:// page, such as about:blank, mail://, tel://, or moz-extension://
    if (!/^http[s]?:\/\//ig.test(urlInput)) {
        return "Non-http(s) page, ignoring";
    }

    // Filter Google regular link URL, such as https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&ved=2ahUKEwiN3r_M2Kr0AhVbLTQIHUUsCSoQFnoECAcQAQ&url=https%3A%2F%2Fzh.wikipedia.org%2Fzh%2F%25E4%25BC%258A%25E7%2588%25BE%25E5%25BA%25AB%25E7%2589%25B9MC-21&usg=AOvVaw3LDo5mq7NHxNH0KCPKCfcN
    if (urlInput.startsWith("https://www.google.com/url?")) {
        return "Google Search Result URL (from regular result)";
    }

    // Filter Google Ad link URL, such as https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwiQi7Hr2ar0AhWsC60GHe5iCvQYABAAGgJwdg&ae=2&ohost=www.google.com&cid=CAESQOD2_20yWVH0WpavY7iCzNrrK_Fu8PTZjt_xGZ2FzIGhIutyd522g3ejYFIYH8hHGB4EHei3FZ3eIBiHuV6s8hk&sig=AOD64_03-wWDlGtEdJzue19JSU3T987xIw&q&adurl&ved=2ahUKEwjx8qXr2ar0AhU3HTQIHVgUAo0Q0Qx6BAgEEAE&dct=1
    // This URL can both appear in search result and ad in YouTUbe
    if (urlInput.startsWith("https://www.googleadservices.com/pagead")) {
        return "Google Ad External URL (Type One)";
    }

    // Filter another kind of Google Ad Link URL, such as https://pagead2.googlesyndication.com/pcs/activeview?xai=AKAOjsuR5JAvkFVvMuX8wfOyhMwG88PjLgRYVKG8L4B0J1NrMhf3Lbtit5nDnvRErXyPHZFyZK79vtrYxfivJNed_kuOX1KlS1GFkW0w8HSudEi494TOBZnHIg&sai=AMfl-YQaqJSdfqek9yKzy3esFZ0QnsH-gkc8JlRUdLGxheC3st0jJsRxQVJaKL5klI2VBXbVmbyi6TrG-Ich&sig=Cg0ArKJSzHDyov5OtJHGEAE&acvw=[VIEWABILITY]&v=2.20211119.01.00
    // It will return true if URL contains googlesyndication.com
    if (/^https:\/\/.+googlesyndication.com\//ig.test(urlInput)) {
        return "Google Ad External URL (Type Two)";
    }

    // Filter Facebook redirection URL, such as https://l.facebook.com/l.php?u=http%3A%2F%2Feca.state.gov%2Fsusi%3Ffbclid%3DIwAR0LX9bh4qcczcNP6-Qq6QDv-00CJIQenFHSRRJy-QNnXVDQ3YZ_z-0a3Yc&h=AT0ttVHvFDiERah-99DqZtwRMAn9uJ3B1Q-NWFAGchg-EdoLroZCjPJlcb88cczCtvq-xRA8dewbHjbypKRQcl2nZUlNwjXatxBvG0O0T7P426BkwenvdleuImRRsZR1t-7QgjEQK1s
    if (urlInput.startsWith("https://l.facebook.com/")) {
        return "Facebook External URL";
    }

    // Filter Bing's first Ad redirect, such as https://www.bing.com/aclk?ld=e8QXzQGUIf2mnB_o6ea-NvOTVUCUy_fsb0wbrFqREmXev5yTGam5PXunvHOt8deFdqcB3CbmvWuqE7od_Uffr05F1rRq4rcshJ-e40nJNq7pQlVjAQS79L0vydHP6Odh-_f74znC6s9z16w1o9B104xdaGR0jh0KeYpVUhwsMr77dl6HuvanoDhqEVO9OxWD-twnpRWQ&u=aHR0cHMlM2ElMmYlMmZwaXhlbC5ldmVyZXN0dGVjaC5uZXQlMmY0NDIyJTJmY3ElM2Zldl9zaWQlM2QxMCUyNmV2X2xuJTNkYW1hem9uJTI1MjBhd3MlMjZldl9sdHglM2QlMjZldl9seCUzZGt3ZC03MTY3NTAxMTA2NTYzMyUzYWxvYy0xOTAlMjZldl9jcnglM2Q3MTY3NDU2NzQ5OTc0MCUyNmV2X210JTNkZSUyNmV2X2R2YyUzZGMlMjZldl9waHklM2Q3MTMyOCUyNmV2X2xvYyUzZCUyNmV2X2N4JTNkMzg4MjgwNzUyJTI2ZXZfYXglM2QxMTQ2NzkxMzc1MjY5MDMzJTI2ZXZfZXglM2QlMjZldl9lZmlkJTNkNmIxNWY1MGM0MjQzMThhYWVkYTA5NDk2YWI5MjQ3YmQlM2FHJTNhcyUyNnVybCUzZGh0dHBzJTI1M0ElMjUyRiUyNTJGYXdzLmFtYXpvbi5jb20lMjUyRmZyZWUlMjUyRiUyNTNGdHJrJTI1M0Rwc19hMTM0cDAwMDAwNnBrbGZBQUElMjUyNnRya0NhbXBhaWduJTI1M0RhY3FfcGFpZF9zZWFyY2hfYnJhbmQlMjUyNnNjX2NoYW5uZWwlMjUzRHBzJTI1MjZzY19jYW1wYWlnbiUyNTNEYWNxdWlzaXRpb25fVVMlMjUyNnNjX3B1Ymxpc2hlciUyNTNEQmluZyUyNTI2c2NfY2F0ZWdvcnklMjUzRGNvcmUlMjUyNnNjX2NvdW50cnklMjUzRFVTJTI1MjZzY19nZW8lMjUzRE5BTUVSJTI1MjZzY19vdXRjb21lJTI1M0RhY3ElMjUyNnNjX2RldGFpbCUyNTNEYW1hem9uJTI1MjUyMGF3cyUyNTI2c2NfY29udGVudCUyNTNEQW1hem9uJTI1MjUyMEFXU19lJTI1MjZzY19tYXRjaHR5cGUlMjUzRGUlMjUyNnNjX3NlZ21lbnQlMjUzRCUyNTI2c2NfbWVkaXVtJTI1M0RBQ1EtUCUyNTdDUFMtQkklMjU3Q0JyYW5kJTI1N0NEZXNrdG9wJTI1N0NTVSUyNTdDQVdTJTI1N0NDb3JlJTI1N0NVUyUyNTdDRU4lMjU3Q1RleHQlMjUyNnNfa3djaWQlMjUzREFMITQ0MjIhMTAhNzE2NzQ1Njc0OTk3NDAhNzE2NzUwMTEwNjU2MzMlMjUyNnNfa3djaWQlMjUzREFMITQ0MjIhMTAhNzE2NzQ1Njc0OTk3NDAhNzE2NzUwMTEwNjU2MzMlMjUyNmVmX2lkJTI1M0Q2YjE1ZjUwYzQyNDMxOGFhZWRhMDk0OTZhYjkyNDdiZCUyNTNBRyUyNTNBcw&rlid=6b15f50c424318aaeda09496ab9247bd
    if (urlInput.startsWith("https://www.bing.com/aclk?")) {
        return "Bing's Ad redirect (Type One)";
    }

    // Filter Bing's secondary Ad Redirect, such as https://pixel.everesttech.net/4422/cq?ev_sid=10&ev_ln=amazon%20aws&ev_ltx=&ev_lx=kwd-71675011065633:loc-190&ev_crx=71674567499740&ev_mt=e&ev_dvc=c&ev_phy=71328&ev_loc=&ev_cx=388280752&ev_ax=1146791375269033&ev_ex=&ev_efid=6b15f50c424318aaeda09496ab9247bd:G:s&url=https%3A%2F%2Faws.amazon.com%2Ffree%2F%3Ftrk%3Dps_a134p000006pklfAAA%26trkCampaign%3Dacq_paid_search_brand%26sc_channel%3Dps%26sc_campaign%3Dacquisition_US%26sc_publisher%3DBing%26sc_category%3Dcore%26sc_country%3DUS%26sc_geo%3DNAMER%26sc_outcome%3Dacq%26sc_detail%3Damazon%2520aws%26sc_content%3DAmazon%2520AWS_e%26sc_matchtype%3De%26sc_segment%3D%26sc_medium%3DACQ-P%7CPS-BI%7CBrand%7CDesktop%7CSU%7CAWS%7CCore%7CUS%7CEN%7CText%26s_kwcid%3DAL!4422!10!71674567499740!71675011065633%26s_kwcid%3DAL!4422!10!71674567499740!71675011065633%26ef_id%3D6b15f50c424318aaeda09496ab9247bd%3AG%3As
    if (urlInput.startsWith("https://pixel.everesttech.net")) {
        return "Bing's Ad redirect (Type Two)";
    }

    return "Regular URL";
}


// Function that sends message to content script to the tab that has YouTube URL change
function updatePageAction(tabId, newURL) {
    const excludedURLType = execludedURLType(newURL);

    if (excludedURLType === "Regular URL") {
        chrome.tabs.sendMessage(tabId, {is_content_script: true}, function (response) {
            if (response.is_content_script) {
                console.log("Tab received message");
            }
        });
    }
}

// "Guaranteed???" working method: extension will signal content script once its url changes
chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
    // Only record URL and send content script refresh when page URL is changed
    if (changeInfo.url) {
        console.log("URL change detected on tabs");
        updatePageAction(tabId, changeInfo.url);

        // we only can trigger URL update if the tab is activated and in current window
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            // since only one tab should be active and in the current window at once
            // the return variable should only have one entry
            const activeTab = tabs[0];
            // var activeTabId = activeTab.id; // or do whatever you need
            if(activeTab.url !== undefined) {
                recordURLHistory(activeTab.url);
            }
        });
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // since only one tab should be active and in the current window at once
        // the return variable should only have one entry
        const activeTab = tabs[0];
        // var activeTabId = activeTab.id; // or do whatever you need
        if(activeTab.url !== undefined) {
            recordURLHistory(activeTab.url);
        }
    });
});

// Assumes that when user initiates a new tab creation, this tab will be an active tab
//
// chrome.tabs.onCreated.addListener((tab) => {
//     // console.log("Tab created on tabs");
//     // When tab
//     recordURLHistory(tab.url);
// });

function recordURLHistory(currURL) {
    // console.log(tabIdToPreviousUrl);
    lastURLs.push(currURL);
    console.log(lastURLs);

    // If previous URL is YouTube and current URL is YouTube, do nothing and clear temporary record
    if (/^http[s]?:\/\/www.youtube.com/ig.test(lastURLs[0]) && /^http[s]?:\/\/www.youtube.com/ig.test(currURL)) {
        console.log("Triggered condition 1: If previous URL is YouTube and current URL is YouTube, do nothing and clear temporary record");
        lastURLs = [];
    }

    // If neither previous URL nor current URL is YouTube or redirecting URL, clear temporary record
    else if (!/^http[s]?:\/\/www.youtube.com/ig.test(lastURLs[0]) && !/^http[s]?:\/\/www.youtube.com/ig.test(currURL) &&
            execludedURLType(lastURLs[0]) !== "Regular URL" && execludedURLType(currURL) !== "Regular URL") {
        console.log("Triggered condition 2: If neither previous URL nor current URL is YouTube or redirecting URL, clear temporary record");
        lastURLs = [];
    }

    // We've eliminated the regular URL case to regular URL case
    else if (!/^http[s]?:\/\/www.youtube.com/ig.test(lastURLs[0])) {
        // We've arrived to YouTube from a non-YouTube URL, record this YouTube arrival and clear temporary record
        if(/^http[s]?:\/\/www.youtube.com/ig.test(currURL)) {
            console.log("Triggered condition 3: We've arrived to YouTube from a non-YouTube URL, record this YouTube arrival and clear temporary record.");
            const unixTimestamp = Date.now();
            const date = new Date(unixTimestamp);
            browsingHistory.push({
                timestamp: unixTimestamp,
                plain_text_time: date.toString(),
                prevURL: lastURLs[0],
                succeedingYouTubeURL: currURL});
            lastURLs = [];
        }
    }
    // We've eliminated the within YouTube navigation case
    else if (/^http[s]?:\/\/www.youtube.com/ig.test(lastURLs[0])){
        // We left YouTube, record this YouTube departure and clear temporary record
        if(execludedURLType(currURL) === "Regular URL") {
            console.log("Triggered condition 4: We left YouTube, record this YouTube departure and clear temporary record");
            const unixTimestamp = Date.now();
            const date = new Date(unixTimestamp);
            browsingHistory.push({
                timestamp: unixTimestamp,
                plain_text_time: date.toString(),
                prevURL: lastURLs[0],
                succeedingYouTubeURL: currURL});
            lastURLs = [];
        }
    }

    else {
        console.log("Redirection or undefined URL, diagnostic information below:");
        console.log("Current URL: " + currURL);
    }

    console.log(browsingHistory);
}
