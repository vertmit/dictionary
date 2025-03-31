// Initilizes where the site's pages are
const websiteDomain = window.location.href.split("/").slice(0, -1).join("/") + "/"
const searchURL = `${websiteDomain}search`
const wordURL = `${websiteDomain}word`