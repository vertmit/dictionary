// Initilizes where the site's pages are
const websiteDomain = window.location.href.split("/").slice(0, -1).join("/") + "/";
const searchURL = `${websiteDomain}search.html`;
const wordURL = `${websiteDomain}word.html`;