from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db.models import Q

from .models import Court
from .serializers import CourtSerializer

class CourtListCreateView(APIView):
    """
    Handles court operations:
    GET: List all courts with optional filtering
    POST: Create a new court (requires authentication)
    """
    
    def get_permissions(self):
        """
        GET requests can be accessed by anyone
        POST requests require authentication
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'search',
                openapi.IN_QUERY,
                description="Search courts by name or location",
                type=openapi.TYPE_STRING,
                required=False
            ),
            openapi.Parameter(
                'owner',
                openapi.IN_QUERY,
                description="Filter by owner ID",
                type=openapi.TYPE_INTEGER,
                required=False
            )
        ],
        responses={
            200: CourtSerializer(many=True),
        },
        operation_description="List all courts with optional filtering"
    )
    def get(self, request):
        """
        List all courts with optional filtering
        """
        # Get query parameters
        search_query = request.query_params.get('search', '')
        owner_id = request.query_params.get('owner')
        
        # Start with all courts
        courts = Court.objects.all()
        
        # Apply filters if provided
        if search_query:
            courts = courts.filter(
                Q(name__icontains=search_query) |
                Q(location__icontains=search_query)
            )
        
        if owner_id:
            courts = courts.filter(owner_id=owner_id)
        
        # Serialize the data
        serializer = CourtSerializer(courts, many=True)
        
        return Response({
            'count': courts.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        request_body=CourtSerializer,
        responses={
            201: CourtSerializer,
            400: 'Bad request',
            401: 'Unauthorized'
        },
        security=[{'Bearer': []}],
        operation_description="Create a new court"
    )
    def post(self, request):
        """
        Create a new court (requires authentication)
        """
        # Add the current user as the owner
        court_data = request.data.copy()
        court_data['owner'] = request.user.id
        
        serializer = CourtSerializer(data=court_data)
        if serializer.is_valid():
            court = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CourtDetailView(APIView):
    """
    Handles operations on a specific court:
    GET: Retrieve court details
    PUT: Update court details (requires authentication and ownership)
    DELETE: Remove a court (requires authentication and ownership)
    """
    
    def get_permissions(self):
        """
        GET requests can be accessed by anyone
        PUT and DELETE requests require authentication
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_object(self, pk):
        """
        Helper method to get court by ID
        """
        try:
            return Court.objects.get(pk=pk)
        except Court.DoesNotExist:
            return None
    
    @swagger_auto_schema(
        responses={
            200: CourtSerializer,
            404: 'Court not found'
        },
        operation_description="Get court details by ID"
    )
    def get(self, request, pk):
        """
        Retrieve court details
        """
        court = self.get_object(pk)
        if court is None:
            return Response({'error': 'Court not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CourtSerializer(court)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        request_body=CourtSerializer,
        responses={
            200: CourtSerializer,
            400: 'Bad request',
            401: 'Unauthorized',
            403: 'Forbidden - Not the owner',
            404: 'Court not found'
        },
        security=[{'Bearer': []}],
        operation_description="Update court details (requires ownership)"
    )
    def put(self, request, pk):
        """
        Update court details (requires authentication and ownership)
        """
        court = self.get_object(pk)
        if court is None:
            return Response({'error': 'Court not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is the owner
        if court.owner != request.user:
            return Response({'error': 'You do not have permission to update this court'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        serializer = CourtSerializer(court, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        responses={
            204: 'Successfully deleted',
            401: 'Unauthorized',
            403: 'Forbidden - Not the owner',
            404: 'Court not found'
        },
        security=[{'Bearer': []}],
        operation_description="Delete court (requires ownership)"
    )
    def delete(self, request, pk):
        """
        Remove a court (requires authentication and ownership)
        """
        court = self.get_object(pk)
        if court is None:
            return Response({'error': 'Court not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is the owner
        if court.owner != request.user:
            return Response({'error': 'You do not have permission to delete this court'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        court.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
