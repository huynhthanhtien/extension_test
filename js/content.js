function injectScript(file) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(file); // Load file script từ extension
    console.log("Injecting script:", file);
    
    script.onload = function () {
        console.log('Script loaded successfully:', file);
        this.remove(); // Xóa script sau khi load
    };

    script.onerror = function() {
        console.error('Script failed to load:', file);
    };
    
    document.documentElement.appendChild(script); // Chèn script vào DOM
}
// Inject file `injected.js`
injectScript('js/codejs.js');

// Lắng nghe dữ liệu từ `window.postMessage`
window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data.type === 'dataCaptured') {
        console.log('Data captured:', event.data.data);
        const data = event.data.data;
        chrome.runtime.sendMessage({ action: 'dataCaptured', data: data } , function(response) {
            console.log(response);
            if (response.success) {
                console.log(response.message);
            } else {
                console.error(response.message);
            }
        });
    }
});
