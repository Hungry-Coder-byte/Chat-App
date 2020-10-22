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
            // console.log("Inside getAllChats");
            // $http.get('https://4676e84e.ngrok.io/user_chats/' + "7c6de410-8e33-11ea-88ee-b46d830ab42d").then(function (response) {
            var user_id = window.localStorage.getItem("user");
            $http.get('http://localhost:5001/user_chats/' + user_id).then(function (response) {
                console.log("response", response.data);
                $scope.allChats = response.data.chats;
                $scope.user_pic = response.data.user_pic;
                $("#user_main").fadeIn("normal");
                createChatCards($scope.allChats);
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
                    span2.setAttribute("class", "text");
                    span2.innerHTML = chats[i].reply;
                    var span3 = document.createElement("span");
                    span3.setAttribute("class", "time");
                    span3.innerHTML = chats[i].time;
                    var expand = document.createElement("span");
                    expand.setAttribute("class","material-icons expand-more");
                    expand.innerHTML = "expand_more";
                    div2.appendChild(span1);
                    div2.appendChild(span2);
                    div1.appendChild(div2);
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
    }]);