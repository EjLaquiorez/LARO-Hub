from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from .models import Message
from django.db.models import Q
from datetime import datetime, timezone

User = get_user_model()

@login_required
def chat_room(request, user_id=None, room_name=None): #  Changed signature to accept 'room_name' from URL
    """
    This view handles rendering the chat room. It now accepts a 'room_name'
    from the URL, which can be a user ID (as a string) or a special keyword
    like 'lobby'.
    """
    
    #  Handle non-numeric room names like 'lobby' by redirecting ---
    current_user = request.user
    all_other_users = User.objects.exclude(id=current_user.id)
    sidebar_users = []
    for u in all_other_users:
        last_message = Message.objects.filter(
            (Q(sender=current_user) & Q(receiver=u)) |
            (Q(sender=u) & Q(receiver=current_user))
        ).order_by('-timestamp').first()
        sidebar_users.append({'user': u, 'last_message': last_message})

    aware_min_datetime = datetime.min.replace(tzinfo=timezone.utc)

    sidebar_users.sort(
        key=lambda x: x['last_message'].timestamp if x['last_message'] else aware_min_datetime,
        reverse=True
    )

    if room_name == 'lobby':
        if sidebar_users and sidebar_users[0]['last_message']:
            most_recent_user_id = sidebar_users[0]['user'].id
            return redirect('chat', user_id=most_recent_user_id)
        else:
            context = {
                'other_user': None, # No user is selected
                'chats': [],
                'user_last_messages': sidebar_users, # Pass the full list
                'search_query': ''
            }
            return render(request, 'chat.html', context)
        
    search_query = request.GET.get('search', '')
    other_user = get_object_or_404(User, id=user_id)

    chats = Message.objects.filter(
        (Q(sender=current_user) & Q(receiver=other_user)) |
        (Q(sender=other_user) & Q(receiver=current_user))
    ).order_by('timestamp')

    if search_query:
        chats = chats.filter(content__icontains=search_query)

    context = {
        'other_user': other_user,
        'chats': chats,
        'user_last_messages': sidebar_users,
        'search_query': search_query
    }
    return render(request, 'chat.html', context)


