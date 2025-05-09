from rest_framework import serializers
from .models import User, Game, Team, Court, Conversation, Message

class UserSerializer(serializers.ModelSerializer):
    """
    UserSerializer handles the conversion of User model instances to/from JSON format.
    
    Features:
    - Converts User model data to JSON for API responses
    - Validates incoming JSON data for user creation/updates
    - Handles password hashing during user creation and updates
    - Ensures passwords are write-only and never included in responses
    
    Fields:
    - id: User's unique identifier
    - firstname: User's first name
    - lastname: User's last name
    - middlename: User's middle name (optional)
    - email: User's email address (used for authentication)
    - password: User's password (write-only)
    """
    
    class Meta:
        model = User
        fields = ["id", "firstname", "lastname", "middlename", "email", "password"]
        extra_kwargs = {
            'password': {'write_only': True}  # Ensures password is never included in responses
        }

    def create(self, validated_data):
        """
        Creates a new user instance with a hashed password.
        
        This method overrides the default create to ensure passwords are properly
        hashed using Django's password hashing system via create_user().
        
        Args:
            validated_data: Dictionary of validated user data from the request
            
        Returns:
            Newly created User instance
        """
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            firstname=validated_data['firstname'],
            lastname=validated_data['lastname'],
            middlename=validated_data.get('middlename', '')
        )
        return user

    def update(self, instance, validated_data):
        """
        Updates an existing user instance.
        
        Handles password updates separately to ensure proper hashing.
        All other fields are updated normally.
        
        Args:
            instance: Existing User instance to update
            validated_data: Dictionary of validated user data from the request
            
        Returns:
            Updated User instance
        """
        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)
        return super().update(instance, validated_data)

class TeamSerializer(serializers.ModelSerializer):
    captain_name = serializers.CharField(source='captain.get_full_name', read_only=True)
    
    class Meta:
        model = Team
        fields = ['id', 'team_name', 'captain_name']

class CourtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Court
        fields = ['id', 'name', 'location']

class GameMatchSerializer(serializers.ModelSerializer):
    team1 = TeamSerializer(read_only=True)
    team2 = TeamSerializer(read_only=True)
    court = CourtSerializer(read_only=True)
    
    class Meta:
        model = Game
        fields = ['id', 'date', 'time', 'location', 'game_type', 
                 'team1', 'team2', 'status', 'court']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'content', 'timestamp', 'is_read']
        read_only_fields = ['id', 'timestamp']

class ConversationSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'created_at', 'updated_at', 'last_message', 'unread_count']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last_message = obj.messages.last()
        if (last_message):
            return MessageSerializer(last_message).data
        return None

    def get_unread_count(self, obj):
        try:
            request = self.context.get('request')
            if not request or not hasattr(request, 'user'):
                return 0
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        except AttributeError:
            return 0