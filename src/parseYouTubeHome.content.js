/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import "webextension-polyfill";
let YouTubeSearchResultElem = undefined;
let loadingTimeOut = undefined; // this is used to record loading timeout (2 seconds) before force fetching results, which is used in gatherYouTubeSearchResultElem() function

console.log("Running YouTube Home content script");

function getYouTubeHomeAndSendMessage() {
    const originalYouTubeURL = document.URL;
    if(originalYouTubeURL.slice(originalYouTubeURL.indexOf('https://www.youtube.com')+23).length < 1) {
        triggerLoadListener();
    }
    console.log("Done running YouTube Home content script");
}


// Extract YouTube Home Result after 2 seconds timeout (need a better solution to detect YouTubeSearchResultElem stopped loading)
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

    //console.log("in homepage object")

    var homepage = {}
    //console.log("4444");
    // Call the specified callback, passing
    // the web-page's DOM content as argument
    //console.log("7777777777");
    //console.log(document.all[0].outerHTML);
    /*var sections = document.querySelector("ytd-rich-section-renderer.style-scope.ytd-rich-grid-renderer")
    //console.log("sections")
    //console.log(sections)
    //title = document.querySelector("#title-text > span").textContent
    //console.log("title")
    //console.log(title)*/

    var sections = document.querySelectorAll("ytd-rich-section-renderer.style-scope.ytd-rich-grid-renderer")
    //console.log("len of sections: " + sections.length)
    for (let i = 0; i < sections.length; i++) {
        //console.log(i)
        var title1 = sections[i].querySelector("#title").textContent
        //console.log(title1)
        var videos_in_pannel = sections[i].querySelectorAll("#video-title-link")
        if (videos_in_pannel.length == 0)
            continue
        // videos_in_pannel = sections[i].querySelectorAll("a.yt-simple-endpoint.style-scope.ytd-rich-grid-movie")
        //console.log("len of videos: " + videos_in_pannel.length)
        // console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjjjj")
        var pannel_dict = {}
        if (videos_in_pannel.length != 0)
            for (let j = 0; j < videos_in_pannel.length; j++) {
                let tmp = {};
                tmp['title'] = videos_in_pannel[j].getAttribute("title")
                tmp['url'] = videos_in_pannel[j].getAttribute("href")
                pannel_dict[j] = tmp
            }
        //console.log(pannel_dict)
        homepage[title1] = pannel_dict


    }
    //console.log(homepage)
    // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
    var videos= document.querySelectorAll("ytd-rich-item-renderer.style-scope.ytd-rich-grid-renderer")
    //console.log("len of videos: " + videos.length)
    var videos_dict = {};
    for (let i = 0; i < videos.length; i++) {
        if(!videos[i].querySelector("#video-title-link"))
            continue
        // console.log(videos[i].querySelector("#video-title-link"))
        let title_v = videos[i].querySelector("#video-title-link").getAttribute("title")
        // console.log(title_v)
        let url_v = videos[i].querySelector("#video-title-link").getAttribute("href")
        // console.log(url_v)
        let tmp = {};
        tmp['title'] = title_v
        tmp['url'] = url_v
        videos_dict[i] = tmp
    }


    //console.log(videos_dict)
    homepage["videos"] = videos_dict
    console.log("Homepage object")
    console.log(homepage)
}

window.addEventListener('load', function () {
    // console.log('load');
    //async wait (function triggered after couple of seconds)
    getYouTubeHomeAndSendMessage();
});

window.addEventListener('yt-page-data-updated', function () {
    // console.log('url change');
    getYouTubeHomeAndSendMessage();
});
