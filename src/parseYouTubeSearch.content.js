/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import "webextension-polyfill";

console.log("Running YouTube Search content script");
// console.log("Running YouTube Video content script");

function getYouTubeSearchAndSendMessage() {
    if(document.URL.includes("www.youtube.com/result")) {
        const youTubeSearchQuery = extractYouTubeSearchQuery(document.URL);
        console.log("YouTube Search Query is: " + youTubeSearchQuery);

    }
    console.log("Done running YouTube Search content script");
}

// Extract YouTube's search query from YouTube's search query URL, taking account to URL encoding characters
// https://www.youtube.com/results?search_query=MC-21+300 -> MC-21 300
const extractYouTubeSearchQuery = (YouTubeURL) => {
    const searchIdentifierStartIndex = YouTubeURL.indexOf("search_query=") + 13;
    let searchQuery = "";
    if (YouTubeURL.includes("&", searchIdentifierStartIndex)) {
        const videoIdentifierEndIndex = YouTubeURL.indexOf("&", searchIdentifierStartIndex);
        searchQuery = YouTubeURL.slice(searchIdentifierStartIndex, videoIdentifierEndIndex);
    } else {
        searchQuery = YouTubeURL.slice(searchIdentifierStartIndex);
    }

    // By default, the searchQuery content is encoded using Google's URL encoding scheme (https://developers.google.com/custom-search/docs/xml_results_appendices?hl=en#url-escaping)
    // Hence we need to manually decode URL
    return decodeGoogleSearchQuery(searchQuery);
}

// This function will decode Google's search URL query to original search content (https://developers.google.com/custom-search/docs/xml_results_appendices?hl=en#url-escaping)
// First, we need to replace all instances of "+" with " " (a whitespace), and then we can run decodeURIComponent()
const decodeGoogleSearchQuery = (googleYouTubeSearchQuery) => {
    return decodeURIComponent(googleYouTubeSearchQuery.replaceAll("+", " "));
}

getYouTubeSearchAndSendMessage();

// const window_loaded_listener_callback = (event) => {
//     getYouTubeSearchAndSendMessage();
//     window.removeEventListener("load", window_loaded_listener_callback);
// }
//
// // Extract YouTube URL only after the page is done loading (the loading event is fired)
// window.addEventListener("load", window_loaded_listener_callback);

browser.runtime.onMessage.addListener(request => {
    console.log("Message from the background script:");
    console.log(request.greeting);
    return Promise.resolve({response: "Hi from content script"});
});

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         console.log(sender.tab ?
//             "from a content script:" + sender.tab.url :
//             "from the extension");
//         if (request.greeting === "hello")
//             sendResponse({farewell: "goodbye"});
//     }
// );