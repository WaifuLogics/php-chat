// Change localhost to the name or ip address of the host running the chat server
let chatUrl = 'ws://localhost:9911';
let isTyping = false;

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

    document.getElementById("messageList").appendChild(node);
}

function displayUserTypingMessage(from) {
    const nodeId = 'userTyping'+from.name.replace(' ','');
    let node = document.getElementById(nodeId);
    if (!node) {
        node = document.createElement("LI");
        node.id = nodeId;

        const messageTextNode = document.createTextNode(from.name + ' is typing...');
        node.appendChild(messageTextNode);

        document.getElementById("messageList").appendChild(node);
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

let conn;

function connectToChat() {
    conn = new WebSocket(chatUrl);

    conn.onopen = function() {
        document.getElementById('connectFormDialog').style.display = 'none';
        document.getElementById('messageDialog').style.display = 'block';

        const params = {
            'roomId': document.getElementsByName("room.name")[0].value,
            'userName': document.getElementsByName("user.name")[0].value,
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
    if(document.getElementsByName("message")[0].value.length > 1) {
        const d = new Date();
        const params = {
            'message': document.getElementsByName("message")[0].value,
            'action': 'message',
            'timestamp': d.getTime() / 1000
        };
        conn.send(JSON.stringify(params));

        document.getElementsByName("message")[0].value = '';

        isTyping = false;
        timerRunning = false;
        clearTimeout(timeout);
    }
    return false;
}

function updateChatTyping() {
    let params = {};

    if (document.getElementsByName("message")[0].value.length > 0 && !isTyping) {
        params = {'action': 'start-typing'};
        conn.send(JSON.stringify(params));
        isTyping = true;
        checkTypingStatus();
    }
    else if (document.getElementsByName("message")[0].value.length < 1 || (isTyping && !timerRunning) ) {
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