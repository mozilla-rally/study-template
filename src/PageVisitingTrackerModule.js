/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import * as webScience from "@mozilla/web-science";

const browsingHistory = [];

// Documentation that describe properties passed in to this parameter
const pageVisitListener = function(details) {
    // Page ID is unique on different page visiting (including refresh)
    // Tab ID is a non-decreasing integer, this Tab ID stays same in the same tab. Open a new tab will increase Tab ID, closing a Tab will not result a decreasing Tab ID on new tab creation
    // Window ID is a non-decreasing integer, this Window ID stays same in the same window (with a group of tabs), closing a Window will not result a decreasing Window ID on new Window creation
    // console.log("Page ID: " + details.pageId + ", Tab ID: " + details.tabId + ", windowID: " + details.windowId);
    console.log("PageVisitListener " + details.url + " from " + details.referrer); // Works as intended

    const timeStamp = new Date(details.pageVisitStartTime);

    let oneVisitObject = {
        timestamp: details.pageVisitStartTime,
        plain_text_time: timeStamp,
        site: "YouTube",
        currentURL: details.url,
        referralSite: "YouTube",
        referralURL: details.referrer
    }
    switch(categorizeYouTubeURL(details.url)) {
        //Usage: const returnedTarget = Object.assign(target, source);
        case "Home":
            oneVisitObject = Object.assign(oneVisitObject, {
                type: "Home"
            });
            break;
        case "Search":
            oneVisitObject = Object.assign(oneVisitObject, {
                type: "Home"
            });
            break;
        case "Video":
            oneVisitObject = Object.assign(oneVisitObject, {
                type: "Home"
            });
            break;
        case "Other":
            oneVisitObject = Object.assign(oneVisitObject, {
                type: "Home"
            });
            break;
        default:
            //treat same as homepage
            break;
    }

    browsingHistory.push(oneVisitObject);
    console.log(browsingHistory);
}

const categorizeYouTubeURL = (originalYouTubeURL) => {

    // We encountered a YouTube Video URL
    if(originalYouTubeURL.includes('/watch?')) {
        return "Video";
    }

    // We encountered a YouTube Search URL
    else if(originalYouTubeURL.includes('/results')) {
        return "Search";
    }

    // Check whether there's nothing after https://www.youtube.com
    // We encountered a YouTube Home Page URL
    else if(originalYouTubeURL.slice(originalYouTubeURL.indexOf('https://www.youtube.com')+23).length < 1) {
        return "Home";
    }

    // Other YouTube URLs are left uncategorized
    else {
        return "Other";
    }
}

export function initialize() {
    // Detect when new page is opened
    webScience.pageManager.onPageVisitStart.addListener(pageVisitListener, {privateWindows: false});

    console.log("Page Visiting module initialized.");
}

export function uninitialize() {
    webScience.pageManager.onPageVisitStart.removeListener(pageVisitListener, {privateWindows: false})

    console.log("Page Visiting module uninitialized.");
}

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script at " + sender.tab.url + ", with tabID=" + sender.tab.id :
            "from the extension");
        console.log(JSON.stringify(request));}
);