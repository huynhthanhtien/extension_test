








function showNotification(message) {
    // Đường dẫn chính xác tới ảnh biểu tượng
    const iconUrl = chrome.runtime.getURL('icon/icon16.png');

    chrome.notifications.create({
        type: 'basic',
        iconUrl: iconUrl, // Đường dẫn tới ảnh biểu tượng
        title: 'Thông báo', // Tiêu đề của thông báo
        message: message    // Nội dung thông báo
    }, function(notificationId) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
        } else {
            console.log("Notification shown with ID:", notificationId);
        }
    });
}


function sendDataToPopup(data) {
    chrome.runtime.sendMessage({ type: 'sendData', data: data }, function (response) {
        if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError.message);
        } else {
            console.log('Response from popup:', response);
        }
    });
}

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
    if (message.action === 'addEvent') {
        try {
            var event = {
                'summary': 'Học bài',
                'location': 'Phòng 101',
                'description': 'Lịch học bài cho môn lập trình',
                'start': {
                    'dateTime': '2024-12-18T09:00:00+07:00',  // Giờ bắt đầu, sử dụng múi giờ UTC+7 cho Việt Nam
                    'timeZone': 'Asia/Ho_Chi_Minh',           // Múi giờ của sự kiện
                },
                'end': {
                    'dateTime': '2024-12-18T10:00:00+07:00',  // Giờ kết thúc, sử dụng múi giờ UTC+7 cho Việt Nam
                    'timeZone': 'Asia/Ho_Chi_Minh',           // Múi giờ của sự kiện
                },
            };
            const token = await getAuthToken();
            await addEventToGoogleCalendar(token, event);
            sendResponse({ success: true, message: 'Đang thêm sự kiện' });

        } catch (error) {
            console.error('Lỗi:', error);
            sendResponse({ success: false, message: error.message });
        }
        return true;
    }
});

// Hàm lấy token với async/await
async function getAuthToken() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['authToken'], function (result) {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
            } else {
                console.log('Token lấy được:', result.authToken);
                resolve(result.authToken);
            }
        });
    });
}
// Hàm thêm sự kiện vào Google Calendar
async function addEventToGoogleCalendar(token, event) {

    try {
        // Gửi yêu cầu POST đến API Google Calendar
        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });

        // Kiểm tra nếu response trả về lỗi
        if (!response.ok) {
            throw new Error(`Lỗi khi thêm sự kiện: ${response.statusText}`);
        }

        // Chuyển đổi kết quả thành JSON
        const data = await response.json();
        console.log('Sự kiện đã được thêm vào lịch!', data);

    } catch (error) {
        console.error('Lỗi khi thêm sự kiện:', error);
        throw error;  // Ném lỗi lên để catch trong hàm gọi
    }
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === 'logout') {
        // Xóa token khỏi chrome.storage.local
        chrome.storage.local.remove('authToken', function () {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, message: 'Failed to logout' });
            } else {
                sendResponse({ success: true, message: 'Logout successful' });
            }
        });
        return true;
    }
});

// tọa lịch mới sgu
async function createNewCalendar(token, calendarName) {
    const calendar = {
        summary: calendarName, // Tên của lịch mới
        timeZone: 'Asia/Ho_Chi_Minh', // Múi giờ của lịch
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendar),
    });

    if (!response.ok) {
        throw new Error('Error creating new calendar');
    }

    const data = await response.json();
    console.log('Created calendar:', data);
    return data.id;
}


async function addEventToGoogleCalendar_TKBSGU(token, calendarId, event) {

    try {
        // Gửi yêu cầu POST đến API Google Calendar
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });

        // Kiểm tra nếu response trả về lỗi
        if (!response.ok) {
            throw new Error(`Lỗi khi thêm sự kiện: ${response.statusText}`);
        }

        // Chuyển đổi kết quả thành JSON
        const data = await response.json();
        console.log('Sự kiện đã được thêm vào lịch!', data);

    } catch (error) {
        console.error('Lỗi khi thêm sự kiện:', error);
        throw error;  // Ném lỗi lên để catch trong hàm gọi
    }
}

// auto run;
chrome.runtime.onMessage.addListener(async(message, sender, sendResponse) => {
    console.log('Received message:', message);
    if (message.action === 'dataCaptured') {
        if (message.data) {
            console.log('Data received from content script:', message.data);
            const token = await getAuthToken();
            if (token === undefined) { 
                showNotification('Vui lòng đăng nhập trước khi lấy dữ liệu');
            } else {
                showNotification('Đã lấy dữ liệu');
            };
            xulydata(message.data);
            chrome.storage.local.remove('authToken', function () {
                if (chrome.runtime.lastError) {
                    sendResponse({ success: false, message: 'Failed to logout' });
                } else {
                    sendResponse({ success: true, message: 'Logout successful' });
                }
            });
            // const data1 = { message: 'addGGBlock' };
            // sendDataToPopup(data1);
            // message.data.data.ds_nhom_to.forEach(events);
            sendResponse({ success: true, message: 'Dữ liệu đã nhận' });
        } else {
            console.log('No data received.');
            sendResponse({ success: false, message: 'Không có dữ liệu' });
        }

        return true;
    }
});

