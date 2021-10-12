/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// Use Mozilla Rally WebScience's existing API that observes users' URL change
const urlChangeEventListener = (data, sender) => {
    if (data.type === 'webScience.pageManager.pageVisitStart') {
        console.log(`Current URL: ${data.url}`);
        return Promise.resolve('done');
    }
    return false;
}

export function initialize() {
    console.log("example module initialized.");
    listenToURLChange();
    // chrome.tabs.onUpdated.addListener(handleURLChange());
}

export function uninitialize() {
    console.log("example module uninitialized.");
}

function listenToURLChange() {
    browser.runtime.onMessage.addListener(urlChangeEventListener);
}