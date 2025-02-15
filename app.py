#Main file! Start the server here.

from flask import Flask ,render_template,request,send_file,send_from_directory
import requests
import json
import io
import os
from requests import get

app=Flask(__name__)

@app.route("/")
def home():
    return render_template('Reading.html')

@app.route("/proccess",methods=['POST'])
def call_VITS_API():
    data = request.get_json()
    print(data)
    url = proccess_URL(data)
    response = requests.get(url)
    if response:
        print("----------\n\nGet API Response Successfully\n\n----------")
    audio_data = io.BytesIO(response.content)
    return send_file(
        audio_data,
        mimetype="audio/wav",
        as_attachment=True,
        download_name="processed.wav"
    )

@app.route('/favicon.ico',methods=['GET'])
def favicon():
    return send_from_directory(
        os.path.join(app.root_path, "static"), "favicon.ico", mimetype="image/vnd.microsoft.icon"
    )

@app.route('/get_txt',methods=['GET'])
def get_txt():
    return send_file("users/exAccount/testBook/3714.txt", as_attachment=True)

@app.route('/getProgress',methods=['GET'])
def showProgress():
    json_path = os.path.join("users", "exAccount", "testBook", "progress.json")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if "progress" in data:
        s = f'{data["progress"]}'
        return str(s)

def proccess_URL(data):
    referWavPath = data.get("refer_wav_path")  # 音頻路徑
    referText = data.get("prompt_text")        # 提示文字
    promptLanguage = data.get("prompt_language")  # 提示語言
    text = data.get("text")                      # 要合成的文字
    textLanguage = data.get("text_language")    # 要合成的文字語言
    progressLine = data.get("progressLine")
    url = f'http://192.168.1.115:9880?refer_wav_path={referWavPath}&prompt_text={referText}&prompt_language={promptLanguage}&text={text}&text_language={textLanguage}'
    print(saveProgress(progressLine))
    return url



def saveProgress(progressLine,):
    json_path = os.path.join("users", "exAccount", "testBook", "progress.json")
    if not os.path.exists(json_path):
        return {"error": "進度檔不存在"}
    
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    if "progress" in data:
        data["progress"] = progressLine
    else:
        return {"error": "設定項目不存在"}
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    

    

if __name__ == "__main__":
    app.run(debug=True,host="127.0.0.1",port=54733)

