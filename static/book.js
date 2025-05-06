const book_data = JSON.parse(localStorage.getItem("currentBookData"))
const bookName = book_data.bookName

const coverImg = document.querySelector(".cover"); // 取得 <img>
const coverUpload = document.getElementById("coverUpload"); // 取得 <input>

coverImg.addEventListener("click", () => {
  coverUpload.click(); // 🔥 觸發上傳檔案視窗
});

coverUpload.addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("cover", file);
  formData.append("bookName", bookName);
  
  fetch("/api/user/book/uploadCover", {
      method: "POST",
      body: formData,
      credentials: "include"
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      getCover(bookName);
    } else {
      alert("上傳失敗");
    }
  })
  .catch(error => console.error("上傳錯誤:", error));

});

document.getElementById("startReading").addEventListener("click",e=>{
  window.location.href = "/reading";
});

function getCover(){
  const cover = document.getElementById('cover');
  fetch("/api/user/book/getCover",{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName:bookName }),
        credentials:"include"
    })
    .then(response => response.blob())
    .then(blob => {
        // 將圖片的 Blob 轉為 Object URL
        cover.src = URL.createObjectURL(blob);
    })
    .catch(error => {
        console.error('Error fetching cover:', error);
    });
}
// document.getElementById("chapterList").addEventListener("dblclick", function (event) {
//   if (event.target.tagName === "LI") {
//     let text = event.target.firstChild.textContent.trim();
//     console.log("你雙擊了：" + text);
//   }
// });
document.getElementById("uploadConfirm").addEventListener('click',e=>{
  uploadFiles();
});
function uploadFiles() {
  const input = document.getElementById('fileInput');
  const files = input.files;

  if (!files.length) {
    alert("請選擇檔案");
    return;
  }

  const formData = new FormData();
  formData.append("bookName", bookName);
  for (const file of files) {
      if (file.type === "text/plain") {
        formData.append("files", file);
      } else {
        alert(`${file.name} 不是 .txt 檔案，已跳過`);
      }
  }

  fetch('api/user/book/uploadChr', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  })
  .then(res => res.json())
  .then(data => {
    console.log("伺服器回傳：", data);
    book_data['order'] = data["saved"];
    localStorage.setItem("currentBookData",JSON.stringify(book_data));
    refleshRenderChr();
    saveNewData();
  })
  .catch(err => {
      console.error("上傳錯誤：", err);
  });
}


function addListItem(listString){
  const chapterListItem = `<li class="list-group-item d-flex justify-content-between align-items-center">
      ${listString}
      <button type="button" class="btn btn-outline-danger btn-sm" id="delChrItem">刪除</button>
  </li>`;
  document.getElementById("chapterList").innerHTML += chapterListItem;
}

function refleshRenderChr(){
  book_data['order'].forEach(element => {
    addListItem(element);
  });
}

let deleteTarget = null; // 記錄要刪除的項目

document.getElementById("chapterList").addEventListener("click", function (event) {
  if (event.target.id === "delChrItem") {
    deleteTarget = event.target.closest("li"); // 記錄要刪除的 <li>
    let modal = new bootstrap.Modal(document.getElementById("deleteConfirmModal"));
    modal.show(); // 顯示 Modal
  }
});

// 按下「確定刪除」後，真正刪除 <li>
document.getElementById("confirmDelete").addEventListener("click", function () {
  if (deleteTarget) {
    deleteTarget.remove();
    deleteTarget = null; // 清空記錄
  }
  let modalElement = document.getElementById("deleteConfirmModal");
  let modalInstance = bootstrap.Modal.getInstance(modalElement);
  modalInstance.hide(); // 手動關閉 Modal
});

function deleteChr(bookName){

}

function renameChr(){

}

function updateFolderNameInUserData(oldName, newName) {
  const userDataRaw = localStorage.getItem('userData');
  if (!userDataRaw) return;

  const userData = JSON.parse(userDataRaw);
  const folders = userData.folders;

  const index = folders.indexOf(oldName);
  if (index !== -1) {
    folders[index] = newName;
    userData.folders = folders;
    localStorage.setItem('userData', JSON.stringify(userData));
  }
}


function renameBookFolder(newName) {
  fetch('/api/user/renameBookFolder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      newName: newName,
      oldName: bookName
    }),
    credentials: 'include'
  })
  .then(async response => {
    if (response.ok) {
      const bookData = await response.json();
      updateFolderNameInUserData(bookName,newName);
      localStorage.setItem("currentBookData", JSON.stringify(bookData));
      saveNewData();
      document.getElementById("title").innerHTML = newName;
    } else {
      const error = await response.json();
      console.error('伺服器錯誤:', error);
    }
  })
  .catch(error => {
    console.error('連線錯誤:', error);
  });
}

async function saveNewData() {
  fetch('/api/user/book/saveBookData',{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentBookData: book_data
      }),
      credentials:"include"
  })
  .then(response => console.log(response))
  .catch(error => console.log(error));
}

function initProgress(){
  const chrList = book_data.order;
  if(chrList){
    alert('沒有章節');
    return;
  }
  book_data.progress = {[chrList[0]]:0}
  localStorage.setItem("currentBookData", JSON.stringify(book_data));
  console.log(localStorage.getItem("currentBookData"))
  saveNewData();
}

window.onload = function(){
  const title = document.getElementById("title");
  title.innerText = bookName;
  getCover();
  refleshRenderChr();
}