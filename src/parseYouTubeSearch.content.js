/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import "webextension-polyfill";

let prevURL = undefined; // Check whether the YouTUbe URL actually same, and do not execute content script function again if it's same
// this is used to record loading timeout (2 seconds) before parsing web page
let youTubeCategory = "";
let isObservingDOM = false;
let bodyContent;
let pageVisitStartTime = -1;
let pageVisitStopTime = -1;

console.log("Running YouTube content script");

pageVisitStartTime = Date.now();

// Code to trigger data collection function

// Define DOM mutation observer
// Select the node that will be observed for mutations
const targetNode = document.getElementById('content');

// Options for the observer (which mutations to observe)
const config = {attributes: true, childList: true, subtree: true};

let lastBodyExtractionTimestamp =+ new Date();
// Callback function to execute when mutations are observed
const callback = function (mutationsList, observer) {
    // Replace bodyContent with the actual body content, with rate limit of one page content extraction per second
    const now = +new Date();
    if (now - lastBodyExtractionTimestamp >= 1000) { // 1 second
        lastBodyExtractionTimestamp = now;
        bodyContent = targetNode;
        console.log("Refreshed bodyContent, it has the type of " + typeof(bodyContent));
    }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

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
    // We only execute data collection function on the YouTube website
    if (/^http[s]?:\/\/www.youtube.com/ig.test(URL)) {
        // Only execute content script functions if the current URL differs from previous URL

        console.log("Encountering YouTube URL, continue executing");
        if (prevURL !== URL) {
            prevURL = URL;

            if(isObservingDOM) {
                stopObserveDOMChange();
            }

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
            startObserveDOMChange();
        }
    } else {
        console.log("This is not a YouTube URL, will not apply YouTube content parsing code");
    }
}

/*
 *  YouTube Video Page data extraction functions
 */

function startObserveDOMChange() {
    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
    // Later, you can stop observing
    observer.disconnect();
}

function stopObserveDOMChange() {
    pageVisitStopTime = Date.now();
    isObservingDOM = false;
    observer.disconnect();
    sendMessage();
}

function sendMessage() {

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

// When the YouTube Page is initially opened/loaded (at the first time)
window.addEventListener('load', function () {
    executeYTCollectFn();
});

// When the user about to navigate away YouTube while still in YouTube website, the web page will load a
// new page with a new URL instead of URL change without page reloading
window.addEventListener('beforeunload', function () {
    stopObserveDOMChange();
});