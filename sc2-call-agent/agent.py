import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv, dotenv_values
from livekit import agents
from livekit import rtc, api
from livekit.agents import (
    AgentSession,
    Agent,
    JobContext,
    function_tool,
    RunContext,
    get_job_context,
    cli,
    WorkerOptions,
    RoomInputOptions,
    AutoSubscribe,
    ChatContext,
    ChatMessage,
)
from openai import OpenAI
from livekit.plugins import (
    google
)
from livekit.plugins import noise_cancellation
from livekit.plugins import openai
from livekit import api, rtc
from livekit.agents import get_job_context
import json
load_dotenv()
import random
import os
import logging
import pymongo
from bson import ObjectId
import requests
from urllib.parse import urlparse
# from livekit.plugins.turn_detector.multilingual import MultilingualModel
import subprocess
from io import BytesIO
from deep_translator import GoogleTranslator
import requests
from livekit.plugins import sarvam
from livekit.plugins import silero  # or another VAD provider
from livekit.agents import stt
from livekit.agents import BackgroundAudioPlayer, AudioConfig, BuiltinAudioClip
from pinecone import Pinecone, ServerlessSpec

# Load .env values
load_dotenv()
env = dotenv_values(".env")

# pc = Pinecone(
#         api_key=env.get("PINECONE_API_KEY")
#     )
# pinecone_index = pc.Index(env.get("PINECONE_INDEX"))
# embedder = OpenAI(api_key=env.get("OPENAI_API_KEY"))

pinecone_index = None
embedder = None

def _init_clients(env):
    global pinecone_index, embedder
    pc = Pinecone(api_key=env.get("PINECONE_API_KEY"))
    pinecone_index = pc.Index(env.get("PINECONE_INDEX"))
    embedder = OpenAI(api_key=env.get("OPENAI_API_KEY"))

logger = logging.getLogger("make-call")
logger.setLevel(logging.INFO)

room_name = "my-room"

class Assistant(Agent):
    def __init__(self, chat_ctx: ChatContext, phone_number=None, cust_name="Customer",language=None, cust_details=None, product_details=None) -> None:
        self.phone_number = phone_number
        self.cust_name = cust_name
        self.cust_details = cust_details or {}
        self.product_details = product_details or {}
        self.language = language 

        super().__init__(
            instructions=f"""You are a Veena , Bank Manager from Bank of Status Code 2. Respond in plain text only. Do NOT use any Markdown: no *, **, _, backticks, headings, lists, or code fences. Just unformatted text. You are Veena, Product Manager from Bank of Status Code 2 calling {self.cust_name}. Your task is to engage them in a natural, polite, and persuasive conversation about {self.product_details.get('name1', 'our product')}.
            If you are unsure or lack knowledge about a question, think and tell the user “I should lookup”, then call {self.lookup_information_from_pinecone} with the users query. After retrieving context, use it to answer accurately. Avoid repetition, jargon, or being overly pushy. Encourage next steps.
            Talk in {language} only.""",
            chat_ctx=chat_ctx,
            tts=sarvam.TTS( model="bulbul:v2",
      target_language_code=f"{language}",
      speaker="manisha",
      api_key=env.get("SARVAM_API_KEY"),enable_preprocessing=True,
   ), llm=openai.LLM(
        model="gpt-4o-mini",
        temperature=0.4,
   
    ),
    stt=sarvam.STT(
            model="saarika:v2.5",
            api_key=env.get("SARVAM_API_KEY"),
            language=f"""{language}""",
        ),
        )

    @function_tool(name="lookup_information_from_pinecone", description="Retrieve relevant info from vector DB")
    async def lookup_information_from_pinecone(self, context: RunContext, query: str) -> str:
        try:
            translated = GoogleTranslator(source='auto', target='en').translate(query)
            print(f"Translated to English: {translated}")
        except Exception as e:
            logger.error(f"Translation failed: {e}")
            translated = query
        response = embedder.embeddings.create(input=translated, model="text-embedding-ada-002")
        vec = response.data[0].embedding
        res = pinecone_index.query(vector=vec, top_k=10, include_metadata=True, namespace='axis-products')
        print(f"Querying Pinecone with vector: {vec[:5]}...")  # Print first 5 elements for brevity
        print(f"Query response: {res}")
        texts = [m.metadata.get("text", "") for m in res.matches]
        print(f"Retrieved {len(texts)} documents from Pinecone for query: {query}")
        print(f"Documents: {texts}")
        return "\n\n".join(texts)
    
    # async def on_user_turn_completed(self, turn_ctx: ChatContext, new_message: ChatMessage) -> None:
    #     user_text = new_message.text_content()  # get user text
    #     info = await self.lookup_info(context=turn_ctx.fnc_ctx, query=user_text)  # use turn_ctx.fnc_ctx
    #     if info:
    #         turn_ctx.add_message(role="assistant", content=f"Additional context:\n{info}")

