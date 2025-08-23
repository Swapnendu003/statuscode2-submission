import asyncio

from livekit import api
from livekit.protocol.sip import CreateSIPOutboundTrunkRequest, SIPOutboundTrunkInfo
from livekit import api
import os

from dotenv import load_dotenv
load_dotenv()
async def main():
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
  livekit_api = api.LiveKitAPI()

  trunk = SIPOutboundTrunkInfo(
    name = "Test trunk",
    address = "new-02.pstn.twilio.com",
    numbers = ['+15418349832'],
    auth_username = "cse2022044",
    auth_password = "Password@123"
  )

  request = CreateSIPOutboundTrunkRequest(
    trunk = trunk
  )

  trunk = await livekit_api.sip.create_sip_outbound_trunk(request)

  print(f"Successfully created {trunk}")

  await livekit_api.aclose()

asyncio.run(main())