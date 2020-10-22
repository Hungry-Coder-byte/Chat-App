const ls = localStorage.getItem("selected");
let selected = false;
var list = document.querySelectorAll(".list"),
    content = document.querySelector(".content"),
    input = document.querySelector(".message-footer input"),
    open = document.querySelector(".open a");

//init
function init() {
    //input.focus();
    let now = 2;
    const texts = ["İyi akşamlar", "Merhaba, nasılsın?",
        "Harikasın! :)", "Günaydın", "Tünaydın",
        "Hahaha", "Öğlen görüşelim.", "Pekala"];
    for (var i = 4; i < list.length; i++) {
        list[i].querySelector(".time").innerText = `${now} day ago`;
        list[i].querySelector(".text").innerText = texts[(i - 4) < texts.length ? (i - 4) : Math.floor(Math.random() * texts.length)];
        now++;
    }
}
init();


open.addEventListener("click", (e) => {
    const sidebar = document.querySelector("sidebar");
    sidebar.classList.toggle("opened");
    if (sidebar.classList.value == 'opened')
        e.target.innerText = "DOWN";
    else
        e.target.innerText = "UP";
});