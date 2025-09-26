import json
import re
from urllib.parse import unquote_plus
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from .models import Message
from channels.db import database_sync_to_async

User = get_user_model()

_RE_VALID = re.compile(r'[^A-Za-z0-9\-\_\.]')

def _sanitize_for_group(name: str, prefix: str = "chat_", max_len: int = 99) -> str:
    if not name:
        return prefix + "default"
    name = unquote_plus(name)
    name = _RE_VALID.sub('_', name.strip())
    name = name[: max_len - len(prefix)]
    return prefix + (name or "default")


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.current_user_id = self.scope['user'].id
        self.other_user_id = int(self.scope['url_route']['kwargs']['user_id'])

        if self.current_user_id < self.other_user_id:
            self.room_group_name = f'chat_{self.current_user_id}_{self.other_user_id}'
        else:
            self.room_group_name = f'chat_{self.other_user_id}_{self.current_user_id}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        if not self.scope['user'].is_authenticated:
            return
        
        sender_id = self.current_user_id
        receiver_id = self.other_user_id

        await self.save_message(sender_id, receiver_id, message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'sender_id': sender_id,
                'message': message
            }
        )


    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'sender_id': event['sender_id'],
            'message': event['message']
        }))

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, message):
        """
        Fetches user objects from the database using their firstnames
        and saves the new message.
        """
        try:
            sender = User.objects.get(id=sender_id)
            receiver = User.objects.get(id=receiver_id)
            Message.objects.create(sender=sender, receiver=receiver, content=message)
            print(f"Message saved from user {sender_id} to user {receiver_id}")
        except User.DoesNotExist:
            print(f"Error saving message: User not found. Sender ID: {sender_id}, Receiver ID: {receiver_id}")

