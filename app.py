#Main file! Start the server here.

from flask import Flask ,request,send_file,send_from_directory,jsonify,make_response,redirect,url_for,render_template
import requests
from requests import get
import json
import io
import os
import uuid
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager,unset_jwt_cookies, set_access_cookies,create_access_token, jwt_required, get_jwt_identity,verify_jwt_in_request
import shutil
import base64

#Set
app=Flask(__name__)

app.config["JWT_SECRET_KEY"] = "@_nu-Ssjtf49K@S想ㄅㄨㄉㄠ8"  # JWT 簽名密鑰（需要自訂強大KEY）
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]  # 只允許從 Cookie 讀取 JWT
app.config["JWT_COOKIE_SECURE"] = False  # True 表示只允許 HTTPS（開發時設 False）
app.config["JWT_COOKIE_CSRF_PROTECT"] = False  # 防止 CSRF（可選，開發時關閉）
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"  # SQLite
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
jwt = JWTManager(app)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

USER_DIR = "users"
TEMPLATE_USER = os.path.join('defult', "template_user")
TEMPLATE_BOOK = os.path.join('defult', "template_book")
# dsa

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # 自動遞增 ID
    username = db.Column(db.String(50), unique=True, nullable=False)  # 帳號
    password = db.Column(db.String(255), nullable=False)  # 加密密碼
    user_id = db.Column(db.String(36), unique=True, nullable=False)  # UUID 作為識別碼


with app.app_context():
    db.create_all()

#Route 
@app.route("/")
def index():
    try:
        verify_jwt_in_request(optional=True)  # 嘗試檢查 JWT
        identity = get_jwt_identity()
        if identity:
            return redirect(url_for("home"))  # 已登入，進入 /home
    except:
        pass  # JWT 無效或缺失，視為未登入

    return redirect(url_for("loginPage"))  # 未登入，轉向 /login

@app.route("/home")#登入導入，否則導入/login
def home():
    try:
        verify_jwt_in_request(optional=True)  # 嘗試檢查 JWT
        identity = get_jwt_identity()
        if identity:
            return render_template('home.html')  # 已登入，進入 /home
    except:
        pass  # JWT 無效或缺失，視為未登入

    return redirect(url_for("loginPage"))  # 未登入，轉向 /login

@app.route("/login")
def loginPage():
    return render_template("Login.html")  # 這裡回傳 HTML

@app.route('/register')
def registerPage():
    return render_template('Register.html')

@app.route('/favicon.ico',methods=['GET'])
def favicon():
    return send_from_directory(
        os.path.join(app.root_path, "static"), "favicon.ico", mimetype="image/vnd.microsoft.icon"
    )

#需要更改
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
#需要更改
# API
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    Username = data.get("username")
    Password = data.get("password")

    if not Username or not Password:
        return jsonify({"error": "帳號與密碼不能為空"}), 400

    if User.query.filter_by(username=Username).first():
        return jsonify({"error": "帳號已存在"}), 400

    hashed_password = bcrypt.generate_password_hash(Password).decode("utf-8")
    new_user = User(username=Username, password=hashed_password, user_id=str(uuid.uuid4()))

    db.session.add(new_user)
    db.session.commit()
    token = create_access_token(identity=Username)
    
    #setup user folder
    user = User.query.filter_by(username=Username).first()
    init(TEMPLATE_USER,USER_DIR,user.user_id)

    response = make_response(jsonify({"message": "登入成功"}))
    set_access_cookies(response, token)  # 設定 JWT 到 Cookie
    return response

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    Username = data.get("username")
    Password = data.get("password")

    user = User.query.filter_by(username=Username).first()

    if not user or not bcrypt.check_password_hash(user.password, Password):
        return jsonify({"error": "帳號或密碼錯誤"}), 401

    token = create_access_token(identity=Username)

    response = make_response(jsonify({"message": "登入成功"}))
    set_access_cookies(response, token)  # 設定 JWT 到 Cookie
    return response

@app.route("/api/logout", methods=["POST"])
def logout():
    response = make_response(jsonify({"message": "登出成功"}))
    unset_jwt_cookies(response)  # 刪除 JWT Cookie
    return response

@app.route("/api/user/initUser", methods=["POST"])
@jwt_required()
def initUser():
    data = request.get_json()
    Password = data.get("password")
    
    current_user = get_jwt_identity()  # 取得 JWT 內的 username
    user = User.query.filter_by(username=current_user).first()
    if not user:
        return jsonify({"error": "使用者不存在"}), 404

    if bcrypt.check_password_hash(user.password, Password):
        init(TEMPLATE_USER,USER_DIR,user.user_id)
        return jsonify({"Success": "使用者以格式化"}),200

    return jsonify({"error": "密碼錯誤"})

@app.route("/api/delete_user", methods=["POST"])
@jwt_required()
def delete_user():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()

    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "使用者已刪除"}), 200

    return jsonify({"error": "使用者不存在"}), 404

#login service
@app.route("/api/user/getAvatar", methods=["GET"])
@jwt_required()
def get_userAvatar():
    current_user = get_jwt_identity()  # 取得 JWT 內的 username
    user = User.query.filter_by(username=current_user).first()
    if not user:
        return logout()
    user_ID = user.user_id
    avatar_path = os.path.join(USER_DIR,f'{user_ID}/avatar.png')
    return send_file(avatar_path, mimetype='image/png')

