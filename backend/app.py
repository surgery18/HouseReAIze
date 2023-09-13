from flask import Flask, jsonify, send_from_directory, request
# from gtts import gTTS
import os
import hashlib
import json
from elevenlabs import set_api_key, generate
from dotenv import load_dotenv
import openai
from pymongo import MongoClient
# from flask_cors import CORS
import w3storage
import certifi

load_dotenv('.env')

cwd = os.path.dirname(os.path.realpath(__file__))
site_path = os.path.abspath(cwd + "/../frontend/dist")

set_api_key(os.getenv('ELEVENLABS_API_KEY'))
# openai.api_key = os.getenv('OPENAI_API_KEY')
w3 = w3storage.API(token=os.getenv('W3STORAGE_API_KEY'))

client = MongoClient(
    f'mongodb+srv://{os.environ.get("MONGODB_USER")}:{os.environ.get("MONGODB_PASSWORD")}@{os.environ.get("MONGODB_HOST")}/?retryWrites=true&w=majority',
    tlsCAFile=certifi.where()
)

app = Flask(__name__)
# CORS(app)

db = client["db"]
scripts_collection = db['scripts']

# AUDIO_FOLDER = cwd+'/tts'
# if not os.path.exists(AUDIO_FOLDER):
#     os.mkdir(AUDIO_FOLDER)

ttsmap = {
    'house': 'Matthew',
    'chase': 'Charlie',
    'wilson': 'Arnold',
    'cuddy': 'Bella',
    'cameron': 'Elli',
    'patient': 'Adam',
}

#load request.md file into memory
reqData = ""
with open(cwd+'/request.md', 'r') as f:
     reqData = f.read()

def generate_hash(text):
    """Generate a hash for the given text."""
    return hashlib.md5(text.encode()).hexdigest()

@app.route('/api/episode/<path:hash>', methods=['GET'])
def fetch_episode(hash):
    data = scripts_collection.find_one({'url': hash})
    if data:
        #convert script to json
        # script = json.loads(data['script'])
        script = data['script']
        # return jsonify(data['script']['title'])
        for entry in script["timeline"]:
            # action = entry.get('action', entry)
            action = entry.get('action')
            cid = action.get('audio_cid')
            if cid:
                action['audio_url'] = "https://" + cid + '.ipfs.dweb.link'
                # action['audio_url'] = f"https://ipfs.io/ipfs/{cid}"
               
        #increase view count
        scripts_collection.update_one({'_id': data['_id']}, {'$inc': {'views': 1}})
        

        data['_id'] = str(data['_id'])
        data['script'] = script
        return jsonify(data)
    return jsonify({'ok': False}), 404
    
@app.route('/api/fix-tts/<path:hash>', methods=['GET'])
def fix_episode(hash):
    data = scripts_collection.find_one({'url': hash})
    if data:
        script = data['script']
        for entry in script["timeline"]:
            action = entry.get('action')
            character = action.get('character')
            #to lowercase
            dialogue = action.get('dialogue', None)
            if dialogue and character:
                hash = generate_hash(dialogue)
                fn = f"{hash}.mp3"

                # Generate TTS
                ttsv = ttsmap[character.lower()]
                audio = generate(text=dialogue, voice=ttsv)

                #upload to IPFS
                ipfs = w3.post_upload(fn, audio)
                action['audio_cid'] = ipfs
                action['audio_file'] = fn

        #increase view count
        scripts_collection.update_one({'_id': data['_id']}, {'$set': {'script': script}})
    return jsonify({'ok': True})

@app.route('/api/generate_episode', methods=['POST'])
def generate_episode():
    topic = request.json.get('topic', 'Generate episode')
    api_key = request.json.get('apikey', None)
    if api_key is None:
        return jsonify({'error': 'KEY MUST BE PRESENT'}), 400
    #call openai gpt4 to generate episode
    script = {}
    openai.api_key = api_key
    response = openai.ChatCompletion.create(
         model="gpt-4",
         messages=[
              {
                   "role": "system",
                   "content": reqData
              },
              {
                   "role": "user",
                   "content": topic
              }
         ]
    )
    
    # print(response)
    data = response["choices"][0]["message"]["content"]
    #get hash of the pure response
    url = generate_hash(data)
    print(data)
    print(url)
    #attach audio files
    script = json.loads(data)

    #generate the URL for this script
    _id = scripts_collection.insert_one({
        'url': url,
        'script': script,
        'views': 0,
    })
    
    for entry in script["timeline"]:
        # action = entry.get('action', entry)
        action = entry.get('action')
        character = action.get('character')
        #to lowercase
        dialogue = action.get('dialogue', None)
        if dialogue and character:
            hash = generate_hash(dialogue)
            fn = f"{hash}.mp3"

            # Generate TTS
            ttsv = ttsmap[character.lower()]
            audio = generate(text=dialogue, voice=ttsv)

            #upload to IPFS
            ipfs = w3.post_upload(fn, audio)
            action['audio_cid'] = ipfs
            action['audio_file'] = fn

    print("Updating entry")
    scripts_collection.update_one({'_id': _id.inserted_id}, {'$set': {'script': script}})
    print("Done")

    for entry in script["timeline"]:
        action = entry.get('action')
        cid = action.get('audio_cid')
        if cid:
            action['audio_url'] = "https://" + cid + '.ipfs.dweb.link'

    # response = jsonify(script)
    response = jsonify({'_id': str(_id.inserted_id), 'url': url, 'script': script, 'views': 0})
    # response.headers.add('Access-Control-Allow-Origin', '*')
    return response

# @app.route('/tts/<path:filename>', methods=['GET'])
# def fetch_tts_file(filename):
#     response = send_from_directory(AUDIO_FOLDER, filename, as_attachment=True)
#     response.headers['Access-Control-Allow-Origin'] = '*'
#     return response

@app.route('/api/latest-episodes', methods=['GET'])
def latest_episodes():
    episodes = scripts_collection.find().sort('_id', -1).limit(5)
    episodes = list(episodes)
    data = []
    for episode in episodes:
        data.append({
            'url': episode['url'],
            'title': episode['script']['title'],
            'views': episode['views'],
        })
    return jsonify(data)

@app.route('/api/episodes', methods=['GET'])
def all_episodes():
    episodes = scripts_collection.find().sort('_id', -1)
    episodes = list(episodes)
    data = []
    for episode in episodes:
        data.append({
            'url': episode['url'],
            'title': episode['script']['title'],
            'views': episode['views'],
        })
    return jsonify(data)


@app.route('/hello', methods=['GET'])
def hello():
    return "Hello, World!"

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path):
    # print(site_path, path)
    try:
        return send_from_directory(site_path, path)
    except:
        return send_from_directory(site_path, "index.html")


# Return 404 error if file not found
@app.errorhandler(404)
def not_found_error(error):
    # return send_from_directory(customer_site_path, 'index.html')
    return send_from_directory(site_path, "index.html")


if __name__ == "__main__":
    app.run(debug=True,host="0.0.0.0")