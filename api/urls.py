from django.urls import path

from .views import HelloView, LoginView, MessageListCreateView, ProfileView, RegisterView


urlpatterns = [
    path("hello/", HelloView.as_view(), name="hello"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("messages/", MessageListCreateView.as_view(), name="messages"),
]
