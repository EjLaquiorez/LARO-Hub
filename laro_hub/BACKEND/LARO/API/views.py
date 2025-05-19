from django.shortcuts import render, redirect
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db.models import Q

import asyncio
from typing import AsyncGenerator

from .models import User, Game, Team, Court, Conversation, Message, Notification
from .serializers import UserSerializer, GameMatchSerializer, ConversationSerializer, MessageSerializer, NotificationSerializer
from datetime import datetime
from django.db.models import Q

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
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(email=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            serializer = UserSerializer(user)
            return Response({
                'user': serializer.data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
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
            required=['refresh'],
            properties={
                'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='Refresh token to blacklist'),
            }
        ),
        responses={
            200: 'Successfully logged out',
            400: 'Invalid token',
            401: 'Unauthorized'
        },
        operation_description="Logout and blacklist the refresh token"
    )
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

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

class ConversationAPI(APIView):
    """
    API endpoints for managing conversations
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
            )
        ],
        responses={
            200: ConversationSerializer(many=True),
            401: 'Unauthorized'
        },
        security=[{'Bearer': []}],
        operation_description="Get all conversations for the current user"
    )
    def get(self, request):
        """Get all conversations for current user"""
        conversations = Conversation.objects.filter(participants=request.user)
        serializer = ConversationSerializer(
            conversations,
            many=True,
            context={'request': request}  # Add request context here
        )
        return Response(serializer.data)

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
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['participant_id'],
            properties={
                'participant_id': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description='ID of the user to start conversation with'
                )
            }
        ),
        responses={
            201: ConversationSerializer,
            400: 'Bad Request',
            404: 'User not found',
            401: 'Unauthorized'
        },
        security=[{'Bearer': []}],
        operation_description="Create a new conversation with another user"
    )
    def post(self, request):
        """Create a new conversation"""
        participant_id = request.data.get('participant_id')

        try:
            participant = User.objects.get(id=participant_id)

            # Check if conversation already exists
            existing_conversation = Conversation.objects.filter(
                participants=request.user
            ).filter(
                participants=participant
            ).first()

            if existing_conversation:
                serializer = ConversationSerializer(
                    existing_conversation,
                    context={'request': request}  # Add request context here
                )
                return Response(serializer.data)

            # Create new conversation
            conversation = Conversation.objects.create()
            conversation.participants.add(request.user, participant)

            serializer = ConversationSerializer(
                conversation,
                context={'request': request}  # Add request context here
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'conversation_id',
                openapi.IN_PATH,
                description="ID of conversation to delete",
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
            204: 'Conversation deleted successfully',
            404: 'Conversation not found',
            401: 'Unauthorized'
        },
        security=[{'Bearer': []}],
        operation_description="Delete a conversation"
    )
    def delete(self, request, conversation_id):
        """Delete a conversation"""
        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=request.user
            )
            conversation.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class NotificationAPI(APIView):
    """
    API endpoints for managing user notifications
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
                'unread_only',
                openapi.IN_QUERY,
                description="Filter to show only unread notifications",
                type=openapi.TYPE_BOOLEAN,
                required=False
            ),
            openapi.Parameter(
                'type',
                openapi.IN_QUERY,
                description="Filter by notification type",
                type=openapi.TYPE_STRING,
                required=False
            )
        ],
        responses={
            200: NotificationSerializer(many=True),
            401: 'Unauthorized'
        },
        security=[{'Bearer': []}],
        operation_description="Get all notifications for the current user"
    )
    def get(self, request):
        """Get all notifications for the current user"""
        # Get query parameters
        unread_only = request.query_params.get('unread_only', 'false').lower() == 'true'
        notification_type = request.query_params.get('type')

        # Build query
        query = Q(user=request.user)
        if unread_only:
            query &= Q(is_read=False)
        if notification_type:
            query &= Q(type=notification_type)

        # Get notifications
        notifications = Notification.objects.filter(query)
        serializer = NotificationSerializer(notifications, many=True)

        return Response(serializer.data)

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
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['type', 'title', 'content'],
            properties={
                'type': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Notification type',
                    enum=['message', 'game_invitation', 'game_update', 'system']
                ),
                'title': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Notification title'
                ),
                'content': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Notification content'
                ),
                'related_object_id': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description='ID of related object (optional)'
                ),
                'related_object_type': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Type of related object (optional)'
                ),
                'data': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    description='Additional data (optional)'
                )
            }
        ),
        responses={
            201: NotificationSerializer,
            400: 'Bad Request',
            401: 'Unauthorized'
        },
        security=[{'Bearer': []}],
        operation_description="Create a new notification"
    )
    def post(self, request):
        """Create a new notification"""
        # Add user to the data
        data = {
            **request.data,
            'user': request.user.id
        }

        serializer = NotificationSerializer(data=data)
        if serializer.is_valid():
            notification = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NotificationDetailAPI(APIView):
    """
    API endpoints for managing a specific notification
    """
    permission_classes = [IsAuthenticated]

    def get_notification(self, pk, user):
        """Helper method to get a notification by ID"""
        try:
            return Notification.objects.get(pk=pk, user=user)
        except Notification.DoesNotExist:
            return None

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'id',
                openapi.IN_PATH,
                description="Notification ID",
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
            200: NotificationSerializer,
            404: 'Notification not found',
            401: 'Unauthorized'
        },
        security=[{'Bearer': []}],
        operation_description="Get a specific notification"
    )
    def get(self, request, pk):
        """Get a specific notification"""
        notification = self.get_notification(pk, request.user)
        if not notification:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = NotificationSerializer(notification)
        return Response(serializer.data)

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'id',
                openapi.IN_PATH,
                description="Notification ID",
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
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'is_read': openapi.Schema(
                    type=openapi.TYPE_BOOLEAN,
                    description='Mark notification as read'
                )
            }
        ),
        responses={
            200: NotificationSerializer,
            404: 'Notification not found',
            400: 'Bad Request',
            401: 'Unauthorized'
        },
        security=[{'Bearer': []}],
        operation_description="Update a notification (mark as read)"
    )
    def patch(self, request, pk):
        """Update a notification (mark as read)"""
        notification = self.get_notification(pk, request.user)
        if not notification:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = NotificationSerializer(
            notification,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'id',
                openapi.IN_PATH,
                description="Notification ID",
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
            204: 'No Content',
            404: 'Notification not found',
            401: 'Unauthorized'
        },
        security=[{'Bearer': []}],
        operation_description="Delete a notification"
    )
    def delete(self, request, pk):
        """Delete a notification"""
        notification = self.get_notification(pk, request.user)
        if not notification:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@swagger_auto_schema(
    method='post',
    manual_parameters=[
        openapi.Parameter(
            'Authorization',
            openapi.IN_HEADER,
            description="Token format: Bearer <token>",
            type=openapi.TYPE_STRING,
            required=True
        )
    ],
    responses={
        200: 'All notifications marked as read',
        401: 'Unauthorized'
    },
    security=[{'Bearer': []}],
    operation_description="Mark all notifications as read"
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read for the current user"""
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'All notifications marked as read'})

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
    responses={
        200: 'Returns unread notification count',
        401: 'Unauthorized'
    },
    security=[{'Bearer': []}],
    operation_description="Get unread notification count"
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_notification_count(request):
    """Get the count of unread notifications for the current user"""
    count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({'count': count})

class MessageAPI(APIView):
    """
    API endpoints for managing messages within conversations
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'conversation_id',
                openapi.IN_PATH,
                description="ID of the conversation",
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
            200: MessageSerializer(many=True),
            404: 'Conversation not found',
            401: 'Unauthorized'
        },
        security=[{'Bearer': []}],
        operation_description="Get all messages in a conversation"
    )
    def get(self, request, conversation_id):
        """Get all messages in a conversation"""
        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=request.user
            )
            messages = Message.objects.filter(conversation=conversation)
            serializer = MessageSerializer(messages, many=True)

            # Mark unread messages as read
            messages.filter(
                sender=request.user
            ).update(is_read=True)

            return Response(serializer.data)

        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'conversation_id',
                openapi.IN_PATH,
                description="ID of the conversation",
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
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['content'],
            properties={
                'content': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Message content'
                )
            }
        ),
        responses={
            201: MessageSerializer,
            400: 'Bad Request',
            404: 'Conversation not found',
            401: 'Unauthorized'
        },
        security=[{'Bearer': []}],
        operation_description="Send a new message in the conversation"
    )
    def post(self, request, conversation_id):
        """Send a new message"""
        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=request.user
            )

            serializer = MessageSerializer(data={
                'conversation': conversation.id,
                'sender': request.user.id,
                'content': request.data.get('content'),
                'is_read': False
            })

            if serializer.is_valid():
                message = serializer.save()
                # Update conversation timestamp
                conversation.save()  # This triggers auto_now update

                # Create notification for the recipient
                recipient = conversation.participants.exclude(id=request.user.id).first()
                if recipient:
                    Notification.objects.create(
                        user=recipient,
                        type='message',
                        title=f'New message from {request.user.firstname}',
                        content=message.content[:50] + ('...' if len(message.content) > 50 else ''),
                        related_object_id=conversation.id,
                        related_object_type='conversation',
                        data={
                            'sender_id': request.user.id,
                            'sender_name': f"{request.user.firstname} {request.user.lastname}",
                            'message_id': message.id
                        }
                    )

                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )