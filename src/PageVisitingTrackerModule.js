/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import * as webScience from "@mozilla/web-science";

// This helper function will categorize YouTube URL
// It will categorize YouTube page URL, such as home, search, video, and other
const categorizeYouTubeURL = (originalYouTubeURL) => {
    const returnValue = {
        content: "",
        type: ""
    }
    // We encountered a YouTube Home Page URL
    if(originalYouTubeURL.startsWith('https://www.youtube.com')) {
        returnValue.type = "Home";
    }

    // We encountered a YouTube Video URL
    if(originalYouTubeURL.includes('/watch?')) {
      returnValue.content = extractYouTubeVideoID(originalYouTubeURL);
      returnValue.type = "Video";
      const pageTitle = document.title;
      returnValue.videoTitle = pageTitle.slice(0, (pageTitle.indexOf(" - YouTube") - 1));
    } 
    
    // We encountered a YouTube Search URL
    else if(originalYouTubeURL.includes('search_query=')) {
        returnValue.content = extractYouTubeSearchQuery(originalYouTubeURL);
        returnValue.type = "Search";
    }

    // Other YouTube URLs are left uncategorized
    else {
        returnValue.type = "Other";
    }

    return returnValue;
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
const decodeGoogleSearchQuery = (googleSearchURL) => {
    return decodeURIComponent(googleSearchURL.replaceAll("+", " "));
}

// Documentation that describe properties passed in to this parameter
const pageVisitListener = function(details) {
    // Page ID is unique on different page visiting (including refresh)
    // Tab ID is a non-decreasing integer, this Tab ID stays same in the same tab. Open a new tab will increase Tab ID, closing a Tab will not result a decreasing Tab ID on new tab creation
    // Window ID is a non-decreasing integer, this Window ID stays same in the same window (with a group of tabs), closing a Window will not result a decreasing Window ID on new Window creation
    // console.log("Page ID: " + details.pageId + ", Tab ID: " + details.tabId + ", windowID: " + details.windowId);
    console.log("PageVisitListener " + details.url + " from " + details.referrer); // Works as intended
    // console.log("The time is " + details.pageVisitStartTime); // Will return timestamp (in millisecond) relative to UNIX epoch // Works as intended

    console.log("Standardized YouTube URL is: " + categorizeYouTubeURL(details.url).content + " and " + categorizeYouTubeURL(details.url).type);
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



