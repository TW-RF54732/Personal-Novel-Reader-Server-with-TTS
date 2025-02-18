function getAvatar(){
    
}
function addFolder() {
    const name = document.getElementById('folderName').value.trim();
    if (name) {
        const bookList = document.getElementById('bookList');
        const div = document.createElement('div');
        div.className = "p-4 bg-white shadow rounded flex justify-between";
        div.innerHTML = `<span class='font-medium'>📂 ${name}</span> <button onclick='this.parentElement.remove()' class='text-red-500'>刪除</button>`;
        bookList.appendChild(div);
        document.getElementById('folderName').value = '';
    }
}