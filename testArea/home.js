document.addEventListener("DOMContentLoaded", () => {
    loadUserData();
    loadBookList();
});

// **🔹 1. 載入使用者資料**
function loadUserData() {
    fetch("/api/user", { credentials: "include" })  // JWT 在 Cookie 裡
        .then(res => res.json())
        .then(data => {
            document.getElementById("username").textContent = data.username;
        })
        .catch(() => {
            document.getElementById("username").textContent = "無法載入";
        });
}

// **🔹 2. 載入書櫃**
function loadBookList() {
    fetch("/api/books", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            const bookList = document.getElementById("book-list");
            bookList.innerHTML = "";
            data.books.forEach(book => {
                const bookItem = document.createElement("div");
                bookItem.classList.add("book-item");
                bookItem.textContent = book.name;
                bookItem.onclick = () => openBook(book.id);
                bookList.appendChild(bookItem);
            });
        })
        .catch(() => {
            document.getElementById("book-list").textContent = "無法載入書籍";
        });
}

// **🔹 3. 上傳小說**
function uploadBook() {
    const fileInput = document.getElementById("upload-book");
    if (!fileInput.files.length) {
        alert("請選擇一本小說");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    fetch("/api/books/upload", {
        method: "POST",
        body: formData,
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        loadBookList();  // 重新載入書櫃
    })
    .catch(() => alert("上傳失敗"));
}

// **🔹 4. 開啟小說**
function openBook(bookId) {
    window.location.href = `/reading/${bookId}`;
}
