/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import "webextension-polyfill";
let YouTubeSearchResultElem = undefined;
let loadingTimeOut = undefined; // this is used to record loading timeout (2 seconds) before force fetching results, which is used in gatherYouTubeSearchResultElem() function

console.log("Running YouTube Search content script");
// console.log("Running YouTube Video content script");

function getYouTubeSearchAndSendMessage() {
    if(document.URL.includes("www.youtube.com/result")) {
        const youTubeSearchQuery = extractYouTubeSearchQuery(document.URL);
        console.log("YouTube Search Query is: " + youTubeSearchQuery);
        triggerLoadListener();
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

// YouTube Search Page will only return top 4 results if the page is not fully loaded
// Extract YouTube Search Result after 2 seconds timeout (need a better solution to detect YouTubeSearchResultElem stopped loading)
const triggerLoadListener = function (){
    // Extract the search result container itself
    // YouTubeSearchResultElem = document.querySelector("#contents.style-scope.ytd-item-section-renderer");
    // YouTubeSearchResultElem.addEventListener("onload", parseSearchResults);
    loadingTimeOut = setTimeout(parseSearchResults, 2000);
}


function parseSearchResults(event)
{
    // YouTubeSearchResultElem.removeEventListener('onload', parseSearchResults);
    clearTimeout(loadingTimeOut);

    var videos = document.querySelectorAll("a#video-title")
    console.log(videos)
    console.log("number of videos: " + videos.length)
    var search_results = {};
    for (var j = 0; j < videos.length; j++) {
        var tmp = {};
        //console.log(videos[j])
        //console.log("bb "+ videos[j].getAttribute("title"))
        tmp['title'] = videos[j].getAttribute("title")
        tmp['url'] = videos[j].getAttribute("href")
        search_results[j] = tmp
    }
    console.log(search_results);
}

window.addEventListener('load', function () {
    // console.log('load');
    //async wait (function triggered after couple of seconds)
    getYouTubeSearchAndSendMessage();
});

window.addEventListener('yt-page-data-updated', function () {
    // console.log('url change');
    getYouTubeSearchAndSendMessage();
});