TRANSCRIPT_PATH = os.getenv("TRANSCRIPT_PATH", "/tmp/sc2/file.json")  # portable default

def _ensure_parent(path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)


async def write_transcript(ctx, session=None, path: str = TRANSCRIPT_PATH):
    logger.info("writing transcript")
    logger.info(f"target transcript path: {path}")
    try:
        _ensure_parent(path)
        if session and hasattr(session, "history"):
            with open(path, "w") as f:
                json.dump(session.history.to_dict(), f, indent=2)
            logger.info(f"Transcript for {ctx.room.name} saved to {path}")
        else:
            logger.info(f"No session history available yet for {ctx.room.name}")
    except Exception as e:
        logger.exception(f"Failed to write transcript to {path}: {e}")

async def start_room_egress(ctx):
    """Start room composite egress to record the call conversation."""
    try:
        logger.info("Starting room composite egress")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename_prefix = f"call-recording-{ctx.room.name}-{timestamp}"
        
        req = api.RoomCompositeEgressRequest(
            room_name=ctx.room.name,
            audio_only=True,
            segment_outputs=[api.SegmentedFileOutput(
                filename_prefix=filename_prefix,
                playlist_name=f"{filename_prefix}.m3u8",
                live_playlist_name=f"{filename_prefix}-live.m3u8",
                segment_duration=600,
                azure=api.AzureBlobUpload(
                    account_name="ringstoragesagnik",
                    container_name="recordings",
                    account_key="0Ifyw0M+GenoUS86FN9a1Fo/yTmDsjh/TwomrCkWnZdFc2FGSyJQPYSxFLzd9LIlFXM2RuI33K/D+AStf+ie8g==",
                )
            )],
        )
        
        # Use the context API to start egress
        egress_response = await ctx.api.egress.start_room_composite_egress(req)
        logger.info(f"Egress started with ID: {egress_response.egress_id}")
        return egress_response.egress_id
        
    except api.TwirpError as e:
        logger.error(f"Failed to start egress: {e.message}")
        return None

