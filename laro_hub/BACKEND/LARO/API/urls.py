from django.urls import path
from .views import UserCreate, UserRetrieveUpdateDestroy, RegisterView, LoginView, LogoutView, GameMatchView, current_user_view, ConversationAPI, MessageAPI

urlpatterns = [
    path("users/", UserCreate.as_view(), name="user-create"),
    path('current-user/', current_user_view, name='current-user'),
    path("users/<int:pk>/", UserRetrieveUpdateDestroy.as_view(), name="user-update"),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('games/', GameMatchView.as_view(), name='game-matches-list'),
    path('games/<int:game_id>/', GameMatchView.as_view(), name='game-match-detail'),
    path('conversations/', ConversationAPI.as_view(), name='conversation-list'),
    path('conversations/<int:conversation_id>/', ConversationAPI.as_view(), name='conversation-detail'),
    path('conversations/<int:conversation_id>/messages/', MessageAPI.as_view(), name='message-list'),
]