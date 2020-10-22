// var socket = io.connect('http://c2156187c19d.ngrok.io');
var socket = io.connect('http://localhost:5001/');

// var userAuthId = "7c6de410-8e33-11ea-88ee-b46d830ab42d";
var userAuthId = window.localStorage.getItem("user");
var page_num = 0;

socket.on('socket-connected', function (data) {
    // console.log("socket.id", socket.id)
    socket.emit('connected', { user: userAuthId, id: socket.id })
})

var allChats = [];
socket.on('conversation-got', function (data) {
    data = data.data;
    console.log("Data got is", data);
    var messageWrapper = document.getElementsByClassName("message-wrap")[0];
    // var messageFooter = document.getElementsByClassName("message-footer")[0];
    content.querySelector(".info .time").innerHTML = "last seen...."
    if (data.allConversations.length > 0) {
        openChatBox();
        // messageWrapper.style.display = "flex";
        // messageFooter.style.display = "flex";
        // $('.content header').html();
        // $('.new_chat').animate({ "left": "-100%" }, "fast");
        $('.content').css({ 'background': "url('" + data.allConversations[0].wallpaper + "')", "background-repeat": "no-repeat", "background-size": "cover", "background-position": "center" })
        allChats = [...allChats, ...data.allConversations];
        messageWrapper.innerHTML = '';
        page_num = data.page_num;
        for (var i = allChats.length - 1; i >= 0; i--) {
            var notMeDiv = document.createElement("div");
            notMeDiv.setAttribute("class", "message-list speech-bubble");
            // console.log("Div formed",notMeDiv)
            var meDiv = document.createElement("div");
            meDiv.setAttribute("class", "message-list me speech-bubble-me");
            var messageDiv = document.createElement("div");
            messageDiv.setAttribute("class", "msg");
            var messagePara = document.createElement("p");
            messagePara.innerHTML = allChats[i].reply;
            if (allChats[i].length != 1 && allChats[i].reply != 'NA') {
                if (allChats[i].user_id == userAuthId) {
                    // console.log("Me messages");
                    var userPicMe = document.createElement("img");
                    userPicMe.setAttribute("class", "user_pic_chat_me")
                    userPicMe.setAttribute("src", allChats[i].user_pic)
                    meDiv.appendChild(userPicMe);
                    messageDiv.appendChild(messagePara);
                    meDiv.appendChild(messageDiv);
                    messageWrapper.appendChild(meDiv);
                    // console.log("Me div formed", meDiv);
                }
                else {
                    // console.log("Not me Messages");
                    var userPicNotMe = document.createElement("img");
                    userPicNotMe.setAttribute("class", "user_pic_chat_not_me")
                    userPicNotMe.setAttribute("src", allChats[i].user_pic)
                    notMeDiv.appendChild(userPicNotMe);
                    messageDiv.appendChild(messagePara);
                    notMeDiv.appendChild(messageDiv);
                    messageWrapper.appendChild(notMeDiv);
                    // console.log("Not me div formed", notMeDiv);
                }
            }
        }
    }
});

function openChatBox() {
    $('header').css({ "display": "flex" });
    $('.message-wrap').css({ "display": "flex" });
    $('.message-footer').css({ "display": "flex" });
    $('.list').removeClass('active');
    $('.new_chat').animate({ "left": "-100%" }, "fast");
    var list = document.querySelectorAll(".list");
    list.forEach((l, i) => {
        // console.log("l & i ",l,i);
        l.addEventListener("click", function () {
            click(l, i);
        });
    });
}

//list click
function click(l, index) {
    if (l) {
        console.log("l & index",l,index);
        // $('.list').eq(index).addClass('active');
        // document.getElementsByClassName("list")[index].addClass = "active";
        // console.log(l, index);
        document.querySelector("sidebar").classList.remove("opened");
        open.innerText = "UP";
        const img = l.querySelector("img").src,
            user = l.querySelector(".user").innerText,
            time = l.querySelector(".time").innerText;
        content.querySelector("img").src = img;
        content.querySelector(".info .user").innerHTML = user;
        // content.querySelector(".info .time").innerHTML = time;

        const inputPH = input.getAttribute("data-placeholder");
        input.placeholder = inputPH.replace("{0}", user.split(' ')[0]);

        // document.querySelector(".message-wrap").scrollTop = document.querySelector(".message-wrap").scrollHeight;
        // localStorage.setItem("selected", index);
    }
}

