TTS_URL = "127.0.0.1:9880"

#TTS static Setting
referWavPath = "D:/vscode/GVITS/GPT-SoVITS-beta/GPT-SoVITS-beta0706/SetUp/Anoke/Anoke_SetupVoice.wav";#temp data, this sould be setup in server not client
referText = "那至少是有一点好处，跟你说，他除了为自己乞讨以外，他还为他朋友帮他去乞讨。";#temp data, this sould be setup in server not client
promptLanguage = "zh"

def makeTTS_URL_GET(text,textLanguage,referWavPath = referWavPath,referText=referText,promptLanguage=promptLanguage):# GPT_SoVITS API
    url = f'http://{TTS_URL}?refer_wav_path={referWavPath}&prompt_text={referText}&prompt_language={promptLanguage}&text={text}&text_language={textLanguage}'
    return url