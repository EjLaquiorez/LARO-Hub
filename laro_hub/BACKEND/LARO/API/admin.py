from django.contrib import admin
from .models import User, Court, Team, Game, Booking, Statistics

@admin.register(Court)
class CourtAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'location', 'owner', 'rental_fee')
admin.site.register(User)
admin.site.register(Team)
admin.site.register(Game)
admin.site.register(Booking)
admin.site.register(Statistics)
