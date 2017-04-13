import $ from "jquery";

class LoadingBox {
    constructor() {
        let baseRoot = 'body';

        let tmplMsgBox = '<div>' +
                            '<div class="popup-layer"></div>' +
                            '<div class="popup-wrap v-align">' +
                                '<div class="sk-fading-circle">' +
                                    '<div class="sk-circle1 sk-circle"></div>' +
                                    '<div class="sk-circle2 sk-circle"></div>' +
                                    '<div class="sk-circle3 sk-circle"></div>' +
                                    '<div class="sk-circle4 sk-circle"></div>' +
                                    '<div class="sk-circle5 sk-circle"></div>' +
                                    '<div class="sk-circle6 sk-circle"></div>' +
                                    '<div class="sk-circle7 sk-circle"></div>' +
                                    '<div class="sk-circle8 sk-circle"></div>' +
                                    '<div class="sk-circle9 sk-circle"></div>' +
                                    '<div class="sk-circle10 sk-circle"></div>' +
                                    '<div class="sk-circle11 sk-circle"></div>' +
                                    '<div class="sk-circle12 sk-circle"></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>';

        this._$container = $(baseRoot);
        this._$popupLayer = $(tmplMsgBox).find('.popup-layer');
        this._$popupWrap = $(tmplMsgBox).find('.popup-wrap');
        this._isShow = false;
    }

    show() {
        if ( !this._isShow ) {
            this._isShow = true;
            this._$container.append(this._$popupLayer);
            this._$container.append(this._$popupWrap);
        }
    }

    isLoading() {
        return this._isShow;
    }

    close() {
        this._isShow = false;
        this._$popupLayer.remove();
        this._$popupWrap.remove();
    }
}

export default LoadingBox;