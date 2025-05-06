import os
import json
import base64
import shutil

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

def readJsonFile(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)  # 解析 JSON
        return data

def writeJsonFile(file_path,data):
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def init(template,dir,name):
    userFolder = os.path.join(dir,str(name))
    # 如果目標資料夾已存在，先刪除
    if os.path.exists(userFolder):
        shutil.rmtree(userFolder)

    shutil.copytree(template, userFolder)  # 複製資料夾
    print(f"資料夾已複製到 {userFolder}")

if __name__ == "__main__":
    print("tool test")