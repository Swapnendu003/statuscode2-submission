from fastapi import FastAPI, Request, HTTPException
from livekit import api
from dotenv import load_dotenv
import os
import json
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()
room_name = "my-room"

# Configure CORS properly - move it before any routes
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # You can replace * with specific origins
#     allow_credentials=True,
#     allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
#     allow_headers=["*"],
#     expose_headers=["*"],
# )
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # try setting specific domains later
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.post("/create-dispatch/")
async def create_dispatch(request: Request):
    try:
        data = await request.json()  # Expect full JSON like the one you posted

        # Generate LiveKit access token
        token = api.AccessToken(
            os.getenv('LIVEKIT_API_KEY'),
            os.getenv('LIVEKIT_API_SECRET')
        ).with_identity("identity") \
         .with_name("name") \
         .with_grants(api.VideoGrants(room_join=True, room=room_name)) \
         .with_sip_grants(api.SIPGrants(admin=True, call=True)) \
         .to_jwt()

        # Initialize LiveKit API client
        lkapi = api.LiveKitAPI()

        # Convert metadata to JSON string
        metadata_json = json.dumps(data)
        print(f"Metadata JSON: {metadata_json}")

        # Create agent dispatch
        dispatch = await lkapi.agent_dispatch.create_dispatch(
            api.CreateAgentDispatchRequest(
                agent_name="my-telephony-agent",
                room=room_name,
                metadata=metadata_json
            )
        )

        # List dispatches in the room
        dispatches = await lkapi.agent_dispatch.list_dispatch(room_name=room_name)

        # Close LiveKit API session
        await lkapi.aclose()

        return {
            "message": "Dispatch created successfully",
            "dispatch_count": len(dispatches)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
