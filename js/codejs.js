(function () {
    const open = XMLHttpRequest.prototype.open;
    // console.log("run codejs.js");
    XMLHttpRequest.prototype.open = function (method, url) {
        // console.log('Request intercepted:', method, url);
        if (url === '/public/api/sch/w-locdstkbhockytheodoituong' || url === '/api/sch/w-locdstkbhockytheodoituong') {
            this.addEventListener('load', function () {
                try {
                    const jsonResponse = JSON.parse(this.responseText);
                    console.log(jsonResponse);
                    window.postMessage({ type: 'dataCaptured', data: jsonResponse }, '*');
                } catch (error) {
                    console.error('Response is not valid JSON', error);
                }
            });
        }
        open.apply(this, arguments);
    };
})();
