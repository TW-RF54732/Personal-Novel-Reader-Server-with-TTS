# app.py API 文件

本文件詳細記錄了 Flask 應用程式 `app.py` 中定義的所有端點和 API。每個端點的描述包括其用途、HTTP 方法、請求參數、回傳資料、認證需求及錯誤處理。

## 目錄

1. [概覽](#%E6%A6%82%E8%A6%BD)
2. [端點列表](#%E7%AB%AF%E9%BB%9E%E5%88%97%E8%A1%A8)
   * [根目錄 (`/`)](#%E6%A0%B9%E7%9B%AE%E9%8C%84-)
   * [登入頁面 (`/login`)](#%E7%99%BB%E5%85%A5%E9%A0%81%E9%9D%A2-login)
   * [註冊頁面 (`/register`)](#%E8%A8%BB%E5%86%8A%E9%A0%81%E9%9D%A2-register)
   * [首頁 (`/home`)](#%E9%A6%96%E9%A0%81-home)
   * [閱讀頁面 (`/reading`)](#%E9%96%B1%E8%AE%80%E9%A0%81%E9%9D%A2-reading)
   * [網站圖標 (`/favicon.ico`)](#%E7%B6%B2%E7%AB%99%E5%9C%96%E6%A8%99-faviconico)
   * [處理 API (`/api/proccess`)](#%E8%99%95%E7%90%86-api-apiproccess)
   * [取得進度 (`/getProgress`)](#%E5%8F%96%E5%BE%97%E9%80%B2%E5%BA%A6-getprogress)
   * [註冊 API (`/api/register`)](#%E8%A8%BB%E5%86%8A-api-apiregister)
   * [登入 API (`/api/login`)](#%E7%99%BB%E5%85%A5-api-apilogin)
   * [登出 API (`/api/logout`)](#%E7%99%BB%E5%87%BA-api-apilogout)
   * [初始化使用者 (`/api/user/initUser`)](#%E5%88%9D%E5%A7%8B%E5%8C%96%E4%BD%BF%E7%94%A8%E8%80%85-apiuserinituser)
   * [刪除使用者 (`/api/delete_user`)](#%E5%88%AA%E9%99%A4%E4%BD%BF%E7%94%A8%E8%80%85-apidelete_user)
   * [取得使用者頭像 (`/api/user/getAvatar`)](#%E5%8F%96%E5%BE%97%E4%BD%BF%E7%94%A8%E8%80%85%E9%A0%AD%E5%83%8F-apiusergetavatar)
   * [取得使用者資料 (`/api/user/getData`)](#%E5%8F%96%E5%BE%97%E4%BD%BF%E7%94%A8%E8%80%85%E8%B3%87%E6%96%99-apiusergetdata)
   * [儲存使用者資料 (`/api/user/saveData`)](#%E5%84%B2%E5%AD%98%E4%BD%BF%E7%94%A8%E8%80%85%E8%B3%87%E6%96%99-apiusersavedata)
   * [建立資料夾 (`/api/user/creatFolder`)](#%E5%BB%BA%E7%AB%8B%E8%B3%87%E6%96%99%E5%A4%BE-apiusercreatfolder)
   * [刪除資料夾 (`/api/user/deleteFolder`)](#%E5%88%AA%E9%99%A4%E8%B3%87%E6%96%99%E5%A4%BE-apiuserdeletefolder)
   * [重新命名書籍資料夾 (`/api/user/renameBookFolder`)](#%E9%87%8D%E6%96%B0%E5%91%BD%E5%90%8D%E6%9B%B8%E7%B1%8D%E8%B3%87%E6%96%99%E5%A4%BE-apiuserrenamebookfolder)
   * [上傳章節 (`/api/user/book/uploadChr`)](#%E4%B8%8A%E5%82%B3%E7%AB%A0%E7%AF%80-apiuserbookuploadchr)
   * [取得章節 (`/api/user/book/getChr`)](#%E5%8F%96%E5%BE%97%E7%AB%A0%E7%AF%80-apiuserbookgetchr)
   * [取得資料夾列表 (`/api/user/getFolders`)](#%E5%8F%96%E5%BE%97%E8%B3%87%E6%96%99%E5%A4%BE%E5%88%97%E8%A1%A8-apiusergetfolders)
   * [取得書籍資料 (`/api/user/book/getBookData`)](#%E5%8F%96%E5%BE%97%E6%9B%B8%E7%B1%8D%E8%B3%87%E6%96%99-apiuserbookgetbookdata)
   * [開啟書籍 (`/book`)](#%E9%96%8B%E5%95%9F%E6%9B%B8%E7%B1%8D-book)
   * [取得書籍封面 (`/api/user/book/getCover`)](#%E5%8F%96%E5%BE%97%E6%9B%B8%E7%B1%8D%E5%B0%81%E9%9D%A2-apiuserbookgetcover)
   * [上傳書籍封面 (`/api/user/book/uploadCover`)](#%E4%B8%8A%E5%82%B3%E6%9B%B8%E7%B1%8D%E5%B0%81%E9%9D%A2-apiuserbookuploadcover)
   * [儲存書籍資料 (`/api/user/book/saveBookData`)](#%E5%84%B2%E5%AD%98%E6%9B%B8%E7%B1%8D%E8%B3%87%E6%96%99-apiuserbooksavebookdata)

## 概覽

* **框架**: Flask
* **認證**: 使用 JSON Web Token (JWT) 儲存在 Cookie 中進行會話管理。
* **資料庫**: 使用 SQLite (`users.db`) 儲存使用者資訊。
* **檔案系統**: 使用者資料和書籍儲存在 `users` 目錄中，每個使用者有獨立的子目錄。
* **依賴**:
  * Flask 相關套件: `flask`, `flask_sqlalchemy`, `flask_bcrypt`, `flask_jwt_extended`
  * 自訂模組: `readerTools` (別名 `rt`)、`TTS_API`
  * 其他 Python 函式庫: `requests`, `json`, `io`, `os`, `uuid`, `shutil`, `datetime`
* **安全性**:
  * 密碼使用 `bcrypt` 進行雜湊處理。
  * JWT 使用自訂密鑰， token 有效期為 7 天。
  * !!**注意**!!目前仍在測試階段，開發環境中禁用 CSRF 保護和安全 Cookie (`JWT_COOKIE_SECURE` 和 `JWT_COOKIE_CSRF_PROTECT` 設為 `False`)，如需要請手動開啟。

## 端點列表

### 根目錄 (`/`)

* **方法**: GET
* **用途**: 根據使用者認證狀態進行重定向。
* **認證需求**: 可選 JWT 驗證。
* **請求參數**: 無
* **回傳**:
  * **成功**:
    * 已認證 (有效 JWT): 重定向至 `/home`。
    * 未認證: 重定向至 `/login`。
  * **錯誤**:
    * 無明確定義錯誤；無效或缺失 JWT 會重定向至 `/login`。
* **備註**: 作為應用程式的入口，判斷使用者是否已登入。

### 登入頁面 (`/login`)

* **方法**: GET
* **用途**: 提供登入頁面的 HTML 模板。
* **認證需求**: 無
* **請求參數**: 無
* **回傳**:
  * **成功**:
    * 回傳 `Login.html` 模板。
    * **內容類型**: `text/html`
  * **錯誤**: 無
* **備註**: 所有使用者均可存取，顯示登入介面。

### 註冊頁面 (`/register`)

* **方法**: GET
* **用途**: 提供註冊頁面的 HTML 模板。
* **認證需求**: 無
* **請求參數**: 無
* **回傳**:
  * **成功**:
    * 回傳 `Register.html` 模板。
    * **內容類型**: `text/html`
  * **錯誤**: 無
* **備註**: 允許新使用者存取註冊介面。

### 首頁 (`/home`)

* **方法**: GET
* **用途**: 為已認證使用者提供首頁。
* **認證需求**: 可選 JWT 驗證。
* **請求參數**: 無
* **回傳**:
  * **成功**:
    * 已認證: 回傳 `home.html` 模板。
    * **內容類型**: `text/html`
  * **錯誤**:
    * 未認證或 JWT 無效: 重定向至 `/login`。
* **備註**: 確保僅已登入使用者可存取首頁。

### 閱讀頁面 (`/reading`)

* **方法**: GET
* **用途**: 為已認證使用者提供閱讀頁面。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**: 無
* **回傳**:
  * **成功**:
    * 回傳 `Reading.html` 模板。
    * **內容類型**: `text/html`
  * **錯誤**:
    * **401 未授權**: JWT 缺失或無效。
* **備註**: 僅限已認證使用者，供閱讀內容使用。

### 網站圖標 (`/favicon.ico`)

* **方法**: GET
* **用途**: 提供應用程式的網站圖標。
* **認證需求**: 無
* **請求參數**: 無
* **回傳**:
  * **成功**:
    * 從 `static` 目錄回傳 `favicon.ico`。
    * **內容類型**: `image/vnd.microsoft.icon`
  * **錯誤**: 無
* **備註**: 標準端點，用於提供網站圖標。

### 處理 API (`/api/proccess`)

* **方法**: POST
* **用途**: 使用外部 TTS (文字轉語音) API 處理文字合成。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**:
  * **Body** (JSON):
    * `text`: 要合成的文字。
    * `text_language`: 文字語言。
* **回傳**:
  * **成功**:
    * 回傳 TTS API 生成的音訊檔案 (`processed.wav`)。
    * **內容類型**: `audio/wav`
    * **狀態碼**: 200
  * **錯誤**:
    * **401 未授權**: JWT 缺失或無效。
    * **500 伺服器錯誤**: TTS API 請求失敗 (未明確處理)。
* **備註**:
  * 使用 `TTS_API.makeTTS_URL_GET` 建構 API URL。
  * 控制台記錄成功訊息。
  * 需改進錯誤處理 (如 API 請求失敗)。

### 註冊 API (`/api/register`)

* **方法**: POST
* **用途**: 註冊新使用者並建立其目錄結構。
* **認證需求**: 無
* **請求參數**:
  * **Body** (JSON):
    * `username`: 使用者名稱。
    * `password`: 密碼。
* **回傳**:
  * **成功**:
    * 在資料庫中建立新使用者，包含雜湊密碼和 UUID。
    * 使用 `readerTools.init` 初始化使用者資料夾。
    * 設定 JWT Cookie 並回傳成功訊息。
    * **內容類型**: `application/json`
    * **Body**: `{"message": "登入成功"}`
    * **狀態碼**: 200
  * **錯誤**:
    * **400 錯誤請求**: 使用者名稱或密碼為空。
    * **400 錯誤請求**: 使用者名稱已存在。
* **備註**:
  * 密碼使用 `bcrypt` 雜湊。
  * JWT 有效期為 7 天。

### 登入 API (`/api/login`)

* **方法**: POST
* **用途**: 驗證使用者並發放 JWT。
* **認證需求**: 無
* **請求參數**:
  * **Body** (JSON):
    * `username`: 使用者名稱。
    * `password`: 密碼。
* **回傳**:
  * **成功**:
    * 設定 JWT Cookie 並回傳成功訊息。
    * **內容類型**: `application/json`
    * **Body**: `{"message": "登入成功"}`
    * **狀態碼**: 200
  * **錯誤**:
    * **401 未授權**: 使用者名稱或密碼錯誤。
* **備註**: 使用 `bcrypt.check_password_hash` 驗證密碼。

### 登出 API (`/api/logout`)

* **方法**: POST
* **用途**: 登出使用者並移除 JWT Cookie。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**: 無
* **回傳**:
  * **成功**:
    * 移除 JWT Cookie 並回傳成功訊息。
    * **內容類型**: `application/json`
    * **Body**: `{"message": "登出成功"}`
    * **狀態碼**: 200
  * **錯誤**:
    * **401 未授權**: JWT 缺失或無效。
* **備註**: 清除會話 Cookie 以結束使用者會話。

### 初始化使用者 (`/api/user/initUser`)

* **方法**: POST
* **用途**: 重新初始化使用者的目錄結構。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**:
  * **Body** (JSON):
    * `password`: 使用者密碼，用於驗證。
* **回傳**:
  * **成功**:
    * 使用 `readerTools.init` 重新初始化使用者資料夾。
    * **內容類型**: `application/json`
    * **Body**: `{"Success": "使用者以格式化"}`
    * **狀態碼**: 200
  * **錯誤**:
    * **401 未授權**: 密碼錯誤或使用者不存在。
* **備註**: 在初始化前驗證使用者憑證。

### 刪除使用者 (`/api/delete_user`)

* **方法**: POST
* **用途**: 從資料庫中刪除已認證使用者。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**: 無
* **回傳**:
  * **成功**:
    * 從資料庫刪除使用者並登出。
    * **內容類型**: `application/json`
    * **Body**: `{"message": "使用者已刪除"}`
    * **狀態碼**: 200
  * **錯誤**:
    * **404 未找到**: 使用者不存在。
* **備註**: 刪除後清除 JWT Cookie。

### 取得使用者頭像 (`/api/user/getAvatar`)

* **方法**: GET
* **用途**: 取得使用者的頭像圖片。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**: 無
* **回傳**:
  * **成功**:
    * 回傳使用者頭像 (`avatar.png`)。
    * **內容類型**: `image/png`
    * **狀態碼**: 200
  * **錯誤**:
    * **401 未授權**: JWT 無效或使用者不存在 (觸發登出)。
* **備註**: 假設頭像檔案 `avatar.png` 存在於使用者目錄。

### 取得使用者資料 (`/api/user/getData`)

* **方法**: GET
* **用途**: 從 `userData.json` 取得使用者資料。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**: 無
* **回傳**:
  * **成功**:
    * 回傳 `userData.json` 檔案。
    * **內容類型**: `application/json`
    * **狀態碼**: 200
  * **錯誤**:
    * **401 未授權**: JWT 無效或使用者不存在 (觸發登出)。
* **備註**: 假設 `userData.json` 存在於使用者目錄。

### 儲存使用者資料 (`/api/user/saveData`)

* **方法**: POST
* **用途**: 將使用者資料儲存至 `userData.json`。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**:
  * **Body** (JSON): 要儲存的使用者資料。
* **回傳**:
  * **成功**:
    * 儲存資料至 `userData.json` 並回傳成功訊息。
    * **內容類型**: `application/json`
    * **Body**: `{"message": "userData.json 已更新", "path": "<檔案路徑>"}`
    * **狀態碼**: 200
  * **錯誤**:
    * **400 錯誤請求**: JSON 格式錯誤。
    * **401 未授權**: JWT 無效或使用者不存在 (觸發登出)。
* **備註**: 覆蓋現有的 `userData.json`。

### 建立資料夾 (`/api/user/creatFolder`)

* **方法**: POST
* **用途**: 為使用者建立新的書籍資料夾。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**:
  * **Body** (JSON):
    * `folderName`: 新資料夾名稱。
* **回傳**:
  * **成功**:
    * 使用 `readerTools.init` 建立資料夾並更新 `data.json`。
    * **內容類型**: `application/json`
    * **Body**: `{"Success": "已創建: <base64資料夾名稱>"}`
    * **狀態碼**: 200
  * **錯誤**:
    * **401 未授權**: JWT 無效或使用者不存在 (觸發登出)。
    * **409 衝突**: 資料夾已存在或初始化失敗。
* **備註**: 資料夾名稱使用 base64 編碼儲存。

### 刪除資料夾 (`/api/user/deleteFolder`)

* **方法**: POST
* **用途**: 刪除指定的書籍資料夾。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**:
  * **Body** (JSON):
    * `folderName`: 要刪除的資料夾名稱。
* **回傳**:
  * **成功**:
    * 刪除資料夾及其內容。
    * **內容類型**: `application/json`
    * **Body**: `{"Success": "已刪除: <資料夾名稱>"}`
    * **狀態碼**: 200
  * **錯誤**:
    * **400 錯誤請求**: 資料夾名稱為空。
    * **401 未授權**: JWT 無效或使用者不存在 (觸發登出)。
    * **404 未找到**: 資料夾不存在。
* **備註**: 使用 `shutil.rmtree` 刪除資料夾。

### 重新命名書籍資料夾 (`/api/user/renameBookFolder`)

* **方法**: POST
* **用途**: 重新命名書籍資料夾並更新其 `data.json`。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**:
  * **Body** (JSON):
    * `newName`: 新資料夾名稱。
    * `oldName`: 當前資料夾名稱。
* **回傳**:
  * **成功**:
    * 重新命名資料夾並更新 `data.json` 中的 `bookName`。
    * **內容類型**: `application/json`
    * **Body**: `data.json` 的內容
    * **狀態碼**: 200
  * **錯誤**:
    * **400 錯誤請求**: 新名稱已存在。
    * **401 未授權**: JWT 無效或使用者不存在 (觸發登出)。
    * **404 未找到**: 舊資料夾不存在。
* **備註**: 資料夾名稱使用 base64 編碼儲存。

### 上傳章節 (`/api/user/book/uploadChr`)

* **方法**: POST
* **用途**: 上傳文字檔案作為指定書籍的章節。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**:
  * **Form Data**:
    * `bookName`: 書籍名稱。
    * `files`: 要上傳的 `.txt` 檔案列表。
* **回傳**:
  * **成功**:
    * 儲存檔案至書籍目錄並回傳儲存的檔案名稱列表。
    * **內容類型**: `application/json`
    * **Body**: `{"saved": [<檔案名稱>, ...]}`
    * **狀態碼**: 200
  * **錯誤**:
    * **400 錯誤請求**: 缺少 `bookName` 或未提供檔案。
    * **400 錯誤請求**: 書籍不存在。
    * **401 未授權**: JWT 無效或使用者不存在 (觸發登出)。
* **備註**: 僅接受 `.txt` 檔案，檔案名稱使用 base64 編碼。

### 取得章節 (`/api/user/book/getChr`)

* **方法**: POST
* **用途**: 取得指定章節檔案的內容。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**:
  * **Body** (JSON):
    * `bookName`: 書籍名稱。
    * `chrName`: 章節名稱 (不含 `.txt`)。
* **回傳**:
  * **成功**:
    * 回傳章節內容。
    * **內容類型**: `application/json`
    * **Body**: `{"content": "<章節內容>"}`
    * **狀態碼**: 200
  * **錯誤**:
    * **400 錯誤請求**: 缺少 `bookName` 或 `chrName`。
    * **400 錯誤請求**: 書籍或章節不存在。
    * **401 未授權**: JWT 無效或使用者不存在 (觸發登出)。
    * **500 伺服器錯誤**: 檔案讀取失敗。
* **備註**: 章節檔案名稱使用 base64 編碼。

### 取得資料夾列表 (`/api/user/getFolders`)

* **方法**: GET
* **用途**: 列出已認證使用者的所有書籍資料夾。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**: 無
* **回傳**:
  * **成功**:
    * 回傳解碼後的資料夾名稱列表。
    * **內容類型**: `application/json`
    * **Body**: `{"folders": [<資料夾名稱>, ...]}`
    * **狀態碼**: 200
  * **錯誤**:
    * **401 未授權**: JWT 無效或使用者不存在 (觸發登出)。
    * **404 未找到**: 書籍資料夾不存在。
* **備註**: 使用 `readerTools.b64Decode` 解碼資料夾名稱。

### 取得書籍資料 (`/api/user/book/getBookData`)

* **方法**: POST
* **用途**: 取得指定書籍的 `data.json` 檔案。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**:
  * **Body** (JSON):
    * `folderName`: 書籍名稱。
* **回傳**:
  * **成功**:
    * 回傳 `data.json` 檔案。
    * **內容類型**: `application/json`
    * **狀態碼**: 200
  * **錯誤**:
    * **401 未授權**: JWT 無效或使用者不存在 (觸發登出)。
    * **404 未找到**: 書籍或 `data.json` 不存在。
* **備註**: 假設書籍目錄中存在 `data.json`。

### 開啟書籍 (`/book`)

* **方法**: GET
* **用途**: 提供書籍頁面的 HTML 模板。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**: 無
* **回傳**:
  * **成功**:
    * 回傳 `book.html` 模板。
    * **內容類型**: `text/html`
    * **狀態碼**: 200
  * **錯誤**:
    * **401 未授權**: JWT 缺失或無效。
* **備註**: 僅限已認證使用者存取。

### 取得書籍封面 (`/api/user/book/getCover`)

* **方法**: POST
* **用途**: 取得指定書籍的封面圖片。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**:
  * **Body** (JSON):
    * `folderName`: 書籍名稱。
* **回傳**:
  * **成功**:
    * 回傳書籍封面 (`image.jpg`)。
    * **內容類型**: `image/jpg`
    * **狀態碼**: 200
  * **錯誤**:
    * **401 未授權**: JWT 無效或使用者不存在 (觸發登出)。
    * **404 未找到**: 封面圖片不存在 (未明確處理)。
* **備註**: 假設書籍目錄中存在 `image.jpg`。

### 上傳書籍封面 (`/api/user/book/uploadCover`)

* **方法**: POST
* **用途**: 上傳指定書籍的封面圖片。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**:
  * **Form Data**:
    * `bookName`: 書籍名稱。
    * `cover`: 要上傳的圖片檔案。
* **回傳**:
  * **成功**:
    * 儲存圖片為 `image.jpg` 並回傳成功訊息。
    * **內容類型**: `application/json`
    * **Body**: `{"success": true, "imageUrl": "/<檔案路徑>"}`
    * **狀態碼**: 200
  * **錯誤**:
    * **400 錯誤請求**: 缺少 `bookName` 或 `cover`。
    * **401 未授權**: JWT 無效或使用者不存在 (觸發登出)。
* **備註**: 覆蓋書籍目錄中的現有 `image.jpg`。

### 儲存書籍資料 (`/api/user/book/saveBookData`)

* **方法**: POST
* **用途**: 將書籍資料儲存至指定書籍的 `data.json`。
* **認證需求**: 需有效 JWT (`@jwt_required()`)。
* **請求參數**:
  * **Body** (JSON):
    * `currentBookData`: 要儲存的書籍資料，包含 `bookName`。
* **回傳**:
  * **成功**:
    * 儲存資料至 `data.json` 並回傳成功訊息。
    * **內容類型**: `application/json`
    * **Body**: `{"success": "成功更新"}`
    * **狀態碼**: 200
  * **錯誤**:
    * **401 未授權**: JWT 無效或使用者不存在 (觸發登出)。
    * **404 未找到**: 書籍目錄不存在。
* **備註**: 使用 `readerTools.writeJsonFile` 儲存資料。

## 輔助函數

* **`proccess_URL(data)`**:
  * 用途: 使用 `TTS_API.makeTTS_URL_GET` 建構 TTS API 的 URL。
  * 參數: `text`, `text_language`
  * 回傳: URL 字串
* **`getUser(userName)`**:
  * 用途: 根據使用者名稱查詢資料庫。
  * 回傳: 使用者物件或 `None`。

## 備註

* **Base64 編碼**: 資料夾和檔案名稱使用 `readerTools.b64Encode` 編碼，`readerTools.b64Decode` 解碼，以處理特殊字元。
* **目錄結構**:
  * `users/<user_id>`: 每個使用者的根目錄。
  * `users/<user_id>/books/<base64書籍名稱>`: 書籍目錄。
  * 檔案: `avatar.png`, `userData.json`, `data.json`, `image.jpg`, 章節檔案 (`.txt`)。
* **錯誤處理**: 許多端點缺乏對檔案操作或外部 API 失敗的穩健錯誤處理。
* **安全性**: 開發環境中禁用 CSRF 保護和安全 Cookie，正式環境應啟用。
* **改進建議**:
  * 增加檔案缺失或外部 API 失敗的錯誤處理。
  * 移除硬編碼路徑 (如 `/getProgress`)。
  * 更嚴格驗證檔案上傳 (大小、類型)。
  * 統一錯誤回應格式。
