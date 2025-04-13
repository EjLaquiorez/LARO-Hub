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
from django.contrib.auth import views as auth_views
from django.urls import path, re_path ,include
from rest_framework_simplejwt.views import TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from drf_yasg.utils import swagger_auto_schema
from rest_framework.views import APIView
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

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
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('login/', TemplateView.as_view(template_name='login.html'), name='login'),
    path('dashboard/', TemplateView.as_view(template_name='dashboard.html'), name='dashboard'),
    
    # API endpoints
    path('api/', include('API.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Swagger URLs
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
