import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv
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
from livekit.plugins.turn_detector.multilingual import MultilingualModel
import subprocess
from io import BytesIO
import requests
from livekit.plugins import sarvam
from livekit.plugins import silero  # or another VAD provider
from livekit.agents import stt
from livekit.agents import BackgroundAudioPlayer, AudioConfig, BuiltinAudioClip
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
            instructions=f"""You are a Ring , Bank Manager from Bank of RCC. Respond in plain text only. Do NOT use any Markdown: no *, **, _, backticks, headings, lists, or code fences. Just unformatted text. You are Ring, Product Manager from Bank of RCC calling {self.cust_name}. Your task is to engage them in a natural, polite, and persuasive conversation about {self.product_details.get('name', 'our product')}.
            If you are unsure or lack knowledge about a question, think and tell the user “I should lookup”, then call {self.lookup_information_from_pinecone} with the users query. After retrieving context, use it to answer accurately. Avoid repetition, jargon, or being overly pushy. Encourage next steps.
             IMPORTANT: If the customer says they are busy, not interested right now, or wants to talk later, use the {self.schedule_followup_call} function to schedule a follow-up call. Also use this function if the customer shows interest and wants to continue the conversation later.
            When scheduling a call, ask the customer for their preferred time (day and time) and use that information when calling the scheduling function.
            
Talk in {language} only."""
            ,chat_ctx=chat_ctx,
             tts=sarvam.TTS( model="bulbul:v2",
      target_language_code=f"{language}",
      speaker="manisha",
      api_key=os.getenv("SARVAM_API_KEY"),enable_preprocessing=True,
   ), llm=openai.LLM(
        model="gpt-4o-mini",
        temperature=0.4,
   
    ),
    stt=sarvam.STT(
            model="saarika:v2.5",
            api_key=os.getenv("SARVAM_API_KEY"),
            language=f"""{language}""",
        ),
        )

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
                    account_key=os.getenv("AZURE_BLOB_KEY"),
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


async def entrypoint(ctx: JobContext):
    logger.info(f"connecting to room {ctx.room.name}")

    await ctx.connect()
    egress_id = await start_room_egress(ctx)
    if egress_id:
        logger.info(f"Recording started with egress ID: {egress_id}")


    token = api.AccessToken(os.getenv('LIVEKIT_API_KEY'),
                        os.getenv('LIVEKIT_API_SECRET')) \
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
      api_key=os.getenv("SARVAM_API_KEY"),
      enable_preprocessing=True,
   ), 
        llm=openai.LLM(
        model="gpt-4o-mini",
        temperature=0.4,
    ),
        stt = sarvam.STT(
        language=language_call,
        model="saarika:v2.5",
        api_key=os.getenv("SARVAM_API_KEY"),
        
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
                # noise_cancellation=noise_cancellation.BVC(),
            ),
        )
    )
    try:
        await ctx.api.sip.create_sip_participant(
            api.CreateSIPParticipantRequest(
                room_name=ctx.room.name,
                
                sip_call_to=phone_number,
                participant_identity=sip_participant_identity,
                # function blocks until user answers the call, or if the call fails
                wait_until_answered=True,
            )
        )
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
