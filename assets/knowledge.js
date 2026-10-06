(function () {
    "use strict";

    var section = document.getElementById("knowledge");
    if (!section) return;

    var tabs = Array.prototype.slice.call(section.querySelectorAll('[role="tab"]'));

    function activateTab(nextTab, moveFocus) {
        tabs.forEach(function (tab) {
            var isActive = tab === nextTab;
            var panel = document.getElementById(tab.getAttribute("aria-controls"));
            tab.setAttribute("aria-selected", String(isActive));
            tab.tabIndex = isActive ? 0 : -1;
            if (panel) panel.hidden = !isActive;
        });

        if (moveFocus) {
            nextTab.focus({ preventScroll: true });
            var tablist = nextTab.parentElement;
            var tabBounds = nextTab.getBoundingClientRect();
            var listBounds = tablist.getBoundingClientRect();
            if (tabBounds.left < listBounds.left) tablist.scrollLeft -= listBounds.left - tabBounds.left;
            if (tabBounds.right > listBounds.right) tablist.scrollLeft += tabBounds.right - listBounds.right;
        }
    }

    tabs.forEach(function (tab, index) {
        tab.addEventListener("click", function () {
            activateTab(tab, false);
        });

        tab.addEventListener("keydown", function (event) {
            var nextIndex;
            if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
            else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
            else if (event.key === "Home") nextIndex = 0;
            else if (event.key === "End") nextIndex = tabs.length - 1;
            else return;

            event.preventDefault();
            activateTab(tabs[nextIndex], true);
        });
    });

    var testButton = section.querySelector(".knowledge-test-button");
    var testPreview = document.getElementById(testButton.getAttribute("aria-controls"));
    testButton.addEventListener("click", function () {
        var isExpanded = testButton.getAttribute("aria-expanded") === "true";
        testButton.setAttribute("aria-expanded", String(!isExpanded));
        testPreview.hidden = isExpanded;
    });
})();
