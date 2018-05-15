// Change localhost to the name or ip address of the host running the chat server
var chatUrl = 'ws://localhost:9911';
let isTyping = false;

function displayChatMessage(from, message) {
    var node = document.createElement("LI");

    if (from) {
        var nameNode = document.createElement("STRONG");
        var nameTextNode = document.createTextNode(from + ": ");
        nameNode.appendChild(nameTextNode);
        node.appendChild(nameNode);
    }

    var messageTextNode = document.createTextNode(message);
    node.appendChild(messageTextNode);

    document.getElementById("messageList").appendChild(node);
}

function displayUserTypingMessage(from) {
    var nodeId = 'userTyping'+from.name.replace(' ','');
    var node = document.getElementById(nodeId);
    if (!node) {
        node = document.createElement("LI");
        node.id = nodeId;

        var messageTextNode = document.createTextNode(from.name + ' is typing...');
        node.appendChild(messageTextNode);

        document.getElementById("messageList").appendChild(node);
    }
}

function removeUserTypingMessage(from) {
    var nodeId = 'userTyping' + from.name.replace(' ', '');
    var node = document.getElementById(nodeId);
    console.log(node);
    if (node) {
        node.parentNode.removeChild(node);
    }
}

var conn;

function connectToChat() {
    conn = new WebSocket(chatUrl);

    conn.onopen = function() {
        document.getElementById('connectFormDialog').style.display = 'none';
        document.getElementById('messageDialog').style.display = 'block';

        var params = {
            'roomId': document.getElementsByName("room.name")[0].value,
            'userName': document.getElementsByName("user.name")[0].value,
            'action': 'connect'
        };
        console.log(params);
        conn.send(JSON.stringify(params));
    };

    conn.onmessage = function(e) {
        console.log(e);
        var data = JSON.parse(e.data);

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
        var d = new Date();
        var params = {
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
    var params = {};

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
            console.log("hi");
        }, 10 * 1000);
    }
}

function checkEnter(e) {
    let code = (e.keyCode ? e.keyCode : e.which);
    if(code == 13) { //Enter keycode
        return sendChatMessage();
    }
}