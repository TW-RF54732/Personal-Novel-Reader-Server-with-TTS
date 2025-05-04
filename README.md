# 使用TTS API的網頁版書庫
---
# 🚧目前尚未完成🚧
---
## 功能
1. 帳號登入和創建
2. 新增書庫資料夾
3. 資料夾中上傳你的小說TXT檔案
4. 使用自己的TTS API來朗讀TXT
5. 自動保存進度

## 簡介
這就是一個輕量的小說管理網站與機器朗讀的網站，內包含前端與後端。
後端是Flask，前端用原生HTML+JS配合bootstrap5美觀，下載並安裝好依賴庫後就能輕鬆完成部屬。
##安裝
###你需要具備
1. `python3`，目前測試環境為`python 3.13.2`，不過這東不複雜，python3應該都可以
2. 你的python有`pip`或你能自己安裝`requirements.txt`裡的依賴庫。
3. 你需要git

### 安裝步驟

#### Windows

1. 選擇你要下載專案的地方打開`CMD`或`PowerShell`
2. 下載檔案
```
git clone https://github.com/TW-RF54732/web-reader-for-local-TTS-API.git
```
4. 進入資料夾
```
cd .\web-reader-for-local-TTS-API\
```
6. 創建並啟動虛擬環境
```
python -m venv venv
.\venv\Scripts\Activate.ps1
```
>如果抱錯:`
>Management_Install.ps1 cannot be loaded because the execution of scripts is disabled on this system.`
>代表系統預設不能執行`PowerShell`檔案，更改設定後再執行
>設定更改方式:https://stackoverflow.com/questions/4037939/powershell-says-execution-of-scripts-is-disabled-on-this-system
7. 自動下載所需依賴庫
```
pip install -r .\requirements.txt
```
8. 下載完後啟動
```
python app.py
```
#### 懶人指令
```
git clone https://github.com/TW-RF54732/web-reader-for-local-TTS-API.git
cd .\web-reader-for-local-TTS-API\
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r .\requirements.txt
```
