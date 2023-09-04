from flask import Flask, jsonify, send_from_directory
from gtts import gTTS
import os
import hashlib
import json
from elevenlabs import set_api_key, generate, save
from dotenv import load_dotenv


load_dotenv('.env')


cwd = os.path.dirname(os.path.realpath(__file__))

set_api_key(os.getenv('ELEVENLABS_API_KEY'))

app = Flask(__name__)

AUDIO_FOLDER = cwd+'/tts'
if not os.path.exists(AUDIO_FOLDER):
    os.mkdir(AUDIO_FOLDER)

# Mock script for demonstration
# script = [
#     {"character": "House", "dialogue": "It's never lupus."},
#     {"character": "Wilson", "dialogue": "You always say that."},
#     {"character": "Cuddy", "dialogue": "House, get to work."}
# ]

script = json.load(open(cwd+'/scripts/test.json'))

ttsmap = {
    'house': 'Matthew',
    'chase': 'Charlie',
    'wilson': 'Arnold',
    'cuddy': 'Bella',
    'cameron': 'Elli',
    'patient': 'Adam',
}


def generate_hash(text):
    """Generate a hash for the given text."""
    return hashlib.md5(text.encode()).hexdigest()

@app.route('/generate_episode', methods=['GET'])
def generate_episode():
    for entry in script["timeline"]:
        for action in entry['actions']:
            character = action.get('character')
            #to lowercase
            dialogue = action.get('dialogue', None)
            if dialogue and character:
                hash = generate_hash(dialogue)
                fn = f"{hash}.mp3"
                action['audio_file'] = fn
                if os.path.exists(os.path.join(AUDIO_FOLDER, fn)):
                    continue
                # Generate TTS
                ttsv = ttsmap[character.lower()]
                audio = generate(text=dialogue, voice=ttsv)
                audio_file = os.path.join(AUDIO_FOLDER, fn) 
                save(audio, audio_file)
                # tts = gTTS(text=dialogue, lang='en')
                # tts.save(audio_file)

    response = jsonify(script)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/tts/<path:filename>', methods=['GET'])
def fetch_tts_file(filename):
    response = send_from_directory(AUDIO_FOLDER, filename, as_attachment=True)
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

if __name__ == "__main__":
    app.run(debug=True)
