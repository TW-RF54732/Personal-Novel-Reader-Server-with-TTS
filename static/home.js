let edit_mode = false

document.getElementById('addBookForm').onsubmit = (e) => {
    e.preventDefault();
    const bookName = document.getElementById('bookNameInput').value.trim();
    document.getElementById('bookNameInput').value = '';
    creatFolder(bookName);
};
function switchMode(){
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
async function uploadNewData() {
    fetch('/api/user/saveData',{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: localStorage.getItem("userData"),
        credentials:"include"
    })
    .then(response => console.log(response))
    .catch(error => console.log(error));
}

function getCover(bookName) {
    return fetch("/api/user/book/getCover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName: bookName }),
        credentials: "include"
    })
    .then(response => {
        if (!response.ok) throw new Error("封面圖片請求失敗");
        return response.blob();
    })
    .then(blob => URL.createObjectURL(blob)) // 轉換成本地 URL
    .catch(error => {
        console.error("Error fetching cover:", error);
        return "fallback-image.jpg"; // 若請求失敗，回傳預設圖片
    });
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
            let userData = JSON.parse(localStorage.getItem("userData"))
            if (!userData.folders.includes(folderName)) {
                userData.folders.push(folderName);
                localStorage.setItem("userData", JSON.stringify(userData));
                console.log(`✅ 已新增 "${folderName}" 到 folders`);
            } else {
                console.log(`⚠️ "${folderName}" 已存在於 folders`);
            }
            uploadNewData();
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
        alert("網路或伺服器錯誤")
        return 400;
    });
    
}

async function deleteFolder(folderName) {
    userData = JSON.parse(localStorage.getItem("userData"))

    if(userData.folders.includes(folderName)){
        await fetch('/api/user/deleteFolder',{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folderName }),
            credentials:"include"
        }).then(async response =>{
            if(response.ok){
                console.log("delete successful");
                userData.folders = userData.folders.filter(book => book!==folderName);
                console.log(`New folder is ${userData.folders}`);
                localStorage.setItem("userData", JSON.stringify(userData));
                uploadNewData();//need to make sure upload successful
                //if uploaded
                reflashRenderFolders();
            }
            else{
                console.log("Delete request fail successfully")
            }
        })
    }
    else{
        console.log("no such a file");
    }
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
            <img src="http://img.wenku8.com/image/3/3714/3714s.jpg" draggable="false" class="card-img-top cover">
            <h5 class="card-title">${book}</h5>
            <h6 class="card-subtitle mb-2 text-muted">2025/3/19</h6>
        </div>
    `;
    //設定封面

    const imgElement = card.querySelector("img");

    // 動態獲取封面圖片
    getCover(book).then(imageUrl => {
        imgElement.src = imageUrl; // ✅ 設定圖片來源
    });

    // 點擊卡片的事件
    card.onclick = () => getBookData(col.dataset.folderName);

    col.appendChild(card);
    bookList.appendChild(col);
    if(edit_mode){
        initSortable();
    }
}

function getBookData(folderName){
    fetch('/api/user/book/getBookData',{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName }),
        credentials:"include"
    }).then(async response =>{
        if (response.ok) {
            const responseJson = await response.json()
            localStorage.setItem("currentBookData", JSON.stringify(responseJson)); // 儲存書籍名稱
            window.location.href = "/book"; // 跳轉到 /book 頁面
        } else {
            let errorData = await response.json();
            alert("錯誤：" + errorData.error);
        }
    })
}

function reflashRenderFolders(){
    document.getElementById("bookList").innerHTML = '';
    const userData = JSON.parse(localStorage.getItem("userData"));
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
    uploadNewData();
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
        if(sortable){
            sortable.destroy();
            sortable = undefined;
        }
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
    window.location.href = "/login";
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
    location.reload()
}

//setup
window.onload = function(){
    getData();
    getAvatar();
    // initSortable();
}