/**
 * Shorthand for `document.querySelector()`
 * @param query: Class name or ID name string
 * @returns DOM element
 */
const $ = (query) => document.querySelector(query)
const $$ = (query) => document.querySelectorAll(query)

/**
 * Toggles a DOM element's display property
 * @param element: DOM element
 * @param defaultStyle: The element's default display style, (default is "inline-block")
 * @returns null
 */
function HideShowDOM(element, defaultStyle = "inline-block") {
    if (element.style.display != "none") element.style.display = "none"
    else element.style.display = defaultStyle
}

/**
 * Hides all side menu tabs except the selected one
 * @param element: The DOM element to show
 * @returns null
 */
function SwitchSideMenuTab(element) {
    // Loop through all side menu tabs and hide them
    const helpTab = $("#help-tab")
    const lobbyTab = $("#lobby-tab")
    const commandsTab = $("#commands-tab")

    helpTab.classList.add('hidden')
    lobbyTab.classList.add('hidden')
    commandsTab.classList.add('hidden')

    if (element) element.classList.remove('hidden')
}

/**
 * Launches fullscreen mode
 * @returns null
 */
function launchFullscreen() {
    var element = document.documentElement
    if (element.requestFullscreen) { element.requestFullscreen() }
    else if (element.mozRequestFullScreen) { element.mozRequestFullScreen() }
    else if (element.webkitRequestFullscreen) { element.webkitRequestFullscreen() }
    else if (element.msRequestFullscreen) { element.msRequestFullscreen() }
}

/**
 * Exits fullscreen mode
 * @returns null
 */
function quitFullscreen() {
    var element = document.documentElement
    if (element.exitFullscreen) { element.exitFullscreen() }
    else if (element.mozCancelFullScreen) {	element.mozCancelFullScreen() }
    else if (element.webkitCancelFullScreen) { element.webkitCancelFullScreen() }
    else if (element.msExitFullscreen) { element.msExitFullscreen() }
}
