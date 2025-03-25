let edit_mode = false

document.getElementById('addBookForm').onsubmit = (e) => {
    e.preventDefault();
    const bookName = document.getElementById('bookNameInput').value.trim();
    document.getElementById('bookNameInput').value = '';
    creatFolder(bookName);
};
function a(){
    console.log(`edit mode:${edit_mode}`)
    switch_edit_mode();
}

//setup function
function getAvatar(){
    avatar = document.getElementById('avatar')
    fetch("/api/user/getAvatar", {
        method: "GET",
        credentials: "include"  // 允許 Cookie 傳輸
    })
    .then(response => response.blob())
    .then(blob => {
        // 將圖片的 Blob 轉為 Object URL
        avatar.src = URL.createObjectURL(blob);
    })
    .catch(error => {
        console.error('Error fetching avatar:', error);
    });
}

async function getData() {
     const response = await fetch("/api/user/getData",{
        method: "GET",
        credentials:"include"
    });
    if (!response.ok) {
        console.error("無法獲取 data.json");
        return;
    }
    const data = await response.json();
    localStorage.setItem("userData", JSON.stringify(data));  // 存入 localStorage
    //applySetting(settings);

    reflashRenderFolders();
}
async function saveData() {
    fetch('/api/user/saveData',{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: localStorage.getItem("userData"),
        credentials:"include"
    })
    .then(response => console.log(response))
    .catch(error => console.log(error));
}
//setup function--

//folder
async function creatFolder(folderName) {
    fetch('/api/user/creatFolder',{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName }),
        credentials:"include"
    })
    .then(async response => {
        console.log("HTTP 狀態碼:", response.status);  // 取得狀態碼 (如: 200, 409, 400)
    
        if (response.ok) {
            const data = await response.json();
            console.log("成功回應:", data);
            addRenderFolder(folderName);
        } else {
            const errorData = await response.json();
            console.error("錯誤回應:", errorData);
            if (response.status === 409) {
                alert("資料夾已存在");
            } else {
                alert("發生錯誤: " + errorData.error);
            }
        }
    })
    .catch(error => {
        console.error("網路或伺服器錯誤", error);
        return 400;
    });
    let userData = JSON.parse(localStorage.getItem("userData"))
    if (!userData.folders.includes(folderName)) {
        userData.folders.push(folderName);
        localStorage.setItem("userData", JSON.stringify(userData));
        console.log(`✅ 已新增 "${folderName}" 到 folders`);
    } else {
        console.log(`⚠️ "${folderName}" 已存在於 folders`);
    }

    saveData();
}

async function deleteFolder(folderName) {
    fetch('/api/user/deleteFolder',{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName }),
        credentials:"include"
    });
}
function addRenderFolder(book) {//books: string array of book name
    if(!book){return "error";}
    const bookList = document.getElementById('bookList');

    const col = document.createElement('div');
    col.className = 'col-md-3 bookFolder';
    col.dataset.folderName = book;

    const card = document.createElement('div');
    card.className = 'card book-card';
    card.innerHTML = `
        <div class="card-body">
            <img src="http://img.wenku8.com/image/3/3714/3714s.jpg" draggable="false" class="card-img-top">
            <h5 class="card-title">${book}</h5>
            <h6 class="card-subtitle mb-2 text-muted">2025/3/19</h6>
        </div>
    `;
    // 點擊卡片的事件
    card.onclick = () => alert(`打開「${book}」`);

    col.appendChild(card);
    bookList.appendChild(col);
    if(edit_mode){
        initSortable();
    }
}
function reflashRenderFolders(){
    document.getElementById("bookList").innerHTML = '';
    let userData = JSON.parse(localStorage.getItem("userData"));
    userData.folders.forEach(element => {
        addRenderFolder(element);
    });
}

async function getFolders() {//return folder name array(string)
    const response = await fetch("/api/user/getFolders", {
        method: "GET",
        credentials: "include" // 讓請求帶上 JWT Cookie
    });

    if (!response.ok) {
        console.error("無法獲取資料夾列表");
        return;
    }

    const data = await response.json();
    let userData = JSON.parse(localStorage.getItem("userData"));
    userData.folders = data.folders;
    localStorage.setItem("userData",stringify(userData));
    return data.folders;

}

async function updateOrder(){
    const bookList = document.getElementById('bookList');
    let newOrder = [];
    
    bookList.querySelectorAll('.bookFolder').forEach((element) => {
        let bookName = element.dataset.folderName;
        newOrder.push(bookName);
    });
    bookArray = newOrder;
    let userData = JSON.parse(localStorage.getItem("userData"));
    userData.folders = newOrder;
    localStorage.setItem("userData", JSON.stringify(userData));
    saveData();
}
//folder--

//in folder

//in folder--

let sortable;
function initSortable() {
    if (sortable) {
        sortable.destroy(); // 先銷毀舊的 Sortable 實例
    }
    sortable = new Sortable(document.getElementById('bookList'), {
        animation: 150,
        ghostClass: 'sortable-ghost',
        handle: ".book-card", // 讓整個 .book-card 可以拖曳
        onEnd: function (evt) {
            updateOrder();
        }
    });
}

function switch_edit_mode(){
    if(edit_mode){
        edit_mode = false;
        sortable.destroy();
    }
    else{
        edit_mode = true;
        initSortable();
    }
}

async function initUser(password) {
    await fetch('/api/user/initUser',{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials:"include"
    })
}

function applySetting(data){//unfinish
    console.log("username:",data.username);
    console.log("settings:",data.settings.autoRead);
    console.log("theme:",data.settings.theme);
}


async function logout() {
    await fetch("/api/logout", {
        method: "POST",
        credentials: "include"  // 讓 Cookie 被正確刪除
    });
}

//setup
window.onload = function(){
    getData();
    getAvatar();
    // initSortable();
}