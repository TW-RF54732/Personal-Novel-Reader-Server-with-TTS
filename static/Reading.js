let lines;
let vocals=[];
let ReadingProgress=[];

let cacheProgess = 0;
let do_cache=false;
let buffAmount = 5;
let readPointer=0,buffPointer=0;
let readingLine=1,readPrevious;
let skipMode=false;
let autoScroll = true,isAutoScrolling = false;

// let server_url = "http://leo54732.duckdns.org:54732";
let referWavPath = "X:/vscode/GVITS/GPT-SoVITS-beta/GPT-SoVITS-beta0706/SetUp/Anoke/Anoke_SetupVoice.wav";
let referText = "那至少是有一点好处，跟你说，他除了为自己乞讨以外，他还为他朋友帮他去乞讨。";
let promptLanguage = "zh";  
let textLanguage = "zh";

//EventListener
document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0]; // 取得上傳的檔案
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result; // 獲取檔案內容

            // 根據換行符（\r\n 或 \n）切割內容成陣列
            lines = content.split(/\r?\n/).filter(line => line.trim() !== "");

            // 渲染到頁面上，顯示每一行
            document.getElementById('textDisplay').innerHTML = `${lines.map((line, index) => `<p class="lines" id=p${index}>${index+1}:${line}</p>`).join('\n')}`;
        };
        
        reader.readAsText(file, 'utf-8'); // 以 UTF-8 編碼讀取檔案
    } else {
        alert('請選擇一個文本檔案！');
    }
});
document.getElementById("textDisplay").addEventListener("scroll", () => {
    if(!isAutoScrolling){
        console.log('scroll');
        autoScroll = false; // 使用者手動滾動時，暫停自動滾動
    }
});
document.getElementById("textDisplay").addEventListener("click", (event) => {
    resumeAutoScroll();
});


//function
async function getProgress() {
    const respones =await fetch('/getProgress',{
        method:'GET'
    });
    const text = await respones.text();
    const number = parseInt(text, 10);  // 轉換成數字
    return number;
}
async function fetchTxt() {
    const response = await fetch("/get_txt");  // 向後端請求
    const text = await response.text();  // 解析成文字
    lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    document.getElementById('textDisplay').innerHTML = `${lines.map((line, index) => `<p class="lines" id=p${index}>${index+1}:${line}</p>`).join('\n')}`;
}
async function setUp(){
    await fetchTxt();
    cacheProgess = await getProgress();
    pressCache();
    readCtrl();
}
setUp();
async function cache(getTextVoice,lineIndex) {
    const data = {
        "refer_wav_path": referWavPath,
        "prompt_text": referText,
        "prompt_language": promptLanguage,
        "text": getTextVoice,
        "text_language": textLanguage,
        "progressLine":readingLine
    };
    try {
        const response = await fetch(`/proccess`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        // 將回應轉為 Blob (音檔)
        const wav = await response.blob();
        
        if(!response.ok){
            console.log("respones error");
        }
        else{
            vocals[buffPointer] = wav;
            ReadingProgress[buffPointer] = lineIndex;
        }
        
    } catch (error) {
        console.error(`${lineIndex + 1} 伺服器無回應`, error);
    }
}
// if(autoCache === true){
//     waitForAutoBuffer();
// }

function pressCache(){
    if(do_cache==false){
        document.getElementById('CacheBtn').innerHTML = '暫停快取';
        do_cache = true;
        cacheCtrl();
    }
    else{
        do_cache = false;
        document.getElementById('CacheBtn').innerHTML = '開始快取';
    }
}
async function cacheCtrl() {
    if(lines){
        if(buffAmount>1){
            for(cacheProgess;cacheProgess<lines.length;cacheProgess++){
                skipMode[0] = false;
                console.log(cacheProgess);
                let buffNext = (buffPointer + 1) % buffAmount;
                if(do_cache===false){break;}
                if(buffNext===readPointer ){console.log("緩存達到設定最大值");await waitForBuffer(1000,buffNext);}
                await cache(lines[cacheProgess],cacheProgess);
                if(!skipMode[0]){
                    buffPointer = buffNext;
                }
            }
            console.log('done cache');
        }
        else{
            console.log("Buff too small");
        }
    }   
    else{
        console.log('No lines');
    }
}
async function readCtrl() {
    while (true) {
        skipMode[1]=false;
        let readNext = readPointer+1;
        if(readPointer+1>buffAmount){readNext=0;}
        if(readPointer===buffPointer){
            await waitForNewAudio(500);
        }
        
        readingLine = ReadingProgress[readPointer];
        showReadLines(readingLine+1);
        highLight(readingLine,readPrevious);
        scrollToCurrentLine(readingLine);
        await readtheline(readPointer);//朗讀
        if(!skipMode[1]){
            readPointer = readNext;
        }
        readPrevious = readingLine;
    }
}
function waitForNewAudio(ms) {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (readPointer!=buffPointer){
                clearInterval(checkInterval); // 停止檢查
                resolve();
            }
        }, ms); // 每 500 毫秒檢查一次
    });
}
function waitForBuffer(ms,buffNext) {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (buffNext!=readPointer){
                clearInterval(checkInterval); // 停止檢查
                resolve();
            }
        }, ms); // 每 500 毫秒檢查一次
    });
}
function waitForAutoBuffer() {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (lines!=undefined){
                clearInterval(checkInterval); // 停止檢查
                pressCache();
                resolve();
            }
        }, 500); // 每 500 毫秒檢查一次
    });
}

