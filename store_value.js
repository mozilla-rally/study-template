// Template format for return value, can be stored as JSON
// Array of objects, where each objects represent each page visit
const Website_Shared_Object = [
    {
        timestamp: "1234567890", // when does the page open, described in UNIX timestamp in milli-seconds
        plain_text_time: "1234567890", // a human-readable date time format converted from UNIX timestamp
        site: "YouTube", // Acceptable values: blank, Google, YouTube, Other
        type: "YouTube Video", // Acceptable values: Home, Search, Video, Other
        // Not recommend to use it to test site equality, as site can add extra texts to URL for analytical purpose,
        // such as https://www.youtube.com/watch?v=Yy_Vwh00KT8&feature=youtu.be and https://www.youtube.com/watch?v=Yy_Vwh00KT8
        currentURL: "https://www.youtube.com/1234567890",
        referralSite: "", // Acceptable values: blank, Google, YouTube, Other
        referralURL: "https://www.google.com/1234567890" // The URL before user visiting this page
    }
];

// Extend the Website_Shared_Object
const one_YouTube_Video_addition = [
    {
        videoID: "18JF03riw+WQE2",
        videoTitle: "Irkut MC-21 300",
    }
];

// Extend the Website_Shared_Object
const one_YouTube_Search_addition = [
    {
        searchQuery: "MC-21 300 Aircraft", // The User's Search Query on YouTube
        searchResult: [{
            videoID: "18JF03riw+WQE2",
            videoTitle: "Irkut MC-21 300",
        },{
            videoID: "18JF03riw+WQE2",
            videoTitle: "Irkut MC-21 300",
        }]
    }
];