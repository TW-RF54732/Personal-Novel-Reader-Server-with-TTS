TTS_URL = "localhost:9880"

#TTS static Setting
referWavPath = "D:/vscode/GPT-SoVITS-beta1/Sample/proccessed/HaBE/感覺可以睡久一點我就睡了，然後醒來就已經下午兩點鐘了.wav";#temp data, this sould be setup in server not client
referText = "感覺可以睡久一點我就睡了，然後醒來就已經下午兩點鐘了";#temp data, this sould be setup in server not client
promptLanguage = "zh"

def makeTTS_URL_GET(text,textLanguage,referWavPath = referWavPath,referText=referText,promptLanguage=promptLanguage):# GPT_SoVITS API
    url = f'http://{TTS_URL}?refer_wav_path={referWavPath}&prompt_text={referText}&prompt_language={promptLanguage}&text={text}&text_language={textLanguage}'
    return url