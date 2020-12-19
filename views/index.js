// var socket = io.connect('http://c2156187c19d.ngrok.io');
var socket = io.connect('http://localhost:5001/');

var userAuthId = window.localStorage.getItem("user");
var page_num = 0;

socket.on('socket-connected', function (data) {
    socket.emit('connected', { user: userAuthId, id: socket.id })
})

socket.on('user-offline', (user) => {
    // console.log("User is offline", user);
    // console.log("Div found", $("div#" + user.user_id));
    // console.log('$("div#"+user.user_id+" .online_stat")', $("div#" + user.user_id + " span .online_stat").html());
    if (user.status == "Online") {
        $("div#" + user.user_id + " span .online_stat").html(user.status);
        $("div#" + user.user_id + " span .online_stat").css({ "color": "greenyellow" });
    } else {
        $("div#" + user.user_id + " span .online_stat").html(user.status);
        $("div#" + user.user_id + " span .online_stat").css({ "color": "red" });
    }
})

var allChats = [];
socket.on('conversation-got', function (data) {
    data = data.data;
    // console.log("Data got is", data);
    var messageWrapper = document.getElementsByClassName("message-wrap")[0];
    content.querySelector(".info .time").innerHTML = data.online_status;
    if (data.online_status == "Online") {
        $(".info .time").css({ "color": "greenyellow" });
    } else {
        $(".info .time").css({ "color": "red" });
    }
    if (data.allConversations.length > 0) {
        openChatBox();
        $('.content').css({ 'background': "url('" + data.allConversations[0].wallpaper + "')", "background-repeat": "no-repeat", "background-size": "cover", "background-position": "center" })
        allChats = [...allChats, ...data.allConversations];
        messageWrapper.innerHTML = '';
        page_num = data.page_num;
        c = 0;
        for (var i = allChats.length - 1; i >= 0; i--) {
            var notMeDiv = document.createElement("div");
            var meDiv = document.createElement("div");
            meDiv.setAttribute("class", "message-list me speech-bubble-me");
            notMeDiv.setAttribute("class", "message-list speech-bubble");

            // console.log("allChats[i].message_type", allChats[i].message_type);
            if (allChats[i].message_type == 'text') {
                var messageDiv = document.createElement("div");
                messageDiv.setAttribute("class", "msg");
                var messagePara = document.createElement("p");
                messagePara.innerHTML = allChats[i].reply;
            } else {
                // console.log("Message type changed");
                // makePicBubble(allChats[i].reply, allChats[i].user_id)
                var messageDiv = document.createElement("div");
                messageDiv.setAttribute("class", "msg");
                var messagePara = document.createElement("img");
                messagePara.setAttribute("src", allChats[i].reply);
                messagePara.setAttribute("class", "attached_pic");
            }

            if (allChats[i].message_type == 'canvas') {
                messageDiv.setAttribute("style", "background:#ffffff");
            }

            if (allChats[i].length != 1 && allChats[i].reply != 'NA') {
                if (allChats[i].user_id == userAuthId) {
                    var userPicMe = document.createElement("img");
                    // if (allChats[i].message_type == 'text') {
                    userPicMe.setAttribute("class", "user_pic_chat_me user_pic_chat_me_img")
                    if (allChats[i].message_type != 'text')
                        userPicMe.setAttribute("style", "margin-top:140px")
                    // userPicMe.setAttribute("class", "user_pic_chat_me")
                    userPicMe.setAttribute("src", $("#user_main").attr("src"));
                    messageDiv.appendChild(messagePara);
                    meDiv.appendChild(userPicMe);
                    meDiv.appendChild(messageDiv);
                    // }
                    messageWrapper.appendChild(meDiv);
                }
                else {
                    // console.log("user_id",allChats[i].user_id)
                    // console.log($("div#"+allChats[i].user_id+" img").attr("src"));
                    // if (allChats[i].message_type == 'text') {
                    var userPicNotMe = document.createElement("img");
                    userPicNotMe.setAttribute("class", "user_pic_chat_not_me")
                    if (allChats[i].message_type != 'text')
                        userPicNotMe.setAttribute("style", "margin-top:140px")
                    // userPicNotMe.setAttribute("class", "user_pic_chat_not_me")
                    // userPicNotMe.setAttribute("src", allChats[i].user_pic)
                    userPicNotMe.setAttribute("src", $("div#" + allChats[i].user_id + " img").attr("src"))
                    notMeDiv.appendChild(userPicNotMe);
                    messageDiv.appendChild(messagePara);
                    notMeDiv.appendChild(messageDiv);
                    // }
                    messageWrapper.appendChild(notMeDiv);
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
        l.addEventListener("click", function () {
            click(l, i);
        });
    });
}

function closeChatBox() {
    $('header').css({ "display": "none" });
    $('.message-wrap').css({ "display": "none" });
    $('.message-footer').css({ "display": "none" });
    $('.list').removeClass('active');
    $('.new_chat').animate({ "left": "-100%" }, "fast");
    var list = document.querySelectorAll(".list");
    list.forEach((l, i) => {
        l.addEventListener("click", function () {
            click(l, i);
        });
    });
}

//list click
function click(l, index) {
    if (l) {
        document.querySelector("sidebar").classList.remove("opened");
        open.innerText = "UP";
        const img = l.querySelector("img").src,
            user = l.querySelector(".user").innerText,
            time = l.querySelector(".time").innerText;
        content.querySelector("img").src = img;
        content.querySelector(".info .user").innerHTML = user;

        const inputPH = input.getAttribute("data-placeholder");
        input.placeholder = inputPH.replace("{0}", user.split(' ')[0]);
    }
}

socket.on("new-message", function (message) {
    console.log("New message", message);
    var messageWrapper = document.getElementsByClassName("message-wrap")[0];
    var notMeDiv = document.createElement("div");
    notMeDiv.setAttribute("class", "message-list speech-bubble");
    var meDiv = document.createElement("div");
    meDiv.setAttribute("class", "message-list me speech-bubble-me");
    if (message.type == 'text') {
        var messageDiv = document.createElement("div");
        messageDiv.setAttribute("class", "msg");
        var messagePara = document.createElement("p");
        messagePara.innerHTML = message.message;
    } else {
        // console.log("Message type changed");
        // makePicBubble(message.message, message.sender)
        var messageDiv = document.createElement("div");
        messageDiv.setAttribute("class", "msg");
        var messagePara = document.createElement("img");
        messagePara.setAttribute("src", message.message);
        messagePara.setAttribute("class", "attached_pic")
    }
    // var messageDiv = document.createElement("div");
    // messageDiv.setAttribute("class", "msg");
    // var messagePara = document.createElement("p");
    // messagePara.innerHTML = message.message;
    if (message.sender == userAuthId) {
        // console.log('$("#user_main").attr("src")', $("#user_main").attr("src"))
        var userPicMe = document.createElement("img");
        userPicMe.setAttribute("class", "user_pic_chat_me user_pic_chat_me_img")
        if (message.type != 'text')
            userPicMe.setAttribute("style", "margin-top:140px")
        userPicMe.setAttribute("src", $("#user_main").attr("src"))
        meDiv.appendChild(userPicMe);
        // if (message.type == 'text') {
        messageDiv.appendChild(messagePara);
        meDiv.appendChild(messageDiv);
        // }
        messageWrapper.appendChild(meDiv);
    }
    else {
        // console.log("Not me")
        var userPicNotMe = document.createElement("img");
        userPicNotMe.setAttribute("class", "user_pic_chat_not_me user_pic_chat_not_me_img")
        if (message.type != 'text')
            userPicNotMe.setAttribute("style", "margin-top:140px")
        userPicNotMe.setAttribute("src", $("div#" + message.sender + " img").attr("src"))
        notMeDiv.appendChild(userPicNotMe);
        // messageDiv.appendChild(messagePara);
        // notMeDiv.appendChild(messageDiv);
        // if (message.type == 'text') {
        messageDiv.appendChild(messagePara);
        notMeDiv.appendChild(messageDiv);
        // }
        messageWrapper.appendChild(notMeDiv);
    }
})

function getConversation(userId) {
    // closeChatBox();
    allChats = [];
    page_num = 0;
    $('.message-wrap').animate({ scrollTop: $(document).height() + 10000 * page_num }, 100);
    window.localStorage.setItem("user_selected", userId);
    document.getElementsByClassName("message-wrap")[0].style.display = "none";
    socket.emit('get-conversation', { user_id: userId, socket_id: socket.id, page_num: page_num, user: window.localStorage.getItem("user") });
}

function getConversationOnLoad() {
    console.log("Inside getConversationOnLoad")
    if (window.localStorage.getItem("user_selected") != undefined)
        socket.emit('get-conversation', { user_id: window.localStorage.getItem("user_selected"), socket_id: socket.id });
}

function sendMessage() {
    var message = document.getElementById("message_to_send").value;
    if (message.trim().length > 0) {
        document.getElementById("message_to_send").value = null;
        socket.emit('send-message', { sender: window.localStorage.getItem("user"), receiver: window.localStorage.getItem("user_selected"), socket_id: socket.id, message: message });
        $('.message-wrap').animate({ scrollTop: $(document).height() + 10000 * page_num }, 300);
    }
}

// var answersFrom = {}, offer;
// var peerConnection = window.RTCPeerConnection ||
//     window.mozRTCPeerConnection ||
//     window.webkitRTCPeerConnection ||
//     window.msRTCPeerConnection;

// var sessionDescription = window.RTCSessionDescription ||
//     window.mozRTCSessionDescription ||
//     window.webkitRTCSessionDescription ||
//     window.msRTCSessionDescription;

// navigator.getUserMedia = navigator.getUserMedia ||
//     navigator.webkitGetUserMedia ||
//     navigator.mozGetUserMedia ||
//     navigator.msGetUserMedia;

// var pc = new peerConnection({
//     iceServers: [{
//         url: "stun:stun.services.mozilla.com",
//         username: "somename",
//         credential: "somecredentials"
//     }]
// });

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
        var video = document.getElementById("myVideo");
        $('.content').css({ 'filter': "blur(20px)" })
        $('sidebar').css({ 'filter': "blur(20px)" })
        $("#myVideo").css({ "display": "flex" })
        $('#myVideo').css({ 'filter': "blur(0px)" })
        $('.center').css({ 'display': 'block' });
        video.srcObject = stream;
        pc.addStream(stream);
        if (currentCall == null)
            socket.emit('create-room', { sender: userAuthId, receiver: window.localStorage.getItem("user_selected"), socket_id: socket.id })
    }, error);

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log("enumerateDevices() not supported.");
    }
}

