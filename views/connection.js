angular.module('myApp', [])
    .controller('myCtrl', ['$scope', '$timeout', '$http', '$interval', '$window', function ($scope, $timeout, $http, $interval, $window) {
        $scope.checkAuth = function () {
            if (window.localStorage.getItem("user") != undefined)
                $scope.getAllChats();
            else
                window.location.href = "http://localhost:5001"
        }
        // $scope.user_pic = "https://soe.ukzn.ac.za/wp-content/uploads/2018/04/profile-placeholder.png";
        $scope.getAllChats = function () {
            $scope.no_chat_found = null;
            // document.getElementsByClassName("list-wrap")[0]
            $(".list-wrap").empty();
            // console.log("Inside getAllChats");
            // $http.get('https://4676e84e.ngrok.io/user_chats/' + "7c6de410-8e33-11ea-88ee-b46d830ab42d").then(function (response) {
            var user_id = window.localStorage.getItem("user");
            if ($scope.chat_search == undefined || $scope.chat_search == null || $scope.chat_search.length == 0)
                chat_search = "null";
            else
                chat_search = $scope.chat_search;
            $http.get('http://localhost:5001/user_chats/' + user_id + '/' + chat_search).then(function (response) {
                console.log("response", response.data);
                $scope.allChats = response.data.chats;
                $scope.user_pic = response.data.user_pic;
                $("#user_main").fadeIn("normal");
                createChatCards($scope.allChats);
                setAppTheme()
            })
        }
        function createChatCards(chats) {
            if (chats.length > 0) {
                for (var i = 0; i < chats.length; i++) {
                    var div1 = document.createElement('div');
                    div1.setAttribute('id', chats[i].user_id);
                    div1.setAttribute('class', "list");
                    div1.setAttribute("onClick", "getConversation('" + chats[i].user_id + "')")
                    var img = document.createElement('img');
                    img.setAttribute("src", chats[i].user_pic);
                    img.setAttribute("alt", "");
                    div1.appendChild(img);
                    var div2 = document.createElement("div");
                    div2.setAttribute("class", "info");
                    var span1 = document.createElement("span");
                    span1.setAttribute("class", "user");
                    span1.innerHTML = chats[i].user_name;
                    var span2 = document.createElement("span");
                    span2.innerHTML = chats[i].reply;
                    span2.setAttribute("class", "text");
                    if (chats[i].message_type != 'text') {
                        span2 = document.createElement("i");
                        span2.setAttribute("class", "fa fa-image")
                        // span2.setAttribute("src",chats[i].reply);
                        // <i class="fas fa-image"></i>
                    }
                    var span3 = document.createElement("span");
                    span3.setAttribute("class", "time");
                    var event = new Date(chats[i].time);
                    if (Number(chats[i].direct) == 0) {
                        chats[i].time = event.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
                    } else if (Number(chats[i].direct) > 0 && Number(chats[i].direct) <= 7) {
                        // console.log(chats[i].time)
                        var options = { weekday: 'long' };
                        chats[i].time = event.toLocaleDateString('en-US', options);
                    } else {
                    }
                    span3.innerHTML = chats[i].time;
                    var online_stat = document.createElement("span");
                    if (chats[i].online_status == "Online") {
                        online_stat.setAttribute("class", "online_stat online");
                        online_stat.innerHTML = chats[i].online_status;
                    } else {
                        online_stat.setAttribute("class", "online_stat offline");
                        online_stat.innerHTML = chats[i].online_status;
                    }
                    var expand = document.createElement("span");
                    expand.setAttribute("class", "material-icons expand-more");
                    expand.setAttribute("onClick", "chatMoreOpts(" + i + ")")
                    expand.innerHTML = "expand_more";
                    div2.appendChild(span1);
                    div2.appendChild(span2);
                    div1.appendChild(div2);
                    span3.appendChild(document.createElement("br"));
                    span3.appendChild(online_stat);
                    div1.appendChild(span3);
                    div1.appendChild(expand);
                    var wrapper = document.getElementsByClassName("list-wrap")[0];
                    wrapper.appendChild(div1);
                }
                process();
            } else {
                console.log("No chat found");
                $scope.no_chat_found = "No chats Available";
            }
        }

        //process
        function process() {
            let selected = false;
            var list = document.querySelectorAll(".list");
            if (ls != null) {
                selected = true;
                click(list[ls], ls);
            }

            list.forEach((l, i) => {
                l.addEventListener("click", function () {
                    click(l, i);
                });
            });

            try {
                document.querySelector(".list.active").scrollIntoView(true);
            }
            catch { }

        }

        //list click
        function click(l, index) {
            $('header').css({ "display": "flex" });
            $('.message-wrap').css({ "display": "flex" });
            $('.message-footer').css({ "display": "flex" });
            $('.list').removeClass('active');
            if (l) {
                $('.list').eq(index).addClass('active');
                document.querySelector("sidebar").classList.remove("opened");
                open.innerText = "UP";
                const img = l.querySelector("img").src,
                    user = l.querySelector(".user").innerText,
                    time = l.querySelector(".time").innerText;
                content.querySelector("img").src = img;
                content.querySelector(".info .user").innerHTML = user;

                const inputPH = input.getAttribute("data-placeholder");
                input.placeholder = inputPH.replace("{0}", user.split(' ')[0]);

                document.querySelector(".message-wrap").scrollTop = document.querySelector(".message-wrap").scrollHeight;
            }
        }

        function setAppTheme() {
            if (localStorage.getItem("dark_mode") == "on") {
                $('#dark_switch').prop('checked', true);
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
                $('#fullmodal input').css({ "color": "#ffffff" })
                $("#typing_status").css({ "color": "#ffffff" });
            }
        }

        $scope.searchChat = () => {
            console.log("Inside searchChat", $scope.chat_search);
            if ($scope.chat_search != null && $scope.chat_search.trim().length >= 2)
                $scope.getAllChats();
            else
                $scope.getAllChats(null);
        }
    }]);