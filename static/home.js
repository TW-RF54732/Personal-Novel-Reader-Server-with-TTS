let bookArray = [];

document.getElementById('addBookForm').onsubmit = (e) => {
    e.preventDefault();
    const bookName = document.getElementById('bookNameInput').value.trim();
    document.getElementById('bookNameInput').value = '';
    creatFolder(bookName);
};

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

async function getSetting() {
     const response = await fetch("/api/user/getSetting",{
        method: "GET",
        credentials:"include"
    });
    if (!response.ok) {
        console.error("無法獲取 data.json");
        return;
    }
    const settings = await response.json();
    localStorage.setItem("userSettings", JSON.stringify(settings));  // 存入 localStorage
    //applySetting(settings);
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

}

// async function deleteFolder(element) {
//     folderName = element.id;
//     fetch('/api/user/deleteFolder',{
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ folderName }),
//         credentials:"include"
//     });
//     element.remove();
// }
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
            <h5 class="card-title">${book}</h5>
            <img src="http://img.wenku8.com/image/3/3714/3714s.jpg" draggable="false">
        </div>
    `;
    // 點擊卡片的事件
    card.onclick = () => alert(`打開「${book}」`);

    col.appendChild(card);
    bookList.appendChild(col);
    initSortable()
}
function reflashRenderFolders(){
    document.getElementById("bookList").innerHTML = '';
    for(let i = 0;i<bookArray.length;i++){
        addRenderFolder(bookArray[i]);
    }
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
    bookArray = data.folders;
    return data.folders;

}

function updateOrder(){
    let newOrder = [];
    
    document.querySelectorAll('.bookFolder').forEach((element) => {
        let bookName = element.dataset.folderName;
        newOrder.push(bookName);
    });
    bookArray = newOrder;
    console.log(bookArray);
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
async function loadFolders() {
    let f=[];
    f = await getFolders();
    if(!f){return "error";}

    f.forEach(element => {
        addRenderFolder(element);
    });
}

//setup
window.onload = function(){
    initSortable();
    loadFolders();
    getAvatar();
    getSetting()
}