// var socket = io.connect('http://c2156187c19d.ngrok.io');
var socket = io.connect('http://localhost:5001/');

var userAuthId = window.localStorage.getItem("user");
var page_num = 0;

socket.on('socket-connected', function (data) {
    socket.emit('connected', { user: userAuthId, id: socket.id })
})

socket.on('user-offline', (user) => {
    console.log("User is offline", user);
    console.log("Div found", $("div#" + user.user_id));
    console.log('$("div#"+user.user_id+" .online_stat")', $("div#" + user.user_id + " span .online_stat").html());
    if (user.status == "Online") {
        $("div#" + user.user_id + " span .online_stat").html(user.status);
    } else {
        $("div#" + user.user_id + " span .online_stat").html(user.status);
    }
})

var allChats = [];
socket.on('conversation-got', function (data) {
    data = data.data;
    console.log("Data got is", data);
    var messageWrapper = document.getElementsByClassName("message-wrap")[0];
    content.querySelector(".info .time").innerHTML = data.online_status;
    if (data.allConversations.length > 0) {
        openChatBox();
        $('.content').css({ 'background': "url('" + data.allConversations[0].wallpaper + "')", "background-repeat": "no-repeat", "background-size": "cover", "background-position": "center" })
        allChats = [...allChats, ...data.allConversations];
        messageWrapper.innerHTML = '';
        page_num = data.page_num;
        c = 0;
        for (var i = allChats.length - 1; i >= 0; i--) {
            var notMeDiv = document.createElement("div");
            notMeDiv.setAttribute("class", "message-list speech-bubble");
            var meDiv = document.createElement("div");
            meDiv.setAttribute("class", "message-list me speech-bubble-me");
            var messageDiv = document.createElement("div");
            messageDiv.setAttribute("class", "msg");
            var messagePara = document.createElement("p");
            messagePara.innerHTML = allChats[i].reply;
            if (allChats[i].length != 1 && allChats[i].reply != 'NA') {
                if (allChats[i].user_id == userAuthId) {
                    var userPicMe = document.createElement("img");
                    userPicMe.setAttribute("class", "user_pic_chat_me")
                    userPicMe.setAttribute("src", allChats[i].user_pic)
                    meDiv.appendChild(userPicMe);
                    messageDiv.appendChild(messagePara);
                    meDiv.appendChild(messageDiv);
                    messageWrapper.appendChild(meDiv);
                }
                else {
                    var userPicNotMe = document.createElement("img");
                    userPicNotMe.setAttribute("class", "user_pic_chat_not_me")
                    userPicNotMe.setAttribute("src", allChats[i].user_pic)
                    notMeDiv.appendChild(userPicNotMe);
                    messageDiv.appendChild(messagePara);
                    notMeDiv.appendChild(messageDiv);
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
    var messageWrapper = document.getElementsByClassName("message-wrap")[0];
    var notMeDiv = document.createElement("div");
    notMeDiv.setAttribute("class", "message-list speech-bubble");
    var meDiv = document.createElement("div");
    meDiv.setAttribute("class", "message-list me speech-bubble-me");
    var messageDiv = document.createElement("div");
    messageDiv.setAttribute("class", "msg");
    var messagePara = document.createElement("p");
    messagePara.innerHTML = message.message;
    if (message.sender == userAuthId) {
        var userPicMe = document.createElement("img");
        userPicMe.setAttribute("class", "user_pic_chat_me")
        userPicMe.setAttribute("src", message.sender_pic)
        meDiv.appendChild(userPicMe);
        messageDiv.appendChild(messagePara);
        meDiv.appendChild(messageDiv);
        messageWrapper.appendChild(meDiv);
    }
    else {
        var userPicNotMe = document.createElement("img");
        userPicNotMe.setAttribute("class", "user_pic_chat_not_me")
        userPicNotMe.setAttribute("src", message.sender_pic)
        notMeDiv.appendChild(userPicNotMe);
        messageDiv.appendChild(messagePara);
        notMeDiv.appendChild(messageDiv);
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
    },3000);
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
    console.log("Key typing in process");
    socket.emit('typing', { user_id: userAuthId, receiver: window.localStorage.getItem("user_selected"), typing: true });
    clearTimeout(timeout)
    timeout = setTimeout(timeoutFunction, 2000)
})

socket.on('typing', function (data) {
    console.log("User is typing", data);
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
    console.log("top position", $('.list').eq(pos).position())
    if ($("#chat_opts").css("display") == "none" || current_chat_pos != pos)
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

uploadProfileImage = (base_image) => {
    console.log("Base64 is", base_image);
    socket.emit("update-profile-pic", { user: userAuthId, id: socket.id, image_data: base_image });
}

socket.on("profile-pic-uploaded", (data) => {

})


