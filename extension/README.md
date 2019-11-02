# Notes for Reviewer

## Overview

This extension is part of a research project at the University of Chicago and University of Maryland. Users will only install this extension after completing a consent process that explains all data collected.

Our extension provides users with information about online tracking and advertising, with a focus on explaining what companies may have inferred based off of their browsing data. 

The extension keeps a *local* database with the pages the user visits, along with the web trackers on the pages they visit, and an inference we make about the page's topic using a client-side algorithm bundled as part of the extension. This detailed data will not leave the users' computer and will not be shared with the researchers. The extension will send non-identifiable metadata and survey responses to the researchers. At the end of the study, we will provide detailed instructions for uninstalling this browser extension.

A full privacy policy is available at https://super.cs.uchicago.edu/trackingtransparency/privacy.html

Additionally, the consent form that users will accept before being directed to the installation link is available at https://super.cs.uchicago.edu/trackingtransparency/ConsentForm.pdf

## Architecture

Our extension has many dependencies, and we use the Webpack build system to manage dependencies and compile the code. A copy of the full source code is provided in the `source/source.zip` file.

We use the [webextension polyfill](https://github.com/mozilla/webextension-polyfill) library to wrap extension API calls.

Below we explain some of the larger JavaScript files, unless otherwise noted all files are in the `dist/` subdirectory.

`background.js` has listeners that are called on page loads and page change, and feeds the data to three web workers:
    - `trackers.worker.js` detects web trackers and stores to the database
    - `inferencing.worker.js` determines the page's topic and stores to the database
    - `database.worker.js` manages the database using Google's [Lovefield](https://github.com/google/lovefield) library

`content.js` extracts the page content to send to the inferencing worker, and also injects a small overlay with information onto the current page

`dashboard.js` and the contents of the `dist/dashboard` directory include a complex React web app. The only interaction that this has with the rest of the plugin is through functions that are called from the background page using `browser.runtime.getBackgroundPage`.

The `data/` subdirectory includes a number of data files.

`lightbeam.js` provides another web page to interact with the data our extension collects.

`popup.js` provides a popup, which is opened from the toolbar. It is also a React web app.

`welcome.js` provides a welcome page, which is opened when the extension is first launched. It is also a React web app.

The files beginning with `vendors` are code for our third party dependencies. We provide a listing of our dependencies in `source/package.json`. The filenames for the vendor files indicate which scripts they are loaded by.
