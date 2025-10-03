from django.shortcuts import render, redirect
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator

import asyncio
from typing import AsyncGenerator

from .models import User, Game, Team, Court
from .serializers import UserSerializer, GameMatchSerializer, CourtSerializer
from datetime import datetime
from django.db.models import Q


class CourtListCreateView(APIView):
    """
    GET: List all courts
    POST: Create a new court
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        courts = Court.objects.all()
        serializer = CourtSerializer(courts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CourtSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CourtDetailView(APIView):
    """
    GET: Retrieve a specific court
    PUT: Update a court
    DELETE: Delete a court
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Court.objects.get(pk=pk)
        except Court.DoesNotExist:
            return None

    def get(self, request, pk):
        court = self.get_object(pk)
        if not court:
            return Response({'error': 'Court not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CourtSerializer(court)
        return Response(serializer.data)

    def put(self, request, pk):
        court = self.get_object(pk)
        if not court:
            return Response({'error': 'Court not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CourtSerializer(court, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(owner=request.user)  # ensure ownership stays consistent
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        court = self.get_object(pk)
        if not court:
            return Response({'error': 'Court not found'}, status=status.HTTP_404_NOT_FOUND)
        court.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# CRUD Operations for User Management
class UserCreate(APIView):
    """
    Handles bulk user operations:
    GET: List all users in the system
    POST: Create a new user (alternative to registration endpoint)
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Token format: Bearer <token>",
                type=openapi.TYPE_STRING,
                required=True
            ),
            openapi.Parameter(
                'search',
                openapi.IN_QUERY,
                description="Search users by first name or last name",
                type=openapi.TYPE_STRING,
                required=False
            )
        ],
        responses={
            200: UserSerializer(many=True),
            401: 'Unauthorized'
        },
        security=[{'Bearer': []}],
        operation_description="List all users in the system"
    )
    def get(self, request):
        search_query = request.query_params.get('search', '')
        users = User.objects.all()

        if search_query:
            users = users.filter(
                Q(firstname__icontains=search_query) |
                Q(lastname__icontains=search_query)
            ).exclude(id=request.user.id)  # Exclude current user

        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Token format: Bearer <token>",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        request_body=UserSerializer,
        responses={
            201: UserSerializer,
            400: 'Bad request',
            401: 'Unauthorized'
        },
        security=[{'Bearer': []}],
        operation_description="Create a new user"
    )
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserRetrieveUpdateDestroy(APIView):
    """
    Handles individual user operations:
    GET: Retrieve a specific user's details
    PUT: Update a user's information
    DELETE: Remove a user from the system

    Requires user ID (pk) in the URL
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'id',
                openapi.IN_PATH,
                description="User ID",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Token format: Bearer <token>",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: UserSerializer,
            404: 'User not found',
            401: 'Unauthorized'
        },
        security=[{'Bearer': []}],
        operation_description="Get user details by ID"
    )
    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'id',
                openapi.IN_PATH,
                description="User ID",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Token format: Bearer <token>",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: UserSerializer,
            404: 'User not found',
            401: 'Unauthorized'
        },
        security=[{'Bearer': []}],
        operation_description="Get user details by ID"
    )
    def get(self, request, pk):
        user = self.get_object(pk)
        if user is None:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'id',
                openapi.IN_PATH,
                description="User ID",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Token format: Bearer <token>",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        request_body=UserSerializer,
        responses={
            200: UserSerializer,
            400: 'Bad request',
            404: 'User not found',
            401: 'Unauthorized'
        },
        security=[{'Bearer': []}],
        operation_description="Update user details by ID"
    )
    def put(self, request, pk):
        user = self.get_object(pk)
        if user is None:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'id',
                openapi.IN_PATH,
                description="User ID",
                type=openapi.TYPE_INTEGER,
                required=True
            ),
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Token format: Bearer <token>",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            204: 'Successfully deleted',
            404: 'User not found',
            401: 'Unauthorized'
        },
        security=[{'Bearer': []}],
        operation_description="Delete user by ID"
    )
    def delete(self, request, pk):
        user = self.get_object(pk)
        if user is None:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def set_csrf_token_view(request):
    """
    This view doesn't return any data but ensures that the CSRF
    token cookie is set on the client's browser when they visit
    the login page.
    """
    return Response({"detail": "CSRF cookie set."})

