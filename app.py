#Main file! Start the server here.
import readerTools as rt
from flask import Flask ,request,send_file,send_from_directory,jsonify,make_response,redirect,url_for,render_template
import requests
import json
import io
import os
import uuid
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager,unset_jwt_cookies, set_access_cookies,create_access_token, jwt_required, get_jwt_identity,verify_jwt_in_request
import shutil
from datetime import timedelta
# from werkzeug.utils import secure_filename
#Set
app=Flask(__name__)

app.config["JWT_SECRET_KEY"] = "@_nu-Ssjtf49K@S想ㄅㄨㄉㄠ8"  # JWT 簽名密鑰（需要自訂強大KEY）
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]  # 只允許從 Cookie 讀取 JWT
app.config["JWT_COOKIE_SECURE"] = False  # True 表示只允許 HTTPS（開發時設 False）
app.config["JWT_COOKIE_CSRF_PROTECT"] = False  # 防止 CSRF（可選，開發時關閉）
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"  # SQLite
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
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

@app.route("/login")
def loginPage():
    return render_template("Login.html")  # 這裡回傳 HTML

@app.route('/register')
def registerPage():
    return render_template('Register.html')

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

@app.route("/reading")
@jwt_required()
def readingPage():
    return render_template("Reading.html")

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

@app.route('/get_txt',methods=['POST'])
@jwt_required()
def get_txt():
    data = request.get_json()
    currentUser = get_jwt_identity()
    user = getUser(currentUser)
    bookName = data.get("bookName")
    chrName = data.get("chrName")
    bookFolderPath = os.path.join(USER_DIR,user.user_id,rt.b64Encode(bookName))
    
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
    rt.init(TEMPLATE_USER,USER_DIR,user.user_id)

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
@jwt_required()
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
    if not user or not bcrypt.check_password_hash(user.password, Password):
        return jsonify({"error": "帳號或密碼錯誤"}), 401
    else:
        rt.init(TEMPLATE_USER,USER_DIR,user.user_id)
        return jsonify({"Success": "使用者以格式化"}),200

@app.route("/api/delete_user", methods=["POST"])
@jwt_required()
def delete_user():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()

    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "使用者已刪除"}), 200
    
    logoutResponse = make_response(jsonify({"error": "使用者不存在"}))
    unset_jwt_cookies(logoutResponse)
    return logoutResponse, 404

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
        logoutResponse = make_response(jsonify({"error": "未授權"}))
        unset_jwt_cookies(logoutResponse)
        return logoutResponse, 401
    user_ID = user.user_id

    setting_path = os.path.join(USER_DIR,f'{user_ID}/userData.json')
    return send_file(setting_path,mimetype="application/json")

@app.route("/api/user/saveData",methods=['POST'])
@jwt_required()
def saveData():
    current_user = get_jwt_identity()
    user = getUser(current_user)
    if not user:
        logoutResponse = make_response(jsonify({"error": "未授權"}))
        unset_jwt_cookies(logoutResponse)
        return logoutResponse, 401
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
        logoutResponse = make_response(jsonify({"error": "未授權"}))
        unset_jwt_cookies(logoutResponse)
        return logoutResponse, 401
    
    user_book_path = os.path.join(USER_DIR,user.user_id,'books')
    dirName = data.get('folderName')
    b64dirName = rt.b64Encode(dirName)

    theBook = os.path.join(user_book_path,b64dirName)
    if os.path.isdir(theBook):
        print("資料夾已存在")
        return jsonify({"error": "資料夾已存在"}), 409
    
    rt.init(TEMPLATE_BOOK,user_book_path,b64dirName)
    
    print(f"資料夾已複製到 {user_book_path}")

    data_path = os.path.join(theBook,"data.json")
    print(data_path)
    data = rt.readJsonFile(data_path)
    if(not data):
        print(f"初始化 {b64dirName} 失敗")
        return jsonify({"error": "初始化失敗"}), 409
    
    data["bookName"] = dirName
    rt.writeJsonFile(data_path,data)

    return jsonify({"Success": f"已創建: {b64dirName}"}), 200

