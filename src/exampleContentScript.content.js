/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import "webextension-polyfill";

console.log("Running YouTube Video content script");

// Extract YouTube URL only after the page is done loading (the loading event is fired)
document.addEventListener("load", ev => {
    const title = document.querySelectorAll("h1.style-scope.ytd-video-primary-info-renderer")[0].querySelector("yt-formatted-string.style-scope.ytd-video-primary-info-renderer").textContent
    // Alternative approach to get YouTube video title from the page's title
    // const title = document.title.slice(0, (document.title.indexOf(" - YouTube")));
    console.log("YouTube Video URL title is: " + title);
    // Sending a request from a content script looks like this:
    browser.runtime.sendMessage({title: title}, tabId => {
        console.log("Done sending message from " + tabId);
    });
})