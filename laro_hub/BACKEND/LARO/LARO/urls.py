"""
URL configuration for LARO project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.views import APIView
from API.template_views import index_view, dashboard_view, login_view, signup_view, overview_view, profile_view, notifications_view, user_profile_view

# Swagger settings
swagger_settings = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    },
    'USE_SESSION_AUTH': False
}

# API Documentation schema
schema_view = get_schema_view(
    openapi.Info(
        title="LARO API",
        default_version='v1',
        description="API documentation for LARO project",
        contact=openapi.Contact(email="admin@example.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

class LoginView(APIView):
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email', 'password'],
            properties={
                'email': 'sample@gmail.com',
                'password': 'sample123',
            }
        ),
        responses={
            200: 'Returns tokens and user data',
            401: 'Invalid credentials'
        },
        operation_description="Login with email and password to get JWT tokens"
    )
    def post(self, request):
        """
        Login endpoint that returns JWT tokens
        """
        # ... your existing code ...

# URL Patterns
urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API endpoints
    path("api/", include("API.urls")),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Swagger URLs
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # Template views
    path('', index_view, name='index'),
    path('index.html', index_view, name='index_html'),
    path('dashboard/', dashboard_view, name='dashboard'),
    path('dashboard.html', dashboard_view, name='dashboard_html'),
    path('login/', login_view, name='login_page'),
    path('login.html', login_view, name='login_html'),
    path('signup/', signup_view, name='signup_page'),
    path('signup.html', signup_view, name='signup_html'),
    path('overview/', overview_view, name='overview'),
    path('overview.html', overview_view, name='overview_html'),
    path('profile/', profile_view, name='profile'),
    path('profile.html', profile_view, name='profile_html'),
    path('notifications/', notifications_view, name='notifications'),
    path('notifications.html', notifications_view, name='notifications_html'),
    path('user_profile/', user_profile_view, name='user_profile'),
    path('user_profile.html', user_profile_view, name='user_profile_html'),
]
