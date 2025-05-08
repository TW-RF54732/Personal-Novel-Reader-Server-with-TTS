let lines;
let vocals=[];
let ReadingProgress=[];//朗讀進度

//local only
let cacheProgess = 0;
let do_cache=false;
let buffAmount = 5;
let readPointer=0,buffPointer=0;
let readingLine=1,readPrevious;
let skipMode=false;
let autoScroll = true,isAutoScrolling = false;

//TTS setting
let textLanguage = "zh";

const book_data = JSON.parse(localStorage.getItem("currentBookData"));


//EventListener
function renderTextToPage(targetElementId = 'textDisplay') {
    // 將每一行渲染為 <p> 元素
    const html = lines.map((line, index) => 
        `<p class="lines" id="p${index}">${index + 1}: ${line}</p>`
    ).join('\n');

    // 將內容寫入指定的 DOM 元素
    document.getElementById(targetElementId).innerHTML = html;
}

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

function saveProgress(){
    let progress = book_data.progress;
    const keys = Object.keys(progress);  // ["chapter1"]
    const chrName = keys[0];
    progress[chrName] = readingLine;
    
    saveNewData()
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
  
// async function setUp(){
//     await fetchTxt();
//     pressCache();
//     readCtrl();
// }

fetchTxt();
async function fetchTxt() {
    const bookName = book_data.bookName;
    let progress = book_data.progress;
    const keys = Object.keys(progress);  // ["chapter1"]
    const chrName = keys[0];
    cacheProgess = progress[chrName];

    fetch("/api/user/book/getChr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bookName: bookName,
          chrName: chrName
        }),
        credentials: "include" // 如果你有使用 cookie 或 JWT 驗證
      })
      .then(response => response.json())
      .then(data => {
        text = data.content
        lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        renderTextToPage();
        pressCache();
        readCtrl();
      })
      .catch(error => {
        console.error("發生錯誤：", error);
    });
}
// setUp();
async function cache(getTextVoice,lineIndex) {
    const data = {
        "text": getTextVoice,
        "text_language": textLanguage,
        "progressLine":readingLine
    };
    try {
        const response = await fetch(`/api/proccess`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: "include"
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
        saveProgress();
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


