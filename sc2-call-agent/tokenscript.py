# save as mint_calendar_token.py and run locally (NOT in Cloud)
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
import json

SCOPES = ['https://www.googleapis.com/auth/calendar']
flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
# ensure refresh token is issued
creds = flow.run_local_server(port=0, access_type='offline', prompt='consent')  # passes through to authorization_url
print(creds.to_json())
