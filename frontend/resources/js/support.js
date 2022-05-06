let ws = new WebSocket('ws://127.0.0.1:6001');

ws.addEventListener('message', (event) => {
    console.log(event.data);
    let data = JSON.parse(event.data);

    let chatId = $('.messages__detail').attr('data-id');

    if (data.event === "message" && data.is_from_support === false) {
        $('.chats__item[data-id="' + data.chatId + '"]').find('.new_message').show();
        if (chatId == data.chatId) {
            insertMessage(true, data.message);
        }
        playRingtone();
    }
});

let options = { year: 'numeric', month: 'numeric', day: 'numeric' };

$(document).ready(function () {
    getActiveChats().then(function (data) {
        data.forEach(function (item) {
            let dateString = getDateString(item.created_at)
            $('.chats').append('<div class="chats__item" data-id="' + item.id + '">' +
                '<p class="chats__item_title">Чат #' + item.id + '<span class="new_message" style="display:none; font-weight: bold"> ! </span>' + '</p>' +
                '<p class="chats__item_subtitle">' + dateString + '</p>' +
                '</div>')
        });
        $('.chats__item').click(function () {
            getChatMessages(this.getAttribute('data-id'));
        });
    });
})

function sendMessage(id, msg) {
    return $.ajax({
        url : "http://127.0.0.1:8099/backend/addMessage",
        type: "POST",
        data: {
            "id": id,
            "message": msg,
            "is_from_support": true
        },
        success: function () {
            $('.messages__placeholder_input').val(null);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('in error', jqXHR, textStatus, errorThrown);
        }
    })
}

function getActiveChats() {
    return $.ajax({
        url : "http://127.0.0.1:8099/backend/getChats",
        type: "GET",
        success: function (data) {
            console.log('fetched chats');
        }
    })
}

function getChatMessages(id) {
    $.ajax({
        url : "http://127.0.0.1:8099/backend/getChatMessages?id=" + id,
        type: "GET",
        success: function (data) {
            $('.messages').empty();

            let msg_html = '<div class="messages__detail" data-id=' + id + '>' +
                '<p><b class="messages__detail_name">Чат #' + id + '</b></p>' +
                '<p class="messages_detail_author"></p>' +
                '</div>' +
                '<div class="messages__chat">';

            data.forEach(function (item) {
                let croppedMessage = cropMessage(item.message);
                msg_html += '<div class="messages__chat_' + (item.is_from_support === 't' ? 'left"' : 'right"') + '>' +
                '<div class="text">' + croppedMessage + '</div>' +
                '</div>'
            });

            msg_html += '</div> <div class="messages__placeholder">' +
                '<textarea class="messages__placeholder_input" placeholder="Введите текст.."></textarea>' +
                '<button class="messages__placeholder_btn">Отправить</button>' +
                '</div>';

            $('.messages').append(msg_html);

            updateScrollbar();

            ws.send(JSON.stringify({event: 'read', chatId: id, is_read: true}));

            $('.messages__placeholder_btn').click(function () {
                let msg = $('.messages__placeholder_input').val()
                sendMessage(id, msg)
                insertMessage(true, msg)
                ws.send(JSON.stringify({event: 'message', chatId: id, message: msg, is_from_support: true}));
            });

            $('.chats__item[data-id="' + id + '"]').find('.new_message').hide();

            $(".messages__placeholder_input").on("keydown", function() {
                ws.send(JSON.stringify({event: 'typing', chatId: id, is_from_support: true}));
            });
        }
    });
}

function playRingtone() {
    var x = document.getElementById("ringtone");
    x.play();
    setTimeout(function () {
        x.pause();
        x.currentTime = 0;
    }, 1000)
}

function getDateString(d) {
    let date = new Date(d);
    return date.toLocaleDateString('en-US', options);
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

function insertMessage(personal = false, msg = '') {
    if ($.trim(msg) == '') {
        return false;
    }

    let croppedMessage = cropMessage(msg)

    $('.messages__chat').append('<div class="messages__chat_' + (personal ? 'left"' : 'right"') + '>' +
        '<div class="text">' + croppedMessage + '</div>' +
        '</div>')

    updateScrollbar();
}

function updateScrollbar() {
    let msgBox = $('.messages__chat');
    msgBox.scrollTop(msgBox[0].scrollHeight);
}
