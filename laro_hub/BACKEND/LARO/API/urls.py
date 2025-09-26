from django.urls import path
from .views import UserCreate, UserRetrieveUpdateDestroy, RegisterView, LoginView, LogoutView, GameMatchView, current_user_view, set_csrf_token_view
from django.contrib.auth import views as auth_views

urlpatterns = [
    path("users/", UserCreate.as_view(), name="user-create"),
    path('current-user/', current_user_view, name='current-user'),
    path("users/<int:pk>/", UserRetrieveUpdateDestroy.as_view(), name="user-update"),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login_api'),
    path('set-csrf-token/', set_csrf_token_view, name='set-csrf-token'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('games/', GameMatchView.as_view(), name='game-matches-list'),
    path('games/<int:game_id>/', GameMatchView.as_view(), name='game-match-detail')
]