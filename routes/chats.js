var DB = require('../DB').DB;
var TOTP = require('onceler').TOTP;

var validateUser = function (phone, res) {
    console.log("validate number", phone);
    DB.query("select * from user_details where phone = $1", phone)
        .then(function (check) {
            generateOtp(phone, function (otpSent) {
                res.sendFile(__dirname + '/views/otp_form.html')
            })
        })
}

function generateOtp(phone, callback) {
    var d1 = new Date();
    var uid = d1.getTime() % 1000000;
    var Pid1 = phone + uid;
    var code = new TOTP(Pid1, 6, 300);
    var Otp = code.now();
    var i = 0;
    while ((Otp.toString().length != 6) && (i < 60)) {
        d1 = new Date();
        uid = d1.getTime() % 1000000;
        Pid1 = phone + uid;
        code = new TOTP(Pid1, 6, 300);
        Otp = code.now();
        console.log('OTP CODE is', Otp);
        i++;
    }
    if ((Otp.toString().length == 6)) {
        DB.query("delete from otp_phone where phone = $1", phone.toString())
            .then(function (deleted) {
                console.log("Otp generated", Otp);
                DB.query("insert into otp_phone values($1,$2)", [phone, Otp])
                    .then(function (otp_saved) {
                        callback(1)
                    }).catch(function (error) {
                        console.log("Error while generating otp", error);
                        callback(null);
                    })
            })
    }
}

module.exports.validateUser = validateUser;

var verifyOtp = function (req, res) {
    console.log("Inside verifyOtp", req.params);

    DB.query("select * from otp_phone where phone = $1 and otp = $2", [req.params.phone, req.params.otp])
        .then(function (check) {

            if (check.length > 0) {
                DB.query("select user_id from user_details where phone = $1", req.params.phone)
                    .then(function (user_id) {
                        if (user_id.length > 0)
                            res.send(user_id[0].user_id);
                        else
                            res.send("null");
                    })
            }
            else {
                res.send('http://localhost:5001/error_page.html')
            }
        })
}

module.exports.verifyOtp = verifyOtp;

var create_new_user = function (req, res, next) {
    console.log("Inside create_new_user", req.body);

    createNewUser(req.body, function (user_id) {
        res.send(user_id);
    })
}

module.exports.create_new_user = create_new_user;

var getChats = function (req, res, next) {
    console.log("Inside getChats", req.params.user_id);
    var finalData = {};
    DB.query("select user_pic from user_details where user_id = $1", req.params.user_id)
        .then(function (user_pic) {
            finalData.user_pic = user_pic[0].user_pic;
            DB.query("SELECT distinct on (phone) phone,initcap(U.user_name) as user_name,U.user_pic,U.user_id,C.c_id,R.reply,R.time\
        FROM user_details U,conversation C, conversation_reply R\
        WHERE \
        CASE\
        WHEN C.user_one = $1\
        THEN C.user_two = U.user_id\
        WHEN C.user_two = $1\
        THEN C.user_one= U.user_id\
        END\
        AND\
        C.c_id=R.c_id\
        AND\
        (C.user_one =$1 OR C.user_two =$1) and reply != 'NA' ORDER BY phone,R.time DESC", req.params.user_id)
                .then(function (userChats) {
                    finalData.chats = userChats;
                    res.send(finalData);
                }).catch(function (error) {
                    console.log("Error while getting user chats", error);
                    res.send(finalData);
                })
        }).catch(function (error) {
            console.log("Error while getting user pic", error);
            res.send(finalData);
        })
}

module.exports.getChats = getChats;

var updateUserSocketId = function (user) {
    console.log("Inside updateUserSocketId", user);
    DB.query("update user_details set socket_id = $1 where user_id = $2", [user.id, user.user]);
}

module.exports.updateUserSocketId = updateUserSocketId;

