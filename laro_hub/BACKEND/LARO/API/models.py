from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.conf import settings


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    firstname = models.CharField(max_length=25, verbose_name="First Name")
    lastname = models.CharField(max_length=25, verbose_name="Last Name")
    middlename = models.CharField(max_length=25, blank=True, null=True, verbose_name="Middle Name")
    email = models.EmailField(max_length=254, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    birth_date = models.DateField(null=True, blank=True)

    height = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    position = models.CharField(max_length=20, blank=True)
    experience_level = models.CharField(max_length=20, blank=True)

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

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['firstname', 'lastname']

    def __str__(self):
        return f"{self.lastname}, {self.firstname}"

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'


class Court(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    rental_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    availability = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Team(models.Model):
    team_name = models.CharField(max_length=100)
    captain = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
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
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField()
    time_slot = models.TimeField()
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')

    def __str__(self):
        return f"{self.court} - {self.date} {self.time_slot}"


class Statistics(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    matches_played = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    points_scored = models.IntegerField(default=0)

    def __str__(self):
        return f"Stats for {self.user}"
