// Change localhost to the name or ip address of the host running the chat server
//let chatUrl = 'ws://localhost:9911';
let isTyping = false;
let messageField;
let messageList;

document.addEventListener("DOMContentLoaded", () => {
    messageField = document.getElementsByName("message")[0];
    messageList = document.getElementById("messageList");
});

function displayChatMessage(from, message, timestamp) {
    const node = document.createElement("LI");

    if (from) {
        const rowNode = document.createElement("DIV");
        rowNode.className = "row";

        const messageNode = document.createElement("DIV");
        messageNode.className += "col s5";

        if (from == user) {
            messageNode.className += " ownMessage offset-s6";
        } else {
            messageNode.className += " otherMessage";
        }

        messageNode.innerHTML = `
        <div class="row">
            <div class="col s2">
                <img src="" alt="Avatar">
            </div>
            <div class="col s10">
                <h5>${from}</h5>
                <p>${message}</p>
                <span>${timestamp.toUTCString()}</span>
            </div>
        </div>
        `;

        rowNode.appendChild(messageNode);
        node.appendChild(rowNode);

        /* <div class="row">
            <!--if own message use right col, if not use left col-->
            <div class="col s6 otherMessage"></div> //no offset
            <div class="col s6 ownMessage offset-s6">
              <div class="row">
                <div class="col s2">
                  <img src="" alt="Avatar">
                </div>
                <div class="col s10">
                  <h5>Username</h5>
                  <p>message</p>
                  <span>Timestamp</span>
                </div>
              </div>
            </div>
          </div>

        /*const nameNode = document.createElement("STRONG");
        const nameTextNode = document.createTextNode(from + ": ");

        if (from == user) {
            nameNode.className += " ownMessage";
        }

        nameNode.appendChild(nameTextNode);
        node.appendChild(nameNode);*/
    }

    // var messageTextNode = document.createTextNode(message);
    // node.appendChild(messageTextNode);
    // node.innerHTML += message;

    messageList.appendChild(node);
    messageList.scrollTop = messageList.scrollHeight;
}

function displayUserTypingMessage(from) {
    const nodeId = 'userTyping' + from.name.replace(' ', '');
    let node = document.getElementById(nodeId);
    if (!node) {
        node = document.createElement("LI");
        node.id = nodeId;

        const messageTextNode = document.createTextNode(from.name + ' is typing...');
        node.appendChild(messageTextNode);

        messageList.appendChild(node);
    }
}

function removeUserTypingMessage(from) {
    const nodeId = 'userTyping' + from.name.replace(' ', '');
    const node = document.getElementById(nodeId);
    console.log(node);
    if (node) {
        node.parentNode.removeChild(node);
    }
}

function loadMessages() {

    fetch(`http://chat.protask.duncte123.me/loadMessages.php?room=${room}`)
        .then(response => response.json())
        .then(json => {
            for (let message of json.messages) {
                displayChatMessage(message.account_name, message.chat_message, new Date(message.timestamp));
            }
            //document.getElementById('connectFormDialog').style.display = 'none';
            //document.getElementById('messageDialog').style.display = 'block';
            messageList.scrollTop = messageList.scrollHeight;
        });
}

let conn;

function connectToChat() {
    conn = new WebSocket(chatUrl);

    conn.onopen = function () {
        if (user == null || user == "")
            return false;
            //user = document.getElementsByName("user.name")[0].value;

        if (user.length < 5) {
            alert("Username must be at least 5 characters.");
            return false;
        }
        loadMessages();
        //document.getElementById('connectFormDialog').innerHTML = "Connecting<br />";
        const params = {
            // 'roomId': document.getElementsByName("room.name")[0].value,
            'roomId': room,
            'userName': user,
            'action': 'connect'
        };
        console.log(params);
        conn.send(JSON.stringify(params));
    };

    conn.onmessage = function (e) {
        console.log(e);
        const data = JSON.parse(e.data);

        if (data.hasOwnProperty('message') && data.hasOwnProperty('from')) {
            displayChatMessage(data.from.name, data.message);
        }
        else if (data.hasOwnProperty('message')) {
            displayChatMessage(null, data.message);
        }
        else if (data.hasOwnProperty('type')) {
            if (data.type == 'list-users' && data.hasOwnProperty('clients')) {
                displayChatMessage(null, 'There are ' + data.clients.length + ' users connected');
            }
            else if (data.type == 'user-started-typing') {
                displayUserTypingMessage(data.from)
            }
            else if (data.type == 'user-stopped-typing') {
                removeUserTypingMessage(data.from);
            }
        }
    };

    conn.onerror = function (e) {
        console.log(e);
    };

    return false;
}

function sendChatMessage() {
    if (messageField.value.length > 1) {
        const d = new Date();
        const params = {
            'message': messageField.value,
            'action': 'message',
            'timestamp': d.getTime()
        };
        conn.send(JSON.stringify(params));

        messageField.value = '';

        isTyping = false;
        timerRunning = false;
        clearTimeout(timeout);
    }
    return false;
}

function updateChatTyping() {
    let params = {};

    if (messageField.value.length > 0 && !isTyping) {
        params = {'action': 'start-typing'};
        conn.send(JSON.stringify(params));
        isTyping = true;
        checkTypingStatus();
    }
    else if (messageField.value.length < 1 || (isTyping && !timerRunning)) {
        params = {'action': 'stop-typing'};
        conn.send(JSON.stringify(params));
        isTyping = false;
        timerRunning = false;
        clearTimeout(timeout);
    }
}

let timerRunning = false;
let timeout;

/**
 * This function checks if we are already typing
 */
function checkTypingStatus() {
    if (!timerRunning) {
        timerRunning = true;
        timeout = setTimeout(() => {
            // isTyping = false;
            timerRunning = false;
            updateChatTyping();
        }, 10 * 1000);
    }
}

function checkEnter(e) {

    let isShift;
    if (window.event) {
        isShift = !!window.event.shiftKey; // typecast to boolean
    } else {
        isShift = e.shiftKey;
    }
    let code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13 && !isShift) { //Enter keycode
        return sendChatMessage();
    }
}