socket.on("new-message", function (message) {
    // console.log("New Message got", message);
    var messageWrapper = document.getElementsByClassName("message-wrap")[0];
    var notMeDiv = document.createElement("div");
    notMeDiv.setAttribute("class", "message-list speech-bubble");
    // console.log("Div formed",notMeDiv)
    var meDiv = document.createElement("div");
    meDiv.setAttribute("class", "message-list me speech-bubble-me");
    var messageDiv = document.createElement("div");
    messageDiv.setAttribute("class", "msg");
    var messagePara = document.createElement("p");
    messagePara.innerHTML = message.message;
    if (message.sender == userAuthId) {
        // console.log("mine pic", message.sender_pic)
        var userPicMe = document.createElement("img");
        userPicMe.setAttribute("class", "user_pic_chat_me")
        userPicMe.setAttribute("src", message.sender_pic)
        meDiv.appendChild(userPicMe);
        messageDiv.appendChild(messagePara);
        meDiv.appendChild(messageDiv);
        messageWrapper.appendChild(meDiv);
        // console.log("Me div formed", meDiv);
    }
    else {
        // console.log("not me", message.sender_pic);
        var userPicNotMe = document.createElement("img");
        userPicNotMe.setAttribute("class", "user_pic_chat_not_me")
        userPicNotMe.setAttribute("src", message.sender_pic)
        notMeDiv.appendChild(userPicNotMe);
        messageDiv.appendChild(messagePara);
        notMeDiv.appendChild(messageDiv);
        messageWrapper.appendChild(notMeDiv);
        // console.log("Not me div formed", notMeDiv);
    }
})

function getConversation(userId) {
    // console.log("getConversation", userId);
    allChats = [];
    page_num = 0;
    $('.message-wrap').animate({ scrollTop: $(document).height() + 10000 * page_num }, 100);
    // if (window.localStorage.getItem("user_selected") == undefined)
    window.localStorage.setItem("user_selected", userId);
    document.getElementsByClassName("message-wrap")[0].style.display = "none";
    socket.emit('get-conversation', { user_id: userId, socket_id: socket.id, page_num: page_num, user: window.localStorage.getItem("user") });
}

function getConversationOnLoad() {
    // console.log('window.localStorage.getItem("user_selected")', window.localStorage.getItem("user_selected"));
    if (window.localStorage.getItem("user_selected") != undefined)
        socket.emit('get-conversation', { user_id: window.localStorage.getItem("user_selected"), socket_id: socket.id });
}

function sendMessage() {
    var message = document.getElementById("message_to_send").value;
    if (message.trim().length > 0) {
        document.getElementById("message_to_send").value = null;
        // console.log("send message to", window.localStorage.getItem("user_selected"), message, window.localStorage.getItem("user"));
        socket.emit('send-message', { sender: window.localStorage.getItem("user"), receiver: window.localStorage.getItem("user_selected"), socket_id: socket.id, message: message });
        $('.message-wrap').animate({ scrollTop: $(document).height() + 10000 * page_num }, 300);
    }
}

var answersFrom = {}, offer;
var peerConnection = window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection ||
    window.msRTCPeerConnection;

var sessionDescription = window.RTCSessionDescription ||
    window.mozRTCSessionDescription ||
    window.webkitRTCSessionDescription ||
    window.msRTCSessionDescription;

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

var pc = new peerConnection({
    iceServers: [{
        url: "stun:stun.services.mozilla.com",
        username: "somename",
        credential: "somecredentials"
    }]
});

