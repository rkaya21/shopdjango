from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import RegisterSerializer, UserSerializer
from .models import User


def _set_auth_cookies(response, access_token, refresh_token=None):
    """Access ve opsiyonel olarak refresh token'ı HttpOnly cookie olarak atar."""
    secure = not settings.DEBUG
    response.set_cookie(
        'access_token',
        str(access_token),
        max_age=60 * 60,        # 1 saat
        httponly=True,
        samesite='Lax',
        secure=secure,
        path='/',
    )
    if refresh_token:
        response.set_cookie(
            'refresh_token',
            str(refresh_token),
            max_age=60 * 60 * 24 * 7,  # 7 gün
            httponly=True,
            samesite='Lax',
            secure=secure,
            path='/',
        )


class LoginView(APIView):
    """
    Kullanıcı girişi — JWT token'ları HttpOnly cookie olarak set eder.
    Login endpoint'i rate limit'e tabidir (10/dakika).
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request):
        from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
        serializer = TokenObtainPairSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response(
                {'detail': 'E-posta veya şifre hatalı.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = serializer.user
        refresh = RefreshToken.for_user(user)

        response = Response(UserSerializer(user).data)
        _set_auth_cookies(response, refresh.access_token, refresh)
        return response


class TokenRefreshView(APIView):
    """Refresh cookie kullanarak yeni access token üretir."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response(
                {'detail': 'Refresh token bulunamadı.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            token = RefreshToken(refresh_token)
            access = token.access_token
        except TokenError:
            response = Response(
                {'detail': 'Geçersiz veya süresi dolmuş token.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            return response

        response = Response({'detail': 'Token yenilendi.'})
        _set_auth_cookies(response, access)
        return response


class LogoutView(APIView):
    """Cookie'leri temizleyerek çıkış yapar."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        response = Response({'detail': 'Çıkış yapıldı.'})
        response.delete_cookie('access_token', path='/')
        response.delete_cookie('refresh_token', path='/')
        return response


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
