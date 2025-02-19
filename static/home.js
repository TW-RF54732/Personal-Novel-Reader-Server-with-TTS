document.getElementById('addFolderBtn').addEventListener('click',()=>{
    const name = document.getElementById('folderName').value.trim();
    if (name) {
        const bookList = document.getElementById('bookList');
        const div = document.createElement('div');
        div.className = "p-4 bg-white shadow rounded flex justify-between";
        div.innerHTML = `<span class='font-medium'>📂 ${name}</span> <button onclick='this.parentElement.remove()' class='text-red-500'>刪除</button>`;
        bookList.appendChild(div);
        document.getElementById('folderName').value = '';
    }
})

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
getAvatar();
