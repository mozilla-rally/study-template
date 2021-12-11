/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import "webextension-polyfill";

let prevURL = undefined; // Check whether the YouTUbe URL actually same, and do not execute content script function again if it's same
// this is used to record loading timeout (2 seconds) before parsing web page
let loadingTimeOut = undefined;
let youTubeCategory = "";
let pageVisitStartTime = -1;
let pageVisitStopTime = -1;

console.log("Running YouTube content script");

// If it's initial visit, record the page visit start time
pageVisitStartTime = Date.now();

// Code to trigger data collection function

// Define DOM mutation observer
// Select the node that will be observed for mutations
const targetNode = document.getElementById('content');

// When YouTube Page URL is changed but still within YouTube website
if (window === top) {
    chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
        if (req.is_content_script) {
            executeYTCollectFn();
            sendResponse({is_content_script: true});
        }
    });
}

function executeYTCollectFn() {

    const URL = document.URL;
    console.log("Trigger executeYTCollectFn() at " + URL);
    // We only execute data collection function on the YouTube website
    if (/^http[s]?:\/\/www.youtube.com/ig.test(URL)) {
        // Only execute content script functions if the current URL differs from previous URL

        console.log("Encountering YouTube URL, continue executing");
        if (prevURL !== URL) {
            prevURL = URL;

            youTubeCategory = "Other";

            // We're at the YouTube video page
            if (URL.includes("/watch?")) {
                console.log("Encountered Video Page at " + URL);
                youTubeCategory = "Video";
            }
            // We're at the YouTube search page
            else if (URL.includes("/results?")) {
                console.log("Encountered Search Page at " + URL);
                youTubeCategory = "Search";
            }
            // We're at the home page (test strict string equality)
            else if (URL === "https://www.youtube.com/" || URL === "http://www.youtube.com/") {
                console.log("Encountered Home Page at " + URL);
                youTubeCategory = "Home";
            } else {
                console.log("Encountered Uncategorized YouTube Page Type at " + URL);
            }

            if(pageVisitStartTime !== -1) {
                // Page visit start time will only refresh if content script is re-executed due to URL change
                pageVisitStartTime = Date.now();
            }
            waitAndCollectBodyContent();
        }
    } else {
        console.log("This is not a YouTube URL, will not apply YouTube content parsing code");
    }
}

// This function that will trigger extractHTMLAndSendMsg() function with 5-second delay
// with assumption that YouTube page is fully loaded within 5 seconds
function waitAndCollectBodyContent() {
    clearTimeout(loadingTimeOut);
    loadingTimeOut = window.setTimeout(extractHTMLAndSendMsg, 5000);
}

/*
 *  YouTube Video Page data extraction functions
 */

function extractHTMLAndSendMsg() {
    clearTimeout(loadingTimeOut);
    const bodyContent = targetNode.innerHTML;
    pageVisitStopTime = Date.now();
    const pageVisitStartPlainTextDate = new Date(pageVisitStartTime);
    const pageVisitstopPlainTextDate = new Date(pageVisitStopTime);
    chrome.runtime.sendMessage({
        YTVideoInformation: true, // to distinguish my message from other message.
        page_visit_start_timestamp: pageVisitStartTime,
        page_visit_start_time_string: pageVisitStartPlainTextDate.toString(),
        page_visit_stop_timestamp: pageVisitStopTime,
        page_visit_stop_time_string: pageVisitstopPlainTextDate.toString(),
        site: "YouTube",
        type: youTubeCategory,
        currentURL: document.URL,
        current_title: document.title,
        body_content: bodyContent
    }, function (response) {
        console.log(response.farewell);
    });
}

// executeYTCollectFn();

// When the YouTube Page is initially opened/loaded (at the first time)

// These are unstable, as they won't always get fired whenever page is loaded

window.addEventListener('load', function () {
    console.log("Window Load Event Listener is triggered in the content script.");
    executeYTCollectFn();
});
//
// document.addEventListener('DOMContentLoaded', function () {
//     console.log("Window Load Event Listener is triggered in the content script.");
//     executeYTCollectFn();
// });
