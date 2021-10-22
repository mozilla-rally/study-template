/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import "webextension-polyfill";

console.log("Running YouTube Video content script");
// console.log("Running YouTube Video content script");

function getYouTubeTitleAndSendMessage() {
    if(document.URL.includes("www.youtube.com/watch?")) {
        const title = document.querySelectorAll("h1.style-scope.ytd-video-primary-info-renderer")[0].querySelector("yt-formatted-string.style-scope.ytd-video-primary-info-renderer").textContent
        //const title = "abcdefgh";
        // Alternative approach to get YouTube video title from the page's title
        // const title = document.title.slice(0, (document.title.indexOf(" - YouTube")));
        console.log("YouTube Video URL title is: " + title);

        const videoID = extractYouTubeVideoID(document.URL);
        console.log("YouTube Video ID title is: " + videoID);

        // Sending a request from a content script (NOT WORKING)

        chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
            console.log(response.farewell);
        });
        // chrome.runtime.sendMessage({title: title, videoID: videoID}, function(response) {
        //     console.log(response.farewell);
        // });
    }
    console.log("Done running YouTube Video content script");
}

const extractYouTubeVideoID = (YouTubeURL) => {
    const videoIdentifierStartIndex = YouTubeURL.indexOf("v=") + 2;
    let videoIdentifier = "";
    if (YouTubeURL.includes("&", videoIdentifierStartIndex)) {
        const videoIdentifierEndIndex = YouTubeURL.indexOf("&", videoIdentifierStartIndex);
        videoIdentifier = YouTubeURL.slice(videoIdentifierStartIndex, videoIdentifierEndIndex);
    } else {
        videoIdentifier = YouTubeURL.slice(videoIdentifierStartIndex);
    }
    return videoIdentifier;
}

window.addEventListener('load', function () {
    // console.log('load');
    //async wait (function triggered after couple of seconds)
    getYouTubeTitleAndSendMessage();
});

window.addEventListener('yt-page-data-updated', function () {
    // console.log('url change');
    getYouTubeTitleAndSendMessage();
});



// const window_loaded_listener_callback = (event) => {
//     getYouTubeTitleAndSendMessage();
//     window.removeEventListener("load", window_loaded_listener_callback);
// }
//
// // Extract YouTube URL only after the page is done loading (the loading event is fired)
// window.addEventListener("load", window_loaded_listener_callback);
//
// browser.runtime.onMessage.addListener(request => {
//     console.log("Message from the background script:");
//     console.log(request.greeting);
//     return Promise.resolve({response: "Hi from content script"});
// });

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         console.log(sender.tab ?
//             "from a content script:" + sender.tab.url :
//             "from the extension");
//         if (request.greeting === "hello")
//             sendResponse({farewell: "goodbye"});
//     }
// );