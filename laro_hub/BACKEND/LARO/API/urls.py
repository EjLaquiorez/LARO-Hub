from django.urls import path
from .views import UserCreate, UserRetrieveUpdateDestroy, RegisterView, LoginView, LogoutView

urlpatterns = [
    path("users/", UserCreate.as_view(), name="user-create"),
    path("users/<int:pk>/", UserRetrieveUpdateDestroy.as_view(), name="user-update"),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]