function videoCall_v2() {
    socket.emit("create-meet", { user_id: userAuthId, socket_id: socket.id, receiver: window.localStorage.getItem("user_selected") });
}

socket.on("video-call", (data) => {
    console.log("Video call url for sender", data);
    startVideoCall(data);
})

socket.on("join-video-call", (data) => {
    console.log("Video call receiving", data);
    showNotification({ sender_name: "Yashu" }, data);
});

startVideoCall = (data) => {
    $('.center').css({ 'display': 'block' });
    $('.content').css({ 'filter': "blur(20px)" })
    $('sidebar').css({ 'filter': "blur(20px)" })
    $('#id01').css({ 'display': "block", 'filter': "blur(0px)", 'z-index': "99999" })
    setTimeout(() => {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({ audio: true, video: true },
                function (stream) {
                    $('#videoCallScreen').attr('src', data.url);
                    // document.getElementById('id01').style.display='block';
                },
                function (err) {
                    console.log("The following error occurred: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    }, 3000);
}

$('#accept_call').on('click', function () {
    $('.notification_wrapper').css({ "display": "none" });
    startVideoCall(currentCall);
})

socket.on("video-call-error", (data) => {
    console.log("Video call receiving error");
})

function error(err) {
    console.warn('Error', err);
}

socket.on('join-room', (room) => {
    room = room.data;
    if (userAuthId == room.sender) {
        room.user_id = userAuthId;
        socket.emit('connect-room', { room });
    } else {
        showNotification(room);
    }
})

var currentCall = null;

function showNotification(room, data) {
    currentCall = { ...room, ...data };
    var calling_tune = document.getElementById("calling_tune");
    calling_tune.play();
    $('.notification_wrapper').css({ "display": "flex" });
    document.getElementById("notification_content").innerHTML = "Video call from " + room.sender_name;
}

function pauseAudio() {
    x.pause();
}

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
        if (!answersFrom[data.socket]) {
            createOffer(data.socket);
            answersFrom[data.socket] = true;
        }
    }, error);
});

function deleteChat() {
    socket.emit('delete-chat', { user_id: window.localStorage.getItem("user"), socket_id: socket.id, delete_chat_id: window.localStorage.getItem("user_selected") })
}

function videoOff() {
    // alert($(this).index() + 1)
    // $(this).css({"display":"none"});
    // if($(this).index() + 1 == 0)
    //     $('.video_actions img').eq($(this).index()).css({"display":"block"});
    // else if($(this).index() == 1)
    //     $('.video_actions img').eq($(this).index()).css({"display":"block"});
}

var timeout;

function timeoutFunction() {
    socket.emit("typing", { user_id: userAuthId, receiver: window.localStorage.getItem("user_selected"), typing: false });
}

document.addEventListener('keyup', function () {
    // console.log("Key typing in process");
    socket.emit('typing', { user_id: userAuthId, receiver: window.localStorage.getItem("user_selected"), typing: true });
    clearTimeout(timeout)
    timeout = setTimeout(timeoutFunction, 2000)
})

socket.on('typing', function (data) {
    // console.log("User is typing", data);
    if (data.typing) {
        $("#typing_status").html("typing...");
        // $("div#" + data.user_id + " span .online_stat").html($("div#" + data.user_id + " span .online_stat").html()+" typing...");
    } else {
        $("#typing_status").html("");
        // $("div#" + data.user_id + " span .online_stat").html($("div#" + data.user_id + " span .online_stat").html().replace(" typing..."));
    }
});

$('#message_to_send').keypress(function (e) {
    var key = e.which;
    if (key == 13)  // the enter key code
    {
        $('#send_message').trigger('click');
        $('.message-wrap').animate({ scrollTop: $(document).height() + 10000 * page_num }, 300);
    }
});

$('.message-wrap').scroll(function () {
    var pos = $('.message-wrap').scrollTop();
    if (pos <= 20) {
        socket.emit('get-conversation', { user_id: window.localStorage.getItem("user_selected"), socket_id: socket.id, page_num: page_num });
    }
});

$('.video img').on('click', function () {
    $(this).css({ "display": "none" });
    if ($(this).index() == 0)
        $('.video img').eq(1).css({ "display": "block" });
    else if ($(this).index() == 1)
        $('.video img').eq(0).css({ "display": "block" });
})

$('.audio img').on('click', function () {
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
})

$(".user_details").click(function () {
    $('.user_details_side_bar').animate({ "left": "0%" }, "fast");
});

$(".newMessage-back-arrow").click(function () {
    $('.new_chat').animate({ "left": "-100%" }, "fast");
    $('.user_profile').animate({ "left": "-100%" }, "fast");
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
    var contactName = document.getElementById('contact-name').value;
    var contact = document.getElementById('contact').value;
    var data = {};
    data.contact_name = contactName;
    data.phone = contact;
    data.user_id = window.localStorage.getItem("user");

    socket.emit('create-contact', data)
}

socket.on('contact-created', (contact) => {
    console.log("New contact created", contact);
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

function moreOption() {
    if ($('#more_vert_opts').css("display") == "none")
        $('#more_vert_opts').css({ "display": "block" });
    else
        $('#more_vert_opts').css({ "display": "none" });
}

function logout() {
    localStorage.clear();
    window.location.href = "/"
}

function darkModeEnableDisable() {
    if ($('sidebar .logo').css("background-color") != "rgb(38, 50, 56)") {
        localStorage.setItem("dark_mode", "on");
        $('sidebar .logo').css({ "background": "#263238" })
        $('sidebar').css({ "background": "#37474F" })
        $('.new_chat').css({ "background": "#263238" })
        $('#composeText').css({ "background": "#263238" })
        $('#composeText').css({ "color": "#ffffff" })
        $('#composeText1').css({ "background": "#263238" })
        $('#composeText1').css({ "color": "#ffffff" })
        $('sidebar .list-wrap .list').css({ "background": "#37474F" })
        $('sidebar .list-wrap .list').css({ "color": "#b4b3b3" })
        $('sidebar .list-wrap .list').css({ "border-bottom": "0.4px solid rgb(94, 93, 93)" })
        $('.content').css({ "background-color": "#263238" })
        $('.content header').css({ "background": "#263238" })
        $('.message-footer').css({ "background": "#263238" })
        $('.message-footer input').css({ "background": "#37474F" })
        $('.message-footer input').css({ "color": "#ffffff" })
        $('.composeBox-inner').css({ "background": "#37474F" })
        $('.composeBox-inner1').css({ "background": "#37474F" })
        $('.composeBox-inner1').css({ "border-bottom": "0.4px solid rgb(94, 93, 93)" })
        $('.whatsapp_contacts').css({ "background": "#37474F" })
        $('#more_vert_opts').css({ "background": "#37474F" })
        $('#more_vert_opts').css({ "color": "#ffffff" })
        $('sidebar').css({ "border-right": "0.4px solid rgb(94, 93, 93)" })
        $('.content header .info .user').css({ "color": "#a9a9a9" })
        $('.content header .info .time').css({ "color": "#a9a9a9" })
        $('.content header').css({ "border-bottom": "0.4px solid rgb(94, 93, 93)" })
        $('.contact-list').css({ "border-bottom": "0.4px solid rgb(94, 93, 93)" })
        $('.contact-list').css({ "border-top": "0.4px solid rgb(94, 93, 93)" })
        $('.contact-list li').css({ "border-bottom": "0.4px solid rgb(94, 93, 93)" })
        $('.add-new-contact').css({ "color": "#a9a9a9" })
        $('.contact-list li').css({ "color": "#a9a9a9" })
        $('#chat_opts').css({ "background": "#37474F" })
        $('#chat_opts').css({ "color": "#ffffff" })
        $(".communication_channel .fa-phone").css({ "color": "#a9a9a9" })
        $(".communication_channel .fa-video-camera").css({ "color": "#a9a9a9" })
        $(".communication_channel .material-icons").css({ "color": "#a9a9a9" })
        $(".fa-paper-plane").css({ "color": "#a9a9a9" })
        $(".fa-paperclip").css({ "color": "#a9a9a9" })
        $(".modern-form").css({ "background": "#37474F" })
        $("#fullmodal").css({ "background": "#37474F" })
        $('#fullmodal input').css({ "background": "#263238" })
        $('#fullmodal input').css({ "color": "#ffffff" });
        $("#typing_status").css({ "color": "#ffffff" });
    } else {
        localStorage.removeItem("dark_mode");
        $('sidebar .logo').css({ "background": "rgb(237, 237, 237)" })
        $('sidebar').css({ "background": "#fff" })
        $('.new_chat').css({ "background": "#ffffff" })
        $('#composeText').css({ "background": "#ffffff" })
        $('#composeText').css({ "color": "#000000" })
        $('#composeText1').css({ "background": "#ffffff" })
        $('#composeText1').css({ "color": "#000000" })
        $('sidebar .list-wrap .list').css({ "background": "#fff" })
        $('sidebar .list-wrap .list').css({ "color": "#000000" })
        $('sidebar .list-wrap .list').css({ "border-bottom": "0.7px solid rgb(241, 241, 241)" })
        $('.content').css({ "background-color": "#ffffff" })
        $('.content header').css({ "background": "#fff" })
        $('.message-footer').css({ "background": "#eee" })
        $('.message-footer input').css({ "background": "#ffffff" })
        $('.message-footer input').css({ "color": "#000000" })
        $('.composeBox-inner').css({ "background": "#e7e7e7" })
        $('.composeBox-inner1').css({ "background": "#f3f3f3" })
        $('.composeBox-inner1').css({ "border-bottom": "1px solid white" })
        $('.whatsapp_contacts').css({ "background": "#ffffff" })
        $('#more_vert_opts').css({ "background": "#ffffff" })
        $('#more_vert_opts').css({ "color": "gray" })
        $('sidebar').css({ "border-right": "0.7px solid rgb(241, 241, 241)" })
        $('.content header .info .user').css({ "color": "#000000" })
        $('.content header .info .time').css({ "color": "#000000" })
        $('.content header').css({ "border-bottom": "0.7px solid rgb(241, 241, 241)" })
        $('.contact-list').css({ "border-bottom": "0.3px solid rgb(241, 241, 241)" })
        $('.contact-list').css({ "border-top": "0.3px solid rgb(241, 241, 241)" })
        $('.contact-list li').css({ "border-bottom": "0.3px solid rgb(241, 241, 241)" })
        $('.add-new-contact').css({ "color": "#000000" })
        $('.contact-list li').css({ "color": "rgb(74, 74, 74)" })
        $('#chat_opts').css({ "background": "#ffffff" })
        $('#chat_opts').css({ "color": "#000000" })
        $(".communication_channel .fa-phone").css({ "color": "#000000" })
        $(".communication_channel .fa-video-camera").css({ "color": "#000000" })
        $(".communication_channel .material-icons").css({ "color": "#000000" })
        $(".fa-paper-plane").css({ "color": "#000000" })
        $(".fa-paperclip").css({ "color": "#000000" })
        $(".modern-form").css({ "background": "#ffffff" })
        $("#fullmodal").css({ "background": "#ffffff" })
        $('#fullmodal input').css({ "background": "#ffffff" })
        $('#fullmodal input').css({ "color": "#000000" });
        $("#typing_status").css({ "color": "#000000" });
    }
}

var current_chat_pos = -1;

function chatMoreOpts(pos) {
    console.log("position", pos)
    console.log("top position", $('.list').eq(pos).position(), $("#chat_opts").css("display"))
    if ($("#chat_opts").css("display") == undefined || $("#chat_opts").css("display") == "none" || current_chat_pos != pos)
        $("#chat_opts").css({ "display": "block", "top": $('.list').eq(pos).position().top });
    else
        $("#chat_opts").css({ "display": "none" });
    current_chat_pos = pos;
}

$(".profile_click").click(function () {
    $('.user_profile').animate({ "left": "0%" }, "very fast");
    console.log('$("#user_main").getAttribute("src")', $("#user_main").attr("src"))
    $('.user_pic_large').attr("src", $("#user_main").attr("src"))
});

$("#user_main").click(function () {
    $('.user_profile').animate({ "left": "0%" }, "very fast");
    console.log('$("#user_main").getAttribute("src")', $("#user_main").attr("src"))
    $('.user_pic_large').attr("src", $("#user_main").attr("src"))
});

$('.user_pic_large').click(function () {
    $('#uploadfile').click();
});

$('#uploadfile').change(async () => {
    var pics = $('#uploadfile').prop('files');
    console.log("Files selected", pics[0]);
    const base64 = await convertToBase(pics[0]);
    uploadProfileImage(base64);
});

convertToBase = (image_data) => {
    return new Promise(resolve => {
        if (image_data) {
            var FR = new FileReader();
            FR.addEventListener("load", function (e) {
                // console.log("Base64 is", e.target.result);
                resolve(e.target.result);
            });
            FR.readAsDataURL(image_data);
        }
    })
}

uploadProfileImage = async (base_image) => {
    // const compressed_str = await compressImg(base_image);
    console.log("Base64 is", base_image);
    socket.emit("update-profile-pic", { user: userAuthId, id: socket.id, image_data: base_image });
}

compressImg = (img) => {
    return new Promise(resolve => {
        alert("Size of sample is: " + img.length);
        var compressed = LZString.compress(img);
        alert("Size of compressed sample is: " + compressed.length);
        resolve(compressed);
        img = LZString.decompress(compressed);
        alert("Sample is: " + img);
    });

}

socket.on("profile-pic-uploaded", (data) => {
    console.log("Profile pic succesfully uploaded", data);
    $('#snackbar').html(data.message);

    var x = document.getElementById("snackbar");
    // Add the "show" class to DIV
    x.className = "show";
    // After 3 seconds, remove the show class from DIV
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
    $('.user_pic_large').attr("src", data.data);
    $("#user_main").attr("src", data.data);
})

$('#attach_file').click(function () {
    $('#fileToSend').click();
});

$('.floatingButton').on('click',
    function (e) {
        e.preventDefault();
        $(this).toggleClass('open');
        if ($(this).children('.fa').hasClass('fa-plus')) {
            $(this).children('.fa').removeClass('fa-plus');
            $(this).children('.fa').addClass('fa-close');
        }
        else if ($(this).children('.fa').hasClass('fa-close')) {
            $(this).children('.fa').removeClass('fa-close');
            $(this).children('.fa').addClass('fa-plus');
        }
        $('.floatingMenu').stop().slideToggle();
    }
);

var canvas = document.getElementsByClassName('whiteboard')[0];
var colors = document.getElementsByClassName('color');

$('#drawing').click(async () => {
    getImageIdFromServer();
})

getImageIdFromServer = () => {
    socket.emit('create-image-id', { sender: userAuthId, receiver: window.localStorage.getItem("user_selected"), id: socket.id });
}

socket.on("image-id-created", (data) => {
    console.log("Image id got", data);
    window.localStorage.setItem("image_id", data.img_id);
    $(".drawingScreen").fadeIn("fast");

    console.log("canvas is", canvas);

    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseout', onMouseUp, false);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

    //Touch support for mobile devices
    canvas.addEventListener('touchstart', onMouseDown, false);
    canvas.addEventListener('touchend', onMouseUp, false);
    canvas.addEventListener('touchcancel', onMouseUp, false);
    canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

    for (var i = 0; i < colors.length; i++) {
        colors[i].addEventListener('click', onColorUpdate, false);
    }

    window.addEventListener('resize', onResize, false);
    onResize();
});

var context = canvas.getContext('2d');

var current = {
    color: 'black'
};
var drawing = false;

function drawLine(x0, y0, x1, y1, color, emit) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color: color,
        width: canvas.width,
        height: canvas.height,
        user_id: userAuthId,
        receiver: window.localStorage.getItem("user_selected"),
        image_id: window.localStorage.getItem("image_id")
    });
}

var points = [];

function onMouseDown(e) {
    drawing = true;
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
    points.push({
        x: current.x,
        y: current.y,
        size: 2,
        color: current.color,
        mode: "draw"
    });
}

function onMouseUp(e) {
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
}

function onMouseMove(e) {
    if (!drawing) { return; }
    drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
}

function onColorUpdate(e) {
    current.color = e.target.className.split(' ')[1];
}

// limit the number of events per second
function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function () {
        var time = new Date().getTime();

        if ((time - previousCall) >= delay) {
            previousCall = time;
            callback.apply(null, arguments);
        }
    };
}