# Authentication Views
class RegisterView(APIView):
    """
    Handles new user registration:
    POST: Creates a new user account with proper password hashing
    Required fields: firstname, lastname, email, password
    Optional: middlename
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["firstname", "lastname", "email", "password"],
            properties={
                'firstname': openapi.Schema(type=openapi.TYPE_STRING, description='User first name'),
                'lastname': openapi.Schema(type=openapi.TYPE_STRING, description='User last name'),
                'middlename': openapi.Schema(type=openapi.TYPE_STRING, description='User middle name (optional)'),
                'email': openapi.Schema(type=openapi.TYPE_STRING, description='User email address'),
                'password': openapi.Schema(type=openapi.TYPE_STRING, description='User password'),
            }
        ),
        responses={
            201: openapi.Response('Created successfully', openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'user': openapi.Schema(type=openapi.TYPE_OBJECT),
                    'tokens': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'refresh': openapi.Schema(type=openapi.TYPE_STRING),
                            'access': openapi.Schema(type=openapi.TYPE_STRING),
                        }
                    )
                }
            )),
            400: 'Bad request'
        },
        operation_description="Register a new user with required fields: firstname, lastname, email, password. Middlename is optional."
    )
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': serializer.data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class LoginView(APIView):
    """
    Handles user authentication:
    POST: Authenticates user credentials and creates a session
    Required fields: email, password
    Returns: User details on successful login
    """
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email', 'password'],
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, description='User email'),
                'password': openapi.Schema(type=openapi.TYPE_STRING, description='User password'),
            }
        ),
        responses={
            200: openapi.Response('Login successful', openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'user': openapi.Schema(type=openapi.TYPE_OBJECT),
                    'tokens': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'refresh': openapi.Schema(type=openapi.TYPE_STRING),
                            'access': openapi.Schema(type=openapi.TYPE_STRING),
                        }
                    )
                }
            )),
            401: 'Invalid credentials'
        },
        operation_description="Login with email and password"
    )
   
    def get(self, request):
        """Render the login page"""
        return render(request, 'login.html')

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(email=email, password=password)

        if user:
            # WebSocket/Chat authentication
            login(request, user)
            
            refresh = RefreshToken.for_user(user)
            user_serializer = UserSerializer(user)
            return Response({
                'user': user_serializer.data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    """
    Handles user logout:
    POST: Ends the user's current session
    No data required, just needs to be authenticated
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='User refresh token')
            },
            required=['refresh']
        ),
        responses={
            200: 'Logout successful',
            400: 'Bad Request (e.g., token is invalid or missing)',
            401: 'Unauthorized'
        }
    )
    def post(self, request):
        logout(request)
        try:
            refresh_token = request.data["refresh"]
            if not refresh_token:
                return Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({'detail': 'Logout successful.'}, status=status.HTTP_200_OK)
        except TokenError as e:
            # This can happen if the token is already invalid or malformed
            return Response({'error': f'Token error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Catch any other unexpected errors
            return Response({'error': f'An unexpected error occurred: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

class GameMatchView(APIView):
    """
    Handles game match operations:
    POST: Create a new game match
    GET: List all game matches
    PUT: Update a game match
    DELETE: Remove a game match
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['date', 'time', 'location', 'game_type', 'team1', 'team2', 'court'],
            properties={
                'date': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='Game date (YYYY-MM-DD)'),
                'time': openapi.Schema(type=openapi.TYPE_STRING, format='time', description='Game time (HH:MM)'),
                'location': openapi.Schema(type=openapi.TYPE_STRING, description='Game location'),
                'game_type': openapi.Schema(type=openapi.TYPE_STRING, enum=['3v3', '5v5', 'casual', 'competitive']),
                'team1': openapi.Schema(type=openapi.TYPE_INTEGER, description='Team 1 ID'),
                'team2': openapi.Schema(type=openapi.TYPE_INTEGER, description='Team 2 ID'),
                'court': openapi.Schema(type=openapi.TYPE_INTEGER, description='Court ID')
            }
        ),
        responses={
            201: 'Game match created successfully',
            400: 'Invalid data',
            404: 'Team or court not found'
        }
    )
    def post(self, request):
        try:
            # Validate teams exist
            team1 = Team.objects.get(id=request.data.get('team1'))
            team2 = Team.objects.get(id=request.data.get('team2'))
            court = Court.objects.get(id=request.data.get('court'))

            # Create game match
            game = Game.objects.create(
                date=request.data.get('date'),
                time=request.data.get('time'),
                location=request.data.get('location'),
                game_type=request.data.get('game_type'),
                team1=team1,
                team2=team2,
                court=court,
                status='pending'
            )

            return Response({
                'message': 'Game match created successfully',
                'game_id': game.id,
                'teams': f"{team1.team_name} vs {team2.team_name}",
                'schedule': f"{game.date} at {game.time}",
                'location': game.location,
                'type': game.game_type
            }, status=status.HTTP_201_CREATED)

        except Team.DoesNotExist:
            return Response({'error': 'One or both teams not found'}, status=status.HTTP_404_NOT_FOUND)
        except Court.DoesNotExist:
            return Response({'error': 'Court not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'status',
                openapi.IN_QUERY,
                description="Filter by game status (pending/completed/cancelled)",
                type=openapi.TYPE_STRING,
                required=False
            ),
            openapi.Parameter(
                'game_type',
                openapi.IN_QUERY,
                description="Filter by game type (3v3/5v5/casual/competitive)",
                type=openapi.TYPE_STRING,
                required=False
            )
        ],
        responses={
            200: GameMatchSerializer(many=True),
            401: 'Unauthorized'
        }
    )
    def get(self, request):
        """
        Get list of game matches with optional filters
        """
        # Get query parameters
        status = request.query_params.get('status')
        game_type = request.query_params.get('game_type')

        # Start with all games
        games = Game.objects.all().order_by('-date', '-time')

        # Apply filters if provided
        if status:
            games = games.filter(status=status)
        if game_type:
            games = games.filter(game_type=game_type)

        # Serialize the data
        serializer = GameMatchSerializer(games, many=True)

        return Response({
            'count': games.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'date': openapi.Schema(type=openapi.TYPE_STRING, format='date'),
                'time': openapi.Schema(type=openapi.TYPE_STRING, format='time'),
                'location': openapi.Schema(type=openapi.TYPE_STRING),
                'game_type': openapi.Schema(type=openapi.TYPE_STRING, enum=['3v3', '5v5', 'casual', 'competitive']),
                'team1': openapi.Schema(type=openapi.TYPE_INTEGER),
                'team2': openapi.Schema(type=openapi.TYPE_INTEGER),
                'court': openapi.Schema(type=openapi.TYPE_INTEGER),
                'status': openapi.Schema(type=openapi.TYPE_STRING, enum=['pending', 'completed', 'cancelled'])
            }
        ),
        responses={
            200: 'Game match updated successfully',
            404: 'Game match not found',
            400: 'Invalid data'
        }
    )
    def put(self, request, game_id):
        """Update an existing game match"""
        try:
            game = Game.objects.get(id=game_id)

            # Update fields if provided
            if 'date' in request.data:
                game.date = request.data['date']
            if 'time' in request.data:
                game.time = request.data['time']
            if 'location' in request.data:
                game.location = request.data['location']
            if 'game_type' in request.data:
                game.game_type = request.data['game_type']
            if 'status' in request.data:
                game.status = request.data['status']

            # Update team references if provided
            if 'team1' in request.data:
                team1 = Team.objects.get(id=request.data['team1'])
                game.team1 = team1
            if 'team2' in request.data:
                team2 = Team.objects.get(id=request.data['team2'])
                game.team2 = team2
            if 'court' in request.data:
                court = Court.objects.get(id=request.data['court'])
                game.court = court

            game.save()

            return Response({
                'message': 'Game match updated successfully',
                'game_id': game.id,
                'teams': f"{game.team1.team_name} vs {game.team2.team_name}",
                'schedule': f"{game.date} at {game.time}",
                'location': game.location,
                'type': game.game_type,
                'status': game.status
            }, status=status.HTTP_200_OK)

        except Game.DoesNotExist:
            return Response({'error': 'Game match not found'}, status=status.HTTP_404_NOT_FOUND)
        except (Team.DoesNotExist, Court.DoesNotExist):
            return Response({'error': 'Team or court not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        responses={
            204: 'Game match deleted successfully',
            404: 'Game match not found'
        }
    )
    def delete(self, request, game_id):
        """Delete a game match"""
        try:
            game = Game.objects.get(id=game_id)
            game.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Game.DoesNotExist:
            return Response({'error': 'Game match not found'}, status=status.HTTP_404_NOT_FOUND)


@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter(
            'Authorization',
            openapi.IN_HEADER,
            description="Token format: Bearer <token>",
            type=openapi.TYPE_STRING,
            required=True
        )
    ],
    responses={200: UserSerializer},
    security=[{'Bearer': []}],
    operation_description="Get the currently authenticated user's profile"
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    Get the current authenticated user's details
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


def index_view(request):
    """
    View function for the home page of the site.
    """
    return render(request, 'index.html')

def dashboard_view(request):
    """
    View function for the dashboard page.
    """
    return render(request, 'dashboard.html')

def login_view(request):
    """
    View function for the login page.
    """
    return render(request, 'login.html')

def signup_view(request):
    """
    View function for the signup page.
    """
    return render(request, 'signup.html')

def overview_view(request):
    """
    View function for the overview page.
    """
    return render(request, 'overview.html')

def profile_view(request):
    """
    View function for the profile page.
    """
    return render(request, 'profile.html')

def notifications_view(request):
    """
    View function for the notifications page.
    """
    return render(request, 'notifications.html')
