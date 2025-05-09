from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

# Create your models here.

class UserManager(BaseUserManager):
    """
    Custom User Manager for handling user creation and management.
    
    This manager provides methods for:
    - Creating regular users with hashed passwords
    - Creating superusers with admin privileges
    - Handling email normalization
    
    Extends Django's BaseUserManager to support email-based authentication
    instead of the default username-based system.
    """
    def create_user(self, email, password=None, **extra_fields):
        """
        Creates and saves a regular user with a hashed password.
        
        Args:
            email: User's email address (used for authentication)
            password: User's password (will be hashed)
            **extra_fields: Additional fields like firstname, lastname, etc.
        
        Returns:
            New User instance
        
        Raises:
            ValueError: If email is not provided
        """
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Creates and saves a superuser with admin privileges.
        
        Automatically sets is_staff and is_superuser to True.
        
        Args:
            email: Admin's email address
            password: Admin's password
            **extra_fields: Additional fields
        
        Returns:
            New superuser instance
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model that uses email for authentication instead of username.
    
    Inherits from:
    - AbstractBaseUser: Provides core user fields and functionality
    - PermissionsMixin: Adds support for groups and permissions
    
    Fields:
    - firstname: User's first name
    - lastname: User's last name
    - middlename: Optional middle name
    - email: Unique email address (used for login)
    - is_active: Whether the user account is active
    - is_staff: Whether the user can access admin site
    - date_joined: When the user account was created
    
    This model supports:
    - Email-based authentication
    - Password hashing
    - User permissions and groups
    - Admin site integration
    """
    firstname = models.CharField(max_length=25, verbose_name="First Name")
    lastname = models.CharField(max_length=25, verbose_name="Last Name")
    middlename = models.CharField(max_length=25, blank=True, null=True, verbose_name="Middle Name")
    email = models.EmailField(max_length=254, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    # Add new fields
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    
    # Add basketball-specific fields
    height = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    position = models.CharField(max_length=20, blank=True)
    experience_level = models.CharField(max_length=20, blank=True)

    # Add new fields to match ERD
    ROLE_CHOICES = [
        ('Player', 'Player'),
        ('Team Captain', 'Team Captain'),
        ('Court Owner', 'Court Owner'),
        ('Admin', 'Admin')
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Player')
    skill_level = models.CharField(max_length=50, blank=True, null=True)
    availability = models.CharField(max_length=255, blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'  # Use email instead of username for authentication
    REQUIRED_FIELDS = ['firstname', 'lastname']  # Required fields for createsuperuser

    def __str__(self) -> str:
        """
        String representation of the user.
        Returns: "lastname, firstname"
        """
        return f"{self.lastname}, {self.firstname}"

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

class Court(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    rental_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    availability = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Team(models.Model):
    team_name = models.CharField(max_length=100)
    captain = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.team_name

class Game(models.Model):
    GAME_TYPES = [
        ('3v3', '3v3'),
        ('5v5', '5v5'),
        ('casual', 'casual'),
        ('competitive', 'competitive')
    ]
    
    STATUS_CHOICES = [
        ('pending', 'pending'),
        ('completed', 'completed'),
        ('cancelled', 'cancelled')
    ]
    
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=255)
    game_type = models.CharField(max_length=20, choices=GAME_TYPES)
    team1 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team1_games')
    team2 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team2_games')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    court = models.ForeignKey(Court, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.team1} vs {self.team2} on {self.date}"

class Booking(models.Model):
    PAYMENT_STATUS = [
        ('pending', 'pending'),
        ('paid', 'paid'),
        ('cancelled', 'cancelled')
    ]
    
    court = models.ForeignKey(Court, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    time_slot = models.TimeField()
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')

    def __str__(self):
        return f"{self.court} - {self.date} {self.time_slot}"

class Statistics(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    matches_played = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    points_scored = models.IntegerField(default=0)

    def __str__(self):
        return f"Stats for {self.user}"

class Conversation(models.Model):
    """
    Represents a conversation between two users.
    """
    participants = models.ManyToManyField(User, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Conversation between {', '.join([str(user) for user in self.participants.all()])}"

class Message(models.Model):
    """
    Represents individual messages within a conversation.
    """
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"Message from {self.sender} at {self.timestamp}"