function getRandomInt(min, max) {
    min = Math.ceil(min);  // Làm tròn lên để bắt đầu từ số nguyên lớn nhất không nhỏ hơn min
    max = Math.floor(max); // Làm tròn xuống để đảm bảo max là số nguyên nhỏ nhất không lớn hơn max
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function events(json, id, token) {
    
    // console.log(json);
    const arr_start_time = [
        "00:00",
        "07:00", "07:50", "09:00", "09:50", "10:40",  // Ca 1
        "13:00", "13:50", "15:00", "15:50", "16:40",  // Ca 2
        "17:40", "18:30", "19:20"  // Ca 3
    ];
    const arr_end_time = [
        "00:00",
        "07:50", "08:40", "09:50", "10:40", "11:30",  // Ca 1
        "13:50", "14:40", "15:50", "16:40", "17:30",  // Ca 2
        "18:30", "19:20", "20:10"  // Ca 3
    ];
    // console.log(json);
    const ma_mon = json.ma_mon;
    const title = json.ten_mon;
    const location = json.phong;
    // const timeStart = json.tu_gio;
    // const timeEnd = json.den_gio;
    const tbd = parseInt(json.tbd);
    const tkt = parseInt(json.tbd) + parseInt(json.so_tiet) - 1;
    // const sotiet = json.so_tiet;
    const nhom_to = json.nhom_to;
    const date = json.tkb;
    const gv = json.gv;

    const regex = /(\d{2})\/(\d{2})\/(\d{2})/g;
    const arrr = date.match(regex);
    // console.log(date);
    // console.log(arrr);
    const startDate = new Date(arrr[0].replace(/(\d{2})\/(\d{2})\/(\d{2})/, '20$3-$2-$1'));
    const endDate = new Date(arrr[1].replace(/(\d{2})\/(\d{2})\/(\d{2})/, '20$3-$2-$1'));


    let newdate = startDate;

    const tkbStart = new Date(newdate);
    tkbStart.setHours(arr_start_time[tbd].split(':')[0], arr_start_time[tbd].split(':')[1]);

    const tkbEnd = new Date(newdate);
    tkbEnd.setHours(arr_end_time[tkt].split(':')[0], arr_end_time[tkt].split(':')[1]);

    endDate.setHours(23, 59);
    // console.log(tkbStart + "tkbStart");
    const event = {
        'summary': title,
        'location': location,
        'description': `Mã môn học: ${ma_mon}\nNhóm tổ: ${nhom_to}\nGiáo viên: ${gv}`,
        'start': {
            'dateTime': tkbStart.toISOString(),
            'timeZone': 'UTC',
        },
        'end': {
            'dateTime': tkbEnd.toISOString(),
            'timeZone': 'UTC',
        },
        'reminders': {
            'useDefault': false,
            'overrides': [
                { 'method': 'popup', 'minutes': 30 },
            ]
        },
        'colorId': getRandomInt(1, 11),
        'visibility': 'private',
        'recurrence': [
            `RRULE:FREQ=WEEKLY;UNTIL=${endDate.toISOString().replace(/[-:]|(.000)/g, '')}` // Lặp lại hàng tuần cho đến ngày 01/01/2025
        ],
    };
    // console.log(JSON.stringify(event));
    try {
        // const token = await getAuthToken();
        await addEventToGoogleCalendar_TKBSGU(token, id, event);

        // sendResponse({ success: true, message: 'Đang thêm sự kiện' });
    } catch (error) {
        console.error('Lỗi:', error);
        // sendResponse({ success: false, message: error.message });
    }
    return true;
}
async function xulydata(jsonResponse) {
    try {

        const token = await getAuthToken();
        const id = await createNewCalendar(token, 'TKBSGU');
        console.log(id);
        showNotification('đang thêm sự kiện');
        // Sử dụng for...of thay vì forEach để hỗ trợ async/await
        for (const item of jsonResponse.data.ds_nhom_to) {
            await events(item, id, token); // Đảm bảo đợi sự kiện được thêm vào trước khi tiếp tục
        }
        showNotification('Đã thêm sự kiện xong!');
    } catch (error) {
        console.error('Lỗi:', error);
        showNotification("Lỗi khi thêm sự kiện");
    }
};

// 

chrome.webNavigation.onCompleted.addListener(function (details) {
    const url = new URL(details.url);
    if (url.pathname === '/callback') {
        console.log(url);
        fetch(details.url)
            .then(response => response.json())
            .then(data => {
                // Gửi thông tin token về popup.js
                //   chrome.runtime.sendMessage({ type: 'token', token: data.token });
                console.log(data);
                fetchToken(data);
            })
            .catch(error => console.log('Error:', error));
    }
}, { url: [{ urlMatches: 'https://flask-api-lr7k.onrender.com/callback' }] });

function fetchToken(codeurl) {
    const url = 'https://flask-api-lr7k.onrender.com/get_token';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: codeurl })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Token:', data.access_token);
            console.log('User Info:', data.user_info);

            // Lưu token vào chrome.storage.local
            chrome.storage.local.set({ 'authToken': data.access_token }, function () {
                console.log('Token đã được lưu vào chrome.storage.');
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}