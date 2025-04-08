from django.contrib import admin
from .models import User, Court, Team, Game, Booking, Statistics

# Register your models here.
admin.site.register(User)
admin.site.register(Court)
admin.site.register(Team)
admin.site.register(Game)
admin.site.register(Booking)
admin.site.register(Statistics)
