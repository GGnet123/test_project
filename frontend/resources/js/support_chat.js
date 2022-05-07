let ws = new WebSocket('ws://127.0.0.1:6001');

$('.chat-box').hide()
$('.typing').hide();

$('.chat-icon__img').click(function () {
    $('.chat-box').show()

    loadMessages();
});

$('.button').click(function(){
    $('.chat-box').hide()
});

function loadMessages() {
    let sessionId = localStorage.getItem('sessionId')
    if (!sessionId) {
        getNewSessionId().then(function (id) {
            sessionId = id;
            return setChat(sessionId);
        })
    }

    return setChat(sessionId);
}

function setChat(sessionId) {
    getChatById(sessionId).then(function (res) {
        if (res.length < 1) {
            getNewSessionId().then(function (id) {
                sessionId = id;
                getChatById(sessionId)
                return;
            });
        }

        res.forEach(function (item) {
            insertMessage(item.is_from_support === 'f', item.message);

            let date = new Date(item.created_at);
            setDate(date, item.is_from_support === 'f', item.is_read === 't')
        })
    })
}

function getChatById(id) {
    return $.ajax({
        url : "http://127.0.0.1:8099/backend/getChatMessages?id=" + id,
        type: "GET",
        success: function(data, textStatus, jqXHR)
        {},
        error: function (data, textStatus, jqXHR) {
            console.log(data, textStatus, jqXHR);
        }
    });
}

function getNewSessionId() {
    return $.ajax({
        url : "http://127.0.0.1:8099/backend/createNewChat",
        type: "POST",
        success: function(data, textStatus, jqXHR)
        {
            localStorage.setItem('sessionId', data);
        }
    });
}

function updateScrollbar() {
    let msgBox = $('.messages');
    msgBox.scrollTop(msgBox[0].scrollHeight);
}

function setDate(d, checks = true, is_read = false) {
    let m = d.getMinutes();
    $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
    if (checks) {
        $('<div class="checkmark-sent-delivered" ' + (is_read ? 'style="color:blue"' : '') + '>&check;</div>').appendTo($('.message:last'));
        $('<div class="checkmark-read">&check;</div>').appendTo($('.message:last'));
    }
}

function insertMessage(personal = true, msg = '') {
    if ($.trim(msg) == '') {
        return false;
    }

    let croppedMessage = cropMessage(msg)

    $('.messages-content').append('<div class="message message' + (personal ? '-personal' : '') +'">' + croppedMessage + '</div>')

    updateScrollbar();
}

$('.message-submit').click(function() {
    let msg = $('.message-input').val();
    insertMessage(true, msg);
    sendMessage(msg);
    $('.message-input').val(null);
    ws.send(JSON.stringify({event: 'message', chatId: localStorage.getItem('sessionId'), message: msg, is_from_support: false}));
});

function sendMessage(msg) {
    return $.ajax({
        url : "http://127.0.0.1:8099/backend/addMessage",
        type: "POST",
        data: {
            "id": localStorage.getItem('sessionId'),
            "message": msg,
            "is_from_support": false
        },
        success: function () {
            setDate(new Date());
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('in error', jqXHR, textStatus, errorThrown);
        }
    })
}

function setAllRead(id) {
    $.ajax({
        url : "http://127.0.0.1:8099/backend/readChat",
        type: "POST",
        data: {
            "id": id,
        },
        success: function () {
            markRead();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('in error', jqXHR, textStatus, errorThrown);
        }
    })
}

function markRead() {
    $('.checkmark-sent-delivered').css('color', 'blue')
}

function cropMessage(message) {
    let croppedMessage = '';
    let charCount = 0;
    for (let i = 0; i < message.length; i++) {
        croppedMessage += message[i];
        charCount++;

        if (charCount >= 23 && message[i+1] !== ' '){
            croppedMessage += '&#10;';
            charCount = 0;
        }
    }

    return croppedMessage;
}

function setTyping() {
    if ($('.typing').is(":hidden")) {
        $('.typing').show();
        setTimeout(function () {
            $('.typing').hide();
        }, 2000)
    }
}

function playRingtone() {
    var x = document.getElementById("ringtone");
    x.play();
    setTimeout(function () {
        x.pause();
        x.currentTime = 0;
    }, 1000)
}

ws.addEventListener('message', (event) => {
    console.log(event.data);
    let data = JSON.parse(event.data);

    if (data.event === "message") {
        if (data.is_from_support === true) {
            playRingtone();

            insertMessage(false, data.message);
        }
    } else if (data.event === "read") {
        setAllRead(data.chatId);
    } else if (data.event === "typing") {
        setTyping();
    }
});