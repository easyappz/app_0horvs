import base64
import hashlib
import hmac
import time
from typing import Any, Dict, Optional, List

from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import MessageSerializer


# In-memory member store
MEMBERS: Dict[str, Dict[str, Any]] = {}


# In-memory messages store for group chat
MESSAGES: List[Dict[str, Any]] = []
LAST_MESSAGE_ID: int = 0
MAX_STORED_MESSAGES: int = 1000


def create_message(username: str, text: str) -> Dict[str, Any]:
    """Create and store a new chat message in memory."""
    global LAST_MESSAGE_ID
    LAST_MESSAGE_ID += 1

    message: Dict[str, Any] = {
        "id": LAST_MESSAGE_ID,
        "username": username,
        "text": text,
        "created_at": time.time(),
    }

    MESSAGES.append(message)

    # simple cap to avoid unbounded growth
    if len(MESSAGES) > MAX_STORED_MESSAGES:
        del MESSAGES[0 : len(MESSAGES) - MAX_STORED_MESSAGES]

    return message


# Password hashing
PASSWORD_SALT = "easyapp-static-password-salt"


def hash_password(raw_password: str) -> str:
    """Return a salted SHA-256 hash of the given raw password."""
    data = (PASSWORD_SALT + raw_password).encode("utf-8")
    return hashlib.sha256(data).hexdigest()


# Token generation and verification
TOKEN_SECRET = "easyapp-static-token-secret"
TOKEN_TTL_SECONDS = 3600


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _base64url_decode(data: str) -> bytes:
    padding_needed = 4 - (len(data) % 4)
    if padding_needed and padding_needed != 4:
        data = data + ("=" * padding_needed)
    return base64.urlsafe_b64decode(data.encode("ascii"))


def generate_token(username: str) -> str:
    """Generate a signed token for the given username."""
    now_ts = int(time.time())
    exp_ts = now_ts + TOKEN_TTL_SECONDS
    unsigned_payload = f"{username}:{exp_ts}"
    signature = hmac.new(
        TOKEN_SECRET.encode("utf-8"),
        unsigned_payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    full_payload = f"{username}:{exp_ts}:{signature}"
    return _base64url_encode(full_payload.encode("utf-8"))


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify token and return payload dict if valid, otherwise None."""
    if not token:
        return None

    try:
        decoded = _base64url_decode(token).decode("utf-8")
    except Exception:
        return None

    parts = decoded.split(":")
    if len(parts) != 3:
        return None

    username, exp_str, signature = parts

    try:
        exp_ts = int(exp_str)
    except ValueError:
        return None

    unsigned_payload = f"{username}:{exp_ts}"
    expected_signature = hmac.new(
        TOKEN_SECRET.encode("utf-8"),
        unsigned_payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(signature, expected_signature):
        return None

    current_ts = int(time.time())
    if exp_ts < current_ts:
        return None

    return {"username": username, "exp": exp_ts}


def get_authenticated_member(request) -> Dict[str, Any]:
    """Resolve current member from Authorization header or raise AuthenticationFailed."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise AuthenticationFailed("Недействительный или отсутствующий токен авторизации")

    token = auth_header[len("Bearer ") :].strip()
    payload = verify_token(token)
    if payload is None:
        raise AuthenticationFailed("Недействительный или просроченный токен")

    username = payload.get("username")
    if not username or username not in MEMBERS:
        raise AuthenticationFailed("Пользователь не найден")

    return MEMBERS[username]


class HelloView(APIView):
    """A simple API endpoint that returns a greeting message."""

    @extend_schema(
        responses={200: MessageSerializer},
        description="Get a hello world message",
    )
    def get(self, request):
        data = {"message": "Hello!", "timestamp": timezone.now()}
        serializer = MessageSerializer(data)
        return Response(serializer.data)


class RegisterView(APIView):
    """Register a new member using in-memory storage."""

    def post(self, request):
        username = str(request.data.get("username", "")).strip()
        password = str(request.data.get("password", ""))

        if not username or not password:
            return Response(
                {"detail": "Требуются имя пользователя и пароль"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if username in MEMBERS:
            return Response(
                {"detail": "Пользователь с таким именем уже существует"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_at = timezone.now().isoformat()
        MEMBERS[username] = {
            "username": username,
            "password_hash": hash_password(password),
            "created_at": created_at,
        }

        token = generate_token(username)
        return Response(
            {"username": username, "token": token},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """Authenticate existing member and return a new token."""

    def post(self, request):
        username = str(request.data.get("username", "")).strip()
        password = str(request.data.get("password", ""))

        if not username or not password:
            return Response(
                {"detail": "Требуются имя пользователя и пароль"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        member = MEMBERS.get(username)
        if not member:
            return Response(
                {"detail": "Неверное имя пользователя или пароль"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if member.get("password_hash") != hash_password(password):
            return Response(
                {"detail": "Неверное имя пользователя или пароль"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token = generate_token(username)
        return Response({"username": username, "token": token}, status=status.HTTP_200_OK)


class ProfileView(APIView):
    """Return profile of the currently authenticated member."""

    def get(self, request):
        member = get_authenticated_member(request)
        return Response(
            {
                "username": member.get("username"),
                "created_at": member.get("created_at"),
            },
            status=status.HTTP_200_OK,
        )


class MessageListCreateView(APIView):
    """List all group chat messages or create a new one (in-memory)."""

    def get(self, request):
        # Ensure the user is authenticated; we ignore the returned member here.
        get_authenticated_member(request)

        # Return up to the last 100 messages
        messages = MESSAGES[-100:]
        return Response(messages, status=status.HTTP_200_OK)

    def post(self, request):
        member = get_authenticated_member(request)
        text = str(request.data.get("text", "")).strip()

        if not text:
            return Response(
                {"detail": "Текст сообщения не может быть пустым"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(text) > 1000:
            return Response(
                {"detail": "Текст сообщения слишком длинный"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        username = member.get("username", "")
        message = create_message(username, text)
        return Response(message, status=status.HTTP_201_CREATED)
