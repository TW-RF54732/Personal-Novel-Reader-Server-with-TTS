document.getElementById("uploadConfirm").addEventListener("click",
    function addListItem(){
        const chrListItem = `<li class="list-group-item d-flex justify-content-between align-items-center">
            something
            <button type="button" class="btn btn-outline-danger btn-sm" id="delChrItem">刪除</button>
        </li>`;
        document.getElementById("chrList").innerHTML += chrListItem;
    }
);

let deleteTarget = null; // 記錄要刪除的項目

document.getElementById("chrList").addEventListener("click", function (event) {
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