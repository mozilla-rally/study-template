/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import * as webScience from "@mozilla/web-science";

// For analytical purpose, YouTube will embed extra information in its url link, which will make us challenging to find out whether a user opens a same video.
// This helper function will standardize YouTube URLs
// For Videos, we can use
// https://www.youtube.com/watch?t=230&v=MuOe3NM_2Ig&feature=youtu.be -> MuOe3NM_2Ig
const standardizeYouTubeURL = (originalYouTubeURL) => {
    let returnValue = {
        content: "",
        type: ""
    }
    // We encountered a YouTube Video URL
    if(originalYouTubeURL.includes('/watch?')) {
      const videoIdentifierStartIndex = originalYouTubeURL.indexOf("v=");
      let videoIdentifier = "";
      if (originalYouTubeURL.includes("&", videoIdentifierStartIndex)) {
          const videoIdentifierEndIndex = originalYouTubeURL.indexOf("&", videoIdentifierStartIndex);
          videoIdentifier = originalYouTubeURL.slice(videoIdentifierStartIndex, videoIdentifierEndIndex);
      } else {
          videoIdentifier = originalYouTubeURL.slice(videoIdentifierStartIndex);
      }
      returnValue.content = videoIdentifier;
      returnValue.type = "Video";
    }
    return returnValue;
}

// Documentation that describe properties passed in to this parameter
const pageVisitListener = function(details) {
    // Page ID is unique on different page visiting (including refresh)
    // Tab ID is a non-decreasing integer, this Tab ID stays same in the same tab. Open a new tab will increase Tab ID, closing a Tab will not result a decreasing Tab ID on new tab creation
    // Window ID is a non-decreasing integer, this Window ID stays same in the same window (with a group of tabs), closing a Window will not result a decreasing Window ID on new Window creation
    console.log("Page ID: " + details.pageId + ", Tab ID: " + details.tabId + ", windowID: " + details.windowId);
    // console.log("PageVisitListener " + details.url + " from " + details.referrer); // Works as intended
    // console.log("The time is " + details.pageVisitStartTime); // Will return timestamp (in millisecond) relative to UNIX epoch // Works as intended
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



