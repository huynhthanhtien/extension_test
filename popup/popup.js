








document.getElementById('logoutButton').addEventListener('click', function () {
    chrome.runtime.sendMessage({ type: 'logout' }, function (response) {
        console.log(response);
        if (response.success) {
            console.log(response.message);
            document.getElementById("status").innerHTML = response.message;
        } else {
            console.error(response.message);
            document.getElementById("status").innerHTML = response.message;
        }
    });
});


document.getElementById('loginButton').addEventListener('click', () => {
    // Gửi yêu cầu đến Flask backend để lấy URL đăng nhập
    fetch('https://flask-api-lr7k.onrender.com/login')
        .then(response => response.json())
        .then(data => {
            // Mở URL đăng nhập trong tab mới
            chrome.tabs.create({ url: data.url });
        })
        .catch(error => console.error('Error:', error));

});


// Lắng nghe sự kiện click vào nút "Lấy dữ liệu"

// Lấy mã xác thực từ URL và gửi tới backend để lấy access token
