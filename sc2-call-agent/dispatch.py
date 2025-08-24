from fastapi import FastAPI, Request, HTTPException
from livekit import api
from dotenv import load_dotenv
import os, json, uvicorn
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()
room_name = "my-room"  # consider making this unique per call

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.post("/create-dispatch/")
async def create_dispatch(request: Request):
    try:
        data = await request.json()
        metadata_json = json.dumps(data)

        # LiveKit API client — pass your Cloud URL or set LIVEKIT_URL
        lkapi = api.LiveKitAPI(os.getenv("LIVEKIT_URL"))  # e.g. https://<project>.livekit.cloud

        # Create explicit dispatch to your named agent
        dispatch = await lkapi.agent_dispatch.create_dispatch(
            api.CreateAgentDispatchRequest(
                agent_name="my-telephony-agent",
                room=room_name,
                metadata=metadata_json,
            )
        )

        # (optional) see what's in the room right now
        dispatches = await lkapi.agent_dispatch.list_dispatch(room_name=room_name)

        await lkapi.aclose()
        return {
            "message": "Dispatch created successfully",
            "dispatch_id": dispatch.id,     # <-- this is the correct field
            "room": room_name,
            "dispatch_count": len(dispatches),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)