@app.route('/api/user/deleteFolder',methods=["POST"])
@jwt_required()
def DeleteFolder():
    data = request.get_json()

    current_user = get_jwt_identity()  # 取得 JWT 內的 username
    user = getUser(current_user)
    if not user:
        logoutResponse = make_response(jsonify({"error": "未授權"}))
        unset_jwt_cookies(logoutResponse)
        return logoutResponse, 401
    user_ID = user.user_id

    dirName = data.get('folderName')
    if(dirName ==""):
        return jsonify({"error": "資料夾名稱格式錯誤"}), 400
    print(dirName)

    base64_string = rt.b64Encode(dirName)
    user_book_path = os.path.join(USER_DIR,f'{user_ID}/books/{base64_string}')
    
    if os.path.exists(user_book_path):
        shutil.rmtree(user_book_path)  # 刪除整個資料夾及其內容
        print("資料夾已刪除")
    else:
        print("資料夾不存在")
        return jsonify({"error": "資料夾不存在"}), 404

    print(f"已刪除資料夾: {user_book_path}")
    return jsonify({"Success": f"已刪除: {dirName}"}), 200

@app.route('/api/user/renameBookFolder',methods=["POST"])
@jwt_required()
def renameFolder():
    current_user = get_jwt_identity()  # 取得 JWT 內的 username
    user = getUser(current_user)
    
    if not user:
        logoutResponse = make_response(jsonify({"error": "未授權"}))
        unset_jwt_cookies(logoutResponse)
        return logoutResponse, 401
    
    data = request.get_json()
    newName = data.get("newName")
    currentBook = data.get("oldName")

    base64_string = rt.b64Encode(currentBook)
    user_book_path = os.path.join(USER_DIR,f'{user.user_id}/books/{base64_string}')
    base64_string = rt.b64Encode(newName)
    new_user_book_path = os.path.join(USER_DIR,f'{user.user_id}/books/{base64_string}')
    new_book_data_path = os.path.join(new_user_book_path,"data.json")
    if(os.path.exists(new_user_book_path)):
        return jsonify({"error": f"Name{newName} already exit"}),400
    if os.path.exists(user_book_path):
        os.rename(user_book_path,new_user_book_path)
        print(f"資料夾已改名為{newName}")
        bookData = rt.readJsonFile(new_book_data_path)
        bookData["bookName"] = newName
        rt.writeJsonFile(new_book_data_path,bookData)
        print(f'已更新data.json, 書名為{newName}')
        return jsonify(bookData), 200
    else:
        print("資料夾不存在")
        return jsonify({"error": "資料夾不存在不存在"}), 404

@app.route('/api/user/book/uploadChr',methods=["POST"])
@jwt_required()
def uploadChr():
    current_user = get_jwt_identity()
    user = getUser(current_user)
    if not user:
        logoutResponse = make_response(jsonify({"error": "未授權"}))
        unset_jwt_cookies(logoutResponse)
        return logoutResponse, 401
    
    bookName = request.form.get("bookName")
    if not bookName:
        return jsonify({"error": "缺少書名"}), 400
    
    b64BookName = rt.b64Encode(bookName)
    USER_BOOK_DIR = os.path.join(USER_DIR,user.user_id,"books",b64BookName)
    if not os.path.exists(USER_BOOK_DIR):
        return jsonify({"error": "書名有誤或該書不存在"}), 400
    
    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "沒有收到檔案"}), 400
    
    saved_files = []
    for file in files:
        if file.filename.endswith('.txt'):
            file_path = os.path.join(USER_BOOK_DIR, rt.b64Encode(file.filename))
            file.save(file_path)
            saved_files.append(file.filename)

    return jsonify({"saved": saved_files}), 200

# @app.route('/api/user/book/getChrList',methods=["POST"])
# @jwt_required()
# def getChrList():
#     current_user = get_jwt_identity()
#     user = getUser(current_user)

#     data = request.get_json()

#     if not user:
#         logoutResponse = make_response(jsonify({"error": "未授權"}))
#         unset_jwt_cookies(logoutResponse)
#         return logoutResponse, 401
    

#     user_book_path = os.path.join(USER_DIR,user.user_id,'books')
#     dirName = data.get('folderName')
    b64dirName = rt.b64Encode(dirName)