function videoCall() {
    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

    pc.onaddstream = function (obj) {
        var vid = document.createElement('video');
        vid.setAttribute('class', 'video-small');
        vid.setAttribute('autoplay', 'autoplay');
        vid.setAttribute('id', 'video-small');
        document.getElementById('users-container').appendChild(vid);
        vid.srcObject = obj.stream;
    }

    navigator.getUserMedia({ video: true, audio: false }, function (stream) {
        // var video = document.querySelector('video');
        var video = document.getElementById("myVideo");
        $('.content').css({ 'filter': "blur(20px)" })
        $('sidebar').css({ 'filter': "blur(20px)" })
        $("#myVideo").css({ "display": "flex" })
        $('#myVideo').css({ 'filter': "blur(0px)" })
        $('.center').css({ 'display': 'block' });
        // console.log("video", video)
        video.srcObject = stream;
        pc.addStream(stream);
        if (currentCall == null)
            socket.emit('create-room', { sender: userAuthId, receiver: window.localStorage.getItem("user_selected"), socket_id: socket.id })
    }, error);

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log("enumerateDevices() not supported.");
    }
}

function error(err) {
    console.warn('Error', err);
}

socket.on('join-room', (room) => {
    room = room.data;
    // console.log("Room join request", room);
    if (userAuthId == room.sender) {
        room.user_id = userAuthId;
        socket.emit('connect-room', { room });
    } else {
        showNotification(room);
    }
})

var currentCall = null;

function showNotification(room) {
    currentCall = room;
    var calling_tune = document.getElementById("calling_tune");
    calling_tune.play();
    $('.notification_wrapper').css({ "display": "flex" });
    document.getElementById("notification_content").innerHTML = "Video call from " + room.sender_name;
}

function pauseAudio() {
    x.pause();
}

$('#accept_call').on('click', function () {
    createOffer(currentCall.room_name);
    $('.notification_wrapper').css({ "display": "none" });
    videoCall();
})

function createOffer(room_name) {
    console.log("Inside createOffer");
    pc.createOffer(function (offer) {
        pc.setLocalDescription(new sessionDescription(offer), function () {
            socket.emit('make-offer', {
                offer: offer,
                to: room_name
            });
        }, error);
    }, error);
}

socket.on('offer-made', function (data) {
    console.log("Offer made", data)
    offer = data.offer;
    pc.setRemoteDescription(new sessionDescription(data.offer), function () {
        pc.createAnswer(function (answer) {
            pc.setLocalDescription(new sessionDescription(answer), function () {
                socket.emit('make-answer', {
                    answer: answer,
                    to: data.socket
                });
            }, error);
        }, error);
    }, error);

});

socket.on('answer-made', function (data) {
    console.log("Answer made", data);
    pc.setRemoteDescription(new sessionDescription(data.answer), function () {
        // document.getElementById(data.socket).setAttribute('class', 'active');
        if (!answersFrom[data.socket]) {
            createOffer(data.socket);
            answersFrom[data.socket] = true;
        }
    }, error);
});

function videoOff() {
    // alert($(this).index() + 1)
    // $(this).css({"display":"none"});
    // if($(this).index() + 1 == 0)
    //     $('.video_actions img').eq($(this).index()).css({"display":"block"});
    // else if($(this).index() == 1)
    //     $('.video_actions img').eq($(this).index()).css({"display":"block"});
}

$('#message_to_send').keypress(function (e) {
    var key = e.which;
    // console.log("key", e.which)
    if (key == 13)  // the enter key code
    {
        $('#send_message').trigger('click');
        $('.message-wrap').animate({ scrollTop: $(document).height() + 10000 * page_num }, 300);
    }
});

$('.message-wrap').scroll(function () {
    var pos = $('.message-wrap').scrollTop();
    // console.log("pos",pos)
    if (pos <= 20) {
        // alert('top of the div');
        socket.emit('get-conversation', { user_id: window.localStorage.getItem("user_selected"), socket_id: socket.id, page_num: page_num });
    }
});

$('.video img').on('click', function () {
    // alert($(this).index())
    $(this).css({ "display": "none" });
    if ($(this).index() == 0)
        $('.video img').eq(1).css({ "display": "block" });
    else if ($(this).index() == 1)
        $('.video img').eq(0).css({ "display": "block" });
})