var getConversations = function (user, socket, io) {
    console.log("Inside getConversations", user.user_id, user.page_num);
    var limit = 20;
    var offset = limit * ((user.page_num + 1) - 1)
    DB.query("select CR.user_id,CR.time,CR.reply,U.user_pic,C.wallpaper from conversation_reply CR,conversation C,user_details U where CR.c_id = C.c_id and U.user_id = CR.user_id and ((user_one = $1 or  user_two = $1) and (user_one = $4 or  user_two = $4)) order by time desc limit $2 offset $3", [user.user_id, limit, offset, user.user])
        .then(function (allConversations) {
            console.log("All conversationss", allConversations);
            var data = {};
            data.allConversations = allConversations;
            data.page_num = user.page_num + 1;
            io.to(socket.id).emit('conversation-got', { data });
        }).catch(function (error) {
            console.log("Error while getting user chats", error);
        })
}

module.exports.getConversations = getConversations;

var sendMessage = function (message_details, io) {
    console.log("Inside sendMessage");
    getConversationId(message_details, function (cid) {
        if (cid != null) {
            saveConversationReply(cid, message_details, function (reply_saved) {
                if (reply_saved != null) {
                    getReceiverSocketId(message_details.receiver, function (receiver_socket) {
                        getSenderPic(message_details.sender, function (sender_pic) {
                            message_details.sender_pic = sender_pic;
                            io.to(receiver_socket).emit('new-message', message_details);
                            io.to(message_details.socket_id).emit('new-message', message_details);
                            console.log("Message sent");
                        })
                    })
                } else {
                    io.to(message_details.socket_id).emit('error-occured', "could not send message to user");
                }
            })
        } else {
            io.to(message_details.socket_id).emit('error-occured', "could not send message to user");
        }
    })
}

function getSenderPic(user_id, callback) {
    console.log("Inside getSenderPic");

    DB.query("select user_pic from user_details where user_id = $1", user_id)
        .then(function (user_pic) {
            callback(user_pic[0].user_pic);
        }).catch(function (error) {
            console.log("Error while getting user pic", error);
            callback(null);
        })
}

function getConversationId(message, callback) {
    console.log("Inside getConversationId");
    DB.query("select c_id from conversation where (user_one = $1 and user_two = $2) or (user_one = $2 and user_two = $1)", [message.sender, message.receiver])
        .then(function (existingConversation) {
            if (existingConversation.length > 0)
                callback(existingConversation[0].c_id);
            else {
                createNewConversation(message, function (cid) {
                    console.log("New C_id generated", cid);
                    callback(cid);
                })
            }
        }).catch(function (error) {
            console.log("Error while checking conversation", error);
            callback(null);
        })
}

function createNewConversation(message, callback) {
    console.log("Inside createNewConversation");
    DB.query("insert into conversation values(default,$1,$2) returning c_id", [message.sender, message.receiver])
        .then(function (newCid) {
            callback(newCid[0].c_id);
        }).catch(function (error) {
            console.log("Error while creating new conversation", error);
            callback(null);
        })
}

function saveConversationReply(cid, message, callback) {
    console.log("Inside saveConversationReply", cid);
    DB.query("insert into conversation_reply  values(default,$1,$2,$3)", [message.message, message.sender, cid])
        .then(function (reply_saved) {
            callback(1);
        }).catch(function (error) {
            console.log("Error while saving reply", error);
            callback(null);
        })
}

function getReceiverSocketId(user_id, callback) {
    console.log("Inside getReceiverSocketId", user_id);

    DB.query("select socket_id from user_details where user_id = $1", user_id)
        .then(function (receiver_socket) {
            console.log("Receiver socket", receiver_socket);
            if (receiver_socket.length > 0)
                callback(receiver_socket[0].socket_id)
            else
                callback(null);
        }).catch(function (error) {
            console.log("Error while getting receiver socket id", error);
            callback(null);
        })
}

module.exports.sendMessage = sendMessage;

var createVideoRoom = function (user_details, io, socket) {
    console.log("Inside createVideoRoom");
    var data = {};
    var room_name = user_details.sender + "" + Date.now();
    console.log("Room name", room_name);
    data.room_name = room_name;
    data.sender = user_details.sender;
    getUserName(user_details.sender, function (sender_name) {
        data.sender_name = sender_name;
        getUserName(user_details.receiver, function (receiver_name) {
            data.receiver_name = receiver_name;
            getReceiverSocketId(user_details.receiver, function (socket_id) {
                io.to(user_details.socket_id).emit('join-room', { data });
                io.to(socket_id).emit('join-room', { data });
            })
        })
    })
}
function getUserName(user_id, callback) {
    console.log("Inside getUserName", user_id);
    DB.query("select user_name from user_details where user_id = $1", user_id)
        .then(function (user) {
            callback(user[0].user_name);
        }).catch(function (error) {
            callback("unknown");
        })
}
module.exports.createVideoRoom = createVideoRoom;