function readtheline(readline) {
    return new Promise((resolve) => {
        try{
            const audioUrl = URL.createObjectURL(vocals[readline]);
            const audioPlayer = document.getElementById('audioPlayer');
            
            audioPlayer.src = audioUrl;
            audioPlayer.play(); // 播放音頻
            
            // 播放完成後執行 resolve
            audioPlayer.onended = () => {
                URL.revokeObjectURL(audioUrl); // 釋放資源
                resolve();
            };
     
            // 處理暫停/開始邏輯
            audioPlayer.onpause = () => {
                console.log("播放暫停");
            };
            audioPlayer.onerror = (error) => {
                console.error(`Error playing audio ${readline}:`, error);
                URL.revokeObjectURL(audioUrl); // 釋放資源
                resolve();
            };
        }
        catch{
            resolve();
        }

        vocals[readline] = undefined;
    });
}
function highLight(line,disLine){
    let highLightLine = document.getElementById(`p${line}`);
    let disableHighLightLine = document.getElementById(`p${disLine}`);
    if(highLightLine){
        highLightLine.style.backgroundColor = 'lightblue';
    }
    if(disableHighLightLine){
        disableHighLightLine.style.backgroundColor = 'white';
    }
}
function resetBuffer(){
    readPointer=0,buffPointer=0;vocals=[];
}
function showReadLines(){
    document.getElementById("ShowProgress").value = readingLine+1;
}
function skipAudio(){
    skipMode=[true,true];//[0]for Buffer,[1]for Read lines
    resetBuffer();
    let skipTo = document.getElementById('skipInput').value-1;//第1行從0開始計算
    cacheProgess = skipTo - 1;
    ReadingProgress=[];
    ReadingProgress = ReadingProgress.slice(0,skipTo);
}
function scrollToCurrentLine(lineIndex) {
    if (!autoScroll) return; // 如果使用者手動滾動了，就不執行滾動

    const lineElement = document.getElementById(`p${lineIndex}`);
    if (lineElement) {
        isAutoScrolling = true; // 標記為「程式滾動」
        lineElement.scrollIntoView({ behavior: "smooth", block: "center" });

        // 設置短暫的計時器，避免立即取消 autoScroll
        setTimeout(() => {
            isAutoScrolling = false;
        }, 1000);
    }
}
function resumeAutoScroll() {
    autoScroll = true;
    console.log("恢復自動滾動");
    scrollToCurrentLine(readingLine); // 滾動到當前朗讀行
}

async function logout() {
    await fetch("/api/logout", {
        method: "POST",
        credentials: "include"  // 讓 Cookie 被正確刪除
    });

    console.log("登出成功");
}

