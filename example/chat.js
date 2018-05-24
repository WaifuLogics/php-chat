// Change localhost to the name or ip address of the host running the chat server
//let chatUrl = 'ws://localhost:9911';
let isTyping = false;
let messageField;
let messageList;

document.addEventListener("DOMContentLoaded", () => {
    messageField = document.getElementsByName("message")[0];
    messageList = document.getElementById("messageList");
});

function displayChatMessage(from, message) {
    const node = document.createElement("LI");

    if (from) {
        const nameNode = document.createElement("STRONG");
        const nameTextNode = document.createTextNode(from + ": ");
        nameNode.appendChild(nameTextNode);
        node.appendChild(nameNode);
    }

    // var messageTextNode = document.createTextNode(message);
    // node.appendChild(messageTextNode);
    node.innerHTML += message;

    messageList.appendChild(node);
    messageList.scrollTop = messageList.scrollHeight;
}

function displayUserTypingMessage(from) {
    const nodeId = 'userTyping'+from.name.replace(' ','');
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

    const ajax = new XMLHttpRequest();
    ajax.open("GET", `loadMessages.php?room=${room}`);
    ajax.onreadystatechange = () => {
        if(ajax.readyState == 4 && ajax.status == 200) {
            let json = JSON.parse(ajax.responseText);
            for(let message of json.messages) {
                displayChatMessage(message.account_name, message.chat_message);
            }
            document.getElementById('connectFormDialog').style.display = 'none';
            document.getElementById('messageDialog').style.display = 'block';
            messageList.scrollTop = messageList.scrollHeight;
        }
    };
    ajax.send();
}

let conn;
function connectToChat() {
    conn = new WebSocket(chatUrl);

    conn.onopen = function() {
        let username = document.getElementsByName("user.name")[0].value;
        if(username.length < 5) {
            alert("Username must be at least 5 characters.");
            return false;
        }
        document.getElementById('connectFormDialog').innerHTML = "Connecting<br />";
        const params = {
            // 'roomId': document.getElementsByName("room.name")[0].value,
            'roomId': room,
            'userName': username,
            'action': 'connect'
        };
        console.log(params);
        conn.send(JSON.stringify(params));
    };

    conn.onmessage = function(e) {
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
                loadMessages();
            }
            else if (data.type == 'user-started-typing') {
                displayUserTypingMessage(data.from)
            }
            else if (data.type == 'user-stopped-typing') {
                removeUserTypingMessage(data.from);
            }
        }
    };

    conn.onerror = function(e) {
        console.log(e);
    };

    return false;
}

function sendChatMessage() {
    if(messageField.value.length > 1) {
        const d = new Date();
        const params = {
            'message': messageField.value,
            'action': 'message',
            'timestamp': d.getTime() / 1000
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
    else if (messageField.value.length < 1 || (isTyping && !timerRunning) ) {
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
    if(!timerRunning) {
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
    if(code == 13 && !isShift) { //Enter keycode
        return sendChatMessage();
    }
}