$('.audio img').on('click', function () {
    // alert($(this).index())
    $(this).css({ "display": "none" });
    if ($(this).index() == 0)
        $('.audio img').eq(1).css({ "display": "block" });
    else if ($(this).index() == 1)
        $('.audio img').eq(0).css({ "display": "block" });
})

$('#phone_cut_wrapper').on('click', function () {
    var video = document.getElementById("myVideo");
    const stream = video.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach(function (track) {
        track.stop();
    });

    video.srcObject = null;
    $('.content').css({ 'filter': "blur(0px)" })
    $('sidebar').css({ 'filter': "blur(0px)" })
    $("#myVideo").css({ "display": "none" })
    $('#myVideo').css({ 'filter': "blur(0px)" })
    $('.center').css({ 'display': 'none' });
})


$(".compose_new_message").click(function () {
    $('.new_chat').animate({ "left": "0%" }, "fast");
    socket.emit('get-contacts', window.localStorage.getItem("user"));
});

socket.on('all-contacts', (contacts) => {
    // console.log("contacts got", contacts);
    var contactListWrapper = document.getElementsByClassName("contact-list")[0];
    contactListWrapper.innerHTML = '';
    for (var i = 0; i < contacts.length; i++) {
        var li = document.createElement("li");
        var img = document.createElement("img");
        var p = document.createElement("p");
        var div = document.createElement("div");
        img.setAttribute("src", contacts[i].user_pic);
        img.setAttribute("class", "avatar");
        p.innerHTML = contacts[i].user_name;
        div.setAttribute("class", "phone_num");
        div.innerHTML = contacts[i].phone;
        li.setAttribute("onClick", "getConversation('" + contacts[i].user_id + "')")
        li.appendChild(img);
        li.appendChild(p);
        li.appendChild(div);
        contactListWrapper.appendChild(li);
    }
    // <li>
    //     <img src="http://www.top-madagascar.com/assets/images/admin/user-admin.png" class="avatar">
    //         <p>user one</p>
    //                 </li>
    //     <li>
    //         <img src="http://www.top-madagascar.com/assets/images/admin/user-admin.png" class="avatar">
    //             <p>user two</p>
    //                 </li>
    //         <li>
    //             <img src="http://www.top-madagascar.com/assets/images/admin/user-admin.png" class="avatar">
    //                 <p>user three</p>
    //                 </li>
})

$(".user_details").click(function () {
    $('.user_details_side_bar').animate({ "left": "0%" }, "fast");
});

$(".newMessage-back-arrow").click(function () {
    $('.new_chat').animate({ "left": "-100%" }, "fast");
});

$('head').append('<link href="//fonts.googleapis.com/css?family=Open+Sans:300,400,600" rel="stylesheet" type="text/css">');

$('input').focus(function (event) {
    $(this).closest('.float-label-field').addClass('float').addClass('focus');
})

$('input').blur(function () {
    $(this).closest('.float-label-field').removeClass('focus');
    if (!$(this).val()) {
        $(this).closest('.float-label-field').removeClass('float');
    }
});

function createNewContact() {
    // console.log(document.getElementById('contact-name'), document.getElementById('contact'))
    var contactName = document.getElementById('contact-name').value;
    var contact = document.getElementById('contact').value;
    var data = {};
    data.contact_name = contactName;
    data.phone = contact;
    data.user_id = window.localStorage.getItem("user");

    socket.emit('create-contact', data)
}

socket.on('contact-created', (contact) => {
    // console.log("New contact created", contact);
    var contactListWrapper = document.getElementsByClassName("contact-list")[0];
    var li = document.createElement("li");
    var img = document.createElement("img");
    var p = document.createElement("p");
    var div = document.createElement("div");
    img.setAttribute("src", contact.user_pic);
    img.setAttribute("class", "avatar");
    p.innerHTML = contact.contact_name;
    div.setAttribute("class", "phone_num");
    div.innerHTML = contact.phone;
    li.setAttribute("onClick", "getConversation('" + contact.user_id + "')")
    li.appendChild(img);
    li.appendChild(p);
    li.appendChild(div);
    contactListWrapper.appendChild(li);
    window.location.href = "#";
    document.getElementById('contact-name').value = null;
    document.getElementById('contact').value = null;
})