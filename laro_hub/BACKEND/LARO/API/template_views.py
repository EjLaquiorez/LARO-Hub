from django.shortcuts import render

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