var getUserContacts = function (user_id, io) {
    DB.query("select distinct on (user_id) user_id,initcap(user_name) as user_name,phone,user_pic from conversation,user_details where ((user_details.user_id = user_one or user_details.user_id =  user_two) and (user_one = $1 or user_two = $1)) and user_id != $1", user_id)
        .then(function (contacts) {
            getUserSocketId(user_id, function (socket_id) {
                io.to(socket_id).emit('all-contacts', contacts);
            })
        }).catch(function (error) {
            console.log("Error while getting contacts", error);
            io.to(socket_id).emit('all-contacts', []);
        })
}

function getUserSocketId(user_id, callback) {
    DB.query("select socket_id from user_details where user_id = $1", user_id)
        .then(function (socket) {
            callback(socket[0].socket_id);
        }).catch(function (error) {
            console.log("Error while getting user socket", error);
            callback(null);
        })
}

module.exports.getUserContacts = getUserContacts;

var createContact = (contact, io) => {
    console.log("Inside createContact");

    checkUser(contact.phone, function (user) {
        if (user == null) {

        } else if (user == 0) {
            createNewUser(contact, function (user_created, user_pic) {
                var data = {};
                data.sender = contact.user_id;
                data.receiver = user_created;
                contact.user_pic = user_pic;
                getReceiverSocketId(contact.user_id, function (receiver_socket) {
                    createNewConversation(data, function (conv_id) {
                        createSampleReply(data, conv_id, function (replyCreated) {
                            io.to(receiver_socket).emit('contact-created', contact);
                        })
                    });
                });
            })
        } else {
            var data = {};
            data.sender = contact.user_id;
            data.receiver = user;
            createNewConversation(data, function (conv_id) {
                console.log("Conversation id created", conv_id);
            });
        }
    })
}

function createSampleReply(ids, conv_id, callback) {
    console.log("Inside createSampleReply");

    DB.query("insert into conversation_reply values(default,'NA',$1,$2)", [ids.sender, conv_id])
        .then(function (replyCreated) {
            callback(1);
        }).catch(function (error) {
            console.log("Error while creating sample reply", error);
            callback(null);
        })
}

function checkUser(phone, callback) {
    DB.query("select user_id from user_details where phone = $1", phone)
        .then(function (check) {
            if (check.length > 0)
                callback(check[0].user_id);
            else
                callback(0);
        }).catch(function (error) {
            console.log("Error while checking existing user", error);
            callback(null);
        })
}

function createNewUser(contact, callback) {
    console.log("Inside createNewUser");

    DB.query("insert into users values(default,$1,'NA','NA') returning user_id", contact.contact_name)
        .then(function (user_id) {
            DB.query("insert into user_details values($1,$2,$3) returning user_pic", [user_id[0].user_id, contact.contact_name, contact.phone])
                .then(function (userCreated) {
                    callback(user_id[0].user_id, userCreated[0].user_pic);
                }).catch(function (error) {
                    console.log("Error while creating user details", error);
                    callback(null, null);
                })
        }).catch(function (error) {
            console.log("Error while creating user", error);
            callback(null, null);
        })
}

module.exports.createContact = createContact;

const deleteChat = async(chat,io) =>{
    console.log("I am in deleteChat",chat);
    await chatDelete(chat);
    // io.to(chat.socket_id).emit('chat-deleted', chat);
    io.to(chat.socket_id).emit('chat-deleted', { chat });
}

chatDelete = (chat) =>{
    return new Promise(resolve =>{
        DB.query("delete from conversation_reply  where c_id  in(select c_id from conversation where (user_one = $1 and user_two = $2) or (user_one = $2 and user_two = $1))",[chat.user_id,chat.delete_chat_id])
        .then((chat_deleted) =>{
            console.log("chat deleted");
        }).catch((error) => {
            console.log("Error while deleting chat",error);
            // resolve(-1)
        })
    })
}

module.exports.deleteChat = deleteChat;