function onDrawingEvent(data) {
    console.log("on drawing event")
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
}

// make the canvas fill its parent
function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

socket.on('drawing', onDrawingEvent);

undoDraw = () => {
    console.log("undoDraw", points);
    points.pop();
    console.log("points",points);
    redrawAll();
}

socket.on('undo-draw', (data) => {
    // add the "undone" point to a separate redo array
    redoStack.unshift(data);
    // redraw all the remaining points
    redrawAll();
})

function redrawAll() {

    if (points.length == 0) { return; }

    context.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < points.length; i++) {

        var pt = points[i];

        var begin = false;

        if (context.lineWidth != pt.size) {
            context.lineWidth = pt.size;
            begin = true;
        }
        if (context.strokeStyle != pt.color) {
            context.strokeStyle = pt.color;
            begin = true;
        }
        if (pt.mode == "begin" || begin) {
            context.beginPath();
            context.moveTo(pt.x, pt.y);
        }
        context.lineTo(pt.x, pt.y);
        if (pt.mode == "end" || (i == points.length - 1)) {
            context.stroke();
        }
    }
    context.stroke();
}

$(this).on('click', function (e) {
    var container = $(".floatingButton");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && $('.floatingButtonWrap').has(e.target).length === 0) {
        if (container.hasClass('open')) {
            container.removeClass('open');
        }
        if (container.children('.fa').hasClass('fa-close')) {
            container.children('.fa').removeClass('fa-close');
            container.children('.fa').addClass('fa-plus');
        }
        $('.floatingMenu').hide();
    }
});

