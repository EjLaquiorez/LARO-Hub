from django.urls import path , include
from . import views 
urlpatterns = [
     path('chat/<int:user_id>/', views.chat_room, name='chat'),
      path('chat/lobby/', views.chat_room, {'room_name': 'lobby'}, name='chat_lobby'),  # Static lobby route
]