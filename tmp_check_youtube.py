import os
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

load_dotenv()
refresh_token = os.getenv('YOUTUBE_REFRESH_TOKEN')
client_id = os.getenv('YOUTUBE_CLIENT_ID')
client_secret = os.getenv('YOUTUBE_CLIENT_SECRET')
print('refresh', bool(refresh_token))
print('client_id', bool(client_id))
print('secret', bool(client_secret))

creds = Credentials(
    token=None,
    refresh_token=refresh_token,
    client_id=client_id,
    client_secret=client_secret,
    token_uri='https://oauth2.googleapis.com/token',
)
service = build('youtube', 'v3', credentials=creds)
resp = service.channels().list(part='id,snippet', mine=True).execute()
print(resp)