@app.route("/api/user/getData", methods=["GET"])
@jwt_required()
def get_data():
    current_user = get_jwt_identity()  # 取得 JWT 內的 username
    user = User.query.filter_by(username=current_user).first()
    if not user:
        return jsonify({"error": "使用者不存在"}), 404
    user_ID = user.user_id

    setting_path = os.path.join(USER_DIR,f'{user_ID}/userData.json')
    return send_file(setting_path,mimetype="application/json")

@app.route("/api/user/saveData",methods=['POST'])
@jwt_required()
def saveData():
    current_user = get_jwt_identity()
    user = getUser(current_user)
    if not user:
        return jsonify({"error": "使用者不存在"}), 404
    user_id = user.user_id
    user_folder = os.path.join(USER_DIR, user_id)

    try:
        user_data = request.get_json()
    except Exception as e:
        return jsonify({"error": "JSON 格式錯誤"}), 400
    
    user_data_path = os.path.join(user_folder, "userData.json")
    with open(user_data_path, "w", encoding="utf-8") as f:
        json.dump(user_data, f, indent=4, ensure_ascii=False)

    return jsonify({"message": "userData.json 已更新", "path": user_data_path}), 200

#Folder
@app.route('/api/user/creatFolder',methods=["POST"])
@jwt_required()
def creadFolder():
    data = request.get_json()

    current_user = get_jwt_identity()  # 取得 JWT 內的 username
    user = User.query.filter_by(username=current_user).first()
    if not user:
        return jsonify({"error": "使用者不存在"}), 404
    user_ID = user.user_id

    user_book_path = os.path.join(USER_DIR,f'{user_ID}/books')
    dirName = data.get('folderName')
    try:
        dirName_bytes = dirName.encode("utf-8")
        base64_bytes = base64.b64encode(dirName_bytes)
        b64DirName = base64_bytes.decode("utf-8")
    except:
        return "Name not allowed"
    checkPath = os.path.join(user_book_path,b64DirName)
    if os.path.isdir(checkPath):
        print("資料夾已存在")
        return jsonify({"error": "資料夾已存在"}), 409
    
    init(TEMPLATE_BOOK,user_book_path,b64DirName)
    
    print(f"資料夾已複製到 {user_book_path}")

    return jsonify({"Success": f"已創建: {dirName}"}), 200

@app.route('/api/user/deleteFolder',methods=["POST"])
@jwt_required()
def DeleteFolder():
    data = request.get_json()

    current_user = get_jwt_identity()  # 取得 JWT 內的 username
    user = getUser(current_user)
    if not user:
        return jsonify({"error": "使用者不存在"}), 404
    user_ID = user.user_id

    dirName = data.get('folderName')
    if(dirName ==""):
        return jsonify({"error": "資料夾名稱格式錯誤"}), 400
    print(dirName)

    base64_string = b64Encode(dirName)
    user_book_path = os.path.join(USER_DIR,f'{user_ID}/books/{base64_string}')
    
    if os.path.exists(user_book_path):
        shutil.rmtree(user_book_path)  # 刪除整個資料夾及其內容
        print("資料夾已刪除")
    else:
        print("資料夾不存在")
        return jsonify({"error": "資料夾不存在不存在"}), 404

    print(f"已刪除資料夾: {user_book_path}")
    return jsonify({"Success": f"已刪除: {dirName}"}), 200

@app.route('/api/user/getFolders',methods=["GET"])
@jwt_required()
def getFolders():
    current_user = get_jwt_identity()  # 取得 JWT 內的 username
    user = User.query.filter_by(username=current_user).first()

    if not user:
        return jsonify({"error": "使用者不存在"}), 404

    userDir = os.path.join(USER_DIR,user.user_id)
    userBookDir = os.path.join(userDir,"books")

    if not os.path.exists(userBookDir):
        return jsonify({"error": "書籍資料夾不存在"}), 404
    
    subfolders_b64 = [entry.name for entry in os.scandir(userBookDir) if entry.is_dir()]
    subfolders = []
    for encode in subfolders_b64:
        decoded = b64Decode(encode)
        subfolders.append(decoded)

    return jsonify({"folders": subfolders})  # 回傳 JSON
#/Folder
#book
@app.route('/api/user/folder/uploadFile',methods=["POST"])
@jwt_required()
def uploadFile():
    return 0

#/book
#Function
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

def saveProgress(progressLine,json_path):
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

def init(template,dir,folderName):
    userFolder = os.path.join(dir,str(folderName))
    # 如果目標資料夾已存在，先刪除
    if os.path.exists(userFolder):
        shutil.rmtree(userFolder)

    shutil.copytree(template, userFolder)  # 複製資料夾
    print(f"資料夾已複製到 {userFolder}")

def b64Encode(cypher):
    string_bytes = cypher.encode("UTF-8")

    base64_bytes = base64.b64encode(string_bytes)
    base64_string = base64_bytes.decode("UTF-8")
    return base64_string

def b64Decode(code):
    base64_bytes = code.encode("UTF-8")

    string_bytes = base64.b64decode(base64_bytes)
    de_string = string_bytes.decode("UTF-8")
    return de_string

def getUser(userName):
    return User.query.filter_by(username=userName).first()

if __name__ == "__main__":
    app.run(debug=True,host="127.0.0.1",port=54733)

