document.getElementById('addFolderBtn').addEventListener('click',()=>{
    const name = document.getElementById('folderName').value.trim();
    if (name) {
        const bookList = document.getElementById('bookList');
        const div = document.createElement('div');
        div.className = "p-4 bg-white shadow rounded flex justify-between";
        div.innerHTML = `<span class='font-medium'>📂 ${name}</span> <button onclick="deleteFolder(this.parentElement)" class='text-red-500'>刪除</button>`;
        bookList.appendChild(div);
        document.getElementById('folderName').value = '';
        creatFolder(name);
    }
})

//function
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
    applySetting(settings);
}
async function creatFolder(folderName) {
    await fetch('/api/user/creatFolder',{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName }),
        credentials:"include"
    })
}
async function deleteFolder(element) {
    
}

function applySetting(data){
    console.log("username:",data.username);
    console.log("settings:",data.settings.autoRead);
    console.log("theme:",data.settings.theme);
}

//setup
getAvatar();
getSetting()