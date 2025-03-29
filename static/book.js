const bookName = localStorage.getItem("currentBook")

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


// document.getElementById("uploadConfirm").addEventListener("click",
//     function addListItem(){
//         const chapterListItem = `<li class="list-group-item d-flex justify-content-between align-items-center">
//             something
//             <button type="button" class="btn btn-outline-danger btn-sm" id="delChrItem">刪除</button>
//         </li>`;
//         document.getElementById("chapterList").innerHTML += chapterListItem;
//     }
// );

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



window.onload = function(){
  const title = document.getElementById("title");
  title.innerText = bookName;
  getCover()
}