@app.route('/api/user/getFolders',methods=["GET"])
@jwt_required()
def getFolders():
    current_user = get_jwt_identity()  # 取得 JWT 內的 username
    user = User.query.filter_by(username=current_user).first()

    if not user:
        logoutResponse = make_response(jsonify({"error": "未授權"}))
        unset_jwt_cookies(logoutResponse)
        return logoutResponse, 401

    userDir = os.path.join(USER_DIR,user.user_id)
    userBooksDir = os.path.join(userDir,"books")

    if not os.path.exists(userBooksDir):
        return jsonify({"error": "書籍資料夾不存在"}), 404
    
    subfolders_b64 = [entry.name for entry in os.scandir(userBooksDir) if entry.is_dir()]
    subfolders = []
    for encode in subfolders_b64:
        decoded = rt.b64Decode(encode)
        subfolders.append(decoded)

    return jsonify({"folders": subfolders})  # 回傳 JSON
#/Folder
#open book
@app.route('/api/user/book/getBookData',methods=["POST"])
@jwt_required()
def getBookData():
    currentUser = get_jwt_identity()
    user = getUser(currentUser)

    openBookName = request.get_json().get("folderName")

    if not user:
        logoutResponse = make_response(jsonify({"error": "未授權"}))
        unset_jwt_cookies(logoutResponse)
        return logoutResponse, 401
    
    userBooksDir = os.path.join(USER_DIR,user.user_id,"books")
    requestBookDir = os.path.join(userBooksDir,rt.b64Encode(openBookName))
    if(not os.path.exists(os.path.join(requestBookDir,"data.json"))):
        return jsonify({"error": f"{openBookName} 不存在"}), 404

    return send_file(os.path.join(requestBookDir,"data.json"),mimetype="application/json"),200

@app.route("/book",methods=["GET"])
@jwt_required()
def openBook():
    return render_template("book.html")
#/open book
#book
@app.route('/api/user/book/getCover',methods=["POST"])
@jwt_required()
def getCover():
    user = getUser(get_jwt_identity())
    openBookName = request.get_json().get("folderName")

    if not user:
        logoutResponse = make_response(jsonify({"error": "未授權"}))
        unset_jwt_cookies(logoutResponse)
        return logoutResponse, 401
    
    inBookDir = os.path.join(USER_DIR,user.user_id,"books",rt.b64Encode(openBookName))
    coverPath = os.path.join(inBookDir,"image.jpg")
    return send_file(coverPath, mimetype='image/jpg')

@app.route("/api/user/book/uploadCover", methods=["POST"])
@jwt_required()
def upload_cover():
    if "cover" not in request.files or "bookName" not in request.form:
        return jsonify({"error": "缺少參數"}), 400

    user = getUser(get_jwt_identity())
    if not user:
        logoutResponse = make_response(jsonify({"error": "未授權"}))
        unset_jwt_cookies(logoutResponse)
        return logoutResponse, 401
    
    cover = request.files["cover"]  # 取得上傳的圖片
    book_name = request.form["bookName"]  # 取得書名 (string)

    inBookDir = os.path.join(USER_DIR,user.user_id,"books",rt.b64Encode(book_name))

    filename = "image.jpg"  # 用書名當作檔案名稱
    save_path = os.path.join(inBookDir, filename)  
    cover.save(save_path)  # 儲存圖片

    return jsonify({"success": True, "imageUrl": f"/{save_path}"})

@app.route('/api/user/book/saveBookData',methods=["POST"])
@jwt_required()
def saveBookData():
    user = getUser(get_jwt_identity())
    newBookData = request.get_json().get("currentBookData")
    if not user:
        logoutResponse = make_response(jsonify({"error": "未授權"}))
        unset_jwt_cookies(logoutResponse)
        return logoutResponse, 401
    
    if not os.path.exists(os.path.join(USER_DIR,user.user_id,"books",rt.b64Encode(newBookData.get("bookName")))):
        return jsonify({"error": "資料夾不存在"}), 404

    jsonPath = os.path.join(USER_DIR,user.user_id,"books",rt.b64Encode(newBookData.get("bookName")),"data.json")
    rt.jsonOverwrite(jsonPath,newBookData)
    
    return jsonify({"success":"成功更新"}),200

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




def getUser(userName):
    return User.query.filter_by(username=userName).first()


if __name__ == "__main__":
    app.run(debug=True,host="0.0.0.0",port=54733)

