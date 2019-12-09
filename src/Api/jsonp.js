export default function CallJsonP(callback1, searchedString) {
    const autoComplete = `http://suggestqueries.google.com/complete/search?client=firefox&q=${searchedString}`
    jsonp(
        autoComplete,
        (response) => callback1(response)
    );
}

const jsonp = (url, callback2) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = function (data) {
        delete window[callbackName];
        document.body.removeChild(script);
        callback2(data);
    };

    var script = document.createElement('script');
    script.src =
        url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    document.body.appendChild(script);
};
