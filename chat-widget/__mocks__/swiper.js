// Mock swiper module for Jest tests
// This module is imported by @microsoft/omnichannel-chat-components but not used in tests

/* eslint-disable @typescript-eslint/no-empty-function */
module.exports = {
    Swiper: class Swiper {
        constructor() {}
        destroy() {}
        update() {}
    },
    Navigation: {},
    Pagination: {},
    Scrollbar: {},
    Autoplay: {},
    EffectFade: {},
    EffectCube: {},
    EffectFlip: {},
    EffectCoverflow: {},
    EffectCards: {},
    EffectCreative: {},
    Thumbs: {},
    Zoom: {},
    Keyboard: {},
    Mousewheel: {},
    Virtual: {},
    HashNavigation: {},
    History: {},
    Controller: {},
    A11y: {},
    Parallax: {},
    Lazy: {},
    FreeMode: {},
    Grid: {},
    Manipulation: {}
};