def store_egress_data_in_mongo(cust_name, phone_number, customer_id, egress_data, product_name):
    client = pymongo.MongoClient("mongodb+srv://swapsb003:swappy@cluster0.rqewtye.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    db = client["test"]
    collection = db["records"]
    record = {
        "cust_name": cust_name,
        "phone_number": phone_number,
        "customer_id": customer_id,
        "product_name": product_name,
        "egress_id": egress_data.get("egress_id"),
        "started_at": egress_data.get("started_at"),
        "ended_at": egress_data.get("ended_at"),
        "segments": []
    }
    
    # Azure Blob Storage configuration
    storage_account = "ringstoragesagnik"
    container_name = "recordings"
    
    for playlist in egress_data.get("playlists", []):
        for seg in playlist.get("segments", []):
            segment_location = seg.get("location")
            if segment_location:
                # Remove any leading slash and construct proper Azure Blob URL
                blob_path = segment_location.lstrip('/')
                if not segment_location.startswith("https://"):
                    # Construct full Azure Blob Storage URL
                    full_url = f"https://{storage_account}.blob.core.windows.net/{container_name}/{blob_path}"
                else:
                    full_url = segment_location
                
                # Fix segment URL to ensure it includes "/recordings/" path
                if "blob.core.windows.net/" in full_url and "/recordings/" not in full_url:
                    # Insert "/recordings/" after the storage account name
                    parts = full_url.split("blob.core.windows.net/")
                    if len(parts) == 2:
                        full_url = f"{parts[0]}blob.core.windows.net/recordings/{parts[1]}"
                        logger.info(f"Fixed segment URL: {full_url}")
                
                record["segments"].append(full_url)
                logger.info(f"Added segment URL: {full_url}")
    
    inserted_result = collection.insert_one(record)
    return inserted_result.inserted_id

async def download_and_store_egress_data(cust_name, phone_number, customer_id, egress_json_url, product_name,language_call):
    await asyncio.sleep(20)  # Wait for 20 seconds before making the request
    response = requests.get(egress_json_url)
    if response.status_code == 200:
        egress_json = response.json()
        inserted_id = store_egress_data_in_mongo(cust_name, phone_number, customer_id, egress_json, product_name)
        await transcribe_segments(str(inserted_id),language_call)
    else:
        logger.warning("Failed to fetch egress JSON from Azure Blob")

async def transcribe_segments(record_id: str, language_call):
    """
    1. Retrieve the MongoDB record by its ID.
    2. Read the file.json transcript data.
    3. Update the record with the transcript data.
    """
    client = pymongo.MongoClient("mongodb+srv://swapsb003:swappy@cluster0.rqewtye.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    db = client["test"]
    collection = db["records"]
    
    # Get the record
    record = collection.find_one({"_id": ObjectId(record_id)})
    if not record:
        logger.warning(f"Record not found for ID: {record_id}")
        return
    
    # Path to the file.json
    json_file_path = "/tmp/sc2/file.json"
    
    try:
        # Check if the file exists
        if os.path.exists(json_file_path):
            # Read the file.json content
            with open(json_file_path, 'r') as f:
                transcript_data = json.load(f)
                
            logger.info(f"Successfully read transcript data from {json_file_path}")
            
            # Update the MongoDB record with the transcript data
            collection.update_one(
                {"_id": record["_id"]},
                {"$set": {"transcription": transcript_data}}
            )
            logger.info(f"Updated record {record_id} with transcript data from file.json")
        else:
            logger.warning(f"File not found: {json_file_path}")
    except Exception as e:
        logger.error(f"Error reading or processing file.json: {str(e)}")
        import traceback
        logger.error(f"Detailed error: {traceback.format_exc()}")
    finally:
        client.close()
        
    logger.info(f"Transcript processing completed for record ID: {record_id}")
    

async def on_shutdown(egress_id, cust_name, phone_number, cust_details, product_details, language_call):
    logger.info(f"Shutting down. Processing egress data for {cust_name} with phone {phone_number}")
    await download_and_store_egress_data(
        cust_name,
        phone_number,
        cust_details.get('customerId'),
        f"https://ringstoragesagnik.blob.core.windows.net/recordings/{egress_id}.json",
        product_details.get('name1', 'our product'),
        language_call
    )

async def entrypoint(ctx: JobContext):
    _init_clients(env) 
    logger.info(f"connecting to room {ctx.room.name}")

    await ctx.connect()
    egress_id = await start_room_egress(ctx)
    if egress_id:
        logger.info(f"Recording started with egress ID: {egress_id}")
    # Initial write without session (will be empty at this point)
    await write_transcript(ctx)

    # Add a callback to write the transcript with the session data at shutdown
    ctx.add_shutdown_callback(lambda: write_transcript(ctx, session))

    ctx.add_shutdown_callback(
        lambda: asyncio.create_task(on_shutdown(egress_id, cust_name, phone_number, cust_details, product_details, language_call))
    )

    token = api.AccessToken(env.get('LIVEKIT_API_KEY'),
                        env.get('LIVEKIT_API_SECRET')) \
    .with_identity("identity") \
    .with_name("name") \
    .with_grants(api.VideoGrants(
        room_join=True,
        room="my-room")) \
    .with_sip_grants(api.SIPGrants(
        admin=True,
        call=True)).to_jwt()
    lkapi = api.LiveKitAPI()

    dial_info = json.loads(ctx.job.metadata)
    phone_number = dial_info.get('phone_number', '+919547234545')
    cust_name = dial_info.get('cust_name', 'John Doe')
    language_call = dial_info.get('language', 'bn-IN')
    print("Language:",language_call)
    cust_details = dial_info.get('cust_details', {})
    product_details = dial_info.get('product_details', {})

    initial_ctx = ChatContext()
    initial_ctx.add_message(role="assistant", content=f"""
    Customer Details:
    - Name: {cust_name}
    - Customer ID: {cust_details.get('customerId', 'Not available')}
    - Age: {cust_details.get('age', 'Not available')}
    - Gender: {cust_details.get('gender', 'Not available')}
    - Location: {cust_details.get('location', 'Not available')}
    - Credit Score: {cust_details.get('creditScore', 'Not available')}
    - Estimated Salary: ₹{cust_details.get('estimatedSalary', 'Not available')}
    - Balance: ₹{cust_details.get('balance', 'Not available')}
    - Tenure: {cust_details.get('tenure', 'Not available')} years
    - Active Member: {'Yes' if cust_details.get('activeMember') == 1 else 'No'}
    - Products: {cust_details.get('productNumbers', 'Not available')}
    - Credit Card: {'Yes' if cust_details.get('creditCard') == 1 else 'No'}
    
    Product 1 (Primary Recommendation):
- Product Name: {product_details.get('name1', 'Not available')}
- Category: {product_details.get('category1', 'Not available')}
- Risk Level: {product_details.get('riskLevel1', 'Not available')}
- Description: {product_details.get('description1', 'Not available')}

Product 2 (Alternative):
- Name: {product_details.get('name2', 'Not available')}
- Category: {product_details.get('category2', 'Not available')}
- Risk Level: {product_details.get('riskLevel2', 'Not available')}
- Description: {product_details.get('description2', 'Not available')}

Product 3 (Alternative):
- Name: {product_details.get('name3', 'Not available')}
- Category: {product_details.get('category3', 'Not available')}
- Risk Level: {product_details.get('riskLevel3', 'Not available')}
- Description: {product_details.get('description3', 'Not available')}

- Begin with Product 1. If the customer is not interested or expresses concerns, politely recommend Product 2 as a better-suited alternative. If they still show no interest, offer Product 3 as a final option.
- Tailor the explanation to the customer's profile and financial standing.
- Create interest in at least one of the products.
- Clearly and concisely explain the key benefits and address concerns.
- Maintain a professional, courteous tone.
- Encourage the customer to take the next step (e.g., express interest, schedule a call, or talk to a human agent).

Objective:
- Create interest in the product.
- Explain the product clearly and concisely.
- Address potential objections or concerns.
- Maintain a professional tone and demeanor.
- Encourage the customer to take the next step (e.g., place an order, book a demo, or talk to a human agent).

Avoid:
- Sounding too robotic or overly pushy.
- Repeating the same points.
- Using jargon the customer might not understand.
- Being friendly with the customer.

Talk in {language_call} only.

""")

    sip_participant_identity = phone_number

    vad = silero.VAD.load(min_speech_duration=0.1, min_silence_duration=0.3)

    session = AgentSession(
        tts=sarvam.TTS(
      target_language_code=language_call,
      speaker="manisha",
      api_key=env.get("SARVAM_API_KEY"),
      enable_preprocessing=True,
   ), 
        llm=openai.LLM(
        model="gpt-4o-mini",
        temperature=0.4,
    ),
        stt = sarvam.STT(
        language=language_call,
        model="saarika:v2.5",
        api_key=env.get("SARVAM_API_KEY"),
        
    ),
    turn_detection="vad",
    vad=vad, 
    )

    session_started = asyncio.create_task(
        session.start(
            agent=Assistant(
                chat_ctx=initial_ctx,
                phone_number=phone_number,
                cust_name=cust_name,
                cust_details=cust_details,
                product_details=product_details,
                language=language_call
            ),
            room=ctx.room,
            room_input_options=RoomInputOptions(
                # enable Krisp background voice and noise removal
                noise_cancellation=noise_cancellation.BVC(),
            ),
        )
    )
    try:
        await ctx.api.sip.create_sip_participant(
            api.CreateSIPParticipantRequest(
                room_name=ctx.room.name,
                
                sip_trunk_id='ST_GPHeuKAmga99',
                
                sip_call_to=phone_number,
                participant_identity=sip_participant_identity,
                # function blocks until user answers the call, or if the call fails
                wait_until_answered=True,
            )
        )
        # wait for the agent session start and participant join
        await session_started
        participant = await ctx.wait_for_participant(identity=sip_participant_identity)
        logger.info(f"participant joined: {participant.identity}")
        background_audio = BackgroundAudioPlayer(
            thinking_sound=[
                AudioConfig(BuiltinAudioClip.KEYBOARD_TYPING, volume=0.8),
                AudioConfig(BuiltinAudioClip.KEYBOARD_TYPING2, volume=0.7),
            ],
        )
        await background_audio.start(room=ctx.room, agent_session=session)

    except api.TwirpError as e:
        logger.error(
            f"error creating SIP participant: {e.message}, "
            f"SIP status: {e.metadata.get('sip_status_code')} "
            f"{e.metadata.get('sip_status')}"
        )
        ctx.shutdown()

if __name__ == "__main__":
    
    cli.run_app(WorkerOptions(
        entrypoint_fnc=entrypoint,
        agent_name="my-telephony-agent"
    ))