sendDrawingImage = () => {
    dataURL = canvas.toDataURL();
    console.log("Image data", dataURL);
    socket.emit('send-attachment', { sender: userAuthId, id: socket.id, message: dataURL, receiver: window.localStorage.getItem("user_selected"), type: "canvas" })
    makePicBubble(dataURL,userAuthId,"canvas");
    $(".drawingScreen").fadeOut("fast");
    points = [];
}

$('#fileToSend').change(async () => {
    var pics = $('#fileToSend').prop('files');
    console.log("Files selected", pics[0]);
    const base64 = await convertToBase(pics[0]);
    console.log("Image length", base64.length);
    makePicBubble(base64, userAuthId,null);
    sendImage(base64);
});

makePicBubble = (base64, user_id,message_type) => {
    var messageWrapper = document.getElementsByClassName("message-wrap")[0];
    var notMeDiv = document.createElement("div");
    notMeDiv.setAttribute("class", "message-list speech-bubble");
    var meDiv = document.createElement("div");
    meDiv.setAttribute("class", "message-list me speech-bubble-me");
    var messageDiv = document.createElement("div");
    messageDiv.setAttribute("class", "msg");
    var imgMsg = document.createElement("img");
    imgMsg.setAttribute("src", base64);
    imgMsg.setAttribute("class", "attached_pic")
    if (message_type == 'canvas') {
        messageDiv.setAttribute("style", "background:#ffffff");
    }
    if (user_id == userAuthId) {
        var userPicMe = document.createElement("img");
        userPicMe.setAttribute("class", "user_pic_chat_me user_pic_chat_me_img")
        userPicMe.setAttribute("src", $("#user_main").attr("src"))
        userPicMe.setAttribute("style", "margin-top:140px")
        meDiv.appendChild(userPicMe);
        messageDiv.appendChild(imgMsg);
        meDiv.appendChild(messageDiv);
        messageWrapper.appendChild(meDiv);
    }
    else {
        var userPicNotMe = document.createElement("img");
        userPicNotMe.setAttribute("class", "user_pic_chat_not_me user_pic_chat_me_img")
        userPicNotMe.setAttribute("src", $("div#" + user_id + " img").attr("src"))
        userPicNotMe.setAttribute("style", "margin-top:140px")
        notMeDiv.appendChild(userPicNotMe);
        messageDiv.appendChild(imgMsg);
        notMeDiv.appendChild(messageDiv);
        messageWrapper.appendChild(notMeDiv);
    }
}

sendImage = (base_image) => {
    socket.emit("send-attachment", { sender: userAuthId, id: socket.id, message: base_image, receiver: window.localStorage.getItem("user_selected"), type: "image" });
}

socket.on("attachment-sent", (data) => {
    console.log("Attachment sent");
})
