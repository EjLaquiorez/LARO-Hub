from django.urls import path
from .views import UserCreate, UserRetrieveUpdateDestroy, RegisterView, LoginView, LogoutView, GameMatchView, current_user_view, ConversationAPI, MessageAPI
from .court_views import CourtListCreateView, CourtDetailView

urlpatterns = [
    # User management
    path("users/", UserCreate.as_view(), name="user-create"),
    path('current-user/', current_user_view, name='current-user'),
    path("users/<int:pk>/", UserRetrieveUpdateDestroy.as_view(), name="user-update"),

    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Games
    path('games/', GameMatchView.as_view(), name='game-matches-list'),
    path('games/<int:game_id>/', GameMatchView.as_view(), name='game-match-detail'),

    # Courts
    path('courts/', CourtListCreateView.as_view(), name='court-list-create'),
    path('courts/<int:pk>/', CourtDetailView.as_view(), name='court-detail'),

    # Messaging
    path('conversations/', ConversationAPI.as_view(), name='conversation-list'),
    path('conversations/<int:conversation_id>/', ConversationAPI.as_view(), name='conversation-detail'),
    path('conversations/<int:conversation_id>/messages/', MessageAPI.as_view(), name='message-list'),
]