from django.urls import path
from .views import (
    UserCreate, UserRetrieveUpdateDestroy, RegisterView, LoginView, LogoutView,
    GameMatchView, current_user_view, ConversationAPI, MessageAPI,
    NotificationAPI, NotificationDetailAPI, mark_all_notifications_read, unread_notification_count
)

urlpatterns = [
    # User management
    path("users/", UserCreate.as_view(), name="user-create"),
    path('current-user/', current_user_view, name='current-user'),
    path("users/<int:pk>/", UserRetrieveUpdateDestroy.as_view(), name="user-update"),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Game management
    path('games/', GameMatchView.as_view(), name='game-matches-list'),
    path('games/<int:game_id>/', GameMatchView.as_view(), name='game-match-detail'),

    # Conversations and messages
    path('conversations/', ConversationAPI.as_view(), name='conversation-list'),
    path('conversations/<int:conversation_id>/', ConversationAPI.as_view(), name='conversation-detail'),
    path('conversations/<int:conversation_id>/messages/', MessageAPI.as_view(), name='message-list'),

    # Notifications
    path('notifications/', NotificationAPI.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', NotificationDetailAPI.as_view(), name='notification-detail'),
    path('notifications/mark-all-read/', mark_all_notifications_read, name='mark-all-notifications-read'),
    path('notifications/unread-count/', unread_notification_count, name='unread-notification-count'),
]