document.getElementById('addFolderBtn').addEventListener('click',()=>{
    const name = document.getElementById('folderName').value.trim();
    if (name) {
        addFolder(name,true);
    }
})
document.getElementById("bookList").addEventListener("click", function(event) {
    if (event.target.classList.contains("delete-btn")) {
        deleteFolder(event.target.parentElement);  // 傳入父元素
    }
    else if(event.target.classList.contains("folder")){
        alert("comming soon~");
        console.log("Nah, the devloper is noob,duno how to do it.");
    }
});

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

async function loadFolder(){
    const folders = await getFolders()
    for(let i = 0;i<folders.length;i++){
        addFolder(folders[i],false);
    }
}
//setup function--

//folder
async function creatFolder(folderName) {
    const response = await fetch('/api/user/creatFolder',{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName }),
        credentials:"include"
    });
    if(!response.ok){
        alert('創建失敗');
    }
}

async function deleteFolder(element) {
    folderName = element.id;
    fetch('/api/user/deleteFolder',{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName }),
        credentials:"include"
    });
    element.remove();
}

function addFolder(name,creat){
    if (name) {
        try {
            const bookList = document.getElementById('bookList');
            const div = document.createElement('div');
            div.className = "p-4 bg-white shadow rounded flex justify-between folder clickable";
            div.id = name;
            div.innerHTML = `<span class='font-medium'>📂 ${name}</span> <button class='text-red-500 delete-btn'>刪除</button>`;
            bookList.appendChild(div);
            document.getElementById('folderName').value = '';
            if(creat){
                creatFolder(name);
            }
        } catch (error) {
            alert('錯誤');
        }
    }
}

async function getFolders() {
    const response = await fetch("/api/user/getFolders", {
        method: "GET",
        credentials: "include" // 讓請求帶上 JWT Cookie
    });

    if (!response.ok) {
        console.error("無法獲取資料夾列表");
        return;
    }

    const data = await response.json();
    return data.folders;

}
//folder--

//in folder

//in folder--



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
    loadFolder();
    getAvatar();
    getSetting()
}