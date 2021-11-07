/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import "webextension-polyfill";

console.log("Running YouTube Video content script");
// console.log("Running YouTube Video content script");

function getYouTubeTitleAndSendMessage() {
    if(document.URL.includes("www.youtube.com/watch?")) {
        const unixTimestamp = Date.now();
        const date = new Date(unixTimestamp);

        const title = document.querySelectorAll("h1.style-scope.ytd-video-primary-info-renderer")[0].querySelector("yt-formatted-string.style-scope.ytd-video-primary-info-renderer").textContent

        // Alternative approach to get YouTube video title from the page's title
        // const title = document.title.slice(0, (document.title.indexOf(" - YouTube")));
        console.log("YouTube Video URL title is: " + title);

        const videoID = extractYouTubeVideoID(document.URL);
        console.log("YouTube Video ID is: " + videoID);

        // Sending a message from a content script to background script
        chrome.runtime.sendMessage({
            InternalUse: true, // to distinguish my message from other message.
            timestamp: unixTimestamp,
            plain_text_time: date.toString(),
            site: "YouTube",
            type: "Video",
            currentURL: document.URL,
            title: title,
            videoID: videoID
        }, function(response) {
            console.log(response.farewell);
        });
    }
    console.log("Done running YouTube Video content script");
}

// Extract YouTube video ID from a given YouTube Video URL
// For analytical purpose, YouTube will embed extra information in its url link, which will make us challenging to find out whether a user opens a same video.
// https://www.youtube.com/watch?t=230&v=MuOe3NM_2Ig&feature=youtu.be -> MuOe3NM_2Ig
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

// TODO: try chrome.webNavigation.onCompleted.addListener(listener: function)
// https://developer.chrome.com/docs/extensions/reference/webNavigation/#event-onCompleted

(document.body || document.documentElement).addEventListener('transitionend',
    function(/*TransitionEvent*/ event) {
        if (event.propertyName === 'transform' && event.target.id === 'progress') {
            getYouTubeTitleAndSendMessage();
            console.log("new script" + window.location.href)
            //youtubeNavigation();
        }
    }, true);

// window.addEventListener('load', function () {
//     // console.log('load');
//     //async wait (function triggered after couple of seconds)
//     getYouTubeTitleAndSendMessage();
// });
//
// window.addEventListener('yt-page-data-updated', function () {
//     console.log('url change');
//     getYouTubeTitleAndSendMessage();
// });