/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import * as webScience from "@mozilla/web-science";

const browsingHistory = [];

export function initialize() {
    // Detect when new page is opened
    webScience.pageManager.onPageVisitStart.addListener(pageVisitListener, {privateWindows: false});

    console.log("Page Visiting module initialized.");
}

export function uninitialize() {
    webScience.pageManager.onPageVisitStart.removeListener(pageVisitListener, {privateWindows: false})

    console.log("Page Visiting module uninitialized.");
}



