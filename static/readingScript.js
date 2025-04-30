userData = JSON.parse(localStorage.getItem("userData"))

//取得文本
async function fetchTxt() {
    const response = await fetch("/get_txt");  // 向後端請求
    const text = await response.text();  // 解析成文字
    lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    document.getElementById('textDisplay').innerHTML = `${lines.map((line, index) => `<p class="lines" id=p${index}>${index+1}:${line}</p>`).join('\n')}`;
}


lines = content.split(/\r?\n/).filter(line => line.trim() !== "");

// 渲染到頁面上，顯示每一行
document.getElementById('textDisplay').innerHTML = `${lines.map((line, index) => `<p class="lines" id=p${index}>${index+1}:${line}</p>`).join('\n')}`;