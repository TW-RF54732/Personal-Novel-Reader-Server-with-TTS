import os
import shutil

DATA_BASE_PATH = 'instance'
USER_PATH = 'users'

def clear_folder(folder_path):
    # 確保資料夾存在
    if os.path.exists(folder_path):
        # 刪除資料夾內的所有檔案和子資料夾
        for item in os.listdir(folder_path):
            item_path = os.path.join(folder_path, item)
            if os.path.isdir(item_path):
                shutil.rmtree(item_path)  # 刪除子資料夾
            else:
                os.remove(item_path)  # 刪除檔案
        print(f"✅ 資料夾 '{folder_path}' 已清空")
    else:
        print(f"⚠️ 資料夾 '{folder_path}' 不存在")

# 使用範例
clear_folder(DATA_BASE_PATH)
clear_folder(USER_PATH)