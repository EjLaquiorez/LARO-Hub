from django.urls import path
from .views import UserCreate, UserRetrieveUpdateDestroy, RegisterView, LoginView, LogoutView, GameMatchView

urlpatterns = [
    path("users/", UserCreate.as_view(), name="user-create"),
    path("users/<int:pk>/", UserRetrieveUpdateDestroy.as_view(), name="user-update"),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('games/', GameMatchView.as_view(), name='game-matches-list'),
    path('games/<int:game_id>/', GameMatchView.as_view(), name='game-match-